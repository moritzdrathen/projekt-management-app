import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FolderOpen } from 'lucide-react';
import api from '../api/axios';
import { Project } from '../types';
import { useAuth } from '../context/AuthContext';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const { auth } = useAuth();

  const canCreate = auth?.role === 'ADMIN' || auth?.role === 'PROJECT_MANAGER';

  useEffect(() => {
    api.get('/projects').then(res => setProjects(res.data));
  }, []);

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await api.post('/projects', { name, description });
    setProjects(prev => [...prev, res.data]);
    setShowForm(false);
    setName('');
    setDescription('');
  };

  const archiveProject = async (id: number) => {
    const res = await api.patch(`/projects/${id}/archive`);
    setProjects(prev => prev.map(p => p.id === id ? res.data : p));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#1e3a5f]">Projekte</h1>
          {canCreate && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-[#1e3a5f] hover:bg-[#254a78] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              + Neues Projekt
            </button>
          )}
        </div>

        {showForm && (
          <form
            onSubmit={createProject}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6"
          >
            <h3 className="text-base font-semibold text-gray-800 mb-4">Neues Projekt anlegen</h3>
            <input
              placeholder="Projektname"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
            />
            <textarea
              placeholder="Beschreibung"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
            />
            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                Erstellen
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                Abbrechen
              </button>
            </div>
          </form>
        )}

        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <FolderOpen size={48} strokeWidth={1.5} className="mb-4" />
            <p className="text-lg font-medium">Keine Projekte vorhanden</p>
            <p className="text-sm mt-1">Erstelle ein neues Projekt, um loszulegen.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map(project => {
              const progress = project.totalTasks > 0
                ? Math.round((project.doneTasks / project.totalTasks) * 100)
                : 0;
              const isOwner = project.owner.username === auth?.username;
              const canManage = auth?.role === 'ADMIN' || (auth?.role === 'PROJECT_MANAGER' && isOwner);
              const isActive = project.status === 'ACTIVE';

              return (
                <div
                  key={project.id}
                  className={`bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3 transition-shadow hover:shadow-md ${
                    !isActive ? 'opacity-70' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-[#1e3a5f] text-base leading-tight">{project.name}</h3>
                    <span
                      className={`shrink-0 text-xs font-medium px-2.5 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {isActive ? 'Aktiv' : 'Archiviert'}
                    </span>
                  </div>

                  {project.description && (
                    <p className="text-gray-500 text-sm leading-snug line-clamp-2">{project.description}</p>
                  )}

                  <p className="text-xs text-gray-400">Projektleiter: {project.owner.username}</p>

                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                      <span>Fortschritt</span>
                      <span>{project.doneTasks}/{project.totalTasks} ({progress}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full transition-all ${progress === 100 ? 'bg-green-600' : 'bg-green-500'}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    {progress === 100 && project.totalTasks > 0 && (
                      <p className="text-xs text-green-600 font-medium mt-1">✓ Abgeschlossen</p>
                    )}
                  </div>

                  <div className="flex gap-2 mt-1">
                    <Link
                      to={`/projects/${project.id}`}
                      className="bg-[#1e3a5f] hover:bg-[#254a78] text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Details
                    </Link>
                    {canManage && isActive && (
                      <button
                        onClick={() => archiveProject(project.id)}
                        className="bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Archivieren
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
