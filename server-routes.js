import express from 'express';
import { createClient } from '@supabase/supabase-js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(uploadDir, req.params.uploadType || 'general');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }
});

export const createProductRoutes = (app) => {
  app.get('/api/products', async (req, res) => {
    try {
      const { category, search, limit = 20, offset = 0 } = req.query;
      let query = supabase.from('products').select('*', { count: 'exact' });

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }
      if (search) {
        query = query.ilike('title', `%${search}%`);
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

      if (error) throw error;

      res.json({ data, total: count });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/products/:id', async (req, res) => {
    try {
      const { id } = req.params;

      const { data, error } = await supabase
        .from('products')
        .select('*, reviews(*, profiles(full_name, avatar_url))')
        .eq('id', id)
        .single();

      if (error) throw error;

      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/products', async (req, res) => {
    try {
      const { sellerId, title, description, price, stockQuantity, category, images } = req.body;

      const { data, error } = await supabase
        .from('products')
        .insert([{
          seller_id: sellerId,
          title,
          description,
          price,
          stock_quantity: stockQuantity,
          category,
          images: images || [],
          status: 'active'
        }])
        .select()
        .single();

      if (error) throw error;

      res.status(201).json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/products/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, price, stockQuantity, category, images, status } = req.body;

      const { data, error } = await supabase
        .from('products')
        .update({
          title,
          description,
          price,
          stock_quantity: stockQuantity,
          category,
          images: images || [],
          status
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/products/:id', async (req, res) => {
    try {
      const { id } = req.params;

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};

export const createGigRoutes = (app) => {
  app.get('/api/gigs', async (req, res) => {
    try {
      const { category, search, limit = 20, offset = 0 } = req.query;
      let query = supabase.from('gigs').select('*', { count: 'exact' });

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }
      if (search) {
        query = query.ilike('title', `%${search}%`);
      }

      const { data, error, count } = await query
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

      if (error) throw error;

      res.json({ data, total: count });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/gigs/:id', async (req, res) => {
    try {
      const { id } = req.params;

      const { data, error } = await supabase
        .from('gigs')
        .select('*, reviews(*, profiles(full_name, avatar_url)), profiles(full_name, avatar_url)')
        .eq('id', id)
        .single();

      if (error) throw error;

      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/gigs', async (req, res) => {
    try {
      const { workerId, title, description, price, deliveryDays, category, skills, images } = req.body;

      const { data, error } = await supabase
        .from('gigs')
        .insert([{
          worker_id: workerId,
          title,
          description,
          price,
          delivery_days: deliveryDays,
          category,
          skills: skills || [],
          images: images || [],
          status: 'active'
        }])
        .select()
        .single();

      if (error) throw error;

      res.status(201).json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/gigs/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, price, deliveryDays, category, skills, images, status } = req.body;

      const { data, error } = await supabase
        .from('gigs')
        .update({
          title,
          description,
          price,
          delivery_days: deliveryDays,
          category,
          skills: skills || [],
          images: images || [],
          status
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/gigs/:id', async (req, res) => {
    try {
      const { id } = req.params;

      const { error } = await supabase
        .from('gigs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};

export const createJobRoutes = (app) => {
  app.get('/api/jobs', async (req, res) => {
    try {
      const { search, limit = 20, offset = 0, status = 'open' } = req.query;
      let query = supabase.from('jobs').select('*', { count: 'exact' });

      if (status !== 'all') {
        query = query.eq('status', status);
      }
      if (search) {
        query = query.ilike('title', `%${search}%`);
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

      if (error) throw error;

      res.json({ data, total: count });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/jobs/:id', async (req, res) => {
    try {
      const { id } = req.params;

      const { data, error } = await supabase
        .from('jobs')
        .select('*, proposals(*, profiles(full_name, avatar_url))')
        .eq('id', id)
        .single();

      if (error) throw error;

      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/jobs', async (req, res) => {
    try {
      const { clientId, title, description, budget, duration, skillsRequired } = req.body;

      const { data, error } = await supabase
        .from('jobs')
        .insert([{
          client_id: clientId,
          title,
          description,
          budget,
          duration,
          skills_required: skillsRequired || [],
          status: 'open'
        }])
        .select()
        .single();

      if (error) throw error;

      res.status(201).json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/jobs/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, budget, duration, skillsRequired, status } = req.body;

      const { data, error } = await supabase
        .from('jobs')
        .update({
          title,
          description,
          budget,
          duration,
          skills_required: skillsRequired || [],
          status
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/jobs/:id', async (req, res) => {
    try {
      const { id } = req.params;

      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};

export const createOrderRoutes = (app) => {
  app.get('/api/orders/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const { status } = req.query;

      let query = supabase
        .from('orders')
        .select('*, products(*), profiles(full_name)')
        .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`);

      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/orders/:orderId/detail', async (req, res) => {
    try {
      const { orderId } = req.params;

      const { data, error } = await supabase
        .from('orders')
        .select('*, products(*), profiles(full_name, avatar_url)')
        .eq('id', orderId)
        .single();

      if (error) throw error;

      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/orders', async (req, res) => {
    try {
      const { buyerId, sellerId, productId, quantity, totalPrice, shippingAddress } = req.body;

      const { data, error } = await supabase
        .from('orders')
        .insert([{
          buyer_id: buyerId,
          seller_id: sellerId,
          product_id: productId,
          quantity,
          total_price: totalPrice,
          shipping_address: shippingAddress,
          status: 'pending'
        }])
        .select()
        .single();

      if (error) throw error;

      res.status(201).json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/orders/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { status, shippingAddress } = req.body;

      const { data, error } = await supabase
        .from('orders')
        .update({
          status,
          shipping_address: shippingAddress
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};

export const createProjectRoutes = (app) => {
  app.get('/api/projects/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const { status } = req.query;

      let query = supabase
        .from('projects')
        .select('*, jobs(*), profiles(full_name)')
        .or(`client_id.eq.${userId},worker_id.eq.${userId}`);

      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/projects', async (req, res) => {
    try {
      const { clientId, workerId, jobId, title, description, budget } = req.body;

      const { data, error } = await supabase
        .from('projects')
        .insert([{
          client_id: clientId,
          worker_id: workerId,
          job_id: jobId,
          title,
          description,
          budget,
          status: 'active'
        }])
        .select()
        .single();

      if (error) throw error;

      res.status(201).json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/projects/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { status, description } = req.body;

      const { data, error } = await supabase
        .from('projects')
        .update({ status, description })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};

export const createReviewRoutes = (app) => {
  app.get('/api/reviews/:userId', async (req, res) => {
    try {
      const { userId } = req.params;

      const { data, error } = await supabase
        .from('reviews')
        .select('*, profiles(full_name, avatar_url)')
        .eq('reviewee_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/reviews', async (req, res) => {
    try {
      const { reviewerId, revieweeId, rating, comment, orderId, projectId } = req.body;

      const { data, error } = await supabase
        .from('reviews')
        .insert([{
          reviewer_id: reviewerId,
          reviewee_id: revieweeId,
          rating,
          comment,
          order_id: orderId,
          project_id: projectId
        }])
        .select()
        .single();

      if (error) throw error;

      res.status(201).json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};

export const createUploadRoutes = (app) => {
  app.post('/api/upload/:uploadType', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const { uploadType } = req.params;
      const userId = req.body.userId;

      const fileRecord = {
        user_id: userId,
        file_name: req.file.originalname,
        file_url: `/uploads/${uploadType}/${req.file.filename}`,
        file_type: req.file.mimetype,
        file_size: req.file.size,
        upload_type: uploadType
      };

      const { data, error } = await supabase
        .from('file_uploads')
        .insert([fileRecord])
        .select()
        .single();

      if (error) throw error;

      res.status(201).json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/uploads/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const { uploadType } = req.query;

      let query = supabase
        .from('file_uploads')
        .select('*')
        .eq('user_id', userId);

      if (uploadType) {
        query = query.eq('upload_type', uploadType);
      }

      const { data, error } = await query;

      if (error) throw error;

      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/uploads/:fileId', async (req, res) => {
    try {
      const { fileId } = req.params;

      const { error } = await supabase
        .from('file_uploads')
        .delete()
        .eq('id', fileId);

      if (error) throw error;

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};

export const createWishlistRoutes = (app) => {
  app.get('/api/wishlist/:userId', async (req, res) => {
    try {
      const { userId } = req.params;

      const { data, error } = await supabase
        .from('wishlist')
        .select('*, products(*)')
        .eq('user_id', userId);

      if (error) throw error;

      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/wishlist', async (req, res) => {
    try {
      const { userId, productId } = req.body;

      const { data, error } = await supabase
        .from('wishlist')
        .insert([{ user_id: userId, product_id: productId }])
        .select()
        .single();

      if (error && error.code !== '23505') throw error;

      res.status(201).json(data || { message: 'Already in wishlist' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/wishlist/:wishlistId', async (req, res) => {
    try {
      const { wishlistId } = req.params;

      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('id', wishlistId);

      if (error) throw error;

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};
