'use client';

import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Mail, Plus, Pencil, Trash2, Search, X, Loader2, Save, Send } from 'lucide-react';

interface Courrier {
  id: number;
  subject: string;
  sender: string;
  recipient: string;
  content: string;
  status: 'draft' | 'sent' | 'archived';
  created_at: string;
}

export default function CourriersPage() {
  const [courriers, setCourriers] = useState<Courrier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals / Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCourrier, setCurrentCourrier] = useState<Partial<Courrier> | null>(null);
  const [formSubject, setFormSubject] = useState('');
  const [formSender, setFormSender] = useState('');
  const [formRecipient, setFormRecipient] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formStatus, setFormStatus] = useState<'draft' | 'sent' | 'archived'>('draft');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchCourriers = async () => {
    try {
      const res = await api.get('/api/courriers');
      setCourriers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourriers();
  }, []);

  const openCreateModal = () => {
    setCurrentCourrier(null);
    setFormSubject('');
    setFormSender('');
    setFormRecipient('');
    setFormContent('');
    setFormStatus('draft');
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (courrier: Courrier) => {
    setCurrentCourrier(courrier);
    setFormSubject(courrier.subject);
    setFormSender(courrier.sender);
    setFormRecipient(courrier.recipient);
    setFormContent(courrier.content);
    setFormStatus(courrier.status);
    setError('');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        subject: formSubject,
        sender: formSender,
        recipient: formRecipient,
        content: formContent,
        status: formStatus
      };
      if (currentCourrier?.id) {
        await api.put(`/api/courriers/${currentCourrier.id}`, payload);
      } else {
        await api.post('/api/courriers', payload);
      }
      setIsModalOpen(false);
      await fetchCourriers();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Une erreur est survenue lors de l\'enregistrement.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Voulez-vous vraiment supprimer ce courrier ?')) return;
    try {
      await api.delete(`/api/courriers/${id}`);
      await fetchCourriers();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = courriers.filter((c) =>
    c.subject.toLowerCase().includes(search.toLowerCase()) ||
    c.sender.toLowerCase().includes(search.toLowerCase()) ||
    c.recipient.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Mail className="h-7 w-7 text-indigo-400" />
            Gestion des Courriers
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Recevez, recherchez et gérez ici tous les courriers entrants et sortants.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
        >
          <Plus className="h-5 w-5" />
          Ajouter un Courrier
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
          placeholder="Rechercher par sujet, expéditeur ou destinataire..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* List / Table of Courriers */}
      {loading ? (
        <div className="flex h-[40vh] items-center justify-center text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl">
          <Mail className="h-12 w-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">Aucun courrier trouvé.</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/40">
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Sujet</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Expéditeur</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Destinataire</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Statut</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Date</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((courrier) => (
                  <tr key={courrier.id} className="hover:bg-slate-800/25 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-100">{courrier.subject}</div>
                      <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">{courrier.content}</div>
                    </td>
                    <td className="p-4 text-sm text-slate-300">{courrier.sender}</td>
                    <td className="p-4 text-sm text-slate-300">{courrier.recipient}</td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          courrier.status === 'sent'
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                            : courrier.status === 'archived'
                            ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                            : 'bg-slate-800 border-slate-700 text-slate-400'
                        }`}
                      >
                        {courrier.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-400">
                      {new Date(courrier.created_at).toLocaleDateString('mg-MG')}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => openEditModal(courrier)}
                          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
                          title="Modifier"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(courrier.id)}
                          className="p-2 bg-slate-850 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg p-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl relative overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-xl font-bold text-white mb-6">
              {currentCourrier ? 'Modifier le Courrier' : 'Ajouter un Nouveau Courrier'}
            </h3>

            {error && (
              <div className="p-3 mb-4 text-sm text-red-200 bg-red-500/10 border border-red-500/20 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Sujet
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-200 rounded-xl outline-none transition-all"
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Expéditeur
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-200 rounded-xl outline-none transition-all"
                    value={formSender}
                    onChange={(e) => setFormSender(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Destinataire
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-200 rounded-xl outline-none transition-all"
                    value={formRecipient}
                    onChange={(e) => setFormRecipient(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Contenu
                </label>
                <textarea
                  rows={5}
                  className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-200 rounded-xl outline-none transition-all resize-none"
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
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
                  <option value="draft">Brouillon</option>
                  <option value="sent">Envoyé</option>
                  <option value="archived">Archivé</option>
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
