'use client';

import React from 'react';
import { CarouselStat } from '@/types/carousel.types';

interface CarouselStatsProps {
  stats: CarouselStat[];
  accentColor: string;
}

export function CarouselStats({ stats, accentColor }: CarouselStatsProps) {
  if (!stats || stats.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-6 md:gap-8">
      {stats.map((stat, index) => (
        <div key={index} className="text-center">
          <div 
            className={`text-3xl md:text-4xl font-bold mb-1`}
            style={{ color: accentColor === 'white' ? 'white' : undefined }}
          >
            <span className={accentColor !== 'white' ? `text-${accentColor}` : ''}>
              {stat.value}
            </span>
          </div>
          <div className="text-sm md:text-base text-white/80">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}
