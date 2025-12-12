import React, { useState, useMemo } from 'react';
import { Plus, Search, Trash2, Table as TableIcon, X, PlusCircle } from 'lucide-react';
import { useData } from '../contexts/FakeDataContext';
import { TableData } from '../types';
import { Modal } from '../components/Modal';

export function Tables() {
  const { state, dispatch, addActivity } = useData();
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Filter tables by search
  const filteredTables = useMemo(() => {
    if (!searchQuery.trim()) return state.tables || [];
    return (state.tables || []).filter(t =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [state.tables, searchQuery]);

  // Get selected table
  const selectedTable = useMemo(() => {
    return (state.tables || []).find(t => t.id === selectedTableId) || null;
  }, [state.tables, selectedTableId]);

  // Auto-select first table on mount
  React.useEffect(() => {
    if (filteredTables.length > 0 && !selectedTableId) {
      setSelectedTableId(filteredTables[0].id);
    }
  }, [filteredTables, selectedTableId]);

  const handleCreateTable = (title: string) => {
    const table: TableData = {
      id: crypto.randomUUID(),
      title,
      headers: ['Column 1', 'Column 2', 'Column 3'],
      rows: [
        ['', '', ''],
        ['', '', ''],
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    dispatch({ type: 'ADD_TABLE', payload: table });
    addActivity('created', 'table', title);
    setSelectedTableId(table.id);
    setCreateModalOpen(false);
  };

  const handleUpdateTable = (updates: Partial<TableData>) => {
    if (!selectedTable) return;
    const updatedTable: TableData = {
      ...selectedTable,
      ...updates,
      updatedAt: new Date(),
    };
    dispatch({ type: 'UPDATE_TABLE', payload: updatedTable });
  };

  const handleDeleteTable = () => {
    if (!selectedTable) return;
    dispatch({ type: 'DELETE_TABLE', payload: selectedTable.id });
    addActivity('deleted', 'table', selectedTable.title);
    setSelectedTableId(null);
    setDeleteModalOpen(false);
  };

  const addRow = () => {
    if (!selectedTable) return;
    const newRow = new Array(selectedTable.headers.length).fill('');
    handleUpdateTable({
      rows: [...selectedTable.rows, newRow],
    });
  };

  const addColumn = () => {
    if (!selectedTable) return;
    handleUpdateTable({
      headers: [...selectedTable.headers, `Column ${selectedTable.headers.length + 1}`],
      rows: selectedTable.rows.map(row => [...row, '']),
    });
  };

  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    if (!selectedTable) return;
    const newRows = [...selectedTable.rows];
    newRows[rowIndex] = [...newRows[rowIndex]];
    newRows[rowIndex][colIndex] = value;
    handleUpdateTable({ rows: newRows });
  };

  const updateHeader = (colIndex: number, value: string) => {
    if (!selectedTable) return;
    const newHeaders = [...selectedTable.headers];
    newHeaders[colIndex] = value;
    handleUpdateTable({ headers: newHeaders });
  };

  const deleteRow = (rowIndex: number) => {
    if (!selectedTable) return;
    const newRows = selectedTable.rows.filter((_, i) => i !== rowIndex);
    if (newRows.length === 0) {
      // Keep at least one row
      newRows.push(new Array(selectedTable.headers.length).fill(''));
    }
    handleUpdateTable({ rows: newRows });
  };

  const deleteColumn = (colIndex: number) => {
    if (!selectedTable || selectedTable.headers.length <= 1) return;
    handleUpdateTable({
      headers: selectedTable.headers.filter((_, i) => i !== colIndex),
      rows: selectedTable.rows.map(row => row.filter((_, i) => i !== colIndex)),
    });
  };

  return (
    <div className="flex h-full">
      {/* Tables List */}
      <div className="w-80 border-r border-border flex flex-col bg-card">
        {/* Search & Create */}
        <div className="p-4 border-b border-border space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search tables..."
              className="input-base pl-9 text-sm"
            />
          </div>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="btn-primary w-full text-sm"
          >
            <Plus className="w-4 h-4" />
            New Table
          </button>
        </div>

        {/* Tables List */}
        <div className="flex-1 overflow-y-auto">
          {filteredTables.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground text-sm">
              {searchQuery ? 'No tables found' : 'No tables yet'}
            </div>
          ) : (
            filteredTables.map(table => (
              <button
                key={table.id}
                onClick={() => setSelectedTableId(table.id)}
                className={`w-full text-left p-4 border-b border-border transition-colors ${
                  selectedTableId === table.id
                    ? 'bg-sidebar-accent'
                    : 'hover:bg-muted/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <TableIcon className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">{table.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {table.updatedAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Table Editor */}
      <div className="flex-1 flex flex-col">
        {selectedTable ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <input
                type="text"
                value={selectedTable.title}
                onChange={e => handleUpdateTable({ title: e.target.value })}
                className="text-xl font-semibold bg-transparent border-none focus:outline-none text-foreground flex-1"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDeleteModalOpen(true)}
                  className="btn-icon text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto p-6">
              <div className="max-w-full">
                <div className="mb-4 flex gap-2">
                  <button
                    onClick={addRow}
                    className="btn-secondary text-sm"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Add Row
                  </button>
                  <button
                    onClick={addColumn}
                    className="btn-secondary text-sm"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Add Column
                  </button>
                </div>
                <div className="overflow-x-auto border border-border rounded-lg">
                  <table className="min-w-full border-collapse">
                    <thead>
                      <tr className="bg-muted/50">
                        {selectedTable.headers.map((header, colIndex) => (
                          <th key={colIndex} className="border border-border p-2">
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={header}
                                onChange={e => updateHeader(colIndex, e.target.value)}
                                className="flex-1 bg-transparent border-none focus:outline-none font-semibold text-foreground"
                              />
                              {selectedTable.headers.length > 1 && (
                                <button
                                  onClick={() => deleteColumn(colIndex)}
                                  className="btn-icon text-destructive hover:text-destructive hover:bg-destructive/10 p-1"
                                  title="Delete column"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {selectedTable.rows.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {row.map((cell, colIndex) => (
                            <td key={colIndex} className="border border-border p-2">
                              <input
                                type="text"
                                value={cell}
                                onChange={e => updateCell(rowIndex, colIndex, e.target.value)}
                                className="w-full bg-transparent border-none focus:outline-none text-foreground"
                                placeholder="Enter value..."
                              />
                            </td>
                          ))}
                          <td className="border border-border p-2 w-12">
                            <button
                              onClick={() => deleteRow(rowIndex)}
                              className="btn-icon text-destructive hover:text-destructive hover:bg-destructive/10 p-1"
                              title="Delete row"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <TableIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Select a table or create a new one</p>
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <CreateTableModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreate={handleCreateTable}
      />

      {/* Delete Confirmation */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Table"
        size="sm"
      >
        <p className="text-muted-foreground mb-4">
          Are you sure you want to delete "{selectedTable?.title}"? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setDeleteModalOpen(false)} className="btn-secondary">
            Cancel
          </button>
          <button onClick={handleDeleteTable} className="btn-primary bg-destructive hover:bg-destructive/90">
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}

interface CreateTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (title: string) => void;
}

function CreateTableModal({ isOpen, onClose, onCreate }: CreateTableModalProps) {
  const [title, setTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onCreate(title.trim());
      setTitle('');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Table">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Table title..."
          className="input-base mb-4"
          autoFocus
        />
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={!title.trim()}>
            Create Table
          </button>
        </div>
      </form>
    </Modal>
  );
}

