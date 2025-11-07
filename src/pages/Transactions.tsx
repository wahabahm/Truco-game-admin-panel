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
import { Search, Coins, TrendingUp, TrendingDown, Receipt, Filter, X } from 'lucide-react';
import type { Transaction } from '@/types';
import { logger } from '@/utils/logger';

const Transactions = () => {
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
        transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.userId?.toString().includes(searchTerm.toLowerCase())
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

  return (
    <AppLayout>
      <div className="p-6 md:p-8 lg:p-10 space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-border/60">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
            <Receipt className="h-6 w-6 text-white" />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
              Transactions & Economy
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Complete transaction history and economy monitoring
            </p>
          </div>
        </div>

        {/* Economy Summary Cards */}
        <div className="grid gap-5 md:grid-cols-3">
          <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Transactions</CardTitle>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Coins className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalTransactions}</div>
              <p className="text-xs text-muted-foreground mt-2">All-time transactions</p>
            </CardContent>
          </Card>
          <Card className="border-success/30 bg-success/5 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-success">Total Income</CardTitle>
              <div className="h-10 w-10 rounded-lg bg-success/20 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">{totalIncome.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-2">Coins distributed</p>
            </CardContent>
          </Card>
          <Card className="border-destructive/30 bg-destructive/5 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-destructive">Total Expenses</CardTitle>
              <div className="h-10 w-10 rounded-lg bg-destructive/20 flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-destructive" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive">{totalExpenses.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-2">Entry fees collected</p>
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
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="h-11"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="h-11"
              >
                <X className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
          </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <Card className="border-2 border-border/50 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Advanced Filters</CardTitle>
                <CardDescription>Filter transactions by type, date range, and amount</CardDescription>
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
        <div className="border-2 rounded-xl shadow-lg overflow-hidden bg-card/80 backdrop-blur-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-muted-foreground">Loading transactions...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <Receipt className="h-12 w-12 text-muted-foreground/50" />
                      <div>
                        <p className="font-medium">No transactions found</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {hasActiveFilters ? 'Try adjusting your filters' : 'No transactions recorded yet'}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((transaction: Transaction) => (
                  <TableRow key={transaction.id} className="hover:bg-primary/5 transition-all duration-200 border-b border-border/30">
                    <TableCell>
                      <div>
                        <div className="font-medium">{transaction.userName || `User ${transaction.userId}`}</div>
                        <div className="text-xs text-muted-foreground">{(transaction as any).userEmail || transaction.userId}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getTypeColor(transaction.type)}>
                        {getTypeLabel(transaction.type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className={`flex items-center gap-1 font-medium ${
                        transaction.amount > 0 ? 'text-success' : 'text-destructive'
                      }`}>
                        {transaction.amount > 0 ? (
                          <TrendingUp className="h-3.5 w-3.5" />
                        ) : (
                          <TrendingDown className="h-3.5 w-3.5" />
                        )}
                        {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString()} coins
                      </div>
                    </TableCell>
                    <TableCell className="max-w-md">{transaction.description || '-'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {(transaction as any).timestamp ? new Date((transaction as any).timestamp).toLocaleString() : (transaction.createdAt ? new Date(transaction.createdAt).toLocaleString() : '-')}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppLayout>
  );
};

export default Transactions;
