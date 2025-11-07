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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Bell, CheckCircle2, XCircle, AlertTriangle, Info, CheckCheck } from 'lucide-react';
import { toast } from 'sonner';
import type { Alert, AlertSummary, CreateAlertForm } from '@/types';
import { logger } from '@/utils/logger';
import { ERROR_MESSAGES } from '@/constants';

const Alerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState<boolean>(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'acknowledged' | 'resolved' | 'dismissed'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [summary, setSummary] = useState<AlertSummary | null>(null);
  const [formData, setFormData] = useState<CreateAlertForm>({
    title: '',
    message: '',
    type: 'info',
    severity: 'medium'
  });

  const fetchAlerts = async () => {
    setIsLoading(true);
    try {
      const status = filter === 'all' ? undefined : filter;
      const type = typeFilter === 'all' ? undefined : typeFilter;
      const data = await apiService.getAdminAlerts(status, type);
      setAlerts(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : ERROR_MESSAGES.NETWORK_ERROR;
      logger.error('Failed to load alerts:', error);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const data = await apiService.getAdminAlertsSummary();
      setSummary(data);
    } catch (error) {
      logger.error('Failed to load summary:', error);
    }
  };

  useEffect(() => {
    fetchAlerts();
    fetchSummary();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, typeFilter]);

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
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : ERROR_MESSAGES.SERVER_ERROR;
      logger.error('Failed to create alert:', error);
      toast.error(errorMessage);
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
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : ERROR_MESSAGES.SERVER_ERROR;
      logger.error('Failed to acknowledge alert:', error);
      toast.error(errorMessage);
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
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : ERROR_MESSAGES.SERVER_ERROR;
      logger.error('Failed to resolve alert:', error);
      toast.error(errorMessage);
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
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : ERROR_MESSAGES.SERVER_ERROR;
      logger.error('Failed to dismiss alert:', error);
      toast.error(errorMessage);
    }
  };

  const getTypeIcon = (type: Alert['type']) => {
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
      <div className="p-6 md:p-8 lg:p-10 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-border/60">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
              <Bell className="h-6 w-6 text-white" />
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
                Alerts Management
              </h1>
              <p className="text-sm md:text-base text-muted-foreground">
                Manage system alerts and notifications
              </p>
            </div>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="shadow-md hover:shadow-lg transition-all duration-200 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary">
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
                    onValueChange={(value) => setFormData({ ...formData, type: value as CreateAlertForm['type'] })}
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
                    onValueChange={(value) => setFormData({ ...formData, severity: value as CreateAlertForm['severity'] })}
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
            <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{summary.total || 0}</div>
              </CardContent>
            </Card>
            <Card className="border-destructive/30 bg-destructive/5 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-destructive">Active</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-destructive">{summary.active || 0}</div>
              </CardContent>
            </Card>
            <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Acknowledged</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{summary.acknowledged || 0}</div>
              </CardContent>
            </Card>
            <Card className="border-success/30 bg-success/5 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-success">Resolved</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-success">{summary.resolved || 0}</div>
              </CardContent>
            </Card>
            <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Dismissed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{summary.dismissed || 0}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-4">
          <Tabs value={filter} onValueChange={(value) => setFilter(value as typeof filter)} className="w-full">
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
        <div className="border rounded-xl shadow-sm overflow-hidden bg-card">
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
                  <TableCell colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-muted-foreground">Loading alerts...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : alerts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <Bell className="h-12 w-12 text-muted-foreground/50" />
                      <div>
                        <p className="font-medium">No alerts found</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {filter === 'all' ? 'No alerts in the system' : `No ${filter} alerts`}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                alerts.map((alert) => {
                  const Icon = getTypeIcon(alert.type);
                  return (
                    <TableRow key={alert.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell>
                        <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                          <Icon className="h-4 w-4" />
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">{alert.title}</TableCell>
                      <TableCell className="max-w-md truncate text-muted-foreground">{alert.message}</TableCell>
                      <TableCell>
                        <Badge variant={getSeverityColor(alert.severity)} className="font-medium">
                          {alert.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getTypeColor(alert.type)} className="font-medium">
                          {alert.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(alert.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {alert.status === 'active' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAcknowledge(alert.id)}
                              className="hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                            >
                              <CheckCheck className="h-3.5 w-3.5 mr-1.5" />
                              Acknowledge
                            </Button>
                          )}
                          {alert.status !== 'resolved' && alert.status !== 'dismissed' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleResolve(alert.id)}
                              className="hover:bg-success/10 hover:text-success hover:border-success/30"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                              Resolve
                            </Button>
                          )}
                          {alert.status !== 'dismissed' && alert.status !== 'resolved' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDismiss(alert.id)}
                              className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                            >
                              <XCircle className="h-3.5 w-3.5 mr-1.5" />
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

