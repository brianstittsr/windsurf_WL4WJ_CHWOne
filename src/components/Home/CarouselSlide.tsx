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
          {/* Left Image - Full height with fade and rounded corners */}
          {slide.imageUrl && slide.imagePosition === 'left' && (
            <div className="hidden lg:block absolute left-4 top-4 bottom-4 w-1/2 xl:w-2/5 overflow-hidden rounded-3xl shadow-2xl">
              <div className="relative w-full h-full rounded-3xl overflow-hidden">
                <img
                  src={slide.imageUrl}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover object-center"
                />
                {/* Bottom fade gradient - transparent to dark */}
                <div 
                  className="absolute inset-x-0 bottom-0 h-1/3 pointer-events-none rounded-b-3xl"
                  style={{
                    background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 40%, transparent 100%)'
                  }}
                />
              </div>
            </div>
          )}

          {/* Content */}
          <div className={cn(
            'flex-1 text-white relative z-20',
            slide.imagePosition === 'right' ? 'lg:w-1/2 xl:w-3/5 lg:pr-8' : '',
            slide.imagePosition === 'left' ? 'lg:w-1/2 xl:w-3/5 lg:pl-8 lg:ml-auto' : ''
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

          {/* Right Image - Full height with fade and rounded corners */}
          {slide.imageUrl && slide.imagePosition === 'right' && (
            <div className="hidden lg:block absolute right-4 top-4 bottom-4 w-1/2 xl:w-2/5 overflow-hidden rounded-3xl shadow-2xl">
              <div className="relative w-full h-full rounded-3xl overflow-hidden">
                <img
                  src={slide.imageUrl}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover object-center"
                />
                {/* Bottom fade gradient - transparent to dark */}
                <div 
                  className="absolute inset-x-0 bottom-0 h-1/3 pointer-events-none rounded-b-3xl"
                  style={{
                    background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 40%, transparent 100%)'
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
