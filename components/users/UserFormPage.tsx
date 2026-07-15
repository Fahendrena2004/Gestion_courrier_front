'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import { Users, Loader2, Save, ArrowLeft } from 'lucide-react';

export default function UserFormPage() {
  const router = useRouter();
  const params = useParams();
  const isEditMode = !!params?.id;
  const currentId = params?.id as string;

  const [services, setServices] = useState<{id: number; name: string}[]>([]);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'agent',
    service_id: ''
  });

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await api.get('/api/services');
        setServices(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error(err);
      }
    };
     
    fetchServices();

    if (isEditMode) {
      api.get(`/api/users/${currentId}`)
        .then(res => {
          setFormData({
            username: res.data.username || '',
            email: res.data.email || '',
            password: '',
            role: res.data.role || 'agent',
            service_id: res.data.service_id || ''
          });
        })
        .catch(err => {
          console.error(err);
          setError("Erreur de chargement.");
        })
        .finally(() => setLoading(false));
    }
  }, [isEditMode, currentId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    
    const payload = { ...formData };
    if (isEditMode && !payload.password) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (payload as any).password;
    }
    
    try {
      if (isEditMode) {
        await api.put(`/api/users/${currentId}`, payload);
      } else {
        await api.post('/api/users', payload);
      }
      router.push('/users');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.error || "Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-indigo-500 h-8 w-8" /></div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.push('/users')} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="h-6 w-6 text-indigo-400" />
            {isEditMode ? 'Modifier Utilisateur' : 'Nouvel Utilisateur'}
          </h2>
        </div>
      </div>

      {error && <div className="p-4 bg-red-500/10 text-red-400 rounded-xl">{error}</div>}

      <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-5">
        
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase">Nom d&apos;utilisateur</label>
          <input required name="username" value={formData.username} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase">Email</label>
          <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase">
            Mot de passe {isEditMode && <span className="text-slate-500 normal-case">(Laisser vide pour ne pas changer)</span>}
          </label>
          <input required={!isEditMode} type="password" name="password" value={formData.password} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase">Rôle</label>
            <select name="role" value={formData.role} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white">
              <option value="agent">Agent</option>
              <option value="chef_service">Chef de service</option>
              <option value="bureau_ordre">Bureau d&apos;ordre</option>
              <option value="directeur">Directeur</option>
              <option value="admin">Administrateur</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase">Service rattaché</label>
            <select name="service_id" value={formData.service_id} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white">
              <option value="">-- Aucun --</option>
              {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors">
            {saving ? <Loader2 className="animate-spin h-5 w-5" /> : <Save className="h-5 w-5" />}
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  );
}
