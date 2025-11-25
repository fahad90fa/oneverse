import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Mail, MapPin, Calendar, Award, ShoppingCart, FileText, Star, Trash2, Shield } from 'lucide-react';

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: Record<string, unknown>;
  onDelete?: (userId: string) => void;
  onPromoteAdmin?: (userId: string) => void;
  onBan?: (userId: string) => void;
}

export const UserDetailModal = ({
  isOpen,
  onClose,
  user,
  onDelete,
  onPromoteAdmin,
  onBan
}: UserDetailModalProps) => {
  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl glass-effect border-border animate-fade-in-up max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">User Profile</DialogTitle>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/30 border border-border">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.avatar_url} />
              <AvatarFallback>{user.full_name?.charAt(0)}</AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-3">
              <div>
                <h2 className="text-xl font-bold">{user.full_name}</h2>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {user.verification_badges?.map((badge: string) => (
                    <Badge key={badge} className="bg-green-500/10 text-green-500">
                      ✓ {badge}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{user.user_id}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Award className="h-4 w-4" />
                  <span>Trust Score: {user.trust_score}%</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(user.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4 glass-effect">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="actions">Actions</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-muted/30 border border-border text-center">
                  <div className="text-2xl font-bold">{user.followers_count}</div>
                  <div className="text-xs text-muted-foreground">Followers</div>
                </div>
                <div className="p-4 rounded-lg bg-muted/30 border border-border text-center">
                  <div className="text-2xl font-bold">{user.following_count}</div>
                  <div className="text-xs text-muted-foreground">Following</div>
                </div>
                <div className="p-4 rounded-lg bg-muted/30 border border-border text-center">
                  <div className="text-2xl font-bold">4.8</div>
                  <div className="text-xs text-muted-foreground">Avg Rating</div>
                </div>
              </div>

              {user.bio && (
                <div className="p-4 rounded-lg bg-muted/30 border border-border">
                  <p className="text-sm">{user.bio}</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="orders" className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/30 border border-border text-center text-muted-foreground">
                <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No orders available in preview</p>
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/30 border border-border text-center text-muted-foreground">
                <Star className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No reviews available in preview</p>
              </div>
            </TabsContent>

            <TabsContent value="actions" className="space-y-3">
              <Button
                variant="outline"
                className="w-full glass-effect"
                onClick={() => onPromoteAdmin?.(user.user_id)}
              >
                <Shield className="h-4 w-4 mr-2" />
                Make Admin
              </Button>
              <Button
                variant="outline"
                className="w-full glass-effect text-amber-500 hover:text-amber-600"
                onClick={() => onBan?.(user.user_id)}
              >
                Ban User
              </Button>
              <Button
                variant="outline"
                className="w-full glass-effect text-red-500 hover:text-red-600"
                onClick={() => {
                  if (confirm('Are you sure you want to delete this user?')) {
                    onDelete?.(user.user_id);
                  }
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete User
              </Button>
            </TabsContent>
          </Tabs>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
