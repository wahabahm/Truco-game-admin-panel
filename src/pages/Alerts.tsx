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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Bell, CheckCircle2, XCircle, AlertTriangle, Info, CheckCheck, X } from 'lucide-react';
import { toast } from 'sonner';

const Alerts = () => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'acknowledged' | 'resolved' | 'dismissed'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [summary, setSummary] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info',
    severity: 'medium'
  });

  useEffect(() => {
    fetchAlerts();
    fetchSummary();
  }, [filter, typeFilter]);

  const fetchAlerts = async () => {
    setIsLoading(true);
    try {
      const status = filter === 'all' ? undefined : filter;
      const type = typeFilter === 'all' ? undefined : typeFilter;
      const data = await apiService.getAdminAlerts(status, type);
      setAlerts(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load alerts');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const data = await apiService.getAdminAlertsSummary();
      setSummary(data);
    } catch (error: any) {
      console.error('Failed to load summary:', error);
    }
  };

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await apiService.createAlert(formData);
      if (result.success) {
        toast.success('Alert created successfully!');
        setIsCreateDialogOpen(false);
        setFormData({ title: '', message: '', type: 'info', severity: 'medium' });
        fetchAlerts();
        fetchSummary();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create alert');
    }
  };

  const handleAcknowledge = async (id: string) => {
    try {
      const result = await apiService.adminAcknowledgeAlert(id);
      if (result.success) {
        toast.success('Alert acknowledged');
        fetchAlerts();
        fetchSummary();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to acknowledge alert');
    }
  };

  const handleResolve = async (id: string) => {
    try {
      const result = await apiService.adminResolveAlert(id);
      if (result.success) {
        toast.success('Alert resolved');
        fetchAlerts();
        fetchSummary();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to resolve alert');
    }
  };

  const handleDismiss = async (id: string) => {
    try {
      const result = await apiService.adminDismissAlert(id);
      if (result.success) {
        toast.success('Alert dismissed');
        fetchAlerts();
        fetchSummary();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to dismiss alert');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'error': return AlertTriangle;
      case 'warning': return AlertTriangle;
      case 'success': return CheckCircle2;
      case 'system': return Bell;
      default: return Info;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'error': return 'destructive';
      case 'warning': return 'default';
      case 'success': return 'default';
      case 'system': return 'secondary';
      default: return 'secondary';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Alerts Management</h1>
            <p className="text-muted-foreground mt-1.5">
              Manage system alerts and notifications
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Alert
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Alert</DialogTitle>
                <DialogDescription>
                  Create a new system alert or notification
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateAlert} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter alert title"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Input
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Enter alert message"
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
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="severity">Severity</Label>
                  <Select
                    value={formData.severity}
                    onValueChange={(value) => setFormData({ ...formData, severity: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">Create Alert</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.total || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{summary.active || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Acknowledged</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.acknowledged || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">{summary.resolved || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Dismissed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.dismissed || 0}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-4">
          <Tabs value={filter} onValueChange={(value) => setFilter(value as any)} className="w-full">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="acknowledged">Acknowledged</TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
              <TabsTrigger value="dismissed">Dismissed</TabsTrigger>
            </TabsList>
          </Tabs>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="error">Error</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Alerts Table */}
        <div className="border rounded-xl shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">Loading...</TableCell>
                </TableRow>
              ) : alerts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">No alerts found</TableCell>
                </TableRow>
              ) : (
                alerts.map((alert) => {
                  const Icon = getTypeIcon(alert.type);
                  return (
                    <TableRow key={alert.id}>
                      <TableCell>
                        <Icon className="h-4 w-4" />
                      </TableCell>
                      <TableCell className="font-medium">{alert.title}</TableCell>
                      <TableCell className="max-w-md truncate">{alert.message}</TableCell>
                      <TableCell>
                        <Badge variant={getSeverityColor(alert.severity)}>
                          {alert.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getTypeColor(alert.type)}>
                          {alert.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(alert.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {alert.status === 'active' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAcknowledge(alert.id)}
                            >
                              <CheckCheck className="h-3.5 w-3.5 mr-1" />
                              Acknowledge
                            </Button>
                          )}
                          {alert.status !== 'resolved' && alert.status !== 'dismissed' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleResolve(alert.id)}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                              Resolve
                            </Button>
                          )}
                          {alert.status !== 'dismissed' && alert.status !== 'resolved' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDismiss(alert.id)}
                            >
                              <XCircle className="h-3.5 w-3.5 mr-1" />
                              Dismiss
                            </Button>
                          )}
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
    </AppLayout>
  );
};

export default Alerts;

