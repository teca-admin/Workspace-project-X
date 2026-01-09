
// Prompt: Implementação e Manutenção de CRUD com Optimistic UI + Supabase
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Folder, FileCode, FileText, Plus, Search, Box, Layers, 
  Trash2, Pencil, File, X, AlertTriangle, Check,
  Target, Zap, TrendingUp, Activity, BarChart3, PieChart, Workflow, Cpu, Bot, Briefcase, CheckCircle2, ClipboardList, Clock, Repeat, RotateCw, Shield, Users, Calendar, Kanban, Layout, Boxes, Settings, Scale, Gauge, History, Milestone, Network, PenTool, Play, Rocket, Share2, Siren, Sparkles, StepForward, StopCircle, Telescope, Wrench, Truck, Variable, Hammer, Glasses, HardDrive, Package, Inbox, MessageSquare,
  FileSpreadsheet, Presentation, FileType, UploadCloud, Paperclip, Download
} from 'lucide-react';
import { Artifact, ArtifactCollection } from '../types';
import { supabase } from '../lib/supabaseClient';

// --- Curadoria de Ícones Expandida ---
const COLLECTION_ICONS: Record<string, React.ElementType> = {
  // Arquivos / Formatos
  'pdf': FileType, 
  'excel': FileSpreadsheet, 
  'ppt': Presentation, 
  'word': FileText,
  'code': FileCode,
  'file': File,
  
  // Gestão e Negócios
  'target': Target, 'zap': Zap, 'trending': TrendingUp, 'activity': Activity, 'barchart': BarChart3, 
  'piechart': PieChart, 'repeat': Repeat, 'rotate': RotateCw, 'gauge': Gauge, 'scale': Scale, 
  'history': History, 'checkcircle': CheckCircle2, 'siren': Siren, 'kanban': Kanban, 'layout': Layout, 
  'boxes': Boxes, 'briefcase': Briefcase, 'calendar': Calendar, 'clock': Clock, 'milestone': Milestone, 
  'clipboard': ClipboardList, 'users': Users, 'workflow': Workflow, 'cpu': Cpu, 'bot': Bot, 
  'network': Network, 'variable': Variable, 'settings': Settings, 'layers': Layers, 'box': Box, 
  'shield': Shield, 'search': Search, 'telescope': Telescope, 'glasses': Glasses, 'pentool': PenTool, 
  'hammer': Hammer, 'wrench': Wrench, 'truck': Truck, 'package': Package, 'inbox': Inbox, 
  'message': MessageSquare, 'sparkles': Sparkles, 'play': Play, 'rocket': Rocket, 'stepforward': StepForward, 
  'stopcircle': StopCircle, 'folder': Folder, 'harddrive': HardDrive
};

