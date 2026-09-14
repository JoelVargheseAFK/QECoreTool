import { Project, ProductionRecord, CMMReport, CMMMeasurement, IncomingRecord, Characteristic, InProcessInspection, Fixture, Gauge, MSAGRRStudy, PFMEAEntry, ControlPlanEntry, CorrectiveAction, Investigation, KnowledgeSkill } from '../types';

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

export function generateInProcessInspections(): InProcessInspection[] {
  const inspections: InProcessInspection[] = [];
  const processes = ['CNC Milling', 'Drilling', 'Reaming', 'Boring', 'Turning'];
  const stations = ['ST-01', 'ST-02', 'ST-03', 'ST-04', 'ST-05'];
  const characteristics = ['Hole Diameter', 'Position', 'Surface Finish', 'Flatness', 'Concentricity'];
  const methods = ['CMM', 'Gauge', 'Micrometer', 'Profilometer', 'Visual'];
  const gauges = ['GAU-001', 'GAU-002', 'GAU-003', 'GAU-004', 'GAU-005'];
  const fixtures = ['FIX-001', 'FIX-002', 'FIX-003', 'FIX-004'];
  const inspectors = ['INS-001', 'INS-002', 'INS-003'];

  for (let i = 0; i < 50; i++) {
    const date = new Date(2026, 0, 1 + i);
    const spec = rand(0.01, 0.1);
    const measurement = rand(-spec * 1.2, spec * 1.2);
    inspections.push({
      id: `IPI-${i}`,
      projectId: i % 2 === 0 ? 'PRJ-001' : 'PRJ-002',
      process: processes[i % processes.length],
      station: stations[i % stations.length],
      partNumber: i % 2 === 0 ? 'AC-1042' : 'DT-7780',
      characteristic: characteristics[i % characteristics.length],
      specification: `±${spec.toFixed(3)} mm`,
      inspectionMethod: methods[i % methods.length],
      gauge: gauges[i % gauges.length],
      fixture: fixtures[i % fixtures.length],
      sampleSize: 5,
      frequency: 'Every 2 hours',
      measurement: parseFloat(measurement.toFixed(4)),
      result: Math.abs(measurement) > spec ? 'FAIL' : 'PASS',
      reactionPlan: 'Stop process, notify supervisor, contain parts',
      date: date.toISOString().split('T')[0],
      inspector: inspectors[i % inspectors.length],
    });
  }
  return inspections;
}

export function generateFixtures(): Fixture[] {
  const fixtures: Fixture[] = [];
  const parts = ['AC-1042', 'DT-7780', 'VD-3301'];
  const statuses: Fixture['verificationStatus'][] = ['Valid', 'Due Soon', 'Overdue', 'Out of Service'];

  for (let i = 0; i < 15; i++) {
    const lastVerif = new Date(2026, 0, 1 + i * 10);
    const nextDue = new Date(lastVerif);
    nextDue.setMonth(nextDue.getMonth() + 3);
    
    fixtures.push({
      id: `FIX-${i}`,
      fixtureId: `FIX-${String(i + 1).padStart(3, '0')}`,
      name: `Fixture ${String.fromCharCode(65 + i)}`,
      part: parts[i % parts.length],
      process: ['Milling', 'Drilling', 'Assembly'][i % 3],
      station: `ST-${(i % 5) + 1}`,
      characteristic: ['Position', 'Concentricity', 'Parallelism'][i % 3],
      datumA: `Datum A-${i}`,
      datumB: `Datum B-${i}`,
      datumC: i % 2 === 0 ? `Datum C-${i}` : '',
      locator: `LOC-${i}`,
      pin: `PIN-${i}`,
      clamp: `CLP-${i}`,
      nest: `NST-${i}`,
      masterPart: `MP-${i}`,
      verificationStatus: statuses[i % statuses.length],
      lastVerification: lastVerif.toISOString().split('T')[0],
      nextDue: nextDue.toISOString().split('T')[0],
      condition: i % 4 === 0 ? 'Good' : i % 4 === 1 ? 'Fair' : 'Needs Attention',
    });
  }
  return fixtures;
}

