import { supabase } from './supabase';
import { Note, Task, RecipeCard, FileItem, ActivityItem } from '../types';

// Helper to get current user ID
const getCurrentUserId = async (): Promise<string | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
};

// Helper to convert database row to Note
const rowToNote = (row: any): Note => ({
  id: row.id,
  title: row.title,
  content: row.content,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
});

// Helper to convert database row to Task
const rowToTask = (row: any): Task => ({
  id: row.id,
  title: row.title,
  status: row.status as Task['status'],
  assignee: row.assignee,
  createdAt: new Date(row.created_at),
});

// Helper to convert database row to RecipeCard
const rowToRecipe = (row: any): RecipeCard => ({
  id: row.id,
  title: row.title,
  imageUrl: row.image_url,
  ingredients: row.ingredients,
  steps: row.steps,
  cost: parseFloat(row.cost),
  timeMinutes: row.time_minutes,
  createdAt: new Date(row.created_at),
});

// Helper to convert database row to FileItem
const rowToFile = (row: any): FileItem => ({
  id: row.id,
  name: row.name,
  size: row.size,
  addedAt: new Date(row.added_at),
  storagePath: row.storage_path || undefined,
});

// Helper to convert database row to ActivityItem
const rowToActivity = (row: any): ActivityItem => ({
  id: row.id,
  action: row.action as ActivityItem['action'],
  entityType: row.entity_type as ActivityItem['entityType'],
  entityTitle: row.entity_title,
  timestamp: new Date(row.timestamp),
});

// Notes
export const notesService = {
  async getAll(): Promise<Note[]> {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data.map(rowToNote);
  },

  async getById(id: string): Promise<Note | null> {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return rowToNote(data);
  },

  async create(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note> {
    const userId = await getCurrentUserId();
    const { data, error } = await supabase
      .from('notes')
      .insert({
        title: note.title,
        content: note.content,
        user_id: userId,
      })
      .select()
      .single();
    
    if (error) throw error;
    return rowToNote(data);
  },

  async update(note: Note): Promise<Note> {
    const { data, error } = await supabase
      .from('notes')
      .update({
        title: note.title,
        content: note.content,
        updated_at: new Date().toISOString(),
      })
      .eq('id', note.id)
      .select()
      .single();
    
    if (error) throw error;
    return rowToNote(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

// Tasks
export const tasksService = {
  async getAll(): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data.map(rowToTask);
  },

  async create(task: Omit<Task, 'id' | 'createdAt'>): Promise<Task> {
    const userId = await getCurrentUserId();
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title: task.title,
        status: task.status,
        assignee: task.assignee,
        user_id: userId,
      })
      .select()
      .single();
    
    if (error) throw error;
    return rowToTask(data);
  },

  async update(task: Task): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .update({
        title: task.title,
        status: task.status,
        assignee: task.assignee,
      })
      .eq('id', task.id)
      .select()
      .single();
    
    if (error) throw error;
    return rowToTask(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

// Recipe Cards
export const recipesService = {
  async getAll(): Promise<RecipeCard[]> {
    const { data, error } = await supabase
      .from('recipe_cards')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data.map(rowToRecipe);
  },

  async create(recipe: Omit<RecipeCard, 'id' | 'createdAt'>): Promise<RecipeCard> {
    const userId = await getCurrentUserId();
    const { data, error } = await supabase
      .from('recipe_cards')
      .insert({
        title: recipe.title,
        image_url: recipe.imageUrl,
        ingredients: recipe.ingredients,
        steps: recipe.steps,
        cost: recipe.cost,
        time_minutes: recipe.timeMinutes,
        user_id: userId,
      })
      .select()
      .single();
    
    if (error) throw error;
    return rowToRecipe(data);
  },

  async update(recipe: RecipeCard): Promise<RecipeCard> {
    const { data, error } = await supabase
      .from('recipe_cards')
      .update({
        title: recipe.title,
        image_url: recipe.imageUrl,
        ingredients: recipe.ingredients,
        steps: recipe.steps,
        cost: recipe.cost,
        time_minutes: recipe.timeMinutes,
      })
      .eq('id', recipe.id)
      .select()
      .single();
    
    if (error) throw error;
    return rowToRecipe(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('recipe_cards')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

// Files
export const filesService = {
  async getAll(): Promise<FileItem[]> {
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .order('added_at', { ascending: false });
    
    if (error) throw error;
    return data.map(rowToFile);
  },

  async upload(file: File): Promise<FileItem> {
    const userId = await getCurrentUserId();
    
    // Generate unique file path
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;
    
    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('files')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (uploadError) throw uploadError;
    
    // Save file metadata to database
    const { data, error } = await supabase
      .from('files')
      .insert({
        name: file.name,
        size: file.size,
        storage_path: filePath,
        user_id: userId,
      })
      .select()
      .single();
    
    if (error) {
      // If database insert fails, try to clean up the uploaded file
      await supabase.storage.from('files').remove([filePath]);
      throw error;
    }
    
    return rowToFile(data);
  },

  async download(file: FileItem): Promise<void> {
    if (!file.storagePath) {
      throw new Error('File storage path not found');
    }
    
    // Download file from Supabase Storage
    const { data, error } = await supabase.storage
      .from('files')
      .download(file.storagePath);
    
    if (error) throw error;
    
    // Create download link and trigger download
    const url = window.URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  async delete(id: string, storagePath?: string): Promise<void> {
    // Delete from storage if path exists
    if (storagePath) {
      const { error: storageError } = await supabase.storage
        .from('files')
        .remove([storagePath]);
      
      if (storageError) {
        console.error('Error deleting file from storage:', storageError);
        // Continue with database deletion even if storage deletion fails
      }
    }
    
    // Delete from database
    const { error } = await supabase
      .from('files')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

// Activity
export const activityService = {
  async getAll(): Promise<ActivityItem[]> {
    const { data, error } = await supabase
      .from('activity')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(50);
    
    if (error) throw error;
    return data.map(rowToActivity);
  },

  async create(activity: Omit<ActivityItem, 'id' | 'timestamp'>): Promise<ActivityItem> {
    const userId = await getCurrentUserId();
    const { data, error } = await supabase
      .from('activity')
      .insert({
        action: activity.action,
        entity_type: activity.entityType,
        entity_title: activity.entityTitle,
        user_id: userId,
      })
      .select()
      .single();
    
    if (error) throw error;
    return rowToActivity(data);
  },
};

