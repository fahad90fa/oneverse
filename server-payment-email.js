import Stripe from 'stripe';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

const emailTemplates = {
  'order-confirmation': (data) => ({
    subject: `OneVerse: Order Confirmation - #${data.orderId.slice(0, 8)}`,
    html: `
      <h2>Order Confirmation</h2>
      <p>Thank you for your purchase on OneVerse!</p>
      <p><strong>Order ID:</strong> ${data.orderId}</p>
      <p><strong>Total Amount:</strong> $${data.totalPrice}</p>
      <p><strong>Status:</strong> ${data.status}</p>
      <p><strong>Shipping Address:</strong></p>
      <p>${data.shippingAddress}</p>
      <p>We'll notify you when your order is shipped. Visit your OneVerse account to track your order.</p>
      <p>Questions? Contact us at support@oneverse.site</p>
    `
  }),
  'order-shipment': (data) => ({
    subject: `OneVerse: Your Order Has Shipped - #${data.orderId.slice(0, 8)}`,
    html: `
      <h2>Your OneVerse Order Has Been Shipped!</h2>
      <p>Your order has been dispatched and is on its way to you.</p>
      <p><strong>Order ID:</strong> ${data.orderId}</p>
      <p><strong>Tracking Number:</strong> ${data.trackingNumber}</p>
      <p><strong>Carrier:</strong> ${data.carrier}</p>
      <p>Track your package: <a href="${data.trackingUrl}">Click here</a></p>
      <p>Questions? Visit oneverse.site or contact support@oneverse.site</p>
    `
  }),
  'payment-receipt': (data) => ({
    subject: `OneVerse: Payment Receipt - ${data.transactionId}`,
    html: `
      <h2>OneVerse Payment Receipt</h2>
      <p>Thank you for your payment on OneVerse!</p>
      <p><strong>Amount:</strong> ${data.currency} ${data.amount}</p>
      <p><strong>Date:</strong> ${new Date(data.date).toLocaleDateString()}</p>
      <p><strong>Transaction ID:</strong> ${data.transactionId}</p>
      <p><strong>Payment Method:</strong> ${data.paymentMethod}</p>
      <p>Questions? Contact us at support@oneverse.site</p>
    `
  }),
  'project-invitation': (data) => ({
    subject: `OneVerse: Project Invitation - ${data.projectTitle}`,
    html: `
      <h2>New Project Invitation on OneVerse</h2>
      <p>You've been invited to work on a new project!</p>
      <p><strong>Project:</strong> ${data.projectTitle}</p>
      <p><strong>Budget:</strong> $${data.budget}</p>
      <p><strong>Deadline:</strong> ${data.deadline}</p>
      <p><strong>Description:</strong> ${data.description}</p>
      <p>Accept or decline this invitation by logging into your OneVerse account at oneverse.site</p>
      <p>Questions? Contact support@oneverse.site</p>
    `
  }),
  'message-notification': (data) => ({
    subject: `OneVerse: New Message from ${data.senderName}`,
    html: `
      <h2>New Message on OneVerse</h2>
      <p>You have a new message from ${data.senderName}.</p>
      <p><strong>Message:</strong> ${data.message}</p>
      <p>Log into your OneVerse account to reply: oneverse.site</p>
    `
  }),
  'review-notification': (data) => ({
    subject: `OneVerse: New Review - ${data.rating} Stars from ${data.reviewerName}`,
    html: `
      <h2>New Review Received on OneVerse</h2>
      <p>${data.reviewerName} left you a review on OneVerse!</p>
      <p><strong>Rating:</strong> ${'⭐'.repeat(data.rating)} (${data.rating}/5)</p>
      <p><strong>Comment:</strong> ${data.comment}</p>
      <p>View more details in your OneVerse account dashboard.</p>
      <p>Questions? Contact support@oneverse.site</p>
    `
  }),
  'proposal-notification': (data) => ({
    subject: `OneVerse: New Proposal for "${data.jobTitle}"`,
    html: `
      <h2>New Proposal Received on OneVerse</h2>
      <p>You have a new proposal from ${data.workerName}!</p>
      <p><strong>Job:</strong> ${data.jobTitle}</p>
      <p><strong>Proposed Amount:</strong> $${data.amount}</p>
      <p><strong>Delivery Time:</strong> ${data.deliveryDays} days</p>
      <p><strong>Description:</strong> ${data.description}</p>
      <p>Review and accept/reject the proposal in your OneVerse dashboard at oneverse.site</p>
      <p>Questions? Contact support@oneverse.site</p>
    `
  }),
  'welcome': (data) => ({
    subject: `Welcome to OneVerse, ${data.fullName}!`,
    html: `
      <h2>Welcome to OneVerse!</h2>
      <p>Hi ${data.fullName},</p>
      <p>Thank you for joining OneVerse! We're excited to have you on board.</p>
      <p>As a ${data.role}, you can:</p>
      <ul>
        <li>Browse and purchase products or services</li>
        <li>Post and manage your portfolio</li>
        <li>Connect with other users and collaborate</li>
        <li>Showcase your work and build your reputation</li>
        <li>Manage your account securely</li>
      </ul>
      <p>Log in to OneVerse to get started: <a href="https://oneverse.site">oneverse.site</a></p>
      <p>If you have any questions, feel free to contact our support team at support@oneverse.site</p>
      <p>Welcome to OneVerse – Your all-in-one freelance marketplace!</p>
    `
  }),
  'password-reset': (data) => ({
    subject: 'OneVerse: Password Reset Request',
    html: `
      <h2>OneVerse Password Reset</h2>
      <p>You requested a password reset for your OneVerse account.</p>
      <p><a href="${data.resetLink}">Click here to reset your password</a></p>
      <p>This link expires in 24 hours.</p>
      <p>If you didn't request this, please ignore this email and your account will remain secure.</p>
      <p>Questions? Contact support@oneverse.site</p>
    `
  })
};

