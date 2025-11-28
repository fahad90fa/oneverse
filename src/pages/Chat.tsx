import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { chatService } from "@/services/chat";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { TypingIndicator } from "@/components/Chat/TypingIndicator";
import { ReadReceipt } from "@/components/Chat/ReadReceipt";
import { FileUpload, FileMessage } from "@/components/Chat/FileUpload";
import {
  Send,
  ArrowLeft,
  Plus,
  Search,
  Paperclip,
  Smile,
  X
} from "lucide-react";
import { Message, Conversation, AppUser } from "@/types";

const Chat = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<AppUser | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const checkUser = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const fetchConversations = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const conversationMap = new Map<string, Conversation>();

      data?.forEach((msg: unknown) => {
        const otherUserId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        if (!conversationMap.has(otherUserId)) {
          conversationMap.set(otherUserId, {
            id: otherUserId,
            user_id: otherUserId,
            name: msg.sender_id === user.id ? msg.receiver_name : msg.sender_name,
            last_message: msg.content,
            last_message_time: msg.created_at,
            avatar: msg.sender_id === user.id ? msg.receiver_avatar : msg.sender_avatar
          });
        }
      });

      setConversations(Array.from(conversationMap.values()));
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  }, [user]);

  const fetchMessages = useCallback(async () => {
    if (!selectedConversation || !user) return;

    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${selectedConversation.user_id}),and(sender_id.eq.${selectedConversation.user_id},receiver_id.eq.${user.id})`
        )
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }, [selectedConversation, user]);

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  useEffect(() => {
    if (user) {
      chatService.initialize(user.id);

      chatService.onUsersOnline((users) => {
        setOnlineUsers(new Set(users));
      });

      chatService.onMessageReceive((message) => {
        if (selectedConversation && message.conversation_id) {
          setMessages(prev => [...prev, message]);
        }
        fetchConversations();
      });

      chatService.onTypingIndicator(({ userId }) => {
        setTypingUsers(prev => new Set([...prev, userId]));
      });

      chatService.onTypingStopped(({ userId }) => {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
      });

      // Handle read receipts
      chatService.onMessageRead((data) => {
        setMessages(prev => prev.map(msg =>
          msg.id === data.messageId
            ? { ...msg, is_read: true, read_at: data.readAt }
            : msg
        ));
      });

      fetchConversations();

      return () => {
        chatService.offMessageReceive();
        chatService.offTypingIndicator();
        chatService.disconnect();
      };
    }
  }, [user, selectedConversation, fetchConversations]);

  const markMessagesAsRead = useCallback(async () => {
    if (!selectedConversation || !user) return;

    try {
      const unreadMessages = messages.filter(
        msg => msg.receiver_id === user?.id && !msg.is_read
      );

      for (const message of unreadMessages) {
        if (chatService.isConnected()) {
          chatService.markAsRead(message.id, user.id);
        }
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [selectedConversation, user, messages]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages();
      markMessagesAsRead();
    }
  }, [selectedConversation, fetchMessages, markMessagesAsRead]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setShowFileUpload(false);
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
  };

  const handleSendFile = async () => {
    if (!selectedFile || !selectedConversation || !user) return;

    try {
      // Convert file to base64 for sending
      const fileData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(selectedFile);
      });

      // Send file via socket
      if (chatService.isConnected()) {
        chatService.sendFile(
          user.id,
          selectedConversation.user_id,
          selectedFile.name,
          fileData.split(',')[1], // Remove data URL prefix
          selectedFile.type,
          selectedConversation.id
        );
      }

      setSelectedFile(null);
    } catch (error) {
      console.error('Error sending file:', error);
      toast({
        title: "Upload failed",
        description: "Could not send the file",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      chatService.stopTyping(user.id, selectedConversation.user_id);
      
      await chatService.sendMessage(
        user.id,
        selectedConversation.user_id,
        newMessage,
        selectedConversation.id
      );

      setNewMessage("");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive"
      });
    }
  };

  const handleTyping = () => {
    if (selectedConversation) {
      chatService.startTyping(user.id, selectedConversation.user_id);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        chatService.stopTyping(user.id, selectedConversation.user_id);
      }, 1000);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="glass-effect mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent animate-fade-in-up">
            Live Chat
          </h1>
          <p className="text-muted-foreground animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            Connect and communicate in real-time
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[600px]">
          {/* Conversations List */}
          <Card className="glass-effect border-border overflow-hidden flex flex-col animate-fade-in-up">
            <div className="p-4 border-b border-border space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 glass-effect border-border"
                />
              </div>
              <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Chat
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  No conversations yet
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedConversation(conv);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`Select conversation with ${conv.name}`}
                    aria-selected={selectedConversation?.id === conv.id}
                    className={`p-4 border-b border-border cursor-pointer transition-all hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background ${
                      selectedConversation?.id === conv.id ? "bg-primary/10 border-l-2 border-l-primary" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-gradient-to-r from-primary to-accent text-white">
                          {conv.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{conv.name}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {conv.last_message}
                        </p>
                      </div>
                      {conv.unread_count && conv.unread_count > 0 && (
                        <span className="bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Chat Area */}
          {selectedConversation ? (
            <Card className="glass-effect border-border overflow-hidden flex flex-col md:col-span-2 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              {/* Header */}
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-gradient-to-r from-primary to-accent text-white">
                      {selectedConversation.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{selectedConversation.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {onlineUsers.has(selectedConversation.user_id) ? "Online" : "Offline"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => (
                  <motion.div
                    key={msg.id}
                    className={`flex ${msg.sender_id === user?.id ? "justify-end" : "justify-start"}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg relative ${
                        msg.sender_id === user?.id
                          ? "bg-gradient-to-r from-primary to-blue-500 text-primary-foreground rounded-br-none"
                          : "bg-muted text-foreground rounded-bl-none"
                      }`}
                    >
                      {msg.file_url ? (
                        <FileMessage
                          fileName={msg.content.replace('📎 ', '')}
                          fileUrl={msg.file_url}
                          fileType={msg.file_type || 'application/octet-stream'}
                          className="mb-2"
                        />
                      ) : (
                        <p className="text-sm">{msg.content}</p>
                      )}
                      <div className={`flex items-center justify-between mt-1 ${
                        msg.sender_id === user?.id ? "flex-row-reverse" : ""
                      }`}>
                        <p className={`text-xs ${
                          msg.sender_id === user?.id
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground"
                        }`}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                        {msg.sender_id === user?.id && (
                          <ReadReceipt
                            status={msg.is_read ? 'read' : 'sent'}
                            className="ml-2"
                          />
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
                {typingUsers.has(selectedConversation?.user_id) && (
                  <div className="flex justify-start">
                    <div className="bg-muted text-foreground rounded-lg rounded-bl-none px-4 py-2">
                      <TypingIndicator show={true} className="text-muted-foreground" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* File Upload Area */}
              <AnimatePresence>
                {showFileUpload && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-border p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Attach a file</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowFileUpload(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <FileUpload
                      onFileSelect={handleFileSelect}
                      onFileRemove={handleFileRemove}
                      maxSize={10}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Selected File Preview */}
              <AnimatePresence>
                {selectedFile && !showFileUpload && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-border p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Paperclip className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{selectedFile.name}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleSendFile}
                        >
                          Send File
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedFile(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="glass-effect"
                    onClick={() => setShowFileUpload(!showFileUpload)}
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="glass-effect">
                    <Smile className="h-4 w-4" />
                  </Button>
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      handleTyping();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e as React.FormEvent);
                      }
                    }}
                    aria-label="Type your message"
                    className="flex-1 glass-effect border-border"
                  />
                  <Button
                    type="submit"
                    disabled={!newMessage.trim() || !!selectedFile}
                    className="bg-gradient-to-r from-primary to-blue-500"
                    size="icon"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            </Card>
          ) : (
            <Card className="glass-effect border-border flex items-center justify-center md:col-span-2 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              <div className="text-center text-muted-foreground">
                <p>Select a conversation to start chatting</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
