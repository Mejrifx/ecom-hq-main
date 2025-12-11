import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Trash2, FileText, Check } from 'lucide-react';
import { useData } from '../contexts/FakeDataContext';
import { Note } from '../types';
import { Modal } from '../components/Modal';

export function Notes() {
  const { state, dispatch, addActivity } = useData();
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [saveIndicator, setSaveIndicator] = useState(false);

  // Filter notes by search
  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return state.notes;
    return state.notes.filter(n =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [state.notes, searchQuery]);

  // Get selected note
  const selectedNote = useMemo(() => {
    return state.notes.find(n => n.id === selectedNoteId) || null;
  }, [state.notes, selectedNoteId]);

  // Auto-select first note on mount
  useEffect(() => {
    if (filteredNotes.length > 0 && !selectedNoteId) {
      setSelectedNoteId(filteredNotes[0].id);
    }
  }, [filteredNotes, selectedNoteId]);

  const handleCreateNote = (title: string) => {
    const note: Note = {
      id: crypto.randomUUID(),
      title,
      content: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    dispatch({ type: 'ADD_NOTE', payload: note });
    addActivity('created', 'note', title);
    setSelectedNoteId(note.id);
    setCreateModalOpen(false);
  };

  const handleUpdateNote = (updates: Partial<Note>) => {
    if (!selectedNote) return;
    const updatedNote: Note = {
      ...selectedNote,
      ...updates,
      updatedAt: new Date(),
    };
    dispatch({ type: 'UPDATE_NOTE', payload: updatedNote });
    
    // Fake save indicator
    setSaveIndicator(true);
    setTimeout(() => setSaveIndicator(false), 1500);
  };

  const handleDeleteNote = () => {
    if (!selectedNote) return;
    dispatch({ type: 'DELETE_NOTE', payload: selectedNote.id });
    addActivity('deleted', 'note', selectedNote.title);
    setSelectedNoteId(null);
    setDeleteModalOpen(false);
  };

  // Simple markdown to HTML (basic)
  const renderMarkdown = (text: string): string => {
    return text
      .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="text-xl font-semibold mt-4 mb-2">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/^- (.+)$/gm, '<li class="ml-4">$1</li>')
      .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4">$1. $2</li>')
      .replace(/\n/g, '<br />');
  };

  return (
    <div className="flex h-full">
      {/* Notes List */}
      <div className="w-80 border-r border-border flex flex-col bg-card">
        {/* Search & Create */}
        <div className="p-4 border-b border-border space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="input-base pl-9 text-sm"
            />
          </div>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="btn-primary w-full text-sm"
          >
            <Plus className="w-4 h-4" />
            New Note
          </button>
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto">
          {filteredNotes.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground text-sm">
              {searchQuery ? 'No notes found' : 'No notes yet'}
            </div>
          ) : (
            filteredNotes.map(note => (
              <button
                key={note.id}
                onClick={() => setSelectedNoteId(note.id)}
                className={`w-full text-left p-4 border-b border-border transition-colors ${
                  selectedNoteId === note.id
                    ? 'bg-sidebar-accent'
                    : 'hover:bg-muted/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <FileText className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">{note.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {note.updatedAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col">
        {selectedNote ? (
          <>
            {/* Editor Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <input
                type="text"
                value={selectedNote.title}
                onChange={e => handleUpdateNote({ title: e.target.value })}
                className="text-xl font-semibold bg-transparent border-none focus:outline-none text-foreground flex-1"
              />
              <div className="flex items-center gap-2">
                {saveIndicator && (
                  <span className="text-xs text-primary flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Saved
                  </span>
                )}
                <button
                  onClick={() => setDeleteModalOpen(true)}
                  className="btn-icon text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Editor & Preview */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="max-w-3xl mx-auto space-y-6">
                {/* Editor */}
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Content (Markdown)
                  </label>
                  <textarea
                    value={selectedNote.content}
                    onChange={e => handleUpdateNote({ content: e.target.value })}
                    placeholder="Start writing... (supports markdown)"
                    className="input-base min-h-[200px] resize-y font-mono text-sm"
                  />
                </div>

                {/* Preview */}
                {selectedNote.content && (
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Preview
                    </label>
                    <div
                      className="prose prose-sm max-w-none p-4 rounded-lg bg-muted/50 text-foreground"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(selectedNote.content) }}
                    />
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Select a note or create a new one</p>
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <CreateNoteModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreate={handleCreateNote}
      />

      {/* Delete Confirmation */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Note"
        size="sm"
      >
        <p className="text-muted-foreground mb-4">
          Are you sure you want to delete "{selectedNote?.title}"? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setDeleteModalOpen(false)} className="btn-secondary">
            Cancel
          </button>
          <button onClick={handleDeleteNote} className="btn-primary bg-destructive hover:bg-destructive/90">
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}

interface CreateNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (title: string) => void;
}

function CreateNoteModal({ isOpen, onClose, onCreate }: CreateNoteModalProps) {
  const [title, setTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onCreate(title.trim());
      setTitle('');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Note">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Note title..."
          className="input-base mb-4"
          autoFocus
        />
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={!title.trim()}>
            Create Note
          </button>
        </div>
      </form>
    </Modal>
  );
}
