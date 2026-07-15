'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import { Mail, Loader2, Save, FileUp, ArrowLeft } from 'lucide-react';

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
  service_id: number | null;
}

interface Contact {
  id: number;
  name: string;
}

interface Service {
  id: number;
  name: string;
}

export default function CourrierFormPage() {
  const router = useRouter();
  const params = useParams();
  const isEditMode = !!params?.id;
  const currentId = params?.id as string;

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const generateReference = () => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `REF-${year}-${randomNum}`;
  };

  const initialFormState: Partial<Courrier> = {
    type: 'arrive',
    sender_id: null,
    recipient_id: null,
    subject: '',
    date_reception: new Date().toISOString().split('T')[0],
    date_courrier: '',
    priority: 'normal',
    status: 'registered',
    service_id: null,
  };

  const [formData, setFormData] = useState<Partial<Courrier>>(() => ({
    ...initialFormState,
    reference: generateReference()
  }));
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [resContacts, resServices] = await Promise.all([
          api.get('/api/contacts').catch(() => ({ data: [] })),
          api.get('/api/services').catch(() => ({ data: [] }))
        ]);
        setContacts(Array.isArray(resContacts.data) ? resContacts.data : []);
        setServices(Array.isArray(resServices.data) ? resServices.data : []);

        if (isEditMode) {
          const resCourrier = await api.get(`/api/courriers/${currentId}`);
          const courrier = resCourrier.data;
          setFormData({
            reference: courrier.reference || '',
            type: courrier.type || 'arrive',
            sender_id: courrier.sender_id || null,
            recipient_id: courrier.recipient_id || null,
            subject: courrier.subject || '',
            date_reception: courrier.date_reception ? new Date(courrier.date_reception).toISOString().split('T')[0] : '',
            date_courrier: courrier.date_courrier ? new Date(courrier.date_courrier).toISOString().split('T')[0] : '',
            priority: courrier.priority || 'normal',
            status: courrier.status || 'registered',
            service_id: courrier.service_id || null,
          });
        }
      } catch (err) {
        console.error(err);
        setError("Erreur lors du chargement des données.");
      } finally {
        setLoading(false);
      }
    };

     
    fetchInitialData();
  }, [isEditMode, currentId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? null : value
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        const val = (formData as Record<string, unknown>)[key];
        if (val !== null && val !== undefined) {
          submitData.append(key, String(val));
        }
      });
      if (selectedFile) {
        submitData.append('file_path', selectedFile);
      }

      if (isEditMode) {
        await api.put(`/api/courriers/${currentId}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/api/courriers', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      
      router.push('/courriers');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.push('/courriers')} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors cursor-pointer">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Mail className="h-6 w-6 text-indigo-400" />
            {isEditMode ? 'Modifier le Courrier' : 'Nouveau Courrier'}
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            {isEditMode ? 'Modifiez les informations du courrier existant.' : 'Enregistrez un nouveau courrier dans le système.'}
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <form onSubmit={handleSave} className="p-6 md:p-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-5">
              <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-2">Informations Générales</h3>
              
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Référence (Générée automatiquement)</label>
                <input 
                  type="text" 
                  name="reference" 
                  readOnly
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 text-slate-400 rounded-xl outline-none cursor-not-allowed select-none" 
                  value={formData.reference || ''} 
                  onChange={handleChange} 
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Type</label>
                <div className="flex gap-4">
                  {['arrive', 'depart', 'interne'].map((type) => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer group">
                      <input 
                        type="radio" 
                        name="type" 
                        value={type}
                        checked={formData.type === type}
                        onChange={handleChange}
                        className="w-4 h-4 text-indigo-500 bg-slate-900 border-slate-700 focus:ring-indigo-500 focus:ring-offset-slate-900"
                      />
                      <span className="text-sm text-slate-300 group-hover:text-white capitalize">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Objet du courrier</label>
                <textarea 
                  name="subject" 
                  required
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-200 rounded-xl outline-none transition-colors resize-none" 
                  value={formData.subject || ''} 
                  onChange={handleChange}
                  placeholder="Ex: Demande de partenariat..."
                />
              </div>
            </div>

            <div className="space-y-5">
              <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-2">Acteurs & Dates</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Expéditeur</label>
                  <select 
                    name="sender_id" 
                    className={`w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-200 rounded-xl outline-none transition-colors ${formData.type === 'depart' ? 'opacity-50 cursor-not-allowed' : ''}`} 
                    value={formData.sender_id || ''} 
                    onChange={handleChange}
                    disabled={formData.type === 'depart'}
                  >
                    <option value="">-- Sélectionner --</option>
                    {contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Destinataire</label>
                  <select 
                    name="recipient_id" 
                    className={`w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-200 rounded-xl outline-none transition-colors ${formData.type === 'arrive' ? 'opacity-50 cursor-not-allowed' : ''}`} 
                    value={formData.recipient_id || ''} 
                    onChange={handleChange}
                    disabled={formData.type === 'arrive'}
                  >
                    <option value="">-- Sélectionner --</option>
                    {contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Date du Courrier</label>
                  <input 
                    type="date" 
                    name="date_courrier" 
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-200 rounded-xl outline-none transition-colors custom-date-input" 
                    value={formData.date_courrier || ''} 
                    onChange={handleChange} 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Date de Réception</label>
                  <input 
                    type="date" 
                    name="date_reception" 
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-200 rounded-xl outline-none transition-colors custom-date-input" 
                    value={formData.date_reception || ''} 
                    onChange={handleChange} 
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-950/50 p-6 rounded-xl border border-slate-800/60 space-y-5">
            <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-2 mb-4">Suivi & Pièces jointes</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Priorité</label>
                <select 
                  name="priority" 
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 focus:border-indigo-500 text-slate-200 rounded-xl outline-none transition-colors" 
                  value={formData.priority || ''} 
                  onChange={handleChange}
                >
                  <option value="normal">Normal</option>
                  <option value="urgent">Urgent</option>
                  <option value="tres_urgent">Très Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Statut</label>
                <select 
                  name="status" 
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 focus:border-indigo-500 text-slate-200 rounded-xl outline-none transition-colors" 
                  value={formData.status || ''} 
                  onChange={handleChange}
                >
                  <option value="draft">Brouillon</option>
                  <option value="registered">Enregistré</option>
                  <option value="assigned">Assigné</option>
                  <option value="in_progress">En traitement</option>
                  <option value="treated">Traité</option>
                  <option value="archived">Archivé</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Service Assigné</label>
                <select 
                  name="service_id" 
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 focus:border-indigo-500 text-slate-200 rounded-xl outline-none transition-colors" 
                  value={formData.service_id || ''} 
                  onChange={handleChange}
                >
                  <option value="">-- Aucun --</option>
                  {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Fichier Joint (Optionnel)</label>
              <div className="relative border-2 border-dashed border-slate-700 hover:border-indigo-500/50 rounded-xl p-8 flex flex-col items-center justify-center bg-slate-900/50 transition-all group">
                <input 
                  type="file" 
                  name="file_path"
                  onChange={(e) => { if (e.target.files && e.target.files.length > 0) setSelectedFile(e.target.files[0]); }} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                />
                <div className="bg-slate-800 p-3 rounded-full mb-3 group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-colors">
                  <FileUp className="h-6 w-6 text-slate-400 group-hover:text-indigo-400" />
                </div>
                <span className="text-sm text-slate-300 text-center font-medium">
                  {selectedFile ? (
                    <span className="text-indigo-300 font-bold">{selectedFile.name}</span>
                  ) : (
                    'Cliquez ou glissez-déposez un document PDF, Image ou Word ici'
                  )}
                </span>
                {!selectedFile && <span className="text-xs text-slate-500 mt-2">Taille maximale : 10 Mo</span>}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-end pt-6 border-t border-slate-800">
            <button 
              type="button" 
              onClick={() => router.push('/courriers')} 
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
              {isEditMode ? 'Enregistrer les modifications' : 'Créer le Courrier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
