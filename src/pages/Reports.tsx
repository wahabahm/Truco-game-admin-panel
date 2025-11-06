import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, FileText, Coins, TrendingUp, BarChart3 } from 'lucide-react';
import { apiService } from '@/services/apiService';
import { toast } from 'sonner';

const Reports = () => {
  const [economyStats, setEconomyStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEconomyStats = async () => {
      try {
        const stats = await apiService.getEconomyStats();
        setEconomyStats(stats);
      } catch (error) {
        console.error('Failed to fetch economy stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEconomyStats();
  }, []);

  /**
   * Export data to CSV format
   */
  const exportToCSV = async (type: string) => {
    try {
      let data: any[] = [];
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
          headers = ['ID', 'Name', 'Type', 'Players', 'Entry Cost', 'Prize Pool', 'Status', 'Participants', 'Winner'];
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
        ...data.map((item: any) => {
          switch (type) {
            case 'Users':
              return [
                item.id,
                `"${item.name}"`,
                item.email,
                item.coins,
                item.wins || 0,
                item.losses || 0,
                item.status,
                item.createdAt || ''
              ].join(',');
            case 'Matches':
              return [
                item.id,
                `"${item.name}"`,
                item.type,
                item.cost,
                item.prize,
                item.status,
                item.matchDate || item.createdAt || '',
                item.players || 0
              ].join(',');
            case 'Tournaments':
              return [
                item.id,
                `"${item.name}"`,
                item.type,
                item.maxPlayers,
                item.entryCost,
                item.prizePool,
                item.status,
                item.participantCount || 0,
                item.winnerName || 'N/A'
              ].join(',');
            case 'Transactions':
              return [
                item.id,
                `"${item.userName || item.userId}"`,
                item.type,
                item.amount,
                `"${item.description || ''}"`,
                item.timestamp || ''
              ].join(',');
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
    } catch (error: any) {
      toast.error(error.message || `Failed to export ${type} report`);
    }
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Exports</h1>
          <p className="text-muted-foreground mt-1.5">
            Generate and download comprehensive reports and tournament history
          </p>
        </div>

        {/* Economy Statistics */}
        {economyStats && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Coins in Circulation</CardTitle>
                <Coins className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{economyStats.totalCoinsInCirculation?.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Current user balances</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Coins Issued</CardTitle>
                <TrendingUp className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">{economyStats.totalCoinsIssued?.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">All-time issued</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Used in Tournaments</CardTitle>
                <BarChart3 className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{economyStats.coinsUsedInTournaments?.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Tournament entry fees</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Prizes Distributed</CardTitle>
                <TrendingUp className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-accent">{economyStats.prizesDistributed?.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Total prizes paid</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Export Reports */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Export Reports</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Users Report</CardTitle>
                <CardDescription className="text-xs">All registered players</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                  onClick={() => exportToCSV('Users')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Matches Report</CardTitle>
                <CardDescription className="text-xs">All 1v1 matches</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                  onClick={() => exportToCSV('Matches')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Tournaments Report</CardTitle>
                <CardDescription className="text-xs">Tournament history</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                  onClick={() => exportToCSV('Tournaments')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Transactions Report</CardTitle>
                <CardDescription className="text-xs">Complete transaction log</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full hover:bg-primary hover:text-primary-foreground transition-all duration-200"
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
