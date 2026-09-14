import { useApp } from '../store/AppContext';

export default function FixturesGauges() {
  const { fixtures, gauges } = useApp();

  const fixtureStats = {
    total: fixtures.length,
    valid: fixtures.filter(f => f.verificationStatus === 'Valid').length,
    dueSoon: fixtures.filter(f => f.verificationStatus === 'Due Soon').length,
    overdue: fixtures.filter(f => f.verificationStatus === 'Overdue').length,
    outOfService: fixtures.filter(f => f.verificationStatus === 'Out of Service').length,
  };

  const gaugeStats = {
    total: gauges.length,
    valid: gauges.filter(g => g.calibrationStatus === 'Valid').length,
    dueSoon: gauges.filter(g => g.calibrationStatus === 'Due Soon').length,
    overdue: gauges.filter(g => g.calibrationStatus === 'Overdue').length,
    outOfService: gauges.filter(g => g.calibrationStatus === 'Out of Service').length,
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Fixtures & Gauges</h1>
        <p className="text-sm text-gray-500">Track calibration, verification, and condition of measurement equipment</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-4">Fixtures Overview</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-500">Total</div>
              <div className="text-2xl font-bold">{fixtureStats.total}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Valid</div>
              <div className="text-2xl font-bold text-green-600">{fixtureStats.valid}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Due Soon</div>
              <div className="text-2xl font-bold text-yellow-600">{fixtureStats.dueSoon}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Overdue</div>
              <div className="text-2xl font-bold text-red-600">{fixtureStats.overdue}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-4">Gauges Overview</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-500">Total</div>
              <div className="text-2xl font-bold">{gaugeStats.total}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Valid</div>
              <div className="text-2xl font-bold text-green-600">{gaugeStats.valid}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Due Soon</div>
              <div className="text-2xl font-bold text-yellow-600">{gaugeStats.dueSoon}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Overdue</div>
              <div className="text-2xl font-bold text-red-600">{gaugeStats.overdue}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixtures Table */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h3 className="text-lg font-semibold mb-4">Fixtures</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fixture ID</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Part</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Process</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Station</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Last Verification</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Next Due</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Condition</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {fixtures.map((fixture) => (
                <tr key={fixture.id}>
                  <td className="px-4 py-2 text-sm text-gray-900">{fixture.fixtureId}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{fixture.name}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{fixture.part}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{fixture.process}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{fixture.station}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{fixture.lastVerification}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{fixture.nextDue}</td>
                  <td className="px-4 py-2 text-sm text-center">
                    <span className={`px-2 py-1 rounded ${
                      fixture.verificationStatus === 'Valid' ? 'bg-green-100 text-green-800' :
                      fixture.verificationStatus === 'Due Soon' ? 'bg-yellow-100 text-yellow-800' :
                      fixture.verificationStatus === 'Overdue' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {fixture.verificationStatus}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">{fixture.condition}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Gauges Table */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-4">Gauges</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Gauge ID</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Serial</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Part</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Last Calibration</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Next Due</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Condition</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {gauges.map((gauge) => (
                <tr key={gauge.id}>
                  <td className="px-4 py-2 text-sm text-gray-900">{gauge.gaugeId}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{gauge.name}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{gauge.gaugeType}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{gauge.serialNumber}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{gauge.part}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{gauge.lastCalibration}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{gauge.nextDue}</td>
                  <td className="px-4 py-2 text-sm text-center">
                    <span className={`px-2 py-1 rounded ${
                      gauge.calibrationStatus === 'Valid' ? 'bg-green-100 text-green-800' :
                      gauge.calibrationStatus === 'Due Soon' ? 'bg-yellow-100 text-yellow-800' :
                      gauge.calibrationStatus === 'Overdue' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {gauge.calibrationStatus}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">{gauge.location}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{gauge.condition}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
