export type Priority = 'p0' | 'high' | 'medium' | 'low';

export type ProjectColor = 'emerald' | 'sapphire' | 'amber' | 'amethyst' | 'ruby' | 'slate';

export interface Subtask {
  id: string;
  text: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  priority: Priority;
  projectId?: string | null;
  columnId?: string | null; // For Kanban section in project
  order?: number; // Ordering for ranking
  completed: boolean;
  completedAt?: string;
  subtasks: Subtask[];
  dueDate?: string;
  notes?: string;
  description?: string; // Optional detailed task description
  createdAt: string;
}

export type AppTheme = 'executive_gold' | 'space_tech' | 'business_pro';

export interface KanbanColumn {
  id: string;
  title: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'review' | 'completed';
  targetQuarter?: string;
  color: ProjectColor;
  columns: KanbanColumn[];
  createdAt: string;
}

export interface UserProfile {
  name: string;
  title: string;
  organization: string;
}

export interface AppSettings {
  focusMinutes: number;
  audioEnabled: boolean;
  hapticsEnabled: boolean;
  dailyGoalTasks: number;
  theme: AppTheme;
}

export type OverviewWidgetId = 'briefing' | 'timer' | 'checklist' | 'priority_project' | 'kpi_metrics' | 'trend';

export interface OverviewWidgetConfig {
  id: OverviewWidgetId;
  title: string;
  description: string;
  visible: boolean;
}

export interface AISettings {
  enabled: boolean;
  model: 'gemini-3.8-flash' | 'gemini-3.1-pro-preview' | 'gemini-3.1-flash-lite' | 'gemini-3.5-flash';
  enableSearchGrounding: boolean;
  voiceAutoSpeak: boolean;
  persona: 'chief_of_staff' | 'venture_partner' | 'operations_director';
  customInstructions: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  webSources?: Array<{ title: string; uri: string }>;
  actionExecuted?: {
    type: 'create_task' | 'create_project' | 'update_task' | 'set_focus_timer' | 'set_theme';
    summary: string;
    payload?: any;
  };
}

export interface AppState {
  user: UserProfile;
  tasks: Task[];
  projects: Project[];
  overviewWidgets: OverviewWidgetConfig[];
  settings: AppSettings;
  aiSettings: AISettings;
  chatHistory: ChatMessage[];
  focusTimer: {
    durationSeconds: number;
    remainingSeconds: number;
    isRunning: boolean;
    completedCycles: number;
  };
}
