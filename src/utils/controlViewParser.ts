import { CMMMeasurement } from '../types';

export interface ControlViewHeader {
  controlViewName: string;
  units: string;
  coordinateSystems: string;
  dataAlignments: string[];
  statistics: {
    total: number;
    measured: number;
    measuredPercent: number;
    pass: number;
    passPercent: number;
    fail: number;
    failPercent: number;
    warning: number;
    warningPercent: number;
  };
}

export interface ControlViewReport {
  header: ControlViewHeader;
  measurements: CMMMeasurement[];
  rawText: string;
}

export function parseControlViewReport(text: string): ControlViewReport {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  // Parse header
  const header: ControlViewHeader = {
    controlViewName: '',
    units: 'Millimeters',
    coordinateSystems: '',
    dataAlignments: [],
    statistics: {
      total: 0,
      measured: 0,
      measuredPercent: 0,
      pass: 0,
      passPercent: 0,
      fail: 0,
      failPercent: 0,
      warning: 0,
      warningPercent: 0,
    },
  };

  const measurements: CMMMeasurement[] = [];
  let currentFeature = '';
  let measurementIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Parse Control View Name
    if (line.startsWith('Control View Name')) {
      header.controlViewName = line.replace('Control View Name', '').trim();
    }
    
    // Parse Units
    if (line.startsWith('Units')) {
      header.units = line.replace('Units', '').trim();
    }
    
    // Parse Coordinate Systems
    if (line.startsWith('Coordinate Systems')) {
      header.coordinateSystems = line.replace('Coordinate Systems', '').trim();
    }
    
    // Parse Data Alignments
    if (line.startsWith('Data Alignments')) {
      const alignments = line.replace('Data Alignments', '').trim();
      header.dataAlignments = alignments.split(',').map(a => a.trim());
    }
    
    // Parse Statistics
    if (line.startsWith('All Statistics')) {
      const statsMatch = line.match(/Total:\s*(\d+).*?Measured:\s*(\d+)\s*\(([\d.]+)%\).*?Pass:\s*(\d+)\s*\(([\d.]+)%\).*?Fail:\s*(\d+)\s*\(([\d.]+)%\).*?Warning:\s*(\d+)\s*\(([\d.]+)%\)/);
      if (statsMatch) {
        header.statistics = {
          total: parseInt(statsMatch[1]),
          measured: parseInt(statsMatch[2]),
          measuredPercent: parseFloat(statsMatch[3]),
          pass: parseInt(statsMatch[4]),
          passPercent: parseFloat(statsMatch[5]),
          fail: parseInt(statsMatch[6]),
          failPercent: parseFloat(statsMatch[7]),
          warning: parseInt(statsMatch[8]),
          warningPercent: parseFloat(statsMatch[9]),
        };
      }
    }

    // Parse measurement lines
    // Format: Object Name, Control, Nom, Meas, Tol, Dev, Test, Out Tol
    // Some lines are feature headers (no measurements), some are actual measurements
    
    // Check if this is a feature header (position tolerance)
    const positionMatch = line.match(/^(circle|point|surf pt|line|plane)\s+\S+\s+Position\s+/);
    if (positionMatch) {
      currentFeature = line.split(/\s+/)[0] + ' ' + line.split(/\s+/)[1];
      continue;
    }

    // Check if this is a measurement line
    // Pattern: Name Control Nom Meas Tol Dev Test OutTol
    const parts = line.split(/\s+/);
    if (parts.length >= 6) {
      // Try to parse as measurement
      const measurement = tryParseMeasurementLine(line, measurementIndex++, currentFeature);
      if (measurement) {
        measurements.push(measurement);
      }
    }
  }

  return {
    header,
    measurements,
    rawText: text,
  };
}

