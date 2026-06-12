'use client';

import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { Mail, CheckSquare, Briefcase, Archive, Plus, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    courriers: 0,
    tasks: 0,
    services: 0,
    archives: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [c, t, s, a] = await Promise.all([
          api.get('/api/courriers'),
          api.get('/api/tasks'),
          api.get('/api/services'),
          api.get('/api/archives'),
        ]);

        setStats({
          courriers: Array.isArray(c.data) ? c.data.length : 0,
          tasks: Array.isArray(t.data) ? t.data.filter((x: any) => x.status !== 'completed').length : 0,
          services: Array.isArray(s.data) ? s.data.length : 0,
          archives: Array.isArray(a.data) ? a.data.length : 0,
        });
      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const cardStats = [
    { name: 'Courriers reçus', value: stats.courriers, icon: Mail, color: 'from-blue-500 to-cyan-500', link: '/courriers' },
    { name: 'Tâches en attente', value: stats.tasks, icon: CheckSquare, color: 'from-amber-500 to-orange-500', link: '/tasks' },
    { name: 'Services', value: stats.services, icon: Briefcase, color: 'from-emerald-500 to-teal-500', link: '/services' },
    { name: 'Archives', value: stats.archives, icon: Archive, color: 'from-indigo-500 to-purple-500', link: '/archives' },
  ];

  if (loading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          <p className="text-sm">Chargement de l'environnement de travail...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      {/* Welcome banner */}
      <div className="relative overflow-hidden p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-xl">
        <div className="absolute top-0 right-0 h-64 w-64 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="relative z-10 space-y-2">
          <h2 className="text-3xl font-extrabold tracking-tight text-white">
            Bienvenue sur votre espace de travail, <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">{user?.username}</span> !
          </h2>
          <p className="text-slate-400 max-w-xl text-sm leading-relaxed">
            C'est ici que vous pouvez gérer et suivre tous vos courriers, archives et tâches nécessaires.
          </p>
        </div>
      </div>

      {/* Grid statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cardStats.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.name} href={item.link}>
              <div className="group relative p-6 bg-slate-900 border border-slate-800 rounded-2xl hover:border-slate-700 transition-all duration-300 shadow-lg cursor-pointer overflow-hidden">
                <div className="absolute top-0 right-0 h-16 w-16 bg-white/2 rounded-full blur-md group-hover:scale-125 transition-transform duration-300" />
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 bg-gradient-to-tr ${item.color} rounded-xl shadow-md text-white`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-slate-600 group-hover:text-slate-400 group-hover:translate-x-1 transition-all" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-500">{item.name}</p>
                  <p className="text-3xl font-bold text-white tracking-tight">{item.value}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions Panel */}
      <div className="p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl">
        <h3 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2">
          Actions rapides
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/courriers?action=new">
            <button className="w-full flex items-center justify-between p-4 bg-slate-950/60 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl transition-all cursor-pointer">
              <span className="text-sm font-semibold text-slate-300">Ajouter un nouveau courrier</span>
              <Plus className="h-5 w-5 text-indigo-400" />
            </button>
          </Link>
          <Link href="/tasks?action=new">
            <button className="w-full flex items-center justify-between p-4 bg-slate-950/60 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl transition-all cursor-pointer">
              <span className="text-sm font-semibold text-slate-300">Créer une tâche</span>
              <Plus className="h-5 w-5 text-amber-400" />
            </button>
          </Link>
          <Link href="/archives?action=new">
            <button className="w-full flex items-center justify-between p-4 bg-slate-950/60 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl transition-all cursor-pointer">
              <span className="text-sm font-semibold text-slate-300">Ajouter une archive</span>
              <Plus className="h-5 w-5 text-purple-400" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
