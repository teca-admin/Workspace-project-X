
import React, { useState } from 'react';
import { 
  Zap, 
  Clock, 
  CheckCircle2, 
  Timer, 
  AlertCircle,
  Plus,
  Play,
  Square,
  MoreVertical,
  Check,
  Hash,
  Activity
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

  const getStatusStyle = (status: ActiveTask['status']) => {
    switch (status) {
      case 'EM ANDAMENTO': return 'border-sky-500/30 text-sky-400';
      case 'CONCLUÍDO': return 'border-workspace-accent/30 text-workspace-accent';
      case 'PENDENTE': return 'border-workspace-border text-workspace-muted';
      default: return 'border-workspace-border text-workspace-muted';
    }
  };

  const getPriorityColor = (priority: ActiveTask['priority']) => {
    switch (priority) {
      case 'ALTA': return 'text-red-500/80';
      case 'MÉDIA': return 'text-amber-500/80';
      case 'BAIXA': return 'text-emerald-500/80';
      default: return 'text-workspace-muted';
    }
  };

  return (
    <div className="p-10 max-w-7xl mx-auto h-full flex flex-col animate-fade-in space-y-12">
      {/* Header Profissional */}
      <div className="flex items-end justify-between border-b border-workspace-border pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-2 h-2 rounded-full bg-workspace-accent animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <h1 className="text-sm font-black text-workspace-text uppercase tracking-[0.3em]">Monitor de Fluxo Ativo</h1>
          </div>
          <p className="text-[9px] text-workspace-muted font-bold uppercase tracking-[0.1em] opacity-40">Gerenciamento de ciclos operacionais e foco</p>
        </div>
        <button className="glow-button px-6 py-2 border border-workspace-border rounded-sm text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:border-workspace-accent transition-all group">
          <Plus size={12} className="group-hover:text-workspace-accent" /> NOVO FOCO
        </button>
      </div>

      {/* Cards de Métricas - Mais sóbrios */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glow-item p-6 bg-workspace-surface border-l-4 border-l-sky-500/50">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[8px] font-black text-workspace-muted uppercase tracking-[0.2em]">Execução</span>
            <Activity className="text-sky-500/40" size={14} />
          </div>
          <p className="text-2xl font-black text-workspace-text tabular-nums tracking-tighter">0{tasks.filter(t => t.status === 'EM ANDAMENTO').length}</p>
        </div>
        
        <div className="glow-item p-6 bg-workspace-surface border-l-4 border-l-workspace-accent/50">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[8px] font-black text-workspace-muted uppercase tracking-[0.2em]">Entrega</span>
            <CheckCircle2 className="text-workspace-accent/40" size={14} />
          </div>
          <p className="text-2xl font-black text-workspace-text tabular-nums tracking-tighter">0{tasks.filter(t => t.status === 'CONCLUÍDO').length}</p>
        </div>

        <div className="glow-item p-6 bg-workspace-surface border-l-4 border-l-amber-500/50">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[8px] font-black text-workspace-muted uppercase tracking-[0.2em]">Aguardando</span>
            <Clock className="text-amber-500/40" size={14} />
          </div>
          <p className="text-2xl font-black text-workspace-text tabular-nums tracking-tighter">0{tasks.filter(t => t.status === 'PENDENTE').length}</p>
        </div>
      </div>

      {/* Lista de Atividades - Refinada */}
      <div className="flex-1 overflow-hidden flex flex-col space-y-4">
        <div className="flex items-center justify-between px-4 pb-2 text-workspace-muted border-b border-workspace-border/40">
          <span className="text-[8px] font-black uppercase tracking-[0.2em]">Registro de Atividade</span>
          <span className="text-[8px] font-black uppercase tracking-[0.2em]">Métricas de Tempo</span>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
          {tasks.map(task => (
            <div 
              key={task.id} 
              className={`
                glow-item group bg-workspace-surface/50 p-4 flex items-center justify-between transition-all border-l-4
                ${task.status === 'EM ANDAMENTO' ? 'border-l-sky-500' : 'border-l-transparent'}
                hover:border-l-workspace-accent
              `}
            >
              <div className="flex items-center gap-6">
                <button 
                  className={`
                    w-9 h-9 flex items-center justify-center rounded-sm border transition-all
                    ${task.status === 'EM ANDAMENTO' 
                      ? 'bg-sky-500/10 text-sky-500 border-sky-500/30' 
                      : 'text-workspace-muted border-workspace-border hover:text-white hover:border-workspace-muted'
                    }
                  `}
                >
                  {task.status === 'EM ANDAMENTO' ? <Square size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />}
                </button>
                
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-black text-workspace-text uppercase tracking-tight">{task.title}</span>
                    <span className={`text-[7px] font-black uppercase px-2 py-0.5 rounded-sm border tracking-widest ${getStatusStyle(task.status)}`}>
                      {task.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-5 text-[8px] text-workspace-muted font-bold uppercase tracking-[0.15em]">
                    <span className="flex items-center gap-2 opacity-50"><Hash size={10} /> {task.category}</span>
                    <span className="flex items-center gap-2">Prioridade: <b className={getPriorityColor(task.priority)}>{task.priority}</b></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-10">
                <div className="flex flex-col items-end">
                   <span className="text-[14px] font-mono font-bold text-workspace-text tracking-tight">{task.timeSpent}</span>
                   <span className="text-[7px] text-workspace-muted uppercase font-black tracking-widest opacity-30">Ciclo Ativo</span>
                </div>
                
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button className="p-2 text-workspace-muted hover:text-workspace-accent transition-colors" title="Finalizar"><Check size={14} /></button>
                  <button className="p-2 text-workspace-muted hover:text-white transition-colors" title="Opções"><MoreVertical size={14} /></button>
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