export const createPaymentRoutes = (app) => {
  app.post('/api/payment/intent', async (req, res) => {
    try {
      const { amount, currency, description, metadata } = req.body;

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: currency.toLowerCase(),
        description,
        metadata
      });

      await supabase
        .from('payments')
        .insert([{
          user_id: metadata?.userId,
          amount,
          currency,
          status: 'processing',
          stripe_payment_intent_id: paymentIntent.id,
          payment_method: 'card'
        }]);

      res.json({ clientSecret: paymentIntent.client_secret, id: paymentIntent.id });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/payment/confirm/:paymentIntentId', async (req, res) => {
    try {
      const { paymentIntentId } = req.params;

      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status === 'succeeded') {
        await supabase
          .from('payments')
          .update({ status: 'completed' })
          .eq('stripe_payment_intent_id', paymentIntentId);

        return res.json({ success: true, status: 'completed' });
      }

      res.json({ success: false, status: paymentIntent.status });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/payment/status/:paymentIntentId', async (req, res) => {
    try {
      const { paymentIntentId } = req.params;

      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      res.json({
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        created: new Date(paymentIntent.created * 1000)
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/payment/refund', async (req, res) => {
    try {
      const { paymentIntentId, amount } = req.body;

      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount ? Math.round(amount * 100) : undefined
      });

      await supabase
        .from('payments')
        .update({ status: 'refunded' })
        .eq('stripe_payment_intent_id', paymentIntentId);

      res.json({ success: true, refundId: refund.id });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/payment/webhook', async (req, res) => {
    try {
      const sig = req.headers['stripe-signature'];
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object;
          await supabase
            .from('payments')
            .update({ status: 'completed' })
            .eq('stripe_payment_intent_id', paymentIntent.id);

          if (paymentIntent.metadata?.orderId) {
            await supabase
              .from('orders')
              .update({ status: 'processing' })
              .eq('id', paymentIntent.metadata.orderId);
          }
          break;

        case 'payment_intent.payment_failed':
          const failedIntent = event.data.object;
          await supabase
            .from('payments')
            .update({ status: 'failed' })
            .eq('stripe_payment_intent_id', failedIntent.id);
          break;

        case 'charge.refunded':
          const refundedCharge = event.data.object;
          await supabase
            .from('payments')
            .update({ status: 'refunded' })
            .eq('stripe_payment_intent_id', refundedCharge.payment_intent);
          break;
      }

      res.json({ received: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};

export const createEmailRoutes = (app) => {
  app.post('/api/email/:type', async (req, res) => {
    try {
      const { type } = req.params;
      const { email, ...data } = req.body;

      const template = emailTemplates[type];
      if (!template) {
        return res.status(400).json({ error: 'Invalid email type' });
      }

      const emailContent = template(data);

      const result = await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: email,
        subject: emailContent.subject,
        html: emailContent.html
      });

      res.json({ success: true, messageId: result.messageId });
    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/email/health', (req, res) => {
    res.json({ status: 'Email service operational' });
  });
};

export const createSearchRoutes = (app) => {
  app.get('/api/search/products', async (req, res) => {
    try {
      const { q, category, minPrice, maxPrice } = req.query;
      let query = supabase.from('products').select('*');

      if (q) query = query.ilike('title', `%${q}%`);
      if (category) query = query.eq('category', category);
      if (minPrice) query = query.gte('price', parseFloat(minPrice));
      if (maxPrice) query = query.lte('price', parseFloat(maxPrice));

      const { data } = await query.limit(20);
      res.json(data || []);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/search/gigs', async (req, res) => {
    try {
      const { q, category, minPrice, maxPrice } = req.query;
      let query = supabase.from('gigs').select('*');

      if (q) query = query.ilike('title', `%${q}%`);
      if (category) query = query.eq('category', category);
      if (minPrice) query = query.gte('price', parseFloat(minPrice));
      if (maxPrice) query = query.lte('price', parseFloat(maxPrice));

      const { data } = await query.limit(20);
      res.json(data || []);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/search/jobs', async (req, res) => {
    try {
      const { q, minBudget, maxBudget } = req.query;
      let query = supabase.from('jobs').select('*').eq('status', 'open');

      if (q) query = query.ilike('title', `%${q}%`);
      if (minBudget) query = query.gte('budget', parseFloat(minBudget));
      if (maxBudget) query = query.lte('budget', parseFloat(maxBudget));

      const { data } = await query.limit(20);
      res.json(data || []);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};
