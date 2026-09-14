import { useState } from 'react';
import { useApp } from '../store/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function Capability() {
  const { characteristics, activeProjectId } = useApp();
  const [selectedCharId, setSelectedCharId] = useState('');
  const [cpkThreshold, setCpkThreshold] = useState(1.33);

  const filteredChars = characteristics.filter(c =>
    activeProjectId === 'all' ? true : c.projectId === activeProjectId
  );

  const selected = characteristics.find(c => c.id === selectedCharId);
  const values = selected?.measurementHistory.map(m => m.actualValue) || [];
  const n = values.length;

  // Stats
  const mean = n > 0 ? values.reduce((s, v) => s + v, 0) / n : 0;
  const stdDev = n > 1 ? Math.sqrt(values.reduce((s, v) => s + (v - mean) ** 2, 0) / (n - 1)) : 0;

  // Within subgroup std dev estimate (using MR)
  const movingRanges: number[] = [];
  for (let i = 1; i < values.length; i++) movingRanges.push(Math.abs(values[i] - values[i - 1]));
  const avgMR = movingRanges.length > 0 ? movingRanges.reduce((s, v) => s + v, 0) / movingRanges.length : 0;
  const sigmaWithin = avgMR / 1.128;

  const usl = selected?.usl || 0;
  const lsl = selected?.lsl || 0;
  const hasSpecs = usl > lsl;
  const sufficientData = n >= 25;

  // Capability indices
  const cp = hasSpecs && stdDev > 0 ? (usl - lsl) / (6 * stdDev) : 0;
  const cpk = hasSpecs && stdDev > 0 ? Math.min((usl - mean) / (3 * stdDev), (mean - lsl) / (3 * stdDev)) : 0;
  const pp = hasSpecs && stdDev > 0 ? (usl - lsl) / (6 * stdDev) : 0;
  const ppk = hasSpecs && stdDev > 0 ? Math.min((usl - mean) / (3 * stdDev), (mean - lsl) / (3 * stdDev)) : 0;

  // Histogram data
  const binCount = 15;
  const range = values.length > 0 ? Math.max(...values) - Math.min(...values) : 1;
  const binWidth = range / binCount;
  const histogram = Array.from({ length: binCount }, (_, i) => {
    const binStart = (values.length > 0 ? Math.min(...values) : 0) + i * binWidth;
    const binEnd = binStart + binWidth;
    const count = values.filter(v => v >= binStart && v < binEnd).length;
    return { bin: binStart.toFixed(4), count, binMid: (binStart + binEnd) / 2 };
  });

  const capable = cpk >= cpkThreshold;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Process Capability</h1>
        <p className="text-sm text-gray-500">Cp, Cpk, Pp, Ppk analysis with histogram</p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 mb-4">
        <select
          value={selectedCharId}
          onChange={e => setSelectedCharId(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm min-w-64"
        >
          <option value="">Select Characteristic</option>
          {filteredChars.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500">Cpk Threshold:</label>
          <select
            value={cpkThreshold}
            onChange={e => setCpkThreshold(parseFloat(e.target.value))}
            className="px-2 py-1.5 border border-gray-300 rounded text-sm"
          >
            <option value={1.0}>1.00</option>
            <option value={1.33}>1.33</option>
            <option value={1.67}>1.67</option>
            <option value={2.0}>2.00</option>
          </select>
        </div>
      </div>

      {selected && sufficientData && hasSpecs ? (
        <>
          {/* Capability Results */}
          <div className={`rounded-xl border-2 p-4 mb-4 ${capable ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`font-bold text-lg ${capable ? 'text-green-700' : 'text-red-700'}`}>
                  {capable ? '✓ CAPABLE' : '✗ NOT CAPABLE'}
                </h3>
                <p className="text-sm text-gray-600">Cpk {cpk.toFixed(2)} {capable ? '≥' : '<'} threshold {cpkThreshold}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Requirement</p>
                <p className="font-bold text-lg">Cpk ≥ {cpkThreshold}</p>
              </div>
            </div>
          </div>

          {/* Indices */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-4">
            {[
              { label: 'Cp', value: cp.toFixed(3), desc: 'Potential' },
              { label: 'Cpk', value: cpk.toFixed(3), desc: 'Actual (within)' },
              { label: 'Pp', value: pp.toFixed(3), desc: 'Performance' },
              { label: 'Ppk', value: ppk.toFixed(3), desc: 'Performance (actual)' },
              { label: 'Mean', value: mean.toFixed(4), desc: 'Center' },
              { label: 'Std Dev', value: stdDev.toFixed(4), desc: 'σ within' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-lg border p-3">
                <p className="text-xs text-gray-500">{s.label} <span className="text-gray-400">({s.desc})</span></p>
                <p className="text-lg font-bold font-mono text-gray-800">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Histogram */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Distribution Histogram</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={histogram}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="bin" tick={{ fontSize: 9 }} angle={-30} textAnchor="end" height={50} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <ReferenceLine x={((mean - (values.length > 0 ? Math.min(...values) : 0)) / binWidth).toFixed(0)} stroke="#ef4444" label={{ value: 'Mean', fontSize: 10 }} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[2, 2, 0, 0]} name="Frequency" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-4 mt-2 text-xs">
              <span><span className="inline-block w-3 h-3 bg-blue-500 rounded mr-1"></span>Frequency</span>
              <span className="text-red-500">— USL: {usl.toFixed(4)} | LSL: {lsl.toFixed(4)}</span>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
            <p><strong>Note:</strong> Cp/Cpk use within-subgroup variation (σ̂ = MR̄/d₂). Pp/Ppk use overall standard deviation. Different customers may require different thresholds. Verify requirements before making capability decisions.</p>
          </div>
        </>
      ) : selected && !sufficientData ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
          <i className="fas fa-exclamation-triangle text-2xl text-yellow-500 mb-2"></i>
          <p className="text-sm text-yellow-700 font-medium">Insufficient data for capability calculation</p>
          <p className="text-xs text-yellow-600 mt-1">Minimum 25 samples required. Currently have {n}.</p>
        </div>
      ) : selected && !hasSpecs ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
          <i className="fas fa-info-circle text-2xl text-yellow-500 mb-2"></i>
          <p className="text-sm text-yellow-700 font-medium">No specification limits defined</p>
          <p className="text-xs text-yellow-600 mt-1">USL and LSL are required for capability calculation.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <i className="fas fa-bullseye text-4xl text-gray-300 mb-3"></i>
          <p className="text-gray-500">Select a characteristic to calculate process capability</p>
        </div>
      )}
    </div>
  );
}
