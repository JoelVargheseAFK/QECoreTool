import { Project, ProductionRecord, CMMReport, CMMMeasurement, IncomingRecord, Characteristic } from '../types';

const rand = (min: number, max: number, dec = 3) => parseFloat((Math.random() * (max - min) + min).toFixed(dec));

export function generateSampleProjects(): Project[] {
  return [
    {
      id: 'PRJ-001', name: 'Circle & GD&T Bracket', customer: 'AutoCorp Alpha',
      partNumber: 'AC-1042', partName: 'Mounting Bracket Assembly', program: 'REV-C',
      revision: 'C', process: 'CNC Milling', plant: 'Plant A - Detroit',
      status: 'active', startDate: '2025-06-01', notes: 'GD&T critical features: position, profile, flatness',
      cmmReportCount: 48, partCount: 3, characteristicCount: 24, productionQty: 12500, scrapQty: 187, defectCount: 234,
    },
    {
      id: 'PRJ-002', name: 'Multi-Hole Transmission Case', customer: 'DriveTech Beta',
      partNumber: 'DT-7780', partName: 'Transmission Housing', program: 'REV-B',
      revision: 'B', process: 'CNC Turning + Drilling', plant: 'Plant B - Toledo',
      status: 'active', startDate: '2025-03-15', notes: 'Hundreds of holes and probe points. X/Y/Z coordinates critical.',
      cmmReportCount: 62, partCount: 5, characteristicCount: 156, productionQty: 8200, scrapQty: 312, defectCount: 489,
    },
    {
      id: 'PRJ-003', name: 'EV Battery Tray', customer: 'VoltDrive Gamma',
      partNumber: 'VD-3301', partName: 'Battery Enclosure Tray', program: 'REV-A',
      revision: 'A', process: 'Stamping + Welding', plant: 'Plant A - Detroit',
      status: 'draft', startDate: '2026-01-10', notes: 'New program launch. Flatness and weld position critical.',
      cmmReportCount: 12, partCount: 2, characteristicCount: 38, productionQty: 3400, scrapQty: 98, defectCount: 112,
    },
  ];
}

