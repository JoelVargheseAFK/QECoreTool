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

export type PageKey =
  | 'dashboard'
  | 'projects'
  | 'production'
  | 'cmm-reports'
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
  | 'correlation';
