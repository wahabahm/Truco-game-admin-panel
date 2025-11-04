import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { apiService } from '@/services/apiService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Search, Ban, CheckCircle, Coins, Plus, Minus, Trophy, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';

const Users = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [coinDialogOpen, setCoinDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [coinAmount, setCoinAmount] = useState('');
  const [coinOperation, setCoinOperation] = useState<'add' | 'remove'>('add');

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      const data = await apiService.getUsers();
      setUsers(data);
      setIsLoading(false);
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.id.toString().includes(searchTerm.toLowerCase())
  );

  const toggleUserStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    await apiService.updateUser(userId, { status: newStatus });
    
    setUsers(users.map(user =>
      user.id === userId ? { ...user, status: newStatus } : user
    ));
    
    toast.success(`User ${newStatus === 'active' ? 'activated' : 'suspended'} successfully`);
  };

  const handleCoinManagement = (user: any) => {
    setSelectedUser(user);
    setCoinAmount('');
    setCoinOperation('add');
    setCoinDialogOpen(true);
  };

  const handleCoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !coinAmount || parseFloat(coinAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const amount = parseFloat(coinAmount);
    const result = await apiService.updateUserCoins(selectedUser.id, amount, coinOperation);
    
    if (result.success) {
      // Update user coins in local state
      setUsers(users.map(user =>
        user.id === selectedUser.id 
          ? { 
              ...user, 
              coins: coinOperation === 'add' 
                ? user.coins + amount 
                : Math.max(0, user.coins - amount)
            } 
          : user
      ));
      
      toast.success(`Coins ${coinOperation === 'add' ? 'added' : 'removed'} successfully`);
      setCoinDialogOpen(false);
      setCoinAmount('');
      setSelectedUser(null);
    }
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Users Management</h1>
            <p className="text-muted-foreground mt-1.5">
              Manage registered players, stats, and coin balances
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="border rounded-xl shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Stats</TableHead>
                <TableHead>Coins</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">Loading...</TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">No users found</TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-muted/50">
                    <TableCell className="font-mono text-sm">{user.id}</TableCell>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Trophy className="h-3.5 w-3.5 text-success" />
                          <span className="text-sm font-medium">{user.wins || 0}</span>
                        </div>
                        <span className="text-muted-foreground">/</span>
                        <div className="flex items-center gap-1">
                          <TrendingDown className="h-3.5 w-3.5 text-destructive" />
                          <span className="text-sm font-medium">{user.losses || 0}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{user.coins}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => handleCoinManagement(user)}
                          title="Manage coins"
                        >
                          <Coins className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{user.createdAt}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleUserStatus(user.id, user.status)}
                        >
                          {user.status === 'active' ? (
                            <>
                              <Ban className="h-3 w-3 mr-1" />
                              Suspend
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Activate
                            </>
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Coin Management Dialog */}
        <Dialog open={coinDialogOpen} onOpenChange={setCoinDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Manage Coins</DialogTitle>
              <DialogDescription>
                {selectedUser && (
                  <>Manage coins for <strong>{selectedUser.name}</strong> (Current: {selectedUser.coins} coins)</>
                )}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCoinSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Operation</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={coinOperation === 'add' ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => setCoinOperation('add')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Coins
                  </Button>
                  <Button
                    type="button"
                    variant={coinOperation === 'remove' ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => setCoinOperation('remove')}
                  >
                    <Minus className="h-4 w-4 mr-2" />
                    Remove Coins
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="coinAmount">Amount</Label>
                <Input
                  id="coinAmount"
                  type="number"
                  min="1"
                  value={coinAmount}
                  onChange={(e) => setCoinAmount(e.target.value)}
                  placeholder="Enter coin amount"
                  required
                />
              </div>
              {selectedUser && coinOperation === 'remove' && coinAmount && (
                <div className="p-3 bg-muted rounded-lg text-sm">
                  <strong>New balance:</strong> {Math.max(0, selectedUser.coins - parseFloat(coinAmount) || 0)} coins
                </div>
              )}
              {selectedUser && coinOperation === 'add' && coinAmount && (
                <div className="p-3 bg-muted rounded-lg text-sm">
                  <strong>New balance:</strong> {selectedUser.coins + (parseFloat(coinAmount) || 0)} coins
                </div>
              )}
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setCoinDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {coinOperation === 'add' ? 'Add' : 'Remove'} Coins
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default Users;
