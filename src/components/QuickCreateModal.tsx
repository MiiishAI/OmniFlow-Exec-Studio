import React, { useState } from 'react';
import { X, CheckSquare, FolderGit2, Plus } from 'lucide-react';
import { Project, Priority, Task, ProjectColor } from '../types';
import { PROJECT_COLORS } from '../utils/colors';
import { CalendarPicker } from './CalendarPicker';

interface QuickCreateModalProps {
  isOpen: boolean;
  initialType?: 'task' | 'project';
  defaultProjectId?: string;
  projects: Project[];
  onClose: () => void;
  onCreateTask: (taskData: Omit<Task, 'id' | 'createdAt'>) => void;
  onCreateProject: (projectData: Omit<Project, 'id' | 'createdAt'>, initialTasks?: string[]) => void;
}

export const QuickCreateModal: React.FC<QuickCreateModalProps> = ({
  isOpen,
  initialType = 'task',
  defaultProjectId,
  projects,
  onClose,
  onCreateTask,
  onCreateProject,
}) => {
  const [modalType, setModalType] = useState<'task' | 'project'>(initialType);

  // Task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskPriority, setTaskPriority] = useState<Priority>('medium');
  const [taskProjectId, setTaskProjectId] = useState<string>(defaultProjectId || '');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskNotes, setTaskNotes] = useState('');
  const [taskSubtasksInput, setTaskSubtasksInput] = useState('');

  // Project form state
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectQuarter, setProjectQuarter] = useState('Q3 2026');
  const [projectColor, setProjectColor] = useState<ProjectColor>('emerald');
  const [projectInitialTasks, setProjectInitialTasks] = useState('');

  if (!isOpen) return null;

  const handleSubmitTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const subtasks = taskSubtasksInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((text, idx) => ({
        id: `sub-${Date.now()}-${idx}`,
        text,
        completed: false,
      }));

    onCreateTask({
      title: taskTitle.trim(),
      priority: taskPriority,
      projectId: taskProjectId || null,
      completed: false,
      dueDate: taskDueDate.trim() || undefined,
      notes: taskNotes.trim() || undefined,
      description: taskNotes.trim() || undefined,
      subtasks,
    });

    onClose();
    // Reset form
    setTaskTitle('');
    setTaskNotes('');
    setTaskSubtasksInput('');
  };

  const handleSubmitProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    const initialTasks = projectInitialTasks
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    onCreateProject(
      {
        name: projectName.trim(),
        description: projectDescription.trim() || 'Strategic operational initiative',
        status: 'active',
        targetQuarter: projectQuarter.trim(),
        color: projectColor,
        columns: [
          { id: `col-${Date.now()}-1`, title: 'Planning & Intel' },
          { id: `col-${Date.now()}-2`, title: 'In Execution' },
          { id: `col-${Date.now()}-3`, title: 'Audit & Review' },
          { id: `col-${Date.now()}-4`, title: 'Settled & Verified' },
        ],
      },
      initialTasks
    );

    onClose();
    // Reset form
    setProjectName('');
    setProjectDescription('');
    setProjectInitialTasks('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-[#1A1B20] w-full max-w-lg rounded-t-3xl sm:rounded-2xl border border-[#d4af37]/25 shadow-2xl p-5 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#d4af37]" />
            <span>Create Operational Item</span>
          </h2>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#B8BAC2] hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher: Task vs Project */}
        <div className="flex p-1 bg-[#16171D] rounded-xl border border-white/5">
          <button
            type="button"
            onClick={() => setModalType('task')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
              modalType === 'task'
                ? 'bg-[#22242B] text-[#d4af37] shadow-sm'
                : 'text-[#797C86] hover:text-[#B8BAC2]'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Action Item (Task)</span>
          </button>

          <button
            type="button"
            onClick={() => setModalType('project')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
              modalType === 'project'
                ? 'bg-[#22242B] text-[#d4af37] shadow-sm'
                : 'text-[#797C86] hover:text-[#B8BAC2]'
            }`}
          >
            <FolderGit2 className="w-3.5 h-3.5" />
            <span>Initiative (Project)</span>
          </button>
        </div>

        {/* Form Content */}
        {modalType === 'task' ? (
          <form onSubmit={handleSubmitTask} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-[#B8BAC2] mb-1">
                Action Title *
              </label>
              <input
                type="text"
                required
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="e.g. Sign Multisig Threshold Governance Key"
                className="w-full bg-[#16171D] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-[#F5F5F7] placeholder-[#797C86] focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#B8BAC2] mb-1">
                  Priority
                </label>
                <select
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value as Priority)}
                  className="w-full bg-[#16171D] border border-white/10 rounded-xl px-3 py-2 text-xs text-[#F5F5F7] focus:outline-none focus:border-[#d4af37]"
                >
                  <option value="p0">Critical (P0 Urgent)</option>
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Standard / Low</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#B8BAC2] mb-1">
                  Portfolio Track
                </label>
                <select
                  value={taskProjectId}
                  onChange={(e) => setTaskProjectId(e.target.value)}
                  className="w-full bg-[#16171D] border border-white/10 rounded-xl px-3 py-2 text-xs text-[#F5F5F7] focus:outline-none focus:border-[#d4af37]"
                >
                  <option value="">General / None</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#B8BAC2] mb-1">
                  Due Horizon / Calendar
                </label>
                <CalendarPicker
                  value={taskDueDate}
                  onChange={(d) => setTaskDueDate(d)}
                  placeholder="Click to choose due date..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#B8BAC2] mb-1">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={taskNotes}
                  onChange={(e) => setTaskNotes(e.target.value)}
                  placeholder="Freeform details, specifications or notes"
                  className="w-full bg-[#16171D] border border-white/10 rounded-xl px-3 py-2 text-xs text-[#F5F5F7] placeholder-[#797C86] focus:outline-none focus:border-[#d4af37]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#B8BAC2] mb-1">
                Initial Subtask Steps (Comma-separated)
              </label>
              <input
                type="text"
                value={taskSubtasksInput}
                onChange={(e) => setTaskSubtasksInput(e.target.value)}
                placeholder="e.g. Audit signatures, Benchmark latency, Notify board"
                className="w-full bg-[#16171D] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-[#F5F5F7] placeholder-[#797C86] focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-[#16171D] hover:bg-[#22242B] border border-white/10 text-xs font-semibold text-[#B8BAC2]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-b from-[#E5C158] to-[#D4AF37] text-[#121316] font-bold text-xs shadow-md shadow-[#d4af37]/20 active:scale-95 transition"
              >
                Create Action Item
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmitProject} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-[#B8BAC2] mb-1">
                Initiative Name *
              </label>
              <input
                type="text"
                required
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g. Sovereign Asset Vault Expansion"
                className="w-full bg-[#16171D] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-[#F5F5F7] placeholder-[#797C86] focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#B8BAC2] mb-1">
                Strategic Scope / Description
              </label>
              <textarea
                rows={2}
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="Key objectives, regulatory boundaries, and target deliverables..."
                className="w-full bg-[#16171D] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-[#F5F5F7] placeholder-[#797C86] focus:outline-none focus:border-[#d4af37] resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#B8BAC2] mb-1">
                Target Timeline / Quarter
              </label>
              <input
                type="text"
                value={projectQuarter}
                onChange={(e) => setProjectQuarter(e.target.value)}
                placeholder="e.g. Q3 2026 or Horizon 2027"
                className="w-full bg-[#16171D] border border-white/10 rounded-xl px-3 py-2 text-xs text-[#F5F5F7] placeholder-[#797C86] focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#B8BAC2] mb-1">
                Initiative Theme Color
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(PROJECT_COLORS) as ProjectColor[]).map((cKey) => {
                  const cTheme = PROJECT_COLORS[cKey];
                  const isSelected = projectColor === cKey;
                  return (
                    <button
                      key={cKey}
                      type="button"
                      onClick={() => setProjectColor(cKey)}
                      className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-medium transition ${
                        isSelected
                          ? `${cTheme.bgCard} ${cTheme.borderCard} ring-1 ring-[#d4af37]`
                          : 'bg-[#16171D] border-white/5 hover:border-white/20'
                      }`}
                    >
                      <span className={`w-3 h-3 rounded-full ${cTheme.accentDot}`} />
                      <span className="text-[#B8BAC2] truncate text-[11px]">{cTheme.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#B8BAC2] mb-1">
                Initial Deliverables / Tasks (Comma-separated)
              </label>
              <input
                type="text"
                value={projectInitialTasks}
                onChange={(e) => setProjectInitialTasks(e.target.value)}
                placeholder="e.g. Treasury audit, Legal opinion, Infrastructure deployment"
                className="w-full bg-[#16171D] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-[#F5F5F7] placeholder-[#797C86] focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-[#16171D] hover:bg-[#22242B] border border-white/10 text-xs font-semibold text-[#B8BAC2]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-b from-[#E5C158] to-[#D4AF37] text-[#121316] font-bold text-xs shadow-md shadow-[#d4af37]/20 active:scale-95 transition"
              >
                Launch Initiative
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
