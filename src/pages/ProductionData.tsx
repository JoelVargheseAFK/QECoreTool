import { useState, useRef } from 'react';
import { useApp } from '../store/AppContext';
import Papa from 'papaparse';

export default function ProductionData() {
  const { getFilteredProduction, activeProjectId } = useApp();
  const [preview, setPreview] = useState<any[][]>([]);
  const [fileName, setFileName] = useState('');
  const [importStatus, setImportStatus] = useState('');
  const [showMapping, setShowMapping] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const prod = getFilteredProduction();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setImportStatus('Processing...');

    Papa.parse(file, {
      complete: (result) => {
        const data = result.data as any[][];
        setPreview(data.slice(0, 20));
        setImportStatus(`Loaded ${data.length - 1} rows, ${data[0]?.length || 0} columns`);
        setShowMapping(true);
      },
      error: () => setImportStatus('Error parsing file'),
    });
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Production Data</h1>
          <p className="text-sm text-gray-500">Import and manage production records</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => fileRef.current?.click()} className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600">
            <i className="fas fa-upload mr-2"></i>Upload CSV/XLSX
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">
            <i className="fas fa-undo mr-2"></i>Return to Sample
          </button>
          <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleFileUpload} className="hidden" />
        </div>
      </div>

      {/* Import Status */}
      {fileName && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <div className="flex items-center gap-3">
            <i className="fas fa-file-excel text-green-500 text-xl"></i>
            <div className="flex-1">
              <p className="font-medium text-sm text-gray-800">{fileName}</p>
              <p className="text-xs text-gray-500">{importStatus}</p>
            </div>
            <button onClick={() => { setFileName(''); setPreview([]); setShowMapping(false); }} className="text-gray-400 hover:text-gray-600">
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
      )}

      {/* Data Preview */}
      {showMapping && preview.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-4">
          <div className="p-3 border-b bg-gray-50 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">Data Preview</h3>
            <button onClick={() => setShowMapping(false)} className="text-xs text-blue-600 hover:text-blue-700">
              Close Preview
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50">
                <tr>
                  {preview[0]?.map((col, i) => (
                    <th key={i} className="px-3 py-2 text-left text-gray-600 font-medium">{String(col)}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {preview.slice(1, 6).map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td key={j} className="px-3 py-2 text-gray-700">{String(cell || '')}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Production Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-3 border-b bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-700">Production Records ({prod.length})</h3>
        </div>
        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                {['Date', 'Part', 'Lot', 'Prod Qty', 'Insp Qty', 'Defects', 'Scrap', 'Rework', 'Defect Type', 'Machine', 'Shift'].map(h => (
                  <th key={h} className="px-3 py-2 text-left text-gray-600 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {prod.slice(0, 50).map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 text-gray-700">{r.date}</td>
                  <td className="px-3 py-2 text-gray-700">{r.partNumber}</td>
                  <td className="px-3 py-2 text-gray-700">{r.lot}</td>
                  <td className="px-3 py-2 text-gray-700">{r.productionQty}</td>
                  <td className="px-3 py-2 text-gray-700">{r.inspectionQty}</td>
                  <td className="px-3 py-2 text-red-600 font-medium">{r.defectQty}</td>
                  <td className="px-3 py-2 text-red-600 font-medium">{r.scrapQty}</td>
                  <td className="px-3 py-2 text-yellow-600">{r.reworkQty}</td>
                  <td className="px-3 py-2 text-gray-700">{r.defectType}</td>
                  <td className="px-3 py-2 text-gray-700">{r.machine}</td>
                  <td className="px-3 py-2 text-gray-700">{r.shift}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
