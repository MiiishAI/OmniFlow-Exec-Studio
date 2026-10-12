import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '25mb' }));

// Shared server-side Gemini client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Tool / Function declarations for OmniFlow Action Execution
const createTaskDeclaration: FunctionDeclaration = {
  name: 'create_task',
  description: 'Create a new action item or task in OmniFlow, optionally assigning it to an existing project or priority.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: {
        type: Type.STRING,
        description: 'The title of the action item or task.',
      },
      priority: {
        type: Type.STRING,
        description: 'Priority level: "p0" (critical urgent), "high", "medium", or "low". Default to "medium" if unspecified.',
      },
      projectName: {
        type: Type.STRING,
        description: 'Optional name of the project to associate this task with (e.g., "Project Nexus", "Nordic Horizon").',
      },
      dueDate: {
        type: Type.STRING,
        description: 'Optional target due date and time (e.g., "Today · 17:00", "Tomorrow · 10:30", "Oct 18 · 15:00").',
      },
      notes: {
        type: Type.STRING,
        description: 'Optional executive notes or operational context.',
      },
      subtasks: {
        type: Type.ARRAY,
        items: {
          type: Type.STRING,
        },
        description: 'Optional initial list of step-by-step subtasks.',
      },
    },
    required: ['title'],
  },
};

const createProjectDeclaration: FunctionDeclaration = {
  name: 'create_project',
  description: 'Create a new strategic portfolio initiative with target timeline, color theme, and initial deliverables.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      name: {
        type: Type.STRING,
        description: 'The name of the strategic initiative.',
      },
      description: {
        type: Type.STRING,
        description: 'Strategic scope, description, and objectives.',
      },
      targetQuarter: {
        type: Type.STRING,
        description: 'Target quarter or timeframe (e.g., "Q3 2026", "Q4 2026", "Horizon 2027").',
      },
      color: {
        type: Type.STRING,
        description: 'Theme color: "emerald" (dark green), "sapphire" (deep blue), "amber" (champagne gold), "amethyst" (purple), "ruby" (burgundy), or "slate" (carbon).',
      },
      initialTasks: {
        type: Type.ARRAY,
        items: {
          type: Type.STRING,
        },
        description: 'Optional array of task titles to create under this new initiative.',
      },
    },
    required: ['name'],
  },
};

const updateTaskDeclaration: FunctionDeclaration = {
  name: 'update_task',
  description: 'Update the status, priority, or completion state of an existing task in OmniFlow.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      taskTitle: {
        type: Type.STRING,
        description: 'Title or partial title of the task to update.',
      },
      completed: {
        type: Type.BOOLEAN,
        description: 'Set true to mark completed/cleared, or false to mark in-progress.',
      },
      priority: {
        type: Type.STRING,
        description: 'Update priority to "p0", "high", "medium", or "low".',
      },
    },
    required: ['taskTitle'],
  },
};

const setFocusTimerDeclaration: FunctionDeclaration = {
  name: 'set_focus_timer',
  description: 'Set or start an operational focus sprint stopwatch session in OmniFlow.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      minutes: {
        type: Type.NUMBER,
        description: 'Duration in minutes (e.g. 15, 25, 45, 60).',
      },
      startNow: {
        type: Type.BOOLEAN,
        description: 'Whether to immediately start the timer.',
      },
    },
    required: ['minutes'],
  },
};

const setThemeDeclaration: FunctionDeclaration = {
  name: 'set_theme',
  description: 'Change the application UI theme / visual design between "executive_gold" (signature luxury), "space_tech" (space/tech sci-fi theme), or "business_pro" (regular modern corporate business design).',
  parameters: {
    type: Type.OBJECT,
    properties: {
      theme: {
        type: Type.STRING,
        description: 'The theme key: "executive_gold", "space_tech", or "business_pro".',
      },
    },
    required: ['theme'],
  },
};

