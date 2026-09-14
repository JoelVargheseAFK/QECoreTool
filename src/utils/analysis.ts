import { CMMMeasurement, AnalysisResult, AdjustmentRecommendation } from '../types';

export function analyzeMeasurement(m: CMMMeasurement): AnalysisResult {
  const deviation = m.measuredValue - m.nominalValue;
  const halfTolerance = m.tolerance / 2;
  const percentOfTolerance = halfTolerance > 0 ? Math.abs(deviation) / halfTolerance * 100 : 0;

  let status: 'in-tolerance' | 'marginal' | 'out-of-tolerance';
  if (Math.abs(deviation) > halfTolerance) {
    status = 'out-of-tolerance';
  } else if (percentOfTolerance > 75) {
    status = 'marginal';
  } else {
    status = 'in-tolerance';
  }

  const recommendation = generateRecommendation(m, deviation, status);

  return {
    measurement: m,
    deviation,
    percentOfTolerance,
    status,
    recommendation,
  };
}

function generateRecommendation(
  m: CMMMeasurement,
  deviation: number,
  status: 'in-tolerance' | 'marginal' | 'out-of-tolerance'
): AdjustmentRecommendation {
  if (status === 'in-tolerance' && Math.abs(deviation) < m.tolerance * 0.25) {
    return {
      type: 'no-action',
      priority: 'low',
      description: 'Within tolerance. No adjustment needed.',
      actionRequired: false,
    };
  }

  if (status === 'out-of-tolerance') {
    if (m.featureType === 'position' && m.axis) {
      return {
        type: 'shift',
        axis: m.axis as 'X' | 'Y' | 'Z',
        direction: deviation > 0 ? 'negative' : 'positive',
        magnitude: Math.abs(deviation),
        priority: 'high',
        description: `Shift ${m.axis} axis by ${Math.abs(deviation).toFixed(4)}mm ${deviation > 0 ? '(-) direction' : '(+) direction'} to bring feature back to nominal.`,
        actionRequired: true,
      };
    }

    if (m.featureType === 'diameter') {
      const overSize = deviation > 0;
      return {
        type: overSize ? 're-machine' : 'adjust',
        priority: 'high',
        description: overSize
          ? `Feature is ${Math.abs(deviation).toFixed(4)}mm oversize. Consider re-machining or adjusting tool offset by -${Math.abs(deviation).toFixed(4)}mm.`
          : `Feature is ${Math.abs(deviation).toFixed(4)}mm undersize. Adjust tool offset by +${Math.abs(deviation).toFixed(4)}mm or check tool wear.`,
        actionRequired: true,
      };
    }

    if (m.featureType === 'flatness' || m.featureType === 'roundness' || m.featureType === 'cylindricity') {
      return {
        type: 'check-fixture',
        priority: 'high',
        description: `${m.featureType} out of tolerance by ${Math.abs(deviation).toFixed(4)}mm. Check fixture clamping, spindle condition, and thermal stability.`,
        actionRequired: true,
      };
    }

    return {
      type: 'adjust',
      priority: 'high',
      description: `Feature out of tolerance. Deviation: ${deviation.toFixed(4)}mm. Review process parameters and adjust accordingly.`,
      actionRequired: true,
    };
  }

  // Marginal
  if (m.featureType === 'position' && m.axis) {
    return {
      type: 'shift',
      axis: m.axis as 'X' | 'Y' | 'Z',
      direction: deviation > 0 ? 'negative' : 'positive',
      magnitude: Math.abs(deviation) * 0.5,
      priority: 'medium',
      description: `Approaching tolerance limit on ${m.axis}. Consider pre-emptive shift of ${Math.abs(deviation).toFixed(4)}mm to prevent future OOT.`,
      actionRequired: true,
    };
  }

  return {
    type: 'adjust',
    priority: 'medium',
    description: `Approaching tolerance limit (${Math.abs(deviation).toFixed(4)}mm deviation). Monitor closely and consider preventive adjustment.`,
    actionRequired: true,
  };
}

export function analyzeReport(measurements: CMMMeasurement[]): AnalysisResult[] {
  return measurements.map(analyzeMeasurement);
}

export function getSummaryStats(results: AnalysisResult[]) {
  const total = results.length;
  const inTolerance = results.filter(r => r.status === 'in-tolerance').length;
  const marginal = results.filter(r => r.status === 'marginal').length;
  const outOfTolerance = results.filter(r => r.status === 'out-of-tolerance').length;
  const needsAdjustment = results.filter(r => r.recommendation?.actionRequired).length;

  const avgDeviation = results.reduce((sum, r) => sum + Math.abs(r.deviation), 0) / total;
  const maxDeviation = Math.max(...results.map(r => Math.abs(r.deviation)));

  return {
    total,
    inTolerance,
    marginal,
    outOfTolerance,
    needsAdjustment,
    avgDeviation,
    maxDeviation,
    passRate: ((inTolerance + marginal) / total * 100).toFixed(1),
  };
}

