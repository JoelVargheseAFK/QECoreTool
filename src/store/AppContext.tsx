import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Project, ProductionRecord, CMMReport, CMMMeasurement, Characteristic, IncomingRecord, AppFilters, PageKey, InProcessInspection, Fixture, Gauge, MSAGRRStudy, PFMEAEntry, ControlPlanEntry, CorrectiveAction, Investigation, KnowledgeSkill } from '../types';
import { generateSampleProjects, generateSampleProduction, generateSampleCMMReports, generateSampleIncoming, generateCharacteristics, generateInProcessInspections, generateFixtures, generateGauges, generateMSAStudies, generatePFMEA, generateControlPlan, generateCorrectiveActions, generateInvestigations, generateKnowledgeMatrix } from '../data/sampleData';
import { saveToStorage, loadFromStorage, exportData, importData, clearStorage } from '../utils/storage';

interface AppState {
  projects: Project[];
  activeProjectId: string;
  production: ProductionRecord[];
  cmmReports: CMMReport[];
  characteristics: Characteristic[];
  incomingRecords: IncomingRecord[];
  inProcessInspections: InProcessInspection[];
  fixtures: Fixture[];
  gauges: Gauge[];
  msaStudies: MSAGRRStudy[];
  pfmeaEntries: PFMEAEntry[];
  controlPlanEntries: ControlPlanEntry[];
  correctiveActions: CorrectiveAction[];
  investigations: Investigation[];
  knowledgeSkills: KnowledgeSkill[];
  filters: AppFilters;
  currentPage: PageKey;
  sidebarCollapsed: boolean;
}

interface AppContextType extends AppState {
  setActiveProject: (id: string) => void;
  setCurrentPage: (page: PageKey) => void;
  setFilters: (filters: Partial<AppFilters>) => void;
  toggleSidebar: () => void;
  addProject: (project: Project) => void;
  updateProject: (project: Project) => void;
  duplicateProject: (id: string) => void;
  archiveProject: (id: string) => void;
  deleteProject: (id: string) => void;
  addProductionRecords: (records: ProductionRecord[]) => void;
  addCMMReports: (reports: CMMReport[]) => void;
  addIncomingRecords: (records: IncomingRecord[]) => void;
  addInvestigation: (inv: Investigation) => void;
  updateInvestigation: (inv: Investigation) => void;
  addCorrectiveAction: (action: CorrectiveAction) => void;
  updateCorrectiveAction: (action: CorrectiveAction) => void;
  getFilteredProduction: () => ProductionRecord[];
  getFilteredCMMMeasurements: () => CMMMeasurement[];
  getFilteredIncoming: () => IncomingRecord[];
  getFilteredInProcess: () => InProcessInspection[];
  getActiveProject: () => Project | undefined;
  exportAllData: () => void;
  importData: (jsonString: string) => boolean;
  clearAllData: () => void;
  lastSaved: string | null;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  // Load data from localStorage or use sample data
  const storedData = loadFromStorage();
  
