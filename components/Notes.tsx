
import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, Trash2, Bold, Italic, Underline, Link as LinkIcon, Image as ImageIcon, Search, PenLine, StickyNote, Check, X, Loader2, WifiOff
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
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkValue, setLinkValue] = useState('');

  const contentEditableRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchNotes = async () => {
    setIsSyncing(true);
    try {
      const { data, error } = await supabase.from('notas').select('*');
      if (error) throw error;
      if (data) setNotes(data.map(toFrontend).sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()));
    } catch (e) {
      setErrorStatus(e instanceof Error ? e.message : 'Erro Supabase');
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

  const execCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    if (contentEditableRef.current) updateActiveNote({ content: contentEditableRef.current.innerHTML });
  };

  const filteredNotes = notes.filter(n => (n.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || (n.content || '').toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex h-full w-full bg-workspace-main animate-fade-in overflow-hidden">
      <div className="w-80 border-r border-workspace-border flex flex-col bg-black shrink-0">
        <div className="p-4 border-b border-workspace-border space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Memórias</h2>
            <button onClick={handleCreateNote} className="glow-button-solid p-2 bg-workspace-accent text-black rounded-sm shadow-lg"><Plus size={14} /></button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-workspace-muted" />
            <input type="text" placeholder="Localizar..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 text-[10px] uppercase font-bold text-white placeholder-workspace-muted/30 outline-none" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredNotes.map(note => (
            <div key={note.id} onClick={() => setActiveNoteId(note.id)} className={`glow-item p-5 cursor-pointer border-l-4 transition-all ${activeNoteId === note.id ? 'border-l-workspace-accent bg-workspace-accent/5' : 'border-l-transparent'}`}>
              <h3 className="text-[10px] font-black text-white uppercase tracking-wider mb-2 truncate">{note.title || 'Sem Título'}</h3>
              <div className="text-[9px] text-workspace-muted font-medium line-clamp-1 opacity-50 uppercase tracking-tighter" dangerouslySetInnerHTML={{ __html: (note.content || '').replace(/<[^>]+>/g, '') || 'Entrada vazia' }} />
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-workspace-surface/10 relative">
        {activeNote ? (
          <>
            <div className="h-12 border-b border-workspace-border flex items-center px-6 gap-2 bg-black shrink-0">
              <ToolButton icon={Bold} onClick={() => execCommand('bold')} label="Negrito" />
              <ToolButton icon={Italic} onClick={() => execCommand('italic')} label="Itálico" />
              <ToolButton icon={Underline} onClick={() => execCommand('underline')} label="Sublinhado" />
              <div className="w-[1px] h-4 bg-workspace-border mx-2" />
              <ToolButton icon={LinkIcon} onClick={() => execCommand('createLink', prompt('URL:') || '')} label="Link" />
            </div>
            <div className="p-10 pb-0">
              <input type="text" value={activeNote.title} onChange={(e) => updateActiveNote({ title: e.target.value })} className="w-full text-xl font-black text-white bg-transparent border-none outline-none placeholder-workspace-muted/20 uppercase tracking-[0.1em]" placeholder="Identificação da Nota" />
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-10">
              <div ref={contentEditableRef} className="w-full h-full outline-none text-white text-[11px] uppercase font-medium leading-relaxed border-l border-workspace-border/20 pl-6 focus:border-workspace-accent/40 transition-all" contentEditable onInput={(e) => updateActiveNote({ content: e.currentTarget.innerHTML })} style={{ minHeight: '50vh' }} />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center opacity-10">
            <StickyNote size={64} className="mb-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em]">Nenhuma Seleção</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notes;
