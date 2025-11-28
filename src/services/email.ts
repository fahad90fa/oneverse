import { apiService } from './api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const emailService = {
  async sendOrderConfirmation(email: string, orderData: Record<string, unknown>) {
    return apiService.sendEmail('order-confirmation', { email, ...orderData });
  },

  async sendOrderShipment(email: string, orderData: Record<string, unknown>) {
    return apiService.sendEmail('order-shipment', { email, ...orderData });
  },

  async sendPaymentReceipt(email: string, paymentData: Record<string, unknown>) {
    return apiService.sendEmail('payment-receipt', { email, ...paymentData });
  },

  async sendProjectInvitation(email: string, projectData: Record<string, unknown>) {
    return apiService.sendEmail('project-invitation', { email, ...projectData });
  },

  async sendMessageNotification(email: string, messageData: Record<string, unknown>) {
    return apiService.sendEmail('message-notification', { email, ...messageData });
  },

  async sendReviewNotification(email: string, reviewData: Record<string, unknown>) {
    return apiService.sendEmail('review-notification', { email, ...reviewData });
  },

  async sendProposalNotification(email: string, proposalData: Record<string, unknown>) {
    return apiService.sendEmail('proposal-notification', { email, ...proposalData });
  },

  async sendWelcomeEmail(email: string, userData: Record<string, unknown>) {
    return apiService.sendEmail('welcome', { email, ...userData });
  },

  async sendPasswordResetEmail(email: string, resetData: Record<string, unknown>) {
    return apiService.sendEmail('password-reset', { email, ...resetData });
  }
};
