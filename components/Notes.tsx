
import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Bold, 
  Italic, 
  Underline, 
  Link as LinkIcon, 
  Image as ImageIcon, 
  Search,
  PenLine,
  StickyNote,
  Check,
  X,
  ExternalLink,
  Unlink,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Loader2,
  AlertCircle,
  WifiOff
} from 'lucide-react';
import { Note } from '../types';
import { supabase } from '../lib/supabaseClient';

// --- Mapeamento de Colunas (De/Para) ---

const toSupabase = (note: Partial<Note>) => ({
  titulo: note.title,
  conteudo: note.content,
});

const toFrontend = (data: any): Note => ({
  id: data.id,
  title: data.titulo || 'Sem Título',
  content: data.conteudo || '',
  createdAt: new Date(data.criado_em),
  updatedAt: new Date(data.atualizado_em)
});

const formatError = (error: any) => {
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    return 'Erro de conexão: Não foi possível alcançar o servidor.';
  }
  return error?.message || 'Erro desconhecido';
};

interface ToolButtonProps {
  icon: React.ElementType;
  onClick: () => void;
  label: string;
}

const ToolButton: React.FC<ToolButtonProps> = ({ icon: Icon, onClick, label }) => (
  <button 
    onClick={onClick} 
    className="p-1.5 text-workspace-muted hover:text-workspace-text hover:bg-workspace-surface rounded-md transition-colors focus:outline-none"
    title={label}
  >
    <Icon className="w-4 h-4 stroke-[1.5]" />
  </button>
);

