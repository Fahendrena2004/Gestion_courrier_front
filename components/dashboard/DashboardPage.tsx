'use client';

import React, { useEffect, useState } from 'react';
import { Mail, Clock, CheckCircle, FileText, Loader2 } from 'lucide-react';
import api from '@/lib/api';

interface Courrier {
  status: string;
  priority: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState({ total: 0, pending: 0, treated: 0, urgent: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/api/courriers');
        const courriers = Array.isArray(res.data) ? res.data : [];
        setStats({
          total: courriers.length,
           
          pending: courriers.filter((c: Courrier) => c.status === 'in_progress' || c.status === 'registered').length,
           
          treated: courriers.filter((c: Courrier) => c.status === 'treated' || c.status === 'archived').length,
           
          urgent: courriers.filter((c: Courrier) => c.priority === 'urgent' || c.priority === 'tres_urgent').length,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
     
    fetchStats();
  }, []);

  if (loading) return <div className="flex h-[80vh] items-center justify-center"><Loader2 className="animate-spin text-indigo-500 h-8 w-8" /></div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Tableau de Bord</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm font-medium">Total Courriers</p>
            <p className="text-3xl font-bold text-white mt-2">{stats.total}</p>
          </div>
          <div className="p-3 bg-indigo-500/10 rounded-lg"><Mail className="text-indigo-400 h-6 w-6" /></div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm font-medium">En Attente</p>
            <p className="text-3xl font-bold text-amber-400 mt-2">{stats.pending}</p>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-lg"><Clock className="text-amber-400 h-6 w-6" /></div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm font-medium">Traités</p>
            <p className="text-3xl font-bold text-emerald-400 mt-2">{stats.treated}</p>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-lg"><CheckCircle className="text-emerald-400 h-6 w-6" /></div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm font-medium">Urgents</p>
            <p className="text-3xl font-bold text-red-400 mt-2">{stats.urgent}</p>
          </div>
          <div className="p-3 bg-red-500/10 rounded-lg"><FileText className="text-red-400 h-6 w-6" /></div>
        </div>
      </div>
    </div>
  );
}
