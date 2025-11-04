import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, FileText } from 'lucide-react';
import { apiService } from '@/services/apiService';
import { toast } from 'sonner';

const Reports = () => {
  const [adminLogs, setAdminLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      const data = await apiService.getAdminLogs();
      setAdminLogs(data);
      setIsLoading(false);
    };
    fetchLogs();
  }, []);

  const handleExport = (type: string) => {
    toast.success(`Exporting ${type} report...`);
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6 animate-fade-in">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Reports & Exports
          </h1>
          <p className="text-muted-foreground mt-1">
            Generate and download comprehensive reports
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="hover-lift">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Users Report</CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                onClick={() => handleExport('Users')}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Matches Report</CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                onClick={() => handleExport('Matches')}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Tournaments Report</CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                onClick={() => handleExport('Tournaments')}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Transactions Report</CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                onClick={() => handleExport('Transactions')}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Admin Action Logs</CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleExport('Admin Logs')}
              >
                <FileText className="h-4 w-4 mr-2" />
                Export Logs
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Admin</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center">Loading...</TableCell>
                    </TableRow>
                  ) : adminLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center">No logs found</TableCell>
                    </TableRow>
                  ) : (
                    adminLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">{log.admin}</TableCell>
                        <TableCell>{log.action}</TableCell>
                        <TableCell>{log.timestamp}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Reports;
