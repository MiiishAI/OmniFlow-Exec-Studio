import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { OverviewView } from './components/OverviewView';
import { TasksView } from './components/TasksView';
import { ProjectsView } from './components/ProjectsView';
import { SettingsView } from './components/SettingsView';
import { TaskDetailModal } from './components/TaskDetailModal';
import { QuickCreateModal } from './components/QuickCreateModal';
import { OverviewSettingsModal } from './components/OverviewSettingsModal';
import { AIAssistantModal } from './components/AIAssistantModal';
import {
  AppState,
  Task,
  Project,
  UserProfile,
  AppSettings,
  Priority,
  OverviewWidgetConfig,
  AISettings,
  ChatMessage,
  ProjectColor,
} from './types';
import {
  loadAppState,
  saveAppState,
  defaultState,
  defaultOverviewWidgets,
  defaultAISettings,
  defaultChatHistory,
} from './utils/storage';
import { sound } from './utils/audio';
import { Sparkles } from 'lucide-react';

export default function App() {
  const [state, setState] = useState<AppState>(() => loadAppState());
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'projects' | 'settings'>('overview');

  // Modal states
  const [inspectTask, setInspectTask] = useState<Task | null>(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  const [isOverviewSettingsOpen, setIsOverviewSettingsOpen] = useState(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [isAIProcessing, setIsAIProcessing] = useState(false);

  const [quickCreateType, setQuickCreateType] = useState<'task' | 'project'>('task');
  const [quickCreateDefaultProjectId, setQuickCreateDefaultProjectId] = useState<string | undefined>(undefined);

  // Focus Timer interval ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync sound settings with AudioEngine
  useEffect(() => {
    sound.setEnabled(state.settings.audioEnabled);
  }, [state.settings.audioEnabled]);

  // Persist state changes
  useEffect(() => {
    saveAppState(state);
  }, [state]);

  // Timer lifecycle
  useEffect(() => {
    if (state.focusTimer.isRunning) {
      timerRef.current = setInterval(() => {
        setState((prev) => {
          if (prev.focusTimer.remainingSeconds <= 1) {
            clearInterval(timerRef.current as NodeJS.Timeout);
            sound.playCompletion();

            return {
              ...prev,
              focusTimer: {
                ...prev.focusTimer,
                remainingSeconds: prev.settings.focusMinutes * 60,
                isRunning: false,
                completedCycles: prev.focusTimer.completedCycles + 1,
              },
            };
          }

          return {
            ...prev,
            focusTimer: {
              ...prev.focusTimer,
              remainingSeconds: prev.focusTimer.remainingSeconds - 1,
            },
          };
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [state.focusTimer.isRunning, state.settings.focusMinutes]);

  // Focus Timer controls
  const handleToggleTimer = () => {
    sound.playTick();
    setState((prev) => ({
      ...prev,
      focusTimer: {
        ...prev.focusTimer,
        isRunning: !prev.focusTimer.isRunning,
      },
    }));
  };

  const handleResetTimer = () => {
    sound.playTick();
    setState((prev) => ({
      ...prev,
      focusTimer: {
        ...prev.focusTimer,
        isRunning: false,
        remainingSeconds: prev.settings.focusMinutes * 60,
      },
    }));
  };

  const handleSelectFocusPreset = (minutes: number) => {
    sound.playTick();
    setState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        focusMinutes: minutes,
      },
      focusTimer: {
        ...prev.focusTimer,
        durationSeconds: minutes * 60,
        remainingSeconds: minutes * 60,
        isRunning: false,
      },
    }));
  };

  // Overview Widgets controls
  const handleReorderOverviewWidgets = (newWidgets: OverviewWidgetConfig[]) => {
    sound.playTick();
    setState((prev) => ({
      ...prev,
      overviewWidgets: newWidgets,
    }));
  };

  const handleToggleOverviewWidget = (widgetId: string) => {
    sound.playTick();
    setState((prev) => ({
      ...prev,
      overviewWidgets: prev.overviewWidgets.map((w) =>
        w.id === widgetId ? { ...w, visible: !w.visible } : w
      ),
    }));
  };

  const handleResetOverviewWidgets = () => {
    sound.playTick();
    setState((prev) => ({
      ...prev,
      overviewWidgets: defaultOverviewWidgets,
    }));
  };

  // Task actions
  const handleToggleTask = (taskId: string) => {
    sound.playTick();
    setState((prev) => {
      const updatedTasks = prev.tasks.map((t) => {
        if (t.id === taskId) {
          const willBeCompleted = !t.completed;
          if (willBeCompleted) sound.playChime();
          return {
            ...t,
            completed: willBeCompleted,
            completedAt: willBeCompleted ? new Date().toISOString().slice(0, 10) : undefined,
          };
        }
        return t;
      });
      return { ...prev, tasks: updatedTasks };
    });
  };

  const handleDeleteTask = (taskId: string) => {
    sound.playTick();
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== taskId),
    }));
    if (inspectTask?.id === taskId) {
      setIsTaskDetailOpen(false);
      setInspectTask(null);
    }
  };

  const handleUpdateTask = (updatedTask: Task) => {
    sound.playTick();
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)),
    }));
    setInspectTask(updatedTask);
  };

  const handleOpenTaskDetail = (task: Task) => {
    sound.playTick();
    setInspectTask(task);
    setIsTaskDetailOpen(true);
  };

  // Tasks Hub Reordering
  const handleReorderTasks = (newTasks: Task[]) => {
    sound.playTick();
    setState((prev) => ({
      ...prev,
      tasks: newTasks,
    }));
  };

  // Automatic Priority Change
  const handleChangeTaskPriority = (taskId: string, newPriority: Priority) => {
    sound.playTick();
    setState((prev) => {
      const task = prev.tasks.find((t) => t.id === taskId);
      if (!task) return prev;

      const updatedTask: Task = { ...task, priority: newPriority };
      const remainingTasks = prev.tasks.filter((t) => t.id !== taskId);

      const priorityWeights: Record<Priority, number> = { p0: 0, high: 1, medium: 2, low: 3 };
      const targetWeight = priorityWeights[newPriority];

      let insertIndex = remainingTasks.findIndex(
        (t) => priorityWeights[t.priority] > targetWeight
      );
      if (insertIndex === -1) {
        insertIndex = remainingTasks.length;
      }

      remainingTasks.splice(insertIndex, 0, updatedTask);
      return { ...prev, tasks: remainingTasks };
    });
  };

  // Projects actions
  const handleDeleteProject = (projectId: string) => {
    if (window.confirm('Delete this initiative? Associated action items will remain in general tasks.')) {
      sound.playTick();
      setState((prev) => ({
        ...prev,
        projects: prev.projects.filter((p) => p.id !== projectId),
        tasks: prev.tasks.map((t) => (t.projectId === projectId ? { ...t, projectId: null } : t)),
      }));
    }
  };

  const handleReorderProjects = (newProjects: Project[]) => {
    sound.playTick();
    setState((prev) => ({
      ...prev,
      projects: newProjects,
    }));
  };

  // Kanban Board actions
  const handleMoveTaskToColumn = (taskId: string, targetColumnId: string) => {
    sound.playTick();
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === taskId ? { ...t, columnId: targetColumnId } : t
      ),
    }));
  };

  const handleAddColumnToProject = (projectId: string, title: string) => {
    sound.playChime();
    const newColId = `col-${projectId}-${Date.now()}`;
    setState((prev) => ({
      ...prev,
      projects: prev.projects.map((p) =>
        p.id === projectId
          ? { ...p, columns: [...p.columns, { id: newColId, title }] }
          : p
      ),
    }));
  };

  const handleRenameProjectColumn = (projectId: string, columnId: string, newTitle: string) => {
    sound.playTick();
    setState((prev) => ({
      ...prev,
      projects: prev.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              columns: p.columns.map((c) => (c.id === columnId ? { ...c, title: newTitle } : c)),
            }
          : p
      ),
    }));
  };

  const handleDeleteProjectColumn = (projectId: string, columnId: string) => {
    sound.playTick();
    setState((prev) => {
      const project = prev.projects.find((p) => p.id === projectId);
      if (!project) return prev;
      const remainingCols = project.columns.filter((c) => c.id !== columnId);
      const fallbackColId = remainingCols[0]?.id || null;

      return {
        ...prev,
        projects: prev.projects.map((p) =>
          p.id === projectId ? { ...p, columns: remainingCols } : p
        ),
        tasks: prev.tasks.map((t) =>
          t.projectId === projectId && t.columnId === columnId
            ? { ...t, columnId: fallbackColId }
            : t
        ),
      };
    });
  };

  const handleQuickAddTaskToColumn = (projectId: string, columnId: string, title: string) => {
    sound.playChime();
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title,
      priority: 'high',
      projectId,
      columnId,
      completed: false,
      subtasks: [],
      createdAt: new Date().toISOString().slice(0, 10),
    };

    setState((prev) => ({
      ...prev,
      tasks: [newTask, ...prev.tasks],
    }));
  };

  // Quick Create actions
  const handleOpenQuickCreate = (type: 'task' | 'project' = 'task', defaultProjectId?: string) => {
    sound.playTick();
    setQuickCreateType(type);
    setQuickCreateDefaultProjectId(defaultProjectId);
    setIsQuickCreateOpen(true);
  };

  const handleCreateTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    sound.playChime();
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    setState((prev) => ({
      ...prev,
      tasks: [newTask, ...prev.tasks],
    }));
  };

  const handleCreateProject = (
    projectData: Omit<Project, 'id' | 'createdAt'>,
    initialTaskTitles?: string[]
  ) => {
    sound.playChime();
    const newProjectId = `proj-${Date.now()}`;
    const newProject: Project = {
      ...projectData,
      id: newProjectId,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    const firstColumnId = newProject.columns[0]?.id;

    const newTasks: Task[] = (initialTaskTitles || []).map((title, idx) => ({
      id: `task-${Date.now()}-${idx}`,
      title,
      priority: 'high',
      projectId: newProjectId,
      columnId: firstColumnId,
      completed: false,
      subtasks: [],
      createdAt: new Date().toISOString().slice(0, 10),
    }));

    setState((prev) => ({
      ...prev,
      projects: [...prev.projects, newProject],
      tasks: [...newTasks, ...prev.tasks],
    }));
  };

  // Settings actions
  const handleUpdateUser = (updatedUser: UserProfile) => {
    sound.playChime();
    setState((prev) => ({ ...prev, user: updatedUser }));
  };

  const handleUpdateSettings = (updatedSettings: Partial<AppSettings>) => {
    sound.playTick();
    setState((prev) => {
      const nextSettings = { ...prev.settings, ...updatedSettings };
      let nextTimer = prev.focusTimer;

      if (updatedSettings.focusMinutes && updatedSettings.focusMinutes !== prev.settings.focusMinutes) {
        nextTimer = {
          ...nextTimer,
          durationSeconds: updatedSettings.focusMinutes * 60,
          remainingSeconds: updatedSettings.focusMinutes * 60,
          isRunning: false,
        };
      }

      return {
        ...prev,
        settings: nextSettings,
        focusTimer: nextTimer,
      };
    });
  };

  const handleUpdateAISettings = (updated: Partial<AISettings>) => {
    sound.playTick();
    setState((prev) => ({
      ...prev,
      aiSettings: { ...prev.aiSettings, ...updated },
    }));
  };

  const handleResetAISettings = () => {
    sound.playTick();
    setState((prev) => ({
      ...prev,
      aiSettings: defaultAISettings,
    }));
  };

  const handleClearChatHistory = () => {
    sound.playTick();
    setState((prev) => ({
      ...prev,
      chatHistory: defaultChatHistory,
    }));
  };

  const handleResetAllData = () => {
    sound.playTick();
    setState(defaultState);
  };

  const handleRestoreState = (restored: AppState) => {
    sound.playChime();
    setState(restored);
  };

  const handleToggleAudio = () => {
    const nextVal = !state.settings.audioEnabled;
    handleUpdateSettings({ audioEnabled: nextVal });
    if (nextVal) {
      setTimeout(() => sound.playChime(), 50);
    }
  };

  // AI Agent Message & Action Execution Engine
  const handleSendMessageToAI = async (userText: string) => {
    sound.playTick();
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userText,
      timestamp: 'Just now',
    };

    // Optimistically update chat history
    setState((prev) => ({
      ...prev,
      chatHistory: [...prev.chatHistory, userMsg],
    }));

    setIsAIProcessing(true);

    try {
      // Snapshot of app state for tool context
      const currentAppContext = {
        projects: state.projects.map((p) => ({ id: p.id, name: p.name })),
        totalTasks: state.tasks.length,
        p0Tasks: state.tasks
          .filter((t) => t.priority === 'p0' && !t.completed)
          .map((t) => t.title),
      };

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...state.chatHistory, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          model: state.aiSettings.model,
          enableSearch: state.aiSettings.enableSearchGrounding,
          systemInstruction: state.aiSettings.customInstructions,
          currentAppContext,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        const errorContent = data.error || 'Directive received. Operating in local executive mode.';
        const assistantNotice: ChatMessage = {
          id: `notice-${Date.now()}`,
          role: 'assistant',
          content: errorContent,
          timestamp: 'Just now',
        };
        setState((prev) => ({
          ...prev,
          chatHistory: [...prev.chatHistory, assistantNotice],
        }));
        return;
      }

      let actionExecuted = undefined;

      // Handle function tool invocations from Gemini / Executive Engine!
      if (data.functionCalls && data.functionCalls.length > 0) {
        const fc = data.functionCalls[0];
        const args = fc.args || {};

        if (fc.name === 'create_task') {
          // Find matching project if specified
          let matchedProjectId: string | null = null;
          let matchedColumnId: string | undefined = undefined;
          if (args.projectName) {
            const cleanTarget = args.projectName.toLowerCase();
            const found = state.projects.find(
              (p) =>
                p.name.toLowerCase().includes(cleanTarget) ||
                cleanTarget.includes(p.name.toLowerCase())
            );
            if (found) {
              matchedProjectId = found.id;
              matchedColumnId = found.columns?.[0]?.id;
            }
          }

          const rawPriority = (args.priority || 'medium').toLowerCase();
          const priority: Priority = ['p0', 'high', 'medium', 'low'].includes(rawPriority)
            ? (rawPriority as Priority)
            : 'medium';

          const subtasks = Array.isArray(args.subtasks)
            ? args.subtasks.map((txt: string, idx: number) => ({
                id: `sub-${Date.now()}-${idx}`,
                text: txt,
                completed: false,
              }))
            : [];

          const newTask: Task = {
            id: `task-${Date.now()}`,
            title: args.title,
            priority,
            projectId: matchedProjectId,
            columnId: matchedColumnId,
            dueDate: args.dueDate || undefined,
            notes: args.notes || undefined,
            completed: false,
            subtasks,
            createdAt: new Date().toISOString().slice(0, 10),
          };

          setState((prev) => ({
            ...prev,
            tasks: [newTask, ...prev.tasks],
          }));

          const targetProjName = state.projects.find((p) => p.id === matchedProjectId)?.name || 'General';
          actionExecuted = {
            type: 'create_task' as const,
            summary: `Created task "${args.title}" under ${targetProjName} (${priority.toUpperCase()})`,
            payload: newTask,
          };
          sound.playChime();
        } else if (fc.name === 'create_project') {
          const newProjId = `proj-${Date.now()}`;
          const color: ProjectColor = ['emerald', 'sapphire', 'amber', 'amethyst', 'ruby', 'slate'].includes(
            args.color?.toLowerCase()
          )
            ? (args.color.toLowerCase() as ProjectColor)
            : 'emerald';

          const newProject: Project = {
            id: newProjId,
            name: args.name,
            description: args.description || 'Strategic portfolio initiative',
            status: 'active',
            targetQuarter: args.targetQuarter || 'Q3 2026',
            color,
            columns: [
              { id: `col-${newProjId}-1`, title: 'Planning & Intel' },
              { id: `col-${newProjId}-2`, title: 'In Execution' },
              { id: `col-${newProjId}-3`, title: 'Audit & Review' },
              { id: `col-${newProjId}-4`, title: 'Settled & Verified' },
            ],
            createdAt: new Date().toISOString().slice(0, 10),
          };

          const initialTasks: Task[] = (args.initialTasks || []).map(
            (tTitle: string, idx: number) => ({
              id: `task-${Date.now()}-${idx}`,
              title: tTitle,
              priority: 'high',
              projectId: newProjId,
              columnId: `col-${newProjId}-1`,
              completed: false,
              subtasks: [],
              createdAt: new Date().toISOString().slice(0, 10),
            })
          );

          setState((prev) => ({
            ...prev,
            projects: [...prev.projects, newProject],
            tasks: [...initialTasks, ...prev.tasks],
          }));

          actionExecuted = {
            type: 'create_project' as const,
            summary: `Launched initiative "${args.name}" with ${initialTasks.length} tasks`,
            payload: newProject,
          };
          sound.playChime();
        } else if (fc.name === 'update_task') {
          const targetTitle = (args.taskTitle || '').toLowerCase();
          setState((prev) => {
            const updatedTasks = prev.tasks.map((t) => {
              if (t.title.toLowerCase().includes(targetTitle)) {
                return {
                  ...t,
                  completed: args.completed !== undefined ? args.completed : t.completed,
                  priority: args.priority || t.priority,
                };
              }
              return t;
            });
            return { ...prev, tasks: updatedTasks };
          });

          actionExecuted = {
            type: 'update_task' as const,
            summary: `Updated task matching "${args.taskTitle}"`,
          };
          sound.playChime();
        } else if (fc.name === 'set_focus_timer') {
          const mins = Number(args.minutes) || 25;
          handleSelectFocusPreset(mins);
          if (args.startNow) {
            setState((prev) => ({
              ...prev,
              focusTimer: { ...prev.focusTimer, isRunning: true },
            }));
          }
          actionExecuted = {
            type: 'set_focus_timer' as const,
            summary: `Configured focus sprint to ${mins} minutes`,
          };
          sound.playChime();
        }
      }

      // Voice Audio Response if enabled
      if (state.aiSettings.voiceAutoSpeak && data.content) {
        try {
          const ttsRes = await fetch('/api/ai/speak', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: data.content }),
          });
          const ttsData = await ttsRes.json();
          if (ttsData.audioBase64) {
            const audio = new Audio(`data:audio/wav;base64,${ttsData.audioBase64}`);
            audio.play().catch(() => {});
          } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            const cleanText = data.content.replace(/[*#_`]/g, '');
            const utterance = new SpeechSynthesisUtterance(cleanText);
            utterance.rate = 1.05;
            window.speechSynthesis.speak(utterance);
          }
        } catch {
          // Fallback gracefully
        }
      }

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.content || (actionExecuted ? `Action executed: ${actionExecuted.summary}` : 'Directive registered.'),
        timestamp: 'Just now',
        webSources: data.webSources,
        actionExecuted,
      };

      setState((prev) => ({
        ...prev,
        chatHistory: [...prev.chatHistory, assistantMsg],
      }));
    } catch (err: any) {
      console.warn('AI chat notice:', err?.message);
      const noticeMsg: ChatMessage = {
        id: `notice-${Date.now()}`,
        role: 'assistant',
        content: `Operational directive registered. If you wish to activate full Gemini live generative models, attach your GEMINI_API_KEY in AI Studio Secrets.`,
        timestamp: 'Just now',
      };
      setState((prev) => ({
        ...prev,
        chatHistory: [...prev.chatHistory, noticeMsg],
      }));
    } finally {
      setIsAIProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121316] text-[#F5F5F7] flex flex-col font-sans selection:bg-[#d4af37]/30 selection:text-[#fdf3c7]">
      {/* Executive Header */}
      <Header
        user={state.user}
        audioEnabled={state.settings.audioEnabled}
        onToggleAudio={handleToggleAudio}
        onOpenQuickCreate={() => handleOpenQuickCreate('task')}
        onOpenAIAssistant={() => setIsAIAssistantOpen(true)}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          sound.playTick();
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Main Workspace Frame */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 pb-28 md:pb-12">
        {activeTab === 'overview' && (
          <OverviewView
            state={state}
            onToggleTask={handleToggleTask}
            onOpenTaskDetail={handleOpenTaskDetail}
            onToggleTimer={handleToggleTimer}
            onResetTimer={handleResetTimer}
            onSelectFocusPreset={handleSelectFocusPreset}
            onSwitchTab={(tab) => {
              sound.playTick();
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenQuickCreate={handleOpenQuickCreate}
            onOpenOverviewSettings={() => {
              sound.playTick();
              setIsOverviewSettingsOpen(true);
            }}
            onReorderWidgets={handleReorderOverviewWidgets}
          />
        )}

        {activeTab === 'tasks' && (
          <TasksView
            tasks={state.tasks}
            projects={state.projects}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
            onOpenTaskDetail={handleOpenTaskDetail}
            onOpenQuickCreate={() => handleOpenQuickCreate('task')}
            onReorderTasks={handleReorderTasks}
            onChangeTaskPriority={handleChangeTaskPriority}
          />
        )}

        {activeTab === 'projects' && (
          <ProjectsView
            projects={state.projects}
            tasks={state.tasks}
            onToggleTask={handleToggleTask}
            onOpenTaskDetail={handleOpenTaskDetail}
            onDeleteProject={handleDeleteProject}
            onOpenQuickCreate={handleOpenQuickCreate}
            onReorderProjects={handleReorderProjects}
            onMoveTaskToColumn={handleMoveTaskToColumn}
            onAddColumnToProject={handleAddColumnToProject}
            onRenameProjectColumn={handleRenameProjectColumn}
            onDeleteProjectColumn={handleDeleteProjectColumn}
            onQuickAddTaskToColumn={handleQuickAddTaskToColumn}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            user={state.user}
            settings={state.settings}
            aiSettings={state.aiSettings}
            fullState={state}
            onUpdateUser={handleUpdateUser}
            onUpdateSettings={handleUpdateSettings}
            onUpdateAISettings={handleUpdateAISettings}
            onTestAgent={() => setIsAIAssistantOpen(true)}
            onResetAISettings={handleResetAISettings}
            onTestAudio={() => sound.playChime()}
            onResetAllData={handleResetAllData}
            onRestoreState={handleRestoreState}
          />
        )}
      </main>

      {/* Floating Quick AI Orb (Mobile / Fast Access) */}
      <button
        onClick={() => {
          sound.playTick();
          setIsAIAssistantOpen(true);
        }}
        className="md:hidden fixed bottom-20 right-4 z-40 w-12 h-12 rounded-full bg-gradient-to-b from-[#E5C158] to-[#D4AF37] text-[#121316] flex items-center justify-center shadow-xl shadow-[#d4af37]/35 active:scale-90 transition-transform"
        title="Open AI Executive Agent"
      >
        <Sparkles className="w-5 h-5 stroke-[2.5]" />
      </button>

      {/* Mobile Docked Bottom Navigation */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={(tab) => {
          sound.playTick();
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenQuickCreate={() => handleOpenQuickCreate('task')}
      />

      {/* Modals */}
      <TaskDetailModal
        task={inspectTask}
        projects={state.projects}
        isOpen={isTaskDetailOpen}
        onClose={() => {
          sound.playTick();
          setIsTaskDetailOpen(false);
          setInspectTask(null);
        }}
        onUpdateTask={handleUpdateTask}
        onDeleteTask={handleDeleteTask}
      />

      <QuickCreateModal
        isOpen={isQuickCreateOpen}
        initialType={quickCreateType}
        defaultProjectId={quickCreateDefaultProjectId}
        projects={state.projects}
        onClose={() => {
          sound.playTick();
          setIsQuickCreateOpen(false);
        }}
        onCreateTask={handleCreateTask}
        onCreateProject={handleCreateProject}
      />

      <OverviewSettingsModal
        isOpen={isOverviewSettingsOpen}
        onClose={() => {
          sound.playTick();
          setIsOverviewSettingsOpen(false);
        }}
        widgets={state.overviewWidgets}
        onToggleWidget={handleToggleOverviewWidget}
        onReorderWidgets={handleReorderOverviewWidgets}
        onResetWidgets={handleResetOverviewWidgets}
      />

      <AIAssistantModal
        isOpen={isAIAssistantOpen}
        onClose={() => {
          sound.playTick();
          setIsAIAssistantOpen(false);
        }}
        messages={state.chatHistory}
        onSendMessage={handleSendMessageToAI}
        aiSettings={state.aiSettings}
        projects={state.projects}
        tasks={state.tasks}
        isProcessing={isAIProcessing}
        onClearHistory={handleClearChatHistory}
      />
    </div>
  );
}
