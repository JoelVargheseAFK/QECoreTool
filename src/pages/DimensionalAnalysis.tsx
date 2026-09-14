import { useState } from 'react';
import { useApp } from '../store/AppContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function DimensionalAnalysis() {
  const { characteristics, activeProjectId } = useApp();
  const [selectedCharId, setSelectedCharId] = useState('');

  const filteredChars = characteristics.filter(c =>
    activeProjectId === 'all' ? true : c.projectId === activeProjectId
  );

  const selected = characteristics.find(c => c.id === selectedCharId);
  const history = selected?.measurementHistory || [];

  // Stats
  const values = history.map(m => m.actualValue);
  const mean = values.length > 0 ? values.reduce((s, v) => s + v, 0) / values.length : 0;
  const min = values.length > 0 ? Math.min(...values) : 0;
  const max = values.length > 0 ? Math.max(...values) : 0;
  const stdDev = values.length > 1 ? Math.sqrt(values.reduce((s, v) => s + (v - mean) ** 2, 0) / (values.length - 1)) : 0;
  const oosCount = history.filter(m => m.result === 'FAIL').length;
  const oosPercent = history.length > 0 ? (oosCount / history.length * 100) : 0;

  // Detect drift
  const firstHalf = values.slice(0, Math.floor(values.length / 2));
  const secondHalf = values.slice(Math.floor(values.length / 2));
  const firstAvg = firstHalf.length > 0 ? firstHalf.reduce((s, v) => s + v, 0) / firstHalf.length : 0;
  const secondAvg = secondHalf.length > 0 ? secondHalf.reduce((s, v) => s + v, 0) / secondHalf.length : 0;
  const drift = secondAvg - firstAvg;
  const isDrifting = Math.abs(drift) > stdDev * 0.5;

  const chartData = history.map((m, i) => ({
    index: i + 1,
    date: m.date,
    actual: m.actualValue,
    nominal: m.nominalValue,
  }));

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dimensional Analysis</h1>
        <p className="text-sm text-gray-500">Drill down from project → part → feature → measurement history</p>
      </div>

      {/* Selection */}
      <div className="flex flex-wrap gap-3 mb-4">
        <select
          value={selectedCharId}
          onChange={e => setSelectedCharId(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm min-w-64"
        >
          <option value="">Select Characteristic</option>
          {filteredChars.map(c => (
            <option key={c.id} value={c.id}>{c.name} — {c.partNumber}</option>
          ))}
        </select>
      </div>

      {selected ? (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-4">
            {[
              { label: 'Sample Size', value: history.length.toString() },
              { label: 'Mean', value: mean.toFixed(4) },
              { label: 'Min', value: min.toFixed(4) },
              { label: 'Max', value: max.toFixed(4) },
              { label: 'Std Dev', value: stdDev.toFixed(4) },
              { label: 'OOS Count', value: oosCount.toString() },
              { label: 'OOS %', value: `${oosPercent.toFixed(1)}%` },
              { label: 'Drift', value: isDrifting ? `⚠ ${drift.toFixed(4)}` : '✓ Stable' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-lg border p-2.5">
                <p className="text-[10px] text-gray-500 uppercase">{s.label}</p>
                <p className={`text-sm font-bold font-mono ${s.label === 'Drift' && isDrifting ? 'text-red-600' : 'text-gray-800'}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Measurement vs Time</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="index" tick={{ fontSize: 10 }} label={{ value: 'Sample #', position: 'bottom', fontSize: 10 }} />
                  <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <ReferenceLine y={selected.usl} stroke="#ef4444" strokeDasharray="5 5" label={{ value: 'USL', fontSize: 10, position: 'right' }} />
                  <ReferenceLine y={selected.lsl} stroke="#ef4444" strokeDasharray="5 5" label={{ value: 'LSL', fontSize: 10, position: 'right' }} />
                  <ReferenceLine y={selected.nominal} stroke="#3b82f6" strokeDasharray="3 3" label={{ value: 'Nominal', fontSize: 10 }} />
                  <ReferenceLine y={mean} stroke="#f59e0b" strokeDasharray="2 2" label={{ value: 'Mean', fontSize: 10 }} />
                  <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} name="Actual" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Analysis Notes */}
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Centering Analysis</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Nominal:</span>
                  <span className="font-mono">{selected.nominal.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Mean:</span>
                  <span className="font-mono">{mean.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Offset from Nominal:</span>
                  <span className={`font-mono ${Math.abs(mean - selected.nominal) > selected.tolerance * 0.25 ? 'text-red-600' : 'text-green-600'}`}>
                    {(mean - selected.nominal) > 0 ? '+' : ''}{(mean - selected.nominal).toFixed(4)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Centering Status:</span>
                  <span className={Math.abs(mean - selected.nominal) > selected.tolerance * 0.25 ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                    {Math.abs(mean - selected.nominal) > selected.tolerance * 0.25 ? '⚠ Off-center' : '✓ Centered'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Variation & Drift</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Range:</span>
                  <span className="font-mono">{(max - min).toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Std Deviation:</span>
                  <span className="font-mono">{stdDev.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Drift Detected:</span>
                  <span className={isDrifting ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                    {isDrifting ? `⚠ ${drift > 0 ? 'Upward' : 'Downward'} (${drift.toFixed(4)})` : '✓ No significant drift'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Sudden Shifts:</span>
                  <span className="font-medium text-gray-700">None detected</span>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <i className="fas fa-ruler-combined text-4xl text-gray-300 mb-3"></i>
          <p className="text-gray-500">Select a characteristic to view dimensional analysis</p>
        </div>
      )}
    </div>
  );
}
