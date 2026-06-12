'use client';

import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Users, Plus, Pencil, Trash2, Search, X, Loader2, Save } from 'lucide-react';

interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string;
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modals / Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentContact, setCurrentContact] = useState<Partial<Contact> | null>(null);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchContacts = async () => {
    try {
      const res = await api.get('/api/contacts');
      setContacts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const openCreateModal = () => {
    setCurrentContact(null);
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (contact: Contact) => {
    setCurrentContact(contact);
    setFormName(contact.name);
    setFormEmail(contact.email);
    setFormPhone(contact.phone);
    setError('');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = { name: formName, email: formEmail, phone: formPhone };
      if (currentContact?.id) {
        await api.put(`/api/contacts/${currentContact.id}`, payload);
      } else {
        await api.post('/api/contacts', payload);
      }
      setIsModalOpen(false);
      await fetchContacts();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Une erreur est survenue lors de l\'enregistrement.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Voulez-vous vraiment supprimer ce contact ?')) return;
    try {
      await api.delete(`/api/contacts/${id}`);
      await fetchContacts();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = contacts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Users className="h-7 w-7 text-indigo-400" />
            Liste des Contacts
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Gérez ici vos contacts et leurs détails.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
        >
          <Plus className="h-5 w-5" />
          Ajouter un Contact
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
          placeholder="Rechercher par nom, email ou téléphone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Contacts List Grid */}
      {loading ? (
        <div className="flex h-[40vh] items-center justify-center text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl">
          <Users className="h-12 w-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">Aucun contact trouvé.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((contact) => (
            <div
              key={contact.id}
              className="p-6 bg-slate-900 border border-slate-800 rounded-2xl hover:border-slate-700 hover:shadow-xl transition-all duration-300 relative group overflow-hidden"
            >
              <div className="space-y-3">
                <div className="font-bold text-lg text-slate-100 truncate">{contact.name}</div>
                <div className="text-sm text-slate-400 truncate">{contact.email}</div>
                <div className="text-sm text-slate-400">{contact.phone}</div>
              </div>
              <div className="flex gap-2 justify-end mt-6 pt-4 border-t border-slate-800/60">
                <button
                  onClick={() => openEditModal(contact)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
                  title="Modifier"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(contact.id)}
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
              {currentContact ? 'Modifier le Contact' : 'Ajouter un Nouveau Contact'}
            </h3>

            {error && (
              <div className="p-3 mb-4 text-sm text-red-200 bg-red-500/10 border border-red-500/20 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Nom complet
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
                  Adresse Email
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-200 rounded-xl outline-none transition-all"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Numéro de téléphone
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-200 rounded-xl outline-none transition-all"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                />
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
