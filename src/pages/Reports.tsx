import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Coins, TrendingUp, BarChart3, FileText } from 'lucide-react';
import { apiService } from '@/services/apiService';
import { toast } from 'sonner';
import type { EconomyStats, User, Match, Tournament, Transaction } from '@/types';
import { logger } from '@/utils/logger';
import { ERROR_MESSAGES } from '@/constants';

const Reports = () => {
  const [economyStats, setEconomyStats] = useState<EconomyStats | null>(null);

  useEffect(() => {
    const fetchEconomyStats = async () => {
      try {
        const stats = await apiService.getEconomyStats();
        setEconomyStats(stats);
      } catch (error) {
        logger.error('Failed to fetch economy stats:', error);
        toast.error(ERROR_MESSAGES.NETWORK_ERROR);
      }
    };
    fetchEconomyStats();
  }, []);

  /**
   * Export data to CSV format
   */
  const exportToCSV = async (type: string) => {
    try {
      let data: (User | Match | Tournament | Transaction)[] = [];
      let filename = '';
      let headers: string[] = [];

      switch (type) {
        case 'Users':
          data = await apiService.getUsers();
          filename = 'users_report.csv';
          headers = ['ID', 'Name', 'Email', 'Coins', 'Wins', 'Losses', 'Status', 'Joined'];
          break;
        case 'Matches':
          data = await apiService.getMatches();
          filename = 'matches_report.csv';
          headers = ['ID', 'Name', 'Type', 'Cost', 'Prize', 'Status', 'Date', 'Players'];
          break;
        case 'Tournaments':
          data = await apiService.getTournaments();
          filename = 'tournaments_report.csv';
          headers = ['ID', 'Name', 'Type', 'Players', 'Entry Cost', 'Prize Pool', 'Status', 'Participants', 'Winner', 'Bracket Details'];
          break;
        case 'Transactions':
          data = await apiService.getTransactions();
          filename = 'transactions_report.csv';
          headers = ['ID', 'User', 'Type', 'Amount', 'Description', 'Timestamp'];
          break;
        default:
          toast.error('Invalid export type');
          return;
      }

      // Convert data to CSV format
      const csvContent = [
        headers.join(','),
        ...data.map((item) => {
          switch (type) {
            case 'Users': {
              const user = item as User;
              return [
                user.id,
                `"${user.name}"`,
                user.email,
                user.coins,
                user.wins || 0,
                user.losses || 0,
                user.status,
                user.createdAt || ''
              ].join(',');
            }
            case 'Matches': {
              const match = item as Match;
              return [
                match.id,
                `"${match.name}"`,
                match.type,
                match.cost,
                match.prize,
                match.status,
                match.matchDate || match.createdAt || '',
                match.players || 0
              ].join(',');
            }
            case 'Tournaments': {
              const tournament = item as Tournament;
              // Include bracket details in export with participant names
              let bracketInfo = 'N/A';
              if (tournament.bracket && tournament.bracket.rounds && tournament.participants) {
                const participantMap = new Map();
                tournament.participants.forEach((p: any) => {
                  participantMap.set(p.id || p._id?.toString(), p.name || 'Unknown');
                });
                
                const rounds = tournament.bracket.rounds.map((round: any, roundIdx: number) => {
                  const matches = round.matches?.map((match: any, matchIdx: number) => {
                    const player1Name = match.player1Id ? (participantMap.get(match.player1Id.toString()) || `Player ${matchIdx * 2 + 1}`) : 'TBD';
                    const player2Name = match.player2Id ? (participantMap.get(match.player2Id.toString()) || `Player ${matchIdx * 2 + 2}`) : 'TBD';
                    const winnerName = match.winnerId ? (participantMap.get(match.winnerId.toString()) || 'Unknown') : 'Pending';
                    return `${player1Name} vs ${player2Name} (Winner: ${winnerName})`;
                  }).join('; ') || 'No matches';
                  return `Round ${round.roundNumber || round.round || roundIdx + 1}: ${matches}`;
                }).join(' | ');
                bracketInfo = rounds || 'No bracket';
              } else if (tournament.bracket && tournament.bracket.rounds) {
                // Fallback if participants not loaded
                const rounds = tournament.bracket.rounds.map((round: any, idx: number) => {
                  const matches = round.matches?.map((match: any, matchIdx: number) => {
                    return `Match ${matchIdx + 1}: ${match.player1Id ? 'Player1' : 'TBD'} vs ${match.player2Id ? 'Player2' : 'TBD'} (${match.winnerId ? 'Completed' : 'Pending'})`;
                  }).join('; ') || 'No matches';
                  return `Round ${round.roundNumber || idx + 1}: ${matches}`;
                }).join(' | ');
                bracketInfo = rounds || 'No bracket';
              }
              return [
                tournament.id,
                `"${tournament.name}"`,
                tournament.type,
                tournament.maxPlayers,
                tournament.entryCost,
                tournament.prizePool,
                tournament.status,
                tournament.participantCount || tournament.players?.length || 0,
                tournament.winnerName || tournament.championName || 'N/A',
                `"${bracketInfo}"`
              ].join(',');
            }
            case 'Transactions': {
              const transaction = item as Transaction;
              return [
                transaction.id,
                `"${transaction.userName || transaction.userId}"`,
                transaction.type,
                transaction.amount,
                `"${transaction.description || ''}"`,
                transaction.createdAt || ''
              ].join(',');
            }
            default:
              return '';
          }
        })
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`${type} report exported successfully!`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Failed to export ${type} report`;
      logger.error(`Failed to export ${type} report:`, error);
      toast.error(errorMessage);
    }
  };

  return (
    <AppLayout>
      <div className="p-6 md:p-8 lg:p-10 space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-border/60">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
              Reports & Exports
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Generate and download comprehensive reports and tournament history
            </p>
          </div>
        </div>

        {/* Economy Statistics */}
        {economyStats && (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Coins in Circulation</CardTitle>
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Coins className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{economyStats.totalCoinsInCirculation?.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground mt-2">Current user balances</p>
              </CardContent>
            </Card>
            <Card className="border-success/30 bg-success/5 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-success">Total Coins Issued</CardTitle>
                <div className="h-10 w-10 rounded-lg bg-success/20 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-success" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-success">{economyStats.totalCoinsIssued?.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground mt-2">All-time issued</p>
              </CardContent>
            </Card>
            <Card className="border-primary/30 bg-primary/5 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-primary">Used in Tournaments</CardTitle>
                <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{economyStats.coinsUsedInTournaments?.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground mt-2">Tournament entry fees</p>
              </CardContent>
            </Card>
            <Card className="border-accent/30 bg-accent/5 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-accent">Prizes Distributed</CardTitle>
                <div className="h-10 w-10 rounded-lg bg-accent/20 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-accent" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-accent">{economyStats.prizesDistributed?.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground mt-2">Total prizes paid</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Export Reports */}
        <div>
          <h2 className="text-2xl font-semibold mb-5">Export Reports</h2>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-border/50 shadow-sm hover:shadow-lg hover:border-primary/30 transition-all duration-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Users Report</CardTitle>
                <CardDescription className="text-sm">All registered players</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full h-11 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200 shadow-sm hover:shadow-md"
                  onClick={() => exportToCSV('Users')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm hover:shadow-lg hover:border-primary/30 transition-all duration-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Matches Report</CardTitle>
                <CardDescription className="text-sm">All 1v1 matches</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full h-11 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200 shadow-sm hover:shadow-md"
                  onClick={() => exportToCSV('Matches')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm hover:shadow-lg hover:border-primary/30 transition-all duration-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Tournaments Report</CardTitle>
                <CardDescription className="text-sm">Tournament history</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full h-11 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200 shadow-sm hover:shadow-md"
                  onClick={() => exportToCSV('Tournaments')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm hover:shadow-lg hover:border-primary/30 transition-all duration-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Transactions Report</CardTitle>
                <CardDescription className="text-sm">Complete transaction log</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full h-11 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200 shadow-sm hover:shadow-md"
                  onClick={() => exportToCSV('Transactions')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Reports;
