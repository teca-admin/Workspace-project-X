
import React from 'react';
import { ArrowRight, Briefcase, Zap, Wrench } from 'lucide-react';
import { View } from '../types';

interface HomeProps {
  setCurrentView: (view: View) => void;
}

const Home: React.FC<HomeProps> = ({ setCurrentView }) => {
  const currentTime = new Date();
  const hours = currentTime.getHours();
  let greeting = 'Bom dia';
  if (hours >= 12 && hours < 18) greeting = 'Boa tarde';
  else if (hours >= 18) greeting = 'Boa noite';

  return (
    <div className="p-12 max-w-5xl mx-auto h-full flex flex-col justify-center animate-fade-in">
      
      <div className="mb-16">
        <h1 className="text-3xl font-black text-white mb-2 uppercase tracking-[0.2em]">{greeting}, Operador.</h1>
        <p className="text-workspace-muted font-bold text-[10px] uppercase tracking-[0.1em] opacity-50">Terminal de comando centralizado</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Card 1 */}
        <button 
          onClick={() => setCurrentView(View.TOOLS)}
          className="glow-item group flex flex-col items-start p-8 bg-workspace-surface rounded-md shadow-lg text-left"
        >
          <div className="p-3 bg-black border border-workspace-border rounded-sm mb-6 group-hover:border-workspace-accent transition-colors">
            <Wrench className="w-5 h-5 text-workspace-accent stroke-[1.5]" />
          </div>
          <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-3">Ferramentas</h3>
          <p className="text-[10px] text-workspace-muted font-medium leading-relaxed mb-6 opacity-60">
            Acesse rapidamente suas ferramentas integradas e utilitários.
          </p>
          <div className="mt-auto flex items-center text-[9px] font-black text-workspace-accent uppercase tracking-widest group-hover:gap-3 transition-all">
            Acessar <ArrowRight className="w-3 h-3 ml-2" />
          </div>
        </button>

        {/* Card 2 */}
        <button 
          onClick={() => setCurrentView(View.PROJECTS)}
          className="glow-item group flex flex-col items-start p-8 bg-workspace-surface rounded-md shadow-lg text-left"
        >
          <div className="p-3 bg-black border border-workspace-border rounded-sm mb-6 group-hover:border-workspace-accent transition-colors">
            <Briefcase className="w-5 h-5 text-workspace-accent stroke-[1.5]" />
          </div>
          <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-3">Projetos Ativos</h3>
          <p className="text-[10px] text-workspace-muted font-medium leading-relaxed mb-6 opacity-60">
            Gerencie seus projetos em andamento e verifique o status.
          </p>
          <div className="mt-auto flex items-center text-[9px] font-black text-workspace-accent uppercase tracking-widest group-hover:gap-3 transition-all">
            Ver Projetos <ArrowRight className="w-3 h-3 ml-2" />
          </div>
        </button>

        {/* Card 3 */}
        <button 
          onClick={() => setCurrentView(View.DASHBOARD)}
          className="glow-item group flex flex-col items-start p-8 bg-workspace-surface rounded-md shadow-lg text-left"
        >
          <div className="p-3 bg-black border border-workspace-border rounded-sm mb-6 group-hover:border-workspace-accent transition-colors">
            <Zap className="w-5 h-5 text-workspace-accent stroke-[1.5]" />
          </div>
          <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-3">Painel</h3>
          <p className="text-[10px] text-workspace-muted font-medium leading-relaxed mb-6 opacity-60">
            Visualize métricas e indicadores de desempenho operacional.
          </p>
          <div className="mt-auto flex items-center text-[9px] font-black text-workspace-accent uppercase tracking-widest group-hover:gap-3 transition-all">
            Visualizar <ArrowRight className="w-3 h-3 ml-2" />
          </div>
        </button>
      </div>

      <div className="mt-16 border-t border-workspace-border pt-8 flex items-center justify-between text-[8px] text-workspace-muted font-black uppercase tracking-[0.3em]">
         <span>V 1.2.0</span>
         <span>SISTEMA OPERACIONAL: ONLINE</span>
      </div>
    </div>
  );
};

export default Home;
