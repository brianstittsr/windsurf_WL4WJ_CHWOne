'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Language } from '@/lib/translations/digitalLiteracy';

interface LanguageToggleProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  showLabel?: boolean;
}

export default function LanguageToggle({ 
  currentLanguage, 
  onLanguageChange,
  showLabel = true 
}: LanguageToggleProps) {
  return (
    <div className="flex items-center gap-2">
      {showLabel && (
        <span className="text-sm text-muted-foreground">
          Language | Idioma:
        </span>
      )}
      <div className="flex rounded-md border">
        <Button
          onClick={() => onLanguageChange('en')}
          variant={currentLanguage === 'en' ? 'default' : 'ghost'}
          size="sm"
          className={`min-w-[90px] rounded-r-none ${currentLanguage === 'en' ? 'font-bold' : 'font-normal'}`}
        >
          🇺🇸 English
        </Button>
        <Button
          onClick={() => onLanguageChange('es')}
          variant={currentLanguage === 'es' ? 'default' : 'ghost'}
          size="sm"
          className={`min-w-[90px] rounded-l-none border-l ${currentLanguage === 'es' ? 'font-bold' : 'font-normal'}`}
        >
          🇪🇸 Español
        </Button>
      </div>
    </div>
  );
}
