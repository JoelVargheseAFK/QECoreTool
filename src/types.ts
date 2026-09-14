export interface CMMMeasurement {
  id: string;
  featureName: string;
  featureType: 'position' | 'flatness' | 'roundness' | 'cylindricity' | 'concentricity' | 'profile' | 'diameter' | 'distance' | 'angle';
  axis?: 'X' | 'Y' | 'Z' | 'true' | 'nominal';
  nominalValue: number;
  measuredValue: number;
  upperTolerance: number;
  lowerTolerance: number;
  tolerance: number;
  unit: string;
}

export interface AnalysisResult {
  measurement: CMMMeasurement;
  deviation: number;
  percentOfTolerance: number;
  status: 'in-tolerance' | 'marginal' | 'out-of-tolerance';
  recommendation?: AdjustmentRecommendation;
}

export interface AdjustmentRecommendation {
  type: 'shift' | 'adjust' | 're-machine' | 'check-fixture' | 'no-action';
  axis?: 'X' | 'Y' | 'Z';
  direction?: 'positive' | 'negative';
  magnitude?: number;
  priority: 'high' | 'medium' | 'low';
  description: string;
  actionRequired: boolean;
}

export interface CMMReport {
  partName: string;
  partNumber: string;
  date: string;
  operator: string;
  measurements: CMMMeasurement[];
}
