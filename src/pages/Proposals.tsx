import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ProposalCard, Proposal } from "@/components/Proposals/ProposalCard";
import {
  ArrowLeft,
  Filter,
  SortAsc,
  Users,
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  MessageSquare,
  BarChart3
} from "lucide-react";

const Proposals = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [filteredProposals, setFilteredProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high' | 'rating'>('newest');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [selectedProposals, setSelectedProposals] = useState<string[]>([]);

  // Mock data - in real app, this would come from API
  useEffect(() => {
    const mockProposals: Proposal[] = [
      {
        id: '1',
        job_id: jobId || '1',
        worker_id: 'worker1',
        worker_name: 'John Developer',
        worker_rating: 4.8,
        worker_review_count: 24,
        cover_letter: 'I am an experienced full-stack developer with 5+ years of experience...',
        proposed_price: 2500,
        estimated_duration: '3 weeks',
        status: 'pending',
        created_at: '2024-01-15T10:00:00Z',
        milestones: [
          {
            title: 'Initial Setup & Planning',
            description: 'Set up development environment and create project plan',
            amount: 500,
            due_date: '2024-01-22',
            status: 'pending'
          },
          {
            title: 'Core Development',
            description: 'Implement main features and functionality',
            amount: 1500,
            due_date: '2024-02-05',
            status: 'pending'
          },
          {
            title: 'Testing & Deployment',
            description: 'Testing, bug fixes, and deployment',
            amount: 500,
            due_date: '2024-02-12',
            status: 'pending'
          }
        ],
        attachments: [
          { name: 'portfolio.pdf', url: '#', type: 'application/pdf' },
          { name: 'previous_work.jpg', url: '#', type: 'image/jpeg' }
        ]
      },
      {
        id: '2',
        job_id: jobId || '1',
        worker_id: 'worker2',
        worker_name: 'Sarah Designer',
        worker_rating: 4.9,
        worker_review_count: 31,
        cover_letter: 'As a UI/UX designer with extensive experience in web applications...',
        proposed_price: 2200,
        estimated_duration: '2.5 weeks',
        status: 'pending',
        created_at: '2024-01-16T14:30:00Z',
        milestones: [
          {
            title: 'Design Phase',
            description: 'Create wireframes and mockups',
            amount: 800,
            due_date: '2024-01-25',
            status: 'pending'
          },
          {
            title: 'Development Integration',
            description: 'Work with developers to implement designs',
            amount: 1400,
            due_date: '2024-02-01',
            status: 'pending'
          }
        ]
      }
    ];

    setTimeout(() => {
      setProposals(mockProposals);
      setFilteredProposals(mockProposals);
      setLoading(false);
    }, 1000);
  }, [jobId]);

  // Filter and sort proposals
  useEffect(() => {
    let filtered = proposals;

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(p => p.status === filterStatus);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'price-low':
          return a.proposed_price - b.proposed_price;
        case 'price-high':
          return b.proposed_price - a.proposed_price;
        case 'rating':
          return (b.worker_rating || 0) - (a.worker_rating || 0);
        default:
          return 0;
      }
    });

    setFilteredProposals(filtered);
  }, [proposals, sortBy, filterStatus]);

  const handleAcceptProposal = (proposalId: string) => {
    setProposals(prev => prev.map(p =>
      p.id === proposalId
        ? { ...p, status: 'accepted' as const }
        : p.status === 'pending'
        ? { ...p, status: 'rejected' as const }
        : p
    ));

    toast({
      title: "Proposal accepted",
      description: "The freelancer has been notified and the project can begin",
    });
  };

  const handleRejectProposal = (proposalId: string) => {
    setProposals(prev => prev.map(p =>
      p.id === proposalId ? { ...p, status: 'rejected' as const } : p
    ));

    toast({
      title: "Proposal rejected",
      description: "The freelancer has been notified",
    });
  };

  const handleMessageWorker = (workerId: string) => {
    // Navigate to chat with this worker
    navigate(`/chat`);
  };

  const toggleProposalSelection = (proposalId: string) => {
    setSelectedProposals(prev =>
      prev.includes(proposalId)
        ? prev.filter(id => id !== proposalId)
        : [...prev, proposalId]
    );
  };

  const getStats = () => {
    const pending = proposals.filter(p => p.status === 'pending').length;
    const accepted = proposals.filter(p => p.status === 'accepted').length;
    const rejected = proposals.filter(p => p.status === 'rejected').length;

    const avgPrice = proposals.length > 0
      ? proposals.reduce((sum, p) => sum + p.proposed_price, 0) / proposals.length
      : 0;

    const priceRange = proposals.length > 0
      ? {
          min: Math.min(...proposals.map(p => p.proposed_price)),
          max: Math.max(...proposals.map(p => p.proposed_price))
        }
      : { min: 0, max: 0 };

    return { pending, accepted, rejected, avgPrice, priceRange };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading proposals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="glass-effect"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
                Project Proposals
              </h1>
              <p className="text-muted-foreground">
                {proposals.length} proposal{proposals.length !== 1 ? 's' : ''} received
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <Card className="glass-effect border-border p-4 text-center">
            <Users className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats.pending}</p>
            <p className="text-sm text-muted-foreground">Pending</p>
          </Card>

          <Card className="glass-effect border-border p-4 text-center">
            <DollarSign className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">${stats.avgPrice.toFixed(0)}</p>
            <p className="text-sm text-muted-foreground">Avg Price</p>
          </Card>

          <Card className="glass-effect border-border p-4 text-center">
            <BarChart3 className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">${stats.priceRange.min} - ${stats.priceRange.max}</p>
            <p className="text-sm text-muted-foreground">Price Range</p>
          </Card>

          <Card className="glass-effect border-border p-4 text-center">
            <Calendar className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">{proposals.length}</p>
            <p className="text-sm text-muted-foreground">Total Proposals</p>
          </Card>
        </motion.div>

        {/* Filters and Sorting */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap gap-4 mb-6"
        >
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filter:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="text-sm border border-border rounded px-2 py-1 bg-background"
            >
              <option value="all">All Proposals</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <SortAsc className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-sm border border-border rounded px-2 py-1 bg-background"
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </motion.div>

        {/* Proposals List */}
        <div className="space-y-6">
          {filteredProposals.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No proposals found</h3>
              <p className="text-muted-foreground">
                {filterStatus !== 'all'
                  ? `No ${filterStatus} proposals match your criteria`
                  : 'No proposals have been submitted yet'
                }
              </p>
            </motion.div>
          ) : (
            <AnimatePresence>
              {filteredProposals.map((proposal) => (
                <ProposalCard
                  key={proposal.id}
                  proposal={proposal}
                  isClientView={true}
                  onAccept={handleAcceptProposal}
                  onReject={handleRejectProposal}
                  onMessage={handleMessageWorker}
                />
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Bulk Actions (if multiple proposals selected) */}
        <AnimatePresence>
          {selectedProposals.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
            >
              <Card className="glass-effect border-border p-4 flex items-center gap-4">
                <span className="text-sm font-medium">
                  {selectedProposals.length} proposals selected
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedProposals([])}
                >
                  Clear Selection
                </Button>
                <Button
                  size="sm"
                  className="bg-red-600 hover:bg-red-700"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Selected
                </Button>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Proposals;