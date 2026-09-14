import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Project, ProductionRecord, CMMReport, CMMMeasurement, Characteristic, IncomingRecord, AppFilters, PageKey } from '../types';
import { generateSampleProjects, generateSampleProduction, generateSampleCMMReports, generateSampleIncoming, generateCharacteristics } from '../data/sampleData';

interface AppState {
  projects: Project[];
  activeProjectId: string;
  production: ProductionRecord[];
  cmmReports: CMMReport[];
  characteristics: Characteristic[];
  incomingRecords: IncomingRecord[];
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
  addProductionRecords: (records: ProductionRecord[]) => void;
  addCMMReports: (reports: CMMReport[]) => void;
  addIncomingRecords: (records: IncomingRecord[]) => void;
  getFilteredProduction: () => ProductionRecord[];
  getFilteredCMMMeasurements: () => CMMMeasurement[];
  getFilteredIncoming: () => IncomingRecord[];
  getActiveProject: () => Project | undefined;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(generateSampleProjects());
  const [activeProjectId, setActiveProjectId] = useState('PRJ-001');
  const [production] = useState<ProductionRecord[]>(generateSampleProduction());
  const [cmmReports] = useState<CMMReport[]>(generateSampleCMMReports());
  const [characteristics] = useState<Characteristic[]>(() => generateCharacteristics(generateSampleCMMReports()));
  const [incomingRecords] = useState<IncomingRecord[]>(generateSampleIncoming());
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

  const addProductionRecords = useCallback((_records: ProductionRecord[]) => {
    // In a real app, this would update state
  }, []);

  const addCMMReports = useCallback((_reports: CMMReport[]) => {
    // In a real app, this would update state
  }, []);

  const addIncomingRecords = useCallback((_records: IncomingRecord[]) => {
    // In a real app, this would update state
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

  return (
    <AppContext.Provider value={{
      projects, activeProjectId, production, cmmReports, characteristics, incomingRecords,
      filters, currentPage, sidebarCollapsed,
      setActiveProject, setCurrentPage, setFilters, toggleSidebar,
      addProject, updateProject, duplicateProject, archiveProject,
      addProductionRecords, addCMMReports, addIncomingRecords,
      getFilteredProduction, getFilteredCMMMeasurements, getFilteredIncoming, getActiveProject,
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