export function generateGauges(): Gauge[] {
  const gauges: Gauge[] = [];
  const types = ['CMM Probe', 'Go/No-Go', 'Micrometer', 'Caliper', 'Height Gauge', 'Bore Gauge'];
  const statuses: Gauge['calibrationStatus'][] = ['Valid', 'Due Soon', 'Overdue', 'Out of Service'];

  for (let i = 0; i < 20; i++) {
    const lastCal = new Date(2026, 0, 1 + i * 7);
    const nextDue = new Date(lastCal);
    nextDue.setMonth(nextDue.getMonth() + 6);
    
    gauges.push({
      id: `GAU-${i}`,
      gaugeId: `GAU-${String(i + 1).padStart(3, '0')}`,
      name: `${types[i % types.length]} ${i + 1}`,
      gaugeType: types[i % types.length],
      serialNumber: `SN-${10000 + i}`,
      part: i % 2 === 0 ? 'AC-1042' : 'DT-7780',
      characteristic: ['Diameter', 'Position', 'Flatness', 'Depth'][i % 4],
      calibrationStatus: statuses[i % statuses.length],
      lastCalibration: lastCal.toISOString().split('T')[0],
      nextDue: nextDue.toISOString().split('T')[0],
      location: `Lab ${i % 3 + 1}`,
      condition: i % 3 === 0 ? 'Excellent' : i % 3 === 1 ? 'Good' : 'Fair',
    });
  }
  return gauges;
}

export function generateMSAStudies(): MSAGRRStudy[] {
  const studies: MSAGRRStudy[] = [];
  const operators = ['OP-001', 'OP-002', 'OP-003'];
  const parts = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9', 'P10'];

  for (let i = 0; i < 8; i++) {
    const measurements: MSAGRRStudy['measurements'] = [];
    const baseValue = 10 + i * 0.5;
    
    operators.forEach(op => {
      parts.forEach((part, pi) => {
        for (let trial = 1; trial <= 3; trial++) {
          measurements.push({
            operator: op,
            part,
            trial,
            measurement: parseFloat((baseValue + pi * 0.1 + (Math.random() - 0.5) * 0.02).toFixed(4)),
          });
        }
      });
    });

    const repeatability = rand(0.001, 0.005);
    const reproducibility = rand(0.002, 0.008);
    const gaugeRR = Math.sqrt(repeatability ** 2 + reproducibility ** 2);
    const partToPart = rand(0.05, 0.15);
    const totalVariation = Math.sqrt(gaugeRR ** 2 + partToPart ** 2);
    const percentStudyVar = (gaugeRR / totalVariation) * 100;

    studies.push({
      id: `MSA-${i}`,
      projectId: i % 2 === 0 ? 'PRJ-001' : 'PRJ-002',
      part: i % 2 === 0 ? 'AC-1042' : 'DT-7780',
      characteristic: ['Hole Diameter', 'Position', 'Flatness'][i % 3],
      gauge: `GAU-${String(i + 1).padStart(3, '0')}`,
      operators,
      parts,
      trials: 3,
      measurements,
      repeatability,
      reproducibility,
      gaugeRR,
      partToPart,
      totalVariation,
      percentStudyVar,
      percentContribution: (gaugeRR ** 2 / totalVariation ** 2) * 100,
      acceptanceCriteria: 10,
      result: percentStudyVar < 10 ? 'Acceptable' : percentStudyVar < 30 ? 'Marginal' : 'Unacceptable',
      date: new Date(2026, 0, 1 + i * 15).toISOString().split('T')[0],
    });
  }
  return studies;
}

export function generatePFMEA(): PFMEAEntry[] {
  const entries: PFMEAEntry[] = [];
  const processSteps = ['Load Part', 'Clamp Part', 'Rough Mill', 'Finish Mill', 'Drill Holes', 'Ream Holes', 'Inspect', 'Unload Part'];
  const failureModes = ['Part mislocated', 'Part loose', 'Tool breakage', 'Dimensional error', 'Hole oversize', 'Hole position error', 'Surface defect', 'Part damage'];
  const statuses: PFMEAEntry['status'][] = ['Open', 'In Progress', 'Closed', 'Overdue'];

  for (let i = 0; i < 25; i++) {
    const severity = Math.floor(Math.random() * 10) + 1;
    const occurrence = Math.floor(Math.random() * 10) + 1;
    const detection = Math.floor(Math.random() * 10) + 1;
    const rpn = severity * occurrence * detection;

    entries.push({
      id: `PFMEA-${i}`,
      projectId: i % 2 === 0 ? 'PRJ-001' : 'PRJ-002',
      processStep: processSteps[i % processSteps.length],
      processFunction: `Perform ${processSteps[i % processSteps.length].toLowerCase()}`,
      failureMode: failureModes[i % failureModes.length],
      effect: 'Part out of specification',
      severity,
      cause: 'Tool wear, fixture issue, operator error',
      occurrence,
      preventionControl: 'Regular tool change, fixture verification',
      detectionControl: 'In-process inspection, CMM check',
      detection,
      rpn,
      action: rpn > 100 ? 'Implement additional control' : 'Monitor',
      responsible: `ENG-${(i % 3) + 1}`,
      dueDate: new Date(2026, 1, 1 + i * 5).toISOString().split('T')[0],
      status: statuses[i % statuses.length],
    });
  }
  return entries;
}

