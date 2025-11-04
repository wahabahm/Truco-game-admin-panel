import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { apiService } from '@/services/apiService';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const Transactions = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true);
      const data = await apiService.getTransactions();
      setTransactions(data);
      setIsLoading(false);
    };
    fetchTransactions();
  }, []);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'match_win':
      case 'tournament_win':
      case 'coin_purchase':
        return 'default';
      case 'match_entry':
      case 'tournament_entry':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions & Economy</h1>
          <p className="text-muted-foreground">
            Monitor all coin transactions and economy activity
          </p>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">Loading...</TableCell>
                </TableRow>
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">No transactions found</TableCell>
                </TableRow>
              ) : (
                transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">{transaction.userId}</TableCell>
                    <TableCell>
                      <Badge variant={getTypeColor(transaction.type)}>
                        {transaction.type.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className={transaction.amount > 0 ? 'text-success font-medium' : 'text-destructive font-medium'}>
                      {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                    </TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell>{transaction.timestamp}</TableCell>
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
