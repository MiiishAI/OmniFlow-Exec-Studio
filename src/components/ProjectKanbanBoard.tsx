import React, { useState } from 'react';
import {
  ArrowLeft,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  GripVertical,
  ChevronRight,
  MoreVertical,
  Edit2,
  X,
  Check,
} from 'lucide-react';
import { Project, Task, KanbanColumn } from '../types';
import { getProjectTheme } from '../utils/colors';

interface ProjectKanbanBoardProps {
  project: Project;
  tasks: Task[];
  onBack: () => void;
  onToggleTask: (taskId: string) => void;
  onOpenTaskDetail: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onMoveTaskToColumn: (taskId: string, targetColumnId: string) => void;
  onAddColumn: (title: string) => void;
  onRenameColumn: (columnId: string, newTitle: string) => void;
  onDeleteColumn: (columnId: string) => void;
  onQuickAddTaskToColumn: (columnId: string, title: string) => void;
}

export const ProjectKanbanBoard: React.FC<ProjectKanbanBoardProps> = ({
  project,
  tasks,
  onBack,
  onToggleTask,
  onOpenTaskDetail,
  onDeleteTask,
  onMoveTaskToColumn,
  onAddColumn,
  onRenameColumn,
  onDeleteColumn,
  onQuickAddTaskToColumn,
}) => {
  const pTheme = getProjectTheme(project.color);
  const projectTasks = tasks.filter((t) => t.projectId === project.id);
  const clearedCount = projectTasks.filter((t) => t.completed).length;
  const pct = projectTasks.length > 0 ? Math.round((clearedCount / projectTasks.length) * 100) : 0;

  // Drag states
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);

  // New Column State
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');

  // Editing Column State
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [editingColumnTitle, setEditingColumnTitle] = useState('');

  // Inline Add Task per Column
  const [inlineTaskColumnId, setInlineTaskColumnId] = useState<string | null>(null);
  const [inlineTaskTitle, setInlineTaskTitle] = useState('');

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOverColumn = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    if (dragOverColumnId !== columnId) {
      setDragOverColumnId(columnId);
    }
  };

  const handleDropOnColumn = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setDragOverColumnId(null);
    if (!draggedTaskId) return;

    onMoveTaskToColumn(draggedTaskId, columnId);
    setDraggedTaskId(null);
  };

  const handleCreateColumn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColumnTitle.trim()) return;
    onAddColumn(newColumnTitle.trim());
    setNewColumnTitle('');
    setIsAddingColumn(false);
  };

  const handleSaveRename = (columnId: string) => {
    if (editingColumnTitle.trim()) {
      onRenameColumn(columnId, editingColumnTitle.trim());
    }
    setEditingColumnId(null);
  };

  const handleInlineAddTaskSubmit = (columnId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!inlineTaskTitle.trim()) return;
    onQuickAddTaskToColumn(columnId, inlineTaskTitle.trim());
    setInlineTaskTitle('');
    setInlineTaskColumnId(null);
  };

  // Group tasks by column. If a task has no columnId, put it in the first column
  const firstColId = project.columns[0]?.id;

  return (
    <div className="space-y-6">
      {/* Kanban Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-[#1A1B20] hover:bg-[#22242B] border border-white/10 text-[#B8BAC2] hover:text-white transition active:scale-95 flex items-center gap-1.5 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Projects</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${pTheme.badgeBg} ${pTheme.badgeText} border border-white/5`}
              >
                {project.color.toUpperCase()} TRACK
              </span>
              <span className="text-xs text-[#797C86] font-mono">
                {project.targetQuarter || 'Active'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-0.5">
              {project.name}
            </h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="text-xs text-right mr-2 hidden sm:block">
            <span className="text-[#797C86] block text-[11px]">Deliverables Cleared</span>
            <span className="font-mono text-[#E5C158] font-bold">
              {clearedCount} / {projectTasks.length} ({pct}%)
            </span>
          </div>

          <button
            onClick={() => setIsAddingColumn(true)}
            className="px-3.5 py-2 rounded-xl bg-[#1A1B20] hover:bg-[#22242B] border border-[#d4af37]/30 text-xs font-semibold text-[#E5C158] transition active:scale-95 flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Section / Bracket</span>
          </button>
        </div>
      </div>

      {/* Progress Bar Strip */}
      <div className="w-full h-1.5 bg-[#16171D] rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#d4af37] to-[#E5C158] transition-all rounded-full"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Horizontal Kanban Columns Container */}
      <div className="flex gap-4 overflow-x-auto pb-6 items-start snap-x">
        {project.columns.map((column) => {
          const colTasks = projectTasks.filter(
            (t) => t.columnId === column.id || (!t.columnId && column.id === firstColId)
          );
          const isDropActive = dragOverColumnId === column.id;

          return (
            <div
              key={column.id}
              onDragOver={(e) => handleDragOverColumn(e, column.id)}
              onDrop={(e) => handleDropOnColumn(e, column.id)}
              className={`w-72 sm:w-80 shrink-0 rounded-2xl bg-[#1A1B20] border transition-all duration-200 flex flex-col max-h-[75vh] ${
                isDropActive
                  ? 'border-[#d4af37] ring-2 ring-[#d4af37]/30 bg-[#22242B]'
                  : 'border-white/10'
              } shadow-xl shadow-black/40`}
            >
              {/* Column Header */}
              <div className="p-3.5 border-b border-white/5 flex items-center justify-between gap-2">
                {editingColumnId === column.id ? (
                  <div className="flex items-center gap-1 flex-1">
                    <input
                      type="text"
                      autoFocus
                      value={editingColumnTitle}
                      onChange={(e) => setEditingColumnTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveRename(column.id);
                        if (e.key === 'Escape') setEditingColumnId(null);
                      }}
                      className="flex-1 bg-[#16171D] border border-[#d4af37] rounded px-2 py-1 text-xs text-white focus:outline-none"
                    />
                    <button
                      onClick={() => handleSaveRename(column.id)}
                      className="p-1 text-[#d4af37] hover:text-white"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setEditingColumnId(null)}
                      className="p-1 text-[#797C86] hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-[#d4af37]" />
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider truncate">
                        {column.title}
                      </h3>
                      <span className="text-[10px] font-mono text-[#797C86] bg-white/5 px-1.5 py-0.2 rounded">
                        {colTasks.length}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingColumnId(column.id);
                          setEditingColumnTitle(column.title);
                        }}
                        className="p-1 rounded text-[#797C86] hover:text-[#d4af37]"
                        title="Rename section"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      {project.columns.length > 1 && (
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete bracket "${column.title}"?`)) {
                              onDeleteColumn(column.id);
                            }
                          }}
                          className="p-1 rounded text-[#797C86] hover:text-[#ffb4ab]"
                          title="Delete section"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Column Tasks Scrollable Area */}
              <div className="p-3 space-y-2.5 overflow-y-auto flex-1 min-h-[140px]">
                {colTasks.length === 0 ? (
                  <div className="py-8 text-center text-[11px] text-[#797C86] border border-dashed border-white/5 rounded-xl bg-[#16171D]/40">
                    Drop action items here
                  </div>
                ) : (
                  colTasks.map((task) => {
                    const isTaskDragging = draggedTaskId === task.id;
                    const subCount = task.subtasks.length;
                    const subDone = task.subtasks.filter((s) => s.completed).length;

                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        onClick={() => onOpenTaskDetail(task)}
                        className={`p-3 rounded-xl ${pTheme.bgCard} ${pTheme.borderCard} border shadow-md transition cursor-pointer select-none group ${
                          isTaskDragging ? 'opacity-40 scale-95' : 'hover:scale-[1.01]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleTask(task.id);
                            }}
                            className="mt-0.5 text-[#d4af37] focus:outline-none"
                          >
                            {task.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-[#d4af37]" />
                            ) : (
                              <Circle className="w-4 h-4 text-[#797C86] group-hover:text-[#d4af37]" />
                            )}
                          </button>

                          <div className="min-w-0 flex-1">
                            <h4
                              className={`text-xs font-semibold leading-snug truncate ${
                                task.completed ? 'line-through text-[#797C86]' : 'text-[#F5F5F7]'
                              }`}
                            >
                              {task.title}
                            </h4>

                            <div className="flex items-center gap-2 text-[10px] text-[#797C86] mt-1.5">
                              <span
                                className={`font-bold uppercase ${
                                  task.priority === 'p0'
                                    ? 'text-[#ffb4ab]'
                                    : task.priority === 'high'
                                    ? 'text-[#f7bd48]'
                                    : 'text-[#d4af37]'
                                }`}
                              >
                                {task.priority.toUpperCase()}
                              </span>
                              {subCount > 0 && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span className="text-[#E5C158] font-mono tabular-nums">
                                    {subDone}/{subCount} subs
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          <div
                            className="p-1 text-[#797C86] hover:text-[#d4af37] cursor-grab active:cursor-grabbing"
                            onClick={(e) => e.stopPropagation()}
                            title="Drag to another column"
                          >
                            <GripVertical className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}

                {/* Inline Add Task Form */}
                {inlineTaskColumnId === column.id ? (
                  <form
                    onSubmit={(e) => handleInlineAddTaskSubmit(column.id, e)}
                    className="p-2.5 rounded-xl bg-[#16171D] border border-[#d4af37]/40 space-y-2"
                  >
                    <input
                      type="text"
                      autoFocus
                      value={inlineTaskTitle}
                      onChange={(e) => setInlineTaskTitle(e.target.value)}
                      placeholder="Action item title..."
                      className="w-full bg-transparent border-none text-xs text-white focus:outline-none"
                    />
                    <div className="flex justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setInlineTaskColumnId(null)}
                        className="px-2 py-1 text-[11px] text-[#797C86] hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1 bg-[#d4af37] text-[#121316] text-[11px] font-bold rounded"
                      >
                        Add
                      </button>
                    </div>
                  </form>
                ) : null}
              </div>

              {/* Column Footer: + Add item */}
              {inlineTaskColumnId !== column.id && (
                <div className="p-2 border-t border-white/5">
                  <button
                    onClick={() => {
                      setInlineTaskColumnId(column.id);
                      setInlineTaskTitle('');
                    }}
                    className="w-full py-1.5 rounded-lg hover:bg-white/5 text-[11px] font-semibold text-[#B8BAC2] hover:text-[#d4af37] transition flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Task to Bracket</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {/* Add New Section Card */}
        {isAddingColumn ? (
          <form
            onSubmit={handleCreateColumn}
            className="w-72 shrink-0 p-4 rounded-2xl bg-[#1A1B20] border border-[#d4af37]/40 shadow-xl space-y-3"
          >
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              New Bracket / Section
            </h4>
            <input
              type="text"
              autoFocus
              value={newColumnTitle}
              onChange={(e) => setNewColumnTitle(e.target.value)}
              placeholder="e.g. Legal Compliance Review"
              className="w-full bg-[#16171D] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af37]"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsAddingColumn(false)}
                className="flex-1 py-1.5 rounded-lg bg-white/5 text-xs text-[#B8BAC2]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-1.5 rounded-lg bg-[#d4af37] text-[#121316] font-bold text-xs"
              >
                Create Section
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsAddingColumn(true)}
            className="w-72 shrink-0 py-12 rounded-2xl border border-dashed border-white/10 hover:border-[#d4af37]/40 hover:bg-[#1A1B20]/40 text-[#797C86] hover:text-[#d4af37] text-xs font-semibold transition flex flex-col items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span>+ Add Section / Bracket</span>
          </button>
        )}
      </div>
    </div>
  );
};
