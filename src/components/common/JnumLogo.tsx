import React, { useState } from 'react';

interface JnumLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero' | 'badge';
  variant?: string;
  light?: boolean;
  lightText?: boolean;
  showSubtitle?: boolean;
  subtitleText?: string;
}

export const JnumLogo: React.FC<JnumLogoProps> = ({
  className = '',
  size = 'md',
  light = false,
  lightText = false,
  showSubtitle = false,
  subtitleText = 'By Sous-Comité 3 de Cocody',
}) => {
  const [hasError, setHasError] = useState(false);
  const isLight = light || lightText;
  const src = isLight ? '/logo-light.png' : '/logo.png';

  // Strict height definition only (width is auto, object-fit: contain)
  const heightClass = {
    sm: 'h-9',
    md: 'h-12',
    lg: 'h-16',
    xl: 'h-24',
    hero: 'h-40 sm:h-52 md:h-60',
    badge: 'h-16 sm:h-20',
  }[size];

  if (hasError) {
    return (
      <div className={`px-3 py-2 bg-neutral-200 text-neutral-600 rounded text-xs font-mono inline-flex items-center justify-center ${className}`}>
        logo.png manquant
      </div>
    );
  }

  const logoElement = (
    <img
      src={src}
      alt="JNUM – Journée Numérique Musulmane"
      className={`${heightClass} w-auto object-contain ${className}`}
      style={{ objectFit: 'contain' }}
      onError={() => setHasError(true)}
    />
  );

  if (showSubtitle) {
    return (
      <div className="inline-flex flex-col items-center">
        {logoElement}
        <span
          className={`text-[11px] sm:text-xs font-semibold tracking-wider uppercase mt-1.5 ${
            isLight ? 'text-emerald-100/90' : 'text-neutral-500'
          }`}
        >
          {subtitleText}
        </span>
      </div>
    );
  }

  return logoElement;
};
