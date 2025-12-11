import React, { useState, useCallback } from 'react';
import { Upload, File, Trash2, HardDrive } from 'lucide-react';
import { useData } from '../contexts/FakeDataContext';
import { FileItem } from '../types';

export function Files() {
  const { state, dispatch } = useData();
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    droppedFiles.forEach(file => {
      const fileItem: FileItem = {
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        addedAt: new Date(),
      };
      dispatch({ type: 'ADD_FILE', payload: fileItem });
    });
  }, [dispatch]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    selectedFiles.forEach(file => {
      const fileItem: FileItem = {
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        addedAt: new Date(),
      };
      dispatch({ type: 'ADD_FILE', payload: fileItem });
    });
    e.target.value = '';
  };

  const handleDelete = (id: string) => {
    dispatch({ type: 'DELETE_FILE', payload: id });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div
      className="p-6 md:p-8 max-w-4xl mx-auto min-h-full"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">Files</h1>
        <p className="text-muted-foreground">Drag & drop files anywhere on this page</p>
      </div>

      {/* Drop Zone */}
      <label
        className={`dropzone cursor-pointer mb-8 block ${isDragOver ? 'dropzone-active' : ''}`}
      >
        <input
          type="file"
          multiple
          onChange={handleFileInput}
          className="hidden"
        />
        <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragOver ? 'text-primary' : 'text-muted-foreground'}`} />
        <p className="text-foreground font-medium mb-1">
          {isDragOver ? 'Drop files here' : 'Click to upload or drag and drop'}
        </p>
        <p className="text-sm text-muted-foreground">
          Files are stored in memory only (no actual upload)
        </p>
        {/* TODO: wire up backend here for real file storage */}
      </label>

      {/* File List */}
      {state.files.length === 0 ? (
        <div className="card-elevated p-8 text-center">
          <HardDrive className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">No files yet. Drop some files above!</p>
        </div>
      ) : (
        <div className="card-elevated divide-y divide-border">
          {state.files.map(file => (
            <div key={file.id} className="flex items-center gap-4 p-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <File className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(file.size)} • Added {file.addedAt.toLocaleTimeString()}
                </p>
              </div>
              <button
                onClick={() => handleDelete(file.id)}
                className="btn-icon text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
