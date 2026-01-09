
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
      <div className="flex items-center justify-between px-6 h-14 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-7 h-7 bg-workspace-text text-workspace-main rounded-md">
            <Hexagon className="w-4 h-4 stroke-[2.5]" />
          </div>
          <span className="font-semibold text-xs tracking-[0.1em] text-workspace-text uppercase">Workspace</span>
        </div>
        <button 
          onClick={toggleSidebar}
          className="p-1.5 text-workspace-muted hover:text-workspace-text hover:bg-workspace-surface rounded-md transition-colors"
          title="Fechar Menu"
        >
          <PanelLeftClose size={16} strokeWidth={1.5} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`
                flex items-center w-full px-3 py-2 rounded-md transition-all duration-200 group relative focus:outline-none
                ${isActive 
                  ? 'bg-workspace-accent text-white font-medium' 
                  : 'text-workspace-muted hover:bg-workspace-surface hover:text-workspace-text'
                }
              `}
            >
              <item.icon 
                className={`
                  w-4 h-4 stroke-[1.5] shrink-0
                  ${isActive ? 'text-white' : 'text-workspace-muted group-hover:text-workspace-text'}
                `} 
              />
              <span className="ml-3 text-[11px] uppercase tracking-wider whitespace-nowrap">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="p-3 border-t border-workspace-border flex flex-col gap-1">
        <button
          onClick={toggleTheme}
          className="flex items-center w-full px-3 py-2 rounded-md text-workspace-muted hover:bg-workspace-surface hover:text-workspace-text transition-colors focus:outline-none"
        >
          {isDarkMode ? (
            <Sun className="w-4 h-4 stroke-[1.5]" />
          ) : (
            <Moon className="w-4 h-4 stroke-[1.5]" />
          )}
          <span className="ml-3 text-[11px] uppercase tracking-wider font-medium">
            {isDarkMode ? 'Modo Claro' : 'Modo Escuro'}
          </span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
