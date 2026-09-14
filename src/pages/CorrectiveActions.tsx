import { useState } from 'react';
import { useApp } from '../store/AppContext';

export default function CorrectiveActions() {
  const { correctiveActions } = useApp();
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  const action = correctiveActions.find(a => a.id === selectedAction);

  const stats = {
    total: correctiveActions.length,
    open: correctiveActions.filter(a => a.status === 'Open').length,
    inProgress: correctiveActions.filter(a => a.status === 'In Progress').length,
    verification: correctiveActions.filter(a => a.status === 'Verification').length,
    closed: correctiveActions.filter(a => a.status === 'Closed').length,
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">8D / Corrective Actions</h1>
        <p className="text-sm text-gray-500">Problem solving and corrective action tracking</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Total Actions</div>
          <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Open</div>
          <div className="text-2xl font-bold text-blue-600">{stats.open}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">In Progress</div>
          <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Verification</div>
          <div className="text-2xl font-bold text-purple-600">{stats.verification}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Closed</div>
          <div className="text-2xl font-bold text-green-600">{stats.closed}</div>
        </div>
      </div>

      {/* Actions List and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-4">Corrective Actions</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {correctiveActions.map((a) => (
              <button
                key={a.id}
                onClick={() => setSelectedAction(a.id)}
                className={`w-full text-left p-3 rounded border transition ${
                  selectedAction === a.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="font-medium text-sm">{a.issueId}</div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    a.status === 'Closed' ? 'bg-green-100 text-green-800' :
                    a.status === 'Verification' ? 'bg-purple-100 text-purple-800' :
                    a.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {a.status}
                  </span>
                </div>
                <div className="text-xs text-gray-600 mb-1">{a.defect}</div>
                <div className="text-xs text-gray-500">{a.part} • {a.date}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Action Details */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-4">
          {action ? (
            <>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{action.issueId}</h3>
                  <p className="text-sm text-gray-500">{action.part} • {action.process}</p>
                </div>
                <span className={`px-3 py-1 rounded ${
                  action.status === 'Closed' ? 'bg-green-100 text-green-800' :
                  action.status === 'Verification' ? 'bg-purple-100 text-purple-800' :
                  action.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {action.status}
                </span>
              </div>

              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <div className="text-xs font-semibold text-blue-600 mb-1">D1 - TEAM</div>
                  <div className="text-sm text-gray-700">{action.d1Team}</div>
                </div>

                <div className="border-l-4 border-red-500 pl-4">
                  <div className="text-xs font-semibold text-red-600 mb-1">D2 - PROBLEM DESCRIPTION</div>
                  <div className="text-sm text-gray-700">{action.d2Problem}</div>
                </div>

                <div className="border-l-4 border-yellow-500 pl-4">
                  <div className="text-xs font-semibold text-yellow-600 mb-1">D3 - CONTAINMENT</div>
                  <div className="text-sm text-gray-700">{action.d3Containment}</div>
                </div>

                <div className="border-l-4 border-orange-500 pl-4">
                  <div className="text-xs font-semibold text-orange-600 mb-1">D4 - ROOT CAUSE</div>
                  <div className="text-sm text-gray-700">{action.d4RootCause}</div>
                </div>

                <div className="border-l-4 border-green-500 pl-4">
                  <div className="text-xs font-semibold text-green-600 mb-1">D5 - CORRECTIVE ACTION</div>
                  <div className="text-sm text-gray-700">{action.d5CorrectiveAction}</div>
                </div>

                <div className="border-l-4 border-teal-500 pl-4">
                  <div className="text-xs font-semibold text-teal-600 mb-1">D6 - IMPLEMENTATION</div>
                  <div className="text-sm text-gray-700">{action.d6Implementation}</div>
                </div>

                <div className="border-l-4 border-purple-500 pl-4">
                  <div className="text-xs font-semibold text-purple-600 mb-1">D7 - EFFECTIVENESS</div>
                  <div className="text-sm text-gray-700">{action.d7Effectiveness || 'Pending verification'}</div>
                </div>

                {action.d8Closure && (
                  <div className="border-l-4 border-gray-500 pl-4">
                    <div className="text-xs font-semibold text-gray-600 mb-1">D8 - CLOSURE</div>
                    <div className="text-sm text-gray-700">{action.d8Closure}</div>
                  </div>
                )}
              </div>

              {/* Before/After Comparison */}
              {(action.beforeCpk !== undefined || action.beforePpm !== undefined) && (
                <div className="border-t pt-4 mt-4">
                  <h4 className="font-semibold mb-3">Before vs After</h4>
                  <div className="grid grid-cols-3 gap-4">
                    {action.beforeCpk !== undefined && action.afterCpk !== undefined && (
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Cpk</div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-red-600">{action.beforeCpk.toFixed(2)}</span>
                          <span className="text-gray-400">→</span>
                          <span className="text-sm text-green-600 font-bold">{action.afterCpk.toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                    {action.beforePpm !== undefined && action.afterPpm !== undefined && (
                      <div>
                        <div className="text-xs text-gray-500 mb-1">PPM</div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-red-600">{action.beforePpm}</span>
                          <span className="text-gray-400">→</span>
                          <span className="text-sm text-green-600 font-bold">{action.afterPpm}</span>
                        </div>
                      </div>
                    )}
                    {action.beforeScrap !== undefined && action.afterScrap !== undefined && (
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Scrap</div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-red-600">{action.beforeScrap}</span>
                          <span className="text-gray-400">→</span>
                          <span className="text-sm text-green-600 font-bold">{action.afterScrap}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="border-t pt-4 mt-4 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-500">Responsible:</span>
                    <span className="ml-2 font-medium">{action.responsible}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Due Date:</span>
                    <span className="ml-2 font-medium">{action.dueDate}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Verification:</span>
                    <span className="ml-2 font-medium">{action.verification}</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400">
              Select a corrective action to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
