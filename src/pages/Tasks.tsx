import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, GripVertical, Pencil, Trash2, User } from 'lucide-react';
import { useData } from '../contexts/FakeDataContext';
import { Task, TaskStatus, ASSIGNEES } from '../types';
import { Modal } from '../components/Modal';

const columns: { id: TaskStatus; title: string }[] = [
  { id: 'todo', title: 'To Do' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'done', title: 'Done' },
];

export function Tasks() {
  const { state, dispatch, addActivity } = useData();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const getTasksByStatus = (status: TaskStatus) =>
    state.tasks.filter(t => t.status === status);

  const handleDragStart = (event: DragStartEvent) => {
    const task = state.tasks.find(t => t.id === event.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Check if dropped on a column
    const targetColumn = columns.find(c => c.id === overId);
    if (targetColumn) {
      const task = state.tasks.find(t => t.id === activeId);
      if (task && task.status !== targetColumn.id) {
        dispatch({
          type: 'UPDATE_TASK',
          payload: { ...task, status: targetColumn.id },
        });
        addActivity('updated', 'task', task.title);
      }
      return;
    }

    // Check if dropped on another task
    const overTask = state.tasks.find(t => t.id === overId);
    if (overTask) {
      const task = state.tasks.find(t => t.id === activeId);
      if (task && task.status !== overTask.status) {
        dispatch({
          type: 'UPDATE_TASK',
          payload: { ...task, status: overTask.status },
        });
        addActivity('updated', 'task', task.title);
      }
    }
  };

  const handleCreateTask = (title: string, assignee: string, status: TaskStatus) => {
    const task: Task = {
      id: crypto.randomUUID(),
      title,
      status,
      assignee,
      createdAt: new Date(),
    };
    dispatch({ type: 'ADD_TASK', payload: task });
    addActivity('created', 'task', title);
    setCreateModalOpen(false);
  };

  const handleUpdateTask = (task: Task) => {
    dispatch({ type: 'UPDATE_TASK', payload: task });
    addActivity('updated', 'task', task.title);
    setEditingTask(null);
  };

  const handleDeleteTask = () => {
    if (deleteTaskId) {
      const task = state.tasks.find(t => t.id === deleteTaskId);
      dispatch({ type: 'DELETE_TASK', payload: deleteTaskId });
      if (task) addActivity('deleted', 'task', task.title);
      setDeleteTaskId(null);
    }
  };

  return (
    <div className="p-6 md:p-8 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">Tasks</h1>
          <p className="text-muted-foreground">Drag and drop to organize your tasks</p>
        </div>
        <button onClick={() => setCreateModalOpen(true)} className="btn-primary">
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </div>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 flex gap-4 overflow-x-auto pb-4">
          {columns.map(column => (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              tasks={getTasksByStatus(column.id)}
              onEdit={setEditingTask}
              onDelete={setDeleteTaskId}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask && <TaskCard task={activeTask} isDragging />}
        </DragOverlay>
      </DndContext>

      {/* Create Modal */}
      <TaskModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateTask}
        title="Create Task"
      />

      {/* Edit Modal */}
      {editingTask && (
        <TaskModal
          isOpen={true}
          onClose={() => setEditingTask(null)}
          onSubmit={(title, assignee, status) =>
            handleUpdateTask({ ...editingTask, title, assignee, status })
          }
          title="Edit Task"
          initialTitle={editingTask.title}
          initialAssignee={editingTask.assignee}
          initialStatus={editingTask.status}
        />
      )}

      {/* Delete Confirmation */}
      <Modal
        isOpen={!!deleteTaskId}
        onClose={() => setDeleteTaskId(null)}
        title="Delete Task"
        size="sm"
      >
        <p className="text-muted-foreground mb-4">
          Are you sure you want to delete this task? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setDeleteTaskId(null)} className="btn-secondary">
            Cancel
          </button>
          <button onClick={handleDeleteTask} className="btn-primary bg-destructive hover:bg-destructive/90">
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}

interface KanbanColumnProps {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

function KanbanColumn({ id, title, tasks, onEdit, onDelete }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  return (
    <div 
      ref={setNodeRef}
      className={`kanban-column ${isOver ? 'ring-2 ring-primary' : ''}`}
      id={id}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground font-medium">
          {tasks.length}
        </span>
      </div>
      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3 min-h-[200px]">
          {tasks.map(task => (
            <SortableTask key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

interface SortableTaskProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

function SortableTask({ task, onEdit, onDelete }: SortableTaskProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={isDragging ? 'opacity-50' : ''}
    >
      <TaskCard
        task={task}
        onEdit={() => onEdit(task)}
        onDelete={() => onDelete(task.id)}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  dragHandleProps?: Record<string, unknown>;
}

function TaskCard({ task, isDragging, onEdit, onDelete, dragHandleProps }: TaskCardProps) {
  return (
    <div className={`kanban-card ${isDragging ? 'kanban-card-dragging' : ''}`}>
      <div className="flex items-start gap-2">
        {dragHandleProps && (
          <button {...dragHandleProps} className="mt-0.5 text-muted-foreground hover:text-foreground">
            <GripVertical className="w-4 h-4" />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground text-sm">{task.title}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <User className="w-3 h-3" />
              {task.assignee}
            </span>
          </div>
        </div>
        {(onEdit || onDelete) && (
          <div className="flex gap-1">
            {onEdit && (
              <button onClick={onEdit} className="btn-icon p-1">
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
            {onDelete && (
              <button onClick={onDelete} className="btn-icon p-1 text-destructive hover:text-destructive hover:bg-destructive/10">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, assignee: string, status: TaskStatus) => void;
  title: string;
  initialTitle?: string;
  initialAssignee?: string;
  initialStatus?: TaskStatus;
}

function TaskModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  initialTitle = '',
  initialAssignee = ASSIGNEES[0],
  initialStatus = 'todo',
}: TaskModalProps) {
  // Validate initialAssignee - if it's not in ASSIGNEES, default to first assignee
  const validInitialAssignee = ASSIGNEES.includes(initialAssignee as any) 
    ? initialAssignee 
    : ASSIGNEES[0];
  
  const [taskTitle, setTaskTitle] = useState(initialTitle);
  const [assignee, setAssignee] = useState(validInitialAssignee);
  const [status, setStatus] = useState<TaskStatus>(initialStatus);

  React.useEffect(() => {
    setTaskTitle(initialTitle);
    // Validate assignee when it changes
    const validAssignee = ASSIGNEES.includes(initialAssignee as any) 
      ? initialAssignee 
      : ASSIGNEES[0];
    setAssignee(validAssignee);
    setStatus(initialStatus);
  }, [initialTitle, initialAssignee, initialStatus, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (taskTitle.trim()) {
      onSubmit(taskTitle.trim(), assignee, status);
      setTaskTitle('');
      setAssignee(ASSIGNEES[0]);
      setStatus('todo');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Title</label>
            <input
              type="text"
              value={taskTitle}
              onChange={e => setTaskTitle(e.target.value)}
              placeholder="Task title..."
              className="input-base"
              autoFocus
            />
          </div>
          <div>
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
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Status</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as TaskStatus)}
              className="input-base"
            >
              {columns.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={!taskTitle.trim()}>
            {initialTitle ? 'Update' : 'Create'} Task
          </button>
        </div>
      </form>
    </Modal>
  );
}
