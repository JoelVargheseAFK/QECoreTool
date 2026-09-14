import { useApp } from '../store/AppContext';

export default function KnowledgeMatrix() {
  const { knowledgeSkills } = useApp();

  const categories = Array.from(new Set(knowledgeSkills.map(s => s.category)));
  
  const stats = {
    total: knowledgeSkills.length,
    proficient: knowledgeSkills.filter(s => s.currentLevel >= s.requiredLevel).length,
    gaps: knowledgeSkills.filter(s => s.currentLevel < s.requiredLevel).length,
    avgGap: knowledgeSkills.length > 0 
      ? (knowledgeSkills.reduce((sum, s) => sum + Math.max(0, s.requiredLevel - s.currentLevel), 0) / knowledgeSkills.length).toFixed(1)
      : '0',
  };

  const levelLabels = ['No Knowledge', 'Awareness', 'Working Knowledge', 'Independent', 'Lead/Teach'];
  const competencyLabels = ['Observe', 'Assist', 'Perform', 'Lead', 'Teach'];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">QE Knowledge Matrix</h1>
        <p className="text-sm text-gray-500">Skills assessment and competency tracking</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Total Skills</div>
          <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Proficient</div>
          <div className="text-2xl font-bold text-green-600">{stats.proficient}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Gaps</div>
          <div className="text-2xl font-bold text-red-600">{stats.gaps}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Avg Gap</div>
          <div className="text-2xl font-bold text-orange-600">{stats.avgGap}</div>
        </div>
      </div>

      {/* Competency Legend */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h3 className="text-lg font-semibold mb-3">Competency Levels</h3>
        <div className="grid grid-cols-5 gap-4">
          {levelLabels.map((label, idx) => (
            <div key={idx} className="text-center">
              <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold ${
                idx === 0 ? 'bg-gray-400' :
                idx === 1 ? 'bg-blue-400' :
                idx === 2 ? 'bg-green-400' :
                idx === 3 ? 'bg-yellow-500' :
                'bg-red-500'
              }`}>
                {idx}
              </div>
              <div className="text-xs text-gray-600">{label}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t">
          <h4 className="text-sm font-semibold mb-2">Competency Progression:</h4>
          <div className="flex gap-4 text-xs text-gray-600">
            {competencyLabels.map((label, idx) => (
              <div key={idx} className="flex items-center gap-1">
                <span className="font-bold">{idx + 1}.</span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Skills by Category */}
      {categories.map(category => {
        const categorySkills = knowledgeSkills.filter(s => s.category === category);
        return (
          <div key={category} className="bg-white rounded-lg shadow p-4 mb-4">
            <h3 className="text-lg font-semibold mb-4">{category}</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Skill</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Required</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Current</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Gap</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Competency</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Target Date</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categorySkills.map((skill) => (
                    <tr key={skill.id} className={skill.gap > 0 ? 'bg-red-50' : ''}>
                      <td className="px-4 py-2 text-sm text-gray-900">{skill.skill}</td>
                      <td className="px-4 py-2 text-sm text-gray-900 text-center">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-bold">
                          {skill.requiredLevel}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          skill.currentLevel >= skill.requiredLevel ? 'bg-green-100 text-green-800' :
                          skill.currentLevel >= skill.requiredLevel - 1 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {skill.currentLevel}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm text-center">
                        {skill.gap > 0 ? (
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-bold">
                            -{skill.gap}
                          </span>
                        ) : (
                          <span className="text-green-600">✓</span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">{skill.competency}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{skill.action}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{skill.targetDate}</td>
                      <td className="px-4 py-2 text-sm text-center">
                        <span className={`px-2 py-1 rounded ${
                          skill.status === 'Completed' ? 'bg-green-100 text-green-800' :
                          skill.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {skill.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
