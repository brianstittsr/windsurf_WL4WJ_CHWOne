'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { CarouselSlide as SlideType, CTAAction, DEFAULT_CAROUSEL_SLIDES } from '@/types/carousel.types';
import { CarouselSlide } from './CarouselSlide';
import { CarouselControls } from './CarouselControls';

interface HeroCarouselProps {
  slides?: SlideType[];
  autoAdvanceInterval?: number;
  onCTAClick: (action: CTAAction) => void;
}

export default function HeroCarousel({ 
  slides = DEFAULT_CAROUSEL_SLIDES,
  autoAdvanceInterval = 8000,
  onCTAClick,
}: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  const activeSlides = slides.filter(s => s.isActive);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
    setProgress(0);
  }, [activeSlides.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
    setProgress(0);
  }, [activeSlides.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
    setProgress(0);
  }, []);

  // Auto-advance timer
  useEffect(() => {
    if (isPaused || activeSlides.length <= 1) return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = (elapsed / autoAdvanceInterval) * 100;
      
      if (newProgress >= 100) {
        goToNext();
      } else {
        setProgress(newProgress);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isPaused, currentIndex, autoAdvanceInterval, goToNext, activeSlides.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrevious]);

  if (activeSlides.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-800">
        <p className="text-white text-xl">No slides configured</p>
      </div>
    );
  }

  return (
    <div 
      className="relative flex-1 overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides */}
      {activeSlides.map((slide, index) => (
        <CarouselSlide
          key={slide.id}
          slide={slide}
          isActive={index === currentIndex}
          onCTAClick={onCTAClick}
        />
      ))}

      {/* Controls */}
      {activeSlides.length > 1 && (
        <CarouselControls
          totalSlides={activeSlides.length}
          currentIndex={currentIndex}
          onPrevious={goToPrevious}
          onNext={goToNext}
          onDotClick={goToSlide}
          progress={progress}
          isPaused={isPaused}
        />
      )}
    </div>
  );
}
