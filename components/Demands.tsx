
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

// Dados de exemplo (Mock) para visualização frontend
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
  'Pendente': 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20',
  'Em Andamento': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  'Concluído': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  'Cancelado': 'bg-red-500/10 text-red-500 border-red-500/20'
};

const PRIORITY_COLORS: Record<DemandPriority, string> = {
  'Baixa': 'text-emerald-500',
  'Média': 'text-blue-500',
  'Alta': 'text-amber-500',
  'Crítica': 'text-red-500'
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

  // --- Renderizadores de Visão ---

  const renderTable = () => (
    <div className="min-w-[800px] bg-workspace-surface/10 border border-workspace-border rounded-xl overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-workspace-border bg-workspace-surface/5">
            <th className="px-6 py-4 text-[10px] font-black text-workspace-muted uppercase tracking-widest">Demanda</th>
            <th className="px-6 py-4 text-[10px] font-black text-workspace-muted uppercase tracking-widest text-center">Status</th>
            <th className="px-6 py-4 text-[10px] font-black text-workspace-muted uppercase tracking-widest text-center">Prioridade</th>
            <th className="px-6 py-4 text-[10px] font-black text-workspace-muted uppercase tracking-widest">Categoria</th>
            <th className="px-6 py-4 text-[10px] font-black text-workspace-muted uppercase tracking-widest">Prazo</th>
            <th className="px-6 py-4 text-[10px] font-black text-workspace-muted uppercase tracking-widest text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-workspace-border">
          {filteredDemands.map(demand => (
            <tr key={demand.id} className="group hover:bg-workspace-surface/40 transition-colors">
              <td className="px-6 py-5">
                <div className="flex flex-col">
                  <span className="text-[13px] font-bold text-workspace-text mb-1">{demand.title}</span>
                  <span className="text-[11px] text-workspace-muted line-clamp-1 opacity-60 font-light">{demand.description}</span>
                </div>
              </td>
              <td className="px-6 py-5 text-center">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${STATUS_COLORS[demand.status]}`}>
                  {demand.status}
                </span>
              </td>
              <td className="px-6 py-5 text-center">
                <div className={`flex items-center justify-center gap-1.5 text-[10px] font-black uppercase ${PRIORITY_COLORS[demand.priority]}`}>
                  <AlertCircle className="w-3.5 h-3.5" />
                  {demand.priority}
                </div>
              </td>
              <td className="px-6 py-5">
                <div className="flex items-center gap-2 text-[11px] font-bold text-workspace-muted uppercase tracking-tighter">
                  <Hash className="w-3 h-3 text-workspace-accent/50" />
                  {demand.category}
                </div>
              </td>
              <td className="px-6 py-5">
                <div className="flex items-center gap-2 text-[11px] font-bold text-workspace-muted">
                  <Calendar className="w-3.5 h-3.5 opacity-40" />
                  {demand.deadline ? new Date(demand.deadline).toLocaleDateString('pt-BR') : 'Sem prazo'}
                </div>
              </td>
              <td className="px-6 py-5 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button onClick={() => handleOpenModal(demand)} className="p-2 text-workspace-muted hover:text-workspace-accent hover:bg-workspace-surface rounded-md transition-all"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(demand.id)} className="p-2 text-workspace-muted hover:text-red-500 hover:bg-red-500/10 rounded-md transition-all"><Trash2 className="w-4 h-4" /></button>
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
      <div className="flex gap-6 h-full min-w-max pb-4">
        {columns.map(status => (
          <div key={status} className="w-80 flex flex-col bg-workspace-surface/10 border border-workspace-border rounded-xl overflow-hidden">
            <div className="p-4 border-b border-workspace-border bg-workspace-surface/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${status === 'Pendente' ? 'bg-zinc-500' : status === 'Em Andamento' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                <h3 className="text-[10px] font-black uppercase tracking-widest text-workspace-text">{status}</h3>
              </div>
              <span className="text-[9px] font-black text-workspace-muted bg-workspace-main px-2 py-0.5 rounded border border-workspace-border">
                {filteredDemands.filter(d => d.status === status).length}
              </span>
            </div>
            
            <div className="flex-1 p-3 space-y-3 overflow-y-auto custom-scrollbar">
              {filteredDemands.filter(d => d.status === status).map(demand => (
                <div 
                  key={demand.id} 
                  onClick={() => handleOpenModal(demand)}
                  className="bg-workspace-main border border-workspace-border p-4 rounded-lg shadow-sm hover:border-workspace-accent transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded border border-workspace-border text-workspace-muted/60">
                      {demand.category}
                    </span>
                    <div className={`text-[8px] font-black uppercase ${PRIORITY_COLORS[demand.priority]}`}>
                      {demand.priority}
                    </div>
                  </div>
                  <h4 className="text-[11px] font-bold text-workspace-text mb-3 leading-snug group-hover:text-workspace-accent transition-colors">{demand.title}</h4>
                  <div className="flex items-center justify-between pt-3 border-t border-workspace-border/50">
                    <div className="flex items-center gap-1.5 text-[9px] text-workspace-muted font-bold">
                      <Calendar className="w-3 h-3 opacity-40" />
                      {demand.deadline ? new Date(demand.deadline).toLocaleDateString('pt-BR') : '---'}
                    </div>
                    <div className="flex -space-x-1">
                      <div className="w-5 h-5 rounded-full bg-workspace-accent border border-workspace-main flex items-center justify-center text-[8px] text-white font-black">U</div>
                    </div>
                  </div>
                </div>
              ))}
              
              <button 
                onClick={() => handleOpenModal({ status } as Demand)}
                className="w-full py-3 border-2 border-dashed border-workspace-border rounded-lg text-workspace-muted hover:text-workspace-accent hover:border-workspace-accent/40 hover:bg-workspace-accent/5 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="text-[9px] font-black uppercase tracking-widest">Adicionar</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderGantt = () => {
    // Definir range de datas (aproximado para o mock)
    const dates = Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i - 10);
      return d;
    });

    return (
      <div className="bg-workspace-surface/10 border border-workspace-border rounded-xl overflow-hidden flex flex-col h-full min-w-max">
        {/* Header do Gantt */}
        <div className="flex border-b border-workspace-border shrink-0 bg-workspace-surface/5">
          <div className="w-64 border-r border-workspace-border p-4 text-[10px] font-black text-workspace-muted uppercase tracking-widest">Tarefa</div>
          <div className="flex-1 flex">
            {dates.map((date, i) => (
              <div key={i} className="w-12 border-r border-workspace-border/30 p-2 text-center shrink-0">
                <div className="text-[8px] font-black text-workspace-muted/40 uppercase">{date.toLocaleDateString('pt-BR', { weekday: 'short' }).slice(0, 1)}</div>
                <div className="text-[9px] font-bold text-workspace-text">{date.getDate()}</div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Linhas do Gantt */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredDemands.map(demand => {
            const start = new Date(demand.createdAt).getTime();
            const end = demand.deadline ? new Date(demand.deadline).getTime() : start + 86400000 * 2;
            const minDate = dates[0].getTime();
            const maxDate = dates[dates.length - 1].getTime();
            
            // Cálculo de posição (simplificado para grid de 48px por dia)
            const leftOffset = Math.max(0, (start - minDate) / (1000 * 60 * 60 * 24)) * 48;
            const width = Math.max(24, (end - start) / (1000 * 60 * 60 * 24)) * 48;

            return (
              <div key={demand.id} className="flex border-b border-workspace-border group hover:bg-workspace-surface/20 h-12 items-center">
                <div className="w-64 border-r border-workspace-border px-4 flex items-center gap-2 shrink-0">
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${demand.status === 'Pendente' ? 'bg-zinc-500' : 'bg-blue-500'}`} />
                  <span className="text-[11px] font-bold truncate text-workspace-text group-hover:text-workspace-accent transition-colors">{demand.title}</span>
                </div>
                <div className="flex-1 flex relative h-full items-center bg-workspace-surface/5">
                   {/* Background grid */}
                   {dates.map((_, i) => <div key={i} className="w-12 h-full border-r border-workspace-border/20 shrink-0" />)}
                   
                   {/* Barra da Tarefa */}
                   <div 
                    onClick={() => handleOpenModal(demand)}
                    className="absolute h-6 rounded-md shadow-sm border border-black/10 cursor-pointer hover:scale-[1.02] transition-transform z-10 flex items-center px-3 overflow-hidden"
                    style={{ 
                      left: `${leftOffset}px`, 
                      width: `${width}px`,
                      backgroundColor: demand.status === 'Concluído' ? '#10b981' : demand.status === 'Em Andamento' ? '#3b82f6' : '#71717a'
                    }}
                   >
                     <span className="text-[8px] font-black text-white uppercase truncate drop-shadow-sm">{demand.title}</span>
                   </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-workspace-main animate-fade-in-quick overflow-hidden">
      
      {/* Header e Ações */}
      <div className="p-8 pb-4 shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-light text-workspace-text tracking-tight mb-1">Central de Demandas</h1>
            <p className="text-xs text-workspace-muted font-medium uppercase tracking-widest opacity-60">Visualização multinível de fluxos</p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Seletor de View */}
            <div className="flex bg-workspace-surface border border-workspace-border p-1 rounded-xl">
              <button 
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-workspace-accent text-white shadow-md' : 'text-workspace-muted hover:text-workspace-text'}`}
                title="Tabela"
              >
                <ListIcon className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode('kanban')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'kanban' ? 'bg-workspace-accent text-white shadow-md' : 'text-workspace-muted hover:text-workspace-text'}`}
                title="Kanban"
              >
                <Kanban className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode('gantt')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'gantt' ? 'bg-workspace-accent text-white shadow-md' : 'text-workspace-muted hover:text-workspace-text'}`}
                title="Gantt / Timeline"
              >
                <CalendarDays className="w-4 h-4" />
              </button>
            </div>

            <button 
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 bg-workspace-accent text-white px-5 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg"
            >
              <Plus className="w-4 h-4" />
              Nova Demanda
            </button>
          </div>
        </div>

        {/* Barra de Filtros e Pesquisa */}
        <div className="flex flex-col md:flex-row items-center gap-4 bg-workspace-surface/30 p-2 rounded-xl border border-workspace-border">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-workspace-muted" />
            <input 
              type="text" 
              placeholder="Pesquisar demandas..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none pl-10 pr-4 py-2 text-[12px] focus:ring-0 placeholder-workspace-muted/50"
            />
          </div>
          
          <div className="h-8 w-[1px] bg-workspace-border hidden md:block" />
          
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
            {['Todas', 'Pendente', 'Em Andamento', 'Concluído'].map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f as any)}
                className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  activeFilter === f 
                    ? 'bg-workspace-accent text-white shadow-md' 
                    : 'text-workspace-muted hover:text-workspace-text'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Área de Visualização Dinâmica */}
      <div className="flex-1 overflow-auto px-8 pb-8 custom-scrollbar">
        {filteredDemands.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 opacity-20 border border-workspace-border border-dashed rounded-xl">
            <ClipboardCheck className="w-12 h-12 mb-4 stroke-[1]" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Sem resultados</span>
          </div>
        ) : (
          viewMode === 'table' ? renderTable() :
          viewMode === 'kanban' ? renderKanban() : renderGantt()
        )}
      </div>

      {/* Modal Cadastro/Edição */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in-quick">
          <div className="bg-workspace-surface border border-workspace-border w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-workspace-border flex justify-between items-center bg-workspace-main">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-workspace-accent">
                {editingDemand ? 'Editar Detalhes' : 'Cadastrar Demanda'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-workspace-surface rounded-full transition-colors">
                <X className="w-5 h-5 text-workspace-muted" />
              </button>
            </div>
            
            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-workspace-muted tracking-widest">Título</label>
                <input 
                  type="text" 
                  value={form.title} 
                  onChange={(e) => setForm({...form, title: e.target.value})}
                  placeholder="Nome da demanda..."
                  className="w-full bg-workspace-main border border-workspace-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-workspace-accent transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-workspace-muted tracking-widest">Status</label>
                  <select 
                    value={form.status} 
                    onChange={(e) => setForm({...form, status: e.target.value as any})}
                    className="w-full bg-workspace-main border border-workspace-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-workspace-accent transition-all cursor-pointer"
                  >
                    <option value="Pendente">Pendente</option>
                    <option value="Em Andamento">Em Andamento</option>
                    <option value="Concluído">Concluído</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-workspace-muted tracking-widest">Prioridade</label>
                  <select 
                    value={form.priority} 
                    onChange={(e) => setForm({...form, priority: e.target.value as any})}
                    className="w-full bg-workspace-main border border-workspace-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-workspace-accent transition-all cursor-pointer"
                  >
                    <option value="Baixa">Baixa</option>
                    <option value="Média">Média</option>
                    <option value="Alta">Alta</option>
                    <option value="Crítica">Crítica</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-workspace-muted tracking-widest">Categoria</label>
                  <input 
                    type="text" 
                    value={form.category} 
                    onChange={(e) => setForm({...form, category: e.target.value})}
                    placeholder="Ex: Design, Code..."
                    className="w-full bg-workspace-main border border-workspace-border rounded-lg px-4 py-3 text-sm focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-workspace-muted tracking-widest">Prazo Final</label>
                  <input 
                    type="date" 
                    value={form.deadline} 
                    onChange={(e) => setForm({...form, deadline: e.target.value})}
                    className="w-full bg-workspace-main border border-workspace-border rounded-lg px-4 py-3 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-workspace-muted tracking-widest">Descrição</label>
                <textarea 
                  value={form.description} 
                  onChange={(e) => setForm({...form, description: e.target.value})}
                  className="w-full bg-workspace-main border border-workspace-border rounded-lg px-4 py-3 text-sm min-h-[100px] resize-none focus:outline-none"
                />
              </div>
            </div>
            
            <div className="p-6 bg-workspace-main border-t border-workspace-border flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 text-[10px] font-black uppercase tracking-widest text-workspace-muted">Cancelar</button>
              <button onClick={handleSave} className="px-10 py-2.5 bg-workspace-accent text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg">Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Demands;
