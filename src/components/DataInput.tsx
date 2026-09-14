import { useRef, useState } from 'react';
import { CMMMeasurement } from '../types';
import { parseCSVData, generateSampleData } from '../utils/analysis';

interface DataInputProps {
  onDataLoaded: (data: CMMMeasurement[], reportInfo: { partName: string; partNumber: string; date: string; operator: string }) => void;
}

export default function DataInput({ onDataLoaded }: DataInputProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');
  const [partName, setPartName] = useState('Bracket Assembly');
  const [partNumber, setPartNumber] = useState('BA-2024-001');
  const [operator, setOperator] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const measurements = parseCSVData(text);
        if (measurements.length === 0) {
          setError('No valid data found in CSV. Check format.');
          return;
        }
        setError('');
        onDataLoaded(measurements, {
          partName,
          partNumber,
          date: new Date().toISOString().split('T')[0],
          operator,
        });
      } catch {
        setError('Error parsing CSV file. Please check format.');
      }
    };
    reader.readAsText(file);
  };

  const handleSampleData = () => {
    const sampleData = generateSampleData();
    onDataLoaded(sampleData, {
      partName: 'Bracket Assembly (Sample)',
      partNumber: 'BA-SAMPLE-001',
      date: new Date().toISOString().split('T')[0],
      operator: 'Demo Operator',
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <i className="fas fa-file-upload text-blue-500"></i>
        Load CMM Report Data
      </h2>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Report Info */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-600">Report Information</h3>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Part Name</label>
            <input
              type="text"
              value={partName}
              onChange={(e) => setPartName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter part name"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Part Number</label>
            <input
              type="text"
              value={partNumber}
              onChange={(e) => setPartNumber(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter part number"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Operator</label>
            <input
              type="text"
              value={operator}
              onChange={(e) => setOperator(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter operator name"
            />
          </div>
        </div>

        {/* Upload Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-600">Upload Data</h3>
          
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
          >
            <i className="fas fa-cloud-upload-alt text-3xl text-gray-400 mb-2"></i>
            <p className="text-sm text-gray-600">Click to upload CSV file</p>
            <p className="text-xs text-gray-400 mt-1">Format: Feature, Type, Axis, Nominal, Measured, +Tol, -Tol, Unit</p>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-xs text-gray-400">OR</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          <button
            onClick={handleSampleData}
            className="w-full py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-indigo-700 transition-all shadow-sm"
          >
            <i className="fas fa-flask mr-2"></i>
            Load Sample CMM Data
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <i className="fas fa-exclamation-circle mr-2"></i>
          {error}
        </div>
      )}

      {/* CSV Format Help */}
      <details className="mt-4">
        <summary className="text-sm text-blue-600 cursor-pointer hover:text-blue-700">
          <i className="fas fa-info-circle mr-1"></i> CSV Format Reference
        </summary>
        <div className="mt-2 p-3 bg-gray-50 rounded-lg text-xs font-mono text-gray-600 overflow-x-auto">
          <p className="mb-1">Feature Name, Type, Axis, Nominal, Measured, +Tolerance, -Tolerance, Unit</p>
          <p className="text-gray-400">Types: position, flatness, roundness, cylindricity, diameter, distance, angle, profile, concentricity</p>
          <p className="text-gray-400">Axis: X, Y, Z (for position measurements)</p>
          <p className="mt-2 text-gray-500">Example:</p>
          <p>Hole A - Position, position, X, 25.000, 25.085, 0.05, -0.05, mm</p>
          <p>Hole B - Diameter, diameter, , 10.000, 10.068, 0.05, -0.05, mm</p>
        </div>
      </details>
    </div>
  );
}