// Local Executive AI Rule & Natural Language Parser (Active Fallback)
interface LocalExecutiveResult {
  role: 'assistant';
  content: string;
  functionCalls?: Array<{ name: string; args: any }>;
  webSources?: Array<{ title: string; uri: string }>;
  isLocalEngine: boolean;
}

function handleLocalExecutiveAI(
  messages: Array<{ role: string; content: string }>,
  currentAppContext: any = {}
): LocalExecutiveResult {
  const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
  const rawText = lastUserMsg?.content || '';
  const text = rawText.trim();
  const lower = text.toLowerCase();

  const activeProjects: Array<{ id: string; name: string }> = currentAppContext.projects || [];
  const totalTasks: number = currentAppContext.totalTasks || 0;
  const p0Tasks: string[] = currentAppContext.p0Tasks || [];

  // 1. Task Creation Detection
  const isCreateTask =
    /\b(create|add|new|make|schedule)\s+(a\s+|an\s+)?(task|action item|to-do|item)\b/i.test(text) ||
    /^task\s*[:\-]/i.test(text) ||
    (/\b(create|add)\b/i.test(text) && /\b(under|to|in)\s+(project|initiative)\b/i.test(text));

  if (isCreateTask) {
    let priority: 'p0' | 'high' | 'medium' | 'low' = 'high';
    if (/\b(p0|priority 0|p-0|critical|urgent|emergency)\b/i.test(lower)) {
      priority = 'p0';
    } else if (/\b(high|important)\b/i.test(lower)) {
      priority = 'high';
    } else if (/\b(low)\b/i.test(lower)) {
      priority = 'low';
    } else if (/\b(medium|normal)\b/i.test(lower)) {
      priority = 'medium';
    }

    let matchedProjectName: string | undefined = undefined;
    for (const proj of activeProjects) {
      if (lower.includes(proj.name.toLowerCase())) {
        matchedProjectName = proj.name;
        break;
      }
    }
    if (!matchedProjectName) {
      const projMatch = text.match(/(?:under|to|in)\s+(?:the\s+)?(?:project\s+|initiative\s+)?([A-Za-z0-9\s—–-]+?)(?:\s+(?:with|priority|due|subtasks|and|notes|$))/i);
      if (projMatch && projMatch[1]) {
        const candidate = projMatch[1].trim();
        const found = activeProjects.find(
          (p) =>
            p.name.toLowerCase().includes(candidate.toLowerCase()) ||
            candidate.toLowerCase().includes(p.name.toLowerCase())
        );
        matchedProjectName = found ? found.name : candidate;
      }
    }

    let dueDate: string | undefined = undefined;
    const dueMatch = text.match(/\b(due\s+(?:on\s+)?(?:today|tomorrow|next week|monday|tuesday|wednesday|thursday|friday|saturday|sunday|[A-Za-z]{3}\s+\d{1,2}(?:\s*·\s*\d{1,2}:\d{2})?))/i);
    if (dueMatch) {
      dueDate = dueMatch[1].replace(/^due\s+(?:on\s+)?/i, '').trim();
      dueDate = dueDate.charAt(0).toUpperCase() + dueDate.slice(1);
    } else if (/\btomorrow\b/i.test(lower)) {
      dueDate = 'Tomorrow · 17:00';
    } else if (/\btoday\b/i.test(lower)) {
      dueDate = 'Today · 18:00';
    }

    let subtasks: string[] = [];
    const subtaskMatch = text.match(/subtasks?[:\s]+([^.]+)/i);
    if (subtaskMatch && subtaskMatch[1]) {
      subtasks = subtaskMatch[1]
        .split(/[,;\n]/)
        .map((s) => s.trim().replace(/^[-*•]\s*/, ''))
        .filter(Boolean);
    }

    let title = text;
    title = title.replace(/^(?:please\s+)?(?:can you\s+)?(?:create|add|new|make|schedule)\s+(?:a\s+|an\s+)?(?:task|action item|to-do|item)?(?:\s*to|\s*for|\s*:)?/i, '');
    title = title.replace(/^task\s*[:\-]\s*/i, '');
    title = title.replace(/(?:under|to|in)\s+(?:the\s+)?(?:project\s+|initiative\s+)?([A-Za-z0-9\s—–-]+?)(?:\s+(?:with|priority|due|subtasks)|$)/i, '');
    title = title.replace(/\b(?:with\s+)?priority\s+(?:p0|high|medium|low)\b/gi, '');
    title = title.replace(/\b(?:p0|critical|urgent)\b/gi, '');
    title = title.replace(/\bdue\s+[^,.]+/gi, '');
    title = title.replace(/subtasks?[:\s]+[^.]+/gi, '');
    title = title.replace(/^["'`\s]+|["'`\s]+$/g, '').trim();

    if (!title || title.length < 3) {
      title = `Executive Directive: ${rawText.slice(0, 45)}...`;
    }
    title = title.charAt(0).toUpperCase() + title.slice(1);

    const targetDisplay = matchedProjectName || 'General Workspace';
    const content = `Directive processed: Created task **"${title}"** assigned to **${targetDisplay}** with priority **${priority.toUpperCase()}**${dueDate ? ` (due ${dueDate})` : ''}. All operational indices and priority matrices have been updated.`;

    return {
      role: 'assistant',
      content,
      functionCalls: [
        {
          name: 'create_task',
          args: {
            title,
            priority,
            projectName: matchedProjectName,
            dueDate,
            subtasks: subtasks.length > 0 ? subtasks : undefined,
          },
        },
      ],
      isLocalEngine: true,
    };
  }

  // 2. Project Creation Detection
  const isCreateProject =
    /\b(create|launch|start|add|commission|new)\s+(a\s+|an\s+)?(project|initiative|portfolio)\b/i.test(text) ||
    /^project\s*[:\-]/i.test(text);

  if (isCreateProject) {
    let color = 'emerald';
    if (/\b(emerald|green|dark green)\b/i.test(lower)) color = 'emerald';
    else if (/\b(sapphire|blue|navy)\b/i.test(lower)) color = 'sapphire';
    else if (/\b(amber|gold|champagne|yellow)\b/i.test(lower)) color = 'amber';
    else if (/\b(amethyst|purple|violet)\b/i.test(lower)) color = 'amethyst';
    else if (/\b(ruby|red|burgundy|crimson)\b/i.test(lower)) color = 'ruby';
    else if (/\b(slate|carbon|grey|gray|black)\b/i.test(lower)) color = 'slate';

    const qMatch = text.match(/\b(Q[1-4]\s*202[4-9]|Horizon\s*202[5-9])\b/i);
    const targetQuarter = qMatch ? qMatch[1].toUpperCase() : 'Q4 2026';

    let initialTasks: string[] = [];
    const tasksMatch = text.match(/(?:with\s+tasks?|tasks?[:\s]+)([^.]+)/i);
    if (tasksMatch && tasksMatch[1]) {
      initialTasks = tasksMatch[1]
        .split(/[,;\n]/)
        .map((t) => t.trim().replace(/^[-*•]\s*/, ''))
        .filter(Boolean);
    }

    let name = text;
    name = name.replace(/^(?:please\s+)?(?:can you\s+)?(?:create|launch|start|add|commission|new)\s+(?:a\s+|an\s+)?(?:project|initiative|portfolio)?(?:\s*named|\s*called|\s*:)?/i, '');
    name = name.replace(/^project\s*[:\-]\s*/i, '');
    name = name.replace(/\b(?:with\s+tasks?|tasks?[:\s]+).*$/gi, '');
    name = name.replace(/\b(?:with\s+color|with\s+theme|color\s+|theme\s+).*$/gi, '');
    name = name.replace(/\b(?:target\s+quarter|target\s+|in\s+q[1-4]|for\s+q[1-4]|q[1-4]\s*202\d).*$/gi, '');
    name = name.replace(/\b(?:emerald|sapphire|amber|amethyst|ruby|slate|green|blue|gold|purple|red|carbon)\b.*$/gi, '');
    name = name.replace(/^["'`\s]+|["'`\s]+$/g, '').trim();

    if (!name || name.length < 2) {
      name = `Strategic Initiative ${Date.now().toString().slice(-4)}`;
    }
    name = name.charAt(0).toUpperCase() + name.slice(1);

    const content = `Initiative **"${name}"** successfully launched with **${color.toUpperCase()}** brand identity and target delivery in **${targetQuarter}**. The 4-phase Kanban board (Planning & Intel, In Execution, Audit & Review, Settled & Verified) is ready for deployment.`;

    return {
      role: 'assistant',
      content,
      functionCalls: [
        {
          name: 'create_project',
          args: {
            name,
            color,
            targetQuarter,
            description: `Executive portfolio initiative targeting ${targetQuarter} strategic objectives.`,
            initialTasks: initialTasks.length > 0 ? initialTasks : undefined,
          },
        },
      ],
      isLocalEngine: true,
    };
  }

  // 3. Task Update / Completion Detection
  const isUpdateTask =
    /\b(complete|finish|mark|check off|done|set priority|change priority)\b/i.test(text) &&
    /\b(task|item|action)\b/i.test(text);

  if (isUpdateTask) {
    const isCompleted = /\b(complete|finish|mark.*done|done|completed)\b/i.test(lower);
    let newPriority: string | undefined = undefined;
    if (/\b(p0|priority 0)\b/i.test(lower)) newPriority = 'p0';
    else if (/\bhigh\b/i.test(lower)) newPriority = 'high';
    else if (/\bmedium\b/i.test(lower)) newPriority = 'medium';
    else if (/\blow\b/i.test(lower)) newPriority = 'low';

    let taskTitle = text.replace(/^(?:please\s+)?(?:complete|finish|mark|check off|set priority of|change priority of)\s+(?:task|item|action)?/i, '');
    taskTitle = taskTitle.replace(/\s+(?:as done|as completed|to p0|to high|to medium|to low)$/i, '');
    taskTitle = taskTitle.replace(/^["'`\s]+|["'`\s]+$/g, '').trim();

    return {
      role: 'assistant',
      content: `Updated task parameters for **"${taskTitle}"**${isCompleted ? ' (marked as COMPLETED)' : ''}${newPriority ? ` (priority set to ${newPriority.toUpperCase()})` : ''}.`,
      functionCalls: [
        {
          name: 'update_task',
          args: {
            taskTitle,
            completed: isCompleted ? true : undefined,
            priority: newPriority,
          },
        },
      ],
      isLocalEngine: true,
    };
  }

  // 4. Focus Timer Detection
  const isFocusTimer = /\b(timer|focus|stopwatch|sprint)\b/i.test(lower) && /\b(\d+|\d+\s*min|start|set)\b/i.test(lower);
  if (isFocusTimer) {
    const minMatch = text.match(/\b(\d{1,3})\s*(?:min|minutes|m)?\b/i);
    const minutes = minMatch ? parseInt(minMatch[1], 10) : 25;
    const startNow = /\b(start|begin|now|go)\b/i.test(lower);

    return {
      role: 'assistant',
      content: `Focus sprint calibrated to **${minutes} minutes**${startNow ? ' and initiated immediately' : ''}. Minimize distractions; your operational session is queued.`,
      functionCalls: [
        {
          name: 'set_focus_timer',
          args: {
            minutes,
            startNow,
          },
        },
      ],
      isLocalEngine: true,
    };
  }

  // 5. Executive Inquiry / Status Overview
  if (/\b(briefing|status|overview|summary|projects?|tasks?|p0|critical path|how are we|what is on|what do i have)\b/i.test(lower)) {
    const projList = activeProjects.map((p) => `• **${p.name}**`).join('\n') || 'None active yet';
    const p0List =
      p0Tasks.length > 0
        ? `\n\n🚨 **Critical Path Emergencies (P0)**:\n${p0Tasks.map((t) => `• ${t}`).join('\n')}`
        : '\n\n✨ **Critical Path Status**: Clear. No pending P0 emergency blockers.';

    return {
      role: 'assistant',
      content: `**Executive Briefing & Workspace Snapshot**\n\nActive Strategic Initiatives (${activeProjects.length}):\n${projList}\n\n📊 Total Action Items: **${totalTasks}**${p0List}\n\nI can schedule new initiatives, dispatch tasks to project brackets, or configure focus sprints. What directive would you like to execute?`,
      isLocalEngine: true,
    };
  }

  // 6. Theme Switching Directive
  if (/\b(?:theme|skin|appearance|visual design)\b/i.test(lower) || /\b(?:space\s*theme|tech\s*theme|cyber\s*theme|business\s*theme|corporate\s*theme|gold\s*theme)\b/i.test(lower)) {
    let themeKey: 'executive_gold' | 'space_tech' | 'business_pro' = 'space_tech';
    let themeTitle = 'Cosmic Tech (Deep Space & Cyan Telemetry)';

    if (/\b(?:business|corporate|enterprise|slate|modern business|regular)\b/i.test(lower)) {
      themeKey = 'business_pro';
      themeTitle = 'Modern Business (Corporate Slate & Royal Sapphire)';
    } else if (/\b(?:gold|luxury|obsidian|executive gold)\b/i.test(lower)) {
      themeKey = 'executive_gold';
      themeTitle = 'Executive Gold (Signature Luxury Obsidian)';
    } else {
      themeKey = 'space_tech';
      themeTitle = 'Cosmic Tech (Deep Space & Cyan Telemetry)';
    }

    return {
      role: 'assistant',
      content: `Visual workspace theme calibrated to **${themeTitle}**. All views, charts, and command decks have adopted this aesthetic.`,
      functionCalls: [
        {
          name: 'set_theme',
          args: { theme: themeKey },
        },
      ],
      isLocalEngine: true,
    };
  }

  // 7. Default Executive Assistant Response
  return {
    role: 'assistant',
    content: `Greetings. I am your OmniFlow Executive Chief of Staff. I am standing by to execute commands across your workspace. You can direct me to:\n\n• **"Create a task [title] under [project] priority P0"**\n• **"Launch initiative [name] with dark green emerald theme"**\n• **"Switch theme to space tech"** or **"Switch to modern business design"**\n• **"Calibrate focus timer to 25 minutes"**\n• **"Provide executive briefing on my active projects"**\n\nState your directive and I will commit it to the command center immediately.`,
    isLocalEngine: true,
  };
}

// API: Multi-turn Chat with Tool Calling and Search Grounding
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  try {
    const {
      messages,
      systemInstruction,
      model = 'gemini-3.8-flash',
      enableSearch = true,
      currentAppContext = {},
    } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    const ai = getGeminiClient();

    // If Gemini client is not initialized (no GEMINI_API_KEY set yet), run built-in Executive AI Engine
    if (!ai) {
      const fallbackResult = handleLocalExecutiveAI(messages, currentAppContext);
      return res.json(fallbackResult);
    }

    // Format tools: Functions + Optional Google Search
    const functionTools = [
      createTaskDeclaration,
      createProjectDeclaration,
      updateTaskDeclaration,
      setFocusTimerDeclaration,
      setThemeDeclaration,
    ];

    const tools: any[] = [{ functionDeclarations: functionTools }];
    if (enableSearch) {
      tools.unshift({ googleSearch: {} });
    }

    // Prepare contents array
    const contents = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    // Augment system instruction with real-time app snapshot
    const contextPrompt = `You are the OmniFlow Executive AI Agent and Senior Chief of Staff.
You assist senior executives, managing directors, and dealmakers with strategic operations, task automation, and market intelligence.
Current Workspace Context:
- Active Projects: ${JSON.stringify(currentAppContext.projects || [])}
- Active Tasks Count: ${currentAppContext.totalTasks || 0}
- Current Priority P0 Tasks: ${JSON.stringify(currentAppContext.p0Tasks || [])}

When the user asks to create, modify, or schedule tasks or initiatives, ALWAYS call the corresponding function (create_task, create_project, update_task, set_focus_timer).
When searching for market intelligence, regulations, or recent news, use Google Search grounding.
Maintain a crisp, authoritative, executive business casual tone.`;

    const fullSystemInstruction = systemInstruction
      ? `${contextPrompt}\n\nAdditional Directive: ${systemInstruction}`
      : contextPrompt;

    try {
      const targetModel = model === 'gemini-3.5-flash' ? 'gemini-3.8-flash' : (model || 'gemini-3.8-flash');
      const response = await ai.models.generateContent({
        model: targetModel,
        contents,
        config: {
          systemInstruction: fullSystemInstruction,
          tools,
          toolConfig: { includeServerSideToolInvocations: true },
        },
      });

      const replyText = response.text || '';
      let functionCalls = response.functionCalls || [];

      // If model returned no function calls, but user explicitly asked to create a task or project,
      // augment with the local parser so the user directive is guaranteed to execute
      if (functionCalls.length === 0) {
        const localCheck = handleLocalExecutiveAI(messages, currentAppContext);
        if (localCheck.functionCalls && localCheck.functionCalls.length > 0) {
          functionCalls = localCheck.functionCalls;
        }
      }

      // Extract search grounding sources if present
      const groundingChunks =
        response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const webSources = groundingChunks
        .filter((c: any) => c.web)
        .map((c: any) => ({
          title: c.web.title,
          uri: c.web.uri,
        }));

      return res.json({
        role: 'assistant',
        content: replyText || 'Directive acknowledged and registered.',
        functionCalls,
        webSources,
        isLocalEngine: false,
      });
    } catch (genError: any) {
      console.warn('Gemini generateContent call fell back to executive engine:', genError?.message);
      // Gracefully fall back to local executive AI engine on any API quota/auth issue
      const fallbackResult = handleLocalExecutiveAI(messages, currentAppContext);
      return res.json(fallbackResult);
    }
  } catch (error: any) {
    console.warn('Chat endpoint handled error:', error?.message);
    const fallbackResult = handleLocalExecutiveAI(req.body.messages || [], req.body.currentAppContext || {});
    return res.json(fallbackResult);
  }
});

// API: Audio Transcription using gemini-3.5-transcribe
app.post('/api/ai/transcribe', async (req: Request, res: Response) => {
  try {
    const ai = getGeminiClient();
    if (!ai) {
      return res.json({ transcription: '' });
    }

    const { audioBase64, mimeType = 'audio/webm' } = req.body;
    if (!audioBase64) {
      return res.json({ transcription: '' });
    }

    const audioPart = {
      inlineData: {
        mimeType,
        data: audioBase64,
      },
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: {
        parts: [
          audioPart,
          {
            text: 'Transcribe this executive voice message accurately. Return only the transcription text.',
          },
        ],
      },
    });

    return res.json({ transcription: response.text || '' });
  } catch (error: any) {
    console.warn('Transcribe endpoint notice:', error?.message);
    return res.json({ transcription: '' });
  }
});

// API: Voice Speech Generation using gemini-3.8-flash-lite-tts
app.post('/api/ai/speak', async (req: Request, res: Response) => {
  try {
    const ai = getGeminiClient();
    if (!ai) {
      return res.json({ audioBase64: null });
    }

    const { text, voice = 'Kore' } = req.body;
    if (!text) {
      return res.json({ audioBase64: null });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text,
              speechMetadata: {
                style: 'Clear, confident, polished executive briefing',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
    });

    const base64Audio =
      response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    return res.json({ audioBase64: base64Audio || null });
  } catch (error: any) {
    console.warn('TTS endpoint notice:', error?.message);
    return res.json({ audioBase64: null });
  }
});

// Mount Vite in dev mode or serve static in production
const isProd = process.env.NODE_ENV === 'production';

async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`OmniFlow Server running on port ${PORT}`);
  });
}

startServer();
