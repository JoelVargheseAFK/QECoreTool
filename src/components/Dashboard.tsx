import { AnalysisResult } from '../types';
import { getSummaryStats } from '../utils/analysis';

interface DashboardProps {
  results: AnalysisResult[];
}

export default function Dashboard({ results }: DashboardProps) {
  if (results.length === 0) return null;

  const stats = getSummaryStats(results);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
      <StatCard
        label="Total Features"
        value={stats.total.toString()}
        icon="fa-ruler-combined"
        color="bg-blue-500"
      />
      <StatCard
        label="In Tolerance"
        value={stats.inTolerance.toString()}
        icon="fa-check-circle"
        color="bg-green-500"
      />
      <StatCard
        label="Marginal"
        value={stats.marginal.toString()}
        icon="fa-exclamation-triangle"
        color="bg-yellow-500"
      />
      <StatCard
        label="Out of Tolerance"
        value={stats.outOfTolerance.toString()}
        icon="fa-times-circle"
        color="bg-red-500"
      />
      <StatCard
        label="Needs Adjustment"
        value={stats.needsAdjustment.toString()}
        icon="fa-wrench"
        color="bg-orange-500"
      />
      <StatCard
        label="Pass Rate"
        value={`${stats.passRate}%`}
        icon="fa-chart-pie"
        color="bg-indigo-500"
      />
      <StatCard
        label="Max Deviation"
        value={`${stats.maxDeviation.toFixed(4)}mm`}
        icon="fa-arrows-alt-h"
        color="bg-purple-500"
      />
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: string; icon: string; color: string }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 flex items-center gap-3">
      <div className={`${color} w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0`}>
        <i className={`fas ${icon} text-white text-sm`}></i>
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 truncate">{label}</p>
        <p className="text-lg font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}
