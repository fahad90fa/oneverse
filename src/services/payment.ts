import { apiService } from './api';

export interface PaymentIntentData {
  amount: number;
  currency: string;
  description?: string;
  metadata?: Record<string, string>;
}

export interface CheckoutSessionData {
  orderId: string;
  userId: string;
  amount: number;
  currency: string;
  successUrl: string;
  cancelUrl: string;
}

export const paymentService = {
  async createPaymentIntent(data: PaymentIntentData) {
    return apiService.createPaymentIntent(data);
  },

  async createCheckoutSession(data: CheckoutSessionData) {
    return apiService.createCheckoutSession(data);
  },

  async confirmPayment(paymentIntentId: string) {
    return apiService.confirmPayment(paymentIntentId);
  },

  async getPaymentStatus(paymentIntentId: string) {
    return apiService.getPaymentStatus(paymentIntentId);
  },

  async refundPayment(paymentIntentId: string, amount?: number) {
    try {
      const response = await fetch(`http://localhost:3000/api/payment/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentIntentId, amount })
      });
      return await response.json();
    } catch (error) {
      console.error('Error refunding payment:', error);
      throw error;
    }
  }
};
