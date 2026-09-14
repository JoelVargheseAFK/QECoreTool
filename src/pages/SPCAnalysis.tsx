import { useState } from 'react';
import { useApp } from '../store/AppContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function SPCAnalysis() {
  const { characteristics, activeProjectId } = useApp();
  const [selectedCharId, setSelectedCharId] = useState('');
  const [chartType, setChartType] = useState<'I-MR' | 'Xbar-R'>('I-MR');

  const filteredChars = characteristics.filter(c =>
    activeProjectId === 'all' ? true : c.projectId === activeProjectId
  );

  const selected = characteristics.find(c => c.id === selectedCharId);
  const values = selected?.measurementHistory.map(m => m.actualValue) || [];

  // Calculate SPC parameters
  const n = values.length;
  const mean = n > 0 ? values.reduce((s, v) => s + v, 0) / n : 0;
  const stdDev = n > 1 ? Math.sqrt(values.reduce((s, v) => s + (v - mean) ** 2, 0) / (n - 1)) : 0;

  // Moving Range
  const movingRanges: number[] = [];
  for (let i = 1; i < values.length; i++) {
    movingRanges.push(Math.abs(values[i] - values[i - 1]));
  }
  const avgMR = movingRanges.length > 0 ? movingRanges.reduce((s, v) => s + v, 0) / movingRanges.length : 0;
  const d2 = 1.128; // For n=2 (individuals chart)
  const sigmaEstimate = avgMR / d2;

  // Control Limits (I chart)
  const ucl = mean + 3 * sigmaEstimate;
  const lcl = mean - 3 * sigmaEstimate;

  // MR chart limits
  const mrUcl = 3.267 * avgMR; // D4 for n=2

  // Detect violations
  const violations: { index: number; type: string }[] = [];
  values.forEach((v, i) => {
    if (v > ucl || v < lcl) violations.push({ index: i, type: 'Out of control limits' });
  });
  // Run of 7
  for (let i = 6; i < values.length; i++) {
    const run = values.slice(i - 6, i + 1);
    if (run.every(v => v > mean) || run.every(v => v < mean)) {
      violations.push({ index: i, type: 'Run of 7 on one side' });
    }
  }

  const chartData = values.map((v, i) => ({
    index: i + 1,
    value: v,
    usl: selected?.usl,
    lsl: selected?.lsl,
  }));

  const mrChartData = movingRanges.map((mr, i) => ({
    index: i + 2,
    mr,
    ucl: mrUcl,
  }));

  const sufficientData = n >= 15;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Statistical Process Control</h1>
        <p className="text-sm text-gray-500">I-MR and X-bar/R charts with control limit analysis</p>
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
        <div className="flex bg-gray-100 rounded-lg p-0.5">
          <button
            onClick={() => setChartType('I-MR')}
            className={`px-3 py-1.5 text-xs rounded-md ${chartType === 'I-MR' ? 'bg-white shadow text-blue-600 font-medium' : 'text-gray-600'}`}
          >I-MR</button>
          <button
            onClick={() => setChartType('Xbar-R')}
            className={`px-3 py-1.5 text-xs rounded-md ${chartType === 'Xbar-R' ? 'bg-white shadow text-blue-600 font-medium' : 'text-gray-600'}`}
          >X-bar/R</button>
        </div>
      </div>

      {selected && sufficientData ? (
        <>
          {/* SPC Parameters */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
            <div className="bg-white rounded-lg border p-3">
              <p className="text-xs text-gray-500">Sample Size</p>
              <p className="text-lg font-bold">{n}</p>
            </div>
            <div className="bg-white rounded-lg border p-3">
              <p className="text-xs text-gray-500">Center Line (X̄)</p>
              <p className="text-lg font-bold font-mono">{mean.toFixed(4)}</p>
            </div>
            <div className="bg-white rounded-lg border p-3">
              <p className="text-xs text-gray-500">UCL</p>
              <p className="text-lg font-bold font-mono text-red-600">{ucl.toFixed(4)}</p>
            </div>
            <div className="bg-white rounded-lg border p-3">
              <p className="text-xs text-gray-500">LCL</p>
              <p className="text-lg font-bold font-mono text-red-600">{lcl.toFixed(4)}</p>
            </div>
            <div className="bg-white rounded-lg border p-3">
              <p className="text-xs text-gray-500">σ Estimate</p>
              <p className="text-lg font-bold font-mono">{sigmaEstimate.toFixed(4)}</p>
            </div>
          </div>

          {/* Spec Limits Note */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-xs text-blue-700">
            <i className="fas fa-info-circle mr-1"></i>
            <strong>USL/LSL</strong> = Specification Limits (customer requirement) · <strong>UCL/LCL</strong> = Control Limits (process behavior)
          </div>

          {/* Individuals Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Individuals Chart (I)</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="index" tick={{ fontSize: 10 }} />
                  <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <ReferenceLine y={mean} stroke="#10b981" strokeWidth={2} label={{ value: 'CL', fontSize: 10 }} />
                  <ReferenceLine y={ucl} stroke="#ef4444" strokeDasharray="5 5" label={{ value: 'UCL', fontSize: 10 }} />
                  <ReferenceLine y={lcl} stroke="#ef4444" strokeDasharray="5 5" label={{ value: 'LCL', fontSize: 10 }} />
                  {selected.usl && <ReferenceLine y={selected.usl} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'USL', fontSize: 10 }} />}
                  {selected.lsl && <ReferenceLine y={selected.lsl} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'LSL', fontSize: 10 }} />}
                  <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={1.5} dot={{ r: 3 }} name="Measurement" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Moving Range Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Moving Range Chart (MR)</h3>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mrChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="index" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <ReferenceLine y={avgMR} stroke="#10b981" label={{ value: 'MR̄', fontSize: 10 }} />
                  <ReferenceLine y={mrUcl} stroke="#ef4444" strokeDasharray="5 5" label={{ value: 'UCL', fontSize: 10 }} />
                  <Line type="monotone" dataKey="mr" stroke="#8b5cf6" strokeWidth={1.5} dot={{ r: 2 }} name="MR" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Violations */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Flagged Observations</h3>
            {violations.length > 0 ? (
              <div className="space-y-2">
                {violations.map((v, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-red-50 rounded text-sm">
                    <i className="fas fa-exclamation-circle text-red-500"></i>
                    <span className="font-medium">Sample #{v.index + 1}</span>
                    <span className="text-gray-600">— {v.type}</span>
                    <span className="font-mono text-xs text-gray-500 ml-auto">Value: {values[v.index]?.toFixed(4)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-green-600"><i className="fas fa-check-circle mr-1"></i>No SPC violations detected. Process appears in statistical control.</p>
            )}
          </div>
        </>
      ) : selected && !sufficientData ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
          <i className="fas fa-exclamation-triangle text-2xl text-yellow-500 mb-2"></i>
          <p className="text-sm text-yellow-700 font-medium">Insufficient data for SPC calculation</p>
          <p className="text-xs text-yellow-600 mt-1">Minimum 15 samples required. Currently have {n}.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <i className="fas fa-chart-line text-4xl text-gray-300 mb-3"></i>
          <p className="text-gray-500">Select a characteristic to generate SPC charts</p>
        </div>
      )}
    </div>
  );
}
