import React, { createContext, useContext, useCallback, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Note, Task, RecipeCard, FileItem, ActivityItem, TableData } from '../types';
import {
  notesService,
  tasksService,
  recipesService,
  filesService,
  activityService,
} from '../lib/supabase-service';

interface State {
  notes: Note[];
  tasks: Task[];
  recipes: RecipeCard[];
  files: FileItem[];
  tables: TableData[];
  activity: ActivityItem[];
  isLoggedIn: boolean;
}

type Action =
  | { type: 'LOGIN' }
  | { type: 'LOGOUT' }
  | { type: 'ADD_NOTE'; payload: Note }
  | { type: 'UPDATE_NOTE'; payload: Note }
  | { type: 'DELETE_NOTE'; payload: string }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'ADD_RECIPE'; payload: RecipeCard }
  | { type: 'UPDATE_RECIPE'; payload: RecipeCard }
  | { type: 'DELETE_RECIPE'; payload: string }
  | { type: 'DUPLICATE_RECIPE'; payload: string }
  | { type: 'ADD_FILE'; payload: File }
  | { type: 'DELETE_FILE'; payload: { id: string; storagePath?: string } }
  | { type: 'ADD_TABLE'; payload: TableData }
  | { type: 'UPDATE_TABLE'; payload: TableData }
  | { type: 'DELETE_TABLE'; payload: string }
  | { type: 'ADD_ACTIVITY'; payload: ActivityItem };

interface DataContextValue {
  state: State;
  dispatch: React.Dispatch<Action>;
  addActivity: (action: ActivityItem['action'], entityType: ActivityItem['entityType'], entityTitle: string) => void;
  isLoading: boolean;
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  // Fetch all data
  const { data: notes = [], isLoading: notesLoading } = useQuery({
    queryKey: ['notes'],
    queryFn: notesService.getAll,
  });

  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: tasksService.getAll,
  });

  const { data: recipes = [], isLoading: recipesLoading } = useQuery({
    queryKey: ['recipes'],
    queryFn: recipesService.getAll,
  });

  const { data: files = [], isLoading: filesLoading } = useQuery({
    queryKey: ['files'],
    queryFn: filesService.getAll,
  });

  // Tables - using local state for now (can be connected to backend later)
  const [tables, setTables] = useState<TableData[]>([]);

  const { data: activity = [], isLoading: activityLoading } = useQuery({
    queryKey: ['activity'],
    queryFn: activityService.getAll,
  });

  const isLoading = notesLoading || tasksLoading || recipesLoading || filesLoading || activityLoading;

  // Mutations
  const createNoteMutation = useMutation({
    mutationFn: notesService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: notesService.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: notesService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: tasksService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: tasksService.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: tasksService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const createRecipeMutation = useMutation({
    mutationFn: recipesService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    },
  });

  const updateRecipeMutation = useMutation({
    mutationFn: recipesService.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    },
  });

  const deleteRecipeMutation = useMutation({
    mutationFn: recipesService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    },
  });

  const createFileMutation = useMutation({
    mutationFn: filesService.upload,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
  });

  const deleteFileMutation = useMutation({
    mutationFn: ({ id, storagePath }: { id: string; storagePath?: string }) => 
      filesService.delete(id, storagePath),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
  });

  const createActivityMutation = useMutation({
    mutationFn: activityService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity'] });
    },
  });

  // Dispatch function that handles actions and calls appropriate mutations
  const dispatch = useCallback((action: Action) => {
    switch (action.type) {
      case 'LOGIN':
        // For now, just a placeholder - can be extended with auth later
        break;
      case 'LOGOUT':
        // For now, just a placeholder - can be extended with auth later
        break;
      case 'ADD_NOTE': {
        const { id, createdAt, updatedAt, ...noteData } = action.payload;
        createNoteMutation.mutate(noteData);
        break;
      }
      case 'UPDATE_NOTE':
        updateNoteMutation.mutate(action.payload);
        break;
      case 'DELETE_NOTE':
        deleteNoteMutation.mutate(action.payload);
        break;
      case 'ADD_TASK': {
        const { id, createdAt, ...taskData } = action.payload;
        createTaskMutation.mutate(taskData);
        break;
      }
      case 'UPDATE_TASK':
        updateTaskMutation.mutate(action.payload);
        break;
      case 'DELETE_TASK':
        deleteTaskMutation.mutate(action.payload);
        break;
      case 'ADD_RECIPE': {
        const { id, createdAt, ...recipeData } = action.payload;
        createRecipeMutation.mutate(recipeData);
        break;
      }
      case 'UPDATE_RECIPE':
        updateRecipeMutation.mutate(action.payload);
        break;
      case 'DELETE_RECIPE':
        deleteRecipeMutation.mutate(action.payload);
        break;
      case 'DUPLICATE_RECIPE': {
        const original = recipes.find(r => r.id === action.payload);
        if (original) {
          const { id, createdAt, ...recipeData } = original;
          createRecipeMutation.mutate({
            ...recipeData,
            title: `${original.title} (Copy)`,
          });
        }
        break;
      }
      case 'ADD_FILE':
        // Action payload should be a File object for upload
        if (action.payload instanceof File) {
          createFileMutation.mutate(action.payload);
        }
        break;
      case 'DELETE_FILE':
        // Action payload should be { id, storagePath }
        deleteFileMutation.mutate(action.payload);
        break;
      case 'ADD_TABLE':
        setTables(prev => [...prev, action.payload]);
        break;
      case 'UPDATE_TABLE':
        setTables(prev => prev.map(t => t.id === action.payload.id ? action.payload : t));
        break;
      case 'DELETE_TABLE':
        setTables(prev => prev.filter(t => t.id !== action.payload));
        break;
      case 'ADD_ACTIVITY': {
        const { id, timestamp, ...activityData } = action.payload;
        createActivityMutation.mutate(activityData);
        break;
      }
    }
  }, [recipes, createNoteMutation, updateNoteMutation, deleteNoteMutation, createTaskMutation, updateTaskMutation, deleteTaskMutation, createRecipeMutation, updateRecipeMutation, deleteRecipeMutation, createFileMutation, deleteFileMutation, createActivityMutation]);

  const addActivity = useCallback((action: ActivityItem['action'], entityType: ActivityItem['entityType'], entityTitle: string) => {
    createActivityMutation.mutate({
      action,
      entityType,
      entityTitle,
    });
  }, [createActivityMutation]);

  const state: State = {
    notes,
    tasks,
    recipes,
    files,
    tables,
    activity,
    isLoggedIn: false, // Can be extended with auth later
  };

  return (
    <DataContext.Provider value={{ state, dispatch, addActivity, isLoading }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
