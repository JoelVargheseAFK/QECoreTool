import { useApp } from '../store/AppContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function InProcessInspection() {
  const { getFilteredInProcess } = useApp();
  const inspections = getFilteredInProcess();

  // Calculate statistics
  const totalInspections = inspections.length;
  const passCount = inspections.filter(i => i.result === 'PASS').length;
  const failCount = inspections.filter(i => i.result === 'FAIL').length;
  const passRate = totalInspections > 0 ? ((passCount / totalInspections) * 100).toFixed(1) : '0';

  // Group by characteristic for trend
  const charStats = new Map<string, { total: number; fails: number }>();
  inspections.forEach(i => {
    const existing = charStats.get(i.characteristic) || { total: 0, fails: 0 };
    existing.total++;
    if (i.result === 'FAIL') existing.fails++;
    charStats.set(i.characteristic, existing);
  });

  const charData = Array.from(charStats.entries()).map(([name, data]) => ({
    name,
    total: data.total,
    fails: data.fails,
    failRate: ((data.fails / data.total) * 100).toFixed(1),
  }));

  // Group by process
  const processStats = new Map<string, { total: number; fails: number }>();
  inspections.forEach(i => {
    const existing = processStats.get(i.process) || { total: 0, fails: 0 };
    existing.total++;
    if (i.result === 'FAIL') existing.fails++;
    processStats.set(i.process, existing);
  });

  const processData = Array.from(processStats.entries()).map(([name, data]) => ({
    name,
    total: data.total,
    fails: data.fails,
  }));

  // Trend by date
  const dateStats = new Map<string, { total: number; fails: number }>();
  inspections.forEach(i => {
    const existing = dateStats.get(i.date) || { total: 0, fails: 0 };
    existing.total++;
    if (i.result === 'FAIL') existing.fails++;
    dateStats.set(i.date, existing);
  });

  const trendData = Array.from(dateStats.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, data]) => ({
      date: date.slice(5),
      total: data.total,
      fails: data.fails,
    }));

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">In-Process Inspection</h1>
        <p className="text-sm text-gray-500">Track what is being checked, how, how often, and with what equipment</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Total Inspections</div>
          <div className="text-2xl font-bold text-gray-800">{totalInspections}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Pass Rate</div>
          <div className="text-2xl font-bold text-green-600">{passRate}%</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Failures</div>
          <div className="text-2xl font-bold text-red-600">{failCount}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Characteristics</div>
          <div className="text-2xl font-bold text-blue-600">{charStats.size}</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-4">Inspection Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="total" stroke="#3b82f6" name="Total" />
              <Line type="monotone" dataKey="fails" stroke="#ef4444" name="Failures" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-4">Failures by Process</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={processData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" fill="#3b82f6" name="Total" />
              <Bar dataKey="fails" fill="#ef4444" name="Failures" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Characteristic Analysis */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h3 className="text-lg font-semibold mb-4">Characteristic Failure Rates</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Characteristic</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Failures</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Fail Rate</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {charData.map((char, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-2 text-sm text-gray-900">{char.name}</td>
                  <td className="px-4 py-2 text-sm text-gray-900 text-center">{char.total}</td>
                  <td className="px-4 py-2 text-sm text-red-600 text-center">{char.fails}</td>
                  <td className="px-4 py-2 text-sm text-center">
                    <span className={`px-2 py-1 rounded ${
                      parseFloat(char.failRate) > 10 ? 'bg-red-100 text-red-800' :
                      parseFloat(char.failRate) > 5 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {char.failRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspection Details Table */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-4">Inspection Records</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Process</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Station</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Characteristic</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Gauge</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Measurement</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Result</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Inspector</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {inspections.slice(0, 20).map((inspection) => (
                <tr key={inspection.id}>
                  <td className="px-4 py-2 text-sm text-gray-900">{inspection.date}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{inspection.process}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{inspection.station}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{inspection.characteristic}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{inspection.inspectionMethod}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{inspection.gauge}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{inspection.measurement}</td>
                  <td className="px-4 py-2 text-sm text-center">
                    <span className={`px-2 py-1 rounded ${
                      inspection.result === 'PASS' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {inspection.result}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">{inspection.inspector}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
