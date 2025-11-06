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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Calendar, Trophy, Users, XCircle, Eye, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const Tournaments = () => {
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isMatchDialogOpen, setIsMatchDialogOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'registration' | 'active' | 'completed'>('all');
  const [formData, setFormData] = useState({
    name: '',
    type: 'public',
    maxPlayers: '4',
    entryCost: '',
    prizePool: '',
    startDate: ''
  });
  const [matchData, setMatchData] = useState({
    roundNumber: 0,
    matchIndex: 0,
    winnerId: ''
  });

  useEffect(() => {
    fetchTournaments();
  }, [filter]);

  const fetchTournaments = async () => {
    setIsLoading(true);
    try {
      const status = filter === 'all' ? undefined : filter;
      const data = await apiService.getTournaments(status);
      setTournaments(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load tournaments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await apiService.createTournament(formData);
      if (result.success) {
        setTournaments([result.tournament, ...tournaments]);
        toast.success('Tournament created successfully!');
        setIsCreateDialogOpen(false);
        setFormData({ name: '', type: 'public', maxPlayers: '4', entryCost: '', prizePool: '', startDate: '' });
        fetchTournaments();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create tournament');
    }
  };

  const handleViewTournament = async (tournamentId: string) => {
    try {
      const tournament = await apiService.getTournament(tournamentId);
      setSelectedTournament(tournament);
      setIsViewDialogOpen(true);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load tournament details');
    }
  };

  const handleCancelTournament = async (tournamentId: string, reason?: string) => {
    try {
      const result = await apiService.cancelTournament(tournamentId, reason);
      if (result.success) {
        toast.success(`Tournament cancelled. ${result.refundedCount} participants refunded.`);
        setIsCancelDialogOpen(false);
        fetchTournaments();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel tournament');
    }
  };

  const handleRecordMatch = (tournament: any, roundNumber: number, matchIndex: number) => {
    setSelectedTournament(tournament);
    setMatchData({
      roundNumber,
      matchIndex,
      winnerId: ''
    });
    setIsMatchDialogOpen(true);
  };

  const handleSubmitMatchResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matchData.winnerId) {
      toast.error('Please select a winner');
      return;
    }

    try {
      const result = await apiService.recordTournamentMatch(
        selectedTournament.id,
        matchData.roundNumber,
        matchData.matchIndex,
        matchData.winnerId
      );
      if (result.success) {
        toast.success(result.message);
        setIsMatchDialogOpen(false);
        await handleViewTournament(selectedTournament.id);
        fetchTournaments();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to record match result');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'registration': return 'default';
      case 'active': return 'default';
      case 'completed': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const getParticipantName = (participantId: string) => {
    if (!selectedTournament) return `User ${participantId}`;
    const participant = selectedTournament.participants?.find((p: any) => p.id === participantId);
    return participant?.name || `User ${participantId}`;
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tournaments</h1>
            <p className="text-muted-foreground mt-1.5">
              Create and manage tournaments (4 & 8 players)
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="shadow-lg hover:shadow-xl transition-all duration-200">
                <Plus className="h-4 w-4 mr-2" />
                Create Tournament
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Tournament</DialogTitle>
                <DialogDescription>
                  Create a tournament with 4 or 8 players. Prize: 80% to champion.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateTournament} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Tournament Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter tournament name"
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
                  <Label htmlFor="maxPlayers">Number of Players</Label>
                  <Select
                    value={formData.maxPlayers}
                    onValueChange={(value) => setFormData({ ...formData, maxPlayers: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4">4 Players</SelectItem>
                      <SelectItem value="8">8 Players</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startDate">
                    <Calendar className="h-3.5 w-3.5 inline mr-1" />
                    Start Date
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="entryCost">Entry Cost (coins)</Label>
                  <Input
                    id="entryCost"
                    type="number"
                    min="1"
                    value={formData.entryCost}
                    onChange={(e) => setFormData({ ...formData, entryCost: e.target.value })}
                    placeholder="Enter entry cost"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prizePool">Prize Pool (coins)</Label>
                  <Input
                    id="prizePool"
                    type="number"
                    min="1"
                    value={formData.prizePool}
                    onChange={(e) => setFormData({ ...formData, prizePool: e.target.value })}
                    placeholder="Enter prize pool"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Champion will receive 80% of prize pool
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">Create Tournament</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs value={filter} onValueChange={(value) => setFilter(value as any)} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="registration">Registration</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="border rounded-xl shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tournament Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Players</TableHead>
                <TableHead>Entry Cost</TableHead>
                <TableHead>Prize Pool</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Participants</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">Loading...</TableCell>
                </TableRow>
              ) : tournaments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">No tournaments found</TableCell>
                </TableRow>
              ) : (
                tournaments.map((tournament) => (
                  <TableRow key={tournament.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{tournament.name}</TableCell>
                    <TableCell>
                      <Badge variant={tournament.type === 'public' ? 'default' : 'secondary'}>
                        {tournament.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{tournament.maxPlayers}</span>
                      </div>
                    </TableCell>
                    <TableCell>{tournament.entryCost} coins</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Trophy className="h-3.5 w-3.5 text-accent" />
                        <span>{tournament.prizePool} coins</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(tournament.status)}>
                        {tournament.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {tournament.participantCount}/{tournament.maxPlayers}
                    </TableCell>
                    <TableCell>
                      {tournament.startDate ? (
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          {new Date(tournament.startDate).toLocaleDateString()}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewTournament(tournament.id)}
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {tournament.status !== 'completed' && tournament.status !== 'cancelled' && (
                          <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedTournament(tournament);
                                  setIsCancelDialogOpen(true);
                                }}
                                title="Cancel tournament"
                              >
                                <XCircle className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Cancel Tournament</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will cancel "{selectedTournament?.name}" and refund all {selectedTournament?.participantCount} participants.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Keep Tournament</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleCancelTournament(selectedTournament?.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Cancel Tournament
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* View Tournament Details Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedTournament?.name}</DialogTitle>
              <DialogDescription>
                {selectedTournament && (
                  <>
                    {selectedTournament.maxPlayers}-player tournament • Prize: {selectedTournament.prizePool} coins (80% to champion)
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            {selectedTournament && (
              <div className="space-y-6">
                {/* Tournament Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-xs text-muted-foreground">Status</div>
                    <Badge variant={getStatusColor(selectedTournament.status)} className="mt-1">
                      {selectedTournament.status}
                    </Badge>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-xs text-muted-foreground">Participants</div>
                    <div className="text-lg font-bold mt-1">
                      {selectedTournament.participantCount}/{selectedTournament.maxPlayers}
                    </div>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-xs text-muted-foreground">Entry Cost</div>
                    <div className="text-lg font-bold mt-1">{selectedTournament.entryCost} coins</div>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-xs text-muted-foreground">Prize Pool</div>
                    <div className="text-lg font-bold mt-1">{selectedTournament.prizePool} coins</div>
                  </div>
                </div>

                {/* Participants List */}
                {selectedTournament.participants && selectedTournament.participants.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">Participants</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {selectedTournament.participants.map((participant: any, index: number) => (
                        <div key={participant.id || index} className="p-2 bg-muted rounded text-sm">
                          {participant.name || `Player ${index + 1}`}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bracket View */}
                {selectedTournament.bracket && selectedTournament.bracket.rounds && (
                  <div>
                    <h3 className="font-semibold mb-3">Tournament Bracket</h3>
                    <div className="space-y-4">
                      {selectedTournament.bracket.rounds.map((round: any, roundIdx: number) => (
                        <div key={roundIdx} className="border rounded-lg p-4">
                          <div className="font-medium mb-3">{round.name} (Round {round.roundNumber})</div>
                          <div className="grid gap-3">
                            {round.matches.map((match: any, matchIdx: number) => (
                              <div key={matchIdx} className="p-3 bg-muted rounded-lg">
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="text-sm">
                                      {match.player1Id ? getParticipantName(match.player1Id) : 'TBD'} vs {' '}
                                      {match.player2Id ? getParticipantName(match.player2Id) : 'TBD'}
                                    </div>
                                    {match.winnerId && (
                                      <div className="text-xs text-success font-medium mt-1">
                                        Winner: {getParticipantName(match.winnerId)}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge variant={match.status === 'completed' ? 'secondary' : 'default'}>
                                      {match.status}
                                    </Badge>
                                    {match.status === 'active' && match.player1Id && match.player2Id && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleRecordMatch(selectedTournament, round.roundNumber, matchIdx)}
                                      >
                                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                        Record Result
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Winner */}
                {selectedTournament.winnerId && (
                  <div className="p-4 bg-success/10 rounded-lg border border-success/20">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-success" />
                      <div>
                        <div className="font-semibold text-success">Tournament Champion</div>
                        <div className="text-sm">{selectedTournament.winnerName || getParticipantName(selectedTournament.winnerId)}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Record Match Result Dialog */}
        <Dialog open={isMatchDialogOpen} onOpenChange={setIsMatchDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Match Result</DialogTitle>
              <DialogDescription>
                Select the winner of this match
              </DialogDescription>
            </DialogHeader>
            {selectedTournament && matchData.roundNumber > 0 && (
              <form onSubmit={handleSubmitMatchResult} className="space-y-4">
                {(() => {
                  const round = selectedTournament.bracket?.rounds?.find((r: any) => r.roundNumber === matchData.roundNumber);
                  const match = round?.matches?.[matchData.matchIndex];
                  if (!match) return null;

                  return (
                    <>
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="text-sm font-medium mb-2">Match:</div>
                        <div>
                          {match.player1Id ? getParticipantName(match.player1Id) : 'TBD'} vs {' '}
                          {match.player2Id ? getParticipantName(match.player2Id) : 'TBD'}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="winnerId">Winner</Label>
                        <Select
                          value={matchData.winnerId}
                          onValueChange={(value) => setMatchData({ ...matchData, winnerId: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select winner" />
                          </SelectTrigger>
                          <SelectContent>
                            {match.player1Id && (
                              <SelectItem value={match.player1Id}>
                                {getParticipantName(match.player1Id)}
                              </SelectItem>
                            )}
                            {match.player2Id && (
                              <SelectItem value={match.player2Id}>
                                {getParticipantName(match.player2Id)}
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex gap-2">
                        <Button type="button" variant="outline" className="flex-1" onClick={() => setIsMatchDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" className="flex-1">Record Result</Button>
                      </div>
                    </>
                  );
                })()}
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default Tournaments;
