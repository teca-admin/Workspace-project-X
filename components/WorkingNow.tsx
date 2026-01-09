
import React, { useState } from 'react';
// Added Hash icon to the imports
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
  Hash
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
      case 'EM ANDAMENTO': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'CONCLUÍDO': return 'text-workspace-accent bg-workspace-accent/10 border-workspace-accent/20';
      case 'PENDENTE': return 'text-workspace-muted bg-workspace-muted/10 border-workspace-muted/20';
      default: return '';
    }
  };

  const getPriorityColor = (priority: ActiveTask['priority']) => {
    switch (priority) {
      case 'ALTA': return 'text-red-500';
      case 'MÉDIA': return 'text-amber-500';
      case 'BAIXA': return 'text-emerald-500';
      default: return '';
    }
  };

  return (
    <div className="p-10 max-w-7xl mx-auto h-full flex flex-col animate-fade-in space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-workspace-text uppercase tracking-[0.2em] flex items-center gap-3">
            <Zap className="text-workspace-accent fill-workspace-accent" size={20} />
            Trabalhando Agora
          </h1>
          <p className="text-[9px] text-workspace-muted font-bold uppercase tracking-[0.1em] mt-1 opacity-40">Foco operacional e progresso em tempo real</p>
        </div>
        <button className="glow-button-solid px-4 py-2 rounded-sm text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
          <Plus size={14} /> ADICIONAR FOCO
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glow-item p-6 bg-workspace-surface rounded-sm border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[9px] font-black text-workspace-muted uppercase tracking-widest">Ativas</span>
            <Timer className="text-blue-500" size={16} />
          </div>
          <p className="text-2xl font-black text-workspace-text">0{tasks.filter(t => t.status === 'EM ANDAMENTO').length}</p>
        </div>
        <div className="glow-item p-6 bg-workspace-surface rounded-sm border-l-4 border-l-workspace-accent">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[9px] font-black text-workspace-muted uppercase tracking-widest">Finalizadas (Hoje)</span>
            <CheckCircle2 className="text-workspace-accent" size={16} />
          </div>
          <p className="text-2xl font-black text-workspace-text">0{tasks.filter(t => t.status === 'CONCLUÍDO').length}</p>
        </div>
        <div className="glow-item p-6 bg-workspace-surface rounded-sm border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[9px] font-black text-workspace-muted uppercase tracking-widest">Pendências</span>
            <AlertCircle className="text-amber-500" size={16} />
          </div>
          <p className="text-2xl font-black text-workspace-text">0{tasks.filter(t => t.status === 'PENDENTE').length}</p>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col space-y-4">
        <div className="flex items-center justify-between px-4 pb-2 border-b border-workspace-border">
          <span className="text-[9px] font-black text-workspace-muted uppercase tracking-[0.2em]">Fluxo de Atividades</span>
          <span className="text-[9px] font-black text-workspace-muted uppercase tracking-[0.2em]">Tempo / Status</span>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
          {tasks.map(task => (
            <div key={task.id} className="glow-item group bg-workspace-surface p-5 flex items-center justify-between hover:bg-workspace-accent/5 transition-all">
              <div className="flex items-center gap-5">
                <button className={`p-2 rounded-sm border border-workspace-border transition-all ${task.status === 'EM ANDAMENTO' ? 'bg-blue-500/20 text-blue-500 border-blue-500' : 'text-workspace-muted hover:text-white'}`}>
                  {task.status === 'EM ANDAMENTO' ? <Square size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                </button>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-[11px] font-black text-workspace-text uppercase tracking-tight">{task.title}</span>
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-sm border ${getStatusColor(task.status)}`}>{task.status}</span>
                  </div>
                  <div className="flex items-center gap-4 text-[9px] text-workspace-muted font-bold uppercase tracking-widest">
                    <span className="flex items-center gap-1.5"><Hash size={10} /> {task.category}</span>
                    <span className="flex items-center gap-1.5">PRIORIDADE: <b className={getPriorityColor(task.priority)}>{task.priority}</b></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="flex flex-col items-end">
                   <span className="text-[12px] font-mono font-bold text-workspace-text">{task.timeSpent}</span>
                   <span className="text-[8px] text-workspace-muted uppercase font-black">Cronômetro</span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 text-workspace-muted hover:text-workspace-accent"><Check size={14} /></button>
                  <button className="p-2 text-workspace-muted hover:text-white"><MoreVertical size={14} /></button>
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
