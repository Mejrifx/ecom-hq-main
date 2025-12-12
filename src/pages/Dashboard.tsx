import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, CheckSquare, UtensilsCrossed, Plus, Clock } from 'lucide-react';
import { useData } from '../contexts/FakeDataContext';
import { Modal } from '../components/Modal';
import { Note, Task, RecipeCard, ASSIGNEES } from '../types';
import { formatDistanceToNow } from 'date-fns';

export function Dashboard() {
  const { state, dispatch, addActivity } = useData();
  const navigate = useNavigate();
  
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [cardProductModalOpen, setCardProductModalOpen] = useState(false);

  // Stats
  const totalNotes = state.notes.length;
  const openTasks = state.tasks.filter(t => t.status !== 'done').length;
  const totalCardProducts = (state.cardProducts || []).length;

  // Recent activity (last 10)
  const recentActivity = state.activity.slice(0, 10);

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
    setNoteModalOpen(false);
    navigate('/notes');
  };

  const handleCreateTask = (title: string, assignee: string) => {
    const task: Task = {
      id: crypto.randomUUID(),
      title,
      status: 'todo',
      assignee,
      createdAt: new Date(),
    };
    dispatch({ type: 'ADD_TASK', payload: task });
    addActivity('created', 'task', title);
    setTaskModalOpen(false);
    navigate('/tasks');
  };

  const handleCreateCardProduct = () => {
    setCardProductModalOpen(false);
    navigate('/card-products');
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your overview.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          icon={FileText}
          label="Total Notes"
          value={totalNotes}
          color="text-primary"
          bgColor="bg-primary/10"
        />
        <StatCard
          icon={CheckSquare}
          label="Open Tasks"
          value={openTasks}
          color="text-accent-foreground"
          bgColor="bg-accent/20"
        />
        <StatCard
          icon={UtensilsCrossed}
          label="Card Products"
          value={totalCardProducts}
          color="text-primary"
          bgColor="bg-primary/10"
        />
      </div>

      {/* Quick Create */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">Quick Create</h2>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => setNoteModalOpen(true)} className="btn-secondary">
            <Plus className="w-4 h-4" />
            Note
          </button>
          <button onClick={() => setTaskModalOpen(true)} className="btn-secondary">
            <Plus className="w-4 h-4" />
            Task
          </button>
          <button onClick={() => setCardProductModalOpen(true)} className="btn-accent">
            <Plus className="w-4 h-4" />
            Card Product
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h2>
        <div className="card-elevated divide-y divide-border">
          {recentActivity.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              No recent activity yet
            </div>
          ) : (
            recentActivity.map(item => (
              <div key={item.id} className="p-4 flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  {item.entityType === 'note' && <FileText className="w-4 h-4 text-muted-foreground" />}
                  {item.entityType === 'task' && <CheckSquare className="w-4 h-4 text-muted-foreground" />}
                  {(item.entityType === 'recipe' || item.entityType === 'cardProduct' || item.entityType === 'card') && <UtensilsCrossed className="w-4 h-4 text-muted-foreground" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">
                    <span className="capitalize">{item.action}</span>{' '}
                    <span className="font-medium">{item.entityTitle}</span>
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(item.timestamp, { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modals */}
      <QuickNoteModal
        isOpen={noteModalOpen}
        onClose={() => setNoteModalOpen(false)}
        onCreate={handleCreateNote}
      />
      <QuickTaskModal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        onCreate={handleCreateTask}
      />
      <Modal
        isOpen={cardProductModalOpen}
        onClose={() => setCardProductModalOpen(false)}
        title="Create Card Product"
      >
        <p className="text-muted-foreground mb-4">
          You'll be redirected to the Card Products page to create a new product with the full editor.
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setCardProductModalOpen(false)} className="btn-secondary">
            Cancel
          </button>
          <button onClick={handleCreateCardProduct} className="btn-primary">
            Go to Card Products
          </button>
        </div>
      </Modal>
    </div>
  );
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
  bgColor: string;
}

function StatCard({ icon: Icon, label, value, color, bgColor }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className={`w-10 h-10 rounded-lg ${bgColor} flex items-center justify-center`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

interface QuickNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (title: string) => void;
}

function QuickNoteModal({ isOpen, onClose, onCreate }: QuickNoteModalProps) {
  const [title, setTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onCreate(title.trim());
      setTitle('');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Note">
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

interface QuickTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (title: string, assignee: string) => void;
}

function QuickTaskModal({ isOpen, onClose, onCreate }: QuickTaskModalProps) {
  const [title, setTitle] = useState('');
  const [assignee, setAssignee] = useState<string>(ASSIGNEES[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onCreate(title.trim(), assignee);
      setTitle('');
      setAssignee(ASSIGNEES[0]);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Task">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Task title..."
          className="input-base mb-4"
          autoFocus
        />
        <div className="mb-4">
          <label className="block text-sm font-medium text-foreground mb-2">Assignee</label>
          <select
            value={assignee}
            onChange={e => setAssignee(e.target.value)}
            className="input-base"
          >
            {ASSIGNEES.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={!title.trim()}>
            Create Task
          </button>
        </div>
      </form>
    </Modal>
  );
}
