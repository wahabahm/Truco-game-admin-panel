import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { apiService } from '@/services/apiService';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

const Matches = () => {
  const [matches, setMatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'public',
    cost: '',
    prize: ''
  });

  useEffect(() => {
    const fetchMatches = async () => {
      setIsLoading(true);
      const data = await apiService.getMatches();
      setMatches(data);
      setIsLoading(false);
    };
    fetchMatches();
  }, []);

  const handleCreateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await apiService.createMatch(formData);
    if (result.success) {
      setMatches([result.match, ...matches]);
      toast.success('Match created successfully!');
      setIsDialogOpen(false);
      setFormData({ name: '', type: 'public', cost: '', prize: '' });
    }
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              1v1 Matches
            </h1>
            <p className="text-muted-foreground mt-1">
              Create and manage game matches
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="shadow-lg hover:shadow-xl transition-all duration-200">
                <Plus className="h-4 w-4 mr-2" />
                Create Match
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Match</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateMatch} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Match Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                  <Label htmlFor="cost">Entry Cost (coins)</Label>
                  <Input
                    id="cost"
                    type="number"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prize">Prize (coins)</Label>
                  <Input
                    id="prize"
                    type="number"
                    value={formData.prize}
                    onChange={(e) => setFormData({ ...formData, prize: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">Create Match</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Match Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Entry Cost</TableHead>
                <TableHead>Prize</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Players</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">Loading...</TableCell>
                </TableRow>
              ) : matches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">No matches found</TableCell>
                </TableRow>
              ) : (
                matches.map((match) => (
                  <TableRow key={match.id}>
                    <TableCell className="font-medium">{match.name}</TableCell>
                    <TableCell>
                      <Badge variant={match.type === 'public' ? 'default' : 'secondary'}>
                        {match.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{match.cost} coins</TableCell>
                    <TableCell>{match.prize} coins</TableCell>
                    <TableCell>
                      <Badge variant={match.status === 'active' ? 'default' : 'secondary'}>
                        {match.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{match.players}/2</TableCell>
                    <TableCell>{match.createdAt}</TableCell>
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

export default Matches;
