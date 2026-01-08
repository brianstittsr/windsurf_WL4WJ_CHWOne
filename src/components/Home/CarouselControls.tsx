'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CarouselControlsProps {
  totalSlides: number;
  currentIndex: number;
  onPrevious: () => void;
  onNext: () => void;
  onDotClick: (index: number) => void;
  progress: number;
  isPaused: boolean;
}

export function CarouselControls({
  totalSlides,
  currentIndex,
  onPrevious,
  onNext,
  onDotClick,
  progress,
  isPaused,
}: CarouselControlsProps) {
  return (
    <div className="absolute bottom-6 left-0 right-0 z-20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Arrow Controls */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onPrevious}
            className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          {/* Dots and Progress */}
          <div className="flex flex-col items-center gap-3">
            {/* Navigation Dots */}
            <div className="flex items-center gap-2">
              {Array.from({ length: totalSlides }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => onDotClick(index)}
                  className={cn(
                    'h-2 rounded-full transition-all duration-300',
                    currentIndex === index
                      ? 'w-8 bg-white'
                      : 'w-2 bg-white/40 hover:bg-white/60'
                  )}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            {/* Progress Bar */}
            <div className="w-32 h-1 bg-white/20 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full bg-white rounded-full transition-all',
                  isPaused ? '' : 'animate-progress-bar'
                )}
                style={{
                  width: isPaused ? `${progress}%` : '100%',
                  animationDuration: '8s',
                  animationPlayState: isPaused ? 'paused' : 'running',
                }}
              />
            </div>
          </div>

          {/* Arrow Controls */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onNext}
            className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}
