import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { GripVertical } from 'lucide-react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';
import api from '../api/axios';
import { Project, Task, User } from '../types';
import { useAuth } from '../context/AuthContext';

type TaskStatus = 'OPEN' | 'IN_PROGRESS' | 'DONE';

const COLUMNS: { id: TaskStatus; label: string; headerClass: string }[] = [
  { id: 'OPEN',        label: 'Offen',          headerClass: 'bg-red-50 border-red-200 text-red-700' },
  { id: 'IN_PROGRESS', label: 'In Bearbeitung', headerClass: 'bg-amber-50 border-amber-200 text-amber-700' },
  { id: 'DONE',        label: 'Erledigt',        headerClass: 'bg-green-50 border-green-200 text-green-700' },
];

const STATUS_BADGE: Record<TaskStatus, string> = {
  OPEN:        'bg-red-100 text-red-600',
  IN_PROGRESS: 'bg-amber-100 text-amber-600',
  DONE:        'bg-green-100 text-green-700',
};

function TaskCard({
  task,
  isActive: projectIsActive,
  hasAccess,
  canDelete,
  onEdit,
  onDelete,
  overlay = false,
}: {
  task: Task;
  isActive: boolean;
  hasAccess: boolean;
  canDelete: boolean;
  onEdit: (t: Task) => void;
  onDelete: (id: number) => void;
  overlay?: boolean;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: String(task.id),
    disabled: !hasAccess || !projectIsActive,
  });

  return (
    <div
      ref={setNodeRef}
      className={`bg-white rounded-lg border border-gray-100 shadow-sm p-3 transition-opacity ${
        isDragging && !overlay ? 'opacity-40' : 'opacity-100'
      } ${overlay ? 'shadow-lg rotate-1 cursor-grabbing' : ''}`}
    >
      <div className="flex items-start gap-2">
        {/* Drag-Handle: trennt Drag-Interaktion von den Aktions-Buttons */}
        {hasAccess && projectIsActive && (
          <button
            {...listeners}
            {...attributes}
            className="mt-0.5 shrink-0 text-gray-300 hover:text-gray-400 cursor-grab active:cursor-grabbing touch-none"
            tabIndex={-1}
          >
            <GripVertical size={15} />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800 leading-snug">{task.title}</p>
          {task.description && (
            <p className="text-xs text-gray-500 mt-1 leading-snug">{task.description}</p>
          )}
          {task.assignedTo && (
            <p className="text-xs text-gray-400 mt-1.5">→ {task.assignedTo.username}</p>
          )}
        </div>
        <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_BADGE[task.status as TaskStatus]}`}>
          {COLUMNS.find(c => c.id === task.status)?.label}
        </span>
      </div>

      {hasAccess && projectIsActive && (
        <div className="flex gap-1.5 mt-3 flex-wrap">
          <button
            onClick={() => onEdit(task)}
            className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-2.5 py-1 rounded transition-colors"
          >
            Bearbeiten
          </button>
          {canDelete && (
            <button
              onClick={() => onDelete(task.id)}
              className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-2.5 py-1 rounded transition-colors"
            >
              Löschen
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function KanbanColumn({
  column,
  tasks,
  isActive,
  hasAccess,
  canDelete,
  onEdit,
  onDelete,
}: {
  column: typeof COLUMNS[number];
  tasks: Task[];
  isActive: boolean;
  hasAccess: boolean;
  canDelete: boolean;
  onEdit: (t: Task) => void;
  onDelete: (id: number) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div className="flex flex-col gap-3">
      <div className={`rounded-lg border px-4 py-2 font-semibold text-sm ${column.headerClass}`}>
        {column.label}
        <span className="ml-2 font-normal text-xs opacity-70">({tasks.length})</span>
      </div>
      <div
        ref={setNodeRef}
        className={`flex flex-col gap-2 min-h-[120px] rounded-lg p-2 transition-colors ${
          isOver ? 'bg-blue-50 ring-2 ring-blue-200' : 'bg-gray-50'
        }`}
      >
        {tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            isActive={isActive}
            hasAccess={hasAccess}
            canDelete={canDelete}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskAssignee, setTaskAssignee] = useState('');
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const { auth } = useAuth();

  const refreshProject = async () => {
    const res = await api.get(`/projects/${id}`);
    setProject(res.data);
  };

  useEffect(() => {
    if (!id) return;
    Promise.all([
      api.get(`/projects/${id}`),
      api.get(`/projects/${id}/tasks`),
      api.get(`/projects/${id}/members`),
    ]).then(([projRes, tasksRes, membersRes]) => {
      setProject(projRes.data);
      setTasks(tasksRes.data);
      setMembers(membersRes.data);
    });
    if (auth?.role === 'ADMIN' || auth?.role === 'PROJECT_MANAGER') {
      api.get('/users').then(res => setAllUsers(res.data));
    }
  }, [id]);

  if (!project) return <div className="p-6 text-gray-400">Laden...</div>;

  const isOwner = project.owner.username === auth?.username;
  const canManageProject = auth?.role === 'ADMIN' || (auth?.role === 'PROJECT_MANAGER' && isOwner);
  const isMember = members.some(m => m.username === auth?.username);
  const hasAccess = auth?.role === 'ADMIN' || isOwner || isMember;
  const isActive = project.status === 'ACTIVE';
  const progress = project.totalTasks > 0 ? Math.round((project.doneTasks / project.totalTasks) * 100) : 0;

  const openTaskForm = (task?: Task) => {
    setEditingTask(task ?? null);
    setTaskTitle(task?.title ?? '');
    setTaskDescription(task?.description ?? '');
    setTaskAssignee(task?.assignedTo ? String(task.assignedTo.id) : '');
    setShowTaskForm(true);
  };

  const closeTaskForm = () => {
    setShowTaskForm(false);
    setEditingTask(null);
  };

  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: taskTitle,
      description: taskDescription,
      assignedToId: taskAssignee ? Number(taskAssignee) : null,
    };
    if (editingTask) {
      const res = await api.put(`/projects/${id}/tasks/${editingTask.id}`, payload);
      setTasks(prev => prev.map(t => t.id === editingTask.id ? res.data : t));
    } else {
      const res = await api.post(`/projects/${id}/tasks`, payload);
      setTasks(prev => [...prev, res.data]);
      await refreshProject();
    }
    closeTaskForm();
  };

  const deleteTask = async (taskId: number) => {
    await api.delete(`/projects/${id}/tasks/${taskId}`);
    setTasks(prev => prev.filter(t => t.id !== taskId));
    await refreshProject();
  };

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => String(t.id) === event.active.id);
    setActiveTask(task ?? null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = Number(active.id);
    const newStatus = over.id as TaskStatus;
    const task = tasks.find(t => t.id === taskId);

    if (!task || task.status === newStatus) return;

    // Lokalen State sofort aktualisieren, dann per API persistieren
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    await api.patch(`/projects/${id}/tasks/${taskId}/status`, { status: newStatus });
    await refreshProject();
  };

  const addMember = async (userId: number) => {
    await api.post(`/projects/${id}/members/${userId}`);
    const res = await api.get(`/projects/${id}/members`);
    setMembers(res.data);
  };

  const removeMember = async (userId: number) => {
    await api.delete(`/projects/${id}/members/${userId}`);
    setMembers(prev => prev.filter(m => m.id !== userId));
  };

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent";

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <Link to="/projects" className="text-sm text-blue-600 hover:underline">← Zurück</Link>

        <div className="flex items-center gap-3 mt-3 mb-1">
          <h1 className="text-2xl font-bold text-[#1e3a5f]">{project.name}</h1>
          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
            {isActive ? 'Aktiv' : 'Archiviert'}
          </span>
        </div>
        {project.description && <p className="text-gray-500 text-sm mb-1">{project.description}</p>}
        <p className="text-xs text-gray-400 mb-5">Projektleiter: {project.owner.username} · Erstellt: {project.createdAt}</p>

        <div className="mb-6 max-w-sm">
          <div className="flex justify-between text-xs text-gray-500 mb-1.5">
            <span className="font-medium">Fortschritt</span>
            <span>{project.doneTasks}/{project.totalTasks} ({progress}%)</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${progress === 100 ? 'bg-green-600' : 'bg-green-500'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          {progress === 100 && project.totalTasks > 0 && (
            <p className="text-xs text-green-600 font-medium mt-1.5">✓ Alle Aufgaben abgeschlossen</p>
          )}
        </div>

        <div className="flex gap-6 items-start">
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#1e3a5f]">Aufgaben</h2>
              {hasAccess && isActive && (
                <button
                  onClick={() => openTaskForm()}
                  className="bg-[#1e3a5f] hover:bg-[#254a78] text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors"
                >
                  + Aufgabe
                </button>
              )}
            </div>

            {showTaskForm && (
              <form onSubmit={handleTaskSubmit} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  {editingTask ? 'Aufgabe bearbeiten' : 'Neue Aufgabe'}
                </h4>
                <div className="flex flex-col gap-2">
                  <input placeholder="Titel" value={taskTitle} onChange={e => setTaskTitle(e.target.value)} required className={inputClass} />
                  <textarea placeholder="Beschreibung" value={taskDescription} onChange={e => setTaskDescription(e.target.value)} rows={2} className={inputClass} />
                  <select value={taskAssignee} onChange={e => setTaskAssignee(e.target.value)} className={inputClass}>
                    <option value="">Nicht zugewiesen</option>
                    {members.map(m => <option key={m.id} value={m.id}>{m.username}</option>)}
                  </select>
                  <div className="flex gap-2 mt-1">
                    <button type="submit" className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors">Speichern</button>
                    <button type="button" onClick={closeTaskForm} className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-4 py-1.5 rounded-lg transition-colors">Abbrechen</button>
                  </div>
                </div>
              </form>
            )}

            <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
              <div className="grid grid-cols-3 gap-4">
                {COLUMNS.map(col => (
                  <KanbanColumn
                    key={col.id}
                    column={col}
                    tasks={tasks.filter(t => t.status === col.id)}
                    isActive={isActive}
                    hasAccess={hasAccess}
                    canDelete={canManageProject}
                    onEdit={openTaskForm}
                    onDelete={deleteTask}
                  />
                ))}
              </div>
              <DragOverlay>
                {activeTask && (
                  <TaskCard
                    task={activeTask}
                    isActive={false}
                    hasAccess={false}
                    canDelete={false}
                    onEdit={() => {}}
                    onDelete={() => {}}
                    overlay
                  />
                )}
              </DragOverlay>
            </DndContext>
          </div>

          <div className="w-64 shrink-0 bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <h2 className="text-base font-semibold text-[#1e3a5f] mb-3">Teammitglieder</h2>
            <div className="flex flex-col gap-0">
              {members.map(member => (
                <div key={member.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <span className="text-sm font-medium text-gray-800">{member.username}</span>
                    {project.owner.id === member.id && (
                      <span className="ml-1.5 text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">PL</span>
                    )}
                    <p className="text-xs text-gray-400">{member.role}</p>
                  </div>
                  {canManageProject && project.owner.id !== member.id && isActive && (
                    <button
                      onClick={() => removeMember(member.id)}
                      className="text-gray-300 hover:text-red-400 transition-colors text-lg leading-none"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>

            {canManageProject && isActive && (
              <div className="mt-4">
                <p className="text-xs font-medium text-gray-500 mb-1.5">Mitglied hinzufügen</p>
                <select
                  onChange={e => { if (e.target.value) { addMember(Number(e.target.value)); e.target.value = ''; } }}
                  className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
                >
                  <option value="">Benutzer auswählen...</option>
                  {allUsers
                    .filter(u => !members.some(m => m.id === u.id))
                    .map(u => <option key={u.id} value={u.id}>{u.username} ({u.role})</option>)
                  }
                </select>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
