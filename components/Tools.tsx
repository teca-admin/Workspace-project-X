
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Plus, ArrowLeft, Globe, Loader2, X, Pencil, Trash2, Folder, FolderPlus, AlertTriangle
} from 'lucide-react';
import { Tool } from '../types';
import { supabase } from '../lib/supabaseClient';

const toSupabase = (tool: Partial<Tool>) => ({
  titulo: tool.title,
  descricao: tool.description,
  url: tool.url,
  icone: tool.icon,
  categoria: tool.category,
  parent_id: tool.parentId,
  is_folder: tool.isFolder
});

const toFrontend = (data: any): Tool => ({
  id: data.id,
  title: data.titulo || '',
  description: data.descricao || '',
  url: data.url || '',
  icon: data.icone || '',
  category: data.categoria || '',
  parentId: data.parent_id,
  isFolder: data.is_folder || false,
  createdAt: data.criado_em ? new Date(data.criado_em) : undefined,
  updatedAt: data.atualizado_em ? new Date(data.atualizado_em) : undefined,
});

const Tools: React.FC = () => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [activeTool, setActiveTool] = useState<Tool | null>(null);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingToolId, setEditingToolId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: '', url: '', description: '', isFolder: false });
  const [itemToDelete, setItemToDelete] = useState<{ id: string, title: string, isFolder: boolean } | null>(null);

  const fetchTools = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('ferramentas').select('*');
      if (error) throw error;
      if (data) setTools(data.map(toFrontend));
    } catch (e) {
      console.error('[SUPABASE] Erro:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchTools(); }, []);

  const getFavicon = (url: string) => {
    if (!url) return '';
    try { return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=64`; } catch { return ''; }
  };

  const handleOpenModal = (tool?: Tool, createFolder: boolean = false) => {
    if (tool) {
      setEditingToolId(tool.id);
      setFormData({ title: tool.title, url: tool.url, description: tool.description, isFolder: !!tool.isFolder });
    } else {
      setEditingToolId(null);
      setFormData({ title: '', url: '', description: '', isFolder: createFolder });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title) return;
    const toolData = { title: formData.title, url: formData.url, description: formData.description, isFolder: formData.isFolder, parentId: currentFolderId };
    setIsModalOpen(false);
    if (editingToolId) {
      await supabase.from('ferramentas').update(toSupabase(toolData)).eq('id', editingToolId);
    } else {
      await supabase.from('ferramentas').insert([toSupabase(toolData)]);
    }
    fetchTools();
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    const { id } = itemToDelete;
    setItemToDelete(null);
    try {
        await supabase.from('ferramentas').delete().eq('id', id);
        fetchTools();
    } catch (err) {
        console.error("Erro ao deletar:", err);
    }
  };

  const visibleTools = tools.filter(t => t.parentId === currentFolderId);
  visibleTools.sort((a, b) => (a.isFolder === b.isFolder ? 0 : a.isFolder ? -1 : 1));

  if (activeTool) {
    return (
      <div className="flex flex-col h-full bg-black animate-fade-in relative">
        <div className="h-12 border-b border-workspace-border flex items-center justify-between px-6 bg-black shrink-0 z-20">
          <button onClick={() => setActiveTool(null)} className="p-1 hover:text-workspace-accent transition-colors"><ArrowLeft size={16} /></button>
          <h2 className="text-[10px] font-black uppercase tracking-widest text-white">{activeTool.title}</h2>
          <a href={activeTool.url} target="_blank" rel="noreferrer" className="glow-button text-[9px] font-black px-3 py-1 border border-workspace-border rounded-sm uppercase transition-all">Link Externo</a>
        </div>
        <iframe src={activeTool.url} className="w-full h-full border-none bg-white" title={activeTool.title} />
      </div>
    );
  }

  return (
    <div className="p-10 max-w-7xl mx-auto h-full flex flex-col animate-fade-in">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-xl font-black text-white uppercase tracking-[0.2em]">Recursos Externos</h1>
          <p className="text-[9px] text-workspace-muted font-bold uppercase tracking-[0.1em] mt-1 opacity-40">Utilitários e integrações homologadas</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => handleOpenModal(undefined, true)} className="glow-button px-4 py-2 border border-workspace-border rounded-sm text-[9px] font-black uppercase tracking-widest transition-all"><FolderPlus size={14} className="inline mr-2" /> PASTA</button>
          <button onClick={() => handleOpenModal(undefined, false)} className="glow-button-solid px-4 py-2 bg-workspace-accent text-black rounded-sm text-[9px] font-black uppercase tracking-widest transition-all shadow-lg"><Plus size={14} className="inline mr-2" /> RECURSO</button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleTools.map((tool) => (
            <div 
              key={tool.id} 
              onClick={() => tool.isFolder ? setCurrentFolderId(tool.id) : setActiveTool(tool)} 
              className="glow-item group relative bg-workspace-surface p-6 rounded-sm cursor-pointer border-l-4 border-l-workspace-accent/50 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 border border-workspace-border bg-black flex items-center justify-center shrink-0 group-hover:border-workspace-accent transition-colors">
                  {tool.isFolder ? (
                    <Folder className="w-5 h-5 text-workspace-accent" />
                  ) : (
                    <img src={getFavicon(tool.url)} alt="" className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" onError={(e) => { (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'%3E%3C/circle%3E%3Cline x1='2' y1='12' x2='22' y2='12'%3E%3C/line%3E%3Cpath d='M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z'%3E%3C/path%3E%3C/svg%3E"; }} />
                  )}
                </div>
                <div className="flex-1 min-w-0 pr-12"> 
                  <h3 className="text-[11px] font-bold text-white uppercase tracking-tight mb-1 truncate">{tool.title}</h3>
                  <p className="text-[9px] text-workspace-muted font-medium line-clamp-2 uppercase leading-relaxed opacity-60">
                    {tool.isFolder ? `${tools.filter(t => t.parentId === tool.id).length} itens` : (tool.description || "Sem memorial descritivo.")}
                  </p>
                </div>
              </div>

              <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={(e) => { e.stopPropagation(); handleOpenModal(tool); }} className="p-1.5 text-workspace-muted hover:text-workspace-accent"><Pencil size={12} /></button>
                <button onClick={(e) => { e.stopPropagation(); setItemToDelete({ id: tool.id, title: tool.title, isFolder: !!tool.isFolder }); }} className="p-1.5 text-workspace-muted hover:text-red-500"><Trash2 size={12} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-workspace-surface w-full max-w-md border border-workspace-border rounded-sm shadow-2xl p-8 border-l-4 border-l-workspace-accent">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-workspace-accent mb-8">{editingToolId ? 'Modificar Registro' : 'Novo Recurso'}</h2>
            <div className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[8px] font-black uppercase text-workspace-muted tracking-widest">Identificação</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full" placeholder="Ex: Monitoramento AWS" />
              </div>
              {!formData.isFolder && (
                <div className="space-y-1.5">
                  <label className="text-[8px] font-black uppercase text-workspace-muted tracking-widest">Endereço (URL)</label>
                  <input type="text" value={formData.url} onChange={(e) => setFormData({...formData, url: e.target.value})} className="w-full" placeholder="https://..." />
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-[8px] font-black uppercase text-workspace-muted tracking-widest">Memorial Descritivo</label>
                <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full min-h-[80px] resize-none" placeholder="Opcional" />
              </div>
            </div>
            <div className="mt-10 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="text-[9px] font-black uppercase text-workspace-muted hover:text-white">Abortar</button>
              <button onClick={handleSave} className="glow-button-solid px-8 py-2.5 bg-workspace-accent text-black text-[9px] font-black uppercase tracking-widest rounded-sm">Validar</button>
            </div>
          </div>
        </div>
      )}

      {itemToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-lg p-4 animate-fade-in">
            <div className="bg-workspace-surface border border-workspace-border rounded-sm p-8 max-w-sm w-full shadow-2xl border-l-4 border-l-red-600">
                <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-red-600/10 rounded-full flex items-center justify-center mb-6 text-red-600"><AlertTriangle size={24} /></div>
                    <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-4">Eliminar {itemToDelete.isFolder ? 'Diretório' : 'Recurso'}</h3>
                    <p className="text-[10px] text-workspace-muted font-medium mb-8 uppercase leading-relaxed opacity-60">Confirma a exclusão de "{itemToDelete.title}"? Esta operação é irreversível.</p>
                    <div className="flex gap-4 w-full">
                        <button onClick={() => setItemToDelete(null)} className="flex-1 text-[9px] font-black uppercase text-workspace-muted hover:text-white">Abortar</button>
                        <button onClick={confirmDelete} className="glow-button-solid flex-1 py-3 bg-red-600 text-white text-[9px] font-black uppercase tracking-widest rounded-sm">Confirmar Exclusão</button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Tools;