export function generateControlPlan(): ControlPlanEntry[] {
  const entries: ControlPlanEntry[] = [];
  const processSteps = ['Incoming', 'Milling', 'Drilling', 'Reaming', 'Final Inspection'];
  const characteristics = ['Material Cert', 'Hole Diameter', 'Position', 'Surface Finish', 'Visual'];
  const statuses: ControlPlanEntry['status'][] = ['Active', 'Review Required', 'Obsolete'];

  for (let i = 0; i < 20; i++) {
    const revDate = new Date(2026, 0, 1 + i * 10);
    
    entries.push({
      id: `CP-${i}`,
      projectId: i % 2 === 0 ? 'PRJ-001' : 'PRJ-002',
      processStep: processSteps[i % processSteps.length],
      productCharacteristic: characteristics[i % characteristics.length],
      processCharacteristic: ['Feed Rate', 'Speed', 'Depth', 'Coolant'][i % 4],
      specification: `±${rand(0.01, 0.1).toFixed(3)} mm`,
      specialCharacteristic: i % 3 === 0 ? 'CC' : i % 3 === 1 ? 'SC' : '',
      measurementMethod: ['CMM', 'Gauge', 'Visual', 'Micrometer'][i % 4],
      gauge: `GAU-${String((i % 5) + 1).padStart(3, '0')}`,
      fixture: `FIX-${String((i % 4) + 1).padStart(3, '0')}`,
      sampleSize: [1, 5, 10, 100][i % 4],
      frequency: ['100%', 'Every 2 hrs', 'Every shift', 'Per lot'][i % 4],
      controlMethod: 'SPC chart, inspection record',
      reactionPlan: 'Stop process, contain, notify supervisor',
      responsible: `QE-${(i % 3) + 1}`,
      revision: `Rev ${String.fromCharCode(65 + (i % 5))}`,
      revisionDate: revDate.toISOString().split('T')[0],
      changeDescription: 'Updated specification',
      approvedBy: `MGR-${(i % 2) + 1}`,
      status: statuses[i % statuses.length],
    });
  }
  return entries;
}

export function generateCorrectiveActions(): CorrectiveAction[] {
  const actions: CorrectiveAction[] = [];
  const defects = ['Oversize Hole', 'Position OOT', 'Surface Defect', 'Flatness OOT', 'Burr'];
  const statuses: CorrectiveAction['status'][] = ['Open', 'In Progress', 'Verification', 'Closed'];

  for (let i = 0; i < 12; i++) {
    const date = new Date(2026, 0, 1 + i * 8);
    const dueDate = new Date(date);
    dueDate.setDate(dueDate.getDate() + 30);

    actions.push({
      id: `8D-${i}`,
      issueId: `ISS-${2026}${String(i + 1).padStart(3, '0')}`,
      projectId: i % 2 === 0 ? 'PRJ-001' : 'PRJ-002',
      part: i % 2 === 0 ? 'AC-1042' : 'DT-7780',
      process: ['Milling', 'Drilling', 'Reaming'][i % 3],
      defect: defects[i % defects.length],
      characteristic: ['Hole Diameter', 'Position', 'Surface Finish'][i % 3],
      date: date.toISOString().split('T')[0],
      d1Team: 'QE Team, Process Engineer, Operator',
      d2Problem: `${defects[i % defects.length]} on ${i % 2 === 0 ? 'AC-1042' : 'DT-7780'}`,
      d3Containment: 'Sort all parts, quarantine suspect lot',
      d4RootCause: i % 3 === 0 ? 'Tool wear exceeded limit' : i % 3 === 1 ? 'Fixture locator worn' : 'Coolant concentration low',
      d5CorrectiveAction: i % 3 === 0 ? 'Reduce tool life by 20%' : i % 3 === 1 ? 'Replace fixture locators' : 'Increase coolant concentration check frequency',
      d6Implementation: 'Update tool life program, install new locators, revise coolant procedure',
      d7Effectiveness: i < 6 ? 'Verified - defect rate reduced by 80%' : 'Pending verification',
      d8Closure: i < 4 ? 'Closed - effective' : '',
      responsible: `ENG-${(i % 3) + 1}`,
      dueDate: dueDate.toISOString().split('T')[0],
      verification: i < 6 ? 'CMM data shows improvement' : 'In progress',
      status: statuses[i % statuses.length],
      beforeCpk: i % 2 === 0 ? 0.95 : 1.05,
      afterCpk: i < 6 ? 1.45 : undefined,
      beforePpm: 15000,
      afterPpm: i < 6 ? 3000 : undefined,
      beforeScrap: 50,
      afterScrap: i < 6 ? 10 : undefined,
    });
  }
  return actions;
}

