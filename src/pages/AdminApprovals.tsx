import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, XCircle, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

interface RoleApplication {
  id: string;
  user_id: string;
  role: 'worker' | 'seller';
  status: 'pending' | 'approved' | 'rejected';
  full_name: string;
  phone_number: string;
  email?: string;
  created_at: string;
  admin_notes?: string;
}

const AdminApprovals = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [applications, setApplications] = useState<RoleApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<RoleApplication | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [adminNotes, setAdminNotes] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'worker' | 'seller'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchApplications();
    }
  }, [isAdmin, filterRole, filterStatus]);

  const checkAdminAccess = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      navigate('/auth');
      return;
    }

    const { data: adminCheck } = await supabase
      .from('admin_users')
      .select('id')
      .eq('user_id', session.user.id)
      .single();

    if (!adminCheck) {
      toast({
        title: 'Access Denied',
        description: 'You do not have admin privileges.',
        variant: 'destructive',
      });
      navigate('/dashboard');
      return;
    }

    setIsAdmin(true);
  };

  const fetchApplications = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('role_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (filterRole !== 'all') {
        query = query.eq('role', filterRole);
      }

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      const { data, error } = await query;

      if (error) throw error;
      setApplications(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async () => {
    if (!selectedApp) return;

    setIsProcessing(true);
    try {
      const { error: updateError } = await supabase
        .from('role_applications')
        .update({
          status: 'approved',
          admin_notes: adminNotes,
          reviewed_by: (await supabase.auth.getSession()).data.session?.user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', selectedApp.id);

      if (updateError) throw updateError;

      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({
          user_id: selectedApp.user_id,
          role: selectedApp.role,
          is_active: true,
          approved_at: new Date().toISOString(),
        }, { onConflict: 'user_id,role' });

      if (roleError) throw roleError;

      const userEmail = (await supabase.auth.admin.getUserById(selectedApp.user_id)).data?.user?.email;

      if (userEmail) {
        await supabase.functions.invoke('send-approval-email', {
          body: {
            email: userEmail,
            role: selectedApp.role,
            status: 'approved',
          },
        });
      }

      toast({
        title: 'Application Approved',
        description: `${selectedApp.full_name} has been approved as a ${selectedApp.role}.`,
      });

      setShowActionModal(false);
      setAdminNotes('');
      fetchApplications();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejection = async () => {
    if (!selectedApp) return;

    setIsProcessing(true);
    try {
      const { error: updateError } = await supabase
        .from('role_applications')
        .update({
          status: 'rejected',
          admin_notes: adminNotes,
          reviewed_by: (await supabase.auth.getSession()).data.session?.user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', selectedApp.id);

      if (updateError) throw updateError;

      const userEmail = (await supabase.auth.admin.getUserById(selectedApp.user_id)).data?.user?.email;

      if (userEmail) {
        await supabase.functions.invoke('send-approval-email', {
          body: {
            email: userEmail,
            role: selectedApp.role,
            status: 'rejected',
            reason: adminNotes,
          },
        });
      }

      toast({
        title: 'Application Rejected',
        description: `${selectedApp.full_name}'s application has been rejected.`,
      });

      setShowActionModal(false);
      setAdminNotes('');
      fetchApplications();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500/10 text-green-700">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/10 text-red-700">Rejected</Badge>;
      case 'pending':
      default:
        return <Badge className="bg-yellow-500/10 text-yellow-700">Pending</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    return (
      <Badge variant="outline" className="capitalize">
        {role}
      </Badge>
    );
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-8 max-w-md w-full">
          <div className="flex items-center gap-2 text-destructive mb-4">
            <AlertCircle className="w-5 h-5" />
            <h1>Access Denied</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            You need admin privileges to access this page.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Role Approvals</h1>
            <p className="text-muted-foreground">
              Review and manage role applications from workers and sellers
            </p>
          </div>

          <Card className="p-6">
            {/* Filters */}
            <div className="flex gap-4 mb-6 flex-wrap">
              <div className="flex gap-2 items-center">
                <label className="text-sm font-medium">Role:</label>
                <Select value={filterRole} onValueChange={(v: any) => setFilterRole(v)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="worker">Worker</SelectItem>
                    <SelectItem value="seller">Seller</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 items-center">
                <label className="text-sm font-medium">Status:</label>
                <Select value={filterStatus} onValueChange={(v: any) => setFilterStatus(v)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Table */}
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No applications found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell className="font-medium">{app.full_name}</TableCell>
                        <TableCell>{getRoleBadge(app.role)}</TableCell>
                        <TableCell>{getStatusBadge(app.status)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(app.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedApp(app);
                                setShowDetailModal(true);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {app.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() => {
                                    setSelectedApp(app);
                                    setActionType('approve');
                                    setShowActionModal(true);
                                  }}
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => {
                                    setSelectedApp(app);
                                    setActionType('reject');
                                    setShowActionModal(true);
                                  }}
                                >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      {/* Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
          </DialogHeader>
          {selectedApp && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Name</label>
                  <p className="text-base">{selectedApp.full_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Phone</label>
                  <p className="text-base">{selectedApp.phone_number}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Role</label>
                  <p className="text-base capitalize">{selectedApp.role}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <p className="text-base">{getStatusBadge(selectedApp.status)}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Submitted</label>
                <p className="text-base">{new Date(selectedApp.created_at).toLocaleString()}</p>
              </div>
              {selectedApp.admin_notes && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Admin Notes</label>
                  <p className="text-base">{selectedApp.admin_notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Action Modal */}
      <Dialog open={showActionModal} onOpenChange={setShowActionModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve'
                ? 'Approve Application'
                : 'Reject Application'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {actionType === 'approve'
                ? `Approve ${selectedApp?.full_name} as a ${selectedApp?.role}?`
                : `Reject ${selectedApp?.full_name}'s application as a ${selectedApp?.role}?`}
            </p>
            <div>
              <label className="text-sm font-medium">
                {actionType === 'approve' ? 'Approval Notes' : 'Rejection Reason'}
              </label>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder={
                  actionType === 'approve'
                    ? 'Optional notes...'
                    : 'Reason for rejection (will be sent to applicant)'
                }
                className="mt-2 min-h-24"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowActionModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={
                actionType === 'approve' ? handleApproval : handleRejection
              }
              disabled={isProcessing}
              className={
                actionType === 'approve'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }
            >
              {isProcessing
                ? 'Processing...'
                : actionType === 'approve'
                ? 'Approve'
                : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminApprovals;
