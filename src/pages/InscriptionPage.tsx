import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import parsePhoneNumber, { isValidPhoneNumber } from 'libphonenumber-js';
import { createRegistration } from '../services/registrationService';
import { WORKSHOPS_CATALOG } from '../data/seedData';
import { EVENT_CONFIG } from '../config/event';
import { ParticipantCategory, RegistrationFormData } from '../types';
import {
  User,
  Mail,
  Phone,
  Building,
  Briefcase,
  Globe,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Loader2,
} from 'lucide-react';

// Country codes list for WhatsApp phone input
const COUNTRY_CODES = [
  { code: '+225', country: 'Côte d\'Ivoire (CI)', flag: '🇨🇮' },
  { code: '+33', country: 'France (FR)', flag: '🇫🇷' },
  { code: '+212', country: 'Maroc (MA)', flag: '🇲🇦' },
  { code: '+221', country: 'Sénégal (SN)', flag: '🇸🇳' },
  { code: '+216', country: 'Tunisie (TN)', flag: '🇹🇳' },
  { code: '+213', country: 'Algérie (DZ)', flag: '🇩🇿' },
  { code: '+32', country: 'Belgique (BE)', flag: '🇧🇪' },
  { code: '+41', country: 'Suisse (CH)', flag: '🇨🇭' },
  { code: '+1', country: 'Canada / USA (CA/US)', flag: '🇨🇦' },
  { code: '+223', country: 'Mali (ML)', flag: '🇲🇱' },
  { code: '+226', country: 'Burkina Faso (BF)', flag: '🇧🇫' },
  { code: '+224', country: 'Guinée (GN)', flag: '🇬🇳' },
  { code: '+228', country: 'Togo (TG)', flag: '🇹🇬' },
  { code: '+229', country: 'Bénin (BJ)', flag: '🇧🇯' },
  { code: '+237', country: 'Cameroun (CM)', flag: '🇨🇲' },
];

const CATEGORIES: ParticipantCategory[] = [
  'Étudiant',
  'Professionnel',
  'Entrepreneur',
  'Enseignant',
  'Association',
  'Autre',
];

const INTERESTS_LIST = [
  'Intelligence Artificielle',
  'Cybersécurité & Données',
  'Entrepreneuriat & Halal Tech',
  'Création de Contenu Digital',
  'Protection de la Famille & Éducation',
  'Cloud & DevOps',
  'Finance Participative',
];

const REFERRAL_SOURCES = [
  'WhatsApp (Groupe / Statut)',
  'LinkedIn',
  'Instagram / X',
  'Recommandation d\'un ami',
  'Association ou École',
  'Autre',
];

// Zod validation schema
const registrationSchema = z.object({
  // Step 1: Identité
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères.'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères.'),
  email: z
    .string()
    .trim()
    .refine((val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
      message: 'Veuillez saisir une adresse email valide ou laisser vide.',
    })
    .optional(),
  phoneCountryCode: z.string().min(1, 'Sélectionnez un indicatif.'),
  phoneNumber: z.string().min(6, 'Numéro de téléphone trop court.'),

  // Step 2: Profil
  country: z.string().min(2, 'Veuillez préciser votre pays.'),
  city: z.string().min(2, 'Veuillez préciser votre ville.'),
  category: z.enum(['Étudiant', 'Professionnel', 'Entrepreneur', 'Enseignant', 'Association', 'Autre'] as const),
  organization: z.string().min(2, 'Veuillez indiquer votre structure ou école.'),
  jobTitle: z.string().min(2, 'Veuillez indiquer votre fonction ou cursus.'),
  interests: z.array(z.string()).min(1, 'Sélectionnez au moins un centre d\'intérêt.'),
  referralSource: z.string().min(1, 'Précisez comment vous avez connu la JNUM.'),

  // Step 3: Ateliers & Consentement
  workshopIds: z.array(z.string()).optional(),
  consentData: z.boolean().refine((val) => val === true, {
    message: 'Votre consentement est obligatoire pour traiter votre inscription.',
  }),
  consentWhatsapp: z.boolean().refine((val) => val === true, {
    message: 'Le consentement WhatsApp est requis pour la réception du badge.',
  }),
  honeypot: z.string().optional(),
});

