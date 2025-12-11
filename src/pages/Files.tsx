import React, { useState, useCallback } from 'react';
import { Upload, File, Trash2, HardDrive, Download, Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useData } from '../contexts/FakeDataContext';
import { FileItem } from '../types';
import { filesService } from '../lib/supabase-service';

export function Files() {
  const { state, dispatch } = useData();
  const queryClient = useQueryClient();
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    setError(null);
    setUploading(true);

    const droppedFiles = Array.from(e.dataTransfer.files);
    try {
      for (const file of droppedFiles) {
        await filesService.upload(file);
      }
      // Refresh the file list
      await queryClient.invalidateQueries({ queryKey: ['files'] });
    } catch (err) {
      console.error('Upload error:', err);
      let errorMessage = 'Failed to upload files';
      if (err instanceof Error) {
        if (err.message.includes('Bucket not found') || err.message.includes('bucket')) {
          errorMessage = 'Storage bucket not found. Please create a "files" bucket in Supabase Storage. See SUPABASE_SETUP.md for instructions.';
        } else {
          errorMessage = err.message;
        }
      }
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  }, [queryClient]);

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setError(null);
    setUploading(true);

    try {
      for (const file of selectedFiles) {
        await filesService.upload(file);
      }
      // Refresh the file list
      await queryClient.invalidateQueries({ queryKey: ['files'] });
    } catch (err) {
      console.error('Upload error:', err);
      let errorMessage = 'Failed to upload files';
      if (err instanceof Error) {
        if (err.message.includes('Bucket not found') || err.message.includes('bucket')) {
          errorMessage = 'Storage bucket not found. Please create a "files" bucket in Supabase Storage. See SUPABASE_SETUP.md for instructions.';
        } else {
          errorMessage = err.message;
        }
      }
      setError(errorMessage);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDownload = async (file: FileItem) => {
    if (!file.storagePath) {
      setError('File not available for download');
      return;
    }

    setDownloading(file.id);
    setError(null);

    try {
      await filesService.download(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download file');
    } finally {
      setDownloading(null);
    }
  };

  const handleDelete = (file: FileItem) => {
    dispatch({ 
      type: 'DELETE_FILE', 
      payload: { id: file.id, storagePath: file.storagePath } 
    });
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
        {error && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm">
            {error}
          </div>
        )}
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
          Files are uploaded to cloud storage and can be downloaded by all users
        </p>
        {uploading && (
          <div className="mt-2 flex items-center justify-center gap-2 text-primary">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Uploading...</span>
          </div>
        )}
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
              <div className="flex items-center gap-2">
                {file.storagePath && (
                  <button
                    onClick={() => handleDownload(file)}
                    disabled={downloading === file.id}
                    className="btn-icon text-primary hover:text-primary hover:bg-primary/10 disabled:opacity-50"
                    title="Download file"
                  >
                    {downloading === file.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                  </button>
                )}
                <button
                  onClick={() => handleDelete(file)}
                  className="btn-icon text-destructive hover:text-destructive hover:bg-destructive/10"
                  title="Delete file"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
