import { loadStripe, Stripe } from '@stripe/stripe-js';
import { Payment } from '@/types/training.types';

// Initialize Stripe
let stripePromise: Promise<Stripe | null>;
const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripePromise;
};

export interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'card',
    name: 'Credit/Debit Card',
    description: 'Pay with Visa, Mastercard, American Express, or Discover',
    icon: '/images/payment/credit-card.svg',
    enabled: true
  },
  {
    id: 'cashapp',
    name: 'Cash App',
    description: 'Pay with your Cash App account',
    icon: '/images/payment/cashapp.svg',
    enabled: true
  },
  {
    id: 'affirm',
    name: 'Affirm',
    description: 'Pay over time with Affirm',
    icon: '/images/payment/affirm.svg',
    enabled: true
  },
  {
    id: 'afterpay',
    name: 'Afterpay',
    description: 'Pay in 4 interest-free installments',
    icon: '/images/payment/afterpay.svg',
    enabled: true
  },
  {
    id: 'paypal',
    name: 'PayPal',
    description: 'Pay with your PayPal account',
    icon: '/images/payment/paypal.svg',
    enabled: true
  }
];

export interface PaymentIntent {
  id: string;
  clientSecret: string;
  amount: number;
  currency: string;
  status: string;
}

export interface PaymentServiceInterface {
  createPaymentIntent(amount: number, currency: string, metadata: Record<string, any>): Promise<PaymentIntent>;
  processPayment(paymentMethodId: string, paymentIntentId: string): Promise<Payment>;
  getPaymentMethods(): PaymentMethod[];
  getPaymentById(paymentId: string): Promise<Payment | null>;
  refundPayment(paymentId: string, amount?: number, reason?: string): Promise<Payment>;
}

// Mock implementation for development
export class MockPaymentService implements PaymentServiceInterface {
  async createPaymentIntent(amount: number, currency: string, metadata: Record<string, any>): Promise<PaymentIntent> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
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
    await new Promise(resolve => setTimeout(resolve, 1500));
    
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
    await new Promise(resolve => setTimeout(resolve, 500));
    
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
    await new Promise(resolve => setTimeout(resolve, 1000));
    
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

class PaymentService implements PaymentServiceInterface {
  private apiUrl = '/api/payments';

  async createPaymentIntent(amount: number, currency: string, metadata: Record<string, any>): Promise<PaymentIntent> {
    try {
      const response = await fetch(`${this.apiUrl}/create-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency,
          metadata
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  async processPayment(paymentMethodId: string, paymentIntentId: string): Promise<Payment> {
    try {
      const response = await fetch(`${this.apiUrl}/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentMethodId,
          paymentIntentId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process payment');
      }

      return await response.json();
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  }

  getPaymentMethods(): PaymentMethod[] {
    return PAYMENT_METHODS.filter(method => method.enabled);
  }

  async getPaymentById(paymentId: string): Promise<Payment | null> {
    try {
      const response = await fetch(`${this.apiUrl}/${paymentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to get payment');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting payment:', error);
      throw error;
    }
  }

  async refundPayment(paymentId: string, amount?: number, reason?: string): Promise<Payment> {
    try {
      const response = await fetch(`${this.apiUrl}/${paymentId}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          reason
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to refund payment');
      }

      return await response.json();
    } catch (error) {
      console.error('Error refunding payment:', error);
      throw error;
    }
  }
}

// Create a singleton instance - Using mock by default to prevent Failed to fetch errors
export const paymentService = new MockPaymentService();

// Export the same instance for compatibility
export const mockPaymentService = paymentService;
