'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Briefcase, Plus, Pencil, Trash2, Search, Loader2 } from 'lucide-react';

interface Service {
  id_servi: number;
  nom_servi: string;
  descrip_servi: string;
}

export default function ServicesPage() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchServices = async () => {
    try {
      const res = await api.get('/api/services');
      setServices(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchServices();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Voulez-vous vraiment supprimer ce service ?')) return;
    try {
      await api.delete(`/api/services/${id}`);
      await  
    fetchServices();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = services.filter((s) =>
    (s.nom_servi && s.nom_servi.toLowerCase().includes(search.toLowerCase())) ||
    (s.descrip_servi && s.descrip_servi.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Briefcase className="h-7 w-7 text-indigo-400" />
            Services
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Gérez ici les services ou départements impliqués dans la gestion des courriers.
          </p>
        </div>
        <button
          onClick={() => router.push('/services/create')}
          className="flex items-center gap-2 py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
        >
          <Plus className="h-5 w-5" />
          Nouveau Service
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
          placeholder="Rechercher par nom ou description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="flex h-[40vh] items-center justify-center text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl">
          <Briefcase className="h-12 w-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">Aucun service trouvé.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {filtered.map((service) => (
            <div
              key={service.id_servi}
              className="p-6 bg-slate-900 border border-slate-800 rounded-2xl hover:border-slate-700 hover:shadow-xl transition-all duration-300 relative overflow-hidden flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="font-bold text-lg text-slate-100 truncate">{service.nom_servi}</div>
                <p className="text-sm text-slate-400 line-clamp-3 leading-relaxed">
                  {service.descrip_servi || 'Aucune description.'}
                </p>
              </div>
              <div className="flex gap-2 justify-end mt-6 pt-4 border-t border-slate-800/60">
                <button
                  onClick={() => router.push(`/services/edit/${service.id_servi}`)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
                  title="Modifier"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(service.id_servi)}
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
    </div>
  );
}
