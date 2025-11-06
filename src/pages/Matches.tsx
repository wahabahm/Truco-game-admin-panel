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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trophy, Calendar, Filter, CheckCircle2, Zap } from 'lucide-react';
import { toast } from 'sonner';

const Matches = () => {
  const [matches, setMatches] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isResultDialogOpen, setIsResultDialogOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [isAutoJoining, setIsAutoJoining] = useState(false);
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
      setIsLoading(false);
    };
    fetchData();
  }, []);

  // Refresh matches list
  const refreshMatches = async () => {
    const matchesData = await apiService.getMatches();
    setMatches(matchesData);
  };

  const filteredMatches = matches.filter(match => {
    if (filter === 'active') return match.status === 'active';
    if (filter === 'completed') return match.status === 'completed';
    return true;
  });

  const handleCreateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await apiService.createMatch(formData);
      if (result.success) {
        toast.success('Match created successfully!');
        setIsCreateDialogOpen(false);
        setFormData({ name: '', type: 'public', cost: '', prize: '', matchDate: '' });
        await refreshMatches(); // Refresh to show new match
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create match');
    }
  };

  const handleRecordResult = (match: any) => {
    setSelectedMatch(match);
    setResultData({
      winnerId: match.player1Id || '',
      loserId: match.player2Id || ''
    });
    setIsResultDialogOpen(true);
  };

  const handleSubmitResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resultData.winnerId || !resultData.loserId) {
      toast.error('Please select both winner and loser');
      return;
    }

    try {
      const result = await apiService.recordMatchResult(
        selectedMatch.id,
        resultData.winnerId,
        resultData.loserId
      );

      if (result.success) {
        setMatches(matches.map(match =>
          match.id === selectedMatch.id
            ? { ...match, status: 'completed', winnerId: resultData.winnerId, completedAt: new Date().toISOString() }
            : match
        ));
        toast.success('Match result recorded successfully!');
        setIsResultDialogOpen(false);
        setSelectedMatch(null);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to record match result');
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
        toast.success(result.message || 'Successfully joined match!');
        await refreshMatches(); // Refresh to show updated match
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to join match automatically');
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

  return (
    <AppLayout>
      <div className="p-6 space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">1v1 Matches</h1>
            <p className="text-muted-foreground mt-1.5">
              Create and manage game matches, record results
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleAutoJoin}
              disabled={isAutoJoining || availableMatches.length === 0}
              className="shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-primary to-primary/80"
              title={availableMatches.length === 0 ? 'No available matches' : 'Quick join an available match'}
            >
              <Zap className="h-4 w-4 mr-2" />
              {isAutoJoining ? 'Joining...' : 'Quick Join'}
            </Button>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="shadow-lg hover:shadow-xl transition-all duration-200">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Match
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
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    placeholder="Enter entry cost"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prize">Prize (coins)</Label>
                  <Input
                    id="prize"
                    type="number"
                    min="1"
                    value={formData.prize}
                    onChange={(e) => setFormData({ ...formData, prize: e.target.value })}
                    placeholder="Enter prize amount"
                    required
                  />
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

        {/* Available Matches Info Card */}
        {availableMatches.length > 0 && (
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-semibold text-foreground">
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
              className="bg-gradient-to-r from-primary to-primary/80"
            >
              <Zap className="h-4 w-4 mr-2" />
              {isAutoJoining ? 'Joining...' : 'Quick Join Now'}
            </Button>
          </div>
        )}

        <div className="border rounded-xl shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
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
                <TableRow>
                  <TableCell colSpan={filter === 'completed' ? 9 : 8} className="text-center py-8">Loading...</TableCell>
                </TableRow>
              ) : filteredMatches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={filter === 'completed' ? 9 : 8} className="text-center py-8">No matches found</TableCell>
                </TableRow>
              ) : (
                filteredMatches.map((match) => (
                  <TableRow key={match.id} className="hover:bg-muted/50">
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
                      <Badge variant={match.status === 'active' ? 'default' : 'secondary'}>
                        {match.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {match.player1Id && getUserName(match.player1Id)}
                        {match.player2Id && ` vs ${getUserName(match.player2Id)}`}
                        {!match.player1Id && !match.player2Id && 'No players'}
                      </div>
                    </TableCell>
                    {filter === 'completed' && (
                      <TableCell>
                        {match.winnerId ? (
                          <div className="flex items-center gap-1 text-success font-medium">
                            <Trophy className="h-3.5 w-3.5" />
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
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Match Result</DialogTitle>
              <DialogDescription>
                {selectedMatch && (
                  <>Record the winner and loser for <strong>{selectedMatch.name}</strong></>
                )}
              </DialogDescription>
            </DialogHeader>
            {selectedMatch && (
              <form onSubmit={handleSubmitResult} className="space-y-4">
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
                <div className="p-3 bg-muted rounded-lg text-sm space-y-1">
                  <div><strong>Prize:</strong> {selectedMatch.prize} coins</div>
                  <div className="text-muted-foreground">
                    Winner will receive {selectedMatch.prize} coins
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setIsResultDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
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