  const [projects, setProjects] = useState<Project[]>(storedData?.projects || generateSampleProjects());
  const [activeProjectId, setActiveProjectId] = useState(storedData?.activeProjectId || 'PRJ-001');
  const [production, setProduction] = useState<ProductionRecord[]>(storedData?.production || generateSampleProduction());
  const [cmmReports, setCmmReports] = useState<CMMReport[]>(storedData?.cmmReports || generateSampleCMMReports());
  const [characteristics, setCharacteristics] = useState<Characteristic[]>(
    storedData?.characteristics || (() => generateCharacteristics(generateSampleCMMReports()))()
  );
  const [incomingRecords, setIncomingRecords] = useState<IncomingRecord[]>(storedData?.incomingRecords || generateSampleIncoming());
  const [inProcessInspections, setInProcessInspections] = useState<InProcessInspection[]>(
    storedData?.inProcessInspections || generateInProcessInspections()
  );
  const [fixtures, setFixtures] = useState<Fixture[]>(storedData?.fixtures || generateFixtures());
  const [gauges, setGauges] = useState<Gauge[]>(storedData?.gauges || generateGauges());
  const [msaStudies, setMsaStudies] = useState<MSAGRRStudy[]>(storedData?.msaStudies || generateMSAStudies());
  const [pfmeaEntries, setPfmeaEntries] = useState<PFMEAEntry[]>(storedData?.pfmeaEntries || generatePFMEA());
  const [controlPlanEntries, setControlPlanEntries] = useState<ControlPlanEntry[]>(storedData?.controlPlanEntries || generateControlPlan());
  const [correctiveActions, setCorrectiveActions] = useState<CorrectiveAction[]>(storedData?.correctiveActions || generateCorrectiveActions());
  const [investigations, setInvestigations] = useState<Investigation[]>(storedData?.investigations || generateInvestigations());
  const [knowledgeSkills, setKnowledgeSkills] = useState<KnowledgeSkill[]>(storedData?.knowledgeSkills || generateKnowledgeMatrix());
  const [filters, setFiltersState] = useState<AppFilters>({
    projectId: 'all',
    partNumber: '',
    dateFrom: '',
    dateTo: '',
    machine: '',
    process: '',
    shift: '',
  });
  const [currentPage, setCurrentPage] = useState<PageKey>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(storedData?.lastSaved || null);

  const setActiveProject = useCallback((id: string) => {
    setActiveProjectId(id);
    setFiltersState(prev => ({ ...prev, projectId: id }));
  }, []);

  const setFilters = useCallback((f: Partial<AppFilters>) => {
    setFiltersState(prev => ({ ...prev, ...f }));
  }, []);

  const toggleSidebar = useCallback(() => setSidebarCollapsed(p => !p), []);

  const addProject = useCallback((project: Project) => {
    setProjects(prev => [...prev, project]);
  }, []);

  const updateProject = useCallback((project: Project) => {
    setProjects(prev => prev.map(p => p.id === project.id ? project : p));
  }, []);

  const duplicateProject = useCallback((id: string) => {
    setProjects(prev => {
      const original = prev.find(p => p.id === id);
      if (!original) return prev;
      const newId = `PRJ-${String(prev.length + 1).padStart(3, '0')}`;
      return [...prev, { ...original, id: newId, name: `${original.name} (Copy)`, status: 'draft' as const }];
    });
  }, []);

