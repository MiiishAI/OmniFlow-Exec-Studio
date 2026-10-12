import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Plus, Sparkles, Palette, Check } from 'lucide-react';
import { UserProfile, AppTheme } from '../types';
import { APP_THEMES, getThemeConfig } from '../utils/theme';

interface HeaderProps {
  user: UserProfile;
  audioEnabled: boolean;
  theme: AppTheme;
  onToggleAudio: () => void;
  onSelectTheme: (theme: AppTheme) => void;
  onOpenQuickCreate: () => void;
  onOpenAIAssistant: () => void;
  activeTab: 'overview' | 'tasks' | 'projects' | 'settings';
  onSelectTab: (tab: 'overview' | 'tasks' | 'projects' | 'settings') => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  audioEnabled,
  theme,
  onToggleAudio,
  onSelectTheme,
  onOpenQuickCreate,
  onOpenAIAssistant,
  activeTab,
  onSelectTab,
}) => {
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  const themeConfig = getThemeConfig(theme);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
        setIsThemeMenuOpen(false);
      }
    };
    if (isThemeMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isThemeMenuOpen]);

  const getInitials = (name: string) => {
    if (!name) return 'OF';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const initials = getInitials(user.name);

  return (
    <header
      className="sticky top-0 z-40 backdrop-blur-md border-b px-4 sm:px-8 py-3 transition-colors"
      style={{
        backgroundColor: `${themeConfig.bgApp}F2`,
        borderColor: themeConfig.borderSubtle,
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onSelectTab('overview')}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            <div
              className="w-8 h-8 rounded-lg border flex items-center justify-center font-bold text-sm tracking-wider shadow-sm transition-colors"
              style={{
                backgroundColor: themeConfig.bgElevated,
                borderColor: themeConfig.borderAccent,
                color: themeConfig.accentColor,
              }}
            >
              {themeConfig.symbol}
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-white block leading-tight">
                OmniFlow
              </span>
              <span className="text-[11px] text-[#797C86] font-medium block leading-tight">
                {user.title || 'Executive Command Center'}
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links (visible on md/lg desktop viewports) */}
        <nav
          className="hidden md:flex items-center gap-1 p-1 rounded-xl border"
          style={{
            backgroundColor: themeConfig.bgElevated,
            borderColor: themeConfig.borderSubtle,
          }}
        >
          <button
            onClick={() => onSelectTab('overview')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'overview'
                ? 'shadow-sm text-white'
                : 'text-[#B8BAC2] hover:text-white'
            }`}
            style={
              activeTab === 'overview'
                ? {
                    backgroundColor: themeConfig.bgSurface,
                    color: themeConfig.accentColor,
                  }
                : {}
            }
          >
            Overview
          </button>
          <button
            onClick={() => onSelectTab('tasks')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'tasks'
                ? 'shadow-sm text-white'
                : 'text-[#B8BAC2] hover:text-white'
            }`}
            style={
              activeTab === 'tasks'
                ? {
                    backgroundColor: themeConfig.bgSurface,
                    color: themeConfig.accentColor,
                  }
                : {}
            }
          >
            Tasks Hub
          </button>
          <button
            onClick={() => onSelectTab('projects')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'projects'
                ? 'shadow-sm text-white'
                : 'text-[#B8BAC2] hover:text-white'
            }`}
            style={
              activeTab === 'projects'
                ? {
                    backgroundColor: themeConfig.bgSurface,
                    color: themeConfig.accentColor,
                  }
                : {}
            }
          >
            Projects
          </button>
          <button
            onClick={() => onSelectTab('settings')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'settings'
                ? 'shadow-sm text-white'
                : 'text-[#B8BAC2] hover:text-white'
            }`}
            style={
              activeTab === 'settings'
                ? {
                    backgroundColor: themeConfig.bgSurface,
                    color: themeConfig.accentColor,
                  }
                : {}
            }
          >
            Settings
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Quick Theme Switcher Trigger */}
          <div className="relative" ref={themeMenuRef}>
            <button
              onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
              title={`Switch UI Theme (Current: ${themeConfig.name})`}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition active:scale-95"
              style={{
                backgroundColor: themeConfig.bgElevated,
                borderColor: isThemeMenuOpen ? themeConfig.borderAccent : themeConfig.borderSubtle,
                color: themeConfig.accentColor,
              }}
            >
              <Palette className="w-3.5 h-3.5" />
              <span className="hidden xl:inline text-[11px] font-semibold">{themeConfig.name}</span>
            </button>

            {/* Theme Dropdown Menu */}
            {isThemeMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-64 rounded-2xl border shadow-2xl p-2.5 z-50 space-y-1.5 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100"
                style={{
                  backgroundColor: themeConfig.bgElevated,
                  borderColor: themeConfig.borderAccent,
                }}
              >
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#797C86] border-b border-white/5">
                  Choose App Theme
                </div>
                {(Object.keys(APP_THEMES) as AppTheme[]).map((themeKey) => {
                  const t = APP_THEMES[themeKey];
                  const isSelected = theme === themeKey;
                  return (
                    <button
                      key={themeKey}
                      type="button"
                      onClick={() => {
                        onSelectTheme(themeKey);
                        setIsThemeMenuOpen(false);
                      }}
                      className="w-full text-left p-2 rounded-xl flex items-center justify-between gap-2.5 transition group hover:brightness-110"
                      style={{
                        backgroundColor: isSelected ? `${t.accentColor}1A` : 'transparent',
                        border: isSelected ? `1px solid ${t.borderAccent}` : '1px solid transparent',
                      }}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs shrink-0"
                          style={{
                            backgroundColor: t.bgSurface,
                            color: t.accentColor,
                            border: `1px solid ${t.borderAccent}`,
                          }}
                        >
                          {t.symbol}
                        </div>
                        <div className="truncate">
                          <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span>{t.name}</span>
                            <span className="text-[9px] px-1 py-0.2 rounded font-normal bg-white/5 text-[#B8BAC2]">
                              {t.category}
                            </span>
                          </div>
                          <div className="text-[10px] text-[#797C86] truncate">
                            {t.tagline}
                          </div>
                        </div>
                      </div>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 shrink-0" style={{ color: t.accentColor }} />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* AI Executive Agent Trigger Button */}
          <button
            onClick={onOpenAIAssistant}
            title="Talk or write to OmniFlow Executive AI Agent"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-bold text-xs shadow-sm hover:brightness-110 transition active:scale-95 whitespace-nowrap"
            style={{
              backgroundColor: themeConfig.bgElevated,
              borderColor: themeConfig.borderAccent,
              color: themeConfig.accentColor,
            }}
          >
            <Sparkles className="w-3.5 h-3.5" style={{ color: themeConfig.accentColor }} />
            <span className="hidden sm:inline">AI Agent</span>
          </button>

          {/* Quick Create Action Button (Desktop) */}
          <button
            onClick={onOpenQuickCreate}
            className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r ${themeConfig.primaryButtonGradient} ${themeConfig.primaryButtonText} font-bold text-xs shadow-md hover:brightness-105 active:scale-95 transition whitespace-nowrap`}
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>New Action</span>
          </button>

          {/* Audio Chime Toggle */}
          <button
            onClick={onToggleAudio}
            title={audioEnabled ? 'Audio acoustic feedback enabled' : 'Audio muted'}
            className="w-8 h-8 rounded-lg flex items-center justify-center border transition-all"
            style={{
              backgroundColor: themeConfig.bgElevated,
              borderColor: audioEnabled ? themeConfig.borderAccent : themeConfig.borderSubtle,
              color: audioEnabled ? themeConfig.accentColor : '#797C86',
            }}
          >
            {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* User Profile Avatar */}
          <button
            onClick={() => onSelectTab('settings')}
            title="Profile & Executive Settings"
            className="w-8 h-8 rounded-lg border flex items-center justify-center font-bold text-xs hover:brightness-110 transition-all active:scale-95 shadow-sm"
            style={{
              backgroundColor: themeConfig.bgElevated,
              borderColor: themeConfig.borderAccent,
              color: themeConfig.accentColor,
            }}
          >
            {initials}
          </button>
        </div>
      </div>
    </header>
  );
};
