import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, AlertTriangle, XCircle, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

const Live = () => {
  const [alerts] = useState([
    { id: '1', type: 'fraud', message: 'Suspicious activity detected for user #42', severity: 'high', timestamp: '2 min ago' },
    { id: '2', type: 'reconnection', message: 'Multiple reconnection attempts from user #156', severity: 'medium', timestamp: '5 min ago' },
    { id: '3', type: 'fraud', message: 'Unusual betting pattern in tournament #3', severity: 'high', timestamp: '10 min ago' },
  ]);

  const handleForceClose = (type: string, id: string) => {
    toast.success(`${type} #${id} has been force-closed`);
  };

  const handleAdjustPrize = () => {
    toast.success('Prize adjusted successfully');
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Live Monitor</h1>
          <p className="text-muted-foreground">
            Real-time monitoring and controls
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Players
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">142</div>
              <div className="flex items-center text-xs text-success mt-1">
                <Activity className="h-3 w-3 mr-1" />
                Live now
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Ongoing Matches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">23</div>
              <div className="text-xs text-muted-foreground mt-1">In progress</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Tournaments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <div className="text-xs text-muted-foreground mt-1">Running</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">3</div>
              <div className="flex items-center text-xs text-warning mt-1">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Needs attention
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Suspicious Activity Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className={`h-5 w-5 ${alert.severity === 'high' ? 'text-destructive' : 'text-warning'}`} />
                    <div>
                      <p className="font-medium">{alert.message}</p>
                      <p className="text-sm text-muted-foreground">{alert.timestamp}</p>
                    </div>
                  </div>
                  <Badge variant={alert.severity === 'high' ? 'destructive' : 'secondary'}>
                    {alert.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Manual Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => handleForceClose('Match', '42')}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Force Close Match
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => handleForceClose('Tournament', '3')}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Force Close Tournament
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={handleAdjustPrize}
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Adjust Prize Distribution
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Coins in play</span>
                  <span className="font-medium">12,450</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Average match duration</span>
                  <span className="font-medium">8 min</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Peak players today</span>
                  <span className="font-medium">287</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Live;
