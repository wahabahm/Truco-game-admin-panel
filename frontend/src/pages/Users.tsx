import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { apiService } from '@/services/apiService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Ban, CheckCircle, Coins, Plus, Minus, Trophy, TrendingDown, Users as UsersIcon, UserPlus, Filter, Mail, X, Copy, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import type { User } from '@/types';
import { logger } from '@/utils/logger';
import { ERROR_MESSAGES } from '@/constants';
import { useAuth } from '@/context/AuthContext';

const Users = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [coinDialogOpen, setCoinDialogOpen] = useState<boolean>(false);
  const [registerDialogOpen, setRegisterDialogOpen] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [coinAmount, setCoinAmount] = useState<string>('');
  const [coinOperation, setCoinOperation] = useState<'add' | 'remove'>('add');
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [verificationInfo, setVerificationInfo] = useState<{ email: string; token?: string; link?: string } | null>(null);

  useEffect(() => {
    let isMounted = true;
    let abortController: AbortController | null = null;
    
    const fetchUsers = async () => {
      if (!isMounted) return;
      
      setIsLoading(true);
      abortController = new AbortController();
      
      // Set a timeout to abort the request (8 seconds)
      const timeoutId = setTimeout(() => {
        if (abortController) {
          abortController.abort();
        }
      }, 8000);
      
      try {
        const data = await apiService.getUsers(undefined, abortController.signal);
        
        clearTimeout(timeoutId);
        
        if (isMounted && !abortController.signal.aborted) {
          setUsers(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        clearTimeout(timeoutId);
        
        if (isMounted && abortController) {
          // Check if error is due to abort (timeout or component unmount)
          const isAbortError = error instanceof Error && error.name === 'AbortError';
          
          if (isAbortError) {
            // Request was aborted - check if it was due to timeout
            if (abortController.signal.aborted) {
              logger.warn('Request aborted (likely timeout)');
              toast.error('Request timeout. Please check if backend server is running.');
            }
            setUsers([]);
          } else {
            // Real error occurred
            const errorMessage = error instanceof Error 
              ? (error.message || ERROR_MESSAGES.NETWORK_ERROR)
              : ERROR_MESSAGES.NETWORK_ERROR;
            
            logger.error('Failed to fetch users:', error);
            toast.error(errorMessage);
            setUsers([]); // Set empty array on error to prevent hanging
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    fetchUsers();
    
    return () => {
      isMounted = false;
      if (abortController) {
        abortController.abort();
      }
    };
  }, []);

  // Sync selectedUser with users list to keep coin balance updated
  useEffect(() => {
    if (selectedUser) {
      const updatedUser = users.find(u => u._id === selectedUser._id);
      if (updatedUser && updatedUser.wallet?.balance !== selectedUser.wallet?.balance) {
        setSelectedUser(updatedUser);
      }
    }
  }, [users, selectedUser]);

  const filteredUsers = (users || []).filter(user => {
    // Status filter - Note: status might not be in UserDto, using optional chaining
    const matchesStatus = statusFilter === 'all' || (user as any).status === statusFilter;
    
    // Search filter
    const matchesSearch = !searchTerm || 
      user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user?._id?.toString().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const toggleUserStatus = async (userId: string, currentStatus: string) => {
    // Prevent admin from suspending themselves
    if (currentUser && currentUser._id === userId && currentStatus === 'active') {
      toast.error('You cannot suspend your own account');
      return;
    }

    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      await apiService.updateUserStatus(userId, newStatus);
      
      setUsers(users.map(user =>
        user._id === userId ? { ...user, status: newStatus } as any : user
      ));
      
      // Auto-switch to suspended filter when user is suspended
      if (newStatus === 'suspended') {
        setStatusFilter('suspended');
      }
      
      toast.success(`User ${newStatus === 'active' ? 'activated' : 'suspended'} successfully`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : ERROR_MESSAGES.SERVER_ERROR;
      logger.error('Failed to update user status:', error);
      toast.error(errorMessage);
    }
  };

  const handleCoinManagement = (user: User) => {
    // Prevent admin from managing their own coins
    if (currentUser && currentUser._id === user._id) {
      toast.error('You cannot manage your own coins');
      return;
    }
    
    setSelectedUser(user);
    setCoinAmount('');
    setCoinOperation('add');
    setCoinDialogOpen(true);
  };

  const handleCoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !coinAmount) {
      toast.error('Please enter an amount');
      return;
    }

    // Validate and parse as integer (coins must be whole numbers)
    const amount = parseInt(coinAmount.trim(), 10);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid positive whole number');
      return;
    }

    // Store original values for potential rollback
    const originalUser = selectedUser;
    const originalUsers = users;

    try {
      // Optimistically update UI for better responsiveness
      const currentBalance = selectedUser.wallet?.balance || 0;
      const optimisticCoins = coinOperation === 'add' 
        ? currentBalance + amount 
        : Math.max(0, currentBalance - amount);
      
      // Update local state immediately using functional updates
      setUsers(prevUsers => prevUsers.map(user =>
        user._id === selectedUser._id 
          ? { ...user, wallet: { ...user.wallet, balance: optimisticCoins } } as any
          : user
      ));
      
      // Don't update selectedUser optimistically - keep original balance for preview calculation
      // selectedUser will be updated with actual server response

      const result = await apiService.updateUserCoins(selectedUser._id, amount, coinOperation);
      
      // Backend returns { success, user } but we normalize to { success, data }
      const updatedUser = (result.data || (result as any).user) as User;
      if (result.success && updatedUser) {
        // Update with actual server response
        setUsers(prevUsers => prevUsers.map(user =>
          user._id === selectedUser._id 
            ? { ...user, wallet: updatedUser.wallet } as any
            : user
        ));
        
        // Update selectedUser with server response
        setSelectedUser({ ...selectedUser, wallet: updatedUser.wallet } as any);
        
        // Reset form and close dialog
        setCoinAmount('');
        setCoinDialogOpen(false);
        
        toast.success(`Coins ${coinOperation === 'add' ? 'added' : 'removed'} successfully`);
      } else {
        // Revert optimistic update on failure
        setUsers(originalUsers);
        setSelectedUser(originalUser);
        toast.error(result.message || 'Failed to update coins');
      }
    } catch (error) {
      // Revert optimistic update on error
      setUsers(originalUsers);
      setSelectedUser(originalUser);
      const errorMessage = error instanceof Error ? error.message : ERROR_MESSAGES.SERVER_ERROR;
      logger.error('Failed to update coins:', error);
      toast.error(errorMessage);
    }
  };

  const handleRegisterUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerForm.name || !registerForm.email || !registerForm.password) {
      toast.error('Please fill in all fields');
      return;
    }

    if (registerForm.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsRegistering(true);
    try {
      const result = await apiService.registerUser(
        registerForm.name,
        registerForm.email,
        registerForm.password
      );
      
      if (result.success) {
        toast.success('Player registered successfully! Email verification required.');
        
        // Store verification info if available (for showing message)
        const resultWithToken = result as typeof result & { verificationToken?: string; verificationLink?: string };
        if (resultWithToken.verificationLink || resultWithToken.verificationToken) {
          setVerificationInfo({
            email: registerForm.email,
            token: resultWithToken.verificationToken,
            link: resultWithToken.verificationLink
          });
        }
        
        setRegisterDialogOpen(false);
        setRegisterForm({ name: '', email: '', password: '' });
        // Refresh users list
        const data = await apiService.getUsers();
        setUsers(Array.isArray(data) ? data : []);
      } else {
        toast.error(result.message || 'Failed to register player');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : ERROR_MESSAGES.SERVER_ERROR;
      logger.error('Failed to register user:', error);
      toast.error(errorMessage);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast.success('Verification link copied to clipboard!');
  };

  const handleOpenLink = (link: string) => {
    window.open(link, '_blank');
  };

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 md:p-8 lg:p-10 space-y-6 sm:space-y-8 relative">
        {/* Email Verification Info Alert */}
        {verificationInfo && (
          <div className="mb-4 p-3 border border-primary/50 bg-primary/5 rounded-lg animate-fade-in">
            <div className="flex items-start gap-2">
              <Mail className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className="font-semibold text-xs sm:text-sm">Email Verification Required</h3>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setVerificationInfo(null)}
                    className="h-5 w-5 p-0 flex-shrink-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  <strong>{verificationInfo.email}</strong> needs email verification to access account.
                </p>
                {verificationInfo.link && import.meta.env.DEV && (
                  <div className="mt-2 space-y-1.5">
                    <p className="text-xs font-semibold text-muted-foreground">Verification Link (Dev):</p>
                    <div className="flex items-center gap-1.5 p-1.5 bg-muted rounded border border-border/50">
                      <code className="text-xs flex-1 truncate font-mono">{verificationInfo.link}</code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopyLink(verificationInfo.link!)}
                        className="h-6 w-6 p-0 flex-shrink-0"
                        title="Copy link"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleOpenLink(verificationInfo.link!)}
                        className="h-6 w-6 p-0 flex-shrink-0"
                        title="Open link"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {/* Game-themed header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-6 border-b border-border/40 animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-2xl" />
              <div className="relative h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-gradient-to-br from-primary via-primary to-accent flex items-center justify-center shadow-2xl ring-2 ring-primary/30 transform hover:scale-110 transition-transform duration-300">
                <UsersIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
                Players Hub
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-muted-foreground/80 font-medium">
                Manage registered players, stats, and coin balances
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 sm:gap-2 p-1 bg-muted/30 rounded-lg border border-border/50 overflow-x-auto">
            <Filter className="h-4 w-4 text-muted-foreground ml-1 sm:ml-2 flex-shrink-0" />
            <Button
              variant={statusFilter === 'all' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setStatusFilter('all')}
              className={`flex-1 min-w-[70px] transition-all text-xs sm:text-sm whitespace-nowrap ${
                statusFilter === 'all' 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'hover:bg-muted'
              }`}
            >
              All ({users.length})
            </Button>
            <Button
              variant={statusFilter === 'active' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setStatusFilter('active')}
              className={`flex-1 min-w-[90px] transition-all text-xs sm:text-sm whitespace-nowrap ${
                statusFilter === 'active' 
                  ? 'bg-success text-white shadow-md' 
                  : 'hover:bg-muted'
              }`}
            >
              <CheckCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5" />
              <span className="hidden xs:inline">Active </span>({users.filter(u => (u as any).status === 'active').length})
            </Button>
            <Button
              variant={statusFilter === 'suspended' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setStatusFilter('suspended')}
              className={`flex-1 min-w-[110px] transition-all text-xs sm:text-sm whitespace-nowrap ${
                statusFilter === 'suspended' 
                  ? 'bg-destructive text-white shadow-md' 
                  : 'hover:bg-muted'
              }`}
            >
              <Ban className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5" />
              <span className="hidden xs:inline">Suspended </span>({users.filter(u => (u as any).status === 'suspended').length})
            </Button>
          </div>

          {/* Search and Register */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
            <div className="relative flex-1 w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 sm:h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20 border-border/50 bg-background text-sm w-full"
              />
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <Badge variant="outline" className="px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold border-primary/20 bg-primary/5 whitespace-nowrap">
              {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'}
            </Badge>
            {currentUser?.role === 'admin' && (
              <Dialog open={registerDialogOpen} onOpenChange={setRegisterDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-primary via-primary to-accent hover:from-primary/90 hover:to-accent/90 font-semibold neon-glow hover:scale-105 text-xs sm:text-sm whitespace-nowrap">
                    <UserPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                    <span className="hidden sm:inline">Register Player</span>
                    <span className="sm:hidden">Register</span>
                  </Button>
                </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-xl">Register New Player</DialogTitle>
                  <DialogDescription className="text-base">
                    Create a new player account. New players receive 100 coins by default.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleRegisterUser} className="space-y-5 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="registerName" className="text-sm font-semibold">Name</Label>
                    <Input
                      id="registerName"
                      type="text"
                      value={registerForm.name}
                      onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                      placeholder="Enter player name"
                      className="h-11"
                      required
                      minLength={2}
                      maxLength={255}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="registerEmail" className="text-sm font-semibold">Email</Label>
                    <Input
                      id="registerEmail"
                      type="email"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                      placeholder="Enter email address"
                      className="h-11"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="registerPassword" className="text-sm font-semibold">Password</Label>
                    <Input
                      id="registerPassword"
                      type="password"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                      placeholder="Enter password (min 6 characters)"
                      className="h-11"
                      required
                      minLength={6}
                    />
                    <p className="text-xs text-muted-foreground">
                      Password must be at least 6 characters long
                    </p>
                  </div>
                  <div className="flex gap-3 justify-end pt-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setRegisterDialogOpen(false);
                        setRegisterForm({ name: '', email: '', password: '' });
                      }}
                      className="px-6"
                      disabled={isRegistering}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      className="px-6 bg-gradient-to-r from-primary to-primary/80"
                      disabled={isRegistering}
                    >
                      {isRegistering ? (
                        <>
                          <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                          Registering...
                        </>
                      ) : (
                        'Register Player'
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
            )}
          </div>
          </div>
        </div>

        <div className="border-2 border-border/50 rounded-xl shadow-2xl overflow-hidden bg-card/90 backdrop-blur-md game-card animate-fade-in delay-200">
          <div className="overflow-x-auto">
            <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-muted/40 to-muted/20 hover:bg-muted/30 border-b border-border/50">
                <TableHead className="font-semibold text-foreground min-w-[80px]">ID</TableHead>
                <TableHead className="font-semibold text-foreground min-w-[120px]">Name</TableHead>
                <TableHead className="font-semibold text-foreground min-w-[180px]">Email</TableHead>
                <TableHead className="font-semibold text-foreground min-w-[100px]">Stats</TableHead>
                <TableHead className="font-semibold text-foreground min-w-[120px]">Coins</TableHead>
                <TableHead className="font-semibold text-foreground min-w-[100px]">Status</TableHead>
                <TableHead className="font-semibold text-foreground min-w-[120px] hidden sm:table-cell">Joined</TableHead>
                <TableHead className="font-semibold text-foreground min-w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Skeleton loading state
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`} className="hover:bg-transparent">
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-20" /></TableCell>
                  </TableRow>
                ))
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <UsersIcon size={48} className="text-muted-foreground/50" />
                      <div>
                        <p className="font-medium">No users found</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {searchTerm ? 'Try adjusting your search terms' : 'No users registered yet'}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => {
                  const userStatus = (user as any).status || 'active';
                  const userCoins = user.wallet?.balance || 0;
                  const userWins = user.stats?.wins || 0;
                  const userLosses = user.stats?.losses || 0;
                  
                  return (
                  <TableRow key={user._id} className="hover:bg-primary/10 hover:shadow-md transition-all duration-300 border-b border-border/30 group">
                    <TableCell className="font-mono text-xs text-muted-foreground">{user._id?.slice(0, 8)}...</TableCell>
                    <TableCell className="font-semibold text-foreground">{user.username}</TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Trophy className="h-3.5 w-3.5 text-success" />
                          <span className="text-sm font-medium">{userWins}</span>
                        </div>
                        <span className="text-muted-foreground">/</span>
                        <div className="flex items-center gap-1">
                          <TrendingDown className="h-3.5 w-3.5 text-destructive" />
                          <span className="text-sm font-medium">{userLosses}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-accent/10">
                          <Coins className="h-3.5 w-3.5 text-accent" />
                          <span className="font-semibold">{userCoins}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary transition-colors"
                          onClick={() => handleCoinManagement(user)}
                          disabled={currentUser ? currentUser._id === user._id : false}
                          title={currentUser && currentUser._id === user._id 
                            ? 'You cannot manage your own coins' 
                            : 'Manage coins'
                          }
                        >
                          <Coins className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={userStatus === 'active' ? 'default' : 'destructive'}
                        className={userStatus === 'active' ? 'bg-success/10 text-success border-success/30' : ''}
                      >
                        {userStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground hidden sm:table-cell">{user.createdAt}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleUserStatus(user._id, userStatus)}
                          disabled={currentUser ? (currentUser._id === user._id && userStatus === 'active') : false}
                          className={userStatus === 'active' 
                            ? 'hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30' 
                            : 'hover:bg-success/10 hover:text-success hover:border-success/30'
                          }
                          title={currentUser && currentUser._id === user._id && userStatus === 'active' 
                            ? 'You cannot suspend your own account' 
                            : undefined
                          }
                        >
                          {userStatus === 'active' ? (
                            <>
                              <Ban className="h-3.5 w-3.5 mr-1.5" />
                              Suspend
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                              Activate
                            </>
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          </div>
        </div>

        {/* Coin Management Dialog */}
        <Dialog open={coinDialogOpen} onOpenChange={setCoinDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl">Manage Coins</DialogTitle>
              <DialogDescription className="text-base">
                Manage coins for the selected user
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">User</div>
                <div className="font-semibold">{selectedUser.username}</div>
                <div className="text-sm text-muted-foreground mt-2">Current Balance</div>
                <div className="text-lg font-bold text-primary">{selectedUser.wallet?.balance || 0} coins</div>
              </div>
            )}
            <form onSubmit={handleCoinSubmit} className="space-y-5 mt-4">
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Operation Type</Label>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant={coinOperation === 'add' ? 'default' : 'outline'}
                    className={`flex-1 h-12 transition-all duration-200 ${
                      coinOperation === 'add' 
                        ? 'shadow-md' 
                        : 'hover:bg-success/10 hover:border-success/30 hover:text-success'
                    }`}
                    onClick={() => {
                      setCoinOperation('add');
                      setCoinAmount('');
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Coins
                  </Button>
                  <Button
                    type="button"
                    variant={coinOperation === 'remove' ? 'destructive' : 'outline'}
                    className={`flex-1 h-12 transition-all duration-200 ${
                      coinOperation === 'remove' 
                        ? 'shadow-md' 
                        : 'hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive'
                    }`}
                    onClick={() => {
                      setCoinOperation('remove');
                      setCoinAmount('');
                    }}
                  >
                    <Minus className="h-4 w-4 mr-2" />
                    Remove Coins
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="coinAmount" className="text-sm font-semibold">Amount</Label>
                <Input
                  id="coinAmount"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={coinAmount}
                  onChange={(e) => {
                    const value = e.target.value.trim();
                    // Only allow positive integers
                    if (value === '' || /^\d+$/.test(value)) {
                      setCoinAmount(value);
                    }
                  }}
                  placeholder="Enter coin amount (whole number only)"
                  className="h-11"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Coins must be whole numbers (no decimals)
                </p>
              </div>
              {selectedUser && coinAmount && (
                <div className={`p-4 rounded-lg border-2 ${
                  coinOperation === 'add' 
                    ? 'bg-success/5 border-success/20' 
                    : 'bg-destructive/5 border-destructive/20'
                }`}>
                  <div className="text-xs text-muted-foreground mb-1">New Balance</div>
                  <div className={`text-2xl font-bold ${
                    coinOperation === 'add' ? 'text-success' : 'text-destructive'
                  }`}>
                    {(() => {
                      // Use selectedUser's balance (original, not optimistically updated) for preview
                      // This ensures preview shows correct calculation even after optimistic update
                      const currentBalance = selectedUser.wallet?.balance || 0;
                      const amount = parseInt(coinAmount.trim(), 10);
                      
                      if (isNaN(amount) || amount <= 0) {
                        return currentBalance;
                      }
                      
                      return coinOperation === 'add' 
                        ? currentBalance + amount
                        : Math.max(0, currentBalance - amount);
                    })()} coins
                  </div>
                </div>
              )}
              <div className="flex gap-3 justify-end pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setCoinDialogOpen(false)}
                  className="px-6"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className={`px-6 ${
                    coinOperation === 'add' 
                      ? 'bg-gradient-to-r from-success to-success/80' 
                      : 'bg-gradient-to-r from-destructive to-destructive/80'
                  }`}
                >
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
