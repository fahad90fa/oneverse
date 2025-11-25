import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import {
  createProductRoutes,
  createGigRoutes,
  createJobRoutes,
  createOrderRoutes,
  createProjectRoutes,
  createReviewRoutes,
  createUploadRoutes,
  createWishlistRoutes
} from './server-routes.js';
import {
  createPaymentRoutes,
  createEmailRoutes,
  createSearchRoutes
} from './server-payment-email.js';
import { initializeChatHandlers } from './server/chat-handlers.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Initialize chat handlers
initializeChatHandlers(io);

// API Routes
app.post('/api/messages', async (req, res) => {
  try {
    const { senderId, receiverId, content } = req.body;

    const { data, error } = await supabase
      .from('messages')
      .insert([{
        sender_id: senderId,
        receiver_id: receiverId,
        content,
        is_read: false
      }])
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/conversations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        messages:messages(*)
      `)
      .or(`user_1_id.eq.${userId},user_2_id.eq.${userId}`)
      .order('last_message_at', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/messages/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/conversations', async (req, res) => {
  try {
    const { user1Id, user2Id } = req.body;

    const { data, error } = await supabase
      .from('conversations')
      .insert([{
        user_1_id: user1Id,
        user_2_id: user2Id
      }])
      .select()
      .single();

    if (error && error.code !== '23505') throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/messages/:messageId/read', async (req, res) => {
  try {
    const { messageId } = req.params;

    const { data, error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('id', messageId)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const { category, search, limit = 20 } = req.query;
    let query = supabase.from('products').select('*');

    if (category) query = query.eq('category', category);
    if (search) query = query.ilike('title', `%${search}%`);

    const { data, error } = await query.limit(parseInt(limit));

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/gigs', async (req, res) => {
  try {
    const { category, search, limit = 20 } = req.query;
    let query = supabase.from('gigs').select('*');

    if (category) query = query.eq('category', category);
    if (search) query = query.ilike('title', `%${search}%`);

    const { data, error } = await query.limit(parseInt(limit));

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/jobs', async (req, res) => {
  try {
    const { search, limit = 20 } = req.query;
    let query = supabase.from('jobs').select('*').eq('status', 'open');

    if (search) query = query.ilike('title', `%${search}%`);

    const { data, error } = await query.limit(parseInt(limit));

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/proposals', async (req, res) => {
  try {
    const { jobId, workerId, amount, deliveryDays, description } = req.body;

    const { data, error } = await supabase
      .from('proposals')
      .insert([{
        job_id: jobId,
        worker_id: workerId,
        amount,
        delivery_days: deliveryDays,
        description
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/notifications/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/notifications', async (req, res) => {
  try {
    const { userId, type, title, description, relatedId, relatedType } = req.body;

    const { data, error } = await supabase
      .from('notifications')
      .insert([{
        user_id: userId,
        type,
        title,
        description,
        related_id: relatedId,
        related_type: relatedType
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/cart/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from('cart')
      .select('*, products(*)')
      .eq('user_id', userId);

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/cart', async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    const { data, error } = await supabase
      .from('cart')
      .insert([{
        user_id: userId,
        product_id: productId,
        quantity: quantity || 1
      }])
      .select()
      .single();

    if (error && error.code === '23505') {
      const { data: updated, error: updateError } = await supabase
        .from('cart')
        .update({ quantity: quantity || 1 })
        .eq('user_id', userId)
        .eq('product_id', productId)
        .select()
        .single();

      if (updateError) throw updateError;
      return res.json(updated);
    }

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/cart/:cartId', async (req, res) => {
  try {
    const { cartId } = req.params;

    const { error } = await supabase
      .from('cart')
      .delete()
      .eq('id', cartId);

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

createProductRoutes(app);
createGigRoutes(app);
createJobRoutes(app);
createOrderRoutes(app);
createProjectRoutes(app);
createReviewRoutes(app);
createUploadRoutes(app);
createWishlistRoutes(app);
createPaymentRoutes(app);
createEmailRoutes(app);
createSearchRoutes(app);

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.io listening on port ${PORT}`);
});
