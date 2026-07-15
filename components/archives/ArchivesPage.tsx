'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Archive, Trash2, Search, X, Loader2, Save, FileUp, Download } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface ArchiveItem {
  id: number;
  name: string;
  path: string;
  created_at: string;
}

export default function ArchivesPage() {
  const [archives, setArchives] = useState<ArchiveItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals / Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchArchives = async () => {
    try {
      const res = await api.get('/api/archives');
      setArchives(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchArchives();
  }, []);

  const openCreateModal = () => {
    setFormName('');
    setSelectedFile(null);
    setError('');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedFile) {
      setError('Veuillez sélectionner un fichier.');
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', formName);
      formData.append('file', selectedFile);

      await api.post('/api/archives', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setIsModalOpen(false);
      await  
    fetchArchives();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.error || 'Une erreur est survenue lors de l\'enregistrement.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Voulez-vous vraiment supprimer cette archive ?')) return;
    try {
      await api.delete(`/api/archives/${id}`);
      await  
    fetchArchives();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = archives.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    (a.path && a.path.toLowerCase().includes(search.toLowerCase()))
  );

  const getFileUrl = (path: string) => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003';
    // path is stored as absolute, but let's check format.
    // If it contains 'uploads\', we can parse it to serve from /uploads static path
    if (path && (path.includes('uploads/') || path.includes('uploads\\'))) {
      const parts = path.split(/[/\\]/);
      const filename = parts[parts.length - 1];
      return `${API_URL}/uploads/${filename}`;
    }
    return path;
  };

  const getFileName = (path: string) => {
    if (!path) return '';
    const parts = path.split(/[/\\]/);
    return parts[parts.length - 1];
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Archive className="h-7 w-7 text-indigo-400" />
            Gestion des Archives
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Ajoutez, enregistrez et téléchargez ici vos différents documents (PDF, Images, etc.).
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
        >
          <FileUp className="h-5 w-5" />
          Ajouter une Archive
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
          placeholder="Rechercher une archive par son nom..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Archives Grid */}
      {loading ? (
        <div className="flex h-[40vh] items-center justify-center text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl">
          <Archive className="h-12 w-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">Aucune archive trouvée.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {filtered.map((archive) => (
            <div
              key={archive.id}
              className="p-6 bg-slate-900 border border-slate-800 rounded-2xl hover:border-slate-700 hover:shadow-xl transition-all duration-300 relative overflow-hidden flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="font-bold text-lg text-slate-100 truncate">{archive.name}</div>
                <div className="text-xs text-slate-500 truncate mt-1">
                  Fichier : {getFileName(archive.path)}
                </div>
                <div className="text-xs text-slate-400">
                  Date : {formatDate(archive.created_at)}
                </div>
              </div>
              <div className="flex gap-2 justify-between items-center mt-6 pt-4 border-t border-slate-800/60">
                <a
                  href={getFileUrl(archive.path)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 py-1.5 px-3 bg-slate-850 hover:bg-indigo-500/10 text-slate-300 hover:text-indigo-400 border border-slate-800 hover:border-indigo-500/20 rounded-lg text-xs font-semibold transition-all"
                >
                  <Download className="h-3.5 w-3.5" />
                  Voir / Télécharger
                </a>
                <button
                  onClick={() => handleDelete(archive.id)}
                  className="p-2 bg-slate-850 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                  title="Supprimer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
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
              Ajouter une Nouvelle Archive
            </h3>

            {error && (
              <div className="p-3 mb-4 text-sm text-red-200 bg-red-500/10 border border-red-500/20 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Nom de l&apos;archive
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-200 rounded-xl outline-none transition-all"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Fichier
                </label>
                <div className="relative border border-dashed border-slate-800 hover:border-indigo-500/50 rounded-xl p-6 flex flex-col items-center justify-center bg-slate-950/20 transition-all">
                  <input
                    type="file"
                    required
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setSelectedFile(e.target.files[0]);
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <FileUp className="h-8 w-8 text-slate-500 mb-2" />
                  <span className="text-xs text-slate-400 text-center font-medium">
                    {selectedFile ? selectedFile.name : 'Cliquez ou glissez-déposez le fichier ici'}
                  </span>
                  {selectedFile && (
                    <span className="text-[10px] text-slate-500 mt-1">
                      ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  )}
                </div>
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
