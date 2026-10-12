import React from 'react';
import { LayoutDashboard, CheckSquare, FolderGit2, Settings, Plus } from 'lucide-react';
import { AppTheme } from '../types';
import { getThemeConfig } from '../utils/theme';

interface NavigationProps {
  activeTab: 'overview' | 'tasks' | 'projects' | 'settings';
  theme?: AppTheme;
  onSelectTab: (tab: 'overview' | 'tasks' | 'projects' | 'settings') => void;
  onOpenQuickCreate: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  theme = 'executive_gold',
  onSelectTab,
  onOpenQuickCreate,
}) => {
  const themeConfig = getThemeConfig(theme);

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 backdrop-blur-xl border-t px-4 py-1.5 pb-safe flex justify-around items-center"
      style={{
        backgroundColor: `${themeConfig.bgApp}F5`,
        borderColor: themeConfig.borderSubtle,
      }}
    >
      <button
        onClick={() => onSelectTab('overview')}
        className={`min-h-[44px] min-w-[56px] flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors ${
          activeTab === 'overview'
            ? 'font-bold'
            : 'text-[#797C86] hover:text-[#B8BAC2]'
        }`}
        style={activeTab === 'overview' ? { color: themeConfig.accentColor } : {}}
      >
        <LayoutDashboard className="w-5 h-5" />
        <span>Overview</span>
      </button>

      <button
        onClick={() => onSelectTab('tasks')}
        className={`min-h-[44px] min-w-[56px] flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors ${
          activeTab === 'tasks'
            ? 'font-bold'
            : 'text-[#797C86] hover:text-[#B8BAC2]'
        }`}
        style={activeTab === 'tasks' ? { color: themeConfig.accentColor } : {}}
      >
        <CheckSquare className="w-5 h-5" />
        <span>Tasks</span>
      </button>

      {/* Floating Center Plus Action Button */}
      <button
        onClick={onOpenQuickCreate}
        title="Add New Action Item or Project"
        className={`w-11 h-11 rounded-full bg-gradient-to-r ${themeConfig.primaryButtonGradient} ${themeConfig.primaryButtonText} flex items-center justify-center -mt-5 shadow-lg active:scale-90 transition-transform`}
        style={{
          boxShadow: `0 8px 20px ${themeConfig.accentColor}33`,
        }}
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </button>

      <button
        onClick={() => onSelectTab('projects')}
        className={`min-h-[44px] min-w-[56px] flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors ${
          activeTab === 'projects'
            ? 'font-bold'
            : 'text-[#797C86] hover:text-[#B8BAC2]'
        }`}
        style={activeTab === 'projects' ? { color: themeConfig.accentColor } : {}}
      >
        <FolderGit2 className="w-5 h-5" />
        <span>Projects</span>
      </button>

      <button
        onClick={() => onSelectTab('settings')}
        className={`min-h-[44px] min-w-[56px] flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors ${
          activeTab === 'settings'
            ? 'font-bold'
            : 'text-[#797C86] hover:text-[#B8BAC2]'
        }`}
        style={activeTab === 'settings' ? { color: themeConfig.accentColor } : {}}
      >
        <Settings className="w-5 h-5" />
        <span>Settings</span>
      </button>
    </nav>
  );
};
