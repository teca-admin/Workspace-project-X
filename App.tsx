
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Home from './components/Home';
import Tools from './components/Tools';
import Notes from './components/Notes';
import Artifacts from './components/Artifacts';
import Demands from './components/Demands';
import WorkingNow from './components/WorkingNow';
import { View } from './types';
import { PanelLeft } from 'lucide-react';

const App: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentView, setCurrentView] = useState<View>(View.HOME);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Theme Toggle Effect
  useEffect(() => {
    const html = document.documentElement;
    if (isDarkMode) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);
  
  const renderContent = () => {
    switch (currentView) {
      case View.HOME:
        return <Home setCurrentView={setCurrentView} />;
      case View.TOOLS:
        return <Tools />;
      case View.NOTES:
        return <Notes />;
      case View.ARTIFACTS:
        return <Artifacts />;
      case View.DEMANDS:
        return <Demands />;
      case View.WORKING_NOW:
        return <WorkingNow />;
      default:
        return <Home setCurrentView={setCurrentView} />;
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-workspace-main text-workspace-text selection:bg-workspace-accent selection:text-white font-inter">
      <Sidebar 
        isOpen={sidebarOpen} 
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
        currentView={currentView}
        setCurrentView={setCurrentView}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
      />
      
      <main className="flex-1 h-full overflow-hidden relative flex flex-col bg-workspace-main">
        {/* Top Header Strip - Minimalist Standard */}
        <header className="h-14 border-b border-workspace-border flex items-center justify-between px-6 bg-workspace-main z-10 shrink-0">
          <div className="flex items-center gap-4">
            {!sidebarOpen && (
              <button 
                onClick={() => setSidebarOpen(true)}
                className="p-1.5 text-workspace-muted hover:text-workspace-text hover:bg-workspace-surface rounded-md transition-colors"
                title="Abrir Menu"
              >
                <PanelLeft size={18} strokeWidth={1.5} />
              </button>
            )}
            <div className="flex items-center gap-2 text-workspace-muted text-[10px] tracking-[0.2em] font-bold uppercase">
               <span className="opacity-50">Workspace</span>
               <span className="text-workspace-accent">/</span>
               <span className="text-workspace-text">{currentView}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-workspace-surface border border-workspace-border rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] text-workspace-muted font-bold tracking-[0.1em] uppercase">Status: Online</span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
