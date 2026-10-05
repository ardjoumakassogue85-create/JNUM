import React from 'react';
import { Link } from 'react-router-dom';
import { EVENT_CONFIG } from '../config/event';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

export const LegalPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F7FAF7] py-12 md:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#075B22] mb-6 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour à l'accueil</span>
        </Link>

        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-neutral-200 shadow-sm space-y-6 text-neutral-800 text-sm leading-relaxed">
          <div className="border-b border-neutral-200 pb-4">
            <h1 className="text-2xl sm:text-3xl font-black font-display text-neutral-900">
              Mentions Légales & Protection des Données Personnelles
            </h1>
            <p className="text-xs text-neutral-500 mt-1">
              Conformité RGPD et politique d'utilisation du site officiel {EVENT_CONFIG.name}.
            </p>
          </div>

          <section className="space-y-2">
            <h2 className="font-display font-bold text-base text-[#075B22]">
              1. Éditeur de l'événement et du site
            </h2>
            <p className="text-xs text-neutral-600">
              Le site web officiel de la « Journée Numérique Musulmane » (JNUM) est édité par le Comité d'Organisation JNUM.
              <br />
              Email de contact : <strong>{EVENT_CONFIG.contact.email}</strong>
              <br />
              Téléphone : <strong>{EVENT_CONFIG.contact.phone}</strong>
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-display font-bold text-base text-[#075B22]">
              2. Traitement des données d'inscription (RGPD)
            </h2>
            <p className="text-xs text-neutral-600">
              Les données personnelles collectées lors de l'inscription (prénom, nom, email, numéro WhatsApp, profil professionnel) sont exclusivement traitées pour :
            </p>
            <ul className="list-disc pl-5 text-xs text-neutral-600 space-y-1">
              <li>L'édition et l'envoi du badge nominatif sécurisé avec QR code.</li>
              <li>L'émargement et la sécurité à l'entrée de l'IUA, Campus Bonoumin le jour de l'événement.</li>
              <li>La communication d'informations logistiques importantes relatives au déroulement de la JNUM.</li>
            </ul>
            <p className="text-xs text-neutral-600">
              Aucune donnée personnelle n'est cédée, louée ou vendue à des tiers. Les participants disposent d'un droit d'accès, de rectification et d'effacement de leurs données sur simple demande par email à {EVENT_CONFIG.contact.email}.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-display font-bold text-base text-[#075B22]">
              3. Sécurité des QR codes et Badges
            </h2>
            <p className="text-xs text-neutral-600">
              Afin de préserver la vie privée des participants, le QR code présent sur votre badge d'accès n'embarque aucune donnée personnelle en clair. Il contient exclusivement un identifiant unique et une signature cryptographique sécurisée vérifiée par les agents d'accueil le jour J.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
