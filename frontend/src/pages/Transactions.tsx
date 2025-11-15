import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { apiService } from '@/services/apiService';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Search, Coins, TrendingUp, TrendingDown, Receipt, Filter, X, Download } from 'lucide-react';
import type { Transaction } from '@/types';
import { logger } from '@/utils/logger';
import { toast } from 'sonner';
import { ERROR_MESSAGES } from '@/constants';
import { useAuth } from '@/context/AuthContext';

const Transactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [filters, setFilters] = useState({
    type: 'all',
    dateFrom: '',
    dateTo: '',
    amountMin: '',
    amountMax: ''
  });

  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true);
      try {
        const data = await apiService.getTransactions();
        setAllTransactions(data);
        setTransactions(data);
      } catch (error) {
        logger.error('Failed to fetch transactions:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...allTransactions];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(transaction =>
        transaction.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.user?._id?.toString().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter(transaction => transaction.type === filters.type);
    }

    // Date range filter
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      fromDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter(transaction => {
        const txDate = new Date((transaction as any).timestamp || transaction.createdAt || '');
        return txDate >= fromDate;
      });
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(transaction => {
        const txDate = new Date((transaction as any).timestamp || transaction.createdAt || '');
        return txDate <= toDate;
      });
    }

    // Amount range filter
    if (filters.amountMin) {
      const minAmount = parseFloat(filters.amountMin);
      filtered = filtered.filter(transaction => Math.abs(transaction.amount) >= minAmount);
    }

    if (filters.amountMax) {
      const maxAmount = parseFloat(filters.amountMax);
      filtered = filtered.filter(transaction => Math.abs(transaction.amount) <= maxAmount);
    }

    setTransactions(filtered);
  }, [allTransactions, searchTerm, filters]);

  const clearFilters = () => {
    setFilters({
      type: 'all',
      dateFrom: '',
      dateTo: '',
      amountMin: '',
      amountMax: ''
    });
    setSearchTerm('');
  };

  const hasActiveFilters = filters.type !== 'all' || filters.dateFrom || filters.dateTo || filters.amountMin || filters.amountMax || searchTerm;

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'match_win':
      case 'tournament_win':
      case 'coin_purchase':
      case 'admin_add':
        return 'default';
      case 'match_entry':
      case 'tournament_entry':
      case 'admin_remove':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getTypeLabel = (type: string) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  // Calculate summary statistics (use all transactions for totals)
  const totalTransactions = allTransactions.length;
  const totalIncome = allTransactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = Math.abs(allTransactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      // Export with current filters applied
      const typeToExport = filters.type !== 'all' ? filters.type : undefined;
      await apiService.exportTransactions(format, undefined, typeToExport);
      toast.success(`Transactions exported as ${format.toUpperCase()} successfully!`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : ERROR_MESSAGES.SERVER_ERROR;
      logger.error('Failed to export transactions:', error);
      toast.error(errorMessage);
    }
  };

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 md:p-8 lg:p-10 space-y-6 sm:space-y-8 relative">
        {/* Game-themed header */}
        <div className="flex items-center gap-4 pb-6 border-b border-border/40 animate-fade-in">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-2xl" />
            <div className="relative h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-gradient-to-br from-primary via-primary to-accent flex items-center justify-center shadow-2xl ring-2 ring-primary/30 transform hover:scale-110 transition-transform duration-300">
              <Receipt className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
              Economy Hub
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground/80 font-medium">
              Complete transaction history and economy monitoring
            </p>
          </div>
        </div>

        {/* Economy Summary Cards */}
        <div className="grid gap-6 md:grid-cols-3 animate-fade-in delay-200">
          <Card className="border-border/60 bg-gradient-to-br from-card via-card/95 to-card/90 backdrop-blur-md game-card hover:shadow-xl hover:scale-105 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-xs font-bold text-muted-foreground/80 uppercase tracking-wider">Total Transactions</CardTitle>
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/30 to-primary/20 flex items-center justify-center shadow-lg">
                <Coins className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black">{totalTransactions}</div>
              <p className="text-xs text-muted-foreground/70 mt-2 font-medium">All-time transactions</p>
            </CardContent>
          </Card>
          <Card className="border-success/40 bg-gradient-to-br from-success/15 via-success/10 to-success/5 backdrop-blur-md game-card hover:shadow-xl hover:scale-105 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-xs font-bold text-success uppercase tracking-wider">Total Income</CardTitle>
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-success/30 to-success/20 flex items-center justify-center shadow-lg">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-success">{totalIncome.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground/70 mt-2 font-medium">Coins distributed</p>
            </CardContent>
          </Card>
          <Card className="border-destructive/40 bg-gradient-to-br from-destructive/15 via-destructive/10 to-destructive/5 backdrop-blur-md game-card hover:shadow-xl hover:scale-105 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-xs font-bold text-destructive uppercase tracking-wider">Total Expenses</CardTitle>
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-destructive/30 to-destructive/20 flex items-center justify-center shadow-lg">
                <TrendingDown className="h-5 w-5 text-destructive" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-destructive">{totalExpenses.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground/70 mt-2 font-medium">Entry fees collected</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by user, description, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              />
            </div>
            {user?.role === 'admin' && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-11 shadow-lg hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/50">
                    <Download className="h-4 w-4 mr-2" />
                    Export
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
            )}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="h-11 shadow-lg hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/50"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="h-11 hover:bg-destructive/10 hover:text-destructive transition-all duration-300"
              >
                <X className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
          </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <Card className="border-2 border-border/50 shadow-xl bg-card/90 backdrop-blur-md game-card animate-fade-in">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold">Advanced Filters</CardTitle>
                <CardDescription className="text-muted-foreground/70">Filter transactions by type, date range, and amount</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                  <div className="space-y-2">
                    <Label htmlFor="filter-type">Transaction Type</Label>
                    <Select
                      value={filters.type}
                      onValueChange={(value) => setFilters({ ...filters, type: value })}
                    >
                      <SelectTrigger id="filter-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="match_entry">Match Entry</SelectItem>
                        <SelectItem value="match_win">Match Win</SelectItem>
                        <SelectItem value="tournament_entry">Tournament Entry</SelectItem>
                        <SelectItem value="tournament_win">Tournament Win</SelectItem>
                        <SelectItem value="admin_add">Admin Add</SelectItem>
                        <SelectItem value="admin_remove">Admin Remove</SelectItem>
                        <SelectItem value="coin_purchase">Coin Purchase</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="filter-date-from">Date From</Label>
                    <Input
                      id="filter-date-from"
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="filter-date-to">Date To</Label>
                    <Input
                      id="filter-date-to"
                      type="date"
                      value={filters.dateTo}
                      onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="filter-amount-min">Min Amount</Label>
                    <Input
                      id="filter-amount-min"
                      type="number"
                      placeholder="0"
                      value={filters.amountMin}
                      onChange={(e) => setFilters({ ...filters, amountMin: e.target.value })}
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="filter-amount-max">Max Amount</Label>
                    <Input
                      id="filter-amount-max"
                      type="number"
                      placeholder="No limit"
                      value={filters.amountMax}
                      onChange={(e) => setFilters({ ...filters, amountMax: e.target.value })}
                      className="h-10"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Transactions Table */}
        <div className="border-2 border-border/50 rounded-xl shadow-2xl overflow-hidden bg-card/90 backdrop-blur-md game-card animate-fade-in delay-300">
          <div className="overflow-x-auto">
            <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-muted/40 to-muted/20 hover:bg-muted/30 border-b border-border/50">
                <TableHead className="font-bold text-foreground min-w-[150px]">User</TableHead>
                <TableHead className="font-bold text-foreground min-w-[120px]">Type</TableHead>
                <TableHead className="font-bold text-foreground min-w-[100px]">Amount</TableHead>
                <TableHead className="font-bold text-foreground min-w-[200px]">Description</TableHead>
                <TableHead className="font-bold text-foreground min-w-[150px] hidden md:table-cell">Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-muted-foreground font-medium">Loading transactions...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <Receipt className="h-10 w-10 text-muted-foreground/50" />
                      <div>
                        <p className="font-bold">No transactions found</p>
                        <p className="text-sm text-muted-foreground/70 mt-1 font-medium">
                          {hasActiveFilters ? 'Try adjusting your filters' : 'No transactions recorded yet'}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((transaction: Transaction) => (
                  <TableRow key={transaction._id} className="hover:bg-primary/10 hover:shadow-md transition-all duration-300 border-b border-border/30 group">
                    <TableCell>
                      <div>
                        <div className="font-medium">{transaction.user?.username || `User ${transaction.user?._id || ''}`}</div>
                        <div className="text-xs text-muted-foreground">{transaction.user?.email || transaction.user?._id || ''}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getTypeColor(transaction.type)} className="font-semibold shadow-sm">
                        {getTypeLabel(transaction.type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className={`flex items-center gap-2 font-bold text-lg ${
                        transaction.amount > 0 ? 'text-success' : 'text-destructive'
                      }`}>
                        {transaction.amount > 0 ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                        <span>{transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString()} coins</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-md">{transaction.reason || '-'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground hidden md:table-cell">
                      {(transaction as any).timestamp ? new Date((transaction as any).timestamp).toLocaleString() : (transaction.createdAt ? new Date(transaction.createdAt).toLocaleString() : '-')}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Transactions;
