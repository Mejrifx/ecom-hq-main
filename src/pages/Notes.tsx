import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Plus, Search, Trash2, FileText, Check, HelpCircle, Bold, Italic, Heading1, Heading2, Heading3, List } from 'lucide-react';
import { useData } from '../contexts/FakeDataContext';
import { Note } from '../types';
import { Modal } from '../components/Modal';
import { Popover, PopoverTrigger, PopoverContent } from '../components/ui/popover';

export function Notes() {
  const { state, dispatch, addActivity } = useData();
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [saveIndicator, setSaveIndicator] = useState(false);
  const [hintOpen, setHintOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const cursorPositionRef = useRef<number | null>(null);

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

  // Restore cursor position after content updates
  useEffect(() => {
    if (cursorPositionRef.current !== null && textareaRef.current) {
      const pos = cursorPositionRef.current;
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(pos, pos);
      cursorPositionRef.current = null;
    }
  }, [selectedNote?.content]);

  const handleDeleteNote = () => {
    if (!selectedNote) return;
    dispatch({ type: 'DELETE_NOTE', payload: selectedNote.id });
    addActivity('deleted', 'note', selectedNote.title);
    setSelectedNoteId(null);
    setDeleteModalOpen(false);
  };

  // Insert markdown formatting at cursor position or wrap selected text
  const insertMarkdown = (before: string, after: string = '', placeholder: string = 'text') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const textBefore = textarea.value.substring(0, start);
    const textAfter = textarea.value.substring(end);

    let newText: string;
    let newCursorPos: number;

    if (selectedText) {
      // Wrap selected text
      newText = textBefore + before + selectedText + after + textAfter;
      newCursorPos = start + before.length + selectedText.length + after.length;
    } else {
      // Insert with placeholder
      newText = textBefore + before + placeholder + after + textAfter;
      newCursorPos = start + before.length + placeholder.length + after.length;
    }

    handleUpdateNote({ content: newText });
    
    // Restore cursor position after state update
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
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
                <Popover open={hintOpen} onOpenChange={setHintOpen}>
                  <PopoverTrigger asChild>
                    <button
                      className="btn-icon text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      title="Markdown formatting hints"
                    >
                      <HelpCircle className="w-4 h-4" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80" align="end">
                    <div className="space-y-3">
                      <h3 className="font-semibold text-sm text-foreground mb-3">Markdown Formatting</h3>
                      <div className="space-y-2 text-sm">
                        <div>
                          <code className="text-xs bg-muted px-1.5 py-0.5 rounded"># Heading 1</code>
                          <p className="text-muted-foreground text-xs mt-1">Large heading</p>
                        </div>
                        <div>
                          <code className="text-xs bg-muted px-1.5 py-0.5 rounded">## Heading 2</code>
                          <p className="text-muted-foreground text-xs mt-1">Medium heading</p>
                        </div>
                        <div>
                          <code className="text-xs bg-muted px-1.5 py-0.5 rounded">### Heading 3</code>
                          <p className="text-muted-foreground text-xs mt-1">Small heading</p>
                        </div>
                        <div>
                          <code className="text-xs bg-muted px-1.5 py-0.5 rounded">**bold text**</code>
                          <p className="text-muted-foreground text-xs mt-1">Bold formatting</p>
                        </div>
                        <div>
                          <code className="text-xs bg-muted px-1.5 py-0.5 rounded">*italic text*</code>
                          <p className="text-muted-foreground text-xs mt-1">Italic formatting</p>
                        </div>
                        <div>
                          <code className="text-xs bg-muted px-1.5 py-0.5 rounded">- List item</code>
                          <p className="text-muted-foreground text-xs mt-1">Bullet list</p>
                        </div>
                        <div>
                          <code className="text-xs bg-muted px-1.5 py-0.5 rounded">1. List item</code>
                          <p className="text-muted-foreground text-xs mt-1">Numbered list</p>
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
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
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-muted-foreground">
                      Content (Markdown)
                    </label>
                    {/* Formatting Toolbar */}
                    <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-md">
                      <button
                        type="button"
                        onClick={() => insertMarkdown('**', '**', 'bold text')}
                        className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
                        title="Bold"
                      >
                        <Bold className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown('*', '*', 'italic text')}
                        className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
                        title="Italic"
                      >
                        <Italic className="w-4 h-4" />
                      </button>
                      <div className="w-px h-4 bg-border mx-0.5" />
                      <button
                        type="button"
                        onClick={() => {
                          const textarea = textareaRef.current;
                          if (!textarea) return;
                          const start = textarea.selectionStart;
                          const lineStart = textarea.value.lastIndexOf('\n', start - 1) + 1;
                          const before = textarea.value.substring(0, lineStart);
                          const after = textarea.value.substring(lineStart);
                          handleUpdateNote({ content: before + '# ' + after });
                          setTimeout(() => {
                            if (textareaRef.current) {
                              textareaRef.current.focus();
                              textareaRef.current.setSelectionRange(lineStart + 2, lineStart + 2);
                            }
                          }, 0);
                        }}
                        className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
                        title="Heading 1"
                      >
                        <Heading1 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const textarea = textareaRef.current;
                          if (!textarea) return;
                          const start = textarea.selectionStart;
                          const lineStart = textarea.value.lastIndexOf('\n', start - 1) + 1;
                          const before = textarea.value.substring(0, lineStart);
                          const after = textarea.value.substring(lineStart);
                          handleUpdateNote({ content: before + '## ' + after });
                          setTimeout(() => {
                            if (textareaRef.current) {
                              textareaRef.current.focus();
                              textareaRef.current.setSelectionRange(lineStart + 3, lineStart + 3);
                            }
                          }, 0);
                        }}
                        className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
                        title="Heading 2"
                      >
                        <Heading2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const textarea = textareaRef.current;
                          if (!textarea) return;
                          const start = textarea.selectionStart;
                          const lineStart = textarea.value.lastIndexOf('\n', start - 1) + 1;
                          const before = textarea.value.substring(0, lineStart);
                          const after = textarea.value.substring(lineStart);
                          handleUpdateNote({ content: before + '### ' + after });
                          setTimeout(() => {
                            if (textareaRef.current) {
                              textareaRef.current.focus();
                              textareaRef.current.setSelectionRange(lineStart + 4, lineStart + 4);
                            }
                          }, 0);
                        }}
                        className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
                        title="Heading 3"
                      >
                        <Heading3 className="w-4 h-4" />
                      </button>
                      <div className="w-px h-4 bg-border mx-0.5" />
                      <button
                        type="button"
                        onClick={() => {
                          const textarea = textareaRef.current;
                          if (!textarea) return;
                          const start = textarea.selectionStart;
                          const lineStart = textarea.value.lastIndexOf('\n', start - 1) + 1;
                          const before = textarea.value.substring(0, lineStart);
                          const after = textarea.value.substring(lineStart);
                          handleUpdateNote({ content: before + '- ' + after });
                          setTimeout(() => {
                            if (textareaRef.current) {
                              textareaRef.current.focus();
                              textareaRef.current.setSelectionRange(lineStart + 2, lineStart + 2);
                            }
                          }, 0);
                        }}
                        className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
                        title="Bullet List"
                      >
                        <List className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <textarea
                    ref={textareaRef}
                    value={selectedNote.content}
                    onChange={e => {
                      // Capture cursor position before update
                      const textarea = e.target;
                      const cursorPos = textarea.selectionStart;
                      const newValue = textarea.value;
                      
                      // Calculate new cursor position (adjust if text was inserted/deleted)
                      const oldValue = selectedNote.content;
                      const lengthDiff = newValue.length - oldValue.length;
                      const newCursorPos = cursorPos;
                      
                      // Store cursor position to restore after state update
                      cursorPositionRef.current = newCursorPos;
                      
                      // Update content
                      handleUpdateNote({ content: newValue });
                    }}
                    onSelect={e => {
                      // Track cursor position on selection changes
                      if (textareaRef.current) {
                        cursorPositionRef.current = textareaRef.current.selectionStart;
                      }
                    }}
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
