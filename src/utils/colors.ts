import { ProjectColor } from '../types';

export interface ProjectColorTheme {
  id: ProjectColor;
  label: string;
  bgCard: string;
  borderCard: string;
  badgeBg: string;
  badgeText: string;
  accentDot: string;
  hex: string;
  glow: string;
}

export const PROJECT_COLORS: Record<ProjectColor, ProjectColorTheme> = {
  emerald: {
    id: 'emerald',
    label: 'Dark Emerald',
    bgCard: 'bg-[#0b2116]',
    borderCard: 'border-[#1b4332] hover:border-[#2d6a4f]',
    badgeBg: 'bg-[#0f2d1e]',
    badgeText: 'text-[#52b788]',
    accentDot: 'bg-[#2d6a4f]',
    hex: '#2d6a4f',
    glow: 'shadow-[#1b4332]/20',
  },
  sapphire: {
    id: 'sapphire',
    label: 'Deep Sapphire',
    bgCard: 'bg-[#0d1b2a]',
    borderCard: 'border-[#1b263b] hover:border-[#415a77]',
    badgeBg: 'bg-[#152538]',
    badgeText: 'text-[#778da9]',
    accentDot: 'bg-[#415a77]',
    hex: '#415a77',
    glow: 'shadow-[#1b263b]/20',
  },
  amber: {
    id: 'amber',
    label: 'Champagne Amber',
    bgCard: 'bg-[#221c10]',
    borderCard: 'border-[#443719] hover:border-[#d4af37]/60',
    badgeBg: 'bg-[#2d2411]',
    badgeText: 'text-[#e5c158]',
    accentDot: 'bg-[#d4af37]',
    hex: '#d4af37',
    glow: 'shadow-[#d4af37]/15',
  },
  amethyst: {
    id: 'amethyst',
    label: 'Imperial Amethyst',
    bgCard: 'bg-[#1b1226]',
    borderCard: 'border-[#332047] hover:border-[#5a367d]',
    badgeBg: 'bg-[#251736]',
    badgeText: 'text-[#c084fc]',
    accentDot: 'bg-[#9333ea]',
    hex: '#9333ea',
    glow: 'shadow-[#332047]/20',
  },
  ruby: {
    id: 'ruby',
    label: 'Burgundy Wine',
    bgCard: 'bg-[#241017]',
    borderCard: 'border-[#451c27] hover:border-[#832c3f]',
    badgeBg: 'bg-[#2f141e]',
    badgeText: 'text-[#fb7185]',
    accentDot: 'bg-[#be123c]',
    hex: '#be123c',
    glow: 'shadow-[#451c27]/20',
  },
  slate: {
    id: 'slate',
    label: 'Carbon Slate',
    bgCard: 'bg-[#16171D]',
    borderCard: 'border-white/10 hover:border-white/20',
    badgeBg: 'bg-[#1A1B20]',
    badgeText: 'text-[#B8BAC2]',
    accentDot: 'bg-[#797C86]',
    hex: '#797C86',
    glow: 'shadow-black/20',
  },
};

export function getProjectTheme(color?: ProjectColor | null): ProjectColorTheme {
  if (!color || !PROJECT_COLORS[color]) {
    return PROJECT_COLORS.slate;
  }
  return PROJECT_COLORS[color];
}
