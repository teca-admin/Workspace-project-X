
import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, Search, Bold, Italic, Underline, Link as LinkIcon, StickyNote, GripVertical, Trash2
} from 'lucide-react';
import { Note } from '../types';
import { supabase } from '../lib/supabaseClient';

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

const ToolButton: React.FC<{ icon: React.ElementType; onClick: () => void; label: string }> = ({ icon: Icon, onClick, label }) => (
  <button 
    onClick={onClick} 
    className="p-1.5 text-workspace-muted hover:text-workspace-accent transition-colors focus:outline-none"
    title={label}
  >
    <Icon size={14} />
  </button>
);

const Notes: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

  const contentEditableRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchNotes = async () => {
    setIsSyncing(true);
    try {
      const { data, error } = await supabase.from('notas').select('*');
      if (error) throw error;
      if (data) {
        setNotes(data.map(toFrontend).sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => { fetchNotes(); }, []);

  const activeNote = notes.find(n => n.id === activeNoteId);

  useEffect(() => {
    if (contentEditableRef.current && activeNote) {
      if (contentEditableRef.current.innerHTML !== activeNote.content) {
        contentEditableRef.current.innerHTML = activeNote.content;
      }
    }
  }, [activeNoteId]);

  const handleCreateNote = async () => {
    const { data } = await supabase.from('notas').insert([{ titulo: 'Nova Nota', conteudo: '' }]).select().single();
    if (data) {
      const realNote = toFrontend(data);
      setNotes([realNote, ...notes]);
      setActiveNoteId(realNote.id);
    }
  };

  const updateActiveNote = (updates: Partial<Note>) => {
    if (!activeNoteId) return;
    const updatedNotes = notes.map(n => n.id === activeNoteId ? { ...n, ...updates, updatedAt: new Date() } : n);
    setNotes(updatedNotes);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      const noteToUpdate = updatedNotes.find(n => n.id === activeNoteId);
      if (noteToUpdate) await supabase.from('notas').update(toSupabase(noteToUpdate)).eq('id', activeNoteId);
    }, 1000);
  };

  const handleDeleteNote = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Deseja excluir esta nota?')) return;
    
    setNotes(notes.filter(n => n.id !== id));
    if (activeNoteId === id) setActiveNoteId(null);
    
    await supabase.from('notas').delete().eq('id', id);
  };

  const execCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    if (contentEditableRef.current) updateActiveNote({ content: contentEditableRef.current.innerHTML });
  };

  const handleDragStart = (index: number) => {
    setDraggedItemIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === index) return;

    const newNotes = [...notes];
    const item = newNotes[draggedItemIndex];
    newNotes.splice(draggedItemIndex, 1);
    newNotes.splice(index, 0, item);
    
    setDraggedItemIndex(index);
    setNotes(newNotes);
  };

  const handleDragEnd = () => {
    setDraggedItemIndex(null);
  };

  const filteredNotes = notes.filter(n => (n.title || '').toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex h-full w-full bg-workspace-main animate-fade-in overflow-hidden">
      <div className="w-80 border-r border-workspace-border flex flex-col bg-workspace-surface shrink-0">
        <div className="p-4 border-b border-workspace-border space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[10px] font-black text-workspace-text uppercase tracking-[0.2em]">Memórias</h2>
            <button onClick={handleCreateNote} className="glow-button-solid p-2 rounded-sm shadow-lg">
              <Plus size={14} />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-workspace-muted" />
            <input 
              type="text" 
              placeholder="LOCALIZAR..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="w-full pl-10 pr-4 py-2 text-[10px] uppercase font-bold text-workspace-text placeholder-workspace-muted/30 outline-none" 
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredNotes.map((note, index) => (
            <div 
              key={note.id} 
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              onClick={() => setActiveNoteId(note.id)} 
              className={`
                group relative flex items-center gap-2 p-5 cursor-pointer border-l-4 border-y-0 border-r-0 transition-all
                ${activeNoteId === note.id ? 'border-l-workspace-accent bg-workspace-accent/5' : 'border-l-transparent hover:bg-workspace-main/50'}
                ${draggedItemIndex === index ? 'opacity-30' : 'opacity-100'}
              `}
            >
              <div className="cursor-grab active:cursor-grabbing text-workspace-muted opacity-0 group-hover:opacity-100 transition-opacity p-1 -ml-2">
                <GripVertical size={14} />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-[10px] font-black text-workspace-text uppercase tracking-wider mb-1 truncate">
                  {note.title || 'Sem Título'}
                </h3>
                <div 
                  className="text-[9px] text-workspace-muted font-medium line-clamp-1 opacity-50 tracking-tighter" 
                  dangerouslySetInnerHTML={{ __html: (note.content || '').replace(/<[^>]+>/g, '') || 'ENTRADA VAZIA' }} 
                />
              </div>

              <button 
                onClick={(e) => handleDeleteNote(note.id, e)}
                className="opacity-0 group-hover:opacity-100 p-2 text-workspace-muted hover:text-red-500 transition-all"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-workspace-main relative">
        {activeNote ? (
          <>
            <div className="h-12 border-b border-workspace-border flex items-center px-6 gap-2 bg-workspace-surface shrink-0">
              <ToolButton icon={Bold} onClick={() => execCommand('bold')} label="Negrito" />
              <ToolButton icon={Italic} onClick={() => execCommand('italic')} label="Itálico" />
              <ToolButton icon={Underline} onClick={() => execCommand('underline')} label="Sublinhado" />
              <div className="w-[1px] h-4 bg-workspace-border mx-2" />
              <ToolButton icon={LinkIcon} onClick={() => execCommand('createLink', prompt('URL:') || '')} label="Link" />
            </div>
            <div className="p-10 pb-0">
              <input 
                type="text" 
                value={activeNote.title} 
                onChange={(e) => updateActiveNote({ title: e.target.value })} 
                className="w-full text-xl font-black text-workspace-text bg-transparent border-none outline-none placeholder-workspace-muted/20 tracking-[0.05em]" 
                placeholder="Identificação da Nota" 
              />
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-10">
              <div 
                ref={contentEditableRef} 
                className="w-full h-full outline-none text-workspace-text text-[11px] font-medium leading-relaxed border-l border-workspace-border/50 pl-6 focus:border-workspace-accent/40 transition-all whitespace-pre-wrap" 
                contentEditable 
                onInput={(e) => updateActiveNote({ content: e.currentTarget.innerHTML })} 
                style={{ minHeight: '50vh' }} 
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center opacity-10">
            <StickyNote size={64} className="mb-4 text-workspace-text" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-workspace-text">Nenhuma Seleção</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notes;
