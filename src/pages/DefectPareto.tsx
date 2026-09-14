import { useApp } from '../store/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Line } from 'recharts';

export default function DefectPareto() {
  const { getFilteredProduction } = useApp();
  const prod = getFilteredProduction();

  // Defect counts
  const defectMap = new Map<string, number>();
  prod.forEach(r => {
    if (r.defectType) defectMap.set(r.defectType, (defectMap.get(r.defectType) || 0) + r.defectQty);
  });

  const sortedDefects = Array.from(defectMap.entries())
    .sort((a, b) => b[1] - a[1]);

  const totalDefects = sortedDefects.reduce((s, [, v]) => s + v, 0);
  let cumulative = 0;
  const paretoData = sortedDefects.map(([name, count]) => {
    cumulative += count;
    return {
      name,
      count,
      percentage: totalDefects > 0 ? (count / totalDefects * 100) : 0,
      cumulative: totalDefects > 0 ? (cumulative / totalDefects * 100) : 0,
    };
  });

  // By machine
  const machineDefects = new Map<string, number>();
  prod.forEach(r => machineDefects.set(r.machine, (machineDefects.get(r.machine) || 0) + r.defectQty));
  const machineData = Array.from(machineDefects.entries()).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }));

  // By shift
  const shiftDefects = new Map<string, number>();
  prod.forEach(r => shiftDefects.set(r.shift, (shiftDefects.get(r.shift) || 0) + r.defectQty));
  const shiftData = Array.from(shiftDefects.entries()).map(([name, value]) => ({ name, value }));

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Defect / Pareto Analysis</h1>
        <p className="text-sm text-gray-500">Identify largest defect contributors — correlation does not prove causation</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="bg-white rounded-lg border p-3">
          <p className="text-xs text-gray-500">Total Defects</p>
          <p className="text-xl font-bold text-red-600">{totalDefects}</p>
        </div>
        <div className="bg-white rounded-lg border p-3">
          <p className="text-xs text-gray-500">Defect Types</p>
          <p className="text-xl font-bold text-gray-800">{sortedDefects.length}</p>
        </div>
        <div className="bg-white rounded-lg border p-3">
          <p className="text-xs text-gray-500">Top Defect</p>
          <p className="text-sm font-bold text-gray-800 truncate">{sortedDefects[0]?.[0] || '—'}</p>
        </div>
        <div className="bg-white rounded-lg border p-3">
          <p className="text-xs text-gray-500">Top 3 Cover</p>
          <p className="text-xl font-bold text-blue-600">{paretoData.slice(0, 3).reduce((s, d) => s + d.percentage, 0).toFixed(0)}%</p>
        </div>
      </div>

      {/* Pareto Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Pareto Chart — Defects by Type</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={paretoData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={60} />
              <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} unit="%" domain={[0, 100]} />
              <Tooltip />
              <Bar yAxisId="left" dataKey="count" fill="#ef4444" radius={[4, 4, 0, 0]} name="Count" />
              <Line yAxisId="right" type="monotone" dataKey="cumulative" stroke="#3b82f6" strokeWidth={2} name="Cumulative %" dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Drill Down */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* By Machine */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Defects by Machine</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={machineData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={60} />
                <Tooltip />
                <Bar dataKey="value" fill="#f59e0b" radius={[0, 4, 4, 0]} name="Defects" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* By Shift */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Defects by Shift</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={shiftData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Defects" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Note */}
      <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-700">
        <i className="fas fa-info-circle mr-1"></i>
        <strong>Note:</strong> The largest contributor is a pattern requiring investigation. This does not automatically identify root cause. Further analysis needed to confirm causal relationships.
      </div>
    </div>
  );
}