export function generateInvestigations(): Investigation[] {
  const investigations: Investigation[] = [];
  const problemTypes: Investigation['problemType'][] = ['Defect', 'CMM Characteristic', 'Scrap Issue', 'Process Issue'];
  const statuses: Investigation['status'][] = ['Open', 'Investigating', 'Root Cause Identified', 'Action Taken', 'Closed'];

  for (let i = 0; i < 8; i++) {
    const date = new Date(2026, 0, 1 + i * 10);
    
    investigations.push({
      id: `INV-${i}`,
      projectId: i % 2 === 0 ? 'PRJ-001' : 'PRJ-002',
      problemType: problemTypes[i % problemTypes.length],
      problemDescription: `Investigation ${i + 1}: ${problemTypes[i % problemTypes.length]} on characteristic`,
      characteristic: ['Hole Diameter', 'Position', 'Flatness'][i % 3],
      part: i % 2 === 0 ? 'AC-1042' : 'DT-7780',
      specification: '±0.05 mm',
      actual: parseFloat((0.05 + rand(0, 0.03)).toFixed(4)),
      deviation: parseFloat(rand(0.05, 0.08).toFixed(4)),
      passFail: 'FAIL',
      dateRange: {
        from: date.toISOString().split('T')[0],
        to: new Date(date.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      },
      machine: `CNC-${String((i % 3) + 1).padStart(2, '0')}`,
      process: ['Milling', 'Drilling', 'Reaming'][i % 3],
      station: `ST-${(i % 5) + 1}`,
      shift: ['Day', 'Swing', 'Night'][i % 3],
      serialNumber: `SN-${10000 + i}`,
      lot: `LOT-${2026}${String(i + 1).padStart(3, '0')}`,
      supplier: i % 2 === 0 ? 'SteelCo Inc' : 'AlumWorks LLC',
      gauge: `GAU-${String((i % 5) + 1).padStart(3, '0')}`,
      fixture: `FIX-${String((i % 4) + 1).padStart(3, '0')}`,
      potentialContributors: [
        {
          factor: `Machine CNC-${String((i % 3) + 1).padStart(2, '0')}`,
          type: 'Machine',
          evidence: 'Higher failure rate observed on this machine',
          association: i % 3 === 0 ? 'Strong' : 'Moderate',
        },
        {
          factor: 'Night Shift',
          type: 'Shift',
          evidence: 'Observed association with increased defects',
          association: 'Moderate',
        },
        {
          factor: `Fixture FIX-${String((i % 4) + 1).padStart(3, '0')}`,
          type: 'Fixture',
          evidence: 'Requires investigation - locator wear suspected',
          association: 'Weak',
        },
      ],
      correctiveActionId: i < 4 ? `8D-${i}` : undefined,
      status: statuses[i % statuses.length],
      date: date.toISOString().split('T')[0],
    });
  }
  return investigations;
}

export function generateKnowledgeMatrix(): KnowledgeSkill[] {
  const skills: KnowledgeSkill[] = [];
  const categories = [
    'Product/Drawing', 'GD&T', 'CMM', 'SPC', 'Capability', 'PFMEA', 
    'Control Plan', '8D', 'MSA', 'GR&R', 'Supplier Quality', 'Auditing'
  ];
  const skillNames = [
    'Reading drawings', 'GD&T interpretation', 'CMM programming', 'SPC charting',
    'Capability analysis', 'PFMEA development', 'Control plan creation', '8D facilitation',
    'MSA planning', 'GR&R execution', 'Supplier audits', 'Process audits'
  ];
  const competencies: KnowledgeSkill['competency'][] = ['Observe', 'Assist', 'Perform', 'Lead', 'Teach'];
  const statuses: KnowledgeSkill['status'][] = ['Not Started', 'In Progress', 'Completed'];

  for (let i = 0; i < 30; i++) {
    const required = Math.floor(Math.random() * 5);
    const current = Math.floor(Math.random() * 5);
    
    skills.push({
      id: `SKILL-${i}`,
      category: categories[i % categories.length],
      skill: skillNames[i % skillNames.length],
      requiredLevel: required,
      currentLevel: current,
      gap: required - current,
      evidence: i % 2 === 0 ? 'Training completed' : 'On-the-job experience',
      project: i % 2 === 0 ? 'PRJ-001' : 'PRJ-002',
      action: current < required ? 'Schedule training' : 'Maintain competency',
      targetDate: new Date(2026, 3, 1 + i * 10).toISOString().split('T')[0],
      status: statuses[i % statuses.length],
      competency: competencies[i % competencies.length],
    });
  }
  return skills;
}
