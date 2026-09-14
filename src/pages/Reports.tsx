import { useState } from 'react';
import { useApp } from '../store/AppContext';

export default function Reports() {
  const { projects, activeProjectId, getFilteredProduction, getFilteredCMMMeasurements } = useApp();
  const [reportType, setReportType] = useState('comprehensive');
  const [dateFrom, setDateFrom] = useState('2026-01-01');
  const [dateTo, setDateTo] = useState('2026-01-31');
  const [includeSections, setIncludeSections] = useState({
    production: true,
    cmm: true,
    dimensional: true,
    spc: true,
    capability: true,
    defects: true,
    scrap: true,
    cost: true,
  });

  const project = projects.find(p => p.id === activeProjectId);
  const prod = getFilteredProduction();
  const cmm = getFilteredCMMMeasurements();

  const totalProd = prod.reduce((s, r) => s + r.productionQty, 0);
  const totalScrap = prod.reduce((s, r) => s + r.scrapQty, 0);
  const totalDefects = prod.reduce((s, r) => s + r.defectQty, 0);
  const scrapRate = totalProd > 0 ? ((totalScrap / totalProd) * 100).toFixed(2) : '0';
  const ppm = totalProd > 0 ? ((totalDefects / totalProd) * 1000000).toFixed(0) : '0';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">QE Reports</h1>
        <p className="text-sm text-gray-500">Generate comprehensive quality reports</p>
      </div>

      {/* Report Configuration */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h3 className="text-lg font-semibold mb-4">Report Configuration</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
            <select className="w-full px-3 py-2 border rounded">
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
            <select value={reportType} onChange={e => setReportType(e.target.value)} className="w-full px-3 py-2 border rounded">
              <option value="comprehensive">Comprehensive</option>
              <option value="production">Production Only</option>
              <option value="cmm">CMM Only</option>
              <option value="capability">Capability</option>
              <option value="defects">Defects</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-full px-3 py-2 border rounded" />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Include Sections</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Object.entries(includeSections).map(([key, value]) => (
              <label key={key} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={e => setIncludeSections({ ...includeSections, [key]: e.target.checked })}
                  className="rounded"
                />
                <span className="capitalize">{key.replace('-', ' ')}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={handlePrint} className="px-4 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600">
            <i className="fas fa-print mr-2"></i>Print Report
          </button>
          <button className="px-4 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600">
            <i className="fas fa-file-pdf mr-2"></i>Export PDF
          </button>
        </div>
      </div>

      {/* Report Preview */}
      <div className="bg-white rounded-lg shadow p-6" id="report-content">
        <div className="border-b pb-4 mb-4">
          <h2 className="text-xl font-bold text-gray-800">Quality Engineering Report</h2>
          <div className="grid grid-cols-2 gap-4 mt-2 text-sm text-gray-600">
            <div>
              <p><strong>Project:</strong> {project?.name || 'N/A'}</p>
              <p><strong>Part Number:</strong> {project?.partNumber || 'N/A'}</p>
              <p><strong>Customer:</strong> {project?.customer || 'N/A'}</p>
            </div>
            <div>
              <p><strong>Report Date:</strong> {new Date().toLocaleDateString()}</p>
              <p><strong>Period:</strong> {dateFrom} to {dateTo}</p>
              <p><strong>Generated By:</strong> QE System</p>
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Executive Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-xs text-gray-500">Production</div>
              <div className="text-xl font-bold">{totalProd.toLocaleString()}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-xs text-gray-500">Scrap Rate</div>
              <div className="text-xl font-bold text-red-600">{scrapRate}%</div>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-xs text-gray-500">PPM</div>
              <div className="text-xl font-bold text-orange-600">{ppm}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-xs text-gray-500">CMM Reports</div>
              <div className="text-xl font-bold text-blue-600">{project?.cmmReportCount || 0}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-xs text-gray-500">Characteristics</div>
              <div className="text-xl font-bold text-purple-600">{project?.characteristicCount || 0}</div>
            </div>
          </div>
        </div>

        {/* Sections */}
        {includeSections.production && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Production Summary</h3>
            <div className="text-sm space-y-1">
              <p>Total Production: {totalProd.toLocaleString()} units</p>
              <p>Total Scrap: {totalScrap.toLocaleString()} units</p>
              <p>Total Defects: {totalDefects.toLocaleString()}</p>
              <p>Scrap Rate: {scrapRate}%</p>
            </div>
          </div>
        )}

        {includeSections.cmm && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">CMM Measurement Summary</h3>
            <div className="text-sm space-y-1">
              <p>Total Measurements: {cmm.length.toLocaleString()}</p>
              <p>Pass: {cmm.filter(m => m.result === 'PASS').length.toLocaleString()}</p>
              <p>Fail: {cmm.filter(m => m.result === 'FAIL').length.toLocaleString()}</p>
              <p>Pass Rate: {cmm.length > 0 ? ((cmm.filter(m => m.result === 'PASS').length / cmm.length) * 100).toFixed(1) : 0}%</p>
            </div>
          </div>
        )}

        <div className="border-t pt-4 mt-6 text-xs text-gray-500">
          <p>Report generated by Automotive QE Quality & CMM Analytics</p>
          <p>Generated: {new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
