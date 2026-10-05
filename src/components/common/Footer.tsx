import React from 'react';
import { Link } from 'react-router-dom';
import { JnumLogo } from './JnumLogo';
import { EVENT_CONFIG } from '../../config/event';
import { Mail, Phone, MapPin, MessageCircle, Calendar, ArrowRight, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#075B22] text-white pt-16 pb-12 relative overflow-hidden">
      {/* Subtle Girih Overlay */}
      <div className="absolute inset-0 bg-islamic-girih opacity-5 pointer-events-none" />

      {/* Decorative Glow Arcs */}
      <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-[#1B8A3A]/20 blur-3xl pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#FF5A00]/15 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-emerald-800/80">
          {/* Col 1 & 2: Brand & Manifesto */}
          <div className="lg:col-span-2 space-y-4">
            <div className="mb-2 flex flex-col items-start">
              <JnumLogo size="lg" lightText={true} />
              <span className="text-xs font-semibold text-emerald-300 tracking-wider uppercase mt-1">
                By Sous-Comité 3 de Cocody
              </span>
            </div>
            <p className="text-emerald-100 text-sm leading-relaxed max-w-sm">
              La <strong>Journée Numérique Musulmane</strong> est le rendez-vous incontournable de l'innovation technologique, de l'IA, de la cybersécurité et de l'entrepreneuriat éthique pour toute la communauté.
            </p>
            <div className="flex items-center gap-2 pt-1 text-xs text-emerald-200">
              <Calendar className="w-4 h-4 text-[#FF5A00]" />
              <span>{EVENT_CONFIG.dateDisplay} • {EVENT_CONFIG.venue.name}</span>
            </div>

            {/* WhatsApp Community Button */}
            <div className="pt-2">
              <a
                href={EVENT_CONFIG.social.whatsappChannel}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-800/80 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold border border-emerald-700 transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                <span>Rejoindre la communauté WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Col 3: Navigation Rapide */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-sm uppercase tracking-wider text-[#FF5A00]">
              Navigation
            </h4>
            <ul className="space-y-2 text-sm text-emerald-100">
              <li>
                <Link to="/" className="hover:text-white transition-colors">Accueil</Link>
              </li>
              <li>
                <Link to="/programme" className="hover:text-white transition-colors">Programme complet</Link>
              </li>
              <li>
                <Link to="/intervenants" className="hover:text-white transition-colors">Intervenants & Experts</Link>
              </li>
              <li>
                <Link to="/inscription" className="hover:text-[#FF5A00] font-semibold text-white transition-colors flex items-center gap-1">
                  <span>Inscription en ligne</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="hover:text-white transition-colors text-xs text-emerald-300 flex items-center gap-1 pt-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Accès Organisateur / Staff</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Thématiques Clés */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-sm uppercase tracking-wider text-[#FF5A00]">
              Thématiques
            </h4>
            <ul className="space-y-2 text-xs text-emerald-200">
              <li>• Intelligence Artificielle & Biais Éthiques</li>
              <li>• Cybersécurité & Souveraineté des Données</li>
              <li>• Entrepreneuriat Digital & Halal Tech</li>
              <li>• Storytelling & Création de Contenu</li>
              <li>• Protection de l'Enfance en Ligne</li>
              <li>• Ateliers Hands-On & Démo IA</li>
            </ul>
          </div>

          {/* Col 5: Contact & Lieu */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-sm uppercase tracking-wider text-[#FF5A00]">
              Contact & Accès
            </h4>
            <div className="space-y-2.5 text-xs text-emerald-100">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#FF5A00] shrink-0 mt-0.5" />
                <span>{EVENT_CONFIG.venue.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-300 shrink-0" />
                <a href={`mailto:${EVENT_CONFIG.contact.email}`} className="hover:underline truncate">
                  {EVENT_CONFIG.contact.email}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-300 shrink-0" />
                <span>{EVENT_CONFIG.contact.phone}</span>
              </div>
            </div>

            {/* Hashtags */}
            <div className="pt-2 flex flex-wrap gap-1.5">
              {EVENT_CONFIG.hashtags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-emerald-900/60 rounded text-[11px] font-mono text-emerald-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Legal */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-emerald-300/90 gap-4">
          <p>
            © {EVENT_CONFIG.year} {EVENT_CONFIG.name}. Tous droits réservés.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/confidentialite" className="hover:text-white transition-colors">
              Protection des données (RGPD)
            </Link>
            <Link to="/mentions-legales" className="hover:text-white transition-colors">
              Mentions Légales
            </Link>
            <a
              href={`https://wa.me/${EVENT_CONFIG.contact.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#FF5A00] hover:underline font-semibold"
            >
              Assistance WhatsApp
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
