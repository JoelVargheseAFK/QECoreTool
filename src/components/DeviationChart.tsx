import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import { AnalysisResult } from '../types';

interface DeviationChartProps {
  results: AnalysisResult[];
}

export default function DeviationChart({ results }: DeviationChartProps) {
  if (results.length === 0) return null;

  const chartData = results.map(r => ({
    name: r.measurement.featureName.length > 15
      ? r.measurement.featureName.substring(0, 15) + '...'
      : r.measurement.featureName,
    fullName: r.measurement.featureName,
    deviation: parseFloat(r.deviation.toFixed(4)),
    absDeviation: parseFloat(Math.abs(r.deviation).toFixed(4)),
    tolerance: r.measurement.tolerance / 2,
    status: r.status,
    axis: r.measurement.axis || '',
  }));

  const getBarColor = (status: string) => {
    switch (status) {
      case 'out-of-tolerance': return '#ef4444';
      case 'marginal': return '#eab308';
      default: return '#22c55e';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <i className="fas fa-chart-bar text-blue-500"></i>
        Deviation Analysis
      </h2>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={80}
              tick={{ fontSize: 10 }}
            />
            <YAxis
              tick={{ fontSize: 11 }}
              label={{ value: 'Deviation (mm)', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-3 rounded-lg shadow-lg border text-sm">
                      <p className="font-semibold text-gray-800">{data.fullName}</p>
                      {data.axis && <p className="text-gray-500">Axis: {data.axis}</p>}
                      <p className={`font-mono font-bold ${
                        data.status === 'out-of-tolerance' ? 'text-red-600' :
                        data.status === 'marginal' ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        Deviation: {data.deviation > 0 ? '+' : ''}{data.deviation}mm
                      </p>
                      <p className="text-gray-500">Tolerance: ±{data.tolerance}mm</p>
                      <p className={`text-xs mt-1 font-medium ${
                        data.status === 'out-of-tolerance' ? 'text-red-500' :
                        data.status === 'marginal' ? 'text-yellow-500' : 'text-green-500'
                      }`}>
                        {data.status === 'out-of-tolerance' ? '⚠ OUT OF TOLERANCE' :
                         data.status === 'marginal' ? '⚡ MARGINAL' : '✓ IN TOLERANCE'}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <ReferenceLine y={0} stroke="#666" strokeWidth={1} />
            <Bar dataKey="deviation" radius={[2, 2, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={index} fill={getBarColor(entry.status)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-2">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-green-500"></div>
          <span className="text-xs text-gray-600">In Tolerance</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-yellow-500"></div>
          <span className="text-xs text-gray-600">Marginal</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-red-500"></div>
          <span className="text-xs text-gray-600">Out of Tolerance</span>
        </div>
      </div>
    </div>
  );
}
