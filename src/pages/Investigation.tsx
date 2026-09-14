import { useState } from 'react';
import { useApp } from '../store/AppContext';
import { Investigation } from '../types';

export default function InvestigationPage() {
  const { investigations, characteristics, addInvestigation, updateInvestigation } = useApp();
  const [selectedInv, setSelectedInv] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newInv, setNewInv] = useState<Partial<Investigation>>({
    problemType: 'Defect',
    status: 'Open',
    potentialContributors: [],
  });

  const investigation = investigations.find(i => i.id === selectedInv);

  const handleCreate = () => {
    const id = `INV-${Date.now()}`;
    addInvestigation({
      ...newInv,
      id,
      projectId: 'PRJ-001',
      date: new Date().toISOString().split('T')[0],
      potentialContributors: newInv.potentialContributors || [],
    } as Investigation);
    setShowNewForm(false);
    setSelectedInv(id);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">QE Investigation Workspace</h1>
          <p className="text-sm text-gray-500">Find the cause — structured problem-solving workspace</p>
        </div>
        <button
          onClick={() => setShowNewForm(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
        >
          <i className="fas fa-plus mr-2"></i>New Investigation
        </button>
      </div>

      {/* New Investigation Form */}
      {showNewForm && (
        <div className="bg-white rounded-lg shadow p-4 mb-6 border-2 border-blue-200">
          <h3 className="text-lg font-semibold mb-4">New Investigation</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Problem Type</label>
              <select
                value={newInv.problemType}
                onChange={e => setNewInv({ ...newInv, problemType: e.target.value as any })}
                className="w-full px-3 py-2 border rounded"
              >
                <option>Defect</option>
                <option>CMM Characteristic</option>
                <option>Hole</option>
                <option>Circle</option>
                <option>GD&T Feature</option>
                <option>Scrap Issue</option>
                <option>Process Issue</option>
                <option>Customer Issue</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Part</label>
              <input
                type="text"
                value={newInv.part || ''}
                onChange={e => setNewInv({ ...newInv, part: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                placeholder="Part number"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Problem Description</label>
              <textarea
                value={newInv.problemDescription || ''}
                onChange={e => setNewInv({ ...newInv, problemDescription: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                rows={3}
                placeholder="What is wrong?"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleCreate} className="px-4 py-2 bg-blue-500 text-white rounded text-sm">Create</button>
            <button onClick={() => setShowNewForm(false)} className="px-4 py-2 bg-gray-200 rounded text-sm">Cancel</button>
          </div>
        </div>
      )}

      {/* Investigation List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-4">Investigations</h3>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {investigations.map((inv) => (
              <button
                key={inv.id}
                onClick={() => setSelectedInv(inv.id)}
                className={`w-full text-left p-3 rounded border transition ${
                  selectedInv === inv.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="font-medium text-sm">{inv.id}</div>
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    inv.status === 'Closed' ? 'bg-green-100 text-green-800' :
                    inv.status === 'Action Taken' ? 'bg-purple-100 text-purple-800' :
                    inv.status === 'Root Cause Identified' ? 'bg-yellow-100 text-yellow-800' :
                    inv.status === 'Investigating' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {inv.status}
                  </span>
                </div>
                <div className="text-xs text-gray-600">{inv.problemType}</div>
                <div className="text-xs text-gray-500 truncate">{inv.problemDescription}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Investigation Details - 10 Step Process */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-4">
          {investigation ? (
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{investigation.id}</h3>
                  <p className="text-sm text-gray-500">{investigation.problemType} • {investigation.part}</p>
                </div>
                <select
                  value={investigation.status}
                  onChange={e => updateInvestigation({ ...investigation, status: e.target.value as any })}
                  className="px-3 py-1 border rounded text-sm"
                >
                  <option>Open</option>
                  <option>Investigating</option>
                  <option>Root Cause Identified</option>
                  <option>Action Taken</option>
                  <option>Closed</option>
                </select>
              </div>

              {/* 10-Step Investigation */}
              <div className="space-y-3">
                <StepCard step={1} title="PROBLEM" color="red" content={
                  <div className="text-sm space-y-1">
                    <p><strong>What is wrong?</strong></p>
                    <p>{investigation.problemDescription}</p>
                    {investigation.characteristic && <p>Characteristic: {investigation.characteristic}</p>}
                    {investigation.specification && <p>Specification: {investigation.specification}</p>}
                    {investigation.actual && <p>Actual: {investigation.actual}</p>}
                    {investigation.deviation && <p>Deviation: {investigation.deviation}</p>}
                    {investigation.passFail && <p>Result: <span className={investigation.passFail === 'FAIL' ? 'text-red-600 font-bold' : 'text-green-600'}>{investigation.passFail}</span></p>}
                  </div>
                } />

                <StepCard step={2} title="WHEN" color="orange" content={
                  <div className="text-sm space-y-1">
                    <p><strong>Date/Time Analysis:</strong></p>
                    {investigation.dateRange && <p>Period: {investigation.dateRange.from} to {investigation.dateRange.to}</p>}
                    <p className="text-gray-500 text-xs">Analyze trends, before/after, sudden changes, gradual drift</p>
                  </div>
                } />

                <StepCard step={3} title="WHERE" color="yellow" content={
                  <div className="text-sm space-y-1">
                    <p><strong>Location Analysis:</strong></p>
                    {investigation.machine && <p>Machine: {investigation.machine}</p>}
                    {investigation.process && <p>Process: {investigation.process}</p>}
                    {investigation.station && <p>Station: {investigation.station}</p>}
                    {investigation.shift && <p>Shift: {investigation.shift}</p>}
                  </div>
                } />

                <StepCard step={4} title="WHICH PARTS" color="green" content={
                  <div className="text-sm space-y-1">
                    <p><strong>Part/Lot Analysis:</strong></p>
                    {investigation.serialNumber && <p>Serial: {investigation.serialNumber}</p>}
                    {investigation.lot && <p>Lot: {investigation.lot}</p>}
                    {investigation.supplier && <p>Supplier: {investigation.supplier}</p>}
                  </div>
                } />

                <StepCard step={5} title="MEASUREMENT" color="teal" content={
                  <div className="text-sm space-y-1">
                    <p><strong>Measurement System:</strong></p>
                    {investigation.gauge && <p>Gauge: {investigation.gauge}</p>}
                    {investigation.fixture && <p>Fixture: {investigation.fixture}</p>}
                    <p className="text-gray-500 text-xs">Check GR&R, calibration status, measurement system validity</p>
                  </div>
                } />

                <StepCard step={6} title="FEATURE MOVEMENT" color="blue" content={
                  <div className="text-sm space-y-1">
                    <p><strong>Coordinate Analysis:</strong></p>
                    <p className="text-gray-500 text-xs">If coordinate data exists, show nominal vs actual, ΔX, ΔY, ΔZ, direction, trend</p>
                    <p className="text-gray-400 text-xs italic">View Feature Movement module for detailed analysis</p>
                  </div>
                } />

                <StepCard step={7} title="PRODUCTION" color="indigo" content={
                  <div className="text-sm space-y-1">
                    <p><strong>Production Context:</strong></p>
                    <p className="text-gray-500 text-xs">Compare with production quantity, defects, scrap, rework, process changes</p>
                    <p className="text-gray-400 text-xs italic">View Production Data module for comparison</p>
                  </div>
                } />

                <StepCard step={8} title="COST" color="purple" content={
                  <div className="text-sm space-y-1">
                    <p><strong>Cost Impact:</strong></p>
                    <p className="text-gray-500 text-xs">Scrap quantity, scrap cost, rework cost, total quality cost</p>
                    <p className="text-gray-400 text-xs italic">View Scrap & Cost module for detailed analysis</p>
                  </div>
                } />

                <StepCard step={9} title="POTENTIAL CONTRIBUTORS" color="pink" content={
                  <div className="text-sm space-y-2">
                    <p><strong>Ranked Potential Contributors:</strong></p>
                    {investigation.potentialContributors.map((pc, idx) => (
                      <div key={idx} className={`p-2 rounded border-l-4 ${
                        pc.association === 'Strong' ? 'border-red-500 bg-red-50' :
                        pc.association === 'Moderate' ? 'border-yellow-500 bg-yellow-50' :
                        'border-gray-300 bg-gray-50'
                      }`}>
                        <div className="font-medium text-xs">{pc.factor}</div>
                        <div className="text-xs text-gray-600">{pc.evidence}</div>
                        <div className="text-xs text-gray-500 italic">
                          {pc.association === 'Strong' ? 'Strong association — requires investigation' :
                           pc.association === 'Moderate' ? 'Moderate association — potential contributor' :
                           'Weak association — observe'}
                        </div>
                      </div>
                    ))}
                    <p className="text-xs text-gray-400 italic mt-2">
                      Note: These are potential contributors based on observed patterns. Correlation does not prove causation.
                    </p>
                  </div>
                } />

                <StepCard step={10} title="CORRECTIVE ACTION" color="gray" content={
                  <div className="text-sm space-y-2">
                    <p><strong>Action:</strong></p>
                    {investigation.correctiveActionId ? (
                      <div className="p-2 bg-green-50 rounded border border-green-200">
                        <p className="text-green-700 font-medium">Linked to {investigation.correctiveActionId}</p>
                        <p className="text-xs text-green-600">View in 8D / Corrective Actions module</p>
                      </div>
                    ) : (
                      <div className="p-2 bg-yellow-50 rounded border border-yellow-200">
                        <p className="text-yellow-700">No corrective action created yet</p>
                        <button className="mt-2 px-3 py-1 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600">
                          Create 8D from this investigation
                        </button>
                      </div>
                    )}
                  </div>
                } />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400">
              <div className="text-center">
                <i className="fas fa-search text-4xl mb-3"></i>
                <p>Select an investigation to view details</p>
                <p className="text-xs mt-2">Or create a new investigation to start problem-solving</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StepCard({ step, title, color, content }: { step: number; title: string; color: string; content: React.ReactNode }) {
  const colorClasses: Record<string, string> = {
    red: 'border-red-500 bg-red-50',
    orange: 'border-orange-500 bg-orange-50',
    yellow: 'border-yellow-500 bg-yellow-50',
    green: 'border-green-500 bg-green-50',
    teal: 'border-teal-500 bg-teal-50',
    blue: 'border-blue-500 bg-blue-50',
    indigo: 'border-indigo-500 bg-indigo-50',
    purple: 'border-purple-500 bg-purple-50',
    pink: 'border-pink-500 bg-pink-50',
    gray: 'border-gray-500 bg-gray-50',
  };

  return (
    <div className={`border-l-4 ${colorClasses[color]} p-3 rounded`}>
      <div className="flex items-center gap-2 mb-2">
        <span className={`w-6 h-6 rounded-full bg-${color}-500 text-white text-xs flex items-center justify-center font-bold`}>
          {step}
        </span>
        <h4 className="font-semibold text-sm text-gray-800">STEP {step} — {title}</h4>
      </div>
      {content}
    </div>
  );
}
