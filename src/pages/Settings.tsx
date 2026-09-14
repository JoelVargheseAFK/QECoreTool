import React, { useRef } from 'react';
import { useApp } from '../store/AppContext';
import { getStorageSize } from '../utils/storage';

export default function Settings() {
  const { exportAllData, importData, clearAllData, lastSaved } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      try {
        const success = importData(content);
        if (success) {
          alert('Data imported successfully! The page will reload.');
        } else {
          alert('Failed to import data. Please check the file format.');
        }
      } catch (error) {
        alert('Error importing data: ' + (error as Error).message);
      }
    };
    reader.readAsText(file);
  };

  const handleExport = () => {
    exportAllData();
  };

  const handleClear = () => {
    clearAllData();
  };

  const storageSize = getStorageSize();
  const lastSavedFormatted = lastSaved ? new Date(lastSaved).toLocaleString() : 'Never';

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        <p className="text-sm text-gray-500">Manage your data and application settings</p>
      </div>

      {/* Data Management Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <i className="fas fa-database text-blue-500"></i>
          Data Management
        </h2>

        <div className="space-y-4">
          {/* Storage Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Storage Used</span>
              <span className="text-sm font-bold text-gray-900">{storageSize}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Last Saved</span>
              <span className="text-sm text-gray-600">{lastSavedFormatted}</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              <i className="fas fa-info-circle mr-1"></i>
              All data is automatically saved to your browser's local storage
            </p>
          </div>

          {/* Export Button */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Export Data</h3>
            <p className="text-xs text-gray-500 mb-3">
              Download all your data as a JSON backup file. You can use this to restore your data later or transfer it to another device.
            </p>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <i className="fas fa-download"></i>
              Export All Data
            </button>
          </div>

          {/* Import Button */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Import Data</h3>
            <p className="text-xs text-gray-500 mb-3">
              Restore data from a previously exported JSON backup file. This will replace all current data.
            </p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImport}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
            >
              <i className="fas fa-upload"></i>
              Import Data from File
            </button>
          </div>

          {/* Clear Data Button */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Clear All Data</h3>
            <p className="text-xs text-gray-500 mb-3">
              Reset the application to sample data. This will permanently delete all your saved data and cannot be undone.
            </p>
            <button
              onClick={handleClear}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
            >
              <i className="fas fa-trash"></i>
              Clear All Data
            </button>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <i className="fas fa-info-circle text-blue-500"></i>
          About
        </h2>

        <div className="space-y-3 text-sm text-gray-600">
          <div>
            <p className="font-medium text-gray-800">Automotive QE Quality & CMM Analytics</p>
            <p className="text-xs text-gray-500">Version 1.0.0</p>
          </div>

          <div className="border-t pt-3">
            <p className="font-medium text-gray-800 mb-2">Features:</p>
            <ul className="list-disc list-inside space-y-1 text-xs text-gray-600">
              <li>Multi-project management with customizable characteristics</li>
              <li>CMM report import and analysis (CSV, Excel, Control View format)</li>
              <li>Statistical Process Control (SPC) with control charts</li>
              <li>Process capability analysis (Cp, Cpk, Pp, Ppk)</li>
              <li>Feature movement tracking with coordinate visualization</li>
              <li>Defect Pareto analysis and root cause investigation</li>
              <li>Scrap and cost tracking with trend analysis</li>
              <li>Incoming, in-process, and final inspection management</li>
              <li>Fixtures and gauges calibration tracking</li>
              <li>MSA/GR&R studies for measurement system analysis</li>
              <li>PFMEA and Control Plan documentation</li>
              <li>8D corrective action management</li>
              <li>QE Knowledge Matrix for competency tracking</li>
              <li>Local data persistence with export/import backup</li>
            </ul>
          </div>

          <div className="border-t pt-3">
            <p className="font-medium text-gray-800 mb-2">Data Storage:</p>
            <p className="text-xs text-gray-600">
              All data is stored locally in your browser using localStorage. No data is sent to external servers.
              Use the Export feature to create backups and Import to restore data.
            </p>
          </div>

          <div className="border-t pt-3">
            <p className="font-medium text-gray-800 mb-2">Browser Compatibility:</p>
            <p className="text-xs text-gray-600">
              This application works best in modern browsers (Chrome, Firefox, Edge, Safari).
              Data is stored per-browser and per-device. Clearing browser data will reset the application.
            </p>
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <h3 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <i className="fas fa-lightbulb"></i>
          Tips
        </h3>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Export your data regularly to create backups</li>
          <li>• Use Import to restore data after clearing browser cache</li>
          <li>• Data is automatically saved whenever you make changes</li>
          <li>• Each browser has its own localStorage, so data won't sync across devices</li>
          <li>• If you see "Last Saved: Never", it means no changes have been made yet</li>
        </ul>
      </div>
    </div>
  );
}
