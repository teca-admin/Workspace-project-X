
import React, { useState, useMemo } from 'react';
import { 
  Search, Plus, Calendar, AlertCircle, 
  Clock, Pencil, Trash2, X, Hash, 
  CheckSquare, Filter, MoreHorizontal,
  ChevronDown, ArrowUpDown,
  ClipboardCheck,
  Kanban,
  List as ListIcon,
  CalendarDays,
  ChevronRight,
  GripVertical
} from 'lucide-react';
import { Demand, DemandStatus, DemandPriority } from '../types';

type ViewMode = 'table' | 'kanban' | 'gantt';

const MOCK_DEMANDS: Demand[] = [
  {
    id: '1',
    title: 'Refatoração da API de Autenticação',
    description: 'Melhorar a segurança e performance dos endpoints de login.',
    status: 'Em Andamento',
    priority: 'Alta',
    category: 'Backend',
    deadline: '2024-05-25',
    createdAt: new Date('2024-05-10'),
    updatedAt: new Date()
  },
  {
    id: '2',
    title: 'Implementação do Design System',
    description: 'Criar componentes reutilizáveis para a interface principal.',
    status: 'Pendente',
    priority: 'Média',
    category: 'UI/UX',
    deadline: '2024-06-15',
    createdAt: new Date('2024-05-12'),
    updatedAt: new Date()
  },
  {
    id: '3',
    title: 'Correção de bug no Dashboard',
    description: 'Gráfico de performance não está renderizando corretamente em resoluções mobile.',
    status: 'Pendente',
    priority: 'Crítica',
    category: 'Bugfix',
    deadline: '2024-05-18',
    createdAt: new Date('2024-05-01'),
    updatedAt: new Date()
  },
  {
    id: '4',
    title: 'Relatório Mensal de Produtividade',
    description: 'Gerar PDF consolidado com as métricas de abril.',
    status: 'Concluído',
    priority: 'Baixa',
    category: 'Gestão',
    deadline: '2024-05-05',
    createdAt: new Date('2024-04-25'),
    updatedAt: new Date()
  }
];

const STATUS_COLORS: Record<DemandStatus, string> = {
  'Pendente': 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
  'Em Andamento': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Concluído': 'bg-workspace-accent/10 text-workspace-accent border-workspace-accent/20',
  'Cancelado': 'bg-red-500/10 text-red-400 border-red-500/20'
};

const PRIORITY_COLORS: Record<DemandPriority, string> = {
  'Baixa': 'text-emerald-600',
  'Média': 'text-blue-500',
  'Alta': 'text-amber-600',
  'Crítica': 'text-red-600'
};

