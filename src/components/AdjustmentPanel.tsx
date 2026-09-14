import { AnalysisResult } from '../types';

interface AdjustmentPanelProps {
  results: AnalysisResult[];
}

export default function AdjustmentPanel({ results }: AdjustmentPanelProps) {
  const actionableResults = results
    .filter(r => r.recommendation?.actionRequired)
    .sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.recommendation!.priority] - priorityOrder[b.recommendation!.priority];
    });

  if (actionableResults.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <i className="fas fa-wrench text-blue-500"></i>
          Adjustment Recommendations
        </h2>
        <div className="text-center py-8">
          <i className="fas fa-check-double text-4xl text-green-400 mb-3"></i>
          <p className="text-gray-600">All features are well within tolerance. No adjustments needed!</p>
        </div>
      </div>
    );
  }

  const highPriority = actionableResults.filter(r => r.recommendation!.priority === 'high');
  const mediumPriority = actionableResults.filter(r => r.recommendation!.priority === 'medium');

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-red-50">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <i className="fas fa-wrench text-orange-500"></i>
          Adjustment Recommendations
          <span className="ml-auto px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full">
            {actionableResults.length} action{actionableResults.length !== 1 ? 's' : ''} required
          </span>
        </h2>
      </div>

      <div className="p-4 space-y-4">
        {/* High Priority */}
        {highPriority.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-red-700 mb-2 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              HIGH PRIORITY — Immediate Action Required
            </h3>
            <div className="space-y-2">
              {highPriority.map((result, idx) => (
                <RecommendationCard key={idx} result={result} />
              ))}
            </div>
          </div>
        )}

        {/* Medium Priority */}
        {mediumPriority.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-yellow-700 mb-2 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
              MEDIUM PRIORITY — Preventive Action Recommended
            </h3>
            <div className="space-y-2">
              {mediumPriority.map((result, idx) => (
                <RecommendationCard key={idx} result={result} />
              ))}
            </div>
          </div>
        )}

        {/* Summary Actions */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="text-sm font-semibold text-blue-800 mb-2">
            <i className="fas fa-lightbulb mr-1"></i> Summary of Required Adjustments
          </h4>
          <div className="grid md:grid-cols-2 gap-3">
            {getShiftSummary(actionableResults).map((summary, idx) => (
              <div key={idx} className="flex items-start gap-2 text-sm">
                <i className={`fas ${summary.icon} ${summary.color} mt-0.5`}></i>
                <div>
                  <span className="font-medium text-gray-800">{summary.axis} Axis:</span>
                  <span className="text-gray-600 ml-1">Shift {summary.direction} by {summary.magnitude}mm</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function RecommendationCard({ result }: { result: AnalysisResult }) {
  const rec = result.recommendation!;
  const isHigh = rec.priority === 'high';

  return (
    <div className={`p-3 rounded-lg border ${
      isHigh ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-gray-800 text-sm">{result.measurement.featureName}</span>
            {result.measurement.axis && (
              <span className="px-1.5 py-0.5 bg-gray-200 rounded text-xs font-bold">{result.measurement.axis}</span>
            )}
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
              rec.type === 'shift' ? 'bg-blue-100 text-blue-700' :
              rec.type === 'adjust' ? 'bg-purple-100 text-purple-700' :
              rec.type === 're-machine' ? 'bg-red-100 text-red-700' :
              'bg-orange-100 text-orange-700'
            }`}>
              {rec.type === 'shift' ? '↔ SHIFT' :
               rec.type === 'adjust' ? '⚙ ADJUST' :
               rec.type === 're-machine' ? '🔧 RE-MACHINE' :
               '🔍 CHECK FIXTURE'}
            </span>
          </div>
          <p className="text-sm text-gray-600">{rec.description}</p>
          {rec.magnitude && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                Offset: {rec.direction === 'positive' ? '+' : '-'}{rec.magnitude.toFixed(4)}mm
              </span>
            </div>
          )}
        </div>
        <div className="text-right flex-shrink-0">
          <div className={`text-lg font-bold ${
            result.status === 'out-of-tolerance' ? 'text-red-600' : 'text-yellow-600'
          }`}>
            {result.deviation > 0 ? '+' : ''}{result.deviation.toFixed(4)}
          </div>
          <div className="text-xs text-gray-500">deviation</div>
        </div>
      </div>
    </div>
  );
}

interface ShiftSummary {
  axis: string;
  direction: string;
  magnitude: string;
  icon: string;
  color: string;
}

function getShiftSummary(results: AnalysisResult[]): ShiftSummary[] {
  const axisShifts: Record<string, { total: number; count: number; direction: 'positive' | 'negative' }> = {};

  results.forEach(r => {
    const rec = r.recommendation;
    if (rec?.axis && rec.magnitude) {
      const key = rec.axis;
      if (!axisShifts[key]) {
        axisShifts[key] = { total: 0, count: 0, direction: rec.direction || 'positive' };
      }
      axisShifts[key].total += rec.magnitude;
      axisShifts[key].count++;
      // Determine dominant direction
      if (rec.direction === 'positive') {
        axisShifts[key].direction = 'positive';
      }
    }
  });

  return Object.entries(axisShifts).map(([axis, data]) => ({
    axis,
    direction: data.direction === 'positive' ? '(+) positive' : '(-) negative',
    magnitude: (data.total / data.count).toFixed(4),
    icon: data.direction === 'positive' ? 'fa-arrow-up' : 'fa-arrow-down',
    color: data.direction === 'positive' ? 'text-green-600' : 'text-red-600',
  }));
}