function tryParseMeasurementLine(line: string, index: number, parentFeature: string): CMMMeasurement | null {
  const parts = line.split(/\s+/);
  
  // Try different patterns
  // Pattern 1: Name Control Nom Meas ±Tol Dev Test OutTol
  // Pattern 2: Name Control Nom ±Tol Dev Test OutTol (no measured value yet)
  
  let objectName = '';
  let control = '';
  let nominal = 0;
  let measured = 0;
  let tolerance = 0;
  let deviation = 0;
  let test = '';
  let outTol = 0;
  
  // Find the control type (X, Y, Z, Position, Surface Distance, Midpoint, etc.)
  const controlTypes = ['X', 'Y', 'Z', 'Position', 'Surface Distance', 'Midpoint X', 'Midpoint Y', 'Midpoint Z'];
  let controlIndex = -1;
  
  for (let i = 0; i < parts.length; i++) {
    if (controlTypes.includes(parts[i])) {
      controlIndex = i;
      control = parts[i];
      break;
    }
  }
  
  if (controlIndex === -1) return null;
  
  // Object name is everything before control
  objectName = parts.slice(0, controlIndex).join(' ');
  
  // If no object name, use parent feature
  if (!objectName && parentFeature) {
    objectName = parentFeature;
  }
  
  // Parse numbers after control
  const remaining = parts.slice(controlIndex + 1);
  
  // Look for tolerance pattern (±number)
  let tolIndex = -1;
  for (let i = 0; i < remaining.length; i++) {
    if (remaining[i].startsWith('±')) {
      tolIndex = i;
      tolerance = parseFloat(remaining[i].replace('±', ''));
      break;
    }
  }
  
  if (tolIndex === -1) return null;
  
  // Parse nominal and measured (if present)
  const beforeTol = remaining.slice(0, tolIndex);
  if (beforeTol.length === 2) {
    nominal = parseFloat(beforeTol[0]);
    measured = parseFloat(beforeTol[1]);
  } else if (beforeTol.length === 1) {
    // Only nominal or only measured
    const val = parseFloat(beforeTol[0]);
    if (!isNaN(val)) {
      // Check if next value after tolerance is deviation
      if (remaining.length > tolIndex + 1) {
        const nextVal = parseFloat(remaining[tolIndex + 1]);
        if (!isNaN(nextVal)) {
          // This is deviation, so beforeTol[0] is nominal
          nominal = val;
          measured = nominal; // Will be updated with deviation
        }
      }
    }
  }
  
  // Parse deviation, test, outTol
  const afterTol = remaining.slice(tolIndex + 1);
  if (afterTol.length >= 1) {
    deviation = parseFloat(afterTol[0]);
    if (isNaN(deviation)) deviation = 0;
    
    // If we have measured value, use it; otherwise calculate from nominal + deviation
    if (measured === 0 && nominal !== 0) {
      measured = nominal + deviation;
    }
  }
  
  if (afterTol.length >= 2) {
    test = afterTol[1];
  }
  
  if (afterTol.length >= 3) {
    outTol = parseFloat(afterTol[2]);
    if (isNaN(outTol)) outTol = 0;
  }
  
  // Determine result
  const result: 'PASS' | 'FAIL' = test === 'Pass' ? 'PASS' : 'FAIL';
  
  // Determine feature type
  let featureType = 'position';
  if (objectName.includes('circle')) featureType = 'circle';
  else if (objectName.includes('point')) featureType = 'point';
  else if (objectName.includes('surf pt') || control === 'Surface Distance') featureType = 'surface';
  else if (control.includes('Midpoint')) featureType = 'midpoint';
  
  // Determine axis
  let axis: 'X' | 'Y' | 'Z' | undefined;
  if (control === 'X') axis = 'X';
  else if (control === 'Y') axis = 'Y';
  else if (control === 'Z') axis = 'Z';
  
  return {
    id: `CV-${index}`,
    reportId: 'control-view',
    featureId: objectName,
    characteristicId: `${objectName}-${control}`,
    characteristicName: `${objectName} ${control}`,
    featureType,
    nominalValue: nominal,
    actualValue: measured,
    deviation,
    usl: nominal + tolerance,
    lsl: nominal - tolerance,
    tolerance: tolerance * 2,
    result,
    partNumber: 'CONTROL-VIEW',
    projectId: 'PRJ-001',
    date: new Date().toISOString().split('T')[0],
    machine: 'CMM',
    sourceFile: 'control-view-report.txt',
    nominalX: axis === 'X' ? nominal : undefined,
    nominalY: axis === 'Y' ? nominal : undefined,
    nominalZ: axis === 'Z' ? nominal : undefined,
    actualX: axis === 'X' ? measured : undefined,
    actualY: axis === 'Y' ? measured : undefined,
    actualZ: axis === 'Z' ? measured : undefined,
    gdandtType: control === 'Position' ? 'Position' : control === 'Surface Distance' ? 'Surface Profile' : undefined,
  };
}

export function analyzeControlViewReport(report: ControlViewReport) {
  const { measurements } = report;
  
  // Group by feature
  const featureGroups = new Map<string, CMMMeasurement[]>();
  measurements.forEach(m => {
    const featureName = m.featureId;
    if (!featureGroups.has(featureName)) {
      featureGroups.set(featureName, []);
    }
    featureGroups.get(featureName)!.push(m);
  });
  
  // Group by axis
  const axisGroups = {
    X: measurements.filter(m => m.gdandtType !== 'Position' && m.characteristicName.includes(' X')),
    Y: measurements.filter(m => m.gdandtType !== 'Position' && m.characteristicName.includes(' Y')),
    Z: measurements.filter(m => m.gdandtType !== 'Position' && m.characteristicName.includes(' Z')),
    Position: measurements.filter(m => m.gdandtType === 'Position'),
    Surface: measurements.filter(m => m.featureType === 'surface'),
  };
  
  // Calculate statistics by axis
  const axisStats = {
    X: calculateAxisStats(axisGroups.X),
    Y: calculateAxisStats(axisGroups.Y),
    Z: calculateAxisStats(axisGroups.Z),
  };
  
  // Find worst offenders
  const sortedByDeviation = [...measurements]
    .filter(m => Math.abs(m.deviation) > 0)
    .sort((a, b) => Math.abs(b.deviation) - Math.abs(a.deviation));
  
  // Find systematic errors (all negative or all positive)
  const negativeDeviations = measurements.filter(m => m.deviation < -0.5);
  const positiveDeviations = measurements.filter(m => m.deviation > 0.5);
  
  return {
    featureGroups,
    axisGroups,
    axisStats,
    sortedByDeviation,
    negativeDeviations,
    positiveDeviations,
    totalFeatures: featureGroups.size,
  };
}

function calculateAxisStats(measurements: CMMMeasurement[]) {
  if (measurements.length === 0) {
    return {
      count: 0,
      avgDeviation: 0,
      maxDeviation: 0,
      minDeviation: 0,
      passCount: 0,
      failCount: 0,
    };
  }
  
  const deviations = measurements.map(m => m.deviation);
  const avgDeviation = deviations.reduce((s, d) => s + d, 0) / deviations.length;
  
  return {
    count: measurements.length,
    avgDeviation,
    maxDeviation: Math.max(...deviations),
    minDeviation: Math.min(...deviations),
    passCount: measurements.filter(m => m.result === 'PASS').length,
    failCount: measurements.filter(m => m.result === 'FAIL').length,
  };
}
