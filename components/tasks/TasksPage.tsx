'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { CheckSquare, Plus, Pencil, Trash2, Search, X, Loader2, Save, ArrowRight, Check } from 'lucide-react';

interface Task {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals / Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Partial<Task> | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formStatus, setFormStatus] = useState<'pending' | 'in-progress' | 'completed'>('pending');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchTasks = async () => {
    try {
      const res = await api.get('/api/tasks');
      setTasks(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTasks();
  }, []);

  const openCreateModal = () => {
    setCurrentTask(null);
    setFormTitle('');
    setFormDescription('');
    setFormStatus('pending');
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setCurrentTask(task);
    setFormTitle(task.title);
    setFormDescription(task.description);
    setFormStatus(task.status);
    setError('');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = { title: formTitle, description: formDescription, status: formStatus };
      if (currentTask?.id) {
        await api.put(`/api/tasks/${currentTask.id}`, payload);
      } else {
        await api.post('/api/tasks', payload);
      }
      setIsModalOpen(false);
      await  
    fetchTasks();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Une erreur est survenue lors de l\'enregistrement.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (task: Task, newStatus: 'pending' | 'in-progress' | 'completed') => {
    try {
      await api.put(`/api/tasks/${task.id}`, { ...task, status: newStatus });
      await  
    fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Voulez-vous vraiment supprimer cette tâche ?')) return;
    try {
      await api.delete(`/api/tasks/${id}`);
      await  
    fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = tasks.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.description.toLowerCase().includes(search.toLowerCase())
  );

  const pendingTasks = filtered.filter(t => t.status === 'pending');
  const inProgressTasks = filtered.filter(t => t.status === 'in-progress');
  const completedTasks = filtered.filter(t => t.status === 'completed');

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <CheckSquare className="h-7 w-7 text-indigo-400" />
            Tâches
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Suivez et gérez ici les tâches associées aux courriers.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
        >
          <Plus className="h-5 w-5" />
          Nouvelle Tâche
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
          <Search className="h-5 w-5" />
        </span>
        <input
          type="text"
          className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-200 rounded-xl outline-none transition-all"
          placeholder="Rechercher par titre ou description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Kanban Board columns */}
      {loading ? (
        <div className="flex h-[40vh] items-center justify-center text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Pending Column */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-200 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-slate-500" />
                En attente ({pendingTasks.length})
              </h4>
            </div>
            <div className="space-y-3">
              {pendingTasks.map(t => (
                <TaskCard
                  key={t.id}
                  task={t}
                  onEdit={openEditModal}
                  onDelete={handleDelete}
                  nextStatus="in-progress"
                  nextLabel="Démarrer"
                  onUpdateStatus={handleUpdateStatus}
                />
              ))}
              {pendingTasks.length === 0 && (
                <div className="text-center py-8 text-xs text-slate-500">Aucune tâche en attente.</div>
              )}
            </div>
          </div>

          {/* In Progress Column */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-200 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                En cours ({inProgressTasks.length})
              </h4>
            </div>
            <div className="space-y-3">
              {inProgressTasks.map(t => (
                <TaskCard
                  key={t.id}
                  task={t}
                  onEdit={openEditModal}
                  onDelete={handleDelete}
                  nextStatus="completed"
                  nextLabel="Terminé"
                  onUpdateStatus={handleUpdateStatus}
                />
              ))}
              {inProgressTasks.length === 0 && (
                <div className="text-center py-8 text-xs text-slate-500">Aucune tâche en cours.</div>
              )}
            </div>
          </div>

          {/* Completed Column */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-200 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Terminé ({completedTasks.length})
              </h4>
            </div>
            <div className="space-y-3">
              {completedTasks.map(t => (
                <TaskCard
                  key={t.id}
                  task={t}
                  onEdit={openEditModal}
                  onDelete={handleDelete}
                  onUpdateStatus={handleUpdateStatus}
                />
              ))}
              {completedTasks.length === 0 && (
                <div className="text-center py-8 text-xs text-slate-500">Aucune tâche terminée.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-xl font-bold text-white mb-6">
              {currentTask ? 'Modifier la Tâche' : 'Nouvelle Tâche'}
            </h3>

            {error && (
              <div className="p-3 mb-4 text-sm text-red-200 bg-red-500/10 border border-red-500/20 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Titre
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-200 rounded-xl outline-none transition-all"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Description
                </label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-200 rounded-xl outline-none transition-all resize-none"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Statut
                </label>
                <select
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-200 rounded-xl outline-none transition-all"
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                >
                  <option value="pending">En attente</option>
                  <option value="in-progress">En cours</option>
                  <option value="completed">Terminé</option>
                </select>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-2.5 px-4 bg-slate-800 hover:bg-slate-755 text-slate-300 font-medium rounded-xl text-sm transition-all cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 py-2.5 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium rounded-xl text-sm transition-all cursor-pointer"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Inner helper card component
function TaskCard({
  task,
  onEdit,
  onDelete,
  nextStatus,
  nextLabel,
  onUpdateStatus
}: {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  nextStatus?: 'pending' | 'in-progress' | 'completed';
  nextLabel?: string;
  onUpdateStatus?: (task: Task, newStatus: 'pending' | 'in-progress' | 'completed') => void;
}) {
  return (
    <div className="p-5 bg-slate-950 border border-slate-850 rounded-xl hover:border-slate-700 hover:shadow-lg transition-all duration-200 space-y-4">
      <div className="space-y-1.5">
        <h5 className="font-bold text-slate-100 leading-snug">{task.title}</h5>
        <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">{task.description}</p>
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-slate-900/60">
        <div className="flex gap-1">
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-md transition-colors cursor-pointer"
            title="Modifier"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-1.5 bg-slate-900 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-md transition-colors cursor-pointer"
            title="Supprimer"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

        {nextStatus && onUpdateStatus && nextLabel && (
          <button
            onClick={() => onUpdateStatus(task, nextStatus)}
            className="flex items-center gap-1 py-1 px-2.5 bg-slate-900 hover:bg-indigo-500/20 text-slate-300 hover:text-indigo-400 border border-slate-800 hover:border-indigo-500/25 rounded-lg text-xs font-semibold transition-all cursor-pointer"
          >
            {nextStatus === 'completed' ? <Check className="h-3 w-3" /> : <ArrowRight className="h-3 w-3" />}
            {nextLabel}
          </button>
        )}
      </div>
    </div>
  );
}
