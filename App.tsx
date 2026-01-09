
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Home from './components/Home';
import Tools from './components/Tools';
import Notes from './components/Notes';
import Artifacts from './components/Artifacts';
import Demands from './components/Demands';
import WorkingNow from './components/WorkingNow';
import { View } from './types';
import { PanelLeft, ChevronRight, Monitor } from 'lucide-react';

const App: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentView, setCurrentView] = useState<View>(View.HOME);
  const [isDarkMode, setIsDarkMode] = useState(true);

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
      case View.HOME: return <Home setCurrentView={setCurrentView} />;
      case View.TOOLS: return <Tools />;
      case View.NOTES: return <Notes />;
      case View.ARTIFACTS: return <Artifacts />;
      case View.DEMANDS: return <Demands />;
      case View.WORKING_NOW: return <WorkingNow />;
      default: return <Home setCurrentView={setCurrentView} />;
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-workspace-main text-workspace-text selection:bg-workspace-accent selection:text-black font-inter">
      <Sidebar 
        isOpen={sidebarOpen} 
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
        currentView={currentView}
        setCurrentView={setCurrentView}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
      />
      
      <main className="flex-1 h-full overflow-hidden relative flex flex-col">
        {/* Top Header Strip - Ultra Thin & Clean */}
        <header className="h-14 border-b border-workspace-border flex items-center justify-between px-8 bg-workspace-main/60 backdrop-blur-md z-10 shrink-0">
          <div className="flex items-center gap-6">
            {!sidebarOpen && (
              <button 
                onClick={() => setSidebarOpen(true)}
                className="p-2 text-workspace-muted hover:text-workspace-text hover:bg-workspace-surface rounded-sm transition-all"
              >
                <PanelLeft size={16} strokeWidth={1.5} />
              </button>
            )}
            <div className="flex items-center gap-3 text-workspace-muted text-[8px] tracking-[0.3em] font-black uppercase">
               <span className="opacity-40">System_Root</span>
               <ChevronRight size={10} className="opacity-20" />
               <span className="text-workspace-accent border-b border-workspace-accent/30 pb-0.5">{currentView}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-2 px-4 py-1.5 bg-workspace-surface/50 border border-workspace-border rounded-sm">
                <Monitor size={12} className="text-workspace-muted opacity-40" />
                <span className="text-[8px] text-workspace-muted font-bold tracking-[0.2em] uppercase">Core: Stable</span>
                <div className="w-1 h-1 rounded-full bg-workspace-accent ml-2 shadow-[0_0_8px_var(--accent)]" />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