export function generateSampleProduction(): ProductionRecord[] {
  const records: ProductionRecord[] = [];
  const machines = ['CNC-01', 'CNC-02', 'CNC-03', 'Drill-01', 'Mill-01'];
  const shifts = ['Day', 'Swing', 'Night'];
  const defects = ['Oversize Hole', 'Position OOT', 'Surface Finish', 'Flatness OOT', 'Burr', 'Chip Mark', 'Tool Chatter'];
  const processes = ['Rough Mill', 'Finish Mill', 'Drilling', 'Reaming', 'Boring'];
  const lines = ['Line A', 'Line B', 'Line C'];

  for (let d = 0; d < 60; d++) {
    const date = new Date(2026, 0, 1 + d);
    const dateStr = date.toISOString().split('T')[0];
    const machine = machines[d % machines.length];
    const shift = shifts[d % shifts.length];
    const process = processes[d % processes.length];
    const line = lines[d % lines.length];
    const defect = defects[d % defects.length];
    const prodQty = 150 + Math.floor(Math.random() * 80);
    const defectQty = Math.floor(Math.random() * 12);
    const scrapQty = Math.floor(defectQty * (0.5 + Math.random() * 0.3));
    const reworkQty = defectQty - scrapQty;

    records.push({
      id: `PROD-${d}`,
      date: dateStr,
      time: `${String(6 + (d % 12)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
      projectId: d % 3 === 0 ? 'PRJ-002' : 'PRJ-001',
      partNumber: d % 3 === 0 ? 'DT-7780' : 'AC-1042',
      serialNumber: `SN-${10000 + d}`,
      lot: `LOT-${2026}${String(Math.floor(d / 7) + 1).padStart(3, '0')}`,
      productionQty: prodQty,
      inspectionQty: Math.floor(prodQty * 0.2),
      defectQty,
      scrapQty,
      reworkQty,
      defectType: defect,
      machine,
      line,
      process,
      station: `ST-${(d % 5) + 1}`,
      shift,
      operator: `OP-${(d % 8) + 1}`,
      fixtureId: `FIX-${(d % 4) + 1}`,
      gaugeId: `GAU-${(d % 3) + 1}`,
      toolId: `TOOL-${(d % 6) + 1}`,
      supplier: d % 4 === 0 ? 'SteelCo Inc' : 'AlumWorks LLC',
      cycleTime: rand(45, 120, 1),
      scrapCostPerPart: rand(12, 45, 2),
      reworkCostPerPart: rand(5, 18, 2),
    });
  }
  return records;
}

export function generateSampleCMMMeasurements(projectId: string, reportId: string, date: string, serialNumber: string, sourceFile: string): CMMMeasurement[] {
  const measurements: CMMMeasurement[] = [];
  const isCircleProject = projectId === 'PRJ-001';
  const count = isCircleProject ? 24 : 40;

  for (let i = 0; i < count; i++) {
    const featureId = isCircleProject ? `FEAT-C${String(i + 1).padStart(3, '0')}` : `HOLE-${String(i + 1).padStart(3, '0')}`;
    const charId = `CHAR-${projectId}-${i + 1}`;
    const featureType = isCircleProject
      ? ['Circle', 'Position', 'Profile', 'Flatness', 'Perpendicularity', 'Diameter'][i % 6]
      : ['Hole', 'Point', 'Circle', 'Distance', 'Depth', 'Position'][i % 6];

    const nominal = isCircleProject ? rand(10, 80) : rand(5, 150);
    const tolerance = isCircleProject ? rand(0.02, 0.15) : rand(0.05, 0.25);
    const deviation = rand(-tolerance * 0.8, tolerance * 0.8);
    const actual = nominal + deviation;
    const usl = nominal + tolerance;
    const lsl = nominal - tolerance;
    const result = Math.abs(deviation) > tolerance ? 'FAIL' : 'PASS';

    const m: CMMMeasurement = {
      id: `M-${reportId}-${i}`,
      reportId,
      featureId,
      characteristicId: charId,
      characteristicName: `${featureType} ${featureId}`,
      featureType,
      nominalValue: nominal,
      actualValue: parseFloat(actual.toFixed(4)),
      deviation: parseFloat(deviation.toFixed(4)),
      usl: parseFloat(usl.toFixed(4)),
      lsl: parseFloat(lsl.toFixed(4)),
      tolerance: parseFloat((tolerance * 2).toFixed(4)),
      result,
      partNumber: projectId === 'PRJ-001' ? 'AC-1042' : 'DT-7780',
      projectId,
      date,
      machine: 'CMM-Zeiss-01',
      sourceFile,
    };

    if (!isCircleProject) {
      const nomX = rand(10, 200);
      const nomY = rand(10, 150);
      const nomZ = rand(0, 50);
      m.nominalX = parseFloat(nomX.toFixed(3));
      m.nominalY = parseFloat(nomY.toFixed(3));
      m.nominalZ = parseFloat(nomZ.toFixed(3));
      m.actualX = parseFloat((nomX + rand(-0.1, 0.1)).toFixed(3));
      m.actualY = parseFloat((nomY + rand(-0.1, 0.1)).toFixed(3));
      m.actualZ = parseFloat((nomZ + rand(-0.05, 0.05)).toFixed(3));
    }

    measurements.push(m);
  }
  return measurements;
}

export function generateSampleCMMReports(): CMMReport[] {
  const reports: CMMReport[] = [];
  const projects = ['PRJ-001', 'PRJ-002'];

  for (let r = 0; r < 30; r++) {
    const projectId = projects[r % 2];
    const date = new Date(2026, 0, 1 + r * 2);
    const dateStr = date.toISOString().split('T')[0];
    const serialNumber = `SN-${10000 + r}`;
    const fileName = `CMM_${dateStr}_${String(r + 1).padStart(3, '0')}.xlsx`;
    const reportId = `RPT-${String(r + 1).padStart(3, '0')}`;
    const measurements = generateSampleCMMMeasurements(projectId, reportId, dateStr, serialNumber, fileName);

    reports.push({
      id: reportId,
      fileName,
      projectId,
      partNumber: projectId === 'PRJ-001' ? 'AC-1042' : 'DT-7780',
      serialNumber,
      date: dateStr,
      time: `${String(8 + (r % 10)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
      cmmMachine: 'Zeiss CONTURA',
      program: projectId === 'PRJ-001' ? 'BRACKET_V3' : 'TRANSCASE_V2',
      revision: projectId === 'PRJ-001' ? 'C' : 'B',
      measurementCount: measurements.length,
      importStatus: 'success',
      measurements,
    });
  }
  return reports;
}

export function generateSampleIncoming(): IncomingRecord[] {
  const suppliers = ['SteelCo Inc', 'AlumWorks LLC', 'FastenerPro', 'CastParts Ltd', 'SealTech'];
  const records: IncomingRecord[] = [];
  for (let i = 0; i < 40; i++) {
    const supplier = suppliers[i % suppliers.length];
    const qtyReceived = 500 + Math.floor(Math.random() * 2000);
    const qtyInspected = Math.floor(qtyReceived * 0.1);
    const qtyRejected = Math.floor(Math.random() * (qtyInspected * 0.08));
    const qtyAccepted = qtyInspected - qtyRejected;
    const date = new Date(2026, 0, 1 + i);
    records.push({
      id: `INC-${i}`,
      supplier,
      partNumber: i % 2 === 0 ? 'AC-1042' : 'DT-7780',
      partName: i % 2 === 0 ? 'Mounting Bracket' : 'Transmission Housing',
      lot: `LOT-IN-${2026}${String(Math.floor(i / 5) + 1).padStart(3, '0')}`,
      date: date.toISOString().split('T')[0],
      qtyReceived,
      qtyInspected,
      qtyAccepted,
      qtyRejected,
      defect: ['Dimensional', 'Surface', 'Material', 'Thread', 'Coating'][i % 5],
      inspectionMethod: ['CMM', 'Gauge', 'Visual', 'Hardness'][i % 4],
      gauge: `GAU-${(i % 5) + 1}`,
      inspector: `QC-${(i % 4) + 1}`,
      result: qtyRejected > 0 ? 'REJECT' : 'ACCEPT',
      projectId: i % 2 === 0 ? 'PRJ-001' : 'PRJ-002',
    });
  }
  return records;
}

export function generateCharacteristics(reports: CMMReport[]): Characteristic[] {
  const charMap = new Map<string, Characteristic>();
  reports.forEach(r => {
    r.measurements.forEach(m => {
      if (!charMap.has(m.characteristicId)) {
        charMap.set(m.characteristicId, {
          id: m.characteristicId,
          name: m.characteristicName,
          featureType: m.featureType,
          nominal: m.nominalValue,
          usl: m.usl,
          lsl: m.lsl,
          target: m.nominalValue,
          tolerance: m.tolerance,
          gdandtType: m.gdandtType,
          projectId: m.projectId,
          partNumber: m.partNumber,
          measurementHistory: [],
        });
      }
      charMap.get(m.characteristicId)!.measurementHistory.push(m);
    });
  });
  return Array.from(charMap.values());
}
