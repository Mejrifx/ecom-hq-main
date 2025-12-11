// Types for Startup HQ
// TODO: wire up backend here for persistence

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

export interface FileItem {
  id: string;
  name: string;
  size: number;
  addedAt: Date;
}

export interface ActivityItem {
  id: string;
  action: 'created' | 'updated' | 'deleted' | 'duplicated';
  entityType: 'note' | 'task' | 'recipe';
  entityTitle: string;
  timestamp: Date;
}

export type TaskStatus = Task['status'];

export const ASSIGNEES = ['You', 'Alex', 'Kim'] as const;
export type Assignee = typeof ASSIGNEES[number];
