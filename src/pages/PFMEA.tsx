import { useApp } from '../store/AppContext';

export default function PFMEA() {
  const { pfmeaEntries } = useApp();

  const stats = {
    total: pfmeaEntries.length,
    highRisk: pfmeaEntries.filter(e => e.rpn >= 125).length,
    mediumRisk: pfmeaEntries.filter(e => e.rpn >= 80 && e.rpn < 125).length,
    lowRisk: pfmeaEntries.filter(e => e.rpn < 80).length,
    open: pfmeaEntries.filter(e => e.status === 'Open' || e.status === 'In Progress').length,
    overdue: pfmeaEntries.filter(e => e.status === 'Overdue').length,
  };

  const sortedEntries = [...pfmeaEntries].sort((a, b) => b.rpn - a.rpn);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">PFMEA</h1>
        <p className="text-sm text-gray-500">Process Failure Mode and Effects Analysis</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Total Items</div>
          <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">High Risk (≥125)</div>
          <div className="text-2xl font-bold text-red-600">{stats.highRisk}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Medium Risk (80-124)</div>
          <div className="text-2xl font-bold text-yellow-600">{stats.mediumRisk}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Low Risk (&lt;80)</div>
          <div className="text-2xl font-bold text-green-600">{stats.lowRisk}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Open Actions</div>
          <div className="text-2xl font-bold text-blue-600">{stats.open}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Overdue</div>
          <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
        </div>
      </div>

      {/* PFMEA Table */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-4">PFMEA Entries (Sorted by RPN)</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Process Step</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Failure Mode</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Effect</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">S</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cause</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">O</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Detection</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">D</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">RPN</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Responsible</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedEntries.map((entry) => (
                <tr key={entry.id} className={entry.rpn >= 125 ? 'bg-red-50' : entry.rpn >= 80 ? 'bg-yellow-50' : ''}>
                  <td className="px-3 py-2 text-sm text-gray-900">{entry.processStep}</td>
                  <td className="px-3 py-2 text-sm text-gray-900">{entry.failureMode}</td>
                  <td className="px-3 py-2 text-sm text-gray-900">{entry.effect}</td>
                  <td className="px-3 py-2 text-sm text-gray-900 text-center">{entry.severity}</td>
                  <td className="px-3 py-2 text-sm text-gray-900">{entry.cause}</td>
                  <td className="px-3 py-2 text-sm text-gray-900 text-center">{entry.occurrence}</td>
                  <td className="px-3 py-2 text-sm text-gray-900">{entry.detectionControl}</td>
                  <td className="px-3 py-2 text-sm text-gray-900 text-center">{entry.detection}</td>
                  <td className="px-3 py-2 text-sm text-center">
                    <span className={`px-2 py-1 rounded font-bold ${
                      entry.rpn >= 125 ? 'bg-red-100 text-red-800' :
                      entry.rpn >= 80 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {entry.rpn}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-900">{entry.action}</td>
                  <td className="px-3 py-2 text-sm text-gray-900">{entry.responsible}</td>
                  <td className="px-3 py-2 text-sm text-gray-900">{entry.dueDate}</td>
                  <td className="px-3 py-2 text-sm text-center">
                    <span className={`px-2 py-1 rounded ${
                      entry.status === 'Closed' ? 'bg-green-100 text-green-800' :
                      entry.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                      entry.status === 'Overdue' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {entry.status}
                    </span>
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
