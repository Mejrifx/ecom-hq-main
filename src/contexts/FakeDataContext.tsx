import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { Note, Task, RecipeCard, FileItem, ActivityItem } from '../types';

// Initial fake data
const initialNotes: Note[] = [
  {
    id: '1',
    title: 'Welcome to Startup HQ',
    content: '# Welcome!\n\nThis is your **notes** section. Write markdown and see it preview below.\n\n- Create notes\n- Edit them\n- Search by title',
    createdAt: new Date(Date.now() - 86400000),
    updatedAt: new Date(),
  },
  {
    id: '2',
    title: 'Project Ideas',
    content: '## Ideas for Q1\n\n1. Launch MVP\n2. User testing\n3. Iterate on feedback',
    createdAt: new Date(Date.now() - 172800000),
    updatedAt: new Date(Date.now() - 86400000),
  },
];

const initialTasks: Task[] = [
  { id: '1', title: 'Set up project structure', status: 'done', assignee: 'You', createdAt: new Date(Date.now() - 259200000) },
  { id: '2', title: 'Design landing page', status: 'done', assignee: 'Alex', createdAt: new Date(Date.now() - 172800000) },
  { id: '3', title: 'Implement dashboard', status: 'in-progress', assignee: 'You', createdAt: new Date(Date.now() - 86400000) },
  { id: '4', title: 'Add authentication', status: 'in-progress', assignee: 'Kim', createdAt: new Date(Date.now() - 43200000) },
  { id: '5', title: 'Write documentation', status: 'todo', assignee: 'Alex', createdAt: new Date() },
  { id: '6', title: 'Set up CI/CD', status: 'todo', assignee: 'You', createdAt: new Date() },
];

const initialRecipes: RecipeCard[] = [
  {
    id: '1',
    title: 'Classic Pasta Carbonara',
    imageUrl: null,
    ingredients: 'Spaghetti 400g\nGuanciale 200g\nEgg yolks 4\nPecorino Romano 100g\nBlack pepper',
    steps: '1. Cook pasta al dente\n2. Crisp guanciale\n3. Mix yolks with cheese\n4. Combine off heat\n5. Season generously',
    cost: 8,
    timeMinutes: 25,
    createdAt: new Date(Date.now() - 86400000),
  },
  {
    id: '2',
    title: 'Green Smoothie Bowl',
    imageUrl: null,
    ingredients: 'Spinach 100g\nBanana 1\nMango 100g\nAlmond milk 200ml\nGranola\nChia seeds',
    steps: '1. Blend spinach and banana\n2. Add mango and milk\n3. Pour into bowl\n4. Top with granola and seeds',
    cost: 5,
    timeMinutes: 10,
    createdAt: new Date(Date.now() - 43200000),
  },
];

const initialFiles: FileItem[] = [];

const initialActivity: ActivityItem[] = [
  { id: '1', action: 'created', entityType: 'note', entityTitle: 'Welcome to Startup HQ', timestamp: new Date(Date.now() - 86400000) },
  { id: '2', action: 'created', entityType: 'task', entityTitle: 'Design landing page', timestamp: new Date(Date.now() - 172800000) },
  { id: '3', action: 'created', entityType: 'recipe', entityTitle: 'Classic Pasta Carbonara', timestamp: new Date(Date.now() - 86400000) },
];

interface State {
  notes: Note[];
  tasks: Task[];
  recipes: RecipeCard[];
  files: FileItem[];
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
  | { type: 'ADD_FILE'; payload: FileItem }
  | { type: 'DELETE_FILE'; payload: string }
  | { type: 'ADD_ACTIVITY'; payload: ActivityItem };

const initialState: State = {
  notes: initialNotes,
  tasks: initialTasks,
  recipes: initialRecipes,
  files: initialFiles,
  activity: initialActivity,
  isLoggedIn: false,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, isLoggedIn: true };
    case 'LOGOUT':
      return { ...state, isLoggedIn: false };
    case 'ADD_NOTE':
      return { ...state, notes: [action.payload, ...state.notes] };
    case 'UPDATE_NOTE':
      return {
        ...state,
        notes: state.notes.map(n => n.id === action.payload.id ? action.payload : n),
      };
    case 'DELETE_NOTE':
      return { ...state, notes: state.notes.filter(n => n.id !== action.payload) };
    case 'ADD_TASK':
      return { ...state, tasks: [action.payload, ...state.tasks] };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(t => t.id === action.payload.id ? action.payload : t),
      };
    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter(t => t.id !== action.payload) };
    case 'ADD_RECIPE':
      return { ...state, recipes: [action.payload, ...state.recipes] };
    case 'UPDATE_RECIPE':
      return {
        ...state,
        recipes: state.recipes.map(r => r.id === action.payload.id ? action.payload : r),
      };
    case 'DELETE_RECIPE':
      return { ...state, recipes: state.recipes.filter(r => r.id !== action.payload) };
    case 'DUPLICATE_RECIPE': {
      const original = state.recipes.find(r => r.id === action.payload);
      if (!original) return state;
      const duplicate: RecipeCard = {
        ...original,
        id: crypto.randomUUID(),
        title: `${original.title} (Copy)`,
        createdAt: new Date(),
      };
      return { ...state, recipes: [duplicate, ...state.recipes] };
    }
    case 'ADD_FILE':
      return { ...state, files: [action.payload, ...state.files] };
    case 'DELETE_FILE':
      return { ...state, files: state.files.filter(f => f.id !== action.payload) };
    case 'ADD_ACTIVITY':
      return { ...state, activity: [action.payload, ...state.activity].slice(0, 50) };
    default:
      return state;
  }
}

interface DataContextValue {
  state: State;
  dispatch: React.Dispatch<Action>;
  addActivity: (action: ActivityItem['action'], entityType: ActivityItem['entityType'], entityTitle: string) => void;
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const addActivity = useCallback((action: ActivityItem['action'], entityType: ActivityItem['entityType'], entityTitle: string) => {
    dispatch({
      type: 'ADD_ACTIVITY',
      payload: {
        id: crypto.randomUUID(),
        action,
        entityType,
        entityTitle,
        timestamp: new Date(),
      },
    });
  }, []);

  return (
    <DataContext.Provider value={{ state, dispatch, addActivity }}>
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
