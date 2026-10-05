import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Speaker, Session } from '../types';
import { getAllSpeakers, getAllSessions } from '../services/sessionService';
import { Users, Linkedin, Twitter, Globe, Calendar, ArrowRight, ExternalLink } from 'lucide-react';

export const IntervenantsPage: React.FC = () => {
  const speakers = getAllSpeakers();
  const sessions = getAllSessions();
  const [selectedSpeaker, setSelectedSpeaker] = useState<Speaker | null>(null);

  const getSessionsForSpeaker = (speaker: Speaker): Session[] => {
    return sessions.filter((s) => speaker.sessionIds.includes(s.id));
  };

  return (
    <div className="min-h-screen bg-[#F7FAF7] py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Title */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#075B22]/10 text-[#075B22] text-xs font-bold uppercase tracking-wider mb-3">
            <Users className="w-4 h-4 text-[#FF5A00]" />
            <span>Experts & Leaders d'Opinion</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-neutral-900 font-display tracking-tight">
            Les Intervenants de la JNUM
          </h1>
          <p className="mt-3 text-neutral-600 text-sm sm:text-base">
            Chercheurs, bâtisseurs, fondateurs de startups et pionniers de l'éthique technologique qui animeront cette 1ère édition.
          </p>
        </div>

        {/* Speakers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {speakers.map((speaker) => {
            const speakerSessions = getSessionsForSpeaker(speaker);
            return (
              <div
                key={speaker.id}
                className="bg-white rounded-2xl overflow-hidden border border-neutral-200/90 hover:border-[#075B22] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Photo with Overlay */}
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-100">
                    <img
                      src={speaker.photoUrl}
                      alt={speaker.fullName}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    {speaker.isFeatured && (
                      <div className="absolute top-3 right-3 px-2.5 py-1 bg-[#FF5A00] text-white text-[11px] font-extrabold rounded-lg shadow">
                        Keynote Speaker
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold font-display text-neutral-900 group-hover:text-[#075B22] transition-colors">
                      {speaker.fullName}
                    </h3>
                    <p className="text-xs font-bold text-[#FF5A00] uppercase tracking-wide mt-1">
                      {speaker.title}
                    </p>
                    <p className="text-xs text-neutral-500 font-semibold mt-0.5">
                      {speaker.organization}
                    </p>

                    <p className="mt-4 text-xs text-neutral-600 leading-relaxed line-clamp-3">
                      {speaker.bio}
                    </p>

                    {/* Associated Sessions */}
                    {speakerSessions.length > 0 && (
                      <div className="mt-5 pt-4 border-t border-neutral-100">
                        <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-2">
                          Intervention(s) prévue(s) :
                        </span>
                        <div className="space-y-1.5">
                          {speakerSessions.map((s) => (
                            <Link
                              key={s.id}
                              to="/programme"
                              className="flex items-center gap-1.5 text-xs text-[#075B22] hover:text-[#FF5A00] font-semibold transition-colors"
                            >
                              <Calendar className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                              <span className="truncate">{s.title}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Social Links & Details */}
                <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-neutral-400">
                    {speaker.social?.linkedin && (
                      <a
                        href={speaker.social.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-[#075B22] transition-colors"
                        title="Profil LinkedIn"
                      >
                        <Linkedin className="w-4 h-4" />
                      </a>
                    )}
                    {speaker.social?.twitter && (
                      <a
                        href={speaker.social.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-[#075B22] transition-colors"
                        title="Profil X / Twitter"
                      >
                        <Twitter className="w-4 h-4" />
                      </a>
                    )}
                    {speaker.social?.website && (
                      <a
                        href={speaker.social.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-[#075B22] transition-colors"
                        title="Site web personnel"
                      >
                        <Globe className="w-4 h-4" />
                      </a>
                    )}
                  </div>

                  <button
                    onClick={() => setSelectedSpeaker(speaker)}
                    className="text-xs font-bold text-[#075B22] hover:text-[#FF5A00] transition-colors inline-flex items-center gap-1"
                  >
                    <span>Biographie complète</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Speaker Modal Detail */}
        {selectedSpeaker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-neutral-200">
              <div className="relative p-6 sm:p-8">
                <button
                  onClick={() => setSelectedSpeaker(null)}
                  className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-700 rounded-full hover:bg-neutral-100 text-xs font-bold"
                >
                  ✕
                </button>

                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={selectedSpeaker.photoUrl}
                    alt={selectedSpeaker.fullName}
                    className="w-16 h-16 rounded-2xl object-cover object-top border-2 border-[#075B22] shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h3 className="font-display font-black text-xl text-neutral-900">
                      {selectedSpeaker.fullName}
                    </h3>
                    <p className="text-xs font-bold text-[#FF5A00]">
                      {selectedSpeaker.title}
                    </p>
                    <p className="text-xs text-neutral-500 font-medium">
                      {selectedSpeaker.organization}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                    À propos
                  </h4>
                  <p className="text-sm text-neutral-700 leading-relaxed">
                    {selectedSpeaker.bio}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-neutral-100 flex justify-end">
                  <button
                    onClick={() => setSelectedSpeaker(null)}
                    className="px-5 py-2.5 bg-[#075B22] hover:bg-[#064e1d] text-white text-xs font-bold rounded-xl"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
