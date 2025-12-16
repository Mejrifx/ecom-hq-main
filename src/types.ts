// Types for Ecom HQ

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'done';
  assignee: string;
  createdAt: Date;
}

// Legacy RecipeCard type (kept for backward compatibility)
export interface RecipeCard {
  id: string;
  title: string;
  imageUrl: string | null;
  ingredients: string;
  steps: string;
  cost: number;
  timeMinutes: number;
  createdAt: Date;
}

// Card Products - New structure
export interface CardProduct {
  id: string;
  name: string; // e.g., "Home Meal Cards", "Lunch-Box Edition", "Desserts Edition"
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Card {
  id: string;
  productId: string; // References CardProduct
  title: string; // Meal name
  imageUrl: string | null; // Front side image
  ingredients: string; // Back side - ingredients list
  instructions: string; // Back side - cooking instructions
  createdAt: Date;
  updatedAt: Date;
}

export interface FileItem {
  id: string;
  name: string;
  size: number;
  addedAt: Date;
  storagePath?: string; // Path in Supabase Storage
}

export interface TableData {
  id: string;
  title: string;
  headers: string[];
  rows: string[][];
  createdAt: Date;
  updatedAt: Date;
}

export interface ActivityItem {
  id: string;
  action: 'created' | 'updated' | 'deleted' | 'duplicated';
  entityType: 'note' | 'task' | 'recipe' | 'table' | 'cardProduct' | 'card';
  entityTitle: string;
  timestamp: Date;
}

export type TaskStatus = Task['status'];

export const ASSIGNEES = ['Dave', 'Mej'] as const;
export type Assignee = typeof ASSIGNEES[number];
