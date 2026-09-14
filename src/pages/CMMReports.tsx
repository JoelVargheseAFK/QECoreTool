import { useState, useRef } from 'react';
import { useApp } from '../store/AppContext';

export default function CMMReports() {
  const { cmmReports, activeProjectId, projects } = useApp();
  const [importProgress, setImportProgress] = useState(0);
  const [isImporting, setIsImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const filteredReports = cmmReports.filter(r =>
    activeProjectId === 'all' ? true : r.projectId === activeProjectId
  );

  const handleBatchImport = () => {
    setIsImporting(true);
    setImportProgress(0);
    const interval = setInterval(() => {
      setImportProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsImporting(false);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const totalMeasurements = filteredReports.reduce((s, r) => s + r.measurementCount, 0);
  const passCount = filteredReports.reduce((s, r) => s + r.measurements.filter(m => m.result === 'PASS').length, 0);
  const failCount = totalMeasurements - passCount;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">CMM Report Library</h1>
          <p className="text-sm text-gray-500">Batch import and manage CMM measurement reports</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => fileRef.current?.click()} className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600">
            <i className="fas fa-file-import mr-2"></i>Import Reports (Batch)
          </button>
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" multiple onChange={handleBatchImport} className="hidden" />
        </div>
      </div>

      {/* Import Progress */}
      {isImporting && (
        <div className="bg-white rounded-lg border border-blue-200 p-4 mb-4">
          <div className="flex items-center gap-3">
            <i className="fas fa-spinner fa-spin text-blue-500"></i>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700">Importing CMM Reports...</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${importProgress}%` }}></div>
              </div>
            </div>
            <span className="text-sm text-gray-500">{importProgress}%</span>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <div className="bg-white rounded-lg border p-3">
          <p className="text-xs text-gray-500">Total Reports</p>
          <p className="text-xl font-bold text-gray-800">{filteredReports.length}</p>
        </div>
        <div className="bg-white rounded-lg border p-3">
          <p className="text-xs text-gray-500">Total Measurements</p>
          <p className="text-xl font-bold text-gray-800">{totalMeasurements.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg border p-3">
          <p className="text-xs text-gray-500">Pass</p>
          <p className="text-xl font-bold text-green-600">{passCount.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg border p-3">
          <p className="text-xs text-gray-500">Fail</p>
          <p className="text-xl font-bold text-red-600">{failCount.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg border p-3">
          <p className="text-xs text-gray-500">Pass Rate</p>
          <p className="text-xl font-bold text-blue-600">{totalMeasurements > 0 ? ((passCount / totalMeasurements) * 100).toFixed(1) : 0}%</p>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-3 border-b bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-700">Report Library</h3>
        </div>
        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                {['File Name', 'Project', 'Part Number', 'Serial', 'Date', 'Time', 'CMM Machine', 'Program', 'Measurements', 'Status'].map(h => (
                  <th key={h} className="px-3 py-2 text-left text-gray-600 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredReports.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 font-medium text-gray-800">
                    <i className="fas fa-file-excel text-green-500 mr-1"></i>{r.fileName}
                  </td>
                  <td className="px-3 py-2 text-gray-700">{projects.find(p => p.id === r.projectId)?.name || r.projectId}</td>
                  <td className="px-3 py-2 text-gray-700">{r.partNumber}</td>
                  <td className="px-3 py-2 text-gray-700">{r.serialNumber}</td>
                  <td className="px-3 py-2 text-gray-700">{r.date}</td>
                  <td className="px-3 py-2 text-gray-700">{r.time}</td>
                  <td className="px-3 py-2 text-gray-700">{r.cmmMachine}</td>
                  <td className="px-3 py-2 text-gray-700">{r.program}</td>
                  <td className="px-3 py-2 text-gray-700">{r.measurementCount}</td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      r.importStatus === 'success' ? 'bg-green-100 text-green-700' :
                      r.importStatus === 'error' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>{r.importStatus}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Measurement Details */}
      <div className="mt-4 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-3 border-b bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-700">Latest Measurements (First Report)</h3>
        </div>
        <div className="overflow-x-auto max-h-64">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                {['Feature', 'Type', 'Nominal', 'Actual', 'Deviation', 'USL', 'LSL', 'Result'].map(h => (
                  <th key={h} className="px-3 py-2 text-left text-gray-600 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredReports[0]?.measurements.slice(0, 20).map(m => (
                <tr key={m.id} className={`hover:bg-gray-50 ${m.result === 'FAIL' ? 'bg-red-50' : ''}`}>
                  <td className="px-3 py-2 font-medium text-gray-800">{m.characteristicName}</td>
                  <td className="px-3 py-2 text-gray-600">{m.featureType}</td>
                  <td className="px-3 py-2 font-mono">{m.nominalValue.toFixed(4)}</td>
                  <td className="px-3 py-2 font-mono">{m.actualValue.toFixed(4)}</td>
                  <td className={`px-3 py-2 font-mono font-bold ${m.result === 'FAIL' ? 'text-red-600' : 'text-gray-700'}`}>
                    {m.deviation > 0 ? '+' : ''}{m.deviation.toFixed(4)}
                  </td>
                  <td className="px-3 py-2 font-mono text-gray-500">{m.usl.toFixed(4)}</td>
                  <td className="px-3 py-2 font-mono text-gray-500">{m.lsl.toFixed(4)}</td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      m.result === 'PASS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>{m.result}</span>
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
