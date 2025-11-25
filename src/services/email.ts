import { apiService } from './api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const emailService = {
  async sendOrderConfirmation(email: string, orderData: any) {
    return apiService.sendEmail('order-confirmation', { email, ...orderData });
  },

  async sendOrderShipment(email: string, orderData: any) {
    return apiService.sendEmail('order-shipment', { email, ...orderData });
  },

  async sendPaymentReceipt(email: string, paymentData: any) {
    return apiService.sendEmail('payment-receipt', { email, ...paymentData });
  },

  async sendProjectInvitation(email: string, projectData: any) {
    return apiService.sendEmail('project-invitation', { email, ...projectData });
  },

  async sendMessageNotification(email: string, messageData: any) {
    return apiService.sendEmail('message-notification', { email, ...messageData });
  },

  async sendReviewNotification(email: string, reviewData: any) {
    return apiService.sendEmail('review-notification', { email, ...reviewData });
  },

  async sendProposalNotification(email: string, proposalData: any) {
    return apiService.sendEmail('proposal-notification', { email, ...proposalData });
  },

  async sendWelcomeEmail(email: string, userData: any) {
    return apiService.sendEmail('welcome', { email, ...userData });
  },

  async sendPasswordResetEmail(email: string, resetData: any) {
    return apiService.sendEmail('password-reset', { email, ...resetData });
  }
};
