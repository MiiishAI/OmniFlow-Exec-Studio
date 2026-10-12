import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  ArrowRight,
  FolderGit2,
  Kanban,
  GripVertical,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { Project, Task, KanbanColumn } from '../types';
import { getProjectTheme } from '../utils/colors';
import { ProjectKanbanBoard } from './ProjectKanbanBoard';

interface ProjectsViewProps {
  projects: Project[];
  tasks: Task[];
  onToggleTask: (taskId: string) => void;
  onOpenTaskDetail: (task: Task) => void;
  onDeleteProject: (projectId: string) => void;
  onOpenQuickCreate: (type: 'project' | 'task', defaultProjectId?: string) => void;
  onReorderProjects: (newProjects: Project[]) => void;
  onMoveTaskToColumn: (taskId: string, targetColumnId: string) => void;
  onAddColumnToProject: (projectId: string, title: string) => void;
  onRenameProjectColumn: (projectId: string, columnId: string, newTitle: string) => void;
  onDeleteProjectColumn: (projectId: string, columnId: string) => void;
  onQuickAddTaskToColumn: (projectId: string, columnId: string, title: string) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  tasks,
  onToggleTask,
  onOpenTaskDetail,
  onDeleteProject,
  onOpenQuickCreate,
  onReorderProjects,
  onMoveTaskToColumn,
  onAddColumnToProject,
  onRenameProjectColumn,
  onDeleteProjectColumn,
  onQuickAddTaskToColumn,
}) => {
  const [activeKanbanProjectId, setActiveKanbanProjectId] = useState<string | null>(null);

  // Drag and drop state for projects
  const [draggedProjectId, setDraggedProjectId] = useState<string | null>(null);
  const [dragOverProjectId, setDragOverProjectId] = useState<string | null>(null);

  const activeProject = projects.find((p) => p.id === activeKanbanProjectId);

  // If a project is selected for Kanban view, render the Kanban Board!
  if (activeProject) {
    return (
      <ProjectKanbanBoard
        project={activeProject}
        tasks={tasks}
        onBack={() => setActiveKanbanProjectId(null)}
        onToggleTask={onToggleTask}
        onOpenTaskDetail={onOpenTaskDetail}
        onDeleteTask={(taskId) => {
          // Task deletion handled via modal or passed down
        }}
        onMoveTaskToColumn={onMoveTaskToColumn}
        onAddColumn={(title) => onAddColumnToProject(activeProject.id, title)}
        onRenameColumn={(columnId, newTitle) =>
          onRenameProjectColumn(activeProject.id, columnId, newTitle)
        }
        onDeleteColumn={(columnId) => onDeleteProjectColumn(activeProject.id, columnId)}
        onQuickAddTaskToColumn={(columnId, title) =>
          onQuickAddTaskToColumn(activeProject.id, columnId, title)
        }
      />
    );
  }

  // Aggregate metrics
  const totalProjects = projects.length;
  const projectTasks = tasks.filter((t) => t.projectId);
  const totalProjectTasks = projectTasks.length;
  const clearedProjectTasks = projectTasks.filter((t) => t.completed).length;

  let totalSubtasks = 0;
  let clearedSubtasks = 0;
  projectTasks.forEach((t) => {
    totalSubtasks += t.subtasks.length;
    clearedSubtasks += t.subtasks.filter((s) => s.completed).length;
  });

  // Project card drag handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedProjectId(id);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (draggedProjectId && draggedProjectId !== id) {
      setDragOverProjectId(id);
    }
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    setDragOverProjectId(null);
    if (!draggedProjectId || draggedProjectId === targetId) return;

    const current = [...projects];
    const srcIdx = current.findIndex((p) => p.id === draggedProjectId);
    const tgtIdx = current.findIndex((p) => p.id === targetId);
    if (srcIdx === -1 || tgtIdx === -1) return;

    const [moved] = current.splice(srcIdx, 1);
    current.splice(tgtIdx, 0, moved);
    onReorderProjects(current);
    setDraggedProjectId(null);
  };

  const handleMoveProject = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= projects.length) return;

    const updated = [...projects];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIdx, 0, moved);
    onReorderProjects(updated);
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Projects Terminal
          </h1>
          <p className="text-xs text-[#797C86] mt-0.5">
            Drag initiatives to reorder. Open any project to inspect its dedicated Kanban board.
          </p>
        </div>

        <button
          onClick={() => onOpenQuickCreate('project')}
          className="px-4 py-2 rounded-xl bg-gradient-to-b from-[#E5C158] to-[#D4AF37] text-[#121316] font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-[#d4af37]/20 active:scale-95 transition"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Initiative</span>
        </button>
      </div>

      {/* Aggregate KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-[#1A1B20] border border-[#d4af37]/20">
          <span className="text-[11px] text-[#797C86] block">Active Portfolios</span>
          <span className="text-xl font-bold text-[#E5C158] font-mono tabular-nums">
            {totalProjects}
          </span>
          <span className="text-[10px] text-[#797C86] block mt-0.5">Drag to rearrange</span>
        </div>
        <div className="p-4 rounded-xl bg-[#1A1B20] border border-white/10">
          <span className="text-[11px] text-[#797C86] block">Total Deliverables</span>
          <span className="text-xl font-bold text-white font-mono tabular-nums">
            {totalProjectTasks}
          </span>
          <span className="text-[10px] text-[#797C86] block mt-0.5">Assigned Tasks</span>
        </div>
        <div className="p-4 rounded-xl bg-[#1A1B20] border border-white/10">
          <span className="text-[11px] text-[#797C86] block">Cleared Deliverables</span>
          <span className="text-xl font-bold text-[#c3d3be] font-mono tabular-nums">
            {clearedProjectTasks}
          </span>
          <span className="text-[10px] text-[#797C86] block mt-0.5">
            {totalProjectTasks > 0
              ? `${Math.round((clearedProjectTasks / totalProjectTasks) * 100)}% Execution`
              : '0% Execution'}
          </span>
        </div>
        <div className="p-4 rounded-xl bg-[#1A1B20] border border-white/10">
          <span className="text-[11px] text-[#797C86] block">Subtask Completion</span>
          <span className="text-xl font-bold text-[#f7bd48] font-mono tabular-nums">
            {clearedSubtasks}/{totalSubtasks}
          </span>
          <span className="text-[10px] text-[#797C86] block mt-0.5">Granular Steps</span>
        </div>
      </div>

      {/* Projects List (Draggable Cards) */}
      {projects.length === 0 ? (
        <div className="p-12 text-center bg-[#1A1B20] rounded-2xl border border-dashed border-white/10">
          <FolderGit2 className="w-8 h-8 text-[#797C86] mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-white">No active initiatives registered</h3>
          <button
            onClick={() => onOpenQuickCreate('project')}
            className="mt-4 px-4 py-2 rounded-xl bg-[#22242B] border border-[#d4af37]/30 text-xs font-semibold text-[#fdf3c7]"
          >
            + Create First Initiative
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {projects.map((proj, index) => {
            const pTheme = getProjectTheme(proj.color);
            const pTasks = tasks.filter((t) => t.projectId === proj.id);
            const pCleared = pTasks.filter((t) => t.completed).length;
            const pPct = pTasks.length > 0 ? Math.round((pCleared / pTasks.length) * 100) : 0;

            const isDragging = draggedProjectId === proj.id;
            const isDragOver = dragOverProjectId === proj.id;

            return (
              <div
                key={proj.id}
                draggable
                onDragStart={(e) => handleDragStart(e, proj.id)}
                onDragOver={(e) => handleDragOver(e, proj.id)}
                onDrop={(e) => handleDrop(e, proj.id)}
                className={`p-5 rounded-2xl ${pTheme.bgCard} ${pTheme.borderCard} border shadow-lg shadow-black/40 space-y-4 transition-all duration-200 ${
                  isDragging ? 'opacity-40 scale-[0.98]' : ''
                } ${isDragOver ? 'ring-2 ring-[#d4af37]' : ''}`}
              >
                {/* Project Header with Drag Handle & Reorder */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    <div
                      className="mt-1 cursor-grab active:cursor-grabbing text-[#797C86] hover:text-[#d4af37] p-0.5"
                      title="Drag to rearrange project position"
                    >
                      <GripVertical className="w-4 h-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-[11px] text-[#797C86]">
                        <span
                          className={`font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${pTheme.badgeBg} ${pTheme.badgeText}`}
                        >
                          {proj.color.toUpperCase()} · {proj.targetQuarter || 'Active'}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{proj.columns.length} Kanban Brackets</span>
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-white tracking-tight mt-1">
                        {proj.name}
                      </h3>
                      <p className="text-xs text-[#B8BAC2] mt-1 leading-relaxed">
                        {proj.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      disabled={index === 0}
                      onClick={() => handleMoveProject(index, 'up')}
                      className="p-1 rounded hover:bg-white/10 text-[#797C86] hover:text-white disabled:opacity-20"
                      title="Move Project Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      disabled={index === projects.length - 1}
                      onClick={() => handleMoveProject(index, 'down')}
                      className="p-1 rounded hover:bg-white/10 text-[#797C86] hover:text-white disabled:opacity-20"
                      title="Move Project Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteProject(proj.id)}
                      title="Delete initiative"
                      className="p-1 rounded text-[#797C86] hover:text-[#ffb4ab]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#797C86]">
                      Deliverables ({pCleared}/{pTasks.length} Cleared)
                    </span>
                    <span className="text-[#E5C158] font-mono font-bold tabular-nums">
                      {pPct}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#16171D] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#d4af37] to-[#E5C158] transition-all rounded-full"
                      style={{ width: `${pPct}%` }}
                    />
                  </div>
                </div>

                {/* Interactive Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => setActiveKanbanProjectId(proj.id)}
                    className="py-2.5 px-3 rounded-xl bg-gradient-to-b from-[#E5C158] to-[#D4AF37] text-[#121316] text-xs font-bold shadow-md shadow-[#d4af37]/20 active:scale-95 transition flex items-center justify-center gap-1.5"
                  >
                    <Kanban className="w-3.5 h-3.5" />
                    <span>Open Kanban Board</span>
                  </button>

                  <button
                    onClick={() => onOpenQuickCreate('task', proj.id)}
                    className="py-2.5 px-3 rounded-xl bg-[#16171D] hover:bg-[#22242B] border border-white/10 text-xs font-semibold text-[#fdf3c7] transition active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Action Item</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
