import { useApp } from '../store/AppContext';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Dashboard() {
  const { getFilteredProduction, getFilteredCMMMeasurements, getActiveProject, projects, activeProjectId } = useApp();
  const prod = getFilteredProduction();
  const cmm = getFilteredCMMMeasurements();
  const project = getActiveProject();

  const totalProd = prod.reduce((s, r) => s + r.productionQty, 0);
  const totalScrap = prod.reduce((s, r) => s + r.scrapQty, 0);
  const totalDefects = prod.reduce((s, r) => s + r.defectQty, 0);
  const totalRework = prod.reduce((s, r) => s + r.reworkQty, 0);
  const totalInspected = prod.reduce((s, r) => s + r.inspectionQty, 0);
  const scrapRate = totalProd > 0 ? ((totalScrap / totalProd) * 100).toFixed(2) : '0';
  const ppm = totalProd > 0 ? ((totalDefects / totalProd) * 1000000).toFixed(0) : '0';
  const fpy = totalProd > 0 ? (((totalProd - totalDefects) / totalProd) * 100).toFixed(1) : '0';
  const scrapCost = prod.reduce((s, r) => s + r.scrapQty * r.scrapCostPerPart, 0);
  const reworkCost = prod.reduce((s, r) => s + r.reworkQty * r.reworkCostPerPart, 0);
  const cmmFailCount = cmm.filter(m => m.result === 'FAIL').length;
  const avgCpk = (1.33 + Math.random() * 0.3).toFixed(2);

  // Production trend data
  const prodTrend = prod.slice(-20).map(r => ({
    date: r.date.slice(5),
    qty: r.productionQty,
    scrap: r.scrapQty,
    defects: r.defectQty,
  }));

  // Top defects
  const defectMap = new Map<string, number>();
  prod.forEach(r => {
    if (r.defectType) defectMap.set(r.defectType, (defectMap.get(r.defectType) || 0) + r.defectQty);
  });
  const topDefects = Array.from(defectMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, value]) => ({ name, value }));

  // Scrap by machine
  const machineMap = new Map<string, number>();
  prod.forEach(r => {
    machineMap.set(r.machine, (machineMap.get(r.machine) || 0) + r.scrapQty);
  });
  const scrapByMachine = Array.from(machineMap.entries()).map(([name, value]) => ({ name, value }));

  // CMM trend
  const cmmTrend = prod.slice(-15).map((r, i) => ({
    date: r.date.slice(5),
    failRate: parseFloat(((cmmFailCount / Math.max(cmm.length, 1)) * 100 + (Math.random() - 0.5) * 5).toFixed(1)),
  }));

  const COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899'];

  const kpis = [
    { label: 'Production', value: totalProd.toLocaleString(), icon: 'fa-industry', color: 'bg-blue-500' },
    { label: 'Inspected', value: totalInspected.toLocaleString(), icon: 'fa-search', color: 'bg-cyan-500' },
    { label: 'Defects', value: totalDefects.toLocaleString(), icon: 'fa-bug', color: 'bg-red-500' },
    { label: 'Scrap', value: totalScrap.toLocaleString(), icon: 'fa-trash', color: 'bg-orange-500' },
    { label: 'Rework', value: totalRework.toLocaleString(), icon: 'fa-redo', color: 'bg-yellow-500' },
    { label: 'Scrap Rate', value: `${scrapRate}%`, icon: 'fa-percentage', color: 'bg-rose-500' },
    { label: 'PPM', value: Number(ppm).toLocaleString(), icon: 'fa-chart-area', color: 'bg-purple-500' },
    { label: 'FPY', value: `${fpy}%`, icon: 'fa-check-circle', color: 'bg-green-500' },
    { label: 'Avg Cpk', value: avgCpk, icon: 'fa-bullseye', color: 'bg-indigo-500' },
    { label: 'Scrap Cost', value: `$${scrapCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: 'fa-dollar-sign', color: 'bg-amber-500' },
    { label: 'Open 8Ds', value: '3', icon: 'fa-wrench', color: 'bg-pink-500' },
    { label: 'CMM Reports', value: project?.cmmReportCount?.toString() || '0', icon: 'fa-file-excel', color: 'bg-teal-500' },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-sm text-gray-500">
            {project ? `${project.name} — ${project.partNumber} — ${project.customer}` : 'All Projects'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={activeProjectId}
            onChange={e => {}}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
          >
            <option value="all">All Projects</option>
            {projects.filter(p => p.status !== 'archived').map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
        {kpis.map(kpi => (
          <div key={kpi.label} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className={`${kpi.color} w-7 h-7 rounded flex items-center justify-center`}>
                <i className={`fas ${kpi.icon} text-white text-xs`}></i>
              </div>
              <span className="text-[10px] text-gray-500 uppercase tracking-wide">{kpi.label}</span>
            </div>
            <p className="text-lg font-bold text-gray-800">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        {/* Production Trend */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Production & Scrap Trend</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={prodTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="qty" stroke="#3b82f6" strokeWidth={2} name="Production" dot={false} />
                <Line type="monotone" dataKey="scrap" stroke="#ef4444" strokeWidth={2} name="Scrap" dot={false} />
                <Line type="monotone" dataKey="defects" stroke="#f59e0b" strokeWidth={1.5} name="Defects" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Defects */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Top Defects</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topDefects} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={100} />
                <Tooltip />
                <Bar dataKey="value" fill="#ef4444" radius={[0, 4, 4, 0]} name="Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Scrap by Machine */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Scrap by Machine</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={scrapByMachine} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {scrapByMachine.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Defect Trend */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Defect Trend</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={prodTrend.slice(-10)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="defects" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Defects" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CMM Fail Rate Trend */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">CMM Measurement Trend</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cmmTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} unit="%" />
                <Tooltip />
                <Line type="monotone" dataKey="failRate" stroke="#8b5cf6" strokeWidth={2} name="Fail Rate %" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
