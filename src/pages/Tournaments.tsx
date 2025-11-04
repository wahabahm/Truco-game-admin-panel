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
import { Plus, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const Tournaments = () => {
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'public',
    entryCost: '',
    prizePool: ''
  });

  useEffect(() => {
    const fetchTournaments = async () => {
      setIsLoading(true);
      const data = await apiService.getTournaments();
      setTournaments(data);
      setIsLoading(false);
    };
    fetchTournaments();
  }, []);

  const handleCreateTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await apiService.createTournament(formData);
    if (result.success) {
      setTournaments([result.tournament, ...tournaments]);
      toast.success('Tournament created successfully!');
      setIsDialogOpen(false);
      setFormData({ name: '', type: 'public', entryCost: '', prizePool: '' });
    }
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tournaments</h1>
            <p className="text-muted-foreground">
              Create and manage tournaments
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Tournament
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Tournament</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateTournament} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Tournament Name</Label>
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
                  <Label htmlFor="entryCost">Entry Cost (coins)</Label>
                  <Input
                    id="entryCost"
                    type="number"
                    value={formData.entryCost}
                    onChange={(e) => setFormData({ ...formData, entryCost: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prizePool">Prize Pool (coins)</Label>
                  <Input
                    id="prizePool"
                    type="number"
                    value={formData.prizePool}
                    onChange={(e) => setFormData({ ...formData, prizePool: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">Create Tournament</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tournament Name</TableHead>
                <TableHead>Type</TableHead>
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
                  <TableCell colSpan={8} className="text-center">Loading...</TableCell>
                </TableRow>
              ) : tournaments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">No tournaments found</TableCell>
                </TableRow>
              ) : (
                tournaments.map((tournament) => (
                  <TableRow key={tournament.id}>
                    <TableCell className="font-medium">{tournament.name}</TableCell>
                    <TableCell>
                      <Badge variant={tournament.type === 'public' ? 'default' : 'secondary'}>
                        {tournament.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{tournament.entryCost} coins</TableCell>
                    <TableCell>{tournament.prizePool} coins</TableCell>
                    <TableCell>
                      <Badge variant={tournament.status === 'ongoing' ? 'default' : 'secondary'}>
                        {tournament.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{tournament.participants}</TableCell>
                    <TableCell>{tournament.startDate}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        <XCircle className="h-3 w-3 mr-1" />
                        Cancel
                      </Button>
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

export default Tournaments;
