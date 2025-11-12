import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { apiService } from '@/services/apiService';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, Trophy, Calendar, CheckCircle2, Zap, Swords, BarChart3, TrendingUp, TrendingDown, Download } from 'lucide-react';
import { toast } from 'sonner';
import type { Match, User, CreateMatchForm } from '@/types';
import { logger } from '@/utils/logger';
import { ERROR_MESSAGES } from '@/constants';

const Matches = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState<boolean>(false);
  const [isResultDialogOpen, setIsResultDialogOpen] = useState<boolean>(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [isAutoJoining, setIsAutoJoining] = useState(false);
  const [matchStats, setMatchStats] = useState({
    total: 0,
    completed: 0,
    active: 0,
    totalPrizeDistributed: 0,
    totalEntryFees: 0,
    averagePrize: 0,
    averageCost: 0
  });
  const [formData, setFormData] = useState({
    name: '',
    type: 'public',
    cost: '',
    prize: '',
    matchDate: ''
  });
  const [resultData, setResultData] = useState({
    winnerId: '',
    loserId: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const [matchesData, usersData] = await Promise.all([
        apiService.getMatches(),
        apiService.getUsers()
      ]);
      setMatches(matchesData);
      setUsers(usersData);
      
      // Calculate match statistics
      const completed = matchesData.filter(m => m.status === 'completed');
      const active = matchesData.filter(m => m.status === 'active');
      const totalPrizeDistributed = completed.reduce((sum, m) => sum + (m.prize || 0), 0);
      const totalEntryFees = matchesData.reduce((sum, m) => {
        const players = m.players || 0;
        return sum + ((m.cost || 0) * players);
      }, 0);
      const averagePrize = completed.length > 0 ? totalPrizeDistributed / completed.length : 0;
      const averageCost = matchesData.length > 0 ? matchesData.reduce((sum, m) => sum + (m.cost || 0), 0) / matchesData.length : 0;
      
      setMatchStats({
        total: matchesData.length,
        completed: completed.length,
        active: active.length,
        totalPrizeDistributed,
        totalEntryFees,
        averagePrize: Math.round(averagePrize),
        averageCost: Math.round(averageCost)
      });
      
      setIsLoading(false);
    };
    fetchData();
  }, []);

  // Refresh matches list
  const refreshMatches = async () => {
    const matchesData = await apiService.getMatches();
    setMatches(matchesData);
    
    // Recalculate statistics
    const completed = matchesData.filter(m => m.status === 'completed');
    const active = matchesData.filter(m => m.status === 'active');
    const totalPrizeDistributed = completed.reduce((sum, m) => sum + (m.prize || 0), 0);
    const totalEntryFees = matchesData.reduce((sum, m) => {
      const players = m.players || 0;
      return sum + ((m.cost || 0) * players);
    }, 0);
    const averagePrize = completed.length > 0 ? totalPrizeDistributed / completed.length : 0;
    const averageCost = matchesData.length > 0 ? matchesData.reduce((sum, m) => sum + (m.cost || 0), 0) / matchesData.length : 0;
    
    setMatchStats({
      total: matchesData.length,
      completed: completed.length,
      active: active.length,
      totalPrizeDistributed,
      totalEntryFees,
      averagePrize: Math.round(averagePrize),
      averageCost: Math.round(averageCost)
    });
  };

  const filteredMatches = matches.filter(match => {
    if (filter === 'active') return match.status === 'active';
    if (filter === 'completed') return match.status === 'completed';
    return true;
  });

  const handleCreateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.name.trim()) {
      toast.error('Match name is required');
      return;
    }
    
    if (!formData.cost || parseInt(String(formData.cost), 10) <= 0) {
      toast.error('Entry cost must be a positive number');
      return;
    }
    
    if (!formData.prize || parseInt(String(formData.prize), 10) <= 0) {
      toast.error('Prize must be a positive number');
      return;
    }
    
    // Validate date if provided
    if (formData.matchDate) {
      const matchDate = new Date(formData.matchDate);
      if (isNaN(matchDate.getTime())) {
        toast.error('Invalid match date');
        return;
      }
    }
    
    try {
      const result = await apiService.createMatch(formData as CreateMatchForm);
      if (result.success) {
        toast.success('Match created successfully!');
        setIsCreateDialogOpen(false);
        setFormData({ name: '', type: 'public', cost: '', prize: '', matchDate: '' });
        await refreshMatches(); // Refresh to show new match
      } else {
        toast.error(result.message || 'Failed to create match');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : ERROR_MESSAGES.SERVER_ERROR;
      logger.error('Failed to create match:', error);
      toast.error(errorMessage);
    }
  };

  const handleRecordResult = (match: Match) => {
    setSelectedMatch(match);
    setResultData({
      winnerId: match.player1Id || '',
      loserId: match.player2Id || ''
    });
    setIsResultDialogOpen(true);
  };

  const handleSubmitResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatch) {
      toast.error('No match selected');
      return;
    }

    if (!resultData.winnerId || !resultData.loserId) {
      toast.error('Please select both winner and loser');
      return;
    }

    // Validate that winner and loser are different
    if (resultData.winnerId === resultData.loserId) {
      toast.error('Winner and loser must be different players');
      return;
    }

    // Validate that both players are in the match
    if (resultData.winnerId !== selectedMatch.player1Id && resultData.winnerId !== selectedMatch.player2Id) {
      toast.error('Winner must be one of the players in this match');
      return;
    }

    if (resultData.loserId !== selectedMatch.player1Id && resultData.loserId !== selectedMatch.player2Id) {
      toast.error('Loser must be one of the players in this match');
      return;
    }

    try {
      const result = await apiService.recordMatchResult(
        selectedMatch.id,
        resultData.winnerId,
        resultData.loserId
      );

      if (result.success) {
        toast.success('Match result recorded successfully!');
        setIsResultDialogOpen(false);
        setSelectedMatch(null);
        setResultData({ winnerId: '', loserId: '' });
        await refreshMatches(); // Refresh to get updated data from server
      } else {
        toast.error(result.message || 'Failed to record match result');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : ERROR_MESSAGES.SERVER_ERROR;
      logger.error('Failed to record match result:', error);
      toast.error(errorMessage);
    }
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : `User ${userId}`;
  };

  /**
   * Auto-matchmaking: Automatically find and join an available match
   */
  const handleAutoJoin = async () => {
    setIsAutoJoining(true);
    try {
      const result = await apiService.autoJoinMatch();
      if (result.success) {
        toast.success('Successfully joined match!');
        await refreshMatches(); // Refresh to show updated match
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : ERROR_MESSAGES.SERVER_ERROR;
      logger.error('Failed to join match automatically:', error);
      toast.error(errorMessage);
    } finally {
      setIsAutoJoining(false);
    }
  };

  // Get available matches (active, public, not full)
  const availableMatches = matches.filter(match => 
    match.status === 'active' && 
    match.type === 'public' && 
    match.players < 2
  );

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      const statusToExport = filter === 'all' ? undefined : filter;
      await apiService.exportMatches(format, statusToExport);
      toast.success(`Matches exported as ${format.toUpperCase()} successfully!`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : ERROR_MESSAGES.SERVER_ERROR;
      logger.error('Failed to export matches:', error);
      toast.error(errorMessage);
    }
  };

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 md:p-8 lg:p-10 space-y-6 sm:space-y-8 relative">
        {/* Game-themed header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-6 border-b border-border/40 animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-accent/20 blur-xl rounded-2xl" />
              <div className="relative h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-gradient-to-br from-accent via-accent to-primary flex items-center justify-center shadow-2xl ring-2 ring-accent/30 transform hover:scale-110 transition-transform duration-300">
                <Swords className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-foreground via-accent to-primary bg-clip-text text-transparent">
                Battle Arena
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-muted-foreground/80 font-medium">
                Create and manage 1v1 matches, record results
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="shadow-lg hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/50 text-xs sm:text-sm">
                  <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                  <span className="hidden sm:inline">Export</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport('csv')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('json')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export as JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              onClick={handleAutoJoin}
              disabled={isAutoJoining || availableMatches.length === 0}
              size="sm"
              className="shadow-md hover:shadow-lg transition-all duration-200 bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 text-xs sm:text-sm"
              title={availableMatches.length === 0 ? 'No available matches' : 'Quick join an available match'}
            >
              <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
              <span className="hidden sm:inline">{isAutoJoining ? 'Joining...' : 'Quick Join'}</span>
              <span className="sm:hidden">{isAutoJoining ? '...' : 'Join'}</span>
            </Button>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-accent via-accent to-primary hover:from-accent/90 hover:to-primary/90 font-semibold neon-glow-accent hover:scale-105 text-xs sm:text-sm">
                  <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                  <span className="hidden sm:inline">Create Match</span>
                  <span className="sm:hidden">Create</span>
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Match</DialogTitle>
                <DialogDescription>
                  Create a new 1v1 match with entry cost and prize
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateMatch} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Match Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter match name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="matchDate">
                    <Calendar className="h-3.5 w-3.5 inline mr-1" />
                    Match Date
                  </Label>
                  <Input
                    id="matchDate"
                    type="date"
                    value={formData.matchDate}
                    onChange={(e) => setFormData({ ...formData, matchDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cost">Entry Cost (coins)</Label>
                  <Input
                    id="cost"
                    type="number"
                    min="1"
                    step="1"
                    value={formData.cost}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Only allow positive integers
                      if (value === '' || /^\d+$/.test(value)) {
                        setFormData({ ...formData, cost: value });
                      }
                    }}
                    placeholder="Enter entry cost"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Whole numbers only (no decimals)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prize">Prize (coins)</Label>
                  <Input
                    id="prize"
                    type="number"
                    min="1"
                    step="1"
                    value={formData.prize}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Only allow positive integers
                      if (value === '' || /^\d+$/.test(value)) {
                        setFormData({ ...formData, prize: value });
                      }
                    }}
                    placeholder="Enter prize amount"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Whole numbers only (no decimals)
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">Create Match</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        <Tabs value={filter} onValueChange={(value) => setFilter(value as 'all' | 'active' | 'completed')} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="all">All Matches</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Past Matches</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Match Statistics Cards */}
        {!isLoading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 animate-fade-in delay-200">
            <Card className="border-border/60 bg-gradient-to-br from-card via-card/95 to-card/90 backdrop-blur-md game-card hover:shadow-xl hover:scale-105 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-xs font-bold text-muted-foreground/80 uppercase tracking-wider">Total Matches</CardTitle>
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/30 to-primary/20 flex items-center justify-center shadow-lg">
                  <Swords className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-black">{matchStats.total}</div>
                <p className="text-xs text-muted-foreground/70 mt-2 font-medium">
                  {matchStats.active} active, {matchStats.completed} completed
                </p>
              </CardContent>
            </Card>
            <Card className="border-success/40 bg-gradient-to-br from-success/15 via-success/10 to-success/5 backdrop-blur-md game-card hover:shadow-xl hover:scale-105 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-xs font-bold text-success uppercase tracking-wider">Prizes Distributed</CardTitle>
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-success/30 to-success/20 flex items-center justify-center shadow-lg">
                  <TrendingUp className="h-5 w-5 text-success" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-black text-success">{matchStats.totalPrizeDistributed.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground/70 mt-2 font-medium">Avg: {matchStats.averagePrize} coins</p>
              </CardContent>
            </Card>
            <Card className="border-destructive/40 bg-gradient-to-br from-destructive/15 via-destructive/10 to-destructive/5 backdrop-blur-md game-card hover:shadow-xl hover:scale-105 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-xs font-bold text-destructive uppercase tracking-wider">Entry Fees Collected</CardTitle>
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-destructive/30 to-destructive/20 flex items-center justify-center shadow-lg">
                  <TrendingDown className="h-5 w-5 text-destructive" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-black text-destructive">{matchStats.totalEntryFees.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground/70 mt-2 font-medium">Avg cost: {matchStats.averageCost} coins</p>
              </CardContent>
            </Card>
            <Card className="border-accent/40 bg-gradient-to-br from-accent/15 via-accent/10 to-accent/5 backdrop-blur-md game-card hover:shadow-xl hover:scale-105 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-xs font-bold text-accent uppercase tracking-wider">Net Economy</CardTitle>
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-accent/30 to-accent/20 flex items-center justify-center shadow-lg">
                  <BarChart3 className="h-5 w-5 text-accent" />
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-4xl font-black ${
                  (matchStats.totalPrizeDistributed - matchStats.totalEntryFees) >= 0 ? 'text-success' : 'text-destructive'
                }`}>
                  {(matchStats.totalPrizeDistributed - matchStats.totalEntryFees).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground/70 mt-2 font-medium">Prizes - Entry fees</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Available Matches Info Card */}
        {availableMatches.length > 0 && (
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-accent/5 border-2 border-primary/30 rounded-xl p-5 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shadow-sm">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-bold text-lg text-foreground mb-1">
                  {availableMatches.length} {availableMatches.length === 1 ? 'Match' : 'Matches'} Available
                </div>
                <div className="text-sm text-muted-foreground">
                  Click "Quick Join" to automatically join an available match
                </div>
              </div>
            </div>
            <Button
              onClick={handleAutoJoin}
              disabled={isAutoJoining}
              className="bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 shadow-md"
            >
              <Zap className="h-4 w-4 mr-2" />
              {isAutoJoining ? 'Joining...' : 'Quick Join Now'}
            </Button>
          </div>
        )}

        <div className="border-2 rounded-xl shadow-lg overflow-hidden bg-card/80 backdrop-blur-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead>Match Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Entry Cost</TableHead>
                <TableHead>Prize</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Players</TableHead>
                {filter === 'completed' && <TableHead>Winner</TableHead>}
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Skeleton loading state
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`} className="hover:bg-transparent">
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    {filter === 'completed' && <TableCell><Skeleton className="h-4 w-24" /></TableCell>}
                    <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                  </TableRow>
                ))
              ) : filteredMatches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={filter === 'completed' ? 9 : 8} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <Swords className="h-10 w-10 text-muted-foreground/50" />
                      <div>
                        <p className="font-medium">No matches found</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {filter === 'all' ? 'Create your first match to get started' : `No ${filter} matches available`}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredMatches.map((match) => (
                  <TableRow key={match.id} className="hover:bg-primary/5 transition-all duration-200 border-b border-border/30">
                    <TableCell className="font-medium">{match.name}</TableCell>
                    <TableCell>
                      <Badge variant={match.type === 'public' ? 'default' : 'secondary'}>
                        {match.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {match.matchDate ? (
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          {match.matchDate}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>{match.cost} coins</TableCell>
                    <TableCell>{match.prize} coins</TableCell>
                    <TableCell>
                      <Badge 
                        variant={match.status === 'active' ? 'default' : 'secondary'}
                        className={match.status === 'active' 
                          ? 'bg-success/10 text-success border-success/30' 
                          : 'bg-muted text-muted-foreground'
                        }
                      >
                        {match.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">
                        {match.player1Id && getUserName(match.player1Id)}
                        {match.player2Id && (
                          <span className="text-muted-foreground mx-2">vs</span>
                        )}
                        {match.player2Id && getUserName(match.player2Id)}
                        {!match.player1Id && !match.player2Id && (
                          <span className="text-muted-foreground">No players</span>
                        )}
                      </div>
                    </TableCell>
                    {filter === 'completed' && (
                      <TableCell>
                        {match.winnerId ? (
                          <div className="flex items-center gap-1.5 text-success font-semibold">
                            <Trophy className="h-4 w-4" />
                            {getUserName(match.winnerId)}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                    )}
                    <TableCell>
                      {match.status === 'active' && match.players === 2 ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRecordResult(match)}
                          className="hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                          Record Result
                        </Button>
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          {match.status === 'active' ? 'Waiting for players' : 'Completed'}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Record Result Dialog */}
        <Dialog open={isResultDialogOpen} onOpenChange={setIsResultDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl">Record Match Result</DialogTitle>
              <DialogDescription className="text-base">
                {selectedMatch && (
                  <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Match</div>
                    <div className="font-semibold text-lg">{selectedMatch.name}</div>
                  </div>
                )}
              </DialogDescription>
            </DialogHeader>
            {selectedMatch && (
              <form onSubmit={handleSubmitResult} className="space-y-5 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="winnerId">Winner</Label>
                  <Select
                    value={resultData.winnerId}
                    onValueChange={(value) => setResultData({ ...resultData, winnerId: value, loserId: resultData.loserId === value ? '' : resultData.loserId })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select winner" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedMatch.player1Id && (
                        <SelectItem value={selectedMatch.player1Id}>
                          {getUserName(selectedMatch.player1Id)}
                        </SelectItem>
                      )}
                      {selectedMatch.player2Id && (
                        <SelectItem value={selectedMatch.player2Id}>
                          {getUserName(selectedMatch.player2Id)}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="loserId">Loser</Label>
                  <Select
                    value={resultData.loserId}
                    onValueChange={(value) => setResultData({ ...resultData, loserId: value, winnerId: resultData.winnerId === value ? '' : resultData.winnerId })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select loser" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedMatch.player1Id && (
                        <SelectItem value={selectedMatch.player1Id}>
                          {getUserName(selectedMatch.player1Id)}
                        </SelectItem>
                      )}
                      {selectedMatch.player2Id && (
                        <SelectItem value={selectedMatch.player2Id}>
                          {getUserName(selectedMatch.player2Id)}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="p-4 bg-gradient-to-br from-accent/10 to-primary/10 rounded-lg border-2 border-accent/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Prize Pool</span>
                    <span className="text-lg font-bold text-accent">{selectedMatch.prize} coins</span>
                  </div>
                  <div className="text-xs text-muted-foreground pt-2 border-t border-border/50">
                    Winner will receive {selectedMatch.prize} coins
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1" 
                    onClick={() => setIsResultDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 bg-gradient-to-r from-primary to-primary/80 shadow-md hover:shadow-lg"
                  >
                    Record Result
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default Matches;
