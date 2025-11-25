import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

// Store for tracking user connections and read receipts
const userSockets = new Map();
const messageReadStatus = new Map();

export const initializeChatHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // User login
    socket.on('user:login', (userId) => {
      userSockets.set(userId, socket.id);
      socket.userId = userId;

      // Broadcast online status
      const onlineUsers = Array.from(userSockets.keys());
      io.emit('users:online', onlineUsers);

      console.log(`User ${userId} logged in with socket ${socket.id}`);
    });

    // Handle message sending
    socket.on('message:send', async (data) => {
      try {
        const { senderId, receiverId, content, conversationId } = data;

        // Save message to database
        const { data: message, error } = await supabase
          .from('messages')
          .insert({
            sender_id: senderId,
            receiver_id: receiverId,
            content,
            conversation_id: conversationId,
            is_read: false,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;

        // Emit to sender
        socket.emit('message:sent', message);

        // Emit to receiver if online
        const receiverSocketId = userSockets.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('message:receive', message);
        }

      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('message:error', { error: error.message });
      }
    });

    // Handle typing indicators
    socket.on('typing:start', (data) => {
      const { senderId, receiverId } = data;
      const receiverSocketId = userSockets.get(receiverId);

      if (receiverSocketId) {
        io.to(receiverSocketId).emit('typing:indicator', { userId: senderId });
      }
    });

    socket.on('typing:stop', (data) => {
      const { senderId, receiverId } = data;
      const receiverSocketId = userSockets.get(receiverId);

      if (receiverSocketId) {
        io.to(receiverSocketId).emit('typing:stopped', { userId: senderId });
      }
    });

    // Handle read receipts
    socket.on('message:read', async (data) => {
      try {
        const { messageId, userId } = data;

        // Update message read status in database
        const { error } = await supabase
          .from('messages')
          .update({
            is_read: true,
            read_at: new Date().toISOString()
          })
          .eq('id', messageId)
          .eq('receiver_id', userId);

        if (error) throw error;

        // Emit read receipt to sender
        const message = await supabase
          .from('messages')
          .select('sender_id')
          .eq('id', messageId)
          .single();

        if (message.data) {
          const senderSocketId = userSockets.get(message.data.sender_id);
          if (senderSocketId) {
            io.to(senderSocketId).emit('message:read', {
              messageId,
              readBy: userId,
              readAt: new Date().toISOString()
            });
          }
        }

      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    });

    // Handle file uploads
    socket.on('file:upload', async (data) => {
      try {
        const { senderId, receiverId, fileName, fileData, fileType, conversationId } = data;

        // Here you would typically upload to cloud storage (AWS S3, Cloudinary, etc.)
        // For now, we'll simulate this and store file info in database

        const { data: fileMessage, error } = await supabase
          .from('messages')
          .insert({
            sender_id: senderId,
            receiver_id: receiverId,
            content: `📎 ${fileName}`,
            file_url: `uploaded/${fileName}`, // This would be the actual cloud URL
            file_type: fileType,
            conversation_id: conversationId,
            is_read: false,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;

        // Emit file message to both users
        socket.emit('message:sent', fileMessage);

        const receiverSocketId = userSockets.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('message:receive', fileMessage);
        }

      } catch (error) {
        console.error('Error uploading file:', error);
        socket.emit('file:upload:error', { error: error.message });
      }
    });

    // Handle group chat creation
    socket.on('group:create', async (data) => {
      try {
        const { creatorId, name, description, memberIds } = data;

        // Create group conversation
        const { data: group, error } = await supabase
          .from('conversations')
          .insert({
            name,
            description,
            creator_id: creatorId,
            is_group: true,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;

        // Add members to group
        const memberInserts = [creatorId, ...memberIds].map(userId => ({
          conversation_id: group.id,
          user_id: userId,
          role: userId === creatorId ? 'admin' : 'member',
          joined_at: new Date().toISOString()
        }));

        const { error: memberError } = await supabase
          .from('conversation_members')
          .insert(memberInserts);

        if (memberError) throw memberError;

        // Notify all group members
        memberIds.forEach(memberId => {
          const memberSocketId = userSockets.get(memberId);
          if (memberSocketId) {
            io.to(memberSocketId).emit('group:invited', {
              groupId: group.id,
              groupName: name,
              invitedBy: creatorId
            });
          }
        });

        socket.emit('group:created', group);

      } catch (error) {
        console.error('Error creating group:', error);
        socket.emit('group:create:error', { error: error.message });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      if (socket.userId) {
        userSockets.delete(socket.userId);

        // Broadcast updated online status
        const onlineUsers = Array.from(userSockets.keys());
        io.emit('users:online', onlineUsers);

        console.log(`User ${socket.userId} disconnected`);
      }
    });
  });
};