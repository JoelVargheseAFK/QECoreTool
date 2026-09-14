import { useApp } from '../store/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function IncomingInspection() {
  const { getFilteredIncoming } = useApp();
  const records = getFilteredIncoming();

  const totalReceived = records.reduce((s, r) => s + r.qtyReceived, 0);
  const totalInspected = records.reduce((s, r) => s + r.qtyInspected, 0);
  const totalRejected = records.reduce((s, r) => s + r.qtyRejected, 0);
  const rejectionRate = totalInspected > 0 ? (totalRejected / totalInspected * 100) : 0;
  const incomingPPM = totalReceived > 0 ? (totalRejected / totalReceived * 1000000) : 0;

  // Supplier performance
  const supplierMap = new Map<string, { received: number; rejected: number; lots: number }>();
  records.forEach(r => {
    const existing = supplierMap.get(r.supplier) || { received: 0, rejected: 0, lots: 0 };
    existing.received += r.qtyReceived;
    existing.rejected += r.qtyRejected;
    existing.lots++;
    supplierMap.set(r.supplier, existing);
  });
  const supplierData = Array.from(supplierMap.entries()).map(([name, data]) => ({
    name,
    received: data.received,
    rejected: data.rejected,
    lots: data.lots,
    rejectionRate: data.received > 0 ? (data.rejected / data.received * 100).toFixed(2) : '0',
    ppm: data.received > 0 ? Math.round(data.rejected / data.received * 1000000) : 0,
  }));

  // Trend
  const trendData = records.slice(-15).map(r => ({
    date: r.date.slice(5),
    rejected: r.qtyRejected,
    inspected: r.qtyInspected,
  }));

  // Defect Pareto
  const defectMap = new Map<string, number>();
  records.forEach(r => { if (r.qtyRejected > 0) defectMap.set(r.defect, (defectMap.get(r.defect) || 0) + r.qtyRejected); });
  const defectPareto = Array.from(defectMap.entries()).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }));

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Incoming Inspection</h1>
        <p className="text-sm text-gray-500">Supplier performance and incoming quality tracking</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
        <div className="bg-white rounded-lg border p-3">
          <p className="text-xs text-gray-500">Total Received</p>
          <p className="text-xl font-bold text-gray-800">{totalReceived.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg border p-3">
          <p className="text-xs text-gray-500">Total Inspected</p>
          <p className="text-xl font-bold text-blue-600">{totalInspected.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg border p-3">
          <p className="text-xs text-gray-500">Total Rejected</p>
          <p className="text-xl font-bold text-red-600">{totalRejected.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg border p-3">
          <p className="text-xs text-gray-500">Rejection Rate</p>
          <p className="text-xl font-bold text-orange-600">{rejectionRate.toFixed(2)}%</p>
        </div>
        <div className="bg-white rounded-lg border p-3">
          <p className="text-xs text-gray-500">Incoming PPM</p>
          <p className="text-xl font-bold text-purple-600">{incomingPPM.toFixed(0)}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        {/* Trend */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Incoming Rejection Trend</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="rejected" stroke="#ef4444" strokeWidth={2} name="Rejected" dot={{ r: 3 }} />
                <Line type="monotone" dataKey="inspected" stroke="#3b82f6" strokeWidth={1.5} name="Inspected" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Defect Pareto */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Defect Pareto</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={defectPareto}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Rejected Qty" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Supplier Performance Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-4">
        <div className="p-3 border-b bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-700">Supplier Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Supplier', 'Lots', 'Qty Received', 'Qty Rejected', 'Rejection Rate', 'PPM', 'Rating'].map(h => (
                  <th key={h} className="px-4 py-2 text-left text-xs font-medium text-gray-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {supplierData.map(s => (
                <tr key={s.name} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium text-gray-800">{s.name}</td>
                  <td className="px-4 py-2">{s.lots}</td>
                  <td className="px-4 py-2">{s.received.toLocaleString()}</td>
                  <td className="px-4 py-2 text-red-600">{s.rejected}</td>
                  <td className="px-4 py-2">{s.rejectionRate}%</td>
                  <td className="px-4 py-2">{s.ppm}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      parseFloat(s.rejectionRate) < 1 ? 'bg-green-100 text-green-700' :
                      parseFloat(s.rejectionRate) < 3 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {parseFloat(s.rejectionRate) < 1 ? 'Good' : parseFloat(s.rejectionRate) < 3 ? 'Watch' : 'Poor'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-3 border-b bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-700">Inspection Records ({records.length})</h3>
        </div>
        <div className="overflow-x-auto max-h-64">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                {['Date', 'Supplier', 'Part', 'Lot', 'Received', 'Inspected', 'Accepted', 'Rejected', 'Defect', 'Method', 'Result'].map(h => (
                  <th key={h} className="px-3 py-2 text-left text-gray-600 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {records.slice(0, 30).map(r => (
                <tr key={r.id} className={`hover:bg-gray-50 ${r.result === 'REJECT' ? 'bg-red-50' : ''}`}>
                  <td className="px-3 py-2">{r.date}</td>
                  <td className="px-3 py-2 font-medium">{r.supplier}</td>
                  <td className="px-3 py-2">{r.partNumber}</td>
                  <td className="px-3 py-2">{r.lot}</td>
                  <td className="px-3 py-2">{r.qtyReceived}</td>
                  <td className="px-3 py-2">{r.qtyInspected}</td>
                  <td className="px-3 py-2 text-green-600">{r.qtyAccepted}</td>
                  <td className="px-3 py-2 text-red-600">{r.qtyRejected}</td>
                  <td className="px-3 py-2">{r.defect}</td>
                  <td className="px-3 py-2">{r.inspectionMethod}</td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      r.result === 'ACCEPT' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>{r.result}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
