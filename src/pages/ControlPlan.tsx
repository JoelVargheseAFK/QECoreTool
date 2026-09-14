import { useApp } from '../store/AppContext';

export default function ControlPlan() {
  const { controlPlanEntries } = useApp();

  const stats = {
    total: controlPlanEntries.length,
    active: controlPlanEntries.filter(e => e.status === 'Active').length,
    reviewRequired: controlPlanEntries.filter(e => e.status === 'Review Required').length,
    obsolete: controlPlanEntries.filter(e => e.status === 'Obsolete').length,
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Control Plan</h1>
        <p className="text-sm text-gray-500">Process control requirements and inspection methods</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Total Entries</div>
          <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Active</div>
          <div className="text-2xl font-bold text-green-600">{stats.active}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Review Required</div>
          <div className="text-2xl font-bold text-yellow-600">{stats.reviewRequired}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Obsolete</div>
          <div className="text-2xl font-bold text-gray-600">{stats.obsolete}</div>
        </div>
      </div>

      {/* Control Plan Table */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-4">Control Plan Entries</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Process Step</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product Characteristic</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Specification</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Special Char</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Gauge</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fixture</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Sample Size</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Frequency</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Control Method</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Reaction Plan</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Responsible</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Revision</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {controlPlanEntries.map((entry) => (
                <tr key={entry.id}>
                  <td className="px-3 py-2 text-sm text-gray-900">{entry.processStep}</td>
                  <td className="px-3 py-2 text-sm text-gray-900">{entry.productCharacteristic}</td>
                  <td className="px-3 py-2 text-sm text-gray-900">{entry.specification}</td>
                  <td className="px-3 py-2 text-sm text-center">
                    {entry.specialCharacteristic && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-bold">
                        {entry.specialCharacteristic}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-900">{entry.measurementMethod}</td>
                  <td className="px-3 py-2 text-sm text-gray-900">{entry.gauge}</td>
                  <td className="px-3 py-2 text-sm text-gray-900">{entry.fixture}</td>
                  <td className="px-3 py-2 text-sm text-gray-900 text-center">{entry.sampleSize}</td>
                  <td className="px-3 py-2 text-sm text-gray-900">{entry.frequency}</td>
                  <td className="px-3 py-2 text-sm text-gray-900">{entry.controlMethod}</td>
                  <td className="px-3 py-2 text-sm text-gray-900">{entry.reactionPlan}</td>
                  <td className="px-3 py-2 text-sm text-gray-900">{entry.responsible}</td>
                  <td className="px-3 py-2 text-sm text-gray-900">{entry.revision}</td>
                  <td className="px-3 py-2 text-sm text-center">
                    <span className={`px-2 py-1 rounded ${
                      entry.status === 'Active' ? 'bg-green-100 text-green-800' :
                      entry.status === 'Review Required' ? 'bg-yellow-100 text-yellow-800' :
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
