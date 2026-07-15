'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Users, Plus, Pencil, Trash2, Shield, Loader2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  service_id: number | null;
  service_name?: string;
  is_active: boolean;
  created_at: string;
}

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/users');
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
     
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUsers();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Voulez-vous vraiment désactiver cet utilisateur ?')) return;
    try {
      await api.delete(`/api/users/${id}`);
      await  
    fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const getRoleColor = (role: string) => {
    switch(role) {
      case 'admin': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'bureau_ordre': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'directeur': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'chef_service': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'agent': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      default: return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Users className="h-7 w-7 text-indigo-400" />
            Utilisateurs & Droits
          </h2>
          <p className="text-slate-400 text-sm mt-1">Gérez les comptes, les rôles et l&apos;accès au système.</p>
        </div>
        <button
          onClick={() => router.push('/users/create')}
          className="flex items-center gap-2 py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
        >
          <Plus className="h-5 w-5" />
          Nouvel Utilisateur
        </button>
      </div>

      {loading ? (
        <div className="flex h-[40vh] items-center justify-center text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        </div>
      ) : users.length === 0 ? (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl">
          <Users className="h-12 w-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">Aucun utilisateur enregistré.</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/40">
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Utilisateur</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Rôle</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Service</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Inscription</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/25 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center text-indigo-400 font-bold border border-slate-700">
                          {u.username.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-100">{u.username}</div>
                          <div className="text-xs text-slate-500">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getRoleColor(u.role)}`}>
                        <Shield className="h-3 w-3 mr-1" />
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-300">
                      {u.service_name ? (
                        <span className="bg-slate-800 px-2.5 py-1 rounded text-xs font-medium text-slate-300">
                          {u.service_name}
                        </span>
                      ) : (
                        <span className="text-slate-600 italic text-xs">Aucun</span>
                      )}
                    </td>
                    <td className="p-4 text-sm text-slate-400">
                      {formatDate(u.created_at)}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => router.push(`/users/edit/${u.id}`)} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer" title="Modifier">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(u.id)} className="p-2 bg-slate-850 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg transition-colors cursor-pointer" title="Désactiver">
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
