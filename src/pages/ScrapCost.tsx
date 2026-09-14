import { useApp } from '../store/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

export default function ScrapCost() {
  const { getFilteredProduction } = useApp();
  const prod = getFilteredProduction();

  const totalProd = prod.reduce((s, r) => s + r.productionQty, 0);
  const totalScrap = prod.reduce((s, r) => s + r.scrapQty, 0);
  const totalRework = prod.reduce((s, r) => s + r.reworkQty, 0);
  const totalDefects = prod.reduce((s, r) => s + r.defectQty, 0);
  const scrapRate = totalProd > 0 ? (totalScrap / totalProd * 100) : 0;
  const ppm = totalProd > 0 ? (totalDefects / totalProd * 1000000) : 0;
  const scrapCost = prod.reduce((s, r) => s + r.scrapQty * r.scrapCostPerPart, 0);
  const reworkCost = prod.reduce((s, r) => s + r.reworkQty * r.reworkCostPerPart, 0);
  const totalQualityCost = scrapCost + reworkCost;

  // Scrap by defect
  const defectScrap = new Map<string, { qty: number; cost: number }>();
  prod.forEach(r => {
    const existing = defectScrap.get(r.defectType) || { qty: 0, cost: 0 };
    existing.qty += r.scrapQty;
    existing.cost += r.scrapQty * r.scrapCostPerPart;
    defectScrap.set(r.defectType, existing);
  });
  const defectPareto = Array.from(defectScrap.entries())
    .sort((a, b) => b[1].cost - a[1].cost)
    .map(([name, data]) => ({ name, cost: parseFloat(data.cost.toFixed(0)), qty: data.qty }));

  // Scrap by machine
  const machineScrap = new Map<string, number>();
  prod.forEach(r => machineScrap.set(r.machine, (machineScrap.get(r.machine) || 0) + r.scrapQty * r.scrapCostPerPart));
  const machineCostData = Array.from(machineScrap.entries()).sort((a, b) => b[1] - a[1]).map(([name, cost]) => ({ name, cost: parseFloat(cost.toFixed(0)) }));

  // Scrap trend
  const scrapTrend = prod.slice(-20).map(r => ({
    date: r.date.slice(5),
    scrapCost: parseFloat((r.scrapQty * r.scrapCostPerPart).toFixed(0)),
    scrapQty: r.scrapQty,
  }));

  // By shift
  const shiftScrap = new Map<string, number>();
  prod.forEach(r => shiftScrap.set(r.shift, (shiftScrap.get(r.shift) || 0) + r.scrapQty * r.scrapCostPerPart));
  const shiftData = Array.from(shiftScrap.entries()).map(([name, value]) => ({ name, value: parseFloat(value.toFixed(0)) }));

  const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899'];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Scrap & Cost Study</h1>
        <p className="text-sm text-gray-500">Quality cost analysis and improvement tracking</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-4">
        {[
          { label: 'Scrap Rate', value: `${scrapRate.toFixed(2)}%`, color: 'text-red-600' },
          { label: 'Defect PPM', value: ppm.toFixed(0), color: 'text-orange-600' },
          { label: 'Scrap Qty', value: totalScrap.toLocaleString(), color: 'text-red-600' },
          { label: 'Scrap Cost', value: `$${scrapCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, color: 'text-red-600' },
          { label: 'Rework Cost', value: `$${reworkCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, color: 'text-yellow-600' },
          { label: 'Total Quality Cost', value: `$${totalQualityCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, color: 'text-red-700' },
          { label: 'Cost/Part', value: `$${totalProd > 0 ? (totalQualityCost / totalProd).toFixed(2) : '0'}`, color: 'text-gray-700' },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-lg border p-3">
            <p className="text-xs text-gray-500">{k.label}</p>
            <p className={`text-lg font-bold ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        {/* Cost Trend */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Scrap Cost Trend</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={scrapTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="scrapCost" stroke="#ef4444" strokeWidth={2} name="Scrap Cost $" dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cost Pareto */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Top 10 Cost Drivers</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={defectPareto.slice(0, 10)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} width={100} />
                <Tooltip />
                <Bar dataKey="cost" fill="#ef4444" radius={[0, 4, 4, 0]} name="Cost $" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Cost by Machine */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Cost by Machine</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={machineCostData} dataKey="cost" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {machineCostData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cost by Shift */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Cost by Shift</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={shiftData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Cost $" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Before/After Comparison */}
      <div className="mt-4 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Before/After Comparison (Estimated)</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-red-50 rounded-lg p-3 border border-red-200">
            <p className="text-xs text-red-500 mb-1">Before (Current)</p>
            <p className="text-lg font-bold text-red-700">${totalQualityCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            <p className="text-xs text-red-500">Scrap Rate: {scrapRate.toFixed(2)}%</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3 border border-green-200">
            <p className="text-xs text-green-500 mb-1">Target (After Improvement)</p>
            <p className="text-lg font-bold text-green-700">${(totalQualityCost * 0.6).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            <p className="text-xs text-green-500">Target Rate: {(scrapRate * 0.6).toFixed(2)}%</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <p className="text-xs text-blue-500 mb-1">Estimated Savings</p>
            <p className="text-lg font-bold text-blue-700">${(totalQualityCost * 0.4).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            <p className="text-xs text-blue-500">40% reduction target</p>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2">* Estimates based on current data. Actual savings depend on corrective action effectiveness.</p>
      </div>
    </div>
  );
}
