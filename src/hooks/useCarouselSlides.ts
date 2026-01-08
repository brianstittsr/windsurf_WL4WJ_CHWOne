'use client';

import { useState, useEffect, useCallback } from 'react';
import { CarouselSlide, DEFAULT_CAROUSEL_SLIDES } from '@/types/carousel.types';
import { CarouselService } from '@/lib/carousel-service';

interface UseCarouselSlidesReturn {
  slides: CarouselSlide[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseCarouselAdminReturn extends UseCarouselSlidesReturn {
  createSlide: (data: Omit<CarouselSlide, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>, userId: string) => Promise<{ success: boolean; slideId?: string; error?: string }>;
  updateSlide: (id: string, data: Partial<CarouselSlide>, userId: string) => Promise<{ success: boolean; error?: string }>;
  deleteSlide: (id: string) => Promise<{ success: boolean; error?: string }>;
  toggleActive: (id: string, isActive: boolean, userId: string) => Promise<{ success: boolean; error?: string }>;
  reorderSlides: (slideIds: string[], userId: string) => Promise<{ success: boolean; error?: string }>;
  duplicateSlide: (id: string, userId: string) => Promise<{ success: boolean; slideId?: string; error?: string }>;
}

/**
 * Hook for fetching active carousel slides (for public display)
 */
export function useCarouselSlides(): UseCarouselSlidesReturn {
  const [slides, setSlides] = useState<CarouselSlide[]>(DEFAULT_CAROUSEL_SLIDES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSlides = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedSlides = await CarouselService.getActiveSlides();
      setSlides(fetchedSlides);
    } catch (err) {
      console.error('Error fetching carousel slides:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch slides');
      // Keep default slides on error
      setSlides(DEFAULT_CAROUSEL_SLIDES);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSlides();
  }, [fetchSlides]);

  return {
    slides,
    loading,
    error,
    refetch: fetchSlides,
  };
}

/**
 * Hook for admin carousel management (includes all CRUD operations)
 */
export function useCarouselAdmin(): UseCarouselAdminReturn {
  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSlides = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedSlides = await CarouselService.getAllSlides();
      setSlides(fetchedSlides);
    } catch (err) {
      console.error('Error fetching carousel slides:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch slides');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSlides();
  }, [fetchSlides]);

  const createSlide = useCallback(async (
    data: Omit<CarouselSlide, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>,
    userId: string
  ) => {
    const result = await CarouselService.createSlide(data, userId);
    if (result.success) {
      await fetchSlides();
    }
    return result;
  }, [fetchSlides]);

  const updateSlide = useCallback(async (
    id: string,
    data: Partial<CarouselSlide>,
    userId: string
  ) => {
    const result = await CarouselService.updateSlide(id, data, userId);
    if (result.success) {
      await fetchSlides();
    }
    return result;
  }, [fetchSlides]);

  const deleteSlide = useCallback(async (id: string) => {
    const result = await CarouselService.deleteSlide(id);
    if (result.success) {
      await fetchSlides();
    }
    return result;
  }, [fetchSlides]);

  const toggleActive = useCallback(async (
    id: string,
    isActive: boolean,
    userId: string
  ) => {
    const result = await CarouselService.toggleSlideActive(id, isActive, userId);
    if (result.success) {
      await fetchSlides();
    }
    return result;
  }, [fetchSlides]);

  const reorderSlides = useCallback(async (
    slideIds: string[],
    userId: string
  ) => {
    const result = await CarouselService.reorderSlides(slideIds, userId);
    if (result.success) {
      await fetchSlides();
    }
    return result;
  }, [fetchSlides]);

  const duplicateSlide = useCallback(async (
    id: string,
    userId: string
  ) => {
    const result = await CarouselService.duplicateSlide(id, userId);
    if (result.success) {
      await fetchSlides();
    }
    return result;
  }, [fetchSlides]);

  return {
    slides,
    loading,
    error,
    refetch: fetchSlides,
    createSlide,
    updateSlide,
    deleteSlide,
    toggleActive,
    reorderSlides,
    duplicateSlide,
  };
}
