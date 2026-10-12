import React, { useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  ArrowRight,
  CheckCircle2,
  Circle,
  Timer,
  Sparkles,
  SlidersHorizontal,
  GripVertical,
  Activity,
  Layers,
  CheckCheck,
  TrendingUp,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { AppState, Task, Project, OverviewWidgetConfig, OverviewWidgetId } from '../types';
import { getProjectTheme } from '../utils/colors';
import { ProductivityTrendChart } from './ProductivityTrendChart';

interface OverviewViewProps {
  state: AppState;
  onToggleTask: (taskId: string) => void;
  onOpenTaskDetail: (task: Task) => void;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onSelectFocusPreset: (minutes: number) => void;
  onSwitchTab: (tab: 'overview' | 'tasks' | 'projects' | 'settings') => void;
  onOpenQuickCreate: (type: 'task' | 'project') => void;
  onOpenOverviewSettings: () => void;
  onReorderWidgets: (newWidgets: OverviewWidgetConfig[]) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  state,
  onToggleTask,
  onOpenTaskDetail,
  onToggleTimer,
  onResetTimer,
  onSelectFocusPreset,
  onSwitchTab,
  onOpenQuickCreate,
  onOpenOverviewSettings,
  onReorderWidgets,
}) => {
  const { user, tasks, projects, focusTimer, settings, overviewWidgets } = state;

  const [draggedWidgetId, setDraggedWidgetId] = useState<OverviewWidgetId | null>(null);
  const [dragOverWidgetId, setDragOverWidgetId] = useState<OverviewWidgetId | null>(null);

  // Compute metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const completionPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const p0TasksCount = tasks.filter((t) => t.priority === 'p0' && !t.completed).length;

  // Format timer
  const formatTimer = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  // Lead project
  const leadProject: Project | undefined = projects[0];
  const leadTheme = getProjectTheme(leadProject?.color);
  const leadProjectTasks = leadProject ? tasks.filter((t) => t.projectId === leadProject.id) : [];
  const leadProjectCompleted = leadProjectTasks.filter((t) => t.completed).length;
  const leadProjectPct =
    leadProjectTasks.length > 0 ? Math.round((leadProjectCompleted / leadProjectTasks.length) * 100) : 0;

  // Critical path tasks
  const criticalPathTasks = [...tasks]
    .sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      const prioOrder = { p0: 0, high: 1, medium: 2, low: 3 };
      return prioOrder[a.priority] - prioOrder[b.priority];
    })
    .slice(0, 5);

  // Widget Drag and Drop Handlers
  const handleDragStart = (id: OverviewWidgetId, e: React.DragEvent) => {
    setDraggedWidgetId(id);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (id: OverviewWidgetId, e: React.DragEvent) => {
    e.preventDefault();
    if (draggedWidgetId && draggedWidgetId !== id) {
      setDragOverWidgetId(id);
    }
  };

  const handleDragLeave = () => {
    setDragOverWidgetId(null);
  };

  const handleDrop = (targetId: OverviewWidgetId, e: React.DragEvent) => {
    e.preventDefault();
    setDragOverWidgetId(null);
    if (!draggedWidgetId || draggedWidgetId === targetId) return;

    const currentOrder = [...overviewWidgets];
    const sourceIndex = currentOrder.findIndex((w) => w.id === draggedWidgetId);
    const targetIndex = currentOrder.findIndex((w) => w.id === targetId);

    if (sourceIndex === -1 || targetIndex === -1) return;

    const [moved] = currentOrder.splice(sourceIndex, 1);
    currentOrder.splice(targetIndex, 0, moved);

    onReorderWidgets(currentOrder);
    setDraggedWidgetId(null);
  };

  const handleMoveWidget = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= overviewWidgets.length) return;

    const updated = [...overviewWidgets];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    onReorderWidgets(updated);
  };

  // Render individual widget component by ID
  const renderWidget = (widget: OverviewWidgetConfig, index: number) => {
    if (!widget.visible) return null;

    const isDragging = draggedWidgetId === widget.id;
    const isDragOver = dragOverWidgetId === widget.id;

    const widgetWrapperClass = `relative rounded-2xl transition-all duration-200 ${
      isDragging ? 'opacity-40 scale-[0.98]' : 'opacity-100'
    } ${isDragOver ? 'ring-2 ring-[#d4af37] ring-offset-2 ring-offset-[#121316]' : ''}`;

    const renderDragBar = () => (
      <div className="flex items-center justify-between px-1 pb-2 mb-1 border-b border-white/5 text-[11px] text-[#797C86]">
        <div
          className="flex items-center gap-1.5 cursor-grab active:cursor-grabbing hover:text-[#d4af37] select-none py-0.5 px-1 rounded transition-colors"
          title="Drag to rearrange widget position"
        >
          <GripVertical className="w-3.5 h-3.5" />
          <span className="font-semibold text-[10px] tracking-wider uppercase">{widget.title}</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            disabled={index === 0}
            onClick={() => handleMoveWidget(index, 'up')}
            className="p-1 rounded hover:bg-white/10 hover:text-white disabled:opacity-20 transition"
            title="Move Widget Up"
          >
            <ArrowUp className="w-3 h-3" />
          </button>
          <button
            disabled={index === overviewWidgets.filter((w) => w.visible).length - 1}
            onClick={() => handleMoveWidget(index, 'down')}
            className="p-1 rounded hover:bg-white/10 hover:text-white disabled:opacity-20 transition"
            title="Move Widget Down"
          >
            <ArrowDown className="w-3 h-3" />
          </button>
        </div>
      </div>
    );

    switch (widget.id) {
      case 'briefing':
        return (
          <div
            key={widget.id}
            draggable
            onDragStart={(e) => handleDragStart(widget.id, e)}
            onDragOver={(e) => handleDragOver(widget.id, e)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(widget.id, e)}
            className={widgetWrapperClass}
          >
            <div className="p-5 rounded-2xl bg-[#1A1B20] border border-[#d4af37]/20 relative shadow-lg shadow-black/40">
              {renderDragBar()}
              <div className="flex items-center justify-between text-xs mb-2 pt-1">
                <span className="text-[#d4af37] font-semibold text-[11px] tracking-wider uppercase flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
                  Executive Briefing
                </span>
                <span className="text-[11px] text-[#B8BAC2] font-mono tabular-nums">
                  {new Date().toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {user.name ? `Welcome back, ${user.name}` : 'Welcome to OmniFlow'}
              </h2>
              <p className="text-xs text-[#B8BAC2] mt-1 leading-relaxed">
                {pendingTasks > 0
                  ? `${pendingTasks} operational items require attention across ${projects.length} strategic initiatives.`
                  : 'All critical path objectives have been cleared for this operational cycle.'}
              </p>

              {/* Metric KPI Row */}
              <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-white/10">
                <div>
                  <span className="text-[11px] text-[#797C86] block">Initiatives</span>
                  <span className="text-xl font-bold text-[#E5C158] font-mono tabular-nums">
                    {projects.length}
                  </span>
                  <span className="text-[10px] text-[#797C86] block mt-0.5">Active Portfolios</span>
                </div>
                <div>
                  <span className="text-[11px] text-[#797C86] block">Critical Tasks</span>
                  <span className="text-xl font-bold text-white font-mono tabular-nums">
                    {completedTasks}/{totalTasks}
                  </span>
                  <span className="text-[10px] text-[#797C86] block mt-0.5">
                    {completionPct}% Complete
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-[#797C86] block">Focus Cycles</span>
                  <span className="text-xl font-bold text-[#c3d3be] font-mono tabular-nums">
                    {focusTimer.completedCycles}
                  </span>
                  <span className="text-[10px] text-[#797C86] block mt-0.5">Sprints Logged</span>
                </div>
              </div>

              {/* Clearance Progress Bar */}
              <div className="mt-4 pt-1">
                <div className="w-full h-1.5 bg-[#16171D] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#d4af37] to-[#E5C158] transition-all duration-500 rounded-full"
                    style={{ width: `${completionPct}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'timer':
        return (
          <div
            key={widget.id}
            draggable
            onDragStart={(e) => handleDragStart(widget.id, e)}
            onDragOver={(e) => handleDragOver(widget.id, e)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(widget.id, e)}
            className={widgetWrapperClass}
          >
            <div className="p-5 rounded-2xl bg-[#1A1B20] border border-white/10 shadow-lg shadow-black/40">
              {renderDragBar()}
              <div className="flex items-center justify-between mb-3 pt-1">
                <div className="flex items-center gap-2">
                  <Timer className="w-4 h-4 text-[#d4af37]" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Focus Session Stopwatch
                  </h3>
                </div>
                <span className="text-[11px] text-[#d4af37] font-medium font-mono">
                  {settings.focusMinutes}m Sprint
                </span>
              </div>

              {/* Preset Selector */}
              <div className="grid grid-cols-4 gap-1.5 bg-[#16171D] p-1 rounded-xl mb-3">
                {[15, 25, 45, 60].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => onSelectFocusPreset(mins)}
                    className={`py-1 text-xs font-semibold rounded-lg transition-colors ${
                      settings.focusMinutes === mins
                        ? 'bg-[#22242B] text-[#d4af37] shadow-sm'
                        : 'text-[#797C86] hover:text-[#B8BAC2]'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>

              {/* Numeric Display */}
              <div className="text-center py-2 bg-[#16171D]/60 rounded-xl border border-white/5 mb-3">
                <div className="text-3xl sm:text-4xl font-extrabold text-[#E5C158] font-mono tabular-nums tracking-wider">
                  {formatTimer(focusTimer.remainingSeconds)}
                </div>
                <div className="text-[11px] text-[#797C86] mt-0.5">
                  {focusTimer.isRunning ? 'Session in progress' : 'Ready to start'}
                </div>
              </div>

              {/* Controls */}
              <div className="flex gap-2">
                <button
                  onClick={onToggleTimer}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-b from-[#E5C158] to-[#D4AF37] text-[#121316] font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#d4af37]/20 active:scale-95 transition"
                >
                  {focusTimer.isRunning ? (
                    <>
                      <Pause className="w-4 h-4 fill-current" />
                      <span>Pause Session</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>Start Session</span>
                    </>
                  )}
                </button>
                <button
                  onClick={onResetTimer}
                  title="Reset timer"
                  className="px-3.5 py-2.5 rounded-xl bg-[#22242B] hover:bg-[#2A2C35] text-[#B8BAC2] hover:text-white font-semibold text-xs border border-white/10 active:scale-95 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        );

      case 'checklist':
        return (
          <div
            key={widget.id}
            draggable
            onDragStart={(e) => handleDragStart(widget.id, e)}
            onDragOver={(e) => handleDragOver(widget.id, e)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(widget.id, e)}
            className={widgetWrapperClass}
          >
            <div className="p-5 rounded-2xl bg-[#1A1B20] border border-white/10 shadow-lg shadow-black/40 space-y-3">
              {renderDragBar()}
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5 pt-1">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Critical Path Checklist
                  </h3>
                  <p className="text-[11px] text-[#797C86]">
                    Top deliverables prioritized by strategic impact.
                  </p>
                </div>
                <button
                  onClick={() => onSwitchTab('tasks')}
                  className="text-xs text-[#d4af37] font-semibold hover:underline flex items-center gap-1"
                >
                  <span>View All ({tasks.length})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {criticalPathTasks.length === 0 ? (
                <div className="text-center py-6 text-xs text-[#797C86] border border-dashed border-white/10 rounded-xl">
                  No active tasks. Tap &quot;+ Quick Task&quot; above to create one.
                </div>
              ) : (
                <div className="space-y-2">
                  {criticalPathTasks.map((task) => {
                    const subCount = task.subtasks.length;
                    const subDone = task.subtasks.filter((s) => s.completed).length;
                    const project = projects.find((p) => p.id === task.projectId);
                    const pTheme = getProjectTheme(project?.color);
                    const isP0 = task.priority === 'p0';

                    // Apply project color theme if task is in a project!
                    const itemBg = project ? pTheme.bgCard : 'bg-[#16171D]';
                    const itemBorder = project ? pTheme.borderCard : 'border-white/5 hover:border-[#d4af37]/30';

                    return (
                      <div
                        key={task.id}
                        onClick={() => onOpenTaskDetail(task)}
                        className={`group flex items-center justify-between p-3 rounded-xl ${itemBg} ${itemBorder} border transition cursor-pointer`}
                      >
                        <div className="flex items-start gap-2.5 flex-1 min-w-0 pr-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleTask(task.id);
                            }}
                            className="mt-0.5 min-w-[22px] min-h-[22px] flex items-center justify-center text-[#d4af37] focus:outline-none"
                          >
                            {task.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-[#d4af37]" />
                            ) : (
                              <Circle className="w-4 h-4 text-[#797C86] group-hover:text-[#d4af37]" />
                            )}
                          </button>

                          <div className="min-w-0 flex-1">
                            <span
                              className={`text-xs font-medium block truncate ${
                                task.completed ? 'line-through text-[#797C86]' : 'text-[#F5F5F7]'
                              }`}
                            >
                              {task.title}
                            </span>

                            <div className="flex items-center gap-2 text-[11px] text-[#797C86] mt-0.5">
                              {isP0 && (
                                <span className="text-[#ffb4ab] font-bold">P0 Urgent</span>
                              )}
                              {project && (
                                <>
                                  {isP0 && <span aria-hidden="true">·</span>}
                                  <span className={`truncate max-w-[130px] ${pTheme.badgeText}`}>
                                    {project.name}
                                  </span>
                                </>
                              )}
                              {subCount > 0 && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span className="text-[#E5C158] font-mono tabular-nums">
                                    {subDone}/{subCount} subtasks
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <ArrowRight className="w-3.5 h-3.5 text-[#797C86] group-hover:text-[#d4af37] shrink-0" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );

      case 'priority_project':
        if (!leadProject) return null;
        return (
          <div
            key={widget.id}
            draggable
            onDragStart={(e) => handleDragStart(widget.id, e)}
            onDragOver={(e) => handleDragOver(widget.id, e)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(widget.id, e)}
            className={widgetWrapperClass}
          >
            <div
              className={`p-5 rounded-2xl ${leadTheme.bgCard} ${leadTheme.borderCard} border shadow-lg shadow-black/40 space-y-3`}
            >
              {renderDragBar()}
              <div className="flex items-center justify-between text-xs pt-1">
                <span className={`font-semibold text-[11px] uppercase tracking-wider ${leadTheme.badgeText}`}>
                  Top Priority Initiative
                </span>
                <span className="text-[11px] text-[#c3d3be] font-medium">
                  {leadProject.targetQuarter || 'Active Cycle'}
                </span>
              </div>

              <div>
                <h4 className="text-base font-bold text-white tracking-tight">
                  {leadProject.name}
                </h4>
                <p className="text-xs text-[#B8BAC2] mt-0.5 leading-relaxed">
                  {leadProject.description}
                </p>
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#797C86]">
                    Execution Progress ({leadProjectCompleted} / {leadProjectTasks.length} Tasks)
                  </span>
                  <span className="text-[#E5C158] font-mono font-bold tabular-nums">
                    {leadProjectPct}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#16171D] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#d4af37] to-[#E5C158] transition-all rounded-full"
                    style={{ width: `${leadProjectPct}%` }}
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end">
                <button
                  onClick={() => onSwitchTab('projects')}
                  className="text-xs font-semibold text-[#d4af37] hover:underline flex items-center gap-1"
                >
                  <span>Open Projects Terminal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        );

      case 'kpi_metrics':
        return (
          <div
            key={widget.id}
            draggable
            onDragStart={(e) => handleDragStart(widget.id, e)}
            onDragOver={(e) => handleDragOver(widget.id, e)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(widget.id, e)}
            className={widgetWrapperClass}
          >
            <div className="p-5 rounded-2xl bg-[#1A1B20] border border-white/10 shadow-lg shadow-black/40 space-y-3">
              {renderDragBar()}
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5 pt-1">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#d4af37]" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Executive Performance Matrix
                  </h3>
                </div>
                <span className="text-[11px] text-[#c3d3be] flex items-center gap-1 font-semibold">
                  <TrendingUp className="w-3.5 h-3.5" /> Optimal
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-[#16171D] border border-white/5">
                  <div className="flex items-center justify-between text-[11px] text-[#797C86]">
                    <span>P0 Load Factor</span>
                    <span className="font-mono text-[#ffb4ab] font-bold">{p0TasksCount}</span>
                  </div>
                  <div className="text-lg font-bold text-white font-mono mt-0.5">
                    {totalTasks > 0 ? Math.round((p0TasksCount / totalTasks) * 100) : 0}%
                  </div>
                  <span className="text-[10px] text-[#797C86] block mt-0.5">Urgent Pressure</span>
                </div>

                <div className="p-3 rounded-xl bg-[#16171D] border border-white/5">
                  <div className="flex items-center justify-between text-[11px] text-[#797C86]">
                    <span>Sprint Velocity</span>
                    <span className="font-mono text-[#E5C158] font-bold">
                      {focusTimer.completedCycles}
                    </span>
                  </div>
                  <div className="text-lg font-bold text-[#E5C158] font-mono mt-0.5">
                    {focusTimer.completedCycles * settings.focusMinutes}m
                  </div>
                  <span className="text-[10px] text-[#797C86] block mt-0.5">Deep Work Logged</span>
                </div>
              </div>

              {/* Project Portfolio Distribution */}
              <div className="pt-2">
                <span className="text-[11px] text-[#797C86] block mb-2 font-medium">
                  Portfolio Resource Distribution
                </span>
                <div className="space-y-1.5">
                  {projects.map((proj) => {
                    const pTheme = getProjectTheme(proj.color);
                    const pTasks = tasks.filter((t) => t.projectId === proj.id);
                    const pRatio = totalTasks > 0 ? Math.round((pTasks.length / totalTasks) * 100) : 0;
                    return (
                      <div key={proj.id} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`w-2 h-2 rounded-full ${pTheme.accentDot}`} />
                          <span className="truncate text-[#B8BAC2]">{proj.name}</span>
                        </div>
                        <span className="font-mono text-[11px] text-[#797C86] shrink-0">
                          {pTasks.length} ({pRatio}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );

      case 'trend':
        return (
          <div
            key={widget.id}
            draggable
            onDragStart={(e) => handleDragStart(widget.id, e)}
            onDragOver={(e) => handleDragOver(widget.id, e)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(widget.id, e)}
            className={widgetWrapperClass}
          >
            <div className="p-5 rounded-2xl bg-[#1A1B20] border border-[#d4af37]/25 shadow-lg shadow-black/40 space-y-3">
              {renderDragBar()}
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5 pt-1">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#d4af37]" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Productivity Trend (Last 7 Days)
                  </h3>
                </div>
                <span className="text-[11px] text-[#c3d3be] font-medium font-mono">
                  Rolling Velocity
                </span>
              </div>

              <ProductivityTrendChart tasks={tasks} theme={settings.theme} />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Divide visible widgets into balanced columns for desktop:
  // On large screens, we alternate or split by order
  const visibleWidgets = overviewWidgets.filter((w) => w.visible);

  return (
    <div className="space-y-6">
      {/* View Header with Overview Settings Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Command Center
          </h1>
          <div className="flex items-center gap-2 text-xs text-[#797C86] mt-0.5">
            <span>{user.organization || 'Executive Suite'}</span>
            <span aria-hidden="true">·</span>
            <span>Drag &amp; drop to reorder modules</span>
            <span aria-hidden="true">·</span>
            <span className="text-[#d4af37] font-medium">Standard Time (CET)</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onOpenOverviewSettings}
            className="px-3 py-2 rounded-xl bg-[#1A1B20] hover:bg-[#22242B] border border-[#d4af37]/30 text-xs font-semibold text-[#E5C158] transition active:scale-95 flex items-center gap-1.5"
            title="Configure and toggle Overview widgets"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Customize Widgets</span>
          </button>

          <button
            onClick={() => onOpenQuickCreate('task')}
            className="px-3.5 py-2 rounded-xl bg-[#1A1B20] hover:bg-[#22242B] border border-white/10 text-xs font-semibold text-[#fdf3c7] transition active:scale-95"
          >
            + Quick Task
          </button>
          <button
            onClick={() => onOpenQuickCreate('project')}
            className="px-3.5 py-2 rounded-xl bg-[#1A1B20] hover:bg-[#22242B] border border-white/10 text-xs font-semibold text-[#B8BAC2] hover:text-white transition active:scale-95"
          >
            + New Project
          </button>
        </div>
      </div>

      {/* Grid of Draggable Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {visibleWidgets.map((widget, idx) => renderWidget(widget, idx))}
      </div>
    </div>
  );
};