type FormData = z.infer<typeof registrationSchema>;

export const InscriptionPage: React.FC = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      phoneCountryCode: EVENT_CONFIG.phone.defaultCountryCode,
      category: 'Professionnel',
      country: 'Côte d\'Ivoire',
      city: 'Abidjan',
      interests: ['Intelligence Artificielle'],
      workshopIds: [],
      referralSource: 'WhatsApp (Groupe / Statut)',
      consentData: true,
      consentWhatsapp: true,
      honeypot: '',
    },
    mode: 'onTouched',
  });

  const selectedInterests = watch('interests') || [];
  const selectedWorkshops = watch('workshopIds') || [];

  const handleInterestToggle = (item: string) => {
    if (selectedInterests.includes(item)) {
      setValue(
        'interests',
        selectedInterests.filter((i) => i !== item),
        { shouldValidate: true }
      );
    } else {
      setValue('interests', [...selectedInterests, item], { shouldValidate: true });
    }
  };

  const handleWorkshopToggle = (workshopId: string) => {
    // Single workshop choice for the whole day (Part 1 + Part 2)
    if (selectedWorkshops.includes(workshopId)) {
      setValue('workshopIds', []);
    } else {
      setValue('workshopIds', [workshopId]);
    }
  };

  // Step 1 Next verification
  const handleNextStep1 = async () => {
    const isValid = await trigger(['firstName', 'lastName', 'email', 'phoneCountryCode', 'phoneNumber']);
    if (isValid) {
      // Validate international phone number with libphonenumber-js
      const rawNumber = watch('phoneNumber');
      const countryCode = watch('phoneCountryCode');
      const fullNumber = rawNumber.startsWith('+') ? rawNumber : `${countryCode}${rawNumber}`;

      try {
        if (!isValidPhoneNumber(fullNumber)) {
          // Soft check: if strictly invalid E.164, warn or allow if basic length
          const parsed = parsePhoneNumber(fullNumber);
          if (!parsed || !parsed.isValid()) {
            setSubmitError('Veuillez vérifier votre numéro de téléphone (format WhatsApp invalide).');
            return;
          }
        }
        setSubmitError(null);
        setStep(2);
      } catch {
        // Fallback check
        if (rawNumber.length < 8) {
          setSubmitError('Numéro de téléphone incomplet.');
          return;
        }
        setSubmitError(null);
        setStep(2);
      }
    }
  };

  // Step 2 Next verification
  const handleNextStep2 = async () => {
    const isValid = await trigger([
      'country',
      'city',
      'category',
      'organization',
      'jobTitle',
      'interests',
      'referralSource',
    ]);
    if (isValid) {
      setSubmitError(null);
      setStep(3);
    }
  };

  // Final Form Submission
  const onSubmit = async (data: FormData) => {
    // Honeypot check
    if (data.honeypot && data.honeypot.trim() !== '') {
      console.warn('Spam detected via honeypot');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const reg = await createRegistration({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneCountryCode: data.phoneCountryCode,
        phoneNumber: data.phoneNumber,
        country: data.country,
        city: data.city,
        category: data.category,
        organization: data.organization,
        jobTitle: data.jobTitle,
        interests: data.interests,
        referralSource: data.referralSource,
        workshopIds: data.workshopIds || [],
        consentData: data.consentData,
        consentWhatsapp: data.consentWhatsapp,
      });

      // Redirect to confirmation page
      navigate(`/confirmation/${reg.id}`);
    } catch (err: any) {
      console.error('Registration failed', err);
      setSubmitError(err.message || "Une erreur est survenue lors de l'enregistrement de votre inscription.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7FAF7] py-10 md:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#075B22]/10 text-[#075B22] text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#FF5A00]" />
            <span>Inscription Gratuite • {EVENT_CONFIG.edition}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-neutral-900 font-display tracking-tight">
            Formulaire d'Inscription Officiel
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-neutral-600">
            Complétez ces 3 étapes simples pour générer votre badge personnalisé et le recevoir sur WhatsApp.
          </p>
        </div>

        {/* Step Progress Bar */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-neutral-200/80 mb-8">
          <div className="flex items-center justify-between relative">
            {/* Connecting Line */}
            <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2 h-1 bg-neutral-200 -z-0" />
            <div
              className="absolute top-1/2 left-6 -translate-y-1/2 h-1 bg-[#075B22] transition-all duration-300 -z-0"
              style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
            />

            {/* Step 1 */}
            <div className="flex flex-col items-center relative z-10">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                  step >= 1 ? 'bg-[#075B22] text-white ring-4 ring-emerald-100' : 'bg-neutral-200 text-neutral-600'
                }`}
              >
                1
              </div>
              <span className="text-[11px] font-bold text-neutral-700 mt-1">Identité</span>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center relative z-10">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                  step >= 2 ? 'bg-[#075B22] text-white ring-4 ring-emerald-100' : 'bg-neutral-200 text-neutral-600'
                }`}
              >
                2
              </div>
              <span className="text-[11px] font-bold text-neutral-700 mt-1">Profil</span>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center relative z-10">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                  step === 3 ? 'bg-[#FF5A00] text-white ring-4 ring-orange-100' : 'bg-neutral-200 text-neutral-600'
                }`}
              >
                3
              </div>
              <span className="text-[11px] font-bold text-neutral-700 mt-1">Confirmation</span>
            </div>
          </div>
        </div>

        {/* Global Error Banner */}
        {submitError && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-3 text-xs sm:text-sm animate-shake">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
            <div>
              <p className="font-bold">Attention</p>
              <p className="mt-0.5">{submitError}</p>
            </div>
          </div>
        )}

        {/* Form Container */}
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-neutral-200">
          {/* Honeypot hidden input */}
          <input type="text" {...register('honeypot')} className="hidden" tabIndex={-1} autoComplete="off" />

          {/* STEP 1: IDENTITÉ */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="border-b border-neutral-100 pb-3 mb-4">
                <h2 className="font-display font-bold text-lg text-neutral-900">
                  Étape 1 : Vos coordonnées personnelles
                </h2>
                <p className="text-xs text-neutral-500">
                  Votre nom figurera en grand sur votre badge d'accès officiel.
                </p>
              </div>

              {/* Prénom & Nom */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Prénom <span className="text-[#FF5A00]">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      {...register('firstName')}
                      placeholder="Ex. Amadou"
                      className={`w-full pl-9 pr-3 py-2.5 bg-neutral-50 border rounded-xl text-sm focus:outline-none focus:ring-2 ${
                        errors.firstName ? 'border-red-400 focus:ring-red-400' : 'border-neutral-200 focus:ring-[#075B22]'
                      }`}
                    />
                  </div>
                  {errors.firstName && (
                    <p className="text-red-600 text-[11px] font-semibold mt-1">{errors.firstName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Nom de famille <span className="text-[#FF5A00]">*</span>
                  </label>
                  <input
                    type="text"
                    {...register('lastName')}
                    placeholder="Ex. Diallo"
                    className={`w-full px-3 py-2.5 bg-neutral-50 border rounded-xl text-sm focus:outline-none focus:ring-2 ${
                      errors.lastName ? 'border-red-400 focus:ring-red-400' : 'border-neutral-200 focus:ring-[#075B22]'
                    }`}
                  />
                  {errors.lastName && (
                    <p className="text-red-600 text-[11px] font-semibold mt-1">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Adresse Email <span className="text-neutral-400 font-normal text-[11px]">(Optionnel)</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    {...register('email')}
                    placeholder="amadou.diallo@exemple.com"
                    className={`w-full pl-9 pr-3 py-2.5 bg-neutral-50 border rounded-xl text-sm focus:outline-none focus:ring-2 ${
                      errors.email ? 'border-red-400 focus:ring-red-400' : 'border-neutral-200 focus:ring-[#075B22]'
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-600 text-[11px] font-semibold mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Téléphone WhatsApp */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Numéro WhatsApp (pour réception du badge) <span className="text-[#FF5A00]">*</span>
                </label>
                <div className="flex gap-2">
                  <select
                    {...register('phoneCountryCode')}
                    className="w-40 px-2 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#075B22]"
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option key={c.code + c.country} value={c.code}>
                        {c.flag} {c.code}
                      </option>
                    ))}
                  </select>

                  <div className="relative flex-1">
                    <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      {...register('phoneNumber')}
                      placeholder="07 00 11 22 33"
                      className={`w-full pl-9 pr-3 py-2.5 bg-neutral-50 border rounded-xl text-sm focus:outline-none focus:ring-2 ${
                        errors.phoneNumber ? 'border-red-400 focus:ring-red-400' : 'border-neutral-200 focus:ring-[#075B22]'
                      }`}
                    />
                  </div>
                </div>
                {errors.phoneNumber && (
                  <p className="text-red-600 text-[11px] font-semibold mt-1">{errors.phoneNumber.message}</p>
                )}
                <p className="text-[11px] text-neutral-500 mt-1">
                  Assurez-vous que ce numéro est bien actif sur WhatsApp afin de recevoir votre badge avec QR code.
                </p>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleNextStep1}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#075B22] hover:bg-[#064e1d] text-white font-bold text-sm rounded-xl shadow-md transition-all active:scale-95"
                >
                  <span>Continuer</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: PROFIL */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="border-b border-neutral-100 pb-3 mb-4">
                <h2 className="font-display font-bold text-lg text-neutral-900">
                  Étape 2 : Votre profil & centres d'intérêt
                </h2>
                <p className="text-xs text-neutral-500">
                  Aidez-nous à adapter le contenu et le networking selon vos attentes.
                </p>
              </div>

              {/* Pays & Ville */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Pays de résidence <span className="text-[#FF5A00]">*</span>
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      {...register('country')}
                      placeholder="Côte d'Ivoire, France, Sénégal..."
                      className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#075B22]"
                    />
                  </div>
                  {errors.country && (
                    <p className="text-red-600 text-[11px] font-semibold mt-1">{errors.country.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Ville <span className="text-[#FF5A00]">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      {...register('city')}
                      placeholder="Abidjan, Paris, Dakar..."
                      className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#075B22]"
                    />
                  </div>
                  {errors.city && (
                    <p className="text-red-600 text-[11px] font-semibold mt-1">{errors.city.message}</p>
                  )}
                </div>
              </div>

              {/* Catégorie */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-2">
                  Vous participez en tant que : <span className="text-[#FF5A00]">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CATEGORIES.map((cat) => {
                    const selected = watch('category') === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setValue('category', cat, { shouldValidate: true })}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                          selected
                            ? 'bg-[#075B22] text-white border-[#075B22] shadow-sm'
                            : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Structure & Fonction */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Organisation / Entreprise / Université <span className="text-[#FF5A00]">*</span>
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      {...register('organization')}
                      placeholder="Ex. Université Al-Hassan / Startup"
                      className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#075B22]"
                    />
                  </div>
                  {errors.organization && (
                    <p className="text-red-600 text-[11px] font-semibold mt-1">{errors.organization.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Poste / Rôle / Spécialité <span className="text-[#FF5A00]">*</span>
                  </label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      {...register('jobTitle')}
                      placeholder="Ex. Développeur, Étudiant, Fondateur..."
                      className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#075B22]"
                    />
                  </div>
                  {errors.jobTitle && (
                    <p className="text-red-600 text-[11px] font-semibold mt-1">{errors.jobTitle.message}</p>
                  )}
                </div>
              </div>

              {/* Centres d'intérêt */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-2">
                  Vos centres d'intérêt principaux <span className="text-[#FF5A00]">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS_LIST.map((interest) => {
                    const isSelected = selectedInterests.includes(interest);
                    return (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => handleInterestToggle(interest)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                          isSelected
                            ? 'bg-[#FF5A00] text-white border-[#FF5A00]'
                            : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {interest}
                      </button>
                    );
                  })}
                </div>
                {errors.interests && (
                  <p className="text-red-600 text-[11px] font-semibold mt-1">{errors.interests.message}</p>
                )}
              </div>

              {/* Comment avez-vous connu l'événement */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Comment avez-vous connu la JNUM ?
                </label>
                <select
                  {...register('referralSource')}
                  className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#075B22]"
                >
                  {REFERRAL_SOURCES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 text-neutral-600 hover:text-neutral-900 text-xs font-bold transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Retour</span>
                </button>

                <button
                  type="button"
                  onClick={handleNextStep2}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#075B22] hover:bg-[#064e1d] text-white font-bold text-sm rounded-xl shadow-md transition-all active:scale-95"
                >
                  <span>Continuer</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: ATELIERS & VALIDATION */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-neutral-100 pb-3 mb-4">
                <h2 className="font-display font-bold text-lg text-neutral-900">
                  Étape 3 : Choix de votre atelier & Finalisation
                </h2>
                <p className="text-xs text-neutral-500">
                  Choisissez un seul atelier pratique pour l'ensemble de la journée (Partie 1 + Partie 2 avec le même groupe).
                </p>
              </div>

              {/* Ateliers Pratiques - Choix d'un seul atelier */}
              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-2">
                  Sélectionnez votre atelier pratique (1 seul atelier pour la journée) :
                </label>
                <div className="space-y-3">
                  {WORKSHOPS_CATALOG.map((ws) => {
                    const isSelected = selectedWorkshops.includes(ws.id);

                    return (
                      <div
                        key={ws.id}
                        onClick={() => handleWorkshopToggle(ws.id)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-orange-50/80 border-[#FF5A00] shadow-sm ring-2 ring-[#FF5A00]/40'
                            : 'bg-neutral-50 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-100/60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 shrink-0 ${
                                isSelected ? 'bg-[#FF5A00] border-[#FF5A00] text-white' : 'border-neutral-300 bg-white'
                              }`}
                            >
                              {isSelected && <span className="w-2 h-2 rounded-full bg-white" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{ws.icon}</span>
                                <h4 className="font-bold text-sm text-neutral-900">{ws.title}</h4>
                              </div>
                              <p className="text-xs text-neutral-600 mt-1 italic">
                                « {ws.theme} »
                              </p>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {ws.keyPoints.slice(0, 3).map((pt, i) => (
                                  <span
                                    key={i}
                                    className="text-[10px] bg-white border border-neutral-200 text-neutral-600 px-2 py-0.5 rounded"
                                  >
                                    • {pt}
                                  </span>
                                ))}
                              </div>
                              <p className="text-[11px] text-[#075B22] font-semibold mt-2">
                                🎯 Projet pratique : <span className="italic font-normal">{ws.finalProject}</span>
                              </p>
                            </div>
                          </div>

                          <div className="shrink-0 text-right">
                            <span className="inline-block px-2.5 py-1 bg-white border border-neutral-200 rounded-lg text-[10px] font-bold text-neutral-700">
                              {ws.room}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Consentements Explicites */}
              <div className="pt-2 space-y-3 border-t border-neutral-100">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('consentWhatsapp')}
                    className="w-4 h-4 mt-0.5 accent-[#075B22] rounded cursor-pointer"
                  />
                  <span className="text-xs text-neutral-700 leading-snug">
                    J'accepte de recevoir mon badge d'accès officiel avec QR code et les alertes importantes de l'événement sur mon compte WhatsApp.
                  </span>
                </label>
                {errors.consentWhatsapp && (
                  <p className="text-red-600 text-[11px] font-semibold">{errors.consentWhatsapp.message}</p>
                )}

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('consentData')}
                    className="w-4 h-4 mt-0.5 accent-[#075B22] rounded cursor-pointer"
                  />
                  <span className="text-xs text-neutral-700 leading-snug">
                    J'autorise le comité d'organisation JNUM à traiter mes données personnelles pour l'organisation de l'événement conformément à la politique de confidentialité.
                  </span>
                </label>
                {errors.consentData && (
                  <p className="text-red-600 text-[11px] font-semibold">{errors.consentData.message}</p>
                )}
              </div>

              {/* Security Badge notice */}
              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-3 text-xs text-[#075B22]">
                <ShieldCheck className="w-5 h-5 shrink-0 text-[#075B22]" />
                <span>
                  Anti-fraude : un identifiant unique non séquentiel et une signature HMAC seront intégrés à votre QR code.
                </span>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 text-neutral-600 hover:text-neutral-900 text-xs font-bold transition-colors disabled:opacity-50"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Retour</span>
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#FF5A00] hover:bg-[#E04E00] text-white font-extrabold text-sm rounded-xl shadow-lg shadow-[#FF5A00]/25 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Génération de votre badge...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirmer mon Inscription & Obtenir mon Badge</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
