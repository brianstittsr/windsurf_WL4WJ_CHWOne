'use client';

import React from 'react';
import { Box, Button, ButtonGroup, Typography } from '@mui/material';
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
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {showLabel && (
        <Typography variant="body2" color="text.secondary">
          Language | Idioma:
        </Typography>
      )}
      <ButtonGroup size="small" variant="outlined">
        <Button
          onClick={() => onLanguageChange('en')}
          variant={currentLanguage === 'en' ? 'contained' : 'outlined'}
          sx={{ 
            minWidth: 90,
            fontWeight: currentLanguage === 'en' ? 'bold' : 'normal'
          }}
        >
          🇺🇸 English
        </Button>
        <Button
          onClick={() => onLanguageChange('es')}
          variant={currentLanguage === 'es' ? 'contained' : 'outlined'}
          sx={{ 
            minWidth: 90,
            fontWeight: currentLanguage === 'es' ? 'bold' : 'normal'
          }}
        >
          🇪🇸 Español
        </Button>
      </ButtonGroup>
    </Box>
  );
}
