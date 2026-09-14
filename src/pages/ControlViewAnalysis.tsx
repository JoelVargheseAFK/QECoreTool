import { useState } from 'react';
import { parseControlViewReport, analyzeControlViewReport, ControlViewReport } from '../utils/controlViewParser';
import { useApp } from '../store/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, ZAxis, ReferenceLine } from 'recharts';

export default function ControlViewAnalysis() {
  const { addCMMReports } = useApp();
  const [report, setReport] = useState<ControlViewReport | null>(null);
  const [filter, setFilter] = useState<'all' | 'fail' | 'pass'>('all');
  const [axisFilter, setAxisFilter] = useState<'all' | 'X' | 'Y' | 'Z' | 'Position' | 'Surface'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parsedReport = parseControlViewReport(text);
      setReport(parsedReport);
    };
    reader.readAsText(file);
  };

  const loadSampleData = () => {
    const sampleText = `Control View								
Control View Name	control view 1							
Units	Millimeters							
Coordinate Systems	世界坐标系							
Data Alignments	drf - A B C, drf - A J K							
All Statistics	Total: 1090, Measured: 1066 (97.798%), Pass: 757 (69.450%), Fail: 309 (28.349%), Warning: 46 (4.220%)							
								
Char No.	Object Name	Control	Nom	Meas	Tol	Dev	Test	Out Tol
	circle 22	Position A B C			1.400			
	circle 22	X	3575.000		±0.700			
	circle 22	Y	-771.500		±0.700			
	circle 22	Z	393.500		±0.700			
	circle 20	Position A B C			1.400			
	circle 20	X	3575.000		±0.700			
	circle 20	Y	771.500		±0.700			
	circle 20	Z	393.500		±0.700			
	R900DCA0E818-Levels-3|3|3	Z	393.500	391.559	±0.700	-1.941	Fail	-1.241
	circle P-1	Z	396.000	394.226	±0.700	-1.774	Fail	-1.074
	L900TCA0E818-Levels-3|3|3	Z	396.000	394.243	±0.700	-1.757	Fail	-1.057
	L900JCP0E270-Levels-3|3	Y	-255.000	-256.735	±0.800	-1.735	Fail	-0.935
	L900HCP0E270-Levels-3|3	Y	-413.000	-414.734	±0.800	-1.734	Fail	-0.934
	R900CCA0E818-Levels-3|3|3	Z	393.500	391.812	±0.700	-1.688	Fail	-0.988
	circle 1	X	4088.291	4087.291	±0.700	-1.000	Fail	-0.300
	point 27	Z	398.500	396.993	±1.000	-1.507	Fail	-0.507
	surf pt (27)	Surface Distance		-1.507	±0.500	-1.507	Fail	-1.007`;

    const parsedReport = parseControlViewReport(sampleText);
    setReport(parsedReport);
  };

  if (!report) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">CMM Control View Analysis</h1>
          <p className="text-sm text-gray-500">Parse and analyze CMM Control View reports (Zeiss CALYPSO format)</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Upload Control View Report</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Report File (.txt, .csv)
              </label>
              <input
                type="file"
                accept=".txt,.csv"
                onChange={handleFileUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            <div className="border-t pt-4">
              <p className="text-sm text-gray-600 mb-2">Or try with sample data:</p>
              <button
                onClick={loadSampleData}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Load Sample Control View Report
              </button>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold mb-2">Supported Format:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Control View header with statistics</li>
                <li>• Position tolerances (X, Y, Z components)</li>
                <li>• Point measurements</li>
                <li>• Surface distance measurements</li>
                <li>• Pass/Fail status with deviation and out-of-tolerance values</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const analysis = analyzeControlViewReport(report);
  
  // Filter measurements
  let filteredMeasurements = report.measurements;
  if (filter === 'fail') {
    filteredMeasurements = filteredMeasurements.filter(m => m.result === 'FAIL');
  } else if (filter === 'pass') {
    filteredMeasurements = filteredMeasurements.filter(m => m.result === 'PASS');
  }

  if (axisFilter !== 'all') {
    if (axisFilter === 'Position') {
      filteredMeasurements = filteredMeasurements.filter(m => m.gdandtType === 'Position');
    } else if (axisFilter === 'Surface') {
      filteredMeasurements = filteredMeasurements.filter(m => m.featureType === 'surface');
    } else {
      filteredMeasurements = filteredMeasurements.filter(m => m.characteristicName.includes(` ${axisFilter}`));
    }
  }

  if (searchTerm) {
    filteredMeasurements = filteredMeasurements.filter(m => 
      m.characteristicName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.featureId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // Prepare chart data
  const deviationData = analysis.sortedByDeviation.slice(0, 20).map(m => ({
    name: m.characteristicName.substring(0, 30),
    deviation: m.deviation,
    tolerance: m.tolerance / 2,
  }));

  const axisDistribution = [
    { axis: 'X', ...analysis.axisStats.X },
    { axis: 'Y', ...analysis.axisStats.Y },
    { axis: 'Z', ...analysis.axisStats.Z },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">CMM Control View Analysis</h1>
          <p className="text-sm text-gray-500">{report.header.controlViewName}</p>
        </div>
        <button
          onClick={() => setReport(null)}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Load New Report
        </button>
      </div>

      {/* Header Information */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h3 className="text-lg font-semibold mb-3">Report Information</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Control View:</span>
            <p className="font-medium">{report.header.controlViewName}</p>
          </div>
          <div>
            <span className="text-gray-500">Units:</span>
            <p className="font-medium">{report.header.units}</p>
          </div>
          <div>
            <span className="text-gray-500">Coordinate System:</span>
            <p className="font-medium">{report.header.coordinateSystems}</p>
          </div>
          <div>
            <span className="text-gray-500">Data Alignments:</span>
            <p className="font-medium">{report.header.dataAlignments.join(', ')}</p>
          </div>
        </div>
      </div>

      {/* Statistics Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Total</div>
          <div className="text-2xl font-bold">{report.header.statistics.total}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Measured</div>
          <div className="text-2xl font-bold text-blue-600">
            {report.header.statistics.measured}
            <span className="text-sm ml-1">({report.header.statistics.measuredPercent}%)</span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Pass</div>
          <div className="text-2xl font-bold text-green-600">
            {report.header.statistics.pass}
            <span className="text-sm ml-1">({report.header.statistics.passPercent}%)</span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Fail</div>
          <div className="text-2xl font-bold text-red-600">
            {report.header.statistics.fail}
            <span className="text-sm ml-1">({report.header.statistics.failPercent}%)</span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Warning</div>
          <div className="text-2xl font-bold text-yellow-600">
            {report.header.statistics.warning}
            <span className="text-sm ml-1">({report.header.statistics.warningPercent}%)</span>
          </div>
        </div>
      </div>

      {/* Analysis Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-4">Top 20 Deviations</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={deviationData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={200} tick={{ fontSize: 10 }} />
              <Tooltip />
              <ReferenceLine x={0} stroke="#000" />
              <Bar dataKey="deviation" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-4">Statistics by Axis</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={axisDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="axis" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="failCount" fill="#ef4444" name="Fail" />
              <Bar dataKey="passCount" fill="#10b981" name="Pass" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Systematic Error Analysis */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h3 className="text-lg font-semibold mb-4">Systematic Error Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border-l-4 border-red-500 pl-4">
            <h4 className="font-semibold text-red-700">Negative Deviations (&lt; -0.5mm)</h4>
            <p className="text-3xl font-bold text-red-600">{analysis.negativeDeviations.length}</p>
            <p className="text-sm text-gray-600">
              {analysis.negativeDeviations.length > 0 && (
                <>Worst: {analysis.negativeDeviations[0]?.deviation.toFixed(3)}mm on {analysis.negativeDeviations[0]?.characteristicName}</>
              )}
            </p>
            {analysis.negativeDeviations.length > 10 && (
              <p className="text-xs text-red-600 mt-2">
                ⚠️ Potential systematic error: Part may be consistently low
              </p>
            )}
          </div>
          <div className="border-l-4 border-blue-500 pl-4">
            <h4 className="font-semibold text-blue-700">Positive Deviations (&gt; +0.5mm)</h4>
            <p className="text-3xl font-bold text-blue-600">{analysis.positiveDeviations.length}</p>
            <p className="text-sm text-gray-600">
              {analysis.positiveDeviations.length > 0 && (
                <>Worst: +{analysis.positiveDeviations[0]?.deviation.toFixed(3)}mm on {analysis.positiveDeviations[0]?.characteristicName}</>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Axis Statistics */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h3 className="text-lg font-semibold mb-4">Axis Statistics</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Axis</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Count</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Avg Dev</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Max Dev</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Min Dev</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Pass</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Fail</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {axisDistribution.map((axis) => (
                <tr key={axis.axis}>
                  <td className="px-4 py-2 text-sm font-medium">{axis.axis}</td>
                  <td className="px-4 py-2 text-sm text-center">{axis.count}</td>
                  <td className="px-4 py-2 text-sm text-center">
                    <span className={axis.avgDeviation < -0.5 ? 'text-red-600 font-bold' : ''}>
                      {axis.avgDeviation.toFixed(3)}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm text-center">{axis.maxDeviation.toFixed(3)}</td>
                  <td className="px-4 py-2 text-sm text-center">{axis.minDeviation.toFixed(3)}</td>
                  <td className="px-4 py-2 text-sm text-center text-green-600">{axis.passCount}</td>
                  <td className="px-4 py-2 text-sm text-center text-red-600">{axis.failCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Filters and Measurement Table */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status Filter</label>
            <select
              value={filter}
              onChange={e => setFilter(e.target.value as any)}
              className="px-3 py-2 border rounded"
            >
              <option value="all">All</option>
              <option value="pass">Pass Only</option>
              <option value="fail">Fail Only</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Axis/Type Filter</label>
            <select
              value={axisFilter}
              onChange={e => setAxisFilter(e.target.value as any)}
              className="px-3 py-2 border rounded"
            >
              <option value="all">All</option>
              <option value="X">X Axis</option>
              <option value="Y">Y Axis</option>
              <option value="Z">Z Axis</option>
              <option value="Position">Position</option>
              <option value="Surface">Surface Distance</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search feature name..."
              className="w-full px-3 py-2 border rounded"
            />
          </div>
        </div>

        <h3 className="text-lg font-semibold mb-4">
          Measurements ({filteredMeasurements.length} of {report.measurements.length})
        </h3>
        <div className="overflow-x-auto max-h-96">
          <table className="min-w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Feature</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Control</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Nominal</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Measured</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Tolerance</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Deviation</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Out of Tol</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Result</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMeasurements.slice(0, 100).map((m) => (
                <tr key={m.id} className={m.result === 'FAIL' ? 'bg-red-50' : ''}>
                  <td className="px-3 py-2 text-sm">{m.featureId}</td>
                  <td className="px-3 py-2 text-sm">{m.gdandtType || m.featureType}</td>
                  <td className="px-3 py-2 text-sm text-right font-mono">{m.nominalValue.toFixed(3)}</td>
                  <td className="px-3 py-2 text-sm text-right font-mono">{m.actualValue.toFixed(3)}</td>
                  <td className="px-3 py-2 text-sm text-right font-mono">±{(m.tolerance / 2).toFixed(3)}</td>
                  <td className={`px-3 py-2 text-sm text-right font-mono font-bold ${
                    m.deviation < 0 ? 'text-red-600' : 'text-blue-600'
                  }`}>
                    {m.deviation > 0 ? '+' : ''}{m.deviation.toFixed(3)}
                  </td>
                  <td className="px-3 py-2 text-sm text-right font-mono text-red-600">
                    {m.result === 'FAIL' ? (m.deviation - (m.tolerance / 2) * Math.sign(m.deviation)).toFixed(3) : '—'}
                  </td>
                  <td className="px-3 py-2 text-sm text-center">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      m.result === 'PASS' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {m.result}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
