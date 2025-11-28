import { io, Socket } from 'socket.io-client';
import { supabase } from '../integrations/supabase/client';

let socket: Socket | null = null;

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  conversationId: string;
  isRead: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  user1Id: string;
  user2Id: string;
  lastMessageAt: string;
  messages?: Message[];
}

export const chatService = {
  initialize(userId: string, serverUrl: string = 'http://localhost:3000') {
    if (socket?.connected) {
      return socket;
    }

    socket = io(serverUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket?.id);
      socket?.emit('user:login', userId);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    return socket;
  },

  disconnect() {
    if (socket?.connected) {
      socket.disconnect();
      socket = null;
    }
  },

  isConnected() {
    return socket?.connected ?? false;
  },

  async sendMessage(senderId: string, receiverId: string, content: string, conversationId: string) {
    try {
      if (!senderId || !receiverId || !content.trim()) {
        throw new Error('Invalid message parameters');
      }

      if (socket?.connected) {
        socket.emit('message:send', {
          senderId,
          receiverId,
          content: content.trim(),
          conversationId
        });
      } else {
        const response = await fetch('http://localhost:3000/api/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            senderId,
            receiverId,
            content: content.trim()
          })
        });

        if (!response.ok) {
          throw new Error(`Failed to send message: ${response.statusText}`);
        }

        return await response.json();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      throw error instanceof Error ? error : new Error('Failed to send message');
    }
  },

  async fetchConversations(userId: string) {
    try {
      const response = await fetch(`http://localhost:3000/api/conversations/${userId}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  },

  async fetchMessages(conversationId: string) {
    try {
      const response = await fetch(`http://localhost:3000/api/messages/${conversationId}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  },

  async createConversation(user1Id: string, user2Id: string) {
    try {
      const response = await fetch('http://localhost:3000/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user1Id,
          user2Id
        })
      });

      return await response.json();
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  },

  markAsRead(messageId: string, userId: string) {
    if (socket?.connected) {
      socket.emit('message:read', { messageId, userId });
    } else {
      // Fallback to HTTP request
      fetch(`http://localhost:3000/api/messages/${messageId}/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId })
      }).catch(error => {
        console.error('Error marking message as read:', error);
      });
    }
  },

  onMessageReceive(callback: (message: Message) => void) {
    if (socket) {
      socket.on('message:receive', callback);
    }
  },

  onMessageSent(callback: (message: Message) => void) {
    if (socket) {
      socket.on('message:sent', callback);
    }
  },

  onMessageError(callback: (error: Error) => void) {
    if (socket) {
      socket.on('message:error', callback);
    }
  },

  onTypingIndicator(callback: (data: { userId: string }) => void) {
    if (socket) {
      socket.on('typing:indicator', callback);
    }
  },

  onTypingStopped(callback: (data: { userId: string }) => void) {
    if (socket) {
      socket.on('typing:stopped', callback);
    }
  },

  onUsersOnline(callback: (users: string[]) => void) {
    if (socket) {
      socket.on('users:online', callback);
    }
  },

  onMessageRead(callback: (data: { messageId: string; readBy: string; readAt: string }) => void) {
    if (socket) {
      socket.on('message:read', callback);
    }
  },

  startTyping(senderId: string, receiverId: string) {
    if (socket?.connected) {
      socket.emit('typing:start', {
        senderId,
        receiverId
      });
    }
  },

  stopTyping(senderId: string, receiverId: string) {
    if (socket?.connected) {
      socket.emit('typing:stop', {
        senderId,
        receiverId
      });
    }
  },

  sendFile(senderId: string, receiverId: string, fileName: string, fileData: string, fileType: string, conversationId: string) {
    if (socket?.connected) {
      socket.emit('file:upload', {
        senderId,
        receiverId,
        fileName,
        fileData,
        fileType,
        conversationId
      });
    }
  },

  offMessageReceive() {
    if (socket) {
      socket.off('message:receive');
    }
  },

  offTypingIndicator() {
    if (socket) {
      socket.off('typing:indicator');
    }
  }
};
