import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Zap, TrendingUp, AlertTriangle } from 'lucide-react';

const Live = () => {
  return (
    <AppLayout>
      <div className="p-6 md:p-8 lg:p-10 space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-border/60">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
              Live Monitor
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Real-time monitoring and controls
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-success/30 bg-success/5 shadow-sm hover:shadow-md transition-all duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-success flex items-center gap-2">
                Active Players
                <div className="h-2 w-2 rounded-full bg-success animate-pulse"></div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">142</div>
              <div className="flex items-center text-xs text-success mt-2 font-medium">
                <Activity className="h-3 w-3 mr-1.5" />
                Live now
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm hover:shadow-md transition-all duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Ongoing Matches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">23</div>
              <div className="text-xs text-muted-foreground mt-2">In progress</div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm hover:shadow-md transition-all duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Tournaments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">5</div>
              <div className="text-xs text-muted-foreground mt-2">Running</div>
            </CardContent>
          </Card>

          <Card className="border-success/30 bg-success/5 shadow-sm hover:shadow-md transition-all duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-success">
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">Operational</div>
              <div className="text-xs text-success mt-2 font-medium">All systems normal</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="h-3 w-3 rounded-full bg-success shadow-sm"></div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold">Match Started</div>
                    <div className="text-xs text-muted-foreground mt-1">2 minutes ago</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="h-3 w-3 rounded-full bg-primary shadow-sm"></div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold">Tournament Registration</div>
                    <div className="text-xs text-muted-foreground mt-1">5 minutes ago</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="h-3 w-3 rounded-full bg-accent shadow-sm"></div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold">New User Registered</div>
                    <div className="text-xs text-muted-foreground mt-1">10 minutes ago</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                  <span className="text-sm text-muted-foreground">Coins in play</span>
                  <span className="font-bold text-lg">12,450</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                  <span className="text-sm text-muted-foreground">Average match duration</span>
                  <span className="font-bold text-lg">8 min</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                  <span className="text-sm text-muted-foreground">Peak players today</span>
                  <span className="font-bold text-lg">287</span>
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

