import { useState } from 'react';
import { useApp } from '../store/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Correlation() {
  const { getFilteredProduction, getFilteredCMMMeasurements, characteristics } = useApp();
  const [investigationFeature, setInvestigationFeature] = useState('');
  const prod = getFilteredProduction();
  const cmm = getFilteredCMMMeasurements();

  const features = Array.from(new Set(characteristics.map(c => c.name))).slice(0, 30);
  const selectedChar = characteristics.find(c => c.name === investigationFeature);
  const failMeasurements = selectedChar?.measurementHistory.filter(m => m.result === 'FAIL') || [];

  // Correlation analysis
  const machineAnalysis = new Map<string, { total: number; fails: number }>();
  const shiftAnalysis = new Map<string, { total: number; fails: number }>();
  const processAnalysis = new Map<string, { total: number; fails: number }>();
  const lotAnalysis = new Map<string, { total: number; fails: number }>();

  // Analyze by matching dates
  failMeasurements.forEach(m => {
    const matchingProd = prod.filter(p => p.date === m.date);
    matchingProd.forEach(p => {
      const me = machineAnalysis.get(p.machine) || { total: 0, fails: 0 };
      me.total++; me.fails++;
      machineAnalysis.set(p.machine, me);

      const se = shiftAnalysis.get(p.shift) || { total: 0, fails: 0 };
      se.total++; se.fails++;
      shiftAnalysis.set(p.shift, se);

      const pe = processAnalysis.get(p.process) || { total: 0, fails: 0 };
      pe.total++; pe.fails++;
      processAnalysis.set(p.process, pe);

      const le = lotAnalysis.get(p.lot) || { total: 0, fails: 0 };
      le.total++; le.fails++;
      lotAnalysis.set(p.lot, le);
    });
  });

  // Also add non-fail counts
  const allMeasurements = selectedChar?.measurementHistory || [];
  allMeasurements.filter(m => m.result === 'PASS').forEach(m => {
    const matchingProd = prod.filter(p => p.date === m.date);
    matchingProd.forEach(p => {
      const me = machineAnalysis.get(p.machine) || { total: 0, fails: 0 };
      me.total++;
      machineAnalysis.set(p.machine, me);

      const se = shiftAnalysis.get(p.shift) || { total: 0, fails: 0 };
      se.total++;
      shiftAnalysis.set(p.shift, se);

      const pe = processAnalysis.get(p.process) || { total: 0, fails: 0 };
      pe.total++;
      processAnalysis.set(p.process, pe);
    });
  });

  const machineData = Array.from(machineAnalysis.entries())
    .map(([name, d]) => ({ name, total: d.total, fails: d.fails, failRate: d.total > 0 ? (d.fails / d.total * 100).toFixed(1) : '0' }))
    .sort((a, b) => parseFloat(b.failRate) - parseFloat(a.failRate));

  const shiftData = Array.from(shiftAnalysis.entries())
    .map(([name, d]) => ({ name, total: d.total, fails: d.fails, failRate: d.total > 0 ? (d.fails / d.total * 100).toFixed(1) : '0' }));

  const processData = Array.from(processAnalysis.entries())
    .map(([name, d]) => ({ name, total: d.total, fails: d.fails, failRate: d.total > 0 ? (d.fails / d.total * 100).toFixed(1) : '0' }))
    .sort((a, b) => parseFloat(b.failRate) - parseFloat(a.failRate));

  // Find strongest association
  const maxMachineFailRate = machineData.length > 0 ? Math.max(...machineData.map(d => parseFloat(d.failRate))) : 0;
  const maxShiftFailRate = shiftData.length > 0 ? Math.max(...shiftData.map(d => parseFloat(d.failRate))) : 0;
  const maxProcessFailRate = processData.length > 0 ? Math.max(...processData.map(d => parseFloat(d.failRate))) : 0;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Production-CMM Correlation</h1>
        <p className="text-sm text-gray-500">Investigate patterns and potential contributors — correlation ≠ causation</p>
      </div>

      {/* Investigation Input */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">
          <i className="fas fa-search mr-1"></i> Start Investigation
        </h3>
        <div className="flex flex-wrap gap-3">
          <select
            value={investigationFeature}
            onChange={e => setInvestigationFeature(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm min-w-64"
          >
            <option value="">Select feature to investigate (e.g., "Why is Hole #37 failing?")</option>
            {features.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
      </div>

      {investigationFeature && selectedChar ? (
        <>
          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
            <div className="bg-white rounded-lg border p-3">
              <p className="text-xs text-gray-500">Total Measurements</p>
              <p className="text-xl font-bold">{allMeasurements.length}</p>
            </div>
            <div className="bg-white rounded-lg border p-3">
              <p className="text-xs text-gray-500">Failures</p>
              <p className="text-xl font-bold text-red-600">{failMeasurements.length}</p>
            </div>
            <div className="bg-white rounded-lg border p-3">
              <p className="text-xs text-gray-500">Fail Rate</p>
              <p className="text-xl font-bold text-orange-600">
                {allMeasurements.length > 0 ? (failMeasurements.length / allMeasurements.length * 100).toFixed(1) : 0}%
              </p>
            </div>
            <div className="bg-white rounded-lg border p-3">
              <p className="text-xs text-gray-500">Feature Type</p>
              <p className="text-sm font-bold">{selectedChar.featureType}</p>
            </div>
            <div className="bg-white rounded-lg border p-3">
              <p className="text-xs text-gray-500">Part</p>
              <p className="text-sm font-bold">{selectedChar.partNumber}</p>
            </div>
          </div>

          {/* Association Analysis */}
          <div className="grid lg:grid-cols-3 gap-4 mb-4">
            {/* By Machine */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Failure Rate by Machine</h3>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={machineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                    <YAxis tick={{ fontSize: 10 }} unit="%" />
                    <Tooltip />
                    <Bar dataKey="failRate" fill="#ef4444" radius={[4, 4, 0, 0]} name="Fail Rate %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {machineData.length > 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  Highest: <strong>{machineData[0].name}</strong> at {machineData[0].failRate}%
                </p>
              )}
            </div>

            {/* By Shift */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Failure Rate by Shift</h3>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={shiftData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} unit="%" />
                    <Tooltip />
                    <Bar dataKey="failRate" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Fail Rate %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* By Process */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Failure Rate by Process</h3>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={processData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                    <YAxis tick={{ fontSize: 10 }} unit="%" />
                    <Tooltip />
                    <Bar dataKey="failRate" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Fail Rate %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Investigation Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              <i className="fas fa-clipboard-list mr-1"></i> Investigation Summary
            </h3>
            <div className="space-y-2 text-sm">
              {maxMachineFailRate > 5 && (
                <div className="flex items-start gap-2 p-2 bg-red-50 rounded">
                  <i className="fas fa-exclamation-triangle text-red-500 mt-0.5"></i>
                  <div>
                    <strong className="text-red-700">Potential contributor:</strong>
                    <span className="text-gray-700"> Machine <strong>{machineData[0]?.name}</strong> shows a strong association with failures ({machineData[0]?.failRate}% fail rate).</span>
                    <span className="text-gray-500 text-xs ml-1">Pattern requiring investigation.</span>
                  </div>
                </div>
              )}
              {maxShiftFailRate > 5 && (
                <div className="flex items-start gap-2 p-2 bg-yellow-50 rounded">
                  <i className="fas fa-info-circle text-yellow-500 mt-0.5"></i>
                  <div>
                    <strong className="text-yellow-700">Pattern observed:</strong>
                    <span className="text-gray-700"> Shift analysis shows variation. Highest fail rate on <strong>{shiftData.sort((a, b) => parseFloat(b.failRate) - parseFloat(a.failRate))[0]?.name}</strong> shift.</span>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-2 p-2 bg-blue-50 rounded">
                <i className="fas fa-info-circle text-blue-500 mt-0.5"></i>
                <div>
                  <strong className="text-blue-700">Note:</strong>
                  <span className="text-gray-700"> These associations suggest patterns requiring investigation. Correlation does not prove causation. Confirm with physical evidence before concluding root cause.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Failure Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-3 border-b bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-700">Failed Measurements Detail</h3>
            </div>
            <div className="overflow-x-auto max-h-64">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    {['Date', 'Source File', 'Actual', 'Deviation', 'USL', 'LSL'].map(h => (
                      <th key={h} className="px-3 py-2 text-left text-gray-600 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {failMeasurements.map(m => (
                    <tr key={m.id} className="bg-red-50 hover:bg-red-100">
                      <td className="px-3 py-2">{m.date}</td>
                      <td className="px-3 py-2 text-gray-500">{m.sourceFile}</td>
                      <td className="px-3 py-2 font-mono">{m.actualValue.toFixed(4)}</td>
                      <td className="px-3 py-2 font-mono text-red-600">{m.deviation > 0 ? '+' : ''}{m.deviation.toFixed(4)}</td>
                      <td className="px-3 py-2 font-mono">{m.usl.toFixed(4)}</td>
                      <td className="px-3 py-2 font-mono">{m.lsl.toFixed(4)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <i className="fas fa-link text-4xl text-gray-300 mb-3"></i>
          <p className="text-gray-500">Select a feature to begin correlation investigation</p>
          <p className="text-xs text-gray-400 mt-1">Example: "Find why Hole #37 is failing"</p>
        </div>
      )}
    </div>
  );
}
