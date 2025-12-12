/**
 * WL4WJ Service
 * Firebase CRUD operations for WL4WJ program goals and events
 */

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
  Timestamp,
  DocumentData
} from 'firebase/firestore';
import { db } from '@/lib/firebase/firebaseConfig';
import {
  ProgramGoal,
  CreateGoalInput,
  WL4WJEvent,
  CreateEventInput,
  GoalStatus,
  EventStatus
} from '@/types/wl4wj.types';

const GOALS_COLLECTION = 'wl4wjGoals';
const EVENTS_COLLECTION = 'wl4wjEvents';

// Helper to convert Firestore document to ProgramGoal
const docToGoal = (data: DocumentData, id: string): ProgramGoal => {
  return {
    id,
    name: data.name || '',
    description: data.description,
    category: data.category || 'other',
    targetValue: data.targetValue || 0,
    currentValue: data.currentValue || 0,
    unit: data.unit || '',
    startDate: data.startDate?.toDate() || new Date(),
    endDate: data.endDate?.toDate() || new Date(),
    status: data.status || 'active',
    milestones: data.milestones || [],
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
    createdBy: data.createdBy
  };
};

// Helper to convert Firestore document to WL4WJEvent
const docToEvent = (data: DocumentData, id: string): WL4WJEvent => {
  return {
    id,
    title: data.title || '',
    description: data.description,
    eventType: data.eventType || 'other',
    status: data.status || 'upcoming',
    startDate: data.startDate?.toDate() || new Date(),
    endDate: data.endDate?.toDate(),
    startTime: data.startTime,
    endTime: data.endTime,
    location: data.location,
    isVirtual: data.isVirtual || false,
    virtualLink: data.virtualLink,
    contactName: data.contactName,
    contactEmail: data.contactEmail,
    contactPhone: data.contactPhone,
    flyerUrl: data.flyerUrl,
    flyerBase64: data.flyerBase64,
    maxAttendees: data.maxAttendees,
    registrationRequired: data.registrationRequired || false,
    registrationLink: data.registrationLink,
    notes: data.notes,
    tags: data.tags || [],
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
    createdBy: data.createdBy
  };
};

export class WL4WJService {
  // ==================== GOALS ====================

  static async getAllGoals(): Promise<ProgramGoal[]> {
    try {
      const goalsRef = collection(db, GOALS_COLLECTION);
      const snapshot = await getDocs(goalsRef);
      const goals = snapshot.docs.map(doc => docToGoal(doc.data(), doc.id));
      return goals.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error('Error fetching goals:', error);
      return [];
    }
  }

  static async getActiveGoals(): Promise<ProgramGoal[]> {
    try {
      const goalsRef = collection(db, GOALS_COLLECTION);
      const q = query(goalsRef, where('status', '==', 'active'));
      const snapshot = await getDocs(q);
      const goals = snapshot.docs.map(doc => docToGoal(doc.data(), doc.id));
      return goals.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error('Error fetching active goals:', error);
      return [];
    }
  }

  static async createGoal(input: CreateGoalInput, userId?: string): Promise<ProgramGoal> {
    try {
      const goalsRef = collection(db, GOALS_COLLECTION);
      const newGoal = {
        ...input,
        currentValue: input.currentValue || 0,
        status: input.status || 'active',
        startDate: Timestamp.fromDate(input.startDate),
        endDate: Timestamp.fromDate(input.endDate),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: userId
      };
      
      const docRef = await addDoc(goalsRef, newGoal);
      return {
        ...input,
        id: docRef.id,
        currentValue: input.currentValue || 0,
        status: input.status || 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: userId
      } as ProgramGoal;
    } catch (error) {
      console.error('Error creating goal:', error);
      throw error;
    }
  }

  static async updateGoal(id: string, updates: Partial<CreateGoalInput>, userId?: string): Promise<void> {
    try {
      const docRef = doc(db, GOALS_COLLECTION, id);
      const updateData: Record<string, unknown> = {
        ...updates,
        updatedAt: Timestamp.now()
      };
      
      if (updates.startDate) {
        updateData.startDate = Timestamp.fromDate(updates.startDate);
      }
      if (updates.endDate) {
        updateData.endDate = Timestamp.fromDate(updates.endDate);
      }
      
      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error updating goal:', error);
      throw error;
    }
  }

