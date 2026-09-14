// Local Storage Utility for Data Persistence

const STORAGE_KEY = 'automotive_qe_data';

export interface StorageData {
  projects: any[];
  activeProjectId: string;
  production: any[];
  cmmReports: any[];
  characteristics: any[];
  incomingRecords: any[];
  inProcessInspections: any[];
  fixtures: any[];
  gauges: any[];
  msaStudies: any[];
  pfmeaEntries: any[];
  controlPlanEntries: any[];
  correctiveActions: any[];
  investigations: any[];
  knowledgeSkills: any[];
  lastSaved: string;
}

export function saveToStorage(data: Partial<StorageData>): boolean {
  try {
    const existing = loadFromStorage();
    const merged = { ...existing, ...data, lastSaved: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    return true;
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
    return false;
  }
}

export function loadFromStorage(): StorageData | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return null;
  }
}

export function clearStorage(): boolean {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear localStorage:', error);
    return false;
  }
}

export function exportData(): string {
  const data = loadFromStorage();
  if (!data) return JSON.stringify({});
  return JSON.stringify(data, null, 2);
}

export function importData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Failed to import data:', error);
    return false;
  }
}

export function getStorageSize(): string {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return '0 KB';
  const bytes = new Blob([data]).size;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function getLastSaved(): string | null {
  const data = loadFromStorage();
  return data?.lastSaved || null;
}
