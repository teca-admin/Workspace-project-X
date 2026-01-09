
import React from 'react';
import { 
  Home,
  LayoutDashboard, 
  Briefcase, 
  CheckSquare, 
  Library, 
  Wrench, 
  Hexagon,
  Moon,
  Sun,
  StickyNote,
  PanelLeftClose,
  PanelLeft
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
  { id: View.TOOLS, label: 'Ferramentas', icon: Wrench },
  { id: View.NOTES, label: 'Notas', icon: StickyNote },
  { id: View.ARTIFACTS, label: 'Artefatos', icon: Library },
  { id: View.PROJECTS, label: 'Projetos', icon: Briefcase },
  { id: View.DEMANDS, label: 'Demandas', icon: CheckSquare },
  { id: View.DASHBOARD, label: 'Painel', icon: LayoutDashboard },
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
      className="flex flex-col h-full bg-workspace-main border-r border-workspace-border w-64 z-20 transition-all duration-300 animate-fade-in-quick"
    >
      {/* Header / Logo Area */}
      <div className="flex items-center justify-between px-6 h-14 shrink-0 border-b border-workspace-border">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-6 h-6 bg-workspace-accent text-black rounded-sm">
            <Hexagon className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
          <span className="font-black text-[10px] tracking-[0.2em] text-white uppercase">Terminal</span>
        </div>
        <button 
          onClick={toggleSidebar}
          className="p-1.5 text-workspace-muted hover:text-white transition-colors"
        >
          <PanelLeftClose size={14} strokeWidth={2} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`
                flex items-center w-full px-4 py-2.5 rounded-sm transition-all duration-150 group relative focus:outline-none glow-button
                ${isActive 
                  ? 'bg-workspace-accent/10 border-l-2 border-workspace-accent text-workspace-accent' 
                  : 'text-workspace-muted hover:text-white border-l-2 border-transparent'
                }
              `}
            >
              <item.icon 
                className={`
                  w-3.5 h-3.5 stroke-[2] shrink-0
                  ${isActive ? 'text-workspace-accent' : 'text-workspace-muted group-hover:text-white'}
                `} 
              />
              <span className="ml-3 text-[9px] font-black uppercase tracking-[0.15em] whitespace-nowrap">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="p-3 border-t border-workspace-border flex flex-col gap-1 bg-black/40">
        <button
          onClick={toggleTheme}
          className="flex items-center w-full px-4 py-2 rounded-sm text-workspace-muted hover:text-white transition-colors focus:outline-none glow-button"
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
