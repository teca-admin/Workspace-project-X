
import React from 'react';
import { 
  Home,
  CheckSquare, 
  Library, 
  Wrench, 
  Hexagon,
  Moon,
  Sun,
  StickyNote,
  PanelLeftClose,
  Zap
} from 'lucide-react';
import { View, NavItem } from '../types';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  currentView: View;
  setCurrentView: (view: View) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const navItems: NavItem[] = [
  { id: View.HOME, label: 'Dashboard', icon: Home },
  { id: View.WORKING_NOW, label: 'Ciclo Ativo', icon: Zap },
  { id: View.TOOLS, label: 'Utilidades', icon: Wrench },
  { id: View.NOTES, label: 'Memorial', icon: StickyNote },
  { id: View.ARTIFACTS, label: 'Biblioteca', icon: Library },
  { id: View.DEMANDS, label: 'Operações', icon: CheckSquare },
];

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  toggleSidebar, 
  currentView, 
  setCurrentView,
  isDarkMode,
  toggleTheme 
}) => {
  if (!isOpen) return null;

  return (
    <aside 
      className="flex flex-col h-full bg-workspace-surface/80 backdrop-blur-xl border-r border-workspace-border w-56 z-20 transition-all duration-500 ease-in-out"
    >
      <div className="flex items-center justify-between px-6 h-14 shrink-0 border-b border-workspace-border">
        <div className="flex items-center gap-3">
          <Hexagon className="w-4 h-4 text-workspace-accent stroke-[2.5]" />
          <span className="font-black text-[9px] tracking-[0.4em] text-workspace-text uppercase">System_OS</span>
        </div>
        <button 
          onClick={toggleSidebar}
          className="p-1.5 text-workspace-muted hover:text-workspace-text transition-all"
        >
          <PanelLeftClose size={14} strokeWidth={2} />
        </button>
      </div>

      <nav className="flex-1 px-0 py-8 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`
                flex items-center w-full px-6 py-3.5 transition-all duration-300 group relative focus:outline-none border-l-[3px]
                ${isActive 
                  ? 'bg-workspace-accent/5 border-workspace-accent text-workspace-text shadow-[inset_10px_0_20px_-10px_rgba(16,185,129,0.1)]' 
                  : 'text-workspace-muted hover:text-workspace-text border-transparent hover:bg-workspace-main/30'
                }
              `}
            >
              <item.icon 
                className={`
                  w-3.5 h-3.5 stroke-[2] shrink-0 transition-transform duration-300
                  ${isActive ? 'text-workspace-accent scale-110' : 'text-workspace-muted group-hover:text-workspace-text'}
                `} 
              />
              <span className="ml-4 text-[8px] font-bold uppercase tracking-[0.25em] whitespace-nowrap">
                {item.label}
              </span>
              {isActive && (
                <div className="ml-auto w-1 h-1 rounded-full bg-workspace-accent shadow-[0_0_8px_var(--accent)]" />
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-workspace-border flex flex-col gap-2 bg-workspace-main/5">
        <button
          onClick={toggleTheme}
          className="flex items-center w-full px-5 py-3 text-workspace-muted hover:text-workspace-text transition-all border-l-[3px] border-transparent hover:border-workspace-muted/20 focus:outline-none rounded-sm"
        >
          {isDarkMode ? (
            <Sun className="w-3.5 h-3.5 stroke-[2]" />
          ) : (
            <Moon className="w-3.5 h-3.5 stroke-[2]" />
          )}
          <span className="ml-4 text-[8px] font-bold uppercase tracking-[0.2em]">
            Mode_{isDarkMode ? 'Light' : 'Dark'}
          </span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
