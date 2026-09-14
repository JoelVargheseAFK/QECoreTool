export interface Project {
  id: string;
  name: string;
  customer: string;
  partNumber: string;
  partName: string;
  program: string;
  revision: string;
  process: string;
  plant: string;
  status: 'active' | 'archived' | 'draft';
  startDate: string;
  notes: string;
  cmmReportCount: number;
  partCount: number;
  characteristicCount: number;
  productionQty: number;
  scrapQty: number;
  defectCount: number;
}

export interface ProductionRecord {
  id: string;
  date: string;
  time: string;
  projectId: string;
  partNumber: string;
  serialNumber: string;
  lot: string;
  productionQty: number;
  inspectionQty: number;
  defectQty: number;
  scrapQty: number;
  reworkQty: number;
  defectType: string;
  machine: string;
  line: string;
  process: string;
  station: string;
  shift: string;
  operator: string;
  fixtureId: string;
  gaugeId: string;
  toolId: string;
  supplier: string;
  cycleTime: number;
  scrapCostPerPart: number;
  reworkCostPerPart: number;
  sourceFile?: string;
}

export interface CMMReport {
  id: string;
  fileName: string;
  projectId: string;
  partNumber: string;
  serialNumber: string;
  date: string;
  time: string;
  cmmMachine: string;
  program: string;
  revision: string;
  measurementCount: number;
  importStatus: 'success' | 'error' | 'duplicate';
  measurements: CMMMeasurement[];
}

export interface CMMMeasurement {
  id: string;
  reportId: string;
  featureId: string;
  characteristicId: string;
  characteristicName: string;
  featureType: string;
  nominalValue: number;
  actualValue: number;
  deviation: number;
  usl: number;
  lsl: number;
  tolerance: number;
  nominalX?: number;
  nominalY?: number;
  nominalZ?: number;
  actualX?: number;
  actualY?: number;
  actualZ?: number;
  gdandtType?: string;
  result: 'PASS' | 'FAIL';
  partNumber: string;
  projectId: string;
  date: string;
  machine: string;
  sourceFile: string;
}

export interface Characteristic {
  id: string;
  name: string;
  featureType: string;
  nominal: number;
  usl: number;
  lsl: number;
  target: number;
  tolerance: number;
  gdandtType?: string;
  projectId: string;
  partNumber: string;
  measurementHistory: CMMMeasurement[];
}

export interface IncomingRecord {
  id: string;
  supplier: string;
  partNumber: string;
  partName: string;
  lot: string;
  date: string;
  qtyReceived: number;
  qtyInspected: number;
  qtyAccepted: number;
  qtyRejected: number;
  defect: string;
  inspectionMethod: string;
  gauge: string;
  inspector: string;
  result: 'ACCEPT' | 'REJECT' | 'CONDITIONAL';
  projectId: string;
}

export interface ColumnMapping {
  sourceColumn: string;
  standardField: string;
  dataType: 'text' | 'number' | 'date' | 'datetime';
  required: boolean;
}

export interface AppFilters {
  projectId: string;
  partNumber: string;
  dateFrom: string;
  dateTo: string;
  machine: string;
  process: string;
  shift: string;
}

export interface InProcessInspection {
  id: string;
  projectId: string;
  process: string;
  station: string;
  partNumber: string;
  characteristic: string;
  specification: string;
  inspectionMethod: string;
  gauge: string;
  fixture: string;
  sampleSize: number;
  frequency: string;
  measurement: number;
  result: 'PASS' | 'FAIL';
  reactionPlan: string;
  date: string;
  inspector: string;
}

export interface Fixture {
  id: string;
  fixtureId: string;
  name: string;
  part: string;
  process: string;
  station: string;
  characteristic: string;
  datumA: string;
  datumB: string;
  datumC: string;
  locator: string;
  pin: string;
  clamp: string;
  nest: string;
  masterPart: string;
  verificationStatus: 'Valid' | 'Due Soon' | 'Overdue' | 'Out of Service';
  lastVerification: string;
  nextDue: string;
  condition: string;
}

export interface Gauge {
  id: string;
  gaugeId: string;
  name: string;
  gaugeType: string;
  serialNumber: string;
  part: string;
  characteristic: string;
  calibrationStatus: 'Valid' | 'Due Soon' | 'Overdue' | 'Out of Service';
  lastCalibration: string;
  nextDue: string;
  location: string;
  condition: string;
}