  static async updateGoalProgress(id: string, currentValue: number): Promise<void> {
    try {
      const docRef = doc(db, GOALS_COLLECTION, id);
      await updateDoc(docRef, {
        currentValue,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating goal progress:', error);
      throw error;
    }
  }

  static async deleteGoal(id: string): Promise<void> {
    try {
      const docRef = doc(db, GOALS_COLLECTION, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting goal:', error);
      throw error;
    }
  }

  // ==================== EVENTS ====================

  static async getAllEvents(): Promise<WL4WJEvent[]> {
    try {
      const eventsRef = collection(db, EVENTS_COLLECTION);
      const snapshot = await getDocs(eventsRef);
      const events = snapshot.docs.map(doc => docToEvent(doc.data(), doc.id));
      return events.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
    } catch (error) {
      console.error('Error fetching events:', error);
      return [];
    }
  }

  static async getUpcomingEvents(): Promise<WL4WJEvent[]> {
    try {
      const events = await this.getAllEvents();
      const now = new Date();
      return events.filter(e => e.startDate >= now && e.status !== 'cancelled');
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      return [];
    }
  }

  static async createEvent(input: CreateEventInput, userId?: string): Promise<WL4WJEvent> {
    try {
      const eventsRef = collection(db, EVENTS_COLLECTION);
      const newEvent: Record<string, unknown> = {
        ...input,
        status: input.status || 'upcoming',
        isVirtual: input.isVirtual || false,
        registrationRequired: input.registrationRequired || false,
        startDate: Timestamp.fromDate(input.startDate),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: userId
      };
      
      if (input.endDate) {
        newEvent.endDate = Timestamp.fromDate(input.endDate);
      }
      
      const docRef = await addDoc(eventsRef, newEvent);
      return {
        ...input,
        id: docRef.id,
        status: input.status || 'upcoming',
        isVirtual: input.isVirtual || false,
        registrationRequired: input.registrationRequired || false,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: userId
      } as WL4WJEvent;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  static async updateEvent(id: string, updates: Partial<CreateEventInput>): Promise<void> {
    try {
      const docRef = doc(db, EVENTS_COLLECTION, id);
      const updateData: Record<string, unknown> = {
        ...updates,
        updatedAt: Timestamp.now()
      };
      
      if (updates.startDate) {
        updateData.startDate = Timestamp.fromDate(updates.startDate);
      }
      if (updates.endDate) {
        updateData.endDate = Timestamp.fromDate(updates.endDate);
      }
      
      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }

  static async deleteEvent(id: string): Promise<void> {
    try {
      const docRef = doc(db, EVENTS_COLLECTION, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }

  // ==================== METRICS ====================

  static async getDashboardMetrics(): Promise<{
    activeCHWs: number;
    communityPrograms: number;
    formsProcessed: number;
    trainingCompletions: number;
    totalResources: number;
    activeGoals: number;
    upcomingEvents: number;
  }> {
    try {
      const [goals, events] = await Promise.all([
        this.getActiveGoals(),
        this.getUpcomingEvents()
      ]);

      // For now, return calculated metrics from goals
      // In a real implementation, these would come from actual data collections
      return {
        activeCHWs: goals.find(g => g.category === 'recruitment')?.currentValue || 0,
        communityPrograms: goals.find(g => g.category === 'community')?.currentValue || 0,
        formsProcessed: 0, // Would come from forms collection
        trainingCompletions: goals.find(g => g.category === 'training')?.currentValue || 0,
        totalResources: 0, // Will be passed from component
        activeGoals: goals.length,
        upcomingEvents: events.length
      };
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      return {
        activeCHWs: 0,
        communityPrograms: 0,
        formsProcessed: 0,
        trainingCompletions: 0,
        totalResources: 0,
        activeGoals: 0,
        upcomingEvents: 0
      };
    }
  }
}

export default WL4WJService;
