import { useState } from 'react';
import { ColumnMapping } from '../types';

const standardFields = [
  'Date', 'Time', 'Project', 'Part Number', 'Serial Number', 'Lot',
  'Production Quantity', 'Inspection Quantity', 'Defect Quantity', 'Scrap Quantity',
  'Rework Quantity', 'Defect Type', 'Machine', 'Line', 'Process', 'Station',
  'Shift', 'Operator', 'Fixture ID', 'Gauge ID', 'Tool ID', 'Supplier',
  'Cycle Time', 'Scrap Cost Per Part', 'Rework Cost Per Part',
  'Characteristic Name', 'Measurement', 'USL', 'LSL', 'Nominal', 'Actual',
];

const sourceColumns = ['Part No', 'Machine No.', 'Scrap Qty', 'Characteristic Name', 'Actual', 'Upper Tol', 'Lower Tol', 'Date', 'Shift', 'Operator'];

export default function DataMapping() {
  const [mappings, setMappings] = useState<ColumnMapping[]>(
    sourceColumns.map(col => ({
      sourceColumn: col,
      standardField: '',
      dataType: 'text' as const,
      required: false,
    }))
  );

  const autoMap = () => {
    const autoMappings: Record<string, string> = {
      'Part No': 'Part Number',
      'Machine No.': 'Machine',
      'Scrap Qty': 'Scrap Quantity',
      'Characteristic Name': 'Characteristic Name',
      'Actual': 'Measurement',
      'Upper Tol': 'USL',
      'Lower Tol': 'LSL',
      'Date': 'Date',
      'Shift': 'Shift',
      'Operator': 'Operator',
    };
    setMappings(prev => prev.map(m => ({
      ...m,
      standardField: autoMappings[m.sourceColumn] || '',
      dataType: (['Scrap Quantity', 'USL', 'LSL', 'Measurement'].includes(autoMappings[m.sourceColumn] || '')) ? 'number' : 'text',
    })));
  };

  const resetMappings = () => {
    setMappings(prev => prev.map(m => ({ ...m, standardField: '', dataType: 'text' })));
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Data Mapping</h1>
          <p className="text-sm text-gray-500">Map source columns to standard fields</p>
        </div>
        <div className="flex gap-2">
          <button onClick={autoMap} className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600">
            <i className="fas fa-magic mr-2"></i>Auto Map
          </button>
          <button onClick={resetMappings} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">
            <i className="fas fa-undo mr-2"></i>Reset
          </button>
          <button className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600">
            <i className="fas fa-save mr-2"></i>Save Mapping
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-3 border-b bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-700">Column Mapping Configuration</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Source Column</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Standard Field</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Data Type</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-600">Required</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Validation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mappings.map((m, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{m.sourceColumn}</td>
                  <td className="px-4 py-3">
                    <select
                      value={m.standardField}
                      onChange={e => {
                        const newMappings = [...mappings];
                        newMappings[i].standardField = e.target.value;
                        newMappings[i].dataType = ['USL', 'LSL', 'Measurement', 'Scrap Quantity', 'Production Quantity'].includes(e.target.value) ? 'number' : 'text';
                        setMappings(newMappings);
                      }}
                      className="px-2 py-1 border border-gray-300 rounded text-xs"
                    >
                      <option value="">-- Select --</option>
                      {standardFields.map(f => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      m.dataType === 'number' ? 'bg-blue-100 text-blue-700' :
                      m.dataType === 'date' ? 'bg-purple-100 text-purple-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>{m.dataType}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={m.required}
                      onChange={e => {
                        const newMappings = [...mappings];
                        newMappings[i].required = e.target.checked;
                        setMappings(newMappings);
                      }}
                      className="rounded"
                    />
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {m.standardField ? '✓ Valid' : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-800 mb-2">
          <i className="fas fa-info-circle mr-1"></i> Mapping Guidelines
        </h4>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• Use Auto Map for common column names</li>
          <li>• Validate dates, numbers, and required fields before applying</li>
          <li>• Saved mappings can be reused for future imports</li>
          <li>• Check for duplicates and invalid specifications</li>
        </ul>
      </div>
    </div>
  );
}
