import { useEffect, useState } from 'react';
import { Users, Coins, Activity, Swords, Trophy, TrendingUp, ArrowUpRight, Clock, Zap, BarChart3 } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { apiService } from '@/services/apiService';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from '@/components/ui/chart';
import { Area, AreaChart, Bar, BarChart, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCoins: 0,
    activePlayers: 0,
    ongoingMatches: 0,
    ongoingTournaments: 0,
    completedMatches: 0,
    completedTournaments: 0
  });

  const [loading, setLoading] = useState(true);
  const [userGrowthData, setUserGrowthData] = useState<any[]>([]);
  const [weeklyActivityData, setWeeklyActivityData] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Fetch all dashboard data in parallel
        const [statsData, growthData, activityData, activityFeed] = await Promise.all([
          apiService.getDashboardStats(),
          apiService.getUserGrowthData(),
          apiService.getWeeklyActivityData(),
          apiService.getRecentActivity(5)
        ]);

        setStats(statsData);
        setUserGrowthData(growthData.length > 0 ? growthData : [
          { month: 'Jan', users: 0, matches: 0 },
          { month: 'Feb', users: 0, matches: 0 },
          { month: 'Mar', users: 0, matches: 0 },
          { month: 'Apr', users: 0, matches: 0 },
          { month: 'May', users: 0, matches: 0 },
          { month: 'Jun', users: 0, matches: 0 },
        ]);
        setWeeklyActivityData(activityData.length > 0 ? activityData : [
          { day: 'Mon', active: 0, matches: 0 },
          { day: 'Tue', active: 0, matches: 0 },
          { day: 'Wed', active: 0, matches: 0 },
          { day: 'Thu', active: 0, matches: 0 },
          { day: 'Fri', active: 0, matches: 0 },
          { day: 'Sat', active: 0, matches: 0 },
          { day: 'Sun', active: 0, matches: 0 },
        ]);
        setRecentActivity(activityFeed);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        // Set default empty data on error
        setUserGrowthData([
          { month: 'Jan', users: 0, matches: 0 },
          { month: 'Feb', users: 0, matches: 0 },
          { month: 'Mar', users: 0, matches: 0 },
          { month: 'Apr', users: 0, matches: 0 },
          { month: 'May', users: 0, matches: 0 },
          { month: 'Jun', users: 0, matches: 0 },
        ]);
        setWeeklyActivityData([
          { day: 'Mon', active: 0, matches: 0 },
          { day: 'Tue', active: 0, matches: 0 },
          { day: 'Wed', active: 0, matches: 0 },
          { day: 'Thu', active: 0, matches: 0 },
          { day: 'Fri', active: 0, matches: 0 },
          { day: 'Sat', active: 0, matches: 0 },
          { day: 'Sun', active: 0, matches: 0 },
        ]);
        setRecentActivity([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  const chartConfig = {
    users: {
      label: 'Users',
      color: 'hsl(var(--primary))',
    },
    matches: {
      label: 'Matches',
      color: 'hsl(var(--accent))',
    },
    active: {
      label: 'Active Players',
      color: 'hsl(var(--primary))',
    },
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'match': return Swords;
      case 'tournament': return Trophy;
      case 'user': return Users;
      case 'transaction': return Coins;
      default: return Activity;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success/10 text-success border-success/20';
      case 'completed': return 'bg-primary/10 text-primary border-primary/20';
      case 'new': return 'bg-accent/10 text-accent border-accent/20';
      case 'transaction': return 'bg-warning/10 text-warning border-warning/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <div className="text-muted-foreground">Loading dashboard...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1.5">
              Welcome back! Here's what's happening with your platform today.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-2">
              <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
              System Active
            </Badge>
            <Button variant="outline" size="sm" onClick={() => navigate('/live')}>
              <Activity className="h-4 w-4 mr-2" />
              Live Monitor
            </Button>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Users"
            value={stats.totalUsers.toLocaleString()}
            icon={Users}
            description="Registered players"
            trend={{ value: '+12.5% from last month', isPositive: true }}
            variant="primary"
          />
          <StatCard
            title="Active Players"
            value={stats.activePlayers}
            icon={Zap}
            description="Currently online"
            trend={{ value: '+8.2% from yesterday', isPositive: true }}
            variant="accent"
          />
          <StatCard
            title="Ongoing Matches"
            value={stats.ongoingMatches}
            icon={Swords}
            description="In progress right now"
          />
          <StatCard
            title="Total Coins"
            value={stats.totalCoins.toLocaleString()}
            icon={Coins}
            description="In circulation"
            trend={{ value: '+5.1% from last week', isPositive: true }}
          />
        </div>

        {/* Charts Section */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* User Growth Chart */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">User Growth</CardTitle>
                  <CardDescription>Monthly user and match statistics</CardDescription>
                </div>
                <BarChart3 className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[250px]">
                <AreaChart data={userGrowthData}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorMatches" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
                  <XAxis 
                    dataKey="month" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area 
                    type="monotone" 
                    dataKey="users" 
                    stroke="hsl(var(--primary))" 
                    fillOpacity={1} 
                    fill="url(#colorUsers)" 
                    strokeWidth={2}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="matches" 
                    stroke="hsl(var(--accent))" 
                    fillOpacity={1} 
                    fill="url(#colorMatches)" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Weekly Activity Chart */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">Weekly Activity</CardTitle>
                  <CardDescription>Daily active players and matches</CardDescription>
                </div>
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[250px]">
                <BarChart data={weeklyActivityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
                  <XAxis 
                    dataKey="day" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar 
                    dataKey="active" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]}
                    opacity={0.8}
                  />
                  <Bar 
                    dataKey="matches" 
                    fill="hsl(var(--accent))" 
                    radius={[4, 4, 0, 0]}
                    opacity={0.8}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Stats and Activity */}
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            title="Ongoing Tournaments"
            value={stats.ongoingTournaments}
            icon={Trophy}
            description="Active tournaments"
            variant="accent"
          />
          <StatCard
            title="Completed Matches"
            value={stats.completedMatches.toLocaleString()}
            icon={Swords}
            description="All-time completed"
          />
          <StatCard
            title="Completed Tournaments"
            value={stats.completedTournaments}
            icon={TrendingUp}
            description="All-time completed"
          />
        </div>

        {/* Recent Activity and Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Recent Activity */}
          <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
                  <CardDescription>Latest platform events and updates</CardDescription>
                </div>
                <Clock className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => {
                  const Icon = getActivityIcon(activity.type);
                  return (
                    <div 
                      key={activity.id} 
                      className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors group"
                    >
                      <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium">{activity.action}</p>
                          <Badge variant="outline" className={`text-xs ${getStatusColor(activity.status)}`}>
                            {activity.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-medium">{activity.user}</span>
                          <span>•</span>
                          <span>{activity.time}</span>
                        </div>
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  );
                })}
              </div>
              <Button variant="ghost" className="w-full mt-4" onClick={() => navigate('/reports')}>
                View All Activity
                <ArrowUpRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
              <CardDescription>Frequently used actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={() => navigate('/users')}
              >
                <Users className="h-4 w-4 mr-2" />
                Manage Users
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={() => navigate('/matches')}
              >
                <Swords className="h-4 w-4 mr-2" />
                View Matches
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={() => navigate('/tournaments')}
              >
                <Trophy className="h-4 w-4 mr-2" />
                Tournaments
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={() => navigate('/transactions')}
              >
                <Coins className="h-4 w-4 mr-2" />
                Transactions
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={() => navigate('/reports')}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                View Reports
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
