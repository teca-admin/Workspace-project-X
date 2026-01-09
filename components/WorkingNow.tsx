
import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Clock, 
  CheckCircle2, 
  Activity,
  Plus,
  Play,
  Square,
  MoreVertical,
  Check,
  Hash,
  Database,
  Cpu,
  BarChart3
} from 'lucide-react';

interface ActiveTask {
  id: string;
  title: string;
  category: string;
  status: 'EM ANDAMENTO' | 'PENDENTE' | 'CONCLUÍDO';
  priority: 'ALTA' | 'MÉDIA' | 'BAIXA';
  timeSpent: string;
}

const INITIAL_TASKS: ActiveTask[] = [
  { id: '1', title: 'CHECKLIST PREENCHIMENTO SLA', category: 'OPERACIONAL', status: 'EM ANDAMENTO', priority: 'ALTA', timeSpent: '02:45' },
  { id: '2', title: 'MELHORIAS NO WORKSPACE', category: 'PROJETOS', status: 'PENDENTE', priority: 'MÉDIA', timeSpent: '00:00' },
  { id: '3', title: 'INDICADORES: FILTROS E DATA', category: 'DASHBOARD', status: 'CONCLUÍDO', priority: 'ALTA', timeSpent: '04:12' },
];

const WorkingNow: React.FC = () => {
  const [tasks, setTasks] = useState<ActiveTask[]>(INITIAL_TASKS);

  const getStatusColor = (status: ActiveTask['status']) => {
    switch (status) {
      case 'EM ANDAMENTO': return 'text-sky-400';
      case 'CONCLUÍDO': return 'text-workspace-accent';
      case 'PENDENTE': return 'text-workspace-muted';
      default: return 'text-workspace-muted';
    }
  };

  return (
    <div className="p-12 max-w-[1400px] mx-auto h-full flex flex-col view-transition">
      
      {/* Top Telemetry Bar */}
      <div className="flex items-center justify-between mb-12 border-b border-workspace-border pb-8">
        <div className="flex items-center gap-10">
          <div>
            <h1 className="text-2xl font-black text-workspace-text uppercase tracking-[0.4em] mb-2">Monitoramento de Ciclo</h1>
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-workspace-accent animate-ping" />
              <span className="text-[8px] font-mono font-bold text-workspace-accent uppercase tracking-widest">Live Telemetry: Active</span>
            </div>
          </div>
          
          <div className="h-10 w-[1px] bg-workspace-border hidden md:block" />
          
          <div className="hidden md:flex gap-8">
            <div className="flex flex-col">
              <span className="text-[7px] font-black text-workspace-muted uppercase tracking-widest mb-1">Carga de Sistema</span>
              <span className="text-xs font-mono font-bold text-workspace-text">8.42%</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[7px] font-black text-workspace-muted uppercase tracking-widest mb-1">Taxa de Conclusão</span>
              <span className="text-xs font-mono font-bold text-workspace-text">92.4%</span>
            </div>
          </div>
        </div>

        <button className="glow-button px-6 py-2.5 bg-workspace-surface border border-workspace-border rounded-sm text-[8px] font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:border-workspace-accent transition-all">
          <Plus size={12} /> Registrar Atividade
        </button>
      </div>

      {/* Metric Grid - High Precision */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
        {[
          { label: 'Fluxos Ativos', val: '01', icon: Cpu, color: 'sky' },
          { label: 'Finalizados/Hoje', val: '12', icon: CheckCircle2, color: 'emerald' },
          { label: 'Fila de Espera', val: '04', icon: Database, color: 'amber' },
          { label: 'Eficiência Médica', val: '9.8', icon: BarChart3, color: 'workspace' }
        ].map((item, i) => (
          <div key={i} className="glow-item p-6 flex flex-col justify-between h-32 relative overflow-hidden">
             <div className="flex justify-between items-start z-10">
                <span className="text-[7px] font-black text-workspace-muted uppercase tracking-[0.2em]">{item.label}</span>
                <item.icon size={14} className="opacity-20" />
             </div>
             <p className="text-4xl font-mono font-black text-workspace-text z-10">{item.val}</p>
             {/* Decoração técnica de fundo */}
             <div className="absolute -bottom-2 -right-2 opacity-5">
               <item.icon size={80} strokeWidth={1} />
             </div>
          </div>
        ))}
      </div>

      {/* Main Activity Feed */}
      <div className="flex-1 flex flex-col min-h-0 bg-workspace-surface border border-workspace-border rounded-sm shadow-2xl relative">
        {/* Background Grid Layer */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
             style={{ backgroundImage: 'linear-gradient(var(--border-color) 1px, transparent 1px), linear-gradient(90deg, var(--border-color) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

        <div className="flex items-center justify-between px-8 h-12 border-b border-workspace-border shrink-0 bg-black/20 z-10">
          <span className="text-[8px] font-black text-workspace-muted uppercase tracking-[0.3em]">Registro Histórico / Tempo Real</span>
          <div className="flex items-center gap-6">
            <span className="text-[8px] font-black text-workspace-muted uppercase tracking-[0.3em]">Status Operacional</span>
            <span className="text-[8px] font-black text-workspace-muted uppercase tracking-[0.3em]">Métrica Crono</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 z-10">
          {tasks.map(task => (
            <div 
              key={task.id} 
              className={`
                group flex items-center justify-between p-6 mb-2 transition-all border-l-4
                ${task.status === 'EM ANDAMENTO' ? 'border-l-sky-500 bg-sky-500/5' : 'border-l-transparent hover:bg-workspace-main/50'}
              `}
            >
              <div className="flex items-center gap-8">
                <button 
                  className={`
                    w-11 h-11 flex items-center justify-center rounded-sm border transition-all
                    ${task.status === 'EM ANDAMENTO' 
                      ? 'bg-sky-500 text-black border-sky-500 shadow-[0_0_15px_rgba(56,189,248,0.3)]' 
                      : 'text-workspace-muted border-workspace-border hover:border-workspace-muted'
                    }
                  `}
                >
                  {task.status === 'EM ANDAMENTO' ? <Square size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                </button>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-black text-workspace-text uppercase tracking-wider">{task.title}</span>
                    <span className={`text-[7px] font-mono font-bold uppercase tracking-[0.2em] opacity-60 ${getStatusColor(task.status)}`}>
                      // {task.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-6 text-[8px] text-workspace-muted font-bold uppercase tracking-[0.1em]">
                    <span className="flex items-center gap-2 border border-workspace-border px-2 py-0.5 rounded-sm">
                      <Hash size={10} className="text-workspace-accent" /> {task.category}
                    </span>
                    <span>Prioridade_Nível: <b className="text-workspace-text">{task.priority}</b></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-12">
                <div className="flex flex-col items-end">
                   <span className="text-lg font-mono font-bold text-workspace-text tracking-tighter">{task.timeSpent}</span>
                   <span className="text-[7px] text-workspace-muted uppercase font-black tracking-widest opacity-30">Elapsed_Time</span>
                </div>
                
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                  <button className="p-2 border border-workspace-border text-workspace-muted hover:text-workspace-accent hover:border-workspace-accent transition-all rounded-sm"><Check size={14} /></button>
                  <button className="p-2 border border-workspace-border text-workspace-muted hover:text-white hover:border-white transition-all rounded-sm"><MoreVertical size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkingNow;
