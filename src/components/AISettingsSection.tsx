import React from 'react';
import {
  Sparkles,
  Bot,
  Search,
  Volume2,
  Sliders,
  Cpu,
  Check,
  RotateCcw,
} from 'lucide-react';
import { AISettings } from '../types';

interface AISettingsSectionProps {
  settings: AISettings;
  onUpdateAISettings: (updated: Partial<AISettings>) => void;
  onTestAgent: () => void;
  onResetAISettings: () => void;
}

export const AISettingsSection: React.FC<AISettingsSectionProps> = ({
  settings,
  onUpdateAISettings,
  onTestAgent,
  onResetAISettings,
}) => {
  return (
    <div className="p-5 rounded-2xl bg-[#1A1B20] border border-[#d4af37]/25 shadow-lg shadow-black/40 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#d4af37]" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Executive AI Agent Settings
          </h3>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={(e) => onUpdateAISettings({ enabled: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-[#16171D] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#d4af37]"></div>
        </label>
      </div>

      <p className="text-xs text-[#797C86]">
        Configure model intelligence, tool-calling execution, voice transcription, and Google Search grounding.
      </p>

      {/* Model Selection */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-[#B8BAC2]">
          Gemini Intelligence Model
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => onUpdateAISettings({ model: 'gemini-3.8-flash' })}
            className={`p-3 rounded-xl border text-left transition ${
              settings.model === 'gemini-3.8-flash'
                ? 'bg-[#22242B] border-[#d4af37] ring-1 ring-[#d4af37]/30 text-white'
                : 'bg-[#16171D] border-white/5 hover:border-white/20 text-[#797C86]'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-xs text-white">Gemini 3.8 Flash</span>
              {settings.model === 'gemini-3.8-flash' && (
                <Check className="w-3.5 h-3.5 text-[#d4af37]" />
              )}
            </div>
            <span className="text-[10px] text-[#797C86] block leading-tight">
              Recommended · Fast tool execution &amp; search grounding
            </span>
          </button>

          <button
            type="button"
            onClick={() => onUpdateAISettings({ model: 'gemini-3.1-pro-preview' })}
            className={`p-3 rounded-xl border text-left transition ${
              settings.model === 'gemini-3.1-pro-preview'
                ? 'bg-[#22242B] border-[#d4af37] ring-1 ring-[#d4af37]/30 text-white'
                : 'bg-[#16171D] border-white/5 hover:border-white/20 text-[#797C86]'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-xs text-white">Gemini 3.1 Pro</span>
              {settings.model === 'gemini-3.1-pro-preview' && (
                <Check className="w-3.5 h-3.5 text-[#d4af37]" />
              )}
            </div>
            <span className="text-[10px] text-[#797C86] block leading-tight">
              Deep reasoning · Complex multi-tier portfolio planning
            </span>
          </button>

          <button
            type="button"
            onClick={() => onUpdateAISettings({ model: 'gemini-3.1-flash-lite' })}
            className={`p-3 rounded-xl border text-left transition ${
              settings.model === 'gemini-3.1-flash-lite'
                ? 'bg-[#22242B] border-[#d4af37] ring-1 ring-[#d4af37]/30 text-white'
                : 'bg-[#16171D] border-white/5 hover:border-white/20 text-[#797C86]'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-xs text-white">Gemini 3.1 Lite</span>
              {settings.model === 'gemini-3.1-flash-lite' && (
                <Check className="w-3.5 h-3.5 text-[#d4af37]" />
              )}
            </div>
            <span className="text-[10px] text-[#797C86] block leading-tight">
              Ultra-low latency · Rapid action item creation
            </span>
          </button>
        </div>
      </div>

      {/* Feature Toggles */}
      <div className="space-y-3 pt-2 border-t border-white/5 text-xs">
        {/* Search Grounding */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-[#16171D] border border-white/5">
          <div className="flex items-start gap-2.5">
            <Search className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block">Google Search Grounding</span>
              <span className="text-[11px] text-[#797C86]">
                Enables Gemini to pull verified real-time market data, regulatory updates, and live intelligence.
              </span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={settings.enableSearchGrounding}
            onChange={(e) => onUpdateAISettings({ enableSearchGrounding: e.target.checked })}
            className="accent-[#d4af37] w-4 h-4 rounded ml-3 shrink-0"
          />
        </div>

        {/* Voice Auto-Speak */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-[#16171D] border border-white/5">
          <div className="flex items-start gap-2.5">
            <Volume2 className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block">Voice Audio Briefings</span>
              <span className="text-[11px] text-[#797C86]">
                Synthesizes clear executive speech responses via Gemini TTS when directives are completed.
              </span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={settings.voiceAutoSpeak}
            onChange={(e) => onUpdateAISettings({ voiceAutoSpeak: e.target.checked })}
            className="accent-[#d4af37] w-4 h-4 rounded ml-3 shrink-0"
          />
        </div>
      </div>

      {/* Persona Selection */}
      <div className="space-y-2 pt-2 border-t border-white/5">
        <label className="block text-xs font-medium text-[#B8BAC2]">
          Executive Agent Persona
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {[
            {
              id: 'chief_of_staff' as const,
              title: 'Chief of Staff',
              desc: 'Authoritative, structured operational cadence',
            },
            {
              id: 'venture_partner' as const,
              title: 'Venture Partner',
              desc: 'Capital allocation, syndicate yield, & risk focus',
            },
            {
              id: 'operations_director' as const,
              title: 'Operations Director',
              desc: 'Milestone tracking, blockers, & execution velocity',
            },
          ].map((persona) => (
            <button
              key={persona.id}
              type="button"
              onClick={() => onUpdateAISettings({ persona: persona.id })}
              className={`p-2.5 rounded-xl border text-left transition ${
                settings.persona === persona.id
                  ? 'bg-[#22242B] border-[#d4af37] text-white'
                  : 'bg-[#16171D] border-white/5 text-[#797C86]'
              }`}
            >
              <span className="font-bold text-xs text-white block">{persona.title}</span>
              <span className="text-[10px] text-[#797C86] block mt-0.5">{persona.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Custom System Directives */}
      <div className="space-y-1.5 pt-2 border-t border-white/5">
        <label className="block text-xs font-medium text-[#B8BAC2]">
          Custom Executive Instructions (Optional)
        </label>
        <textarea
          rows={2}
          value={settings.customInstructions}
          onChange={(e) => onUpdateAISettings({ customInstructions: e.target.value })}
          placeholder="e.g. Always prioritize P0 tasks with zero slippage, cite European regulation sources when available..."
          className="w-full bg-[#16171D] border border-white/10 rounded-xl px-3 py-2 text-xs text-[#F5F5F7] placeholder-[#797C86] focus:outline-none focus:border-[#d4af37] resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/10">
        <button
          type="button"
          onClick={onResetAISettings}
          className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#B8BAC2] hover:text-white text-xs font-semibold transition active:scale-95 flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset AI Settings</span>
        </button>

        <button
          type="button"
          onClick={onTestAgent}
          className="px-4 py-2 rounded-xl bg-gradient-to-b from-[#E5C158] to-[#D4AF37] text-[#121316] font-bold text-xs shadow-md shadow-[#d4af37]/20 active:scale-95 transition flex items-center gap-1.5"
        >
          <Bot className="w-3.5 h-3.5" />
          <span>Launch AI Agent</span>
        </button>
      </div>
    </div>
  );
};
