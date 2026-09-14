import { useState } from 'react';
import { useApp } from '../store/AppContext';

export default function MSA() {
  const { msaStudies } = useApp();
  const [selectedStudy, setSelectedStudy] = useState<string | null>(null);

  const study = msaStudies.find(s => s.id === selectedStudy);

  const stats = {
    total: msaStudies.length,
    acceptable: msaStudies.filter(s => s.result === 'Acceptable').length,
    marginal: msaStudies.filter(s => s.result === 'Marginal').length,
    unacceptable: msaStudies.filter(s => s.result === 'Unacceptable').length,
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">MSA / GR&R Studies</h1>
        <p className="text-sm text-gray-500">Measurement System Analysis - Gauge Repeatability & Reproducibility</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Total Studies</div>
          <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Acceptable</div>
          <div className="text-2xl font-bold text-green-600">{stats.acceptable}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Marginal</div>
          <div className="text-2xl font-bold text-yellow-600">{stats.marginal}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Unacceptable</div>
          <div className="text-2xl font-bold text-red-600">{stats.unacceptable}</div>
        </div>
      </div>

      {/* Studies List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-4">GR&R Studies</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {msaStudies.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedStudy(s.id)}
                className={`w-full text-left p-3 rounded border transition ${
                  selectedStudy === s.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-sm">{s.characteristic}</div>
                    <div className="text-xs text-gray-500">{s.part} • {s.gauge}</div>
                    <div className="text-xs text-gray-400">{s.date}</div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    s.result === 'Acceptable' ? 'bg-green-100 text-green-800' :
                    s.result === 'Marginal' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {s.result}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Study Details */}
        <div className="bg-white rounded-lg shadow p-4">
          {study ? (
            <>
              <h3 className="text-lg font-semibold mb-4">Study Details</h3>
              <div className="space-y-3 mb-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-500">Part:</div>
                  <div className="font-medium">{study.part}</div>
                  <div className="text-gray-500">Characteristic:</div>
                  <div className="font-medium">{study.characteristic}</div>
                  <div className="text-gray-500">Gauge:</div>
                  <div className="font-medium">{study.gauge}</div>
                  <div className="text-gray-500">Operators:</div>
                  <div className="font-medium">{study.operators.length}</div>
                  <div className="text-gray-500">Parts:</div>
                  <div className="font-medium">{study.parts.length}</div>
                  <div className="text-gray-500">Trials:</div>
                  <div className="font-medium">{study.trials}</div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">GR&R Results</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Repeatability (EV):</span>
                    <span className="font-mono">{study.repeatability.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Reproducibility (AV):</span>
                    <span className="font-mono">{study.reproducibility.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Gauge R&R:</span>
                    <span className="font-mono font-bold">{study.gaugeRR.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Part-to-Part:</span>
                    <span className="font-mono">{study.partToPart.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Variation:</span>
                    <span className="font-mono">{study.totalVariation.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between text-sm border-t pt-2">
                    <span className="text-gray-600">% Study Variation:</span>
                    <span className={`font-mono font-bold ${
                      study.percentStudyVar < 10 ? 'text-green-600' :
                      study.percentStudyVar < 30 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {study.percentStudyVar.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">% Contribution:</span>
                    <span className="font-mono">{study.percentContribution.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Acceptance Criteria:</span>
                    <span className="font-mono">&lt;{study.acceptanceCriteria}%</span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <h4 className="font-semibold mb-2">Acceptance Criteria</h4>
                <div className="text-xs text-gray-600 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-500 rounded"></span>
                    <span>&lt;10%: Acceptable - Measurement system is acceptable</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-yellow-500 rounded"></span>
                    <span>10-30%: Marginal - May be acceptable based on application</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-red-500 rounded"></span>
                    <span>&gt;30%: Unacceptable - Measurement system needs improvement</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400">
              Select a study to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
