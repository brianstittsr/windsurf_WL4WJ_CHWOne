'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CarouselSlide as SlideType, CTAAction } from '@/types/carousel.types';
import { CarouselStats } from './CarouselStats';
import { CarouselTestimonial } from './CarouselTestimonial';
import { cn } from '@/lib/utils';

interface CarouselSlideProps {
  slide: SlideType;
  isActive: boolean;
  onCTAClick: (action: CTAAction) => void;
}

export function CarouselSlide({ slide, isActive, onCTAClick }: CarouselSlideProps) {
  const handlePrimaryClick = () => {
    if (slide.ctaAction === 'custom_link' && slide.ctaLink) {
      window.location.href = slide.ctaLink;
    } else {
      onCTAClick(slide.ctaAction);
    }
  };

  return (
    <div
      className={cn(
        'absolute inset-0 flex items-center transition-all duration-500',
        slide.backgroundGradient,
        isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
      )}
    >
      {/* Background Image Overlay */}
      {slide.imageUrl && slide.imagePosition === 'background' && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${slide.imageUrl})` }}
        />
      )}

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
          {/* Left Image */}
          {slide.imageUrl && slide.imagePosition === 'left' && (
            <div className="w-full lg:w-2/5 flex-shrink-0 flex items-center justify-center">
              <div className="w-[280px] h-[350px] md:w-[320px] md:h-[400px] relative overflow-hidden rounded-2xl shadow-2xl">
                <img
                  src={slide.imageUrl}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Content */}
          <div className={cn(
            'flex-1 text-white',
            slide.imagePosition === 'right' ? 'order-first' : ''
          )}>
            <h1 className={cn(
              'text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 leading-tight',
              isActive ? 'animate-fade-in' : ''
            )}>
              {slide.title}
            </h1>
            
            <p className={cn(
              'text-lg md:text-xl lg:text-2xl text-white/90 mb-4',
              isActive ? 'animate-fade-in' : ''
            )}
            style={{ animationDelay: '0.1s' }}
            >
              {slide.subtitle}
            </p>
            
            <p className={cn(
              'text-base md:text-lg text-white/80 mb-6 max-w-2xl',
              isActive ? 'animate-fade-in' : ''
            )}
            style={{ animationDelay: '0.2s' }}
            >
              {slide.description}
            </p>

            {/* Stats */}
            {slide.stats && slide.stats.length > 0 && (
              <div className={cn(
                'mb-6',
                isActive ? 'animate-fade-in' : ''
              )}
              style={{ animationDelay: '0.3s' }}
              >
                <CarouselStats stats={slide.stats} accentColor={slide.accentColor} />
              </div>
            )}

            {/* CTA Buttons */}
            <div className={cn(
              'flex flex-wrap gap-4 mb-6',
              isActive ? 'animate-fade-in' : ''
            )}
            style={{ animationDelay: '0.4s' }}
            >
              <Button
                size="lg"
                onClick={handlePrimaryClick}
                className={cn(
                  'text-base md:text-lg px-6 md:px-8 py-5 md:py-6 font-semibold',
                  'bg-white hover:bg-white/90 text-gray-900',
                  'shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5'
                )}
              >
                {slide.ctaText}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              {slide.secondaryCtaText && slide.secondaryCtaLink && (
                <Button
                  variant="outline"
                  size="lg"
                  asChild
                  className={cn(
                    'text-base md:text-lg px-6 md:px-8 py-5 md:py-6 font-semibold',
                    'border-2 border-white text-white bg-white/20 hover:bg-white/30',
                    'backdrop-blur-sm transition-all hover:-translate-y-0.5'
                  )}
                >
                  <Link href={slide.secondaryCtaLink}>
                    {slide.secondaryCtaText}
                  </Link>
                </Button>
              )}
            </div>

            {/* Testimonial */}
            {slide.testimonial && (
              <div className={cn(
                isActive ? 'animate-fade-in' : ''
              )}
              style={{ animationDelay: '0.5s' }}
              >
                <CarouselTestimonial testimonial={slide.testimonial} />
              </div>
            )}
          </div>

          {/* Right Image */}
          {slide.imageUrl && slide.imagePosition === 'right' && (
            <div className="w-full lg:w-2/5 flex-shrink-0 flex items-center justify-center">
              <div className="w-[280px] h-[350px] md:w-[320px] md:h-[400px] relative overflow-hidden rounded-2xl shadow-2xl">
                <img
                  src={slide.imageUrl}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
