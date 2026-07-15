'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Mail, Plus, Pencil, Trash2, Search, Loader2, Download } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface Courrier {
  id: number;
  reference: string;
  type: 'arrive' | 'depart' | 'interne';
  sender_id: number | null;
  recipient_id: number | null;
  subject: string;
  date_courrier: string | null;
  date_reception: string | null;
  priority: 'normal' | 'urgent' | 'tres_urgent' | null;
  status: 'draft' | 'registered' | 'assigned' | 'in_progress' | 'treated' | 'archived';
  file_path: string | null;
  created_by: number | null;
  service_id: number | null;
  assigned_to: number | null;
  sender_name?: string;
  recipient_name?: string;
}

export default function CourriersPage() {
  const router = useRouter();
  const [courriers, setCourriers] = useState<Courrier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const resCourriers = await api.get('/api/courriers');
      setCourriers(Array.isArray(resCourriers.data) ? resCourriers.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
     
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Voulez-vous vraiment supprimer ce courrier ?')) return;
    try {
      await api.delete(`/api/courriers/${id}`);
      await  
    fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = courriers.filter((c) =>
    (c.reference && c.reference.toLowerCase().includes(search.toLowerCase())) ||
    (c.subject && c.subject.toLowerCase().includes(search.toLowerCase()))
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
            Recevez, recherchez et gérez ici tous les courriers entrants, sortants et internes.
          </p>
        </div>
        <button
          onClick={() => router.push('/courriers/create')}
          className="flex items-center gap-2 py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
        >
          <Plus className="h-5 w-5" />
          Nouveau Courrier
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
          placeholder="Rechercher par référence ou objet..."
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
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/40">
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Réf & Objet</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Type & Intervenant</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Dates</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Statut / Priorité</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Fichier</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((courrier) => (
                  <tr key={courrier.id} className="hover:bg-slate-800/25 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-100">{courrier.reference}</div>
                      <div className="text-xs text-slate-500 truncate max-w-xs mt-0.5" title={courrier.subject}>{courrier.subject}</div>
                    </td>
                    <td className="p-4 text-sm text-slate-300">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase mb-1 ${courrier.type === 'arrive' ? 'bg-cyan-500/10 text-cyan-400' : courrier.type === 'depart' ? 'bg-fuchsia-500/10 text-fuchsia-400' : 'bg-orange-500/10 text-orange-400'}`}>
                        {courrier.type}
                      </span>
                      <div className="text-xs text-slate-400">
                        {courrier.type === 'arrive' 
                          ? `Exp: ${courrier.sender_name || '-'}` 
                          : `Dest: ${courrier.recipient_name || '-'}`}
                      </div>
                    </td>
                    <td className="p-4 text-xs text-slate-400 space-y-1">
                      {courrier.date_reception && <div>Recu: {formatDate(courrier.date_reception)}</div>}
                      {courrier.date_courrier && <div>Emis: {formatDate(courrier.date_courrier)}</div>}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1.5 items-start">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                          courrier.status === 'treated' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                          : courrier.status === 'archived' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                          : courrier.status === 'in_progress' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                        }`}>
                          {courrier.status}
                        </span>
                        {courrier.priority && (
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${
                            courrier.priority === 'urgent' || courrier.priority === 'tres_urgent' ? 'text-red-400' : 'text-slate-500'
                          }`}>
                            Priorité: {courrier.priority}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      {courrier.file_path ? (
                        <a href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003'}/uploads/${courrier.file_path}`} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 transition-colors" title="Télécharger">
                          <Download className="h-5 w-5" />
                        </a>
                      ) : (
                        <span className="text-slate-600 text-xs">-</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => router.push(`/courriers/edit/${courrier.id}`)} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer" title="Modifier">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(courrier.id)} className="p-2 bg-slate-850 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg transition-colors cursor-pointer" title="Supprimer">
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
    </div>
  );
}
