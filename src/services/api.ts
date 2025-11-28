const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface PaymentIntentData {
  amount: number;
  currency: string;
  description?: string;
}

export interface CheckoutSessionData {
  orderId: string;
  userId: string;
  amount: number;
  currency: string;
  successUrl: string;
  cancelUrl: string;
}

export const apiService = {
  async createPaymentIntent(data: PaymentIntentData) {
    try {
      const response = await fetch(`${API_URL}/api/payment/intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  },

  async createCheckoutSession(data: CheckoutSessionData) {
    try {
      const response = await fetch(`${API_URL}/api/payment/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  },

  async confirmPayment(paymentIntentId: string) {
    try {
      const response = await fetch(`${API_URL}/api/payment/confirm/${paymentIntentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      return await response.json();
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw error;
    }
  },

  async getPaymentStatus(paymentIntentId: string) {
    try {
      const response = await fetch(`${API_URL}/api/payment/status/${paymentIntentId}`);
      return await response.json();
    } catch (error) {
      console.error('Error getting payment status:', error);
      throw error;
    }
  },

  async sendEmail(type: string, data: Record<string, unknown>) {
    try {
      const response = await fetch(`${API_URL}/api/email/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      console.error(`Error sending ${type} email:`, error);
      throw error;
    }
  },

  async uploadFile(file: File, userId: string, uploadType: string) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId);

      const response = await fetch(`${API_URL}/api/upload/${uploadType}`, {
        method: 'POST',
        body: formData
      });
      return await response.json();
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  },

  async searchProducts(query: string, filters?: Record<string, unknown>) {
    try {
      const params = new URLSearchParams({ q: query, ...filters });
      const response = await fetch(`${API_URL}/api/search/products?${params}`);
      return await response.json();
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  },

  async searchGigs(query: string, filters?: Record<string, unknown>) {
    try {
      const params = new URLSearchParams({ q: query, ...filters });
      const response = await fetch(`${API_URL}/api/search/gigs?${params}`);
      return await response.json();
    } catch (error) {
      console.error('Error searching gigs:', error);
      throw error;
    }
  },

  async searchJobs(query: string, filters?: Record<string, unknown>) {
    try {
      const params = new URLSearchParams({ q: query, ...filters });
      const response = await fetch(`${API_URL}/api/search/jobs?${params}`);
      return await response.json();
    } catch (error) {
      console.error('Error searching jobs:', error);
      throw error;
    }
  }
};