export function parseCSVData(csvText: string): CMMMeasurement[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  const measurements: CMMMeasurement[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.trim());
    if (cols.length < 6) continue;

    const featureType = normalizeFeatureType(cols[1] || 'position');
    const axis = cols[2] ? normalizeAxis(cols[2]) : undefined;

    measurements.push({
      id: `m-${i}`,
      featureName: cols[0] || `Feature ${i}`,
      featureType,
      axis,
      nominalValue: parseFloat(cols[3]) || 0,
      measuredValue: parseFloat(cols[4]) || 0,
      upperTolerance: parseFloat(cols[5]) || 0.1,
      lowerTolerance: parseFloat(cols[6]) || -(parseFloat(cols[5]) || 0.1),
      tolerance: (parseFloat(cols[5]) || 0.1) * 2,
      unit: cols[7] || 'mm',
    });
  }

  return measurements;
}

function normalizeFeatureType(type: string): CMMMeasurement['featureType'] {
  const t = type.toLowerCase().trim();
  if (t.includes('position') || t.includes('pos')) return 'position';
  if (t.includes('flat')) return 'flatness';
  if (t.includes('round') || t.includes('circular')) return 'roundness';
  if (t.includes('cyl')) return 'cylindricity';
  if (t.includes('conc')) return 'concentricity';
  if (t.includes('profile')) return 'profile';
  if (t.includes('diam') || t.includes('dia')) return 'diameter';
  if (t.includes('dist')) return 'distance';
  if (t.includes('angle') || t.includes('ang')) return 'angle';
  return 'position';
}

function normalizeAxis(axis: string): 'X' | 'Y' | 'Z' | undefined {
  const a = axis.toUpperCase().trim();
  if (a === 'X') return 'X';
  if (a === 'Y') return 'Y';
  if (a === 'Z') return 'Z';
  return undefined;
}

export function generateSampleData(): CMMMeasurement[] {
  return [
    { id: '1', featureName: 'Hole A - Position', featureType: 'position', axis: 'X', nominalValue: 25.000, measuredValue: 25.085, upperTolerance: 0.05, lowerTolerance: -0.05, tolerance: 0.1, unit: 'mm' },
    { id: '2', featureName: 'Hole A - Position', featureType: 'position', axis: 'Y', nominalValue: 40.000, measuredValue: 40.032, upperTolerance: 0.05, lowerTolerance: -0.05, tolerance: 0.1, unit: 'mm' },
    { id: '3', featureName: 'Hole A - Position', featureType: 'position', axis: 'Z', nominalValue: 0.000, measuredValue: 0.012, upperTolerance: 0.05, lowerTolerance: -0.05, tolerance: 0.1, unit: 'mm' },
    { id: '4', featureName: 'Hole B - Diameter', featureType: 'diameter', nominalValue: 10.000, measuredValue: 10.068, upperTolerance: 0.05, lowerTolerance: -0.05, tolerance: 0.1, unit: 'mm' },
    { id: '5', featureName: 'Hole C - Diameter', featureType: 'diameter', nominalValue: 8.000, measuredValue: 8.003, upperTolerance: 0.025, lowerTolerance: -0.025, tolerance: 0.05, unit: 'mm' },
    { id: '6', featureName: 'Surface A - Flatness', featureType: 'flatness', nominalValue: 0.000, measuredValue: 0.015, upperTolerance: 0.01, lowerTolerance: 0, tolerance: 0.02, unit: 'mm' },
    { id: '7', featureName: 'Surface B - Position', featureType: 'position', axis: 'X', nominalValue: 50.000, measuredValue: 49.978, upperTolerance: 0.075, lowerTolerance: -0.075, tolerance: 0.15, unit: 'mm' },
    { id: '8', featureName: 'Surface B - Position', featureType: 'position', axis: 'Y', nominalValue: 15.000, measuredValue: 15.045, upperTolerance: 0.075, lowerTolerance: -0.075, tolerance: 0.15, unit: 'mm' },
    { id: '9', featureName: 'Bore D - Cylindricity', featureType: 'cylindricity', nominalValue: 0.000, measuredValue: 0.008, upperTolerance: 0.005, lowerTolerance: 0, tolerance: 0.01, unit: 'mm' },
    { id: '10', featureName: 'Hole E - Position', featureType: 'position', axis: 'X', nominalValue: 75.000, measuredValue: 75.022, upperTolerance: 0.04, lowerTolerance: -0.04, tolerance: 0.08, unit: 'mm' },
    { id: '11', featureName: 'Hole E - Position', featureType: 'position', axis: 'Y', nominalValue: 30.000, measuredValue: 30.018, upperTolerance: 0.04, lowerTolerance: -0.04, tolerance: 0.08, unit: 'mm' },
    { id: '12', featureName: 'Step Height', featureType: 'distance', nominalValue: 12.500, measuredValue: 12.535, upperTolerance: 0.05, lowerTolerance: -0.05, tolerance: 0.1, unit: 'mm' },
  ];
}
