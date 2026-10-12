import React, { useState } from 'react';
import { Save, Volume2, Timer, RotateCcw, Download, Upload, ShieldCheck, Check, Palette, Sparkles } from 'lucide-react';
import { UserProfile, AppSettings, AppState, AISettings, AppTheme } from '../types';
import { AISettingsSection } from './AISettingsSection';
import { APP_THEMES, getThemeConfig } from '../utils/theme';

interface SettingsViewProps {
  user: UserProfile;
  settings: AppSettings;
  aiSettings: AISettings;
  fullState: AppState;
  onUpdateUser: (user: UserProfile) => void;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
  onUpdateAISettings: (updated: Partial<AISettings>) => void;
  onTestAgent: () => void;
  onResetAISettings: () => void;
  onTestAudio: () => void;
  onResetAllData: () => void;
  onRestoreState: (state: AppState) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  settings,
  aiSettings,
  fullState,
  onUpdateUser,
  onUpdateSettings,
  onUpdateAISettings,
  onTestAgent,
  onResetAISettings,
  onTestAudio,
  onResetAllData,
  onRestoreState,
}) => {
  const [name, setName] = useState(user.name);
  const [title, setTitle] = useState(user.title);
  const [org, setOrg] = useState(user.organization);
  const [customMins, setCustomMins] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      name: name.trim(),
      title: title.trim(),
      organization: org.trim(),
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleSetCustomMinutes = () => {
    const val = parseInt(customMins, 10);
    if (!isNaN(val) && val >= 1 && val <= 180) {
      onUpdateSettings({ focusMinutes: val });
      setCustomMins('');
    }
  };

  const handleExportData = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fullState, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `omniflow-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.tasks && parsed.projects) {
          onRestoreState(parsed);
          alert('✓ OmniFlow data restored successfully.');
        } else {
          alert('Invalid backup file format.');
        }
      } catch {
        alert('Could not parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* View Header */}
      <div className="border-b border-white/5 pb-4">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
          Settings & Executive Preferences
        </h1>
        <p className="text-xs text-[#797C86] mt-0.5">
          Configure executive identity, focus sprint duration, acoustic audio, and system data.
        </p>
      </div>

      {/* Identity Configuration */}
      <form onSubmit={handleSaveProfile} className="p-5 rounded-2xl bg-[#1A1B20] border border-[#d4af37]/20 shadow-lg shadow-black/40 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-[#d4af37] uppercase tracking-wider">
            Executive Identity
          </h2>
          {saveSuccess && (
            <span className="text-xs text-[#c3d3be] flex items-center gap-1 font-medium">
              <Check className="w-3.5 h-3.5" /> Saved
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#B8BAC2] mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Michael Fradkin"
              className="w-full bg-[#16171D] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-[#F5F5F7] focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#B8BAC2] mb-1.5">
              Executive Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Executive Director"
              className="w-full bg-[#16171D] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-[#F5F5F7] focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#B8BAC2] mb-1.5">
            Organization / Fund / Group
          </label>
          <input
            type="text"
            value={org}
            onChange={(e) => setOrg(e.target.value)}
            placeholder="e.g. OmniFlow Strategic Capital"
            className="w-full bg-[#16171D] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-[#F5F5F7] focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
          />
        </div>

        <button
          type="submit"
          className="px-4 py-2.5 rounded-xl bg-gradient-to-b from-[#E5C158] to-[#D4AF37] text-[#121316] font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-[#d4af37]/20 active:scale-95 transition"
        >
          <Save className="w-4 h-4" />
          <span>Save Identity Profile</span>
        </button>
      </form>

      {/* UI Design & Theme Configuration */}
      <div className="p-5 rounded-2xl bg-[#1A1B20] border border-white/10 shadow-lg shadow-black/40 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-[#d4af37]" />
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              Workspace UI Design &amp; Theme
            </h2>
          </div>
          <span className="text-[11px] font-mono font-bold text-[#E5C158] uppercase">
            {getThemeConfig(settings.theme).name} Active
          </span>
        </div>

        <p className="text-xs text-[#797C86]">
          Choose freely between signature Executive Gold, Cosmic Tech (space &amp; deep-tech telemetry), or Modern Business (corporate enterprise). Changes apply instantly across the whole workspace.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          {(Object.keys(APP_THEMES) as AppTheme[]).map((themeKey) => {
            const t = APP_THEMES[themeKey];
            const isSelected = (settings.theme || 'executive_gold') === themeKey;

            return (
              <button
                key={themeKey}
                type="button"
                onClick={() => onUpdateSettings({ theme: themeKey })}
                className={`p-4 rounded-xl border text-left transition relative flex flex-col justify-between gap-3 group ${
                  isSelected
                    ? 'border-white/40 ring-1 ring-white/20 shadow-lg'
                    : 'border-white/10 hover:border-white/20'
                }`}
                style={{
                  backgroundColor: t.bgElevated,
                  borderColor: isSelected ? t.borderAccent : undefined,
                }}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs"
                      style={{
                        backgroundColor: t.bgSurface,
                        color: t.accentColor,
                        border: `1px solid ${t.borderAccent}`,
                      }}
                    >
                      {t.symbol}
                    </span>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `${t.accentColor}20`,
                        color: t.accentColor,
                      }}
                    >
                      {t.category}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    {t.name}
                  </h3>
                  <div className="text-[11px] font-medium text-[#B8BAC2] mb-1.5">
                    {t.tagline}
                  </div>
                  <p className="text-[11px] text-[#797C86] leading-relaxed line-clamp-3">
                    {t.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                  {/* Swatch indicators */}
                  <div className="flex items-center gap-1.5">
                    {t.previewSwatches.map((color, idx) => (
                      <span
                        key={idx}
                        className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>

                  {isSelected ? (
                    <span
                      className="text-[11px] font-bold flex items-center gap-1"
                      style={{ color: t.accentColor }}
                    >
                      <Check className="w-3.5 h-3.5" /> Active
                    </span>
                  ) : (
                    <span className="text-[10px] text-[#797C86] group-hover:text-white transition">
                      Click to activate
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* AI Settings Section */}
      <AISettingsSection
        settings={aiSettings}
        onUpdateAISettings={onUpdateAISettings}
        onTestAgent={onTestAgent}
        onResetAISettings={onResetAISettings}
      />

      {/* Focus Sprint Preferences */}
      <div className="p-5 rounded-2xl bg-[#1A1B20] border border-white/10 shadow-lg shadow-black/40 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Timer className="w-4 h-4 text-[#d4af37]" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Focus Sprint Duration
            </h3>
          </div>
          <span className="text-xs font-mono font-bold text-[#E5C158]">
            {settings.focusMinutes} Minutes Active
          </span>
        </div>

        <p className="text-xs text-[#797C86]">
          Calibrate the operational focus block duration before completion chimes are sounded.
        </p>

        {/* Presets */}
        <div className="grid grid-cols-4 gap-2">
          {[15, 25, 45, 60].map((mins) => (
            <button
              key={mins}
              type="button"
              onClick={() => onUpdateSettings({ focusMinutes: mins })}
              className={`py-2 px-1 text-center rounded-xl text-xs font-semibold transition active:scale-95 ${
                settings.focusMinutes === mins
                  ? 'bg-gradient-to-b from-[#E5C158] to-[#D4AF37] text-[#121316] font-bold shadow-md shadow-[#d4af37]/20'
                  : 'bg-[#16171D] text-[#B8BAC2] hover:text-white border border-white/5 hover:border-white/20'
              }`}
            >
              {mins}m
            </button>
          ))}
        </div>

        {/* Custom Minutes Input */}
        <div className="flex items-center gap-2 pt-2 border-t border-white/5">
          <label className="text-xs text-[#797C86] flex-1">Custom Minutes (1–180):</label>
          <input
            type="number"
            min="1"
            max="180"
            value={customMins}
            onChange={(e) => setCustomMins(e.target.value)}
            placeholder="e.g. 50"
            className="w-24 bg-[#16171D] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white text-center focus:outline-none focus:border-[#d4af37]"
          />
          <button
            type="button"
            onClick={handleSetCustomMinutes}
            className="px-3 py-1.5 rounded-xl bg-[#22242B] hover:bg-[#2A2C35] text-xs font-semibold text-[#fdf3c7] border border-[#d4af37]/30 transition"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Audio Engine Configuration */}
      <div className="p-5 rounded-2xl bg-[#1A1B20] border border-white/10 shadow-lg shadow-black/40 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-[#d4af37]" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Acoustic Audio Feedback
            </h3>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.audioEnabled}
              onChange={(e) => onUpdateSettings({ audioEnabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-[#16171D] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#d4af37]"></div>
          </label>
        </div>

        <p className="text-xs text-[#797C86]">
          Harmonic warm brass triad (D5, A5, D6) chimes and tactile high-frequency ticks synthesized via Web Audio API.
        </p>

        <button
          type="button"
          onClick={onTestAudio}
          className="px-3.5 py-2 rounded-xl bg-[#16171D] hover:bg-[#22242B] border border-[#d4af37]/20 text-xs font-semibold text-[#fdf3c7] hover:border-[#d4af37] transition active:scale-95 flex items-center gap-2"
        >
          <Volume2 className="w-3.5 h-3.5" />
          <span>Test Brass Acoustic Chime</span>
        </button>
      </div>

      {/* Backup, Export & Restore */}
      <div className="p-5 rounded-2xl bg-[#1A1B20] border border-white/10 shadow-lg shadow-black/40 space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">
          Data Management & Backup
        </h3>
        <p className="text-xs text-[#797C86]">
          Export your initiatives, checklist items, and focus history for archival or import to another device.
        </p>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleExportData}
            className="px-4 py-2 rounded-xl bg-[#16171D] hover:bg-[#22242B] border border-white/10 text-xs font-semibold text-white transition active:scale-95 flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON Archive</span>
          </button>

          <label className="px-4 py-2 rounded-xl bg-[#16171D] hover:bg-[#22242B] border border-white/10 text-xs font-semibold text-white transition active:scale-95 flex items-center gap-1.5 cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>Import JSON Archive</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportData}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* System Reset */}
      <div className="p-5 rounded-2xl bg-[#1A1B20] border border-[#8B2635]/30 shadow-lg shadow-black/40 space-y-3">
        <h3 className="text-xs font-bold text-[#ffb4ab] uppercase tracking-wider">
          System Clean State
        </h3>
        <p className="text-xs text-[#797C86]">
          Reset all initiatives, tasks, and timer records back to initial default executive baseline.
        </p>

        <button
          type="button"
          onClick={() => {
            if (window.confirm('Reset OmniFlow to initial state? Current changes will be overwritten.')) {
              onResetAllData();
            }
          }}
          className="px-4 py-2 rounded-xl bg-[#8B2635]/20 hover:bg-[#8B2635]/30 border border-[#8B2635]/40 text-xs font-semibold text-[#ffb4ab] transition active:scale-95 flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset System to Clean Defaults</span>
        </button>
      </div>
    </div>
  );
};
