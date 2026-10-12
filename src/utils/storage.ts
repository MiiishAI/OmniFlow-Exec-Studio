import { AppState, OverviewWidgetConfig, Project, Task, AISettings, ChatMessage } from '../types';

const STORAGE_KEY = 'omniflow_executive_state_v2';

export const defaultOverviewWidgets: OverviewWidgetConfig[] = [
  {
    id: 'briefing',
    title: 'Executive Briefing',
    description: 'Real-time cycle status, greeting, and high-level progress metrics',
    visible: true,
  },
  {
    id: 'timer',
    title: 'Focus Session Stopwatch',
    description: 'Precision sprint timer with presets and acoustic feedback',
    visible: true,
  },
  {
    id: 'checklist',
    title: 'Critical Path Checklist',
    description: 'High-priority action items and subtask execution status',
    visible: true,
  },
  {
    id: 'priority_project',
    title: 'Top Priority Initiative',
    description: 'Snapshot and deliverable execution of your leading portfolio',
    visible: true,
  },
  {
    id: 'trend',
    title: 'Productivity Trend',
    description: '7-day performance trajectory and completed task throughput',
    visible: true,
  },
  {
    id: 'kpi_metrics',
    title: 'Executive Performance Matrix',
    description: 'Velocity ratios, priority distribution, and operational metrics',
    visible: true,
  },
];

export const defaultProjects: Project[] = [
  {
    id: 'proj-1',
    name: 'Project Nexus: Sovereign Bridge',
    description: 'Cross-shard settlement and cryptographic treasury consensus architecture.',
    status: 'active',
    targetQuarter: 'Q3 2026',
    color: 'emerald', // Dark Green
    createdAt: '2026-09-15',
    columns: [
      { id: 'col-1-1', title: 'Planning & Intel' },
      { id: 'col-1-2', title: 'In Execution' },
      { id: 'col-1-3', title: 'Audit & Review' },
      { id: 'col-1-4', title: 'Settled & Verified' },
    ],
  },
  {
    id: 'proj-2',
    name: 'Nordic Horizon Expansion',
    description: 'Enterprise institutional syndication and sovereign wealth allocation.',
    status: 'active',
    targetQuarter: 'Q3 2026',
    color: 'sapphire', // Deep Sapphire Blue
    createdAt: '2026-09-22',
    columns: [
      { id: 'col-2-1', title: 'Deal Origination' },
      { id: 'col-2-2', title: 'Due Diligence' },
      { id: 'col-2-3', title: 'Syndicate Sign-off' },
      { id: 'col-2-4', title: 'Closed' },
    ],
  },
  {
    id: 'proj-3',
    name: 'Capital Governance & Audit',
    description: 'Tier-1 reserve attestation, multi-sig verification, and compliance framework.',
    status: 'review',
    targetQuarter: 'Q4 2026',
    color: 'amber', // Champagne Amber
    createdAt: '2026-10-01',
    columns: [
      { id: 'col-3-1', title: 'Regulatory Intake' },
      { id: 'col-3-2', title: 'Proof-of-Reserve' },
      { id: 'col-3-3', title: 'External Attestation' },
      { id: 'col-3-4', title: 'Final Report' },
    ],
  },
];

