import { supabase } from './supabase';
import { Note, Task, RecipeCard, FileItem, ActivityItem, CardProduct, Card } from '../types';

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

// Helper to convert database row to CardProduct
const rowToCardProduct = (row: any): CardProduct => ({
  id: row.id,
  name: row.name,
  description: row.description || undefined,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
});

// Helper to convert database row to Card
const rowToCard = (row: any): Card => ({
  id: row.id,
  productId: row.product_id,
  title: row.title,
  imageUrl: row.image_url || null,
  ingredients: row.ingredients,
  instructions: row.instructions,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
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

// Card Products
export const cardProductsService = {
  async getAll(): Promise<CardProduct[]> {
    const { data, error } = await supabase
      .from('card_products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data.map(rowToCardProduct);
  },

  async create(product: Omit<CardProduct, 'id' | 'createdAt' | 'updatedAt'>): Promise<CardProduct> {
    const userId = await getCurrentUserId();
    const { data, error } = await supabase
      .from('card_products')
      .insert({
        name: product.name,
        description: product.description || null,
        user_id: userId,
      })
      .select()
      .single();
    
    if (error) throw error;
    return rowToCardProduct(data);
  },

  async update(product: CardProduct): Promise<CardProduct> {
    const { data, error } = await supabase
      .from('card_products')
      .update({
        name: product.name,
        description: product.description || null,
      })
      .eq('id', product.id)
      .select()
      .single();
    
    if (error) throw error;
    return rowToCardProduct(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('card_products')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

// Cards
export const cardsService = {
  async getAll(): Promise<Card[]> {
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data.map(rowToCard);
  },

  async getByProductId(productId: string): Promise<Card[]> {
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data.map(rowToCard);
  },

  async uploadImage(file: File): Promise<string> {
    const userId = await getCurrentUserId();
    
    // Generate unique file path
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `cards/${userId}/${fileName}`;
    
    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('files')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (uploadError) throw uploadError;
    
    return filePath;
  },

  async getImageUrl(storagePath: string): Promise<string> {
    const { data } = await supabase.storage
      .from('files')
      .getPublicUrl(storagePath);
    
    return data.publicUrl;
  },

  async create(card: Omit<Card, 'id' | 'createdAt' | 'updatedAt'>, imageFile?: File | null): Promise<Card> {
    const userId = await getCurrentUserId();
    
    let imagePath: string | null = null;
    
    // Upload image if provided
    if (imageFile) {
      try {
        imagePath = await this.uploadImage(imageFile);
      } catch (error) {
        console.error('Error uploading card image:', error);
        throw error;
      }
    }
    
    const { data, error } = await supabase
      .from('cards')
      .insert({
        product_id: card.productId,
        title: card.title,
        image_url: imagePath || card.imageUrl || null,
        ingredients: card.ingredients,
        instructions: card.instructions,
        user_id: userId,
      })
      .select()
      .single();
    
    if (error) {
      // If database insert fails, try to clean up the uploaded image
      if (imagePath) {
        await supabase.storage.from('files').remove([imagePath]);
      }
      console.error('Error creating card:', error);
      throw error;
    }
    return rowToCard(data);
  },

  async update(card: Card, imageFile?: File | null): Promise<Card> {
    let imagePath: string | null = card.imageUrl;
    
    // Upload new image if provided
    if (imageFile) {
      try {
        // Delete old image if it exists and is a storage path
        if (card.imageUrl && card.imageUrl.startsWith('cards/')) {
          await supabase.storage.from('files').remove([card.imageUrl]);
        }
        imagePath = await this.uploadImage(imageFile);
      } catch (error) {
        console.error('Error uploading card image:', error);
        throw error;
      }
    }
    
    const { data, error } = await supabase
      .from('cards')
      .update({
        title: card.title,
        image_url: imagePath || null,
        ingredients: card.ingredients,
        instructions: card.instructions,
      })
      .eq('id', card.id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating card:', error);
      throw error;
    }
    return rowToCard(data);
  },

  async delete(id: string): Promise<void> {
    // Get the card to find the image path
    const { data: card } = await supabase
      .from('cards')
      .select('image_url')
      .eq('id', id)
      .single();
    
    // Delete the card from database
    const { error } = await supabase
      .from('cards')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting card:', error);
      throw error;
    }
    
    // Delete the image from storage if it exists
    if (card?.image_url && card.image_url.startsWith('cards/')) {
      await supabase.storage.from('files').remove([card.image_url]);
    }
  },
};


