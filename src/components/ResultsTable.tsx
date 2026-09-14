import { useState } from 'react';
import { AnalysisResult } from '../types';

interface ResultsTableProps {
  results: AnalysisResult[];
  onFilterChange: (filter: string) => void;
  filter: string;
}

export default function ResultsTable({ results, onFilterChange, filter }: ResultsTableProps) {
  const [sortBy, setSortBy] = useState<'deviation' | 'percent' | 'name'>('deviation');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  if (results.length === 0) return null;

  const filteredResults = results.filter(r => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  const sortedResults = [...filteredResults].sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'deviation') comparison = Math.abs(a.deviation) - Math.abs(b.deviation);
    else if (sortBy === 'percent') comparison = a.percentOfTolerance - b.percentOfTolerance;
    else comparison = a.measurement.featureName.localeCompare(b.measurement.featureName);
    return sortDir === 'desc' ? -comparison : comparison;
  });

  const handleSort = (field: 'deviation' | 'percent' | 'name') => {
    if (sortBy === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir('desc');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in-tolerance':
        return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700">PASS</span>;
      case 'marginal':
        return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">MARGINAL</span>;
      case 'out-of-tolerance':
        return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-700">FAIL</span>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
      <div className="p-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <i className="fas fa-table text-blue-500"></i>
          Measurement Results
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Filter:</span>
          {['all', 'out-of-tolerance', 'marginal', 'in-tolerance'].map(f => (
            <button
              key={f}
              onClick={() => onFilterChange(f)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                filter === f
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f === 'all' ? 'All' : f === 'out-of-tolerance' ? 'Failed' : f === 'marginal' ? 'Marginal' : 'Passed'}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feature</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Axis</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Nominal</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Measured</th>
              <th
                className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-blue-600"
                onClick={() => handleSort('deviation')}
              >
                Deviation {sortBy === 'deviation' && (sortDir === 'desc' ? '↓' : '↑')}
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Tolerance</th>
              <th
                className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-blue-600"
                onClick={() => handleSort('percent')}
              >
                % Tol Used {sortBy === 'percent' && (sortDir === 'desc' ? '↓' : '↑')}
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sortedResults.map((result) => (
              <tr
                key={result.measurement.id}
                className={`hover:bg-gray-50 transition-colors ${
                  result.status === 'out-of-tolerance' ? 'bg-red-50/50' :
                  result.status === 'marginal' ? 'bg-yellow-50/50' : ''
                }`}
              >
                <td className="px-4 py-3 font-medium text-gray-800">
                  {result.measurement.featureName}
                </td>
                <td className="px-4 py-3 text-gray-600 capitalize">{result.measurement.featureType}</td>
                <td className="px-4 py-3 text-center">
                  {result.measurement.axis ? (
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-gray-100 text-xs font-bold text-gray-700">
                      {result.measurement.axis}
                    </span>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right font-mono text-gray-700">
                  {result.measurement.nominalValue.toFixed(4)}
                </td>
                <td className="px-4 py-3 text-right font-mono text-gray-700">
                  {result.measurement.measuredValue.toFixed(4)}
                </td>
                <td className={`px-4 py-3 text-right font-mono font-bold ${
                  result.status === 'out-of-tolerance' ? 'text-red-600' :
                  result.status === 'marginal' ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {result.deviation > 0 ? '+' : ''}{result.deviation.toFixed(4)}
                </td>
                <td className="px-4 py-3 text-center text-gray-500 font-mono text-xs">
                  ±{result.measurement.tolerance / 2}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          result.percentOfTolerance > 100 ? 'bg-red-500' :
                          result.percentOfTolerance > 75 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(result.percentOfTolerance, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-medium text-gray-600 w-10 text-right">
                      {result.percentOfTolerance.toFixed(0)}%
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">{getStatusBadge(result.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
        Showing {sortedResults.length} of {results.length} features
      </div>
    </div>
  );
}
