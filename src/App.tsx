import { AppProvider, useApp } from './store/AppContext';
import { PageKey } from './types';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProductionData from './pages/ProductionData';
import DataMapping from './pages/DataMapping';
import CMMReports from './pages/CMMReports';
import CharacteristicManager from './pages/CharacteristicManager';
import FeatureMovement from './pages/FeatureMovement';
import DimensionalAnalysis from './pages/DimensionalAnalysis';
import SPCAnalysis from './pages/SPCAnalysis';
import Capability from './pages/Capability';
import DefectPareto from './pages/DefectPareto';
import ScrapCost from './pages/ScrapCost';
import IncomingInspection from './pages/IncomingInspection';
import Correlation from './pages/Correlation';
import PlaceholderPage from './pages/PlaceholderPage';

const navItems: { key: PageKey; label: string; icon: string; group: string }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: 'fa-tachometer-alt', group: 'Main' },
  { key: 'projects', label: 'Projects', icon: 'fa-project-diagram', group: 'Main' },
  { key: 'production', label: 'Production Data', icon: 'fa-industry', group: 'Data' },
  { key: 'cmm-reports', label: 'CMM Reports', icon: 'fa-file-excel', group: 'Data' },
  { key: 'characteristics', label: 'CMM Characteristics', icon: 'fa-draw-polygon', group: 'Data' },
  { key: 'data-mapping', label: 'Data Mapping', icon: 'fa-exchange-alt', group: 'Data' },
  { key: 'feature-movement', label: 'Feature Movement', icon: 'fa-route', group: 'Analysis' },
  { key: 'dimensional', label: 'Dimensional Analysis', icon: 'fa-ruler-combined', group: 'Analysis' },
  { key: 'spc', label: 'SPC', icon: 'fa-chart-line', group: 'Analysis' },
  { key: 'capability', label: 'Capability', icon: 'fa-bullseye', group: 'Analysis' },
  { key: 'correlation', label: 'Production-CMM Correlation', icon: 'fa-link', group: 'Analysis' },
  { key: 'defect-pareto', label: 'Defect / Pareto', icon: 'fa-chart-bar', group: 'Quality' },
  { key: 'scrap-cost', label: 'Scrap & Cost', icon: 'fa-dollar-sign', group: 'Quality' },
  { key: 'incoming', label: 'Incoming Inspection', icon: 'fa-clipboard-check', group: 'Inspection' },
  { key: 'in-process', label: 'In-Process Inspection', icon: 'fa-cogs', group: 'Inspection' },
  { key: 'final-inspection', label: 'Final Inspection', icon: 'fa-check-double', group: 'Inspection' },
  { key: 'fixtures-gauges', label: 'Fixtures & Gauges', icon: 'fa-tools', group: 'Resources' },
  { key: 'msa', label: 'MSA / GR&R', icon: 'fa-balance-scale', group: 'Resources' },
  { key: 'pfmea', label: 'PFMEA', icon: 'fa-exclamation-triangle', group: 'Documentation' },
  { key: 'control-plan', label: 'Control Plan', icon: 'fa-list-alt', group: 'Documentation' },
  { key: '8d', label: '8D / Corrective Actions', icon: 'fa-wrench', group: 'Documentation' },
  { key: 'knowledge-matrix', label: 'QE Knowledge Matrix', icon: 'fa-brain', group: 'Documentation' },
  { key: 'reports', label: 'Reports', icon: 'fa-file-pdf', group: 'System' },
  { key: 'settings', label: 'Settings', icon: 'fa-cog', group: 'System' },
];

function AppContent() {
  const { currentPage, setCurrentPage, sidebarCollapsed, toggleSidebar, projects, activeProjectId, setActiveProject } = useApp();

  const groups = Array.from(new Set(navItems.map(n => n.group)));

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'projects': return <Projects />;
      case 'production': return <ProductionData />;
      case 'data-mapping': return <DataMapping />;
      case 'cmm-reports': return <CMMReports />;
      case 'characteristics': return <CharacteristicManager />;
      case 'feature-movement': return <FeatureMovement />;
      case 'dimensional': return <DimensionalAnalysis />;
      case 'spc': return <SPCAnalysis />;
      case 'capability': return <Capability />;
      case 'defect-pareto': return <DefectPareto />;
      case 'scrap-cost': return <ScrapCost />;
      case 'incoming': return <IncomingInspection />;
      case 'correlation': return <Correlation />;
      default: return <PlaceholderPage pageKey={currentPage} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-slate-900 text-white flex flex-col transition-all duration-300 flex-shrink-0`}>
        {/* Logo */}
        <div className="p-3 border-b border-slate-700 flex items-center gap-2">
          <div className="w-9 h-9 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <i className="fas fa-car text-white text-sm"></i>
          </div>
          {!sidebarCollapsed && (
            <div className="overflow-hidden">
              <h1 className="text-sm font-bold leading-tight">Automotive QE</h1>
              <p className="text-[10px] text-slate-400">Quality & CMM Analytics</p>
            </div>
          )}
        </div>

        {/* Project Selector */}
        {!sidebarCollapsed && (
          <div className="p-2 border-b border-slate-700">
            <label className="text-[10px] text-slate-400 uppercase tracking-wider px-1">Active Project</label>
            <select
              value={activeProjectId}
              onChange={e => setActiveProject(e.target.value)}
              className="w-full mt-1 px-2 py-1.5 bg-slate-800 border border-slate-600 rounded text-xs text-white focus:ring-1 focus:ring-blue-500"
            >
              {projects.filter(p => p.status !== 'archived').map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2">
          {groups.map(group => (
            <div key={group} className="mb-1">
              {!sidebarCollapsed && (
                <div className="px-3 py-1 text-[10px] text-slate-500 uppercase tracking-wider font-semibold">{group}</div>
              )}
              {navItems.filter(n => n.group === group).map(item => (
                <button
                  key={item.key}
                  onClick={() => setCurrentPage(item.key)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs transition-colors ${
                    currentPage === item.key
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <i className={`fas ${item.icon} w-4 text-center flex-shrink-0`}></i>
                  {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                </button>
              ))}
            </div>
          ))}
        </nav>

        {/* Collapse Toggle */}
        <button
          onClick={toggleSidebar}
          className="p-3 border-t border-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <i className={`fas ${sidebarCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}></i>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {renderPage()}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
