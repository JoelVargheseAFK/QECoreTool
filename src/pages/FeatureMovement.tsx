import { useState } from 'react';
import { useApp } from '../store/AppContext';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, LineChart, Line } from 'recharts';

export default function FeatureMovement() {
  const { cmmReports, activeProjectId, characteristics } = useApp();
  const [selectedFeature, setSelectedFeature] = useState('');
  const [selectedPart, setSelectedPart] = useState('');

  const filteredReports = cmmReports.filter(r =>
    activeProjectId === 'all' ? true : r.projectId === activeProjectId
  );

  const featuresWithCoords = characteristics.filter(c => {
    if (activeProjectId !== 'all' && c.projectId !== activeProjectId) return false;
    const hasCoords = c.measurementHistory.some(m => m.actualX !== undefined);
    return hasCoords;
  });

  const selected = characteristics.find(c => c.id === selectedFeature);
  const measurements = selected?.measurementHistory || [];
  const hasCoordData = measurements.some(m => m.actualX !== undefined);

  // XY scatter data
  const scatterData = measurements.map(m => ({
    x: m.actualX || 0,
    y: m.actualY || 0,
    date: m.date,
    result: m.result,
  }));

  const nominalX = measurements[0]?.nominalX || 0;
  const nominalY = measurements[0]?.nominalY || 0;

  // Timeline data
  const timelineData = measurements.map((m, i) => ({
    index: i + 1,
    date: m.date,
    deviation: m.deviation,
    deltaX: m.actualX !== undefined && m.nominalX !== undefined ? m.actualX - m.nominalX : 0,
    deltaY: m.actualY !== undefined && m.nominalY !== undefined ? m.actualY - m.nominalY : 0,
    deltaZ: m.actualZ !== undefined && m.nominalZ !== undefined ? m.actualZ - m.nominalZ : 0,
  }));

  // Detect drift
  const deviations = measurements.map(m => m.deviation);
  const avgDev = deviations.reduce((s, d) => s + d, 0) / deviations.length;
  const trend = deviations.length > 5 ? (deviations[deviations.length - 1] - deviations[0]) : 0;
  const isDrifting = Math.abs(trend) > (selected?.tolerance || 0.1) * 0.3;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Feature Movement Analysis</h1>
        <p className="text-sm text-gray-500">Track how features move during production relative to nominal</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <select
          value={selectedFeature}
          onChange={e => setSelectedFeature(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="">Select Feature / Characteristic</option>
          {featuresWithCoords.map(c => (
            <option key={c.id} value={c.id}>{c.name} ({c.featureType})</option>
          ))}
        </select>
        <select
          value={selectedPart}
          onChange={e => setSelectedPart(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="">All Parts</option>
          <option value="AC-1042">AC-1042</option>
          <option value="DT-7780">DT-7780</option>
        </select>
      </div>

      {selected && hasCoordData ? (
        <>
          {/* Feature Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-800">{selected.name}</h3>
                <p className="text-xs text-gray-500">
                  Nominal: X={nominalX.toFixed(3)} Y={nominalY.toFixed(3)} · {measurements.length} measurements
                </p>
              </div>
              <div className="flex gap-4">
                <div className="text-center">
                  <p className="text-xs text-gray-500">Avg ΔX</p>
                  <p className="font-mono font-bold text-sm">{(timelineData.reduce((s, d) => s + d.deltaX, 0) / timelineData.length).toFixed(4)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Avg ΔY</p>
                  <p className="font-mono font-bold text-sm">{(timelineData.reduce((s, d) => s + d.deltaY, 0) / timelineData.length).toFixed(4)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Trend</p>
                  <p className={`font-mono font-bold text-sm ${isDrifting ? 'text-red-600' : 'text-green-600'}`}>
                    {isDrifting ? '⚠ Drifting' : '✓ Stable'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* XY Feature Map */}
          <div className="grid lg:grid-cols-2 gap-4 mb-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Feature Map (X/Y)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" dataKey="x" name="X" tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
                    <YAxis type="number" dataKey="y" name="Y" tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <ReferenceLine x={nominalX} stroke="#3b82f6" strokeDasharray="5 5" />
                    <ReferenceLine y={nominalY} stroke="#3b82f6" strokeDasharray="5 5" />
                    <Scatter data={[{ x: nominalX, y: nominalY }]} fill="#3b82f6" name="Nominal" shape="star" />
                    <Scatter data={scatterData} fill="#10b981" name="Actual" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-1 align-middle"></span> Nominal
                <span className="inline-block w-3 h-3 bg-green-500 rounded-full ml-3 mr-1 align-middle"></span> Actual positions
              </p>
            </div>

            {/* Deviation Timeline */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Movement Timeline</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="index" tick={{ fontSize: 10 }} label={{ value: 'Report #', position: 'bottom', fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <ReferenceLine y={0} stroke="#666" />
                    <Line type="monotone" dataKey="deltaX" stroke="#ef4444" strokeWidth={1.5} name="ΔX" dot={{ r: 2 }} />
                    <Line type="monotone" dataKey="deltaY" stroke="#3b82f6" strokeWidth={1.5} name="ΔY" dot={{ r: 2 }} />
                    <Line type="monotone" dataKey="deltaZ" stroke="#10b981" strokeWidth={1.5} name="ΔZ" dot={{ r: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Movement Details Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-3 border-b bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-700">Measurement Details</h3>
            </div>
            <div className="overflow-x-auto max-h-64">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    {['#', 'Date', 'Nom X', 'Nom Y', 'Nom Z', 'Act X', 'Act Y', 'Act Z', 'ΔX', 'ΔY', 'ΔZ', 'Result'].map(h => (
                      <th key={h} className="px-3 py-2 text-left text-gray-600 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {measurements.slice(0, 30).map((m, i) => (
                    <tr key={m.id} className={`hover:bg-gray-50 ${m.result === 'FAIL' ? 'bg-red-50' : ''}`}>
                      <td className="px-3 py-2">{i + 1}</td>
                      <td className="px-3 py-2">{m.date}</td>
                      <td className="px-3 py-2 font-mono">{m.nominalX?.toFixed(3) || '—'}</td>
                      <td className="px-3 py-2 font-mono">{m.nominalY?.toFixed(3) || '—'}</td>
                      <td className="px-3 py-2 font-mono">{m.nominalZ?.toFixed(3) || '—'}</td>
                      <td className="px-3 py-2 font-mono">{m.actualX?.toFixed(3) || '—'}</td>
                      <td className="px-3 py-2 font-mono">{m.actualY?.toFixed(3) || '—'}</td>
                      <td className="px-3 py-2 font-mono">{m.actualZ?.toFixed(3) || '—'}</td>
                      <td className="px-3 py-2 font-mono text-red-600">{m.actualX !== undefined && m.nominalX !== undefined ? (m.actualX - m.nominalX).toFixed(3) : '—'}</td>
                      <td className="px-3 py-2 font-mono text-blue-600">{m.actualY !== undefined && m.nominalY !== undefined ? (m.actualY - m.nominalY).toFixed(3) : '—'}</td>
                      <td className="px-3 py-2 font-mono text-green-600">{m.actualZ !== undefined && m.nominalZ !== undefined ? (m.actualZ - m.nominalZ).toFixed(3) : '—'}</td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-0.5 rounded text-xs ${m.result === 'PASS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{m.result}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : selected && !hasCoordData ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
          <i className="fas fa-info-circle text-2xl text-yellow-500 mb-2"></i>
          <p className="text-sm text-yellow-700 font-medium">Directional movement cannot be determined from the available data.</p>
          <p className="text-xs text-yellow-600 mt-1">This feature does not contain X/Y/Z coordinate data. Only a single positional deviation value is available.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <i className="fas fa-route text-4xl text-gray-300 mb-3"></i>
          <p className="text-gray-500">Select a feature with coordinate data to analyze movement</p>
        </div>
      )}
    </div>
  );
}