export const defaultTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Finalize Multi-Chain Liquidity Routing',
    priority: 'p0',
    projectId: 'proj-1',
    columnId: 'col-1-2',
    order: 0,
    completed: false,
    dueDate: 'Today · 16:00 CET',
    notes: 'Ensure latency threshold is below 12ms before executing settlement pipeline.',
    createdAt: '2026-10-10',
    subtasks: [
      { id: 'sub-1', text: 'Audit cryptographic threshold signatures', completed: true },
      { id: 'sub-2', text: 'Benchmark multi-subnet routing latency', completed: false },
      { id: 'sub-3', text: 'Execute automated fallback circuit breakers', completed: false },
    ],
  },
  {
    id: 'task-2',
    title: 'Conduct Institutional LP Briefing',
    priority: 'high',
    projectId: 'proj-2',
    columnId: 'col-2-2',
    order: 1,
    completed: false,
    dueDate: 'Tomorrow · 10:30 CET',
    notes: 'Present Q3 performance metrics and strategic risk-weighted yields.',
    createdAt: '2026-10-11',
    subtasks: [
      { id: 'sub-4', text: 'Synthesize Q3 performance summary decks', completed: true },
      { id: 'sub-5', text: 'Verify cross-border capital repatriation rules', completed: false },
    ],
  },
  {
    id: 'task-3',
    title: 'Cryptographic Reserve Attestation Verification',
    priority: 'high',
    projectId: 'proj-3',
    columnId: 'col-3-3',
    order: 2,
    completed: true,
    completedAt: '2026-10-08',
    dueDate: 'Yesterday',
    notes: 'Auditor sign-off complete. On-chain merkle tree verified.',
    createdAt: '2026-10-08',
    subtasks: [
      { id: 'sub-6', text: 'Reconcile offline vault addresses', completed: true },
      { id: 'sub-7', text: 'Publish cryptographic zero-knowledge proof', completed: true },
    ],
  },
  {
    id: 'task-4',
    title: 'Treasury Liquidity Settlement Engine Audit',
    priority: 'high',
    projectId: 'proj-1',
    columnId: 'col-1-4',
    order: 3,
    completed: true,
    completedAt: '2026-10-09',
    dueDate: 'Oct 09',
    notes: 'Zero latency anomalies detected during high-throughput stress run.',
    createdAt: '2026-10-07',
    subtasks: [
      { id: 'sub-8-prev', text: 'Stress-test matching engine', completed: true },
    ],
  },
  {
    id: 'task-5',
    title: 'Cold-Storage Multisig Quorum Attestation',
    priority: 'p0',
    projectId: 'proj-3',
    columnId: 'col-3-4',
    order: 4,
    completed: true,
    completedAt: '2026-10-10',
    dueDate: 'Oct 10',
    notes: 'Signed by 5 of 7 hardware cryptographic keys.',
    createdAt: '2026-10-08',
    subtasks: [
      { id: 'sub-9-prev', text: 'Hardware key exchange meeting', completed: true },
    ],
  },
  {
    id: 'task-6',
    title: 'LP Capital Distribution Memo v2',
    priority: 'medium',
    projectId: 'proj-2',
    columnId: 'col-2-4',
    order: 5,
    completed: true,
    completedAt: '2026-10-11',
    dueDate: 'Oct 11',
    notes: 'Approved by Investment Committee.',
    createdAt: '2026-10-09',
    subtasks: [
      { id: 'sub-10-prev', text: 'Circulate to general partners', completed: true },
    ],
  },
  {
    id: 'task-7',
    title: 'Calibrate Sovereign Yield Parameters',
    priority: 'medium',
    projectId: 'proj-1',
    columnId: 'col-1-1',
    order: 6,
    completed: false,
    dueDate: 'Oct 15',
    notes: 'Adjust dynamic risk spreads based on volatile macro liquidity index.',
    createdAt: '2026-10-11',
    subtasks: [
      { id: 'sub-8', text: 'Simulate liquidity stress in test environment', completed: false },
      { id: 'sub-9', text: 'Set algorithmic liquidation boundaries', completed: false },
    ],
  },
  {
    id: 'task-8',
    title: 'Quarterly Executive Risk Review Memo',
    priority: 'low',
    projectId: 'proj-3',
    columnId: 'col-3-1',
    order: 7,
    completed: false,
    dueDate: 'Oct 20',
    notes: 'Internal governance report for executive committee review.',
    createdAt: '2026-10-12',
    subtasks: [
      { id: 'sub-10', text: 'Collect operational incident logs', completed: false },
    ],
  },
];

export const defaultAISettings: AISettings = {
  enabled: true,
  model: 'gemini-3.8-flash',
  enableSearchGrounding: true,
  voiceAutoSpeak: false,
  persona: 'chief_of_staff',
  customInstructions: '',
};

