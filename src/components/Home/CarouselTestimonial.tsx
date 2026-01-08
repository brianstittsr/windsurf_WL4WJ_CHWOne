'use client';

import React from 'react';
import { CarouselTestimonial as TestimonialType } from '@/types/carousel.types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface CarouselTestimonialProps {
  testimonial: TestimonialType;
}

export function CarouselTestimonial({ testimonial }: CarouselTestimonialProps) {
  const initials = testimonial.author
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 md:p-6 max-w-lg">
      <div className="flex items-start gap-4">
        <Avatar className="h-12 w-12 border-2 border-white/30">
          {testimonial.avatarUrl ? (
            <AvatarImage src={testimonial.avatarUrl} alt={testimonial.author} />
          ) : null}
          <AvatarFallback className="bg-white/20 text-white font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="text-white/90 italic text-sm md:text-base leading-relaxed mb-3">
            &ldquo;{testimonial.quote}&rdquo;
          </p>
          <div>
            <p className="text-white font-semibold text-sm">{testimonial.author}</p>
            <p className="text-white/70 text-xs">{testimonial.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
