'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import { Briefcase, Loader2, Save, ArrowLeft } from 'lucide-react';

interface Service {
  id_servi: number;
  nom_servi: string;
  descrip_servi: string;
}

export default function ServiceFormPage() {
  const router = useRouter();
  const params = useParams();
  const isEditMode = !!params?.id;
  const currentId = params?.id as string;

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<Partial<Service>>({
    nom_servi: '',
    descrip_servi: ''
  });

  useEffect(() => {
    if (isEditMode) {
      const fetchService = async () => {
        try {
          const res = await api.get(`/api/services/${currentId}`);
          setFormData({
            nom_servi: res.data.nom_servi || '',
            descrip_servi: res.data.descrip_servi || ''
          });
        } catch (err) {
          console.error(err);
          setError("Erreur lors du chargement des données.");
        } finally {
          setLoading(false);
        }
      };
       
    fetchService();
    }
  }, [isEditMode, currentId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        nom_servi: formData.nom_servi,
        descrip_servi: formData.descrip_servi
      };

      if (isEditMode) {
        await api.put(`/api/services/${currentId}`, payload);
      } else {
        await api.post('/api/services', payload);
      }
      
      router.push('/services');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Une erreur est survenue lors de l\'enregistrement.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/services')}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors cursor-pointer"
            title="Retour à la liste"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Briefcase className="h-7 w-7 text-indigo-400" />
              {isEditMode ? 'Modifier le Service' : 'Nouveau Service'}
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Renseignez le nom et la description du service.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 md:p-8">
        {error && (
          <div className="p-4 mb-6 text-sm text-red-200 bg-red-500/10 border border-red-500/20 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-slate-950/50 p-6 rounded-xl border border-slate-800/60 space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Nom du service
              </label>
              <input 
                type="text" 
                name="nom_servi" 
                required 
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 focus:border-indigo-500 text-slate-200 rounded-xl outline-none transition-colors" 
                value={formData.nom_servi || ''} 
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Description
              </label>
              <textarea 
                name="descrip_servi" 
                rows={4} 
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 focus:border-indigo-500 text-slate-200 rounded-xl outline-none resize-none transition-colors" 
                value={formData.descrip_servi || ''} 
                onChange={handleChange} 
              />
            </div>
          </div>

          <div className="flex gap-4 justify-end pt-6 border-t border-slate-800">
            <button 
              type="button" 
              onClick={() => router.push('/services')} 
              className="py-3 px-6 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-all cursor-pointer"
            >
              Annuler
            </button>
            <button 
              type="submit" 
              disabled={saving} 
              className="flex items-center gap-2 py-3 px-8 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold rounded-xl transition-all cursor-pointer shadow-lg shadow-indigo-500/20"
            >
              {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
              {isEditMode ? 'Enregistrer les modifications' : 'Créer le Service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