export const defaultChatHistory: ChatMessage[] = [
  {
    id: 'msg-welcome',
    role: 'assistant',
    content:
      'Good day, Executive. I am your OmniFlow Operations Agent powered by Gemini. You can speak or write directives to me—such as creating tasks under any project, initiating portfolios, adjusting sprint timers, or querying real-time market intelligence.',
    timestamp: 'Just now',
  },
];

export const defaultState: AppState = {
  user: {
    name: 'Michael Fradkin',
    title: 'Executive Director',
    organization: 'OmniFlow Strategic Capital',
  },
  settings: {
    focusMinutes: 45,
    audioEnabled: true,
    hapticsEnabled: true,
    dailyGoalTasks: 5,
    theme: 'executive_gold',
  },
  aiSettings: defaultAISettings,
  chatHistory: defaultChatHistory,
  focusTimer: {
    durationSeconds: 45 * 60,
    remainingSeconds: 45 * 60,
    isRunning: false,
    completedCycles: 3,
  },
  overviewWidgets: defaultOverviewWidgets,
  projects: defaultProjects,
  tasks: defaultTasks,
};

export function loadAppState(): AppState {
  if (typeof window === 'undefined') return defaultState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('omniflow_executive_state_v1');
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw);

    // Merge projects ensuring colors & columns exist
    const projects: Project[] = (Array.isArray(parsed.projects) ? parsed.projects : defaultProjects).map(
      (p: any, idx: number) => {
        const fallback = defaultProjects[idx] || defaultProjects[0];
        return {
          ...p,
          color: p.color || fallback.color || 'emerald',
          columns: Array.isArray(p.columns) && p.columns.length > 0 ? p.columns : (fallback.columns || [
            { id: `col-${p.id}-1`, title: 'Planning' },
            { id: `col-${p.id}-2`, title: 'In Execution' },
            { id: `col-${p.id}-3`, title: 'Audit' },
            { id: `col-${p.id}-4`, title: 'Done' },
          ]),
        };
      }
    );

    // Merge tasks
    const tasks: Task[] = (Array.isArray(parsed.tasks) ? parsed.tasks : defaultTasks).map(
      (t: Task, idx: number) => ({
        ...t,
        description: t.description !== undefined ? t.description : (t.notes || ''),
        order: typeof t.order === 'number' ? t.order : idx,
      })
    );

    // Merge overview widgets
    const storedWidgets: OverviewWidgetConfig[] = Array.isArray(parsed.overviewWidgets)
      ? parsed.overviewWidgets
      : defaultOverviewWidgets;

    // Ensure all default widget keys exist while preserving user order
    const finalWidgets: OverviewWidgetConfig[] = [];
    storedWidgets.forEach((sw) => {
      const match = defaultOverviewWidgets.find((dw) => dw.id === sw.id);
      if (match) {
        finalWidgets.push({ ...match, visible: sw.visible !== false });
      }
    });
    defaultOverviewWidgets.forEach((dw) => {
      if (!finalWidgets.some((w) => w.id === dw.id)) {
        finalWidgets.push(dw);
      }
    });

    return {
      user: { ...defaultState.user, ...(parsed.user || {}) },
      settings: {
        ...defaultState.settings,
        ...(parsed.settings || {}),
        theme: parsed.settings?.theme || defaultState.settings.theme,
      },
      aiSettings: { ...defaultState.aiSettings, ...(parsed.aiSettings || {}) },
      chatHistory: Array.isArray(parsed.chatHistory) && parsed.chatHistory.length > 0 ? parsed.chatHistory : defaultChatHistory,
      focusTimer: {
        ...defaultState.focusTimer,
        ...(parsed.focusTimer || {}),
        isRunning: false,
      },
      overviewWidgets: finalWidgets,
      projects,
      tasks,
    };
  } catch (err) {
    console.warn('Failed to parse stored state, using defaults', err);
    return defaultState;
  }
}

export function saveAppState(state: AppState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err: any) {
    console.warn('LocalStorage save notice:', err?.message);
  }
}

export function clearAppState(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem('omniflow_executive_state_v1');
}
