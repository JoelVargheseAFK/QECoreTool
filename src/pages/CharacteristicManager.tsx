import { useState } from 'react';
import { useApp } from '../store/AppContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function CharacteristicManager() {
  const { characteristics, activeProjectId } = useApp();
  const [search, setSearch] = useState('');
  const [selectedChar, setSelectedChar] = useState<string | null>(null);
  const [featureTypeFilter, setFeatureTypeFilter] = useState('');

  const filteredChars = characteristics.filter(c => {
    if (activeProjectId !== 'all' && c.projectId !== activeProjectId) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (featureTypeFilter && c.featureType !== featureTypeFilter) return false;
    return true;
  });

  const featureTypes = Array.from(new Set(characteristics.map(c => c.featureType)));
  const selected = characteristics.find(c => c.id === selectedChar);

  const historyData = selected?.measurementHistory.map(m => ({
    date: m.date,
    actual: m.actualValue,
    nominal: m.nominalValue,
    usl: m.usl,
    lsl: m.lsl,
    result: m.result,
  })) || [];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">CMM Characteristic Manager</h1>
          <p className="text-sm text-gray-500">Search and analyze measurement characteristics across all reports</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="Search characteristics..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-64"
        />
        <select
          value={featureTypeFilter}
          onChange={e => setFeatureTypeFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="">All Feature Types</option>
          {featureTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <span className="px-3 py-2 text-sm text-gray-500">{filteredChars.length} characteristics</span>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Characteristic List */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-3 border-b bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-700">Characteristics</h3>
          </div>
          <div className="overflow-y-auto max-h-[600px]">
            {filteredChars.slice(0, 50).map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedChar(c.id)}
                className={`w-full text-left px-3 py-2 border-b border-gray-100 hover:bg-blue-50 transition-colors ${
                  selectedChar === c.id ? 'bg-blue-50 border-l-2 border-l-blue-500' : ''
                }`}
              >
                <p className="text-sm font-medium text-gray-800 truncate">{c.name}</p>
                <p className="text-xs text-gray-500">{c.featureType} · {c.measurementHistory.length} measurements</p>
              </button>
            ))}
          </div>
        </div>

        {/* Detail View */}
        <div className="lg:col-span-2 space-y-4">
          {selected ? (
            <>
              {/* Info Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-800 mb-3">{selected.name}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-gray-50 rounded p-2">
                    <p className="text-xs text-gray-500">Feature Type</p>
                    <p className="font-medium text-sm">{selected.featureType}</p>
                  </div>
                  <div className="bg-gray-50 rounded p-2">
                    <p className="text-xs text-gray-500">Nominal</p>
                    <p className="font-medium text-sm font-mono">{selected.nominal.toFixed(4)}</p>
                  </div>
                  <div className="bg-gray-50 rounded p-2">
                    <p className="text-xs text-gray-500">USL / LSL</p>
                    <p className="font-medium text-sm font-mono">{selected.usl.toFixed(4)} / {selected.lsl.toFixed(4)}</p>
                  </div>
                  <div className="bg-gray-50 rounded p-2">
                    <p className="text-xs text-gray-500">Tolerance</p>
                    <p className="font-medium text-sm font-mono">±{(selected.tolerance / 2).toFixed(4)}</p>
                  </div>
                  <div className="bg-gray-50 rounded p-2">
                    <p className="text-xs text-gray-500">Samples</p>
                    <p className="font-medium text-sm">{selected.measurementHistory.length}</p>
                  </div>
                  <div className="bg-gray-50 rounded p-2">
                    <p className="text-xs text-gray-500">Pass Rate</p>
                    <p className="font-medium text-sm text-green-600">
                      {((selected.measurementHistory.filter(m => m.result === 'PASS').length / selected.measurementHistory.length) * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded p-2">
                    <p className="text-xs text-gray-500">Part</p>
                    <p className="font-medium text-sm">{selected.partNumber}</p>
                  </div>
                  <div className="bg-gray-50 rounded p-2">
                    <p className="text-xs text-gray-500">Project</p>
                    <p className="font-medium text-sm">{selected.projectId}</p>
                  </div>
                </div>
              </div>

              {/* History Chart */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Measurement History</h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={historyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                      <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <ReferenceLine y={selected.usl} stroke="#ef4444" strokeDasharray="5 5" label={{ value: 'USL', fontSize: 10 }} />
                      <ReferenceLine y={selected.lsl} stroke="#ef4444" strokeDasharray="5 5" label={{ value: 'LSL', fontSize: 10 }} />
                      <ReferenceLine y={selected.nominal} stroke="#3b82f6" strokeDasharray="3 3" label={{ value: 'Nom', fontSize: 10 }} />
                      <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} name="Actual" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* History Table */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-3 border-b bg-gray-50">
                  <h3 className="text-sm font-semibold text-gray-700">All Measurements</h3>
                </div>
                <div className="overflow-x-auto max-h-64">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        {['Date', 'Source File', 'Actual', 'Deviation', 'Result'].map(h => (
                          <th key={h} className="px-3 py-2 text-left text-gray-600 font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selected.measurementHistory.slice(0, 30).map(m => (
                        <tr key={m.id} className={`hover:bg-gray-50 ${m.result === 'FAIL' ? 'bg-red-50' : ''}`}>
                          <td className="px-3 py-2">{m.date}</td>
                          <td className="px-3 py-2 text-gray-500">{m.sourceFile}</td>
                          <td className="px-3 py-2 font-mono">{m.actualValue.toFixed(4)}</td>
                          <td className="px-3 py-2 font-mono">{m.deviation > 0 ? '+' : ''}{m.deviation.toFixed(4)}</td>
                          <td className="px-3 py-2">
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              m.result === 'PASS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>{m.result}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <i className="fas fa-draw-polygon text-4xl text-gray-300 mb-3"></i>
              <p className="text-gray-500">Select a characteristic to view its measurement history</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