const COLOR_PALETTE = [
  { name: 'Slate', value: '#71717a' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Cyan', value: '#06b6d4' }
];

// --- Mapeamento de Colunas (De/Para) ---

// Frontend -> Supabase (ao enviar)
const toSupabaseCol = (col: Partial<ArtifactCollection>) => ({ 
  nome: col.name, 
  icone: col.icon,
  cor: col.color,
  descricao: col.description
});

// Supabase -> Frontend (ao receber)
const toFrontendCol = (data: any): ArtifactCollection => ({ 
  id: data.id, 
  name: data.nome, 
  icon: data.icone || 'folder',
  color: data.cor || '#71717a',
  description: data.descricao || '',
  updatedAt: data.atualizado_em ? new Date(data.atualizado_em) : undefined
});

const toSupabaseArt = (art: any) => ({
  colecao_id: art.collectionId,
  titulo: art.title,
  tipo: art.type,
  icone: art.icon,
  cor: art.color,
  conteudo: art.content || '',
  descricao: art.description || '' 
});

const toFrontendArt = (data: any): Artifact => ({ 
  id: data.id, 
  collectionId: data.colecao_id, 
  title: data.titulo, 
  content: data.conteudo || '', 
  description: data.descricao || '', 
  type: data.tipo, 
  createdAt: new Date(data.criado_em), 
  updatedAt: data.atualizado_em ? new Date(data.atualizado_em) : undefined,
  icon: data.icone, 
  color: data.cor 
});

// Helper de formatação de erro
const formatError = (error: any) => {
  return error?.message || JSON.stringify(error);
};

const Artifacts: React.FC = () => {
  const [collections, setCollections] = useState<ArtifactCollection[]>([]);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [selectedArtifactId, setSelectedArtifactId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Estados dos Modais
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [editingCollectionId, setEditingCollectionId] = useState<string | null>(null);
  const [colForm, setColForm] = useState({ name: '', icon: 'folder', color: '#71717a', description: '' });

  const [isArtifactModalOpen, setIsArtifactModalOpen] = useState(false);
  const [editingArtifactId, setEditingArtifactId] = useState<string | null>(null);
  
  const [artifactForm, setArtifactForm] = useState({ 
    title: '', 
    content: '', 
    description: '', 
    type: 'text' as Artifact['type'], 
    icon: 'filetext' 
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estado para Confirmação de Exclusão
  const [itemToDelete, setItemToDelete] = useState<{ type: 'collection' | 'artifact', id: string, name: string } | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: colData } = await supabase.from('colecoes').select('*').order('nome');
      const { data: artData } = await supabase.from('artefatos').select('*'); 
      if (colData) setCollections(colData.map(toFrontendCol));
      if (artData) setArtifacts(artData.map(toFrontendArt));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const activeCollection = useMemo(() => collections.find(c => c.id === selectedCollectionId), [collections, selectedCollectionId]);
  const activeArtifact = useMemo(() => artifacts.find(a => a.id === selectedArtifactId), [artifacts, selectedArtifactId]);

  const filteredArtifacts = useMemo(() => artifacts.filter(a => 
    a.collectionId === selectedCollectionId && a.title.toLowerCase().includes(searchQuery.toLowerCase())
  ), [artifacts, selectedCollectionId, searchQuery]);

  const getColIcon = (name: string) => COLLECTION_ICONS[name] || Folder;

  // --- Lógica de Download ---
  const handleDownload = (art: Artifact) => {
    if (!art.content) return;
    
    // Criar um blob com o conteúdo do artefato
    // Em uma aplicação real, se for binário, precisaríamos de outro tratamento
    const blob = new Blob([art.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    
    // Tenta definir a extensão correta baseada no tipo
    let extension = '.txt';
    switch (art.type) {
        case 'pdf': extension = '.pdf'; break;
        case 'excel': extension = '.xlsx'; break;
        case 'word': extension = '.docx'; break;
        case 'powerpoint': extension = '.pptx'; break;
        case 'code': extension = '.js'; break;
    }
    
    const fileName = art.title.toLowerCase().endsWith(extension) 
        ? art.title 
        : `${art.title}${extension}`;
        
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    
    // Limpeza
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // --- Lógica de Arquivos ---
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    let type: Artifact['type'] = 'text';
    let icon = 'file';

    if (file.name.endsWith('.pdf')) {
        type = 'pdf';
        icon = 'pdf';
    } else if (file.name.match(/\.(xls|xlsx|csv)$/i)) {
        type = 'excel';
        icon = 'excel';
    } else if (file.name.match(/\.(ppt|pptx)$/i)) {
        type = 'powerpoint';
        icon = 'ppt';
    } else if (file.name.match(/\.(doc|docx)$/i)) {
        type = 'word';
        icon = 'word';
    }

    setArtifactForm(prev => ({
        ...prev,
        title: prev.title || file.name,
        type: type,
        icon: icon,
        content: prev.content || `Arquivo anexado: ${file.name}`
    }));
  };

  const saveCollection = async () => {
    if (!colForm.name.trim()) { alert("Nome obrigatório."); return; }
    setIsSyncing(true);
    const fullPayload = toSupabaseCol(colForm);
    try {
      let error;
      if (editingCollectionId) {
        const { error: err } = await supabase.from('colecoes').update(fullPayload).eq('id', editingCollectionId);
        error = err;
      } else {
        const { error: err } = await supabase.from('colecoes').insert([fullPayload]);
        error = err;
      }
      if (error) throw error;
      setIsCollectionModalOpen(false);
      await fetchData();
    } catch (err: any) {
      if (err?.code === '42703' || err?.code === 'PGRST204') {
          const basic = { nome: colForm.name, icone: colForm.icon };
          const { error: err2 } = editingCollectionId 
            ? await supabase.from('colecoes').update(basic).eq('id', editingCollectionId)
            : await supabase.from('colecoes').insert([basic]);
          
          if (!err2) { 
              setIsCollectionModalOpen(false); 
              fetchData(); 
              return; 
          }
          console.error("Erro ao salvar coleção (Fallback falhou):", err2);
          alert("Erro ao salvar coleção: " + formatError(err2));
      } else {
          console.error("Erro ao salvar coleção:", err);
          alert("Erro ao salvar coleção: " + formatError(err));
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const requestDelete = (e: React.MouseEvent, type: 'collection' | 'artifact', id: string, name: string) => {
    e.preventDefault(); e.stopPropagation();
    setItemToDelete({ type, id, name });
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    const { type, id } = itemToDelete;
    setItemToDelete(null);

    // Optimistic UI Delete
    if (type === 'collection') {
        const prevCols = [...collections];
        setCollections(prev => prev.filter(c => c.id !== id));
        if (selectedCollectionId === id) { setSelectedCollectionId(null); setSelectedArtifactId(null); }
        try {
            await supabase.from('artefatos').delete().eq('colecao_id', id);
            await supabase.from('colecoes').delete().eq('id', id);
        } catch (err) { 
            setCollections(prevCols); // Revert
            console.error("Erro ao deletar coleção:", err);
        }
    } else {
        const prevArts = [...artifacts];
        setArtifacts(prev => prev.filter(a => a.id !== id));
        if (selectedArtifactId === id) setSelectedArtifactId(null);
        try {
            await supabase.from('artefatos').delete().eq('id', id);
        } catch (err) {
            setArtifacts(prevArts); // Revert
            console.error("Erro ao deletar artefato:", err);
        }
    }
  };

  const openCollectionModal = (col?: ArtifactCollection) => {
    setEditingCollectionId(col?.id || null);
    setColForm({ 
      name: col?.name || '', icon: col?.icon || 'folder', 
      color: col?.color || '#71717a', description: col?.description || '' 
    });
    setIsCollectionModalOpen(true);
  };

  const openArtifactModal = (art?: Artifact) => {
      setEditingArtifactId(art?.id || null);
      if (art) {
        setArtifactForm({ 
            title: art.title, 
            content: art.content, 
            description: art.description || '', 
            type: art.type, 
            icon: art.icon || 'filetext' 
        });
      } else {
        setArtifactForm({ 
            title: '', 
            content: '', 
            description: '', 
            type: 'text', 
            icon: 'filetext' 
        });
      }
      setIsArtifactModalOpen(true);
  };

  const saveArtifact = async () => {
    if (!artifactForm.title.trim() || !selectedCollectionId) return;
    setIsSyncing(true);
    const fullPayload = toSupabaseArt({ ...artifactForm, collectionId: selectedCollectionId });

    try {
      let error;
      if (editingArtifactId) {
        const res = await supabase.from('artefatos').update(fullPayload).eq('id', editingArtifactId);
        error = res.error;
      } else {
        const res = await supabase.from('artefatos').insert([fullPayload]);
        error = res.error;
      }
      if (error) throw error;
      setIsArtifactModalOpen(false);
      fetchData();
    } catch (err: any) {
        if (err?.code === '42703' || err?.code === 'PGRST204') {
             const basic = { 
                colecao_id: selectedCollectionId, 
                titulo: artifactForm.title, 
                tipo: artifactForm.type, 
                conteudo: artifactForm.content 
             };
             
             const res = editingArtifactId 
                ? await supabase.from('artefatos').update(basic).eq('id', editingArtifactId)
                : await supabase.from('artefatos').insert([basic]);
             
             if (!res.error) { 
                 setIsArtifactModalOpen(false); 
                 fetchData(); 
                 return; 
             } else {
                 console.error("Erro ao salvar artefato (Fallback falhou):", res.error);
                 alert("Erro ao salvar artefato: " + formatError(res.error));
                 return;
             }
        }
        
        console.error("Erro ao salvar artefato:", err);
        alert("Erro ao salvar artefato: " + formatError(err));
    } finally {
      setIsSyncing(false);
    }
  };

  const isFileArtifact = (type: string) => {
      return ['pdf', 'word', 'excel', 'powerpoint', 'file', 'ppt'].includes(type);
  };

  return (
    <div className="flex h-full w-full bg-workspace-main overflow-hidden border-t border-workspace-border">
      {/* Coluna 1: Coleções */}
      <div className="w-[24%] border-r border-workspace-border flex flex-col shrink-0">
        <div className="h-12 flex items-center justify-between px-3 border-b border-workspace-border">
          <span className="text-[10px] font-bold text-workspace-muted uppercase tracking-widest">Coleções</span>
          <button onClick={() => openCollectionModal()} className="p-1 hover:bg-workspace-surface rounded text-workspace-muted"><Plus className="w-3.5 h-3.5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar pb-10">
          {collections.map(col => {
            const Icon = getColIcon(col.icon);
            const isSelected = selectedCollectionId === col.id;
            
            return (
              <div 
                key={col.id} 
                className={`group relative border-l-2 transition-all ${isSelected ? 'bg-workspace-surface border-workspace-accent' : 'border-transparent hover:bg-workspace-surface/50'}`}
              >
                <div 
                  className="w-full flex items-center gap-3 py-2.5 pl-3 pr-16 cursor-pointer overflow-hidden"
                  onClick={() => { setSelectedCollectionId(col.id); setSelectedArtifactId(null); }}
                >
                  <div 
                    className={`p-1.5 rounded transition-all shrink-0 flex items-center justify-center border ${isSelected ? 'bg-workspace-main shadow-sm' : 'bg-workspace-main border-transparent'}`}
                    style={{ borderColor: isSelected ? col.color : undefined }}
                  >
                    <Icon className="w-3.5 h-3.5" style={{ color: col.color }} />
                  </div>
                  <span className={`text-xs font-semibold truncate ${isSelected ? 'text-workspace-text' : 'text-workspace-text/70'}`}>{col.name}</span>
                </div>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-50 bg-workspace-main/90 rounded shadow-sm pl-1 backdrop-blur-sm">
                  <button onClick={(e) => { e.stopPropagation(); openCollectionModal(col); }} className="p-1.5 text-workspace-muted hover:text-workspace-accent hover:bg-workspace-surface rounded-md"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={(e) => requestDelete(e, 'collection', col.id, col.name)} className="p-1.5 text-workspace-muted hover:text-red-500 hover:bg-red-500/10 rounded-md"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Coluna 2: Artefatos */}
      <div className="w-[24%] border-r border-workspace-border flex flex-col shrink-0 bg-workspace-surface/10">
        <div className="h-12 flex items-center px-3 border-b border-workspace-border">
          <div className="relative w-full">
            <Search className="absolute left-2 top-2 w-3.5 h-3.5 text-workspace-muted" />
            <input type="text" placeholder="Pesquisar..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-workspace-surface border border-workspace-border rounded pl-7 pr-2 py-1.5 text-[10px] focus:outline-none" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar pb-10">
           <div className="h-8 flex items-center justify-between px-3 border-b border-workspace-border sticky top-0 bg-workspace-main z-10">
            <span className="text-[9px] font-black uppercase text-workspace-muted truncate pr-2">{activeCollection?.name || 'Selecione'}</span>
            <button disabled={!selectedCollectionId} onClick={() => openArtifactModal()} className={`text-[9px] font-bold uppercase ${selectedCollectionId ? 'text-workspace-accent' : 'text-workspace-muted opacity-40'}`}>+ Novo</button>
          </div>
          {filteredArtifacts.map(art => {
            const ArtIcon = COLLECTION_ICONS[art.icon || 'filetext'] || File;
            const iconColor = activeCollection?.color;
            
            return (
            <div key={art.id} className={`group relative border-l-2 transition-colors ${selectedArtifactId === art.id ? 'bg-workspace-surface border-workspace-accent' : 'border-transparent hover:bg-workspace-surface/40'}`}>
                <button onClick={() => setSelectedArtifactId(art.id)} className="w-full p-3 pr-10 text-left focus:outline-none">
                  <div className="flex items-center gap-2">
                    <ArtIcon 
                      className={`w-3 h-3 shrink-0 ${!iconColor ? 'text-workspace-muted' : ''}`} 
                      style={{ color: iconColor }}
                    />
                    <span className="text-[11px] font-bold truncate">{art.title}</span>
                  </div>
                </button>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 z-50 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => requestDelete(e, 'artifact', art.id, art.title)} className="p-1.5 text-workspace-muted hover:text-red-500 hover:bg-red-500/10 rounded-md bg-workspace-main/90 shadow-sm"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
            </div>
            );
          })}
        </div>
      </div>

      {/* Coluna 3: Conteúdo */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {activeArtifact ? (
          <div className="flex flex-col h-full">
            <div className="h-12 border-b border-workspace-border flex items-center justify-between px-6 shrink-0 bg-workspace-main">
               <h1 className="text-xs font-bold truncate">{activeArtifact.title}</h1>
               <div className="flex gap-2">
                 <button onClick={() => openArtifactModal(activeArtifact)} className="p-1.5 hover:bg-workspace-surface rounded"><Pencil className="w-3.5 h-3.5" /></button>
                 <button onClick={(e) => requestDelete(e, 'artifact', activeArtifact.id, activeArtifact.title)} className="p-1.5 hover:bg-workspace-surface hover:text-red-500 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
               </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                
                {isFileArtifact(activeArtifact.type) && (
                    <div className="mb-6 p-5 bg-workspace-surface border border-workspace-border rounded-xl flex items-center justify-between group shadow-sm hover:shadow-md transition-all">
                       <div className="flex items-center gap-5">
                          <div className="w-16 h-16 rounded-xl bg-workspace-main border border-workspace-border flex items-center justify-center shadow-inner">
                             {(() => {
                                 const Icon = COLLECTION_ICONS[activeArtifact.icon || 'file'] || File;
                                 return <Icon className="w-8 h-8" style={{ color: activeCollection?.color || '#71717a' }} />;
                             })()}
                          </div>
                          <div>
                             <h3 className="text-sm font-bold text-workspace-text mb-1">{activeArtifact.title}</h3>
                             <div className="flex items-center gap-2">
                                <span className="text-[10px] uppercase font-bold text-white bg-workspace-accent px-2 py-0.5 rounded-full tracking-wider">{activeArtifact.type}</span>
                                <span className="text-[10px] text-workspace-muted">Documento Anexado</span>
                             </div>
                          </div>
                       </div>
                       <button 
                         onClick={() => handleDownload(activeArtifact)}
                         className="flex items-center gap-2 px-4 py-2 bg-workspace-main border border-workspace-border rounded-lg text-xs font-bold text-workspace-text hover:bg-workspace-accent hover:text-white hover:border-workspace-accent transition-all shadow-sm"
                       >
                          <Download className="w-4 h-4" />
                          <span>BAIXAR</span>
                       </button>
                    </div>
                )}

                {activeArtifact.description && (
                    <div className="mb-6 p-4 bg-workspace-surface border border-workspace-border rounded-lg">
                        <h3 className="text-[10px] font-bold uppercase text-workspace-muted mb-2 tracking-wider">Notas</h3>
                        <p className="text-xs text-workspace-text/80 leading-relaxed whitespace-pre-wrap">{activeArtifact.description}</p>
                    </div>
                )}
                
                {(!isFileArtifact(activeArtifact.type) || !activeArtifact.content.includes('Arquivo anexado:')) && (
                     <div className="whitespace-pre-wrap text-xs font-light leading-relaxed text-workspace-text">{activeArtifact.content}</div>
                )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center opacity-10"><Box className="w-16 h-16 mb-4" /><p className="text-[10px] uppercase font-black tracking-widest">Artefatos</p></div>
        )}
      </div>

      {/* Modais omitidos por brevidade, permanecem iguais */}
      {/* ... (Modal Confirmação, Modal Coleção, Modal Artefato) ... */}
      
      {/* Modal Confirmação de Exclusão */}
      {itemToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in-quick">
            <div className="bg-workspace-surface border border-workspace-border rounded-xl p-6 max-w-sm w-full shadow-2xl">
                <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mb-4 text-red-500"><AlertTriangle className="w-6 h-6" /></div>
                    <h3 className="text-sm font-bold text-workspace-text mb-2">Excluir {itemToDelete.type === 'collection' ? 'Coleção' : 'Artefato'}?</h3>
                    <p className="text-xs text-workspace-muted mb-6 leading-relaxed">Tem certeza que deseja excluir <strong>"{itemToDelete.name}"</strong>? <span className="block mt-2">Esta ação não pode ser desfeita.</span></p>
                    <div className="flex gap-3 w-full">
                        <button onClick={() => setItemToDelete(null)} className="flex-1 px-4 py-2 bg-workspace-main border border-workspace-border text-workspace-text text-xs font-bold rounded-lg hover:bg-workspace-border/50 transition-colors">CANCELAR</button>
                        <button onClick={confirmDelete} className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors">EXCLUIR</button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Modal Coleção */}
      {isCollectionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-workspace-surface w-full max-w-xl border border-workspace-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-workspace-border flex items-center justify-between">
               <h2 className="text-[10px] font-black uppercase tracking-widest text-workspace-accent">{editingCollectionId ? 'EDITAR' : 'NOVA COLEÇÃO'}</h2>
               <button onClick={() => setIsCollectionModalOpen(false)}><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6">
              <input type="text" value={colForm.name} onChange={(e) => setColForm({...colForm, name: e.target.value})} className="w-full bg-workspace-main border border-workspace-border rounded-lg px-4 py-3 text-sm focus:outline-none" placeholder="Nome da Coleção" />
              
              <div className="flex flex-wrap gap-3 mb-4">
                {COLOR_PALETTE.map(c => (
                  <button key={c.value} onClick={() => setColForm({...colForm, color: c.value})} className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${colForm.color === c.value ? 'ring-2 ring-workspace-text ring-offset-2 ring-offset-workspace-surface scale-110 shadow-lg' : 'hover:scale-105 opacity-90 hover:opacity-100'}`} style={{backgroundColor: c.value}}>
                    {colForm.color === c.value && <Check className="w-4 h-4 text-white drop-shadow-md stroke-[3]" />}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-10 gap-2 bg-workspace-main/50 p-4 rounded-xl h-48 overflow-y-auto custom-scrollbar border border-workspace-border">
                {Object.keys(COLLECTION_ICONS).map(iconKey => {
                  const Icon = COLLECTION_ICONS[iconKey];
                  return <button key={iconKey} onClick={() => setColForm({...colForm, icon: iconKey})} className={`aspect-square flex items-center justify-center rounded-lg border ${colForm.icon === iconKey ? 'bg-workspace-accent text-white' : 'border-workspace-border text-workspace-muted hover:border-workspace-accent/40'}`}><Icon className="w-4 h-4" /></button>
                })}
              </div>
              <textarea value={colForm.description} onChange={(e) => setColForm({...colForm, description: e.target.value})} className="w-full bg-workspace-main border border-workspace-border rounded-xl px-4 py-4 text-xs min-h-[80px] resize-none focus:outline-none" placeholder="Notas/Observações da coleção..." />
            </div>
            <div className="p-4 bg-workspace-main border-t border-workspace-border flex justify-end gap-3">
              <button onClick={() => setIsCollectionModalOpen(false)} className="text-[9px] font-black uppercase">Cancelar</button>
              <button onClick={saveCollection} className="px-8 py-2 bg-workspace-accent text-white text-[9px] font-black rounded-lg uppercase">Salvar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Artefato */}
      {isArtifactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-workspace-surface w-full max-w-xl border border-workspace-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-workspace-border flex items-center justify-between">
              <h2 className="text-[10px] font-black uppercase text-workspace-accent">GERENCIAR ARTEFATO</h2>
              <button onClick={() => setIsArtifactModalOpen(false)}><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6">
              
              <input type="text" value={artifactForm.title} onChange={(e) => setArtifactForm({...artifactForm, title: e.target.value})} className="w-full bg-workspace-main border border-workspace-border rounded-lg px-4 py-3 text-sm focus:outline-none" placeholder="Título" />
              
              <div className="bg-workspace-surface/50 p-4 rounded-xl border border-workspace-border/50">
                 <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] uppercase font-bold text-workspace-muted tracking-wider">Anexar Arquivo (Auto-detectar)</span>
                 </div>
                 <div className="flex gap-2 items-center">
                    <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-workspace-main border border-workspace-border hover:border-workspace-accent rounded-lg transition-all group">
                        <UploadCloud className="w-4 h-4 text-workspace-muted group-hover:text-workspace-accent" />
                        <span className="text-xs font-medium text-workspace-muted group-hover:text-workspace-text">Escolher Arquivo</span>
                        <input 
                            ref={fileInputRef}
                            type="file" 
                            className="hidden" 
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx" 
                            onChange={handleFileSelect} 
                        />
                    </label>
                    <div className="flex gap-2 ml-2">
                        <div title="PDF" className={`w-8 h-8 rounded flex items-center justify-center border ${artifactForm.type === 'pdf' ? 'bg-red-500/10 border-red-500 text-red-500' : 'border-transparent text-workspace-muted/30'}`}><FileType className="w-4 h-4" /></div>
                        <div title="Word" className={`w-8 h-8 rounded flex items-center justify-center border ${artifactForm.type === 'word' ? 'bg-blue-500/10 border-blue-500 text-blue-500' : 'border-transparent text-workspace-muted/30'}`}><FileText className="w-4 h-4" /></div>
                        <div title="Excel" className={`w-8 h-8 rounded flex items-center justify-center border ${artifactForm.type === 'excel' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' : 'border-transparent text-workspace-muted/30'}`}><FileSpreadsheet className="w-4 h-4" /></div>
                        <div title="PowerPoint" className={`w-8 h-8 rounded flex items-center justify-center border ${artifactForm.type === 'powerpoint' ? 'bg-orange-500/10 border-orange-500 text-orange-500' : 'border-transparent text-workspace-muted/30'}`}><Presentation className="w-4 h-4" /></div>
                    </div>
                 </div>
                 {artifactForm.type !== 'text' && artifactForm.type !== 'code' && (
                    <div className="mt-2 text-[10px] text-workspace-muted flex items-center gap-1">
                        <Paperclip className="w-3 h-3" /> Tipo detectado: <span className="text-workspace-accent uppercase font-bold">{artifactForm.type}</span>
                    </div>
                 )}
              </div>

              <div className="space-y-2">
                 <span className="text-[10px] uppercase font-bold text-workspace-muted tracking-wider">Notas / Observações</span>
                 <textarea value={artifactForm.description} onChange={(e) => setArtifactForm({...artifactForm, description: e.target.value})} className="w-full bg-workspace-main border border-workspace-border rounded-lg px-4 py-3 text-xs min-h-[80px] resize-none focus:outline-none" placeholder="Adicione notas rápidas ou observações sobre este artefato..." />
              </div>

            </div>
            <div className="p-4 bg-workspace-main border-t border-workspace-border flex justify-end gap-3">
              <button onClick={() => setIsArtifactModalOpen(false)} className="text-[9px] font-black uppercase">Cancelar</button>
              <button onClick={saveArtifact} className="px-8 py-2 bg-workspace-accent text-white text-[9px] font-black rounded-lg uppercase">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Artifacts;
