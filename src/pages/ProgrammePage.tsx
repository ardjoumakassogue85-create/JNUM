import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Session, SessionType } from '../types';
import {
  getAllSessions,
  getFavorites,
  toggleFavoriteSession,
  getSessionLiveStatus,
  getGoogleCalendarUrl,
  downloadIcsFile,
} from '../services/sessionService';
import { EVENT_CONFIG } from '../config/event';
import {
  Calendar,
  Clock,
  MapPin,
  Bookmark,
  BookmarkCheck,
  Search,
  Filter,
  Download,
  Printer,
  Sparkles,
  Coffee,
  Moon,
  Layers,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';

export const ProgrammePage: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'favorites'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    setSessions(getAllSessions());
    setFavorites(getFavorites());

    const handleUpdate = () => {
      setSessions(getAllSessions());
      setFavorites(getFavorites());
    };

    window.addEventListener('jnum_sessions_updated', handleUpdate);
    window.addEventListener('jnum_favorites_updated', handleUpdate);

    return () => {
      window.removeEventListener('jnum_sessions_updated', handleUpdate);
      window.removeEventListener('jnum_favorites_updated', handleUpdate);
    };
  }, []);

  const handleToggleFavorite = (id: string) => {
    const updated = toggleFavoriteSession(id);
    setFavorites(updated);
  };

  const typesList: SessionType[] = [
    'Accueil',
    'Ouverture',
    'Keynote',
    'Conférence',
    'Panel',
    'Atelier',
    'Pause',
    'Prière',
    'Networking',
    'Clôture',
  ];

  // Filter sessions
  const filteredSessions = sessions.filter((s) => {
    if (activeTab === 'favorites' && !favorites.includes(s.id)) return false;
    if (selectedType !== 'all' && s.type !== selectedType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = s.title.toLowerCase().includes(q);
      const matchDesc = s.description.toLowerCase().includes(q);
      const matchTheme = s.theme.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchTheme) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F7FAF7] py-10 md:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Title */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex flex-wrap items-center justify-center gap-2 px-3.5 py-1.5 rounded-full bg-[#075B22]/10 text-[#075B22] text-xs font-bold uppercase tracking-wider mb-3">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#FF5A00]" />
              <span>{EVENT_CONFIG.dateDisplay} • {EVENT_CONFIG.startTime} à {EVENT_CONFIG.endTime}</span>
            </span>
            <span className="hidden sm:inline text-neutral-300">•</span>
            <span className="flex items-center gap-1 text-[#075B22]">
              <MapPin className="w-3.5 h-3.5 text-[#075B22]" />
              <span>{EVENT_CONFIG.venue.name}</span>
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-neutral-900 font-display tracking-tight">
            Programme Officiel de la JNUM
          </h1>
          <p className="mt-3 text-neutral-600 text-sm sm:text-base">
            Découvrez les keynotes, panels d'experts, ateliers interactifs et temps de prière et de convivialité.
          </p>

          {/* Action Bar (Export to Calendar, Print) */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 no-print">
            <button
              onClick={() => downloadIcsFile()}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300 rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95"
              title="Télécharger le fichier .ics pour Outlook, Apple Calendar, etc."
            >
              <Download className="w-4 h-4 text-[#075B22]" />
              <span>Exporter agenda (.ics)</span>
            </button>

            <a
              href={getGoogleCalendarUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300 rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95"
            >
              <ExternalLink className="w-4 h-4 text-[#FF5A00]" />
              <span>Ajouter à Google Agenda</span>
            </a>

            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300 rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95"
            >
              <Printer className="w-4 h-4 text-neutral-600" />
              <span>Imprimer le programme</span>
            </button>
          </div>
        </div>

        {/* Filter & Controls Panel */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-200/80 mb-8 space-y-4 no-print">
          {/* Tabs: Tous / Mon Programme */}
          <div className="flex items-center justify-between flex-wrap gap-4 border-b border-neutral-100 pb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-colors ${
                  activeTab === 'all'
                    ? 'bg-[#075B22] text-white shadow-sm'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                Tout le programme ({sessions.length})
              </button>
              <button
                onClick={() => setActiveTab('favorites')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition-colors ${
                  activeTab === 'favorites'
                    ? 'bg-[#FF5A00] text-white shadow-sm'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>Mon programme ({favorites.length})</span>
              </button>
            </div>

            {/* Quick Live Day indicator */}
            <div className="text-xs font-semibold text-neutral-500">
              Jour J : Samedi 24 Octobre 2026
            </div>
          </div>

          {/* Search & Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher une session, sujet, mot-clé..."
                className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#075B22]"
              />
            </div>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#075B22]"
            >
              <option value="all">Tous les formats (Panels, Conférences, Ateliers...)</option>
              {typesList.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Timeline Sessions List */}
        {filteredSessions.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-neutral-200">
            <Layers className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <h3 className="font-display font-bold text-lg text-neutral-800">
              Aucune session ne correspond à votre filtre
            </h3>
            <p className="text-xs text-neutral-500 mt-1">
              Essayez de réinitialiser vos critères ou d'ajouter des sessions à vos favoris.
            </p>
            <button
              onClick={() => {
                setActiveTab('all');
                setSelectedType('all');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 bg-[#075B22] text-white text-xs font-bold rounded-xl"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="relative border-l-2 border-emerald-200 ml-4 md:ml-28 space-y-6 pb-12">
            {filteredSessions.map((session) => {
              const isFav = favorites.includes(session.id);
              const liveStatus = getSessionLiveStatus(session);
              const isPause = session.type === 'Pause' || session.type === 'Prière';

              return (
                <div key={session.id} className="relative pl-6 md:pl-8 group">
                  {/* Timeline Left Node Indicator */}
                  <div
                    className={`absolute -left-[9px] top-4 w-4 h-4 rounded-full border-2 border-white shadow-sm transition-transform group-hover:scale-125 ${
                      isPause
                        ? 'bg-amber-500'
                        : session.type === 'Atelier'
                        ? 'bg-[#FF5A00]'
                        : 'bg-[#075B22]'
                    }`}
                  />

                  {/* Desktop Time Tag on left of line */}
                  <div className="hidden md:block absolute -left-28 top-3 text-right w-20">
                    <span className="font-mono text-xs font-bold text-neutral-700">
                      {session.startTime}
                    </span>
                    <span className="block text-[10px] text-neutral-400">
                      {session.endTime}
                    </span>
                  </div>

                  {/* Session Card */}
                  <div
                    className={`rounded-2xl p-5 sm:p-6 transition-all border ${
                      isPause
                        ? 'bg-gradient-to-r from-amber-50/80 to-emerald-50/50 border-amber-200'
                        : 'bg-white border-neutral-200 hover:border-[#075B22] hover:shadow-md'
                    }`}
                  >
                    {/* Top Row: Mobile Time, Type Pill & Favorite Toggle */}
                    <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        {/* Mobile Time */}
                        <span className="md:hidden font-mono text-xs font-bold text-neutral-800 bg-neutral-100 px-2 py-0.5 rounded">
                          {session.startTime} - {session.endTime}
                        </span>

                        {/* Format Type Pill */}
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                            session.type === 'Keynote'
                              ? 'bg-purple-100 text-purple-800'
                              : session.type === 'Atelier'
                              ? 'bg-orange-100 text-[#FF5A00]'
                              : session.type === 'Panel'
                              ? 'bg-emerald-100 text-[#075B22]'
                              : isPause
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-neutral-100 text-neutral-700'
                          }`}
                        >
                          {session.type}
                        </span>

                        {/* Theme */}
                        <span className="text-xs font-semibold text-neutral-500">
                          {session.theme}
                        </span>

                        {/* Live Status indicator */}
                        {liveStatus === 'current' && (
                          <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-full animate-pulse">
                            En cours
                          </span>
                        )}
                        {liveStatus === 'next' && (
                          <span className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-full">
                            À suivre
                          </span>
                        )}
                      </div>

                      {/* Right buttons: Calendar & Favorite */}
                      <div className="flex items-center gap-2 no-print">
                        <button
                          onClick={() => downloadIcsFile(session)}
                          className="p-1.5 text-neutral-400 hover:text-[#075B22] hover:bg-neutral-100 rounded-lg transition-colors"
                          title="Ajouter cette session spécifique à mon calendrier"
                        >
                          <Calendar className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleToggleFavorite(session.id)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isFav
                              ? 'text-[#FF5A00] bg-orange-50'
                              : 'text-neutral-400 hover:text-[#FF5A00] hover:bg-neutral-100'
                          }`}
                          title={isFav ? 'Retirer des favoris' : 'Ajouter à mon programme'}
                        >
                          {isFav ? (
                            <BookmarkCheck className="w-5 h-5 fill-[#FF5A00]" />
                          ) : (
                            <Bookmark className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Session Title */}
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg sm:text-xl font-bold font-display text-neutral-900 leading-snug">
                        {session.title}
                      </h3>
                      {session.isParallelWorkshops && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-orange-100 text-[#FF5A00] border border-orange-200 shrink-0">
                          4 ateliers au choix en parallèle
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p className="mt-2 text-xs sm:text-sm text-neutral-600 leading-relaxed">
                      {session.description}
                    </p>

                    {/* Simultaneous 4 Workshops Grid if isParallelWorkshops */}
                    {session.isParallelWorkshops && session.parallelWorkshops && (
                      <div className="mt-5 pt-4 border-t border-orange-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
                          {session.parallelWorkshops.map((ws, idx) => (
                            <div
                              key={ws.id}
                              className="bg-neutral-50/80 hover:bg-white rounded-xl p-3.5 border border-neutral-200/90 hover:border-[#FF5A00] transition-all flex flex-col justify-between shadow-2xs hover:shadow-sm"
                            >
                              <div>
                                <div className="flex items-center justify-between gap-1 mb-1.5">
                                  <span className="text-2xl" role="img" aria-label={ws.title}>
                                    {ws.icon}
                                  </span>
                                  <span className="text-[10px] font-bold text-neutral-500 bg-white px-2 py-0.5 rounded border border-neutral-200">
                                    Atelier {idx + 1}
                                  </span>
                                </div>
                                <h4 className="font-bold text-xs sm:text-sm text-neutral-900 leading-snug">
                                  {ws.title}
                                </h4>
                                <p className="text-[11px] text-neutral-500 italic mt-1 leading-snug line-clamp-2">
                                  « {ws.theme} »
                                </p>

                                {/* Points clés (3-4 badges/puces courtes) */}
                                <div className="mt-2.5 flex flex-wrap gap-1">
                                  {ws.keyPoints.map((point, pIdx) => (
                                    <span
                                      key={pIdx}
                                      className="inline-block text-[10px] bg-white border border-neutral-200 text-neutral-700 font-medium px-2 py-0.5 rounded-md leading-tight"
                                    >
                                      • {point}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              {/* Projet pratique final */}
                              <div className="mt-3 pt-2.5 border-t border-neutral-200/60 bg-emerald-50/50 rounded-lg p-2 text-[11px] text-[#075B22]">
                                <span className="font-bold block text-[10px] uppercase tracking-wider text-emerald-800">
                                  Projet pratique :
                                </span>
                                <span className="font-medium italic leading-snug">
                                  {ws.finalProject}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Footer Info: Venue, Level, Seats */}
                    <div className="mt-4 pt-3 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-1.5 text-neutral-700 font-semibold">
                        <MapPin className="w-3.5 h-3.5 text-[#075B22] shrink-0" />
                        <span>{EVENT_CONFIG.venue.name}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-neutral-500 font-medium">
                          Niveau : <strong>{session.level}</strong>
                        </span>

                        {session.maxSeats && (
                          <span className="px-2 py-0.5 rounded bg-orange-50 text-[#FF5A00] font-bold">
                            Places : {session.registeredCount || 0} / {session.maxSeats} inscrits
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
