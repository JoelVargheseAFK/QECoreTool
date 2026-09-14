import { PageKey } from '../types';

const pageInfo: Record<string, { title: string; icon: string; description: string; features: string[] }> = {
  'in-process': {
    title: 'In-Process Inspection',
    icon: 'fa-cogs',
    description: 'Track in-process quality checks during manufacturing',
    features: ['First article inspection', 'Runner checks', 'End-of-run verification', 'Operator self-inspection'],
  },
  'final-inspection': {
    title: 'Final Inspection',
    icon: 'fa-check-double',
    description: 'Final quality verification before shipment',
    features: ['Final dimensional check', 'Visual inspection', 'Functional test results', 'Packaging verification'],
  },
  'fixtures-gauges': {
    title: 'Fixtures & Gauges',
    icon: 'fa-tools',
    description: 'Manage fixtures, gauges, and measurement equipment',
    features: ['Gauge inventory', 'Calibration schedule', 'Fixture maintenance', 'Gauge R&R tracking'],
  },
  'msa': {
    title: 'MSA / GR&R',
    icon: 'fa-balance-scale',
    description: 'Measurement System Analysis and Gauge Repeatability & Reproducibility',
    features: ['GR&R studies', 'Bias analysis', 'Linearity studies', 'Attribute agreement'],
  },
  'pfmea': {
    title: 'PFMEA',
    icon: 'fa-exclamation-triangle',
    description: 'Process Failure Mode and Effects Analysis',
    features: ['Failure modes', 'Severity/Occurrence/Detection ratings', 'RPN calculation', 'Action tracking'],
  },
  'control-plan': {
    title: 'Control Plan',
    icon: 'fa-list-alt',
    description: 'Quality control plan management',
    features: ['Process characteristics', 'Measurement methods', 'Sample frequencies', 'Reaction plans'],
  },
  '8d': {
    title: '8D / Corrective Actions',
    icon: 'fa-wrench',
    description: '8D problem solving and corrective action tracking',
    features: ['D1-D8 tracking', 'Root cause analysis', 'Containment actions', 'Prevention measures'],
  },
  'knowledge-matrix': {
    title: 'QE Knowledge Matrix',
    icon: 'fa-brain',
    description: 'Quality engineering skills and knowledge tracking',
    features: ['Skill assessment', 'Training records', 'Certification tracking', 'Knowledge gaps'],
  },
  'reports': {
    title: 'Reports',
    icon: 'fa-file-pdf',
    description: 'Generate and export quality reports',
    features: ['Customer reports', 'Internal summaries', 'Management dashboards', 'Audit documentation'],
  },
  'settings': {
    title: 'Settings',
    icon: 'fa-cog',
    description: 'Application configuration and preferences',
    features: ['User preferences', 'Data sources', 'Notification settings', 'Export templates'],
  },
};

export default function PlaceholderPage({ pageKey }: { pageKey: PageKey }) {
  const info = pageInfo[pageKey] || {
    title: pageKey,
    icon: 'fa-folder',
    description: 'Module coming soon',
    features: [],
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{info.title}</h1>
        <p className="text-sm text-gray-500">{info.description}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <i className={`fas ${info.icon} text-3xl text-gray-400`}></i>
        </div>
        <h2 className="text-lg font-semibold text-gray-700 mb-2">{info.title}</h2>
        <p className="text-sm text-gray-500 mb-6">{info.description}</p>

        {info.features.length > 0 && (
          <div className="max-w-md mx-auto">
            <h3 className="text-sm font-medium text-gray-600 mb-3">Planned Features:</h3>
            <div className="grid grid-cols-2 gap-2">
              {info.features.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-lg p-2">
                  <i className="fas fa-circle text-gray-300 text-[6px]"></i>
                  {f}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200 inline-block">
          <p className="text-xs text-blue-600">
            <i className="fas fa-info-circle mr-1"></i>
            This module is part of the foundation. Future prompts will add full functionality.
          </p>
        </div>
      </div>
    </div>
  );
}
