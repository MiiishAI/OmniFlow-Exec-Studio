import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, CheckCircle2, Circle, FileText, Calendar, Tag, Check } from 'lucide-react';
import { Task, Project, Priority, AppTheme } from '../types';
import { getProjectTheme } from '../utils/colors';
import { getThemeConfig } from '../utils/theme';
import { CalendarPicker } from './CalendarPicker';

interface TaskDetailModalProps {
  task: Task | null;
  projects: Project[];
  isOpen: boolean;
  theme?: AppTheme;
  onClose: () => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  projects,
  isOpen,
  theme = 'executive_gold',
  onClose,
  onUpdateTask,
  onDeleteTask,
}) => {
  const [newSubtaskText, setNewSubtaskText] = useState('');
  const [description, setDescription] = useState('');
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  const themeConfig = getThemeConfig(theme);

  useEffect(() => {
    if (task) {
      setDescription(task.description !== undefined ? task.description : (task.notes || ''));
    }
  }, [task?.id]);

  if (!isOpen || !task) return null;

  const currentProject = projects.find((p) => p.id === task.projectId);

  const handleDescriptionChange = (val: string) => {
    setDescription(val);
    onUpdateTask({
      ...task,
      description: val,
      notes: val,
    });
    setIsSavedNotice(true);
    const timer = setTimeout(() => setIsSavedNotice(false), 1500);
    return () => clearTimeout(timer);
  };

  const handleToggleSubtask = (subId: string) => {
    const updatedSubtasks = task.subtasks.map((s) =>
      s.id === subId ? { ...s, completed: !s.completed } : s
    );
    onUpdateTask({ ...task, subtasks: updatedSubtasks });
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    const text = newSubtaskText.trim();
    if (!text) return;

    const newSub = {
      id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      text,
      completed: false,
    };

    onUpdateTask({
      ...task,
      subtasks: [...task.subtasks, newSub],
    });
    setNewSubtaskText('');
  };

  const handleDeleteSubtask = (subId: string) => {
    onUpdateTask({
      ...task,
      subtasks: task.subtasks.filter((s) => s.id !== subId),
    });
  };

  const handleChangePriority = (priority: Priority) => {
    onUpdateTask({ ...task, priority });
  };

  const handleChangeProject = (projectId: string) => {
    onUpdateTask({ ...task, projectId: projectId === 'none' ? null : projectId });
  };

  const handleTitleChange = (newTitle: string) => {
    if (!newTitle.trim()) return;
    onUpdateTask({ ...task, title: newTitle.trim() });
  };

  const totalSubs = task.subtasks.length;
  const clearedSubs = task.subtasks.filter((s) => s.completed).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="w-full max-w-xl rounded-t-3xl sm:rounded-2xl border shadow-2xl p-5 sm:p-6 space-y-5 max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: themeConfig.bgElevated,
          borderColor: themeConfig.borderAccent,
        }}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-[11px] text-[#797C86] mb-1.5 flex-wrap">
              <span
                className="font-semibold uppercase tracking-wider"
                style={{ color: themeConfig.accentColor }}
              >
                Action Item Specification
              </span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {task.dueDate || 'Current Sprint'}
              </span>
              {currentProject && (
                <>
                  <span aria-hidden="true">·</span>
                  <span
                    className={`px-1.5 py-0.5 rounded font-semibold text-[10px] ${getProjectTheme(currentProject.color).badgeBg} ${getProjectTheme(currentProject.color).badgeText}`}
                  >
                    {currentProject.name}
                  </span>
                </>
              )}
            </div>

            {/* Editable or display Task Title */}
            <input
              type="text"
              defaultValue={task.title}
              onBlur={(e) => handleTitleChange(e.target.value)}
              className="text-base sm:text-lg font-bold text-white tracking-tight w-full bg-transparent border-b border-transparent hover:border-white/20 focus:border-white/40 focus:outline-none transition py-0.5"
              placeholder="Task Title"
            />
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#B8BAC2] hover:text-white transition shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Priority & Project Controls */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-[#797C86] mb-1">
              Priority Classification
            </label>
            <select
              value={task.priority}
              onChange={(e) => handleChangePriority(e.target.value as Priority)}
              className="w-full bg-[#16171D] border border-white/10 rounded-xl px-3 py-2 text-xs text-[#F5F5F7] focus:outline-none"
              style={{
                backgroundColor: themeConfig.bgInput,
                borderColor: themeConfig.borderSubtle,
              }}
            >
              <option value="p0">Critical (P0 Urgent)</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Standard / Low</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#797C86] mb-1">
              Portfolio Association
            </label>
            <select
              value={task.projectId || 'none'}
              onChange={(e) => handleChangeProject(e.target.value)}
              className="w-full bg-[#16171D] border border-white/10 rounded-xl px-3 py-2 text-xs text-[#F5F5F7] focus:outline-none"
              style={{
                backgroundColor: themeConfig.bgInput,
                borderColor: themeConfig.borderSubtle,
              }}
            >
              <option value="none">General / Unassigned</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Due Date Calendar Picker */}
        <div>
          <label className="block text-[11px] font-medium text-[#797C86] mb-1">
            Target Due Date &amp; Horizon
          </label>
          <CalendarPicker
            value={task.dueDate || ''}
            onChange={(newDate) => onUpdateTask({ ...task, dueDate: newDate })}
            placeholder="Click to choose or change due date..."
          />
        </div>

        {/* Description Section (Freeform writing space, optional) */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" style={{ color: themeConfig.accentColor }} />
              <label className="text-xs font-bold text-white uppercase tracking-wider">
                Description <span className="font-normal lowercase text-[#797C86]">(optional)</span>
              </label>
            </div>
            {isSavedNotice ? (
              <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium transition-all">
                <Check className="w-3 h-3" /> Auto-saved
              </span>
            ) : (
              <span className="text-[11px] text-[#797C86]">
                {description ? `${description.length} chars` : 'Write freely'}
              </span>
            )}
          </div>

          <textarea
            rows={4}
            value={description}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            placeholder="Write freeform notes, detailed specifications, deliverables, context, or links for this task (optional)..."
            className="w-full border rounded-xl p-3 text-xs text-[#F5F5F7] placeholder-[#797C86] focus:outline-none transition leading-relaxed resize-y min-h-[96px]"
            style={{
              backgroundColor: themeConfig.bgInput,
              borderColor: themeConfig.borderSubtle,
            }}
          />
          <p className="text-[11px] text-[#797C86]">
            Feel free to jot down background information, URLs, or requirements. Changes save automatically.
          </p>
        </div>

        {/* Subtask Breakdown Section */}
        <div className="space-y-3 pt-2 border-t border-white/5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Subtask Breakdown
            </h3>
            <span
              className="text-xs font-mono font-bold tabular-nums"
              style={{ color: themeConfig.accentColor }}
            >
              {clearedSubs} / {totalSubs} Cleared
            </span>
          </div>

          {/* Subtask List */}
          {totalSubs === 0 ? (
            <div
              className="p-4 text-center text-xs text-[#797C86] rounded-xl border border-dashed"
              style={{
                backgroundColor: themeConfig.bgInput,
                borderColor: themeConfig.borderSubtle,
              }}
            >
              No subtasks defined yet. Add execution steps below.
            </div>
          ) : (
            <div className="space-y-2">
              {task.subtasks.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-2.5 rounded-xl border text-xs group"
                  style={{
                    backgroundColor: themeConfig.bgInput,
                    borderColor: themeConfig.borderSubtle,
                  }}
                >
                  <label className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer pr-2">
                    <button
                      type="button"
                      onClick={() => handleToggleSubtask(sub.id)}
                      className="focus:outline-none"
                      style={{ color: themeConfig.accentColor }}
                    >
                      {sub.completed ? (
                        <CheckCircle2
                          className="w-4 h-4"
                          style={{ color: themeConfig.accentColor }}
                        />
                      ) : (
                        <Circle className="w-4 h-4 text-[#797C86]" />
                      )}
                    </button>
                    <span
                      className={`truncate ${
                        sub.completed ? 'line-through text-[#797C86]' : 'text-[#F5F5F7]'
                      }`}
                    >
                      {sub.text}
                    </span>
                  </label>

                  <button
                    type="button"
                    onClick={() => handleDeleteSubtask(sub.id)}
                    className="text-[#797C86] hover:text-[#ffb4ab] p-1 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add Subtask Step Form */}
          <form onSubmit={handleAddSubtask} className="flex gap-2 pt-1">
            <input
              type="text"
              value={newSubtaskText}
              onChange={(e) => setNewSubtaskText(e.target.value)}
              placeholder="Add next execution step or checklist item..."
              className="flex-1 border rounded-xl px-3 py-2 text-xs text-[#F5F5F7] placeholder-[#797C86] focus:outline-none"
              style={{
                backgroundColor: themeConfig.bgInput,
                borderColor: themeConfig.borderSubtle,
              }}
            />
            <button
              type="submit"
              className="px-3.5 py-2 hover:brightness-110 text-xs font-semibold rounded-xl transition active:scale-95 flex items-center gap-1 border"
              style={{
                backgroundColor: themeConfig.bgSurface,
                borderColor: themeConfig.borderAccent,
                color: themeConfig.accentColor,
              }}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/10">
          <button
            onClick={() => {
              if (window.confirm('Delete this action item?')) {
                onDeleteTask(task.id);
                onClose();
              }
            }}
            className="px-3.5 py-2 rounded-xl bg-[#8B2635]/20 hover:bg-[#8B2635]/30 text-[#ffb4ab] border border-[#8B2635]/40 text-xs font-semibold transition active:scale-95 flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Item</span>
          </button>

          <button
            onClick={onClose}
            className={`px-5 py-2 rounded-xl bg-gradient-to-r ${themeConfig.primaryButtonGradient} ${themeConfig.primaryButtonText} font-bold text-xs shadow-md active:scale-95 transition`}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
