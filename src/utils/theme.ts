import { AppTheme } from '../types';

export interface ThemeDefinition {
  id: AppTheme;
  name: string;
  tagline: string;
  description: string;
  category: 'Executive Luxury' | 'Space & Deep Tech' | 'Modern Enterprise';
  previewSwatches: string[];
  symbol: string;
  accentColor: string;
  accentSecondary: string;
  bgApp: string;
  bgSurface: string;
  bgElevated: string;
  bgInput: string;
  borderSubtle: string;
  borderAccent: string;
  textHeading: string;
  textMuted: string;
  primaryButtonGradient: string;
  primaryButtonText: string;
  chartStroke: string;
  chartStopStart: string;
  chartStopEnd: string;
  badgeBg: string;
  badgeText: string;
  borderClass: string;
}

export const APP_THEMES: Record<AppTheme, ThemeDefinition> = {
  executive_gold: {
    id: 'executive_gold',
    name: 'Executive Gold',
    tagline: 'Obsidian & Champagne Gold',
    description: 'High-conviction sovereign wealth & executive command center aesthetic with real gold and brass tones.',
    category: 'Executive Luxury',
    previewSwatches: ['#121316', '#1A1B20', '#D4AF37', '#E5C158'],
    symbol: 'Ω',
    accentColor: '#D4AF37',
    accentSecondary: '#E5C158',
    bgApp: '#121316',
    bgSurface: '#16171D',
    bgElevated: '#1A1B20',
    bgInput: '#16171D',
    borderSubtle: 'rgba(255, 255, 255, 0.08)',
    borderAccent: 'rgba(212, 175, 55, 0.35)',
    textHeading: '#FFFFFF',
    textMuted: '#797C86',
    primaryButtonGradient: 'from-[#E5C158] to-[#D4AF37]',
    primaryButtonText: 'text-[#121316]',
    chartStroke: '#E5C158',
    chartStopStart: '#E5C158',
    chartStopEnd: '#D4AF37',
    badgeBg: 'bg-[#d4af37]/15',
    badgeText: 'text-[#E5C158]',
    borderClass: 'border-[#d4af37]/25',
  },
  space_tech: {
    id: 'space_tech',
    name: 'Cosmic Tech',
    tagline: 'Deep Space & Cyan Telemetry',
    description: 'Orbital mission-control sci-fi interface with stellar nebula purples, electric cyan conduits, and deep cosmic void.',
    category: 'Space & Deep Tech',
    previewSwatches: ['#060814', '#0E132D', '#00F0FF', '#8B5CF6'],
    symbol: '✦',
    accentColor: '#00F0FF',
    accentSecondary: '#8B5CF6',
    bgApp: '#060814',
    bgSurface: '#0B0F24',
    bgElevated: '#111736',
    bgInput: '#0B0F24',
    borderSubtle: 'rgba(0, 240, 255, 0.12)',
    borderAccent: 'rgba(0, 240, 255, 0.45)',
    textHeading: '#F0F6FC',
    textMuted: '#818CF8',
    primaryButtonGradient: 'from-[#00F0FF] to-[#8B5CF6]',
    primaryButtonText: 'text-[#04060E]',
    chartStroke: '#00F0FF',
    chartStopStart: '#00F0FF',
    chartStopEnd: '#8B5CF6',
    badgeBg: 'bg-[#00F0FF]/15',
    badgeText: 'text-[#00F0FF]',
    borderClass: 'border-[#00F0FF]/25',
  },
  business_pro: {
    id: 'business_pro',
    name: 'Modern Business',
    tagline: 'Enterprise Slate & Royal Sapphire',
    description: 'Clean, high-performance corporate SaaS workspace with crisp slate lines, sapphire focus states, and boardroom legibility.',
    category: 'Modern Enterprise',
    previewSwatches: ['#0B0F19', '#1E293B', '#3B82F6', '#60A5FA'],
    symbol: '◈',
    accentColor: '#3B82F6',
    accentSecondary: '#60A5FA',
    bgApp: '#0B0F19',
    bgSurface: '#111827',
    bgElevated: '#1E293B',
    bgInput: '#0F172A',
    borderSubtle: 'rgba(148, 163, 184, 0.12)',
    borderAccent: 'rgba(59, 130, 246, 0.45)',
    textHeading: '#F8FAFC',
    textMuted: '#94A3B8',
    primaryButtonGradient: 'from-[#3B82F6] to-[#1D4ED8]',
    primaryButtonText: 'text-white',
    chartStroke: '#3B82F6',
    chartStopStart: '#60A5FA',
    chartStopEnd: '#2563EB',
    badgeBg: 'bg-[#3b82f6]/15',
    badgeText: 'text-[#60A5FA]',
    borderClass: 'border-[#3b82f6]/25',
  },
};

export function getThemeConfig(theme?: AppTheme): ThemeDefinition {
  if (theme && APP_THEMES[theme]) {
    return APP_THEMES[theme];
  }
  return APP_THEMES.executive_gold;
}