  const archiveProject = useCallback((id: string) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, status: 'archived' as const } : p));
  }, []);

  const deleteProject = useCallback((id: string) => {
    setProjects(prev => {
      const filtered = prev.filter(p => p.id !== id);
      // If deleting the active project, switch to first available project
      if (id === activeProjectId && filtered.length > 0) {
        const firstAvailable = filtered.find(p => p.status !== 'archived') || filtered[0];
        setActiveProjectId(firstAvailable.id);
        setFiltersState(f => ({ ...f, projectId: firstAvailable.id }));
      }
      return filtered;
    });
  }, [activeProjectId]);

  const addProductionRecords = useCallback((_records: ProductionRecord[]) => {
    // In a real app, this would update state
  }, []);

  const addCMMReports = useCallback((_reports: CMMReport[]) => {
    // In a real app, this would update state
  }, []);

  const addIncomingRecords = useCallback((_records: IncomingRecord[]) => {
    // In a real app, this would update state
  }, []);

  const addInvestigation = useCallback((inv: Investigation) => {
    setInvestigations(prev => [...prev, inv]);
  }, []);

  const updateInvestigation = useCallback((inv: Investigation) => {
    setInvestigations(prev => prev.map(i => i.id === inv.id ? inv : i));
  }, []);

  const addCorrectiveAction = useCallback((action: CorrectiveAction) => {
    setCorrectiveActions(prev => [...prev, action]);
  }, []);

  const updateCorrectiveAction = useCallback((action: CorrectiveAction) => {
    setCorrectiveActions(prev => prev.map(a => a.id === action.id ? action : a));
  }, []);

  const getActiveProject = useCallback(() => {
    return projects.find(p => p.id === activeProjectId);
  }, [projects, activeProjectId]);

  const getFilteredProduction = useCallback(() => {
    return production.filter(r => {
      if (filters.projectId !== 'all' && r.projectId !== filters.projectId) return false;
      if (filters.projectId === 'all' && activeProjectId && r.projectId !== activeProjectId) return false;
      if (filters.machine && r.machine !== filters.machine) return false;
      if (filters.process && r.process !== filters.process) return false;
      if (filters.shift && r.shift !== filters.shift) return false;
      if (filters.dateFrom && r.date < filters.dateFrom) return false;
      if (filters.dateTo && r.date > filters.dateTo) return false;
      return true;
    });
  }, [production, filters, activeProjectId]);

  const getFilteredCMMMeasurements = useCallback(() => {
    const allMeasurements: CMMMeasurement[] = [];
    cmmReports.forEach(r => {
      if (filters.projectId !== 'all' && r.projectId !== filters.projectId) return;
      if (filters.projectId === 'all' && activeProjectId && r.projectId !== activeProjectId) return;
      r.measurements.forEach(m => {
        if (filters.dateFrom && m.date < filters.dateFrom) return;
        if (filters.dateTo && m.date > filters.dateTo) return;
        allMeasurements.push(m);
      });
    });
    return allMeasurements;
  }, [cmmReports, filters, activeProjectId]);

  const getFilteredIncoming = useCallback(() => {
    return incomingRecords.filter(r => {
      if (filters.projectId !== 'all' && r.projectId !== filters.projectId) return false;
      if (filters.projectId === 'all' && activeProjectId && r.projectId !== activeProjectId) return false;
      return true;
    });
  }, [incomingRecords, filters, activeProjectId]);

  const getFilteredInProcess = useCallback(() => {
    return inProcessInspections.filter(r => {
      if (filters.projectId !== 'all' && r.projectId !== filters.projectId) return false;
      if (filters.projectId === 'all' && activeProjectId && r.projectId !== activeProjectId) return false;
      return true;
    });
  }, [inProcessInspections, filters, activeProjectId]);

  // Auto-save to localStorage whenever data changes
  useEffect(() => {
    const dataToSave = {
      projects,
      activeProjectId,
      production,
      cmmReports,
      characteristics,
      incomingRecords,
      inProcessInspections,
      fixtures,
      gauges,
      msaStudies,
      pfmeaEntries,
      controlPlanEntries,
      correctiveActions,
      investigations,
      knowledgeSkills,
    };
    
    const success = saveToStorage(dataToSave);
    if (success) {
      setLastSaved(new Date().toISOString());
    }
  }, [
    projects, activeProjectId, production, cmmReports, characteristics,
    incomingRecords, inProcessInspections, fixtures, gauges, msaStudies,
    pfmeaEntries, controlPlanEntries, correctiveActions, investigations, knowledgeSkills
  ]);

  // Export all data as JSON file
  const exportAllData = useCallback(() => {
    const jsonString = exportData();
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `automotive-qe-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  // Import data from JSON string
  const importDataFunc = useCallback((jsonString: string): boolean => {
    const success = importData(jsonString);
    if (success) {
      // Reload the page to apply imported data
      window.location.reload();
      return true;
    }
    return false;
  }, []);

  // Clear all data and reset to sample data
  const clearAllData = useCallback(() => {
    if (window.confirm('Are you sure you want to clear all data? This will reset to sample data and cannot be undone.')) {
      clearStorage();
      window.location.reload();
    }
  }, []);

  return (
    <AppContext.Provider value={{
      projects, activeProjectId, production, cmmReports, characteristics, incomingRecords,
      inProcessInspections, fixtures, gauges, msaStudies, pfmeaEntries, controlPlanEntries,
      correctiveActions, investigations, knowledgeSkills,
      filters, currentPage, sidebarCollapsed, lastSaved,
      setActiveProject, setCurrentPage, setFilters, toggleSidebar,
      addProject, updateProject, duplicateProject, archiveProject, deleteProject,
      addProductionRecords, addCMMReports, addIncomingRecords,
      addInvestigation, updateInvestigation, addCorrectiveAction, updateCorrectiveAction,
      getFilteredProduction, getFilteredCMMMeasurements, getFilteredIncoming, getFilteredInProcess, getActiveProject,
      exportAllData, importData: importDataFunc, clearAllData,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
