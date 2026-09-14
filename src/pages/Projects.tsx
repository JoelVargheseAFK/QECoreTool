import { useState } from 'react';
import { useApp } from '../store/AppContext';
import { Project } from '../types';

export default function Projects() {
  const { projects, addProject, updateProject, duplicateProject, archiveProject, setActiveProject, activeProjectId } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [form, setForm] = useState<Partial<Project>>({});

  const openCreate = () => {
    setEditingProject(null);
    setForm({ status: 'draft', startDate: new Date().toISOString().split('T')[0] });
    setShowForm(true);
  };

  const openEdit = (p: Project) => {
    setEditingProject(p);
    setForm(p);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.name || !form.partNumber) return;
    if (editingProject) {
      updateProject({ ...editingProject, ...form } as Project);
    } else {
      const newProject: Project = {
        id: `PRJ-${String(projects.length + 1).padStart(3, '0')}`,
        name: form.name || '',
        customer: form.customer || '',
        partNumber: form.partNumber || '',
        partName: form.partName || '',
        program: form.program || '',
        revision: form.revision || '',
        process: form.process || '',
        plant: form.plant || '',
        status: (form.status as any) || 'draft',
        startDate: form.startDate || new Date().toISOString().split('T')[0],
        notes: form.notes || '',
        cmmReportCount: 0, partCount: 0, characteristicCount: 0,
        productionQty: 0, scrapQty: 0, defectCount: 0,
      };
      addProject(newProject);
    }
    setShowForm(false);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Project Manager</h1>
          <p className="text-sm text-gray-500">Create, manage, and switch between automotive projects</p>
        </div>
        <button onClick={openCreate} className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600">
          <i className="fas fa-plus mr-2"></i>New Project
        </button>
      </div>

      {/* Project Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {projects.map(p => (
          <div key={p.id} className={`bg-white rounded-xl shadow-sm border-2 p-4 transition-all ${
            activeProjectId === p.id ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200 hover:border-gray-300'
          } ${p.status === 'archived' ? 'opacity-60' : ''}`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-800">{p.name}</h3>
                <p className="text-xs text-gray-500">{p.customer} — {p.partNumber}</p>
              </div>
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                p.status === 'active' ? 'bg-green-100 text-green-700' :
                p.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                'bg-gray-100 text-gray-500'
              }`}>{p.status}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-3 text-center">
              <div className="bg-gray-50 rounded p-1.5">
                <p className="text-xs text-gray-500">CMM Reports</p>
                <p className="font-bold text-sm text-gray-800">{p.cmmReportCount}</p>
              </div>
              <div className="bg-gray-50 rounded p-1.5">
                <p className="text-xs text-gray-500">Parts</p>
                <p className="font-bold text-sm text-gray-800">{p.partCount}</p>
              </div>
              <div className="bg-gray-50 rounded p-1.5">
                <p className="text-xs text-gray-500">Characteristics</p>
                <p className="font-bold text-sm text-gray-800">{p.characteristicCount}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-3 text-center">
              <div className="bg-gray-50 rounded p-1.5">
                <p className="text-xs text-gray-500">Production</p>
                <p className="font-bold text-sm text-gray-800">{p.productionQty.toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 rounded p-1.5">
                <p className="text-xs text-gray-500">Scrap</p>
                <p className="font-bold text-sm text-red-600">{p.scrapQty.toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 rounded p-1.5">
                <p className="text-xs text-gray-500">Defects</p>
                <p className="font-bold text-sm text-orange-600">{p.defectCount.toLocaleString()}</p>
              </div>
            </div>

            <div className="text-xs text-gray-500 mb-3">
              <span><i className="fas fa-industry mr-1"></i>{p.plant}</span> · 
              <span className="ml-1"><i className="fas fa-cogs mr-1"></i>{p.process}</span> · 
              <span className="ml-1">Rev {p.revision}</span>
            </div>

            <div className="flex items-center gap-1.5">
              {activeProjectId !== p.id && p.status !== 'archived' && (
                <button onClick={() => setActiveProject(p.id)} className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600">
                  Select
                </button>
              )}
              <button onClick={() => openEdit(p)} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200">
                <i className="fas fa-edit mr-1"></i>Edit
              </button>
              <button onClick={() => duplicateProject(p.id)} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200">
                <i className="fas fa-copy mr-1"></i>Dup
              </button>
              {p.status !== 'archived' && (
                <button onClick={() => archiveProject(p.id)} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200">
                  <i className="fas fa-archive mr-1"></i>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">{editingProject ? 'Edit Project' : 'New Project'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="p-4 space-y-3">
              {([
                ['name', 'Project Name', 'text'],
                ['customer', 'Customer', 'text'],
                ['partNumber', 'Part Number', 'text'],
                ['partName', 'Part Name', 'text'],
                ['program', 'Program', 'text'],
                ['revision', 'Revision', 'text'],
                ['process', 'Process', 'text'],
                ['plant', 'Plant', 'text'],
                ['startDate', 'Start Date', 'date'],
                ['notes', 'Notes', 'textarea'],
              ] as [keyof Project, string, string][]).map(([key, label, type]) => (
                <div key={key}>
                  <label className="block text-xs text-gray-500 mb-1">{label}</label>
                  {type === 'textarea' ? (
                    <textarea
                      value={(form as any)[key] || ''}
                      onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                      rows={2}
                    />
                  ) : (
                    <input
                      type={type}
                      value={(form as any)[key] || ''}
                      onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                </div>
              ))}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Status</label>
                <select
                  value={(form.status as string) || 'draft'}
                  onChange={e => setForm(prev => ({ ...prev, status: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
            <div className="p-4 border-t flex justify-end gap-2">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
