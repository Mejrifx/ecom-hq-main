import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Plus, Search, Trash2, FileText, Check, HelpCircle, Bold, Italic, Heading1, Heading2, Heading3, List, Edit, Save, Table } from 'lucide-react';
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
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [localContent, setLocalContent] = useState('');
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Sync local content with selected note
  useEffect(() => {
    if (selectedNote) {
      setLocalContent(selectedNote.content);
      setIsEditing(false); // Reset edit mode when switching notes
    }
  }, [selectedNote?.id]);

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

  // Debounced update to sync local content to note
  const syncContentToNote = (content: string) => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    updateTimeoutRef.current = setTimeout(() => {
      handleUpdateNote({ content });
    }, 300);
  };

  // Save and exit edit mode
  const handleSave = () => {
    if (selectedNote) {
      handleUpdateNote({ content: localContent });
      setIsEditing(false);
    }
  };

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
    const selectedText = localContent.substring(start, end);
    const textBefore = localContent.substring(0, start);
    const textAfter = localContent.substring(end);

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

    setLocalContent(newText);
    syncContentToNote(newText);
    
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
    let html = text;
    
    // Tables (must be processed before other replacements)
    html = html.replace(/\|(.+)\|/g, (match, content) => {
      // Check if this is part of a table (has multiple rows with |)
      const lines = html.split('\n');
      const currentLineIndex = lines.findIndex(line => line.includes(match));
      if (currentLineIndex === -1) return match;
      
      // Check if next line is a separator (contains ---)
      const nextLine = lines[currentLineIndex + 1];
      if (nextLine && /^\|[\s\-:]+\|/.test(nextLine)) {
        // This is a table - process all table rows
        let tableHtml = '<table class="min-w-full border-collapse border border-border my-4"><thead><tr>';
        let inTable = false;
        let isHeader = true;
        let rows: string[] = [];
        
        for (let i = currentLineIndex; i < lines.length; i++) {
          const line = lines[i];
          if (!line.includes('|')) break;
          
          if (/^\|[\s\-:]+\|/.test(line)) {
            // Separator row - close header, start body
            if (isHeader) {
              tableHtml += '</tr></thead><tbody>';
              isHeader = false;
            }
            continue;
          }
          
          const cells = line.split('|').filter(cell => cell.trim() !== '');
          if (cells.length === 0) break;
          
          if (isHeader) {
            cells.forEach(cell => {
              tableHtml += `<th class="border border-border px-4 py-2 text-left font-semibold bg-muted/50">${cell.trim()}</th>`;
            });
          } else {
            if (!inTable) {
              tableHtml += '<tbody>';
              inTable = true;
            }
            tableHtml += '<tr>';
            cells.forEach(cell => {
              tableHtml += `<td class="border border-border px-4 py-2">${cell.trim()}</td>`;
            });
            tableHtml += '</tr>';
          }
        }
        
        if (inTable) tableHtml += '</tbody>';
        tableHtml += '</table>';
        
        // Replace all table lines with the HTML
        let tableEnd = currentLineIndex;
        for (let i = currentLineIndex; i < lines.length; i++) {
          if (!lines[i].includes('|') || lines[i].trim() === '') {
            tableEnd = i;
            break;
          }
        }
        
        return tableHtml;
      }
      return match;
    });
    
    // Process tables more reliably
    const tableRegex = /(\|.+\|\n\|[\s\-:]+\|\n(?:\|.+\|\n?)+)/g;
    html = html.replace(tableRegex, (tableMatch) => {
      const rows = tableMatch.trim().split('\n').filter(row => row.trim() && !/^\|[\s\-:]+\|$/.test(row));
      if (rows.length === 0) return tableMatch;
      
      const headerRow = rows[0];
      const headerCells = headerRow.split('|').filter(cell => cell.trim() !== '').map(cell => cell.trim());
      
      let tableHtml = '<div class="overflow-x-auto my-4"><table class="min-w-full border-collapse border border-border"><thead><tr>';
      headerCells.forEach(cell => {
        tableHtml += `<th class="border border-border px-4 py-2 text-left font-semibold bg-muted/50">${cell}</th>`;
      });
      tableHtml += '</tr></thead><tbody>';
      
      for (let i = 1; i < rows.length; i++) {
        const cells = rows[i].split('|').filter(cell => cell.trim() !== '').map(cell => cell.trim());
        tableHtml += '<tr>';
        cells.forEach(cell => {
          tableHtml += `<td class="border border-border px-4 py-2">${cell}</td>`;
        });
        tableHtml += '</tr>';
      }
      
      tableHtml += '</tbody></table></div>';
      return tableHtml;
    });
    
    // Headings
    html = html.replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2 class="text-xl font-semibold mt-4 mb-2">$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>');
    
    // Bold and italic
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    
    // Lists
    html = html.replace(/^- (.+)$/gm, '<li class="ml-4">$1</li>');
    html = html.replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4">$1. $2</li>');
    
    // Line breaks
    html = html.replace(/\n/g, '<br />');
    
    return html;
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
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn-icon text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    title="Edit note"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleSave}
                    className="btn-icon text-primary hover:text-primary hover:bg-primary/10"
                    title="Save and exit edit mode"
                  >
                    <Save className="w-4 h-4" />
                  </button>
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
                        <div>
                          <code className="text-xs bg-muted px-1.5 py-0.5 rounded">| Col 1 | Col 2 |</code>
                          <p className="text-muted-foreground text-xs mt-1">Table (use toolbar button)</p>
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
              <div className="max-w-3xl mx-auto">
                {isEditing ? (
                  /* Edit Mode - Show Editor */
                  <div className="space-y-4">
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
                            const lineStart = localContent.lastIndexOf('\n', start - 1) + 1;
                            const before = localContent.substring(0, lineStart);
                            const after = localContent.substring(lineStart);
                            const newContent = before + '# ' + after;
                            setLocalContent(newContent);
                            syncContentToNote(newContent);
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
                            const lineStart = localContent.lastIndexOf('\n', start - 1) + 1;
                            const before = localContent.substring(0, lineStart);
                            const after = localContent.substring(lineStart);
                            const newContent = before + '## ' + after;
                            setLocalContent(newContent);
                            syncContentToNote(newContent);
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
                            const lineStart = localContent.lastIndexOf('\n', start - 1) + 1;
                            const before = localContent.substring(0, lineStart);
                            const after = localContent.substring(lineStart);
                            const newContent = before + '### ' + after;
                            setLocalContent(newContent);
                            syncContentToNote(newContent);
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
                          const lineStart = localContent.lastIndexOf('\n', start - 1) + 1;
                          const before = localContent.substring(0, lineStart);
                          const after = localContent.substring(lineStart);
                          const newContent = before + '- ' + after;
                          setLocalContent(newContent);
                          syncContentToNote(newContent);
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
                      <div className="w-px h-4 bg-border mx-0.5" />
                      <button
                        type="button"
                        onClick={() => {
                          const textarea = textareaRef.current;
                          if (!textarea) return;
                          const start = textarea.selectionStart;
                          const lineStart = localContent.lastIndexOf('\n', start - 1) + 1;
                          const before = localContent.substring(0, lineStart);
                          const after = localContent.substring(lineStart);
                          
                          // Insert a cleaner 3-column table template
                          const tableTemplate = `| Header 1 | Header 2 | Header 3 |
| --- | --- | --- |
| Cell 1 | Cell 2 | Cell 3 |
| Cell 4 | Cell 5 | Cell 6 |
`;
                          const newContent = before + (lineStart === 0 ? '' : '\n') + tableTemplate + after;
                          setLocalContent(newContent);
                          syncContentToNote(newContent);
                          setTimeout(() => {
                            if (textareaRef.current) {
                              // Position cursor in first cell of first data row
                              const cursorPos = lineStart + (lineStart === 0 ? 0 : 1) + tableTemplate.indexOf('Cell 1') + 6;
                              textareaRef.current.focus();
                              textareaRef.current.setSelectionRange(cursorPos, cursorPos);
                            }
                          }, 0);
                        }}
                        className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
                        title="Insert Table"
                      >
                        <Table className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const textarea = textareaRef.current;
                          if (!textarea) return;
                          const start = textarea.selectionStart;
                          const content = localContent;
                          
                          // Find the current line
                          const lineStart = content.lastIndexOf('\n', start - 1) + 1;
                          const lineEnd = content.indexOf('\n', start);
                          const currentLine = content.substring(lineStart, lineEnd === -1 ? content.length : lineEnd);
                          
                          // Check if we're in a table row (starts with |)
                          if (currentLine.trim().startsWith('|') && !currentLine.includes('---')) {
                            // We're in a table row, add a new row below
                            const before = content.substring(0, lineEnd === -1 ? content.length : lineEnd);
                            const after = content.substring(lineEnd === -1 ? content.length : lineEnd);
                            
                            // Count columns in current row
                            const columns = currentLine.split('|').filter(c => c.trim() !== '').length;
                            const newRow = '|' + ' Cell |'.repeat(columns);
                            
                            const newContent = before + '\n' + newRow + (after ? '\n' + after : '');
                            setLocalContent(newContent);
                            syncContentToNote(newContent);
                            
                            setTimeout(() => {
                              if (textareaRef.current) {
                                const newCursorPos = before.length + 1 + newRow.indexOf('Cell') + 5;
                                textareaRef.current.focus();
                                textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
                              }
                            }, 0);
                          }
                        }}
                        className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors text-xs"
                        title="Add Row (when cursor is in a table)"
                      >
                        + Row
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const textarea = textareaRef.current;
                          if (!textarea) return;
                          const start = textarea.selectionStart;
                          const content = localContent;
                          
                          // Find all table rows
                          const lines = content.split('\n');
                          let tableStart = -1;
                          let tableEnd = -1;
                          
                          // Find the table we're in
                          for (let i = 0; i < lines.length; i++) {
                            const line = lines[i];
                            if (line.trim().startsWith('|') && !line.includes('---')) {
                              if (tableStart === -1) tableStart = i;
                              tableEnd = i;
                            } else if (tableStart !== -1 && !line.trim().startsWith('|')) {
                              break;
                            }
                          }
                          
                          if (tableStart !== -1 && tableEnd !== -1) {
                            // Add a column to all rows
                            const newLines = lines.map((line, index) => {
                              if (index >= tableStart && index <= tableEnd && line.trim().startsWith('|')) {
                                if (line.includes('---')) {
                                  return line + ' --- |';
                                }
                                return line + ' Cell |';
                              }
                              return line;
                            });
                            
                            const newContent = newLines.join('\n');
                            setLocalContent(newContent);
                            syncContentToNote(newContent);
                            
                            setTimeout(() => {
                              if (textareaRef.current) {
                                textareaRef.current.focus();
                                // Keep cursor in same position
                                textareaRef.current.setSelectionRange(start, start);
                              }
                            }, 0);
                          }
                        }}
                        className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors text-xs"
                        title="Add Column (when cursor is in a table)"
                      >
                        + Col
                      </button>
                    </div>
                    </div>
                    <textarea
                      ref={textareaRef}
                      value={localContent}
                      onChange={e => {
                        const newValue = e.target.value;
                        setLocalContent(newValue);
                        syncContentToNote(newValue);
                      }}
                      placeholder="Start writing... (supports markdown)"
                      className="input-base min-h-[400px] resize-y font-mono text-sm"
                      autoFocus
                    />
                  </div>
                ) : (
                  /* Preview Mode - Show Rendered Content */
                  <div>
                    {localContent ? (
                      <div
                        className="prose prose-sm max-w-none p-6 rounded-lg bg-card border border-border text-foreground"
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(localContent) }}
                      />
                    ) : (
                      <div className="p-6 text-center text-muted-foreground">
                        <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No content yet. Click Edit to start writing.</p>
                      </div>
                    )}
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
