/**
 * Mock Payment Service
 * 
 * This file provides a mock implementation of the PaymentService that doesn't rely on API calls.
 * It's designed to prevent "Failed to fetch" errors when the payment API endpoints aren't available.
 */

import { Payment } from '@/types/training.types';
import { PaymentMethod, PAYMENT_METHODS, PaymentIntent, PaymentServiceInterface } from './PaymentService';

export class MockPaymentService implements PaymentServiceInterface {
  async createPaymentIntent(amount: number, currency: string, metadata: Record<string, any>): Promise<PaymentIntent> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      id: `pi_${Math.random().toString(36).substring(2, 15)}`,
      clientSecret: `pi_${Math.random().toString(36).substring(2, 15)}_secret_${Math.random().toString(36).substring(2, 15)}`,
      amount,
      currency,
      status: 'requires_payment_method'
    };
  }

  async processPayment(paymentMethodId: string, paymentIntentId: string): Promise<Payment> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const now = new Date();
    
    return {
      id: `payment_${Math.random().toString(36).substring(2, 15)}`,
      userId: 'user-1',
      courseId: 'course-1',
      amount: 99.99,
      currency: 'usd',
      status: 'completed',
      gateway: 'stripe',
      gatewayPaymentId: paymentIntentId,
      createdAt: now,
      updatedAt: now,
      metadata: {
        customerEmail: 'user@example.com',
        customerName: 'John Doe',
        paymentMethod: {
          type: paymentMethodId,
          last4: '4242',
          brand: 'visa'
        },
        receiptUrl: 'https://example.com/receipt'
      }
    };
  }

  getPaymentMethods(): PaymentMethod[] {
    return PAYMENT_METHODS.filter(method => method.enabled);
  }

  async getPaymentById(paymentId: string): Promise<Payment | null> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const now = new Date();
    
    return {
      id: paymentId,
      userId: 'user-1',
      courseId: 'course-1',
      amount: 99.99,
      currency: 'usd',
      status: 'completed',
      gateway: 'stripe',
      gatewayPaymentId: `pi_${Math.random().toString(36).substring(2, 15)}`,
      createdAt: now,
      updatedAt: now,
      metadata: {
        customerEmail: 'user@example.com',
        customerName: 'John Doe',
        paymentMethod: {
          type: 'card',
          last4: '4242',
          brand: 'visa'
        },
        receiptUrl: 'https://example.com/receipt'
      }
    };
  }

  async refundPayment(paymentId: string, amount?: number, reason?: string): Promise<Payment> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const now = new Date();
    
    return {
      id: paymentId,
      userId: 'user-1',
      courseId: 'course-1',
      amount: 99.99,
      currency: 'usd',
      status: 'refunded',
      gateway: 'stripe',
      gatewayPaymentId: `pi_${Math.random().toString(36).substring(2, 15)}`,
      createdAt: new Date(now.getTime() - 86400000),
      updatedAt: now,
      metadata: {
        customerEmail: 'user@example.com',
        customerName: 'John Doe',
        paymentMethod: {
          type: 'card',
          last4: '4242',
          brand: 'visa'
        },
        receiptUrl: 'https://example.com/receipt'
      },
      refundReason: reason || 'Customer requested',
      refundAmount: amount || 99.99,
      refundedAt: now
    };
  }
}