const Notes: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkValue, setLinkValue] = useState('');
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);

  const contentEditableRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectionRange = useRef<Range | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeNote = notes.find(n => n.id === activeNoteId);

  const fetchNotes = async () => {
    setIsSyncing(true);
    setErrorStatus(null);
    try {
      const { data, error } = await supabase
        .from('notas')
        .select('*');
      
      if (error) throw error;
      
      if (data && Array.isArray(data)) {
        const mappedNotes = data.map(toFrontend).sort((a, b) => 
          b.updatedAt.getTime() - a.updatedAt.getTime()
        );
        setNotes(mappedNotes);
      }
    } catch (e) {
      console.error('[SUPABASE] Erro ao buscar:', e);
      setErrorStatus(formatError(e));
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(() => {
    setShowLinkInput(false);
    setLinkValue('');
    setSelectedElement(null);
    
    if (contentEditableRef.current && activeNote) {
      if (contentEditableRef.current.innerHTML !== activeNote.content) {
        contentEditableRef.current.innerHTML = activeNote.content;
      }
    }
  }, [activeNoteId]);

  const handleCreateNote = async () => {
    const tempId = `temp-${Date.now()}`;
    const newNote: Note = {
      id: tempId,
      title: 'Nova Nota',
      content: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setNotes(prev => [newNote, ...prev]);
    setActiveNoteId(tempId);
    setErrorStatus(null);

    try {
      const { data, error } = await supabase
        .from('notas')
        .insert([{ titulo: 'Nova Nota', conteudo: '' }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const realNote = toFrontend(data);
        setNotes(current => current.map(n => n.id === tempId ? realNote : n));
        setActiveNoteId(realNote.id);
      }
    } catch (e) {
      console.error('[SUPABASE] Erro ao criar:', e);
      setNotes(prev => prev.filter(n => n.id !== tempId));
      if (activeNoteId === tempId) setActiveNoteId(null);
      setErrorStatus(formatError(e));
    }
  };

  const handleDeleteNote = async (id: string) => {
    const noteRemovida = notes.find(n => n.id === id);
    const newNotes = notes.filter(n => n.id !== id);
    setNotes(newNotes);
    if (activeNoteId === id) {
      setActiveNoteId(newNotes.length > 0 ? newNotes[0].id : null);
    }
    if (id.startsWith('temp-')) return;
    try {
      const { error } = await supabase.from('notas').delete().eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error('[SUPABASE] Erro ao excluir:', error);
      setNotes(prev => noteRemovida ? [noteRemovida, ...prev] : prev);
      if (activeNoteId === id) setActiveNoteId(id);
      setErrorStatus(formatError(error));
    }
  };

  const updateActiveNote = (updates: Partial<Note>) => {
    if (!activeNoteId) return;
    const updatedNotes = notes.map(note => 
      note.id === activeNoteId 
        ? { ...note, ...updates, updatedAt: new Date() } 
        : note
    );
    setNotes(updatedNotes);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      if (activeNoteId.startsWith('temp-')) return;
      setIsSyncing(true);
      try {
        const noteToUpdate = updatedNotes.find(n => n.id === activeNoteId);
        if (noteToUpdate) {
            const { error } = await supabase
                .from('notas')
                .update(toSupabase(noteToUpdate))
                .eq('id', activeNoteId);
            if (error) throw error;
        }
      } catch (error) {
        console.error('[SUPABASE] Erro ao atualizar:', error);
      } finally {
        setIsSyncing(false);
      }
    }, 1000);
  };

  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      let node = selection.anchorNode;
      const editor = contentEditableRef.current;
      let isInside = false;
      while (node) {
        if (node === editor) { isInside = true; break; }
        node = node.parentNode;
      }
      if (isInside) selectionRange.current = selection.getRangeAt(0);
    }
  };

  const restoreSelection = () => {
    if (selectionRange.current) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(selectionRange.current);
      }
    } else if (contentEditableRef.current) {
        contentEditableRef.current.focus();
    }
  };

  const execCommand = (command: string, value: string | undefined = undefined) => {
    restoreSelection();
    document.execCommand(command, false, value);
    if (contentEditableRef.current) updateActiveNote({ content: contentEditableRef.current.innerHTML });
  };

  const handleFormat = (command: string) => { saveSelection(); execCommand(command); };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showLinkInput) {
        if (e.key === 'Enter') { e.preventDefault(); confirmLinkInput(); }
        if (e.key === 'Escape') { e.preventDefault(); cancelLinkInput(); }
    } else {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          if (document.activeElement !== contentEditableRef.current) {
              contentEditableRef.current?.focus();
          }
        }
    }
  };

  const startLinkInput = () => { saveSelection(); setShowLinkInput(true); setLinkValue(''); };
  const cancelLinkInput = () => { setShowLinkInput(false); setLinkValue(''); restoreSelection(); };
  const confirmLinkInput = () => {
    if (!linkValue) { cancelLinkInput(); return; }
    restoreSelection();
    execCommand('createLink', linkValue);
    setShowLinkInput(false); setLinkValue('');
  };

  const handleOpenLink = () => {
    if (selectedElement && selectedElement.tagName === 'A') {
      window.open((selectedElement as HTMLAnchorElement).href, '_blank');
    }
  };

  const handleUnlink = () => {
    if (selectedElement && selectedElement.tagName === 'A') {
      const range = document.createRange();
      range.selectNode(selectedElement);
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
        execCommand('unlink');
        setSelectedElement(null);
      }
    }
  };

  const handleImageClick = () => { saveSelection(); fileInputRef.current?.click(); };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            restoreSelection();
            if (ev.target?.result) execCommand('insertImage', ev.target.result as string);
        };
        reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleEditorClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'IMG') { setSelectedElement(target); return; }
    const anchor = target.closest('a');
    if (anchor) { setSelectedElement(anchor); return; }
    if (!showLinkInput) setSelectedElement(null);
  };

  const filteredNotes = notes.filter(note => 
    (note.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (note.content || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-full w-full bg-workspace-main animate-fade-in overflow-hidden">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

      {/* Sidebar */}
      <div className="w-80 border-r border-workspace-border flex flex-col bg-workspace-main shrink-0">
        <div className="p-4 border-b border-workspace-border space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-workspace-text tracking-[0.2em] uppercase flex items-center gap-2">
              Notas
              {isSyncing && <Loader2 className="w-3 h-3 animate-spin text-workspace-accent" />}
            </h2>
            <button onClick={handleCreateNote} className="p-2 bg-workspace-accent hover:opacity-90 text-white rounded-md transition-all shadow-sm">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="relative group">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-workspace-muted group-focus-within:text-workspace-accent transition-colors" />
            <input 
              type="text" placeholder="Procurar..." value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-workspace-surface border border-workspace-border rounded-lg pl-9 pr-3 py-2 text-[11px] text-workspace-text placeholder-workspace-muted/60 focus:outline-none focus:border-workspace-accent transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {errorStatus && (
            <div className="m-4 p-3 bg-red-500/5 border border-red-500/20 rounded-lg flex items-start gap-3">
              <WifiOff className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Erro de Conexão</span>
                <span className="text-[10px] text-red-500/80 leading-tight mt-1">{errorStatus}</span>
                <button onClick={fetchNotes} className="mt-2 text-[10px] font-bold text-red-500 uppercase underline text-left">Tentar novamente</button>
              </div>
            </div>
          )}

          {filteredNotes.length === 0 && !errorStatus ? (
             <div className="flex flex-col items-center justify-center h-40 text-workspace-muted opacity-30">
                <PenLine className="w-10 h-10 mb-2 stroke-[1]" />
                <span className="text-[10px] uppercase font-bold tracking-widest">Sem registros</span>
             </div>
          ) : (
            filteredNotes.map(note => (
              <div key={note.id} className={`group relative border-b border-workspace-border transition-all duration-200 border-l-2 ${activeNoteId === note.id ? 'bg-workspace-surface border-l-workspace-accent' : 'bg-transparent border-l-transparent hover:bg-workspace-surface/50'}`}>
                <div onClick={() => setActiveNoteId(note.id)} className="p-4 cursor-pointer w-full select-none">
                    <h3 className={`text-xs font-bold truncate pr-8 mb-1 uppercase tracking-wider ${activeNoteId === note.id ? 'text-workspace-text' : 'text-workspace-text/80'}`}>{note.title || 'Sem Título'}</h3>
                    <div className="text-[11px] text-workspace-muted line-clamp-1 h-4 overflow-hidden font-medium opacity-60" dangerouslySetInnerHTML={{ __html: (note.content || '').replace(/<[^>]+>/g, ' ') || 'Vazio' }} />
                    <div className="flex items-center justify-between mt-3">
                        <span className="text-[9px] text-workspace-muted font-bold uppercase tracking-widest opacity-40">
                            {note.updatedAt instanceof Date && !isNaN(note.updatedAt.getTime()) ? note.updatedAt.toLocaleDateString('pt-BR') : '--'}
                        </span>
                    </div>
                </div>
                <button 
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeleteNote(note.id); }}
                  className="absolute top-4 right-4 z-10 p-1.5 rounded-md text-workspace-muted hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Editor */}
      {activeNote ? (
        <div className="flex-1 flex flex-col h-full bg-workspace-surface/30 relative">
          <div className="h-12 border-b border-workspace-border flex items-center px-6 gap-2 bg-workspace-main shrink-0 overflow-hidden relative shadow-sm z-10">
             {showLinkInput ? (
               <div className="flex items-center gap-2 w-full animate-fade-in">
                 <span className="text-[10px] font-bold text-workspace-muted uppercase tracking-widest min-w-[60px]">URL:</span>
                 <input autoFocus type="text" value={linkValue} onChange={(e) => setLinkValue(e.target.value)} onKeyDown={handleKeyDown} placeholder="https://..." className="flex-1 bg-workspace-surface border border-workspace-border rounded px-2 py-1 text-xs focus:border-workspace-accent focus:outline-none" />
                 <button onClick={confirmLinkInput} className="p-1 text-emerald-500 hover:bg-workspace-surface rounded"><Check className="w-4 h-4" /></button>
                 <button onClick={cancelLinkInput} className="p-1 text-red-500 hover:bg-workspace-surface rounded"><X className="w-4 h-4" /></button>
               </div>
             ) : selectedElement?.tagName === 'A' ? (
                <div className="flex items-center gap-3 w-full animate-fade-in">
                    <span className="text-[10px] font-bold text-workspace-accent uppercase tracking-widest flex items-center gap-2 border-r border-workspace-border pr-3 mr-1"><LinkIcon className="w-3.5 h-3.5" /> Link</span>
                    <button onClick={handleOpenLink} className="flex items-center gap-2 px-3 py-1 bg-workspace-accent text-white text-[10px] font-bold rounded shadow-sm ml-auto uppercase">Abrir</button>
                    <button onClick={handleUnlink} className="flex items-center gap-2 px-3 py-1 border border-workspace-border text-workspace-text text-[10px] font-bold rounded uppercase">Remover</button>
                    <button onClick={() => setSelectedElement(null)} className="p-1 text-workspace-muted"><X className="w-4 h-4" /></button>
                </div>
             ) : (
               <>
                 <ToolButton icon={Bold} onClick={() => handleFormat('bold')} label="Negrito" />
                 <ToolButton icon={Italic} onClick={() => handleFormat('italic')} label="Itálico" />
                 <ToolButton icon={Underline} onClick={() => handleFormat('underline')} label="Sublinhado" />
                 <div className="w-[1px] h-4 bg-workspace-border mx-2" />
                 <ToolButton icon={LinkIcon} onClick={startLinkInput} label="Link" />
                 <ToolButton icon={ImageIcon} onClick={handleImageClick} label="Imagem" />
               </>
             )}
          </div>
          <div className="px-10 pt-10 pb-4">
            <input type="text" value={activeNote.title} onChange={(e) => updateActiveNote({ title: e.target.value })} className="w-full text-2xl font-semibold text-workspace-text bg-transparent border-none outline-none placeholder-workspace-muted/30 uppercase tracking-tight" placeholder="Título" />
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar px-10 pb-12 cursor-text" onClick={() => { if (!showLinkInput && !selectedElement) contentEditableRef.current?.focus(); }}>
            <div ref={contentEditableRef} className="w-full h-full outline-none text-workspace-text text-sm leading-relaxed font-normal prose prose-zinc dark:prose-invert max-w-none border-l-2 border-transparent focus:border-l-workspace-accent/30 transition-colors pl-6" contentEditable onInput={(e) => updateActiveNote({ content: e.currentTarget.innerHTML })} onKeyDown={handleKeyDown} onKeyUp={saveSelection} onMouseUp={saveSelection} onClick={handleEditorClick} suppressContentEditableWarning={true} style={{ minHeight: '50vh' }} />
          </div>
          <div className="px-6 py-2 border-t border-workspace-border text-[9px] text-workspace-muted font-bold uppercase tracking-widest flex justify-between items-center bg-workspace-main">
              <div className="flex gap-4">
                <span>{(activeNote.content || '').replace(/<[^]*>/g, '').length} Caracteres</span>
                {isSyncing ? <span className="text-workspace-accent animate-pulse">Sincronizando...</span> : <span>Salvo</span>}
              </div>
              <span>Status: Ativo</span>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-workspace-muted bg-workspace-surface/10 opacity-20">
          <StickyNote className="w-16 h-16 mb-4 stroke-[1]" />
          <p className="text-[11px] font-bold uppercase tracking-[0.3em]">Selecione uma nota</p>
        </div>
      )}
    </div>
  );
};

export default Notes;
