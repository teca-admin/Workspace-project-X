
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
  { id: View.HOME, label: 'Início', icon: Home },
  { id: View.WORKING_NOW, label: 'Foco Agora', icon: Zap },
  { id: View.TOOLS, label: 'Ferramentas', icon: Wrench },
  { id: View.NOTES, label: 'Notas', icon: StickyNote },
  { id: View.ARTIFACTS, label: 'Artefatos', icon: Library },
  { id: View.DEMANDS, label: 'Demandas', icon: CheckSquare },
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
      className="flex flex-col h-full bg-workspace-surface border-r border-workspace-border w-64 z-20 transition-all duration-300 animate-fade-in-quick"
    >
      <div className="flex items-center justify-between px-6 h-14 shrink-0 border-b border-workspace-border">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-6 h-6 bg-workspace-accent text-white rounded-sm">
            <Hexagon className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
          <span className="font-black text-[10px] tracking-[0.2em] text-workspace-text uppercase">Terminal</span>
        </div>
        <button 
          onClick={toggleSidebar}
          className="p-1.5 text-workspace-muted hover:text-workspace-text transition-colors"
        >
          <PanelLeftClose size={14} strokeWidth={2} />
        </button>
      </div>

      <nav className="flex-1 px-0 py-6 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`
                flex items-center w-full px-6 py-3 transition-all duration-150 group relative focus:outline-none border-l-4
                ${isActive 
                  ? 'bg-workspace-accent/5 border-workspace-accent text-workspace-accent' 
                  : 'text-workspace-muted hover:text-workspace-text border-transparent hover:bg-workspace-main/50'
                }
              `}
            >
              <item.icon 
                className={`
                  w-3.5 h-3.5 stroke-[2] shrink-0
                  ${isActive ? 'text-workspace-accent' : 'text-workspace-muted group-hover:text-workspace-text'}
                `} 
              />
              <span className="ml-3 text-[9px] font-black uppercase tracking-[0.15em] whitespace-nowrap">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-workspace-border flex flex-col gap-1 bg-workspace-main/10">
        <button
          onClick={toggleTheme}
          className="flex items-center w-full px-5 py-2.5 text-workspace-muted hover:text-workspace-text transition-all border-l-4 border-transparent hover:border-workspace-muted/30 focus:outline-none"
        >
          {isDarkMode ? (
            <Sun className="w-3.5 h-3.5 stroke-[2]" />
          ) : (
            <Moon className="w-3.5 h-3.5 stroke-[2]" />
          )}
          <span className="ml-3 text-[9px] font-black uppercase tracking-widest">
            {isDarkMode ? 'Luz' : 'Sombra'}
          </span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
