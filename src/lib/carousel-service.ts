import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/firebaseConfig';
import { CarouselSlide, CarouselSlideFormData, DEFAULT_CAROUSEL_SLIDES } from '@/types/carousel.types';

const COLLECTION_NAME = 'carouselSlides';

export class CarouselService {
  /**
   * Get all active carousel slides ordered by their order field
   */
  static async getActiveSlides(): Promise<CarouselSlide[]> {
    try {
      const slidesRef = collection(db, COLLECTION_NAME);
      const q = query(
        slidesRef,
        where('isActive', '==', true),
        orderBy('order', 'asc')
      );
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        // Return default slides if no slides in database
        return DEFAULT_CAROUSEL_SLIDES;
      }
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as CarouselSlide[];
    } catch (error) {
      console.error('Error fetching carousel slides:', error);
      // Return default slides on error
      return DEFAULT_CAROUSEL_SLIDES;
    }
  }

  /**
   * Get all carousel slides (including inactive) for admin
   */
  static async getAllSlides(): Promise<CarouselSlide[]> {
    try {
      const slidesRef = collection(db, COLLECTION_NAME);
      const q = query(slidesRef, orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return DEFAULT_CAROUSEL_SLIDES;
      }
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as CarouselSlide[];
    } catch (error) {
      console.error('Error fetching all carousel slides:', error);
      return DEFAULT_CAROUSEL_SLIDES;
    }
  }

  /**
   * Get a single slide by ID
   */
  static async getSlideById(id: string): Promise<CarouselSlide | null> {
    try {
      // Check if it's a default slide
      const defaultSlide = DEFAULT_CAROUSEL_SLIDES.find(s => s.id === id);
      if (defaultSlide) {
        return defaultSlide;
      }

      const docRef = doc(db, COLLECTION_NAME, id);
      const snapshot = await getDoc(docRef);
      
      if (!snapshot.exists()) {
        return null;
      }
      
      return {
        id: snapshot.id,
        ...snapshot.data(),
      } as CarouselSlide;
    } catch (error) {
      console.error('Error fetching carousel slide:', error);
      return null;
    }
  }

  /**
   * Create a new carousel slide
   */
  static async createSlide(
    data: CarouselSlideFormData,
    userId: string
  ): Promise<{ success: boolean; slideId?: string; error?: string }> {
    try {
      const slidesRef = collection(db, COLLECTION_NAME);
      
      const slideData = {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: userId,
        updatedBy: userId,
      };
      
      const docRef = await addDoc(slidesRef, slideData);
      
      return { success: true, slideId: docRef.id };
    } catch (error) {
      console.error('Error creating carousel slide:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create slide',
      };
    }
  }

  /**
   * Update an existing carousel slide
   */
  static async updateSlide(
    id: string,
    data: Partial<CarouselSlideFormData>,
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
        updatedBy: userId,
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error updating carousel slide:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update slide',
      };
    }
  }

  /**
   * Delete a carousel slide
   */
  static async deleteSlide(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting carousel slide:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete slide',
      };
    }
  }

  /**
   * Toggle slide active status
   */
  static async toggleSlideActive(
    id: string,
    isActive: boolean,
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    return this.updateSlide(id, { isActive }, userId);
  }

  /**
   * Reorder slides
   */
  static async reorderSlides(
    slideIds: string[],
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const updatePromises = slideIds.map((id, index) => {
        const docRef = doc(db, COLLECTION_NAME, id);
        return updateDoc(docRef, {
          order: index,
          updatedAt: serverTimestamp(),
          updatedBy: userId,
        });
      });
      
      await Promise.all(updatePromises);
      
      return { success: true };
    } catch (error) {
      console.error('Error reordering carousel slides:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to reorder slides',
      };
    }
  }

  /**
   * Duplicate a slide
   */
  static async duplicateSlide(
    id: string,
    userId: string
  ): Promise<{ success: boolean; slideId?: string; error?: string }> {
    try {
      const originalSlide = await this.getSlideById(id);
      
      if (!originalSlide) {
        return { success: false, error: 'Slide not found' };
      }
      
      // Get the highest order number
      const allSlides = await this.getAllSlides();
      const maxOrder = Math.max(...allSlides.map(s => s.order), -1);
      
      const newSlideData: CarouselSlideFormData = {
        title: `${originalSlide.title} (Copy)`,
        subtitle: originalSlide.subtitle,
        description: originalSlide.description,
        ctaText: originalSlide.ctaText,
        ctaAction: originalSlide.ctaAction,
        ctaLink: originalSlide.ctaLink,
        secondaryCtaText: originalSlide.secondaryCtaText,
        secondaryCtaLink: originalSlide.secondaryCtaLink,
        backgroundGradient: originalSlide.backgroundGradient,
        accentColor: originalSlide.accentColor,
        imageUrl: originalSlide.imageUrl,
        imagePosition: originalSlide.imagePosition,
        testimonial: originalSlide.testimonial,
        stats: originalSlide.stats,
        targetAudience: originalSlide.targetAudience,
        isActive: false, // Duplicates start as inactive
        order: maxOrder + 1,
      };
      
      return this.createSlide(newSlideData, userId);
    } catch (error) {
      console.error('Error duplicating carousel slide:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to duplicate slide',
      };
    }
  }

  /**
   * Initialize default slides in the database
   */
  static async initializeDefaultSlides(
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const existingSlides = await this.getAllSlides();
      
      // Only initialize if no slides exist (excluding defaults)
      if (existingSlides.length > 0 && !existingSlides[0].id.startsWith('default-')) {
        return { success: true };
      }
      
      const createPromises = DEFAULT_CAROUSEL_SLIDES.map(slide => {
        const { id, createdAt, updatedAt, createdBy, updatedBy, ...slideData } = slide;
        return this.createSlide(slideData as CarouselSlideFormData, userId);
      });
      
      await Promise.all(createPromises);
      
      return { success: true };
    } catch (error) {
      console.error('Error initializing default slides:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to initialize slides',
      };
    }
  }
}
