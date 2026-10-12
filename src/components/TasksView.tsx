import React, { useState } from 'react';
import {
  Search,
  Plus,
  CheckCircle2,
  Circle,
  Trash2,
  ChevronRight,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Flame,
  AlertCircle,
  Clock,
  Check,
} from 'lucide-react';
import { Task, Project, Priority } from '../types';
import { getProjectTheme } from '../utils/colors';

interface TasksViewProps {
  tasks: Task[];
  projects: Project[];
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onOpenTaskDetail: (task: Task) => void;
  onOpenQuickCreate: () => void;
  onReorderTasks: (reorderedTasks: Task[]) => void;
  onChangeTaskPriority: (taskId: string, newPriority: Priority) => void;
}

const PRIORITY_TIERS: {
  id: Priority;
  title: string;
  subtitle: string;
  badgeClass: string;
  borderClass: string;
}[] = [
  {
    id: 'p0',
    title: 'Critical Path (P0 Urgent)',
    subtitle: 'Top tier items with highest execution precedence',
    badgeClass: 'text-[#ffb4ab] bg-[#8B2635]/25 border-[#8B2635]/50',
    borderClass: 'border-[#8B2635]/30',
  },
  {
    id: 'high',
    title: 'High Priority',
    subtitle: 'Strategic deliverables slated for active sprint',
    badgeClass: 'text-[#f7bd48] bg-[#f7bd48]/15 border-[#f7bd48]/30',
    borderClass: 'border-[#f7bd48]/20',
  },
  {
    id: 'medium',
    title: 'Medium Priority',
    subtitle: 'Operational workflows and scheduled items',
    badgeClass: 'text-[#d4af37] bg-[#d4af37]/10 border-[#d4af37]/25',
    borderClass: 'border-white/10',
  },
  {
    id: 'low',
    title: 'Standard / Low Priority',
    subtitle: 'Deferred backlog items and baseline tasks',
    badgeClass: 'text-[#797C86] bg-white/5 border-white/10',
    borderClass: 'border-white/5',
  },
];

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  projects,
  onToggleTask,
  onDeleteTask,
  onOpenTaskDetail,
  onOpenQuickCreate,
  onReorderTasks,
  onChangeTaskPriority,
}) => {
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'pending' | 'completed'>('all');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');

  // Drag state
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverZone, setDragOverZone] = useState<Priority | null>(null);
  const [dragOverTaskId, setDragOverTaskId] = useState<string | null>(null);

  // Filter tasks based on search & project
  const filterTask = (t: Task) => {
    const q = search.trim().toLowerCase();
    const proj = projects.find((p) => p.id === t.projectId);
    const matchesSearch =
      !q ||
      t.title.toLowerCase().includes(q) ||
      (t.description && t.description.toLowerCase().includes(q)) ||
      (t.notes && t.notes.toLowerCase().includes(q)) ||
      (proj && proj.name.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    if (selectedProjectId !== 'all') {
      if (selectedProjectId === 'none' && t.projectId) return false;
      if (selectedProjectId !== 'none' && t.projectId !== selectedProjectId) return false;
    }

    if (filterMode === 'pending') return !t.completed;
    if (filterMode === 'completed') return t.completed;

    return true;
  };

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOverZone = (e: React.DragEvent, priority: Priority) => {
    e.preventDefault();
    if (dragOverZone !== priority) {
      setDragOverZone(priority);
    }
  };

  const handleDragOverTask = (e: React.DragEvent, taskId: string, priority: Priority) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverZone(priority);
    if (draggedTaskId && draggedTaskId !== taskId) {
      setDragOverTaskId(taskId);
    }
  };

  const handleDropOnZone = (e: React.DragEvent, targetPriority: Priority) => {
    e.preventDefault();
    setDragOverZone(null);
    setDragOverTaskId(null);

    if (!draggedTaskId) return;
    const task = tasks.find((t) => t.id === draggedTaskId);
    if (!task) return;

    // Move task to target priority zone
    if (task.priority !== targetPriority) {
      onChangeTaskPriority(draggedTaskId, targetPriority);
    }
    setDraggedTaskId(null);
  };

  const handleDropOnTask = (e: React.DragEvent, targetTask: Task) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverZone(null);
    setDragOverTaskId(null);

    if (!draggedTaskId || draggedTaskId === targetTask.id) return;

    const sourceTask = tasks.find((t) => t.id === draggedTaskId);
    if (!sourceTask) return;

    // Remove source task
    const remainingTasks = tasks.filter((t) => t.id !== draggedTaskId);
    // Find index of target task
    const targetIdx = remainingTasks.findIndex((t) => t.id === targetTask.id);

    // If priority changed, update it to target task's priority
    const updatedSourceTask: Task = {
      ...sourceTask,
      priority: targetTask.priority,
    };

    remainingTasks.splice(targetIdx, 0, updatedSourceTask);
    onReorderTasks(remainingTasks);
    setDraggedTaskId(null);
  };

  // Move task up or down across or within priorities
  const handleMoveTaskOrder = (task: Task, direction: 'up' | 'down') => {
    const currentIdx = tasks.findIndex((t) => t.id === task.id);
    if (currentIdx === -1) return;

    const targetIdx = direction === 'up' ? currentIdx - 1 : currentIdx + 1;
    if (targetIdx < 0 || targetIdx >= tasks.length) return;

    const targetNeighbor = tasks[targetIdx];
    const newTasks = [...tasks];
    const [moved] = newTasks.splice(currentIdx, 1);

    // If moving into another priority section, inherit its priority!
    if (targetNeighbor && moved.priority !== targetNeighbor.priority) {
      moved.priority = targetNeighbor.priority;
    }

    newTasks.splice(targetIdx, 0, moved);
    onReorderTasks(newTasks);
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Tasks Hub &amp; Priority Flow
          </h1>
          <p className="text-xs text-[#797C86] mt-0.5">
            Drag items up or down to automatically re-rank priority. Projects assign custom color coding.
          </p>
        </div>

        <button
          onClick={onOpenQuickCreate}
          className="px-4 py-2 rounded-xl bg-gradient-to-b from-[#E5C158] to-[#D4AF37] text-[#121316] font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-[#d4af37]/20 active:scale-95 transition"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Action Item</span>
        </button>
      </div>

      {/* Toolbar: Search, Project Filter, Completion Filter */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#797C86] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search action items by title, notes, or project..."
              className="w-full bg-[#1A1B20] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#F5F5F7] placeholder-[#797C86] focus:outline-none focus:border-[#d4af37]"
            />
          </div>

          {/* Project Filter */}
          <div className="sm:w-64">
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full bg-[#1A1B20] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-[#F5F5F7] focus:outline-none focus:border-[#d4af37]"
            >
              <option value="all">All Portfolios &amp; Projects</option>
              <option value="none">General / Unassigned</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-[#1A1B20] p-1 rounded-xl border border-white/5 w-fit">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterMode === 'all'
                ? 'bg-[#22242B] text-[#d4af37] shadow-sm'
                : 'text-[#797C86] hover:text-[#B8BAC2]'
            }`}
          >
            All Items ({tasks.length})
          </button>
          <button
            onClick={() => setFilterMode('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterMode === 'pending'
                ? 'bg-[#22242B] text-[#d4af37] shadow-sm'
                : 'text-[#797C86] hover:text-[#B8BAC2]'
            }`}
          >
            In Progress ({tasks.filter((t) => !t.completed).length})
          </button>
          <button
            onClick={() => setFilterMode('completed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterMode === 'completed'
                ? 'bg-[#22242B] text-[#c3d3be] shadow-sm'
                : 'text-[#797C86] hover:text-[#B8BAC2]'
            }`}
          >
            Cleared ({tasks.filter((t) => t.completed).length})
          </button>
        </div>
      </div>

      {/* Priority Brackets (Drag and Drop Zones) */}
      <div className="space-y-6">
        {PRIORITY_TIERS.map((tier) => {
          const tierTasks = tasks.filter((t) => t.priority === tier.id && filterTask(t));
          const isDropZoneActive = dragOverZone === tier.id;

          return (
            <div
              key={tier.id}
              onDragOver={(e) => handleDragOverZone(e, tier.id)}
              onDrop={(e) => handleDropOnZone(e, tier.id)}
              className={`p-4 sm:p-5 rounded-2xl bg-[#1A1B20] border transition-all duration-200 ${
                isDropZoneActive
                  ? 'border-[#d4af37] ring-2 ring-[#d4af37]/30 bg-[#22242B]'
                  : tier.borderClass
              } shadow-lg shadow-black/30 space-y-3`}
            >
              {/* Bracket Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border ${tier.badgeClass} uppercase tracking-wider`}
                  >
                    {tier.title}
                  </span>
                  <span className="text-xs font-mono text-[#797C86] tabular-nums">
                    ({tierTasks.length})
                  </span>
                </div>
                <span className="text-[11px] text-[#797C86] hidden sm:inline">
                  Drag items here to set priority to {tier.id.toUpperCase()}
                </span>
              </div>

              {/* Items List */}
              {tierTasks.length === 0 ? (
                <div className="py-6 text-center text-xs text-[#797C86] border border-dashed border-white/10 rounded-xl bg-[#16171D]/40">
                  No action items in this priority bracket. Drag an item here to set as {tier.id.toUpperCase()}.
                </div>
              ) : (
                <div className="space-y-2">
                  {tierTasks.map((task) => {
                    const project = projects.find((p) => p.id === task.projectId);
                    const pTheme = getProjectTheme(project?.color);
                    const subCount = task.subtasks.length;
                    const subDone = task.subtasks.filter((s) => s.completed).length;

                    const isBeingDragged = draggedTaskId === task.id;
                    const isDragTarget = dragOverTaskId === task.id;

                    // If task is in a project, apply that project's color theme!
                    const cardBg = project ? pTheme.bgCard : 'bg-[#16171D]';
                    const cardBorder = project ? pTheme.borderCard : 'border-white/5 hover:border-white/20';

                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        onDragOver={(e) => handleDragOverTask(e, task.id, tier.id)}
                        onDrop={(e) => handleDropOnTask(e, task)}
                        onClick={() => onOpenTaskDetail(task)}
                        className={`group flex items-center justify-between p-3.5 rounded-xl ${cardBg} ${cardBorder} border transition-all cursor-pointer ${
                          isBeingDragged ? 'opacity-40 scale-[0.98]' : ''
                        } ${isDragTarget ? 'ring-2 ring-[#d4af37]' : ''}`}
                      >
                        <div className="flex items-start gap-3 flex-1 min-w-0 pr-2">
                          {/* Drag Grip Handle */}
                          <div
                            className="mt-1 cursor-grab active:cursor-grabbing text-[#797C86] hover:text-[#d4af37] p-0.5"
                            title="Drag to reorder or change priority"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <GripVertical className="w-4 h-4" />
                          </div>

                          {/* Checkbox */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleTask(task.id);
                            }}
                            className="mt-0.5 min-w-[22px] min-h-[22px] flex items-center justify-center text-[#d4af37] focus:outline-none"
                          >
                            {task.completed ? (
                              <CheckCircle2 className="w-5 h-5 text-[#d4af37]" />
                            ) : (
                              <Circle className="w-5 h-5 text-[#797C86] group-hover:text-[#d4af37]" />
                            )}
                          </button>

                          {/* Task Content */}
                          <div className="min-w-0 flex-1">
                            <span
                              className={`text-xs sm:text-sm font-medium block truncate ${
                                task.completed ? 'line-through text-[#797C86]' : 'text-[#F5F5F7]'
                              }`}
                            >
                              {task.title}
                            </span>

                            {/* Unboxed Metadata Line with Project Branding */}
                            <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#797C86] mt-1">
                              {project && (
                                <span
                                  className={`px-2 py-0.5 rounded-md font-semibold ${pTheme.badgeBg} ${pTheme.badgeText} border border-white/5 truncate max-w-[180px]`}
                                >
                                  {project.name}
                                </span>
                              )}

                              {subCount > 0 && (
                                <span className="text-[#E5C158] font-mono tabular-nums">
                                  {subDone}/{subCount} subtasks
                                </span>
                              )}

                              {task.dueDate && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span>{task.dueDate}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Order & Priority Controls */}
                        <div
                          className="flex items-center gap-1 shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Quick Priority Dropdown (changing priority immediately jumps to that bracket!) */}
                          <select
                            value={task.priority}
                            onChange={(e) =>
                              onChangeTaskPriority(task.id, e.target.value as Priority)
                            }
                            className="bg-[#121316] border border-white/10 rounded-lg px-2 py-1 text-[11px] text-[#B8BAC2] hover:border-[#d4af37] focus:outline-none"
                            title="Quick switch priority"
                          >
                            <option value="p0">P0 Urgent</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                          </select>

                          {/* Move Up / Down Buttons for touch & precision */}
                          <button
                            type="button"
                            onClick={() => handleMoveTaskOrder(task, 'up')}
                            className="p-1 rounded hover:bg-white/10 text-[#797C86] hover:text-[#d4af37]"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveTaskOrder(task, 'down')}
                            className="p-1 rounded hover:bg-white/10 text-[#797C86] hover:text-[#d4af37]"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onOpenTaskDetail(task)}
                            className="p-1.5 rounded-lg text-[#797C86] hover:text-[#d4af37] hover:bg-white/5"
                            title="Open Subtasks"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onDeleteTask(task.id)}
                            className="p-1.5 rounded-lg text-[#797C86] hover:text-[#ffb4ab] hover:bg-white/5"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