export interface MSAGRRStudy {
  id: string;
  projectId: string;
  part: string;
  characteristic: string;
  gauge: string;
  operators: string[];
  parts: string[];
  trials: number;
  measurements: {
    operator: string;
    part: string;
    trial: number;
    measurement: number;
  }[];
  repeatability: number;
  reproducibility: number;
  gaugeRR: number;
  partToPart: number;
  totalVariation: number;
  percentStudyVar: number;
  percentContribution: number;
  acceptanceCriteria: number;
  result: 'Acceptable' | 'Marginal' | 'Unacceptable';
  date: string;
}

export interface PFMEAEntry {
  id: string;
  projectId: string;
  processStep: string;
  processFunction: string;
  failureMode: string;
  effect: string;
  severity: number;
  cause: string;
  occurrence: number;
  preventionControl: string;
  detectionControl: string;
  detection: number;
  rpn: number;
  action: string;
  responsible: string;
  dueDate: string;
  status: 'Open' | 'In Progress' | 'Closed' | 'Overdue';
}

export interface ControlPlanEntry {
  id: string;
  projectId: string;
  processStep: string;
  productCharacteristic: string;
  processCharacteristic: string;
  specification: string;
  specialCharacteristic: string;
  measurementMethod: string;
  gauge: string;
  fixture: string;
  sampleSize: number;
  frequency: string;
  controlMethod: string;
  reactionPlan: string;
  responsible: string;
  revision: string;
  revisionDate: string;
  changeDescription: string;
  approvedBy: string;
  status: 'Active' | 'Review Required' | 'Obsolete';
}

export interface CorrectiveAction {
  id: string;
  issueId: string;
  projectId: string;
  part: string;
  process: string;
  defect: string;
  characteristic: string;
  date: string;
  d1Team: string;
  d2Problem: string;
  d3Containment: string;
  d4RootCause: string;
  d5CorrectiveAction: string;
  d6Implementation: string;
  d7Effectiveness: string;
  d8Closure: string;
  responsible: string;
  dueDate: string;
  verification: string;
  status: 'Open' | 'In Progress' | 'Verification' | 'Closed';
  beforeCpk?: number;
  afterCpk?: number;
  beforePpm?: number;
  afterPpm?: number;
  beforeScrap?: number;
  afterScrap?: number;
}

export interface Investigation {
  id: string;
  projectId: string;
  problemType: 'Defect' | 'CMM Characteristic' | 'Hole' | 'Circle' | 'GD&T Feature' | 'Scrap Issue' | 'Process Issue' | 'Customer Issue';
  problemDescription: string;
  characteristic?: string;
  part?: string;
  specification?: string;
  actual?: number;
  deviation?: number;
  passFail?: 'PASS' | 'FAIL';
  dateRange?: { from: string; to: string };
  machine?: string;
  process?: string;
  station?: string;
  shift?: string;
  serialNumber?: string;
  lot?: string;
  supplier?: string;
  gauge?: string;
  fixture?: string;
  potentialContributors: {
    factor: string;
    type: 'Machine' | 'Shift' | 'Process' | 'Fixture' | 'Gauge' | 'Lot' | 'Time' | 'Supplier';
    evidence: string;
    association: 'Strong' | 'Moderate' | 'Weak';
  }[];
  correctiveActionId?: string;
  status: 'Open' | 'Investigating' | 'Root Cause Identified' | 'Action Taken' | 'Closed';
  date: string;
}

export interface QEReport {
  id: string;
  projectId: string;
  part?: string;
  dateRange: { from: string; to: string };
  process?: string;
  machine?: string;
  shift?: string;
  sections: ('production' | 'cmm' | 'dimensional' | 'feature-movement' | 'spc' | 'capability' | 'defects' | 'scrap' | 'cost' | 'corrective-actions')[];
  generatedDate: string;
  generatedBy: string;
}

export interface KnowledgeSkill {
  id: string;
  category: string;
  skill: string;
  requiredLevel: number;
  currentLevel: number;
  gap: number;
  evidence: string;
  project: string;
  action: string;
  targetDate: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  competency: 'Observe' | 'Assist' | 'Perform' | 'Lead' | 'Teach';
}

export type PageKey =
  | 'dashboard'
  | 'projects'
  | 'production'
  | 'cmm-reports'
  | 'control-view'
  | 'feature-movement'
  | 'dimensional'
  | 'spc'
  | 'capability'
  | 'defect-pareto'
  | 'scrap-cost'
  | 'incoming'
  | 'in-process'
  | 'final-inspection'
  | 'fixtures-gauges'
  | 'msa'
  | 'pfmea'
  | 'control-plan'
  | '8d'
  | 'knowledge-matrix'
  | 'reports'
  | 'settings'
  | 'data-mapping'
  | 'characteristics'
  | 'correlation'
  | 'investigation';