const Demands: React.FC = () => {
  const [demands, setDemands] = useState<Demand[]>(MOCK_DEMANDS);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<DemandStatus | 'Todas'>('Todas');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDemand, setEditingDemand] = useState<Demand | null>(null);

  const [form, setForm] = useState<Partial<Demand>>({
    title: '',
    description: '',
    status: 'Pendente',
    priority: 'Média',
    category: 'Geral',
    deadline: ''
  });

  const filteredDemands = useMemo(() => {
    return demands.filter(d => {
      const matchesSearch = d.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           d.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = activeFilter === 'Todas' || d.status === activeFilter;
      return matchesSearch && matchesFilter;
    });
  }, [demands, searchQuery, activeFilter]);

  const handleOpenModal = (demand?: Demand) => {
    if (demand) {
      setEditingDemand(demand);
      setForm({ ...demand });
    } else {
      setEditingDemand(null);
      setForm({ title: '', description: '', status: 'Pendente', priority: 'Média', category: 'Geral', deadline: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!form.title) return;
    if (editingDemand) {
      setDemands(prev => prev.map(d => d.id === editingDemand.id ? { ...d, ...form } as Demand : d));
    } else {
      const newDemand: Demand = {
        ...form as any,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setDemands(prev => [newDemand, ...prev]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Deseja realmente excluir esta demanda?')) {
      setDemands(prev => prev.filter(d => d.id !== id));
    }
  };

  const renderTable = () => (
    <div className="min-w-full bg-workspace-surface border border-workspace-border rounded-md overflow-hidden shadow-2xl">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-workspace-border bg-black">
            <th className="px-6 py-4 text-[9px] font-bold text-workspace-muted uppercase tracking-[0.2em]">Demanda</th>
            <th className="px-6 py-4 text-[9px] font-bold text-workspace-muted uppercase tracking-[0.2em] text-center">Status</th>
            <th className="px-6 py-4 text-[9px] font-bold text-workspace-muted uppercase tracking-[0.2em] text-center">Prioridade</th>
            <th className="px-6 py-4 text-[9px] font-bold text-workspace-muted uppercase tracking-[0.2em]">Categoria</th>
            <th className="px-6 py-4 text-[9px] font-bold text-workspace-muted uppercase tracking-[0.2em]">Prazo</th>
            <th className="px-6 py-4 text-[9px] font-bold text-workspace-muted uppercase tracking-[0.2em] text-right">Gerenciar</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-workspace-border">
          {filteredDemands.map(demand => (
            <tr key={demand.id} className="group hover:bg-workspace-accent/5 transition-colors">
              <td className="px-6 py-4">
                <div className="flex flex-col">
                  <span className="text-[12px] font-bold text-white mb-0.5">{demand.title}</span>
                  <span className="text-[10px] text-workspace-muted truncate max-w-xs opacity-50">{demand.description}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-center">
                <span className={`inline-block px-2 py-0.5 rounded-sm text-[8px] font-black uppercase tracking-widest border ${STATUS_COLORS[demand.status]}`}>
                  {demand.status}
                </span>
              </td>
              <td className="px-6 py-4 text-center">
                <div className={`text-[9px] font-bold uppercase tracking-tighter ${PRIORITY_COLORS[demand.priority]}`}>
                  {demand.priority}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-[10px] font-medium text-workspace-muted uppercase border border-workspace-border inline-block px-2 py-0.5 bg-black">
                  {demand.category}
                </div>
              </td>
              <td className="px-6 py-4 text-[10px] font-mono text-workspace-muted">
                {demand.deadline ? new Date(demand.deadline).toLocaleDateString('pt-BR') : 'N/A'}
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-1">
                  <button onClick={() => handleOpenModal(demand)} className="p-1.5 text-workspace-muted hover:text-workspace-accent transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(demand.id)} className="p-1.5 text-workspace-muted hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderKanban = () => {
    const columns: DemandStatus[] = ['Pendente', 'Em Andamento', 'Concluído'];
    return (
      <div className="flex gap-6 h-full min-w-max pb-4 overflow-x-auto">
        {columns.map(status => (
          <div key={status} className="w-80 flex flex-col bg-workspace-surface border border-workspace-border rounded-md shadow-lg">
            <div className="p-4 border-b border-workspace-border flex items-center justify-between bg-black/50">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-workspace-text">{status}</span>
              <span className="text-[9px] font-mono text-workspace-muted border border-workspace-border px-1.5">{filteredDemands.filter(d => d.status === status).length}</span>
            </div>
            <div className="flex-1 p-3 space-y-3 overflow-y-auto">
              {filteredDemands.filter(d => d.status === status).map(demand => (
                <div key={demand.id} onClick={() => handleOpenModal(demand)} className="glow-item bg-black border border-workspace-border p-4 rounded-sm transition-all cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[8px] font-mono text-workspace-muted">{demand.category}</span>
                    <span className={`text-[8px] font-black uppercase ${PRIORITY_COLORS[demand.priority]}`}>{demand.priority}</span>
                  </div>
                  <h4 className="text-[11px] font-bold text-white mb-3">{demand.title}</h4>
                  <div className="pt-3 border-t border-workspace-border/50 flex items-center justify-between">
                    <div className="text-[9px] text-workspace-muted flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" />
                      {demand.deadline ? new Date(demand.deadline).toLocaleDateString('pt-BR') : '---'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderGantt = () => {
    const dates = Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i - 5);
      return d;
    });
    return (
      <div className="bg-workspace-surface border border-workspace-border rounded-md overflow-hidden flex flex-col h-full min-w-max shadow-2xl">
        <div className="flex border-b border-workspace-border bg-black shrink-0">
          <div className="w-64 border-r border-workspace-border p-4 text-[9px] font-black text-workspace-muted uppercase tracking-widest">Atividade</div>
          <div className="flex-1 flex">
            {dates.map((date, i) => (
              <div key={i} className="w-12 border-r border-workspace-border/10 p-2 text-center shrink-0">
                <div className="text-[8px] font-bold text-workspace-muted uppercase">{date.toLocaleDateString('pt-BR', { weekday: 'short' }).slice(0, 1)}</div>
                <div className="text-[9px] font-mono text-white">{date.getDate()}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredDemands.map(demand => {
            const start = new Date(demand.createdAt).getTime();
            const end = demand.deadline ? new Date(demand.deadline).getTime() : start + 86400000 * 2;
            const leftOffset = Math.max(0, (start - dates[0].getTime()) / (1000 * 60 * 60 * 24)) * 48;
            const width = Math.max(12, (end - start) / (1000 * 60 * 60 * 24)) * 48;
            return (
              <div key={demand.id} className="flex border-b border-workspace-border group h-12 items-center hover:bg-workspace-accent/5 transition-colors">
                <div className="w-64 border-r border-workspace-border px-4 flex items-center gap-3 shrink-0">
                  <span className="text-[10px] font-bold truncate text-white uppercase tracking-tight">{demand.title}</span>
                </div>
                <div className="flex-1 flex relative h-full items-center bg-black/20">
                   {dates.map((_, i) => <div key={i} className="w-12 h-full border-r border-workspace-border/5 shrink-0" />)}
                   <div 
                    onClick={() => handleOpenModal(demand)}
                    className="absolute h-4 rounded-sm border border-black/20 cursor-pointer hover:brightness-110 transition-all z-10"
                    style={{ 
                      left: `${leftOffset}px`, 
                      width: `${width}px`,
                      backgroundColor: demand.status === 'Concluído' ? '#10b981' : demand.status === 'Em Andamento' ? '#3b82f6' : '#555'
                    }}
                   />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-workspace-main overflow-hidden">
      <div className="p-8 pb-4 shrink-0">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-black text-white uppercase tracking-[0.2em]">Fluxo de Demandas</h1>
            <p className="text-[9px] text-workspace-muted font-bold uppercase tracking-[0.1em] mt-1 opacity-40">Gestão operacional de infraestrutura</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-workspace-surface border border-workspace-border p-1 rounded-sm gap-1">
              <button 
                onClick={() => setViewMode('table')} 
                className={`glow-button p-2 rounded-sm transition-all ${viewMode === 'table' ? 'bg-workspace-accent text-black border-workspace-accent' : 'text-workspace-muted hover:text-white border-transparent'}`}
              >
                <ListIcon size={14} />
              </button>
              <button 
                onClick={() => setViewMode('kanban')} 
                className={`glow-button p-2 rounded-sm transition-all ${viewMode === 'kanban' ? 'bg-workspace-accent text-black border-workspace-accent' : 'text-workspace-muted hover:text-white border-transparent'}`}
              >
                <Kanban size={14} />
              </button>
              <button 
                onClick={() => setViewMode('gantt')} 
                className={`glow-button p-2 rounded-sm transition-all ${viewMode === 'gantt' ? 'bg-workspace-accent text-black border-workspace-accent' : 'text-workspace-muted hover:text-white border-transparent'}`}
              >
                <CalendarDays size={14} />
              </button>
            </div>
            <button 
              onClick={() => handleOpenModal()} 
              className="glow-button-solid flex items-center gap-2 bg-workspace-accent text-black px-4 py-2 rounded-sm text-[9px] font-black uppercase tracking-widest transition-all shadow-lg"
            >
              <Plus size={14} /> NOVO ITEM
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-workspace-surface p-1.5 rounded-sm border border-workspace-border">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-workspace-muted" />
            <input type="text" placeholder="Filtrar sistema..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-transparent pl-10 pr-4 py-2 text-[10px] uppercase font-bold text-white placeholder-workspace-muted/30 outline-none" />
          </div>
          <div className="h-4 w-[1px] bg-workspace-border" />
          <div className="flex gap-1">
            {['Todas', 'Pendente', 'Em Andamento', 'Concluído'].map(f => (
              <button 
                key={f} 
                onClick={() => setActiveFilter(f as any)} 
                className={`glow-button px-3 py-1.5 rounded-sm text-[8px] font-black uppercase tracking-widest transition-all ${activeFilter === f ? 'bg-white text-black border-white' : 'text-workspace-muted hover:text-white border-transparent'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-auto px-8 pb-8">
        {filteredDemands.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-10 grayscale">
            <ClipboardCheck className="w-16 h-16 mb-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em]">Sem Registros</span>
          </div>
        ) : (
          viewMode === 'table' ? renderTable() : viewMode === 'kanban' ? renderKanban() : renderGantt()
        )}
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in-quick">
          <div className="bg-workspace-surface border border-workspace-border w-full max-w-lg rounded-sm shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-workspace-border flex justify-between items-center bg-black">
              <h2 className="text-[9px] font-black uppercase tracking-[0.3em] text-workspace-accent">Entrada de Dados</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-workspace-muted hover:text-white"><X size={18} /></button>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-1.5">
                <label className="text-[8px] font-black uppercase text-workspace-muted tracking-widest">Identificação da Demanda</label>
                <input type="text" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} className="w-full bg-black border border-workspace-border rounded-sm px-4 py-3 text-[12px] font-medium text-white focus:border-workspace-accent transition-all outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[8px] font-black uppercase text-workspace-muted tracking-widest">Status Operacional</label>
                  <select value={form.status} onChange={(e) => setForm({...form, status: e.target.value as any})} className="w-full bg-black border border-workspace-border rounded-sm px-4 py-3 text-[12px] text-white outline-none">
                    <option value="Pendente">Pendente</option>
                    <option value="Em Andamento">Em Andamento</option>
                    <option value="Concluído">Concluído</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[8px] font-black uppercase text-workspace-muted tracking-widest">Nível de Crise</label>
                  <select value={form.priority} onChange={(e) => setForm({...form, priority: e.target.value as any})} className="w-full bg-black border border-workspace-border rounded-sm px-4 py-3 text-[12px] text-white outline-none">
                    <option value="Baixa">Baixa</option>
                    <option value="Média">Média</option>
                    <option value="Alta">Alta</option>
                    <option value="Crítica">Crítica</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[8px] font-black uppercase text-workspace-muted tracking-widest">Tag de Setor</label>
                  <input type="text" value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} className="w-full bg-black border border-workspace-border rounded-sm px-4 py-3 text-[12px] text-white outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[8px] font-black uppercase text-workspace-muted tracking-widest">Data Limite</label>
                  <input type="date" value={form.deadline} onChange={(e) => setForm({...form, deadline: e.target.value})} className="w-full bg-black border border-workspace-border rounded-sm px-4 py-3 text-[12px] text-white outline-none" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[8px] font-black uppercase text-workspace-muted tracking-widest">Memorial Descritivo</label>
                <textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="w-full bg-black border border-workspace-border rounded-sm px-4 py-3 text-[12px] min-h-[80px] text-white outline-none resize-none" />
              </div>
            </div>
            <div className="p-4 bg-black border-t border-workspace-border flex justify-end gap-2">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-[9px] font-black uppercase text-workspace-muted hover:text-white">Abortar</button>
              <button onClick={handleSave} className="glow-button-solid px-8 py-2.5 bg-workspace-accent text-black text-[9px] font-black uppercase tracking-widest rounded-sm">Validar Registro</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Demands;
