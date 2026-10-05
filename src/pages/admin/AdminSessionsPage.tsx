import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Session, SessionType } from '../../types';
import { getAllSessions, saveAllSessions } from '../../services/sessionService';
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  Trash2,
  Edit2,
  ArrowLeft,
  Check,
  AlertCircle,
  Users,
} from 'lucide-react';

export const AdminSessionsPage: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>(getAllSessions());
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [formData, setFormData] = useState<Partial<Session>>({
    title: '',
    description: '',
    startTime: '10:00',
    endTime: '11:00',
    room: 'IUA, Campus Bonoumin',
    theme: 'Intelligence Artificielle',
    type: 'Conférence',
    level: 'Tous niveaux',
    maxSeats: 50,
    speakerIds: [],
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.startTime || !formData.endTime) return;

    if (editingSession) {
      const updated = sessions.map((s) =>
        s.id === editingSession.id ? ({ ...s, ...formData } as Session) : s
      );
      setSessions(updated);
      saveAllSessions(updated);
      setEditingSession(null);
    } else {
      const newSession: Session = {
        id: `sess-${Date.now().toString(36)}`,
        day: 1,
        title: formData.title || 'Nouvelle session',
        description: formData.description || '',
        startTime: formData.startTime || '10:00',
        endTime: formData.endTime || '11:00',
        room: formData.room || 'Salle A',
        theme: formData.theme || 'Tech',
        type: (formData.type as SessionType) || 'Conférence',
        level: formData.level || 'Tous niveaux',
        maxSeats: formData.maxSeats,
        registeredCount: 0,
        speakerIds: formData.speakerIds || [],
      };
      const updated = [...sessions, newSession];
      setSessions(updated);
      saveAllSessions(updated);
      setIsCreating(false);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette session ?')) {
      const updated = sessions.filter((s) => s.id !== id);
      setSessions(updated);
      saveAllSessions(updated);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7FAF7] pb-16">
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/admin/dashboard"
              className="p-2 text-neutral-500 hover:text-neutral-900 rounded-lg hover:bg-neutral-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="font-display font-black text-lg text-neutral-900">
              Gestion du Programme & Ateliers
            </h1>
          </div>

          <button
            onClick={() => {
              setFormData({
                title: '',
                description: '',
                startTime: '14:00',
                endTime: '15:30',
                room: 'Atelier Tech 1',
                theme: 'Atelier Pratique',
                type: 'Atelier',
                level: 'Intermédiaire',
                maxSeats: 40,
                speakerIds: [],
              });
              setEditingSession(null);
              setIsCreating(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#075B22] hover:bg-[#064e1d] text-white rounded-xl text-xs font-bold shadow transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter une Session</span>
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-8">
        {/* Modal / Form for Creation & Edit */}
        {(isCreating || editingSession) && (
          <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-lg mb-8">
            <h2 className="font-display font-bold text-lg text-neutral-900 mb-4">
              {editingSession ? 'Modifier la session' : 'Créer une nouvelle session'}
            </h2>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Titre de la session</label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Début</label>
                  <input
                    type="text"
                    value={formData.startTime || ''}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    placeholder="09:30"
                    className="w-full p-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Fin</label>
                  <input
                    type="text"
                    value={formData.endTime || ''}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    placeholder="10:30"
                    className="w-full p-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Format</label>
                  <select
                    value={formData.type || 'Conférence'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as SessionType })}
                    className="w-full p-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                  >
                    <option value="Keynote">Keynote</option>
                    <option value="Conférence">Conférence</option>
                    <option value="Panel">Panel</option>
                    <option value="Atelier">Atelier</option>
                    <option value="Pause">Pause</option>
                    <option value="Prière">Prière</option>
                    <option value="Networking">Networking</option>
                    <option value="Clôture">Clôture</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Jauge max (Places)</label>
                  <input
                    type="number"
                    value={formData.maxSeats || 50}
                    onChange={(e) => setFormData({ ...formData, maxSeats: Number(e.target.value) })}
                    className="w-full p-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Salle / Lieu</label>
                  <input
                    type="text"
                    value={formData.room || ''}
                    onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                    placeholder="IUA, Campus Bonoumin"
                    className="w-full p-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Thématique</label>
                  <input
                    type="text"
                    value={formData.theme || ''}
                    onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                    placeholder="Intelligence Artificielle"
                    className="w-full p-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingSession(null);
                  }}
                  className="px-4 py-2 text-neutral-600 font-bold hover:bg-neutral-100 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#075B22] text-white font-bold rounded-xl shadow"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Sessions List */}
        <div className="space-y-3">
          {sessions.map((s) => (
            <div
              key={s.id}
              className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-neutral-600 bg-neutral-100 px-2 py-1 rounded">
                  {s.startTime} - {s.endTime}
                </span>

                <div>
                  <h3 className="font-bold text-sm text-neutral-900">{s.title}</h3>
                  <div className="flex items-center gap-3 text-[11px] text-neutral-500 mt-0.5">
                    <span>📍 {s.room}</span>
                    <span>•</span>
                    <span className="font-semibold text-[#075B22]">{s.type}</span>
                    {s.maxSeats && (
                      <>
                        <span>•</span>
                        <span className="font-bold text-[#FF5A00]">
                          Jauge : {s.registeredCount || 0} / {s.maxSeats} inscrits
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingSession(s);
                    setFormData(s);
                    setIsCreating(false);
                  }}
                  className="p-1.5 text-neutral-500 hover:text-[#075B22] hover:bg-neutral-100 rounded-lg"
                  title="Modifier"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};
