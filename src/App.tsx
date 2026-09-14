import { useState } from 'react';
import { CMMMeasurement, AnalysisResult } from './types';
import { analyzeReport } from './utils/analysis';
import Dashboard from './components/Dashboard';
import DataInput from './components/DataInput';
import ResultsTable from './components/ResultsTable';
import AdjustmentPanel from './components/AdjustmentPanel';
import DeviationChart from './components/DeviationChart';

export default function App() {
  const [measurements, setMeasurements] = useState<CMMMeasurement[]>([]);
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [filter, setFilter] = useState('all');
  const [reportInfo, setReportInfo] = useState<{
    partName: string;
    partNumber: string;
    date: string;
    operator: string;
  } | null>(null);

  const handleDataLoaded = (data: CMMMeasurement[], info: typeof reportInfo) => {
    setMeasurements(data);
    const analysisResults = analyzeReport(data);
    setResults(analysisResults);
    setReportInfo(info);
    setFilter('all');
  };

  const hasData = results.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <i className="fas fa-crosshairs text-white text-lg"></i>
              </div>
              <div>
                <h1 className="text-xl font-bold">CMM Report Analyzer</h1>
                <p className="text-xs text-gray-300">Quality Engineering — Deviation Analysis & Adjustment Recommendations</p>
              </div>
            </div>
            {hasData && reportInfo && (
              <div className="hidden md:flex items-center gap-4 text-sm text-gray-300">
                <span><i className="fas fa-cube mr-1"></i>{reportInfo.partName}</span>
                <span><i className="fas fa-hashtag mr-1"></i>{reportInfo.partNumber}</span>
                <span><i className="fas fa-calendar mr-1"></i>{reportInfo.date}</span>
                {reportInfo.operator && <span><i className="fas fa-user mr-1"></i>{reportInfo.operator}</span>}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Data Input - always visible */}
        <DataInput onDataLoaded={handleDataLoaded} />

        {/* Analysis Results */}
        {hasData && (
          <>
            {/* Dashboard Stats */}
            <Dashboard results={results} />

            {/* Adjustment Recommendations - Priority */}
            <AdjustmentPanel results={results} />

            {/* Deviation Chart */}
            <DeviationChart results={results} />

            {/* Detailed Results Table */}
            <ResultsTable results={results} filter={filter} onFilterChange={setFilter} />

            {/* Export / Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => exportReport(results, reportInfo)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                  >
                    <i className="fas fa-download mr-2"></i>
                    Export Report
                  </button>
                  <button
                    onClick={() => exportAdjustments(results)}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
                  >
                    <i className="fas fa-file-alt mr-2"></i>
                    Export Adjustments
                  </button>
                </div>
                <div className="text-xs text-gray-500">
                  <i className="fas fa-info-circle mr-1"></i>
                  Report generated: {new Date().toLocaleString()}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Empty State */}
        {!hasData && (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <i className="fas fa-crosshairs text-4xl text-gray-300"></i>
            </div>
            <h2 className="text-xl font-semibold text-gray-600 mb-2">No CMM Data Loaded</h2>
            <p className="text-gray-400 max-w-md mx-auto">
              Upload a CSV file with your CMM measurement data or load the sample data to see analysis results and adjustment recommendations.
            </p>
            <div className="mt-8 grid md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <i className="fas fa-upload text-2xl text-blue-400 mb-2"></i>
                <h3 className="font-medium text-gray-700 text-sm">Upload CSV</h3>
                <p className="text-xs text-gray-400 mt-1">Import your CMM report data in CSV format</p>
              </div>
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <i className="fas fa-chart-bar text-2xl text-green-400 mb-2"></i>
                <h3 className="font-medium text-gray-700 text-sm">Analyze Deviations</h3>
                <p className="text-xs text-gray-400 mt-1">Visualize deviations and tolerance usage</p>
              </div>
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <i className="fas fa-wrench text-2xl text-orange-400 mb-2"></i>
                <h3 className="font-medium text-gray-700 text-sm">Get Recommendations</h3>
                <p className="text-xs text-gray-400 mt-1">Receive actionable adjustment suggestions</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-gray-400">
          <p>CMM Report Analyzer — Quality Engineering Tool | Supports Position, Flatness, Roundness, Cylindricity, Diameter, and more</p>
        </div>
      </footer>
    </div>
  );
}

function exportReport(results: AnalysisResult[], reportInfo: any) {
  let csv = 'Feature,Type,Axis,Nominal,Measured,Deviation,Tolerance,% Used,Status,Recommendation\n';
  results.forEach(r => {
    csv += `"${r.measurement.featureName}",${r.measurement.featureType},${r.measurement.axis || ''},${r.measurement.nominalValue},${r.measurement.measuredValue},${r.deviation.toFixed(4)},${r.measurement.tolerance},${r.percentOfTolerance.toFixed(1)},${r.status},"${r.recommendation?.description || ''}"\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `CMM_Report_${reportInfo?.partNumber || 'analysis'}_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportAdjustments(results: AnalysisResult[]) {
  const actionable = results.filter(r => r.recommendation?.actionRequired);
  let csv = 'Feature,Type,Axis,Priority,Action Type,Deviation,Recommendation\n';
  actionable.forEach(r => {
    const rec = r.recommendation!;
    csv += `"${r.measurement.featureName}",${r.measurement.featureType},${r.measurement.axis || ''},${rec.priority},${rec.type},${r.deviation.toFixed(4)},"${rec.description}"\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Adjustments_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
