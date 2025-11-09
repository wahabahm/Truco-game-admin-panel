import { useEffect, useState } from 'react';
import { Users, Coins, Activity, Swords, Trophy, TrendingUp, ArrowUpRight, Clock, Zap, BarChart3, LayoutDashboard, DollarSign, Award, PlayCircle, Target, Eye } from 'lucide-react';
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
import type { DashboardStats, UserGrowthData, WeeklyActivityData, RecentActivity } from '@/types';
import { logger } from '@/utils/logger';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalCoins: 0,
    activePlayers: 0,
    ongoingMatches: 0,
    ongoingTournaments: 0,
    completedMatches: 0,
    completedTournaments: 0
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [userGrowthData, setUserGrowthData] = useState<UserGrowthData[]>([]);
  const [weeklyActivityData, setWeeklyActivityData] = useState<WeeklyActivityData[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);

  useEffect(() => {
    let isMounted = true;
    const fetchAllData = async () => {
      try {
        const [statsData, growthData, activityData, activityFeed] = await Promise.all([
          apiService.getDashboardStats(),
          apiService.getUserGrowthData(),
          apiService.getWeeklyActivityData(),
          apiService.getRecentActivity(5)
        ]);

        if (!isMounted) return;

        setStats(statsData);
        setUserGrowthData(growthData.length > 0 ? growthData : [
          { month: 'Jan', users: 0, matches: 0, tournaments: 0 },
          { month: 'Feb', users: 0, matches: 0, tournaments: 0 },
          { month: 'Mar', users: 0, matches: 0, tournaments: 0 },
          { month: 'Apr', users: 0, matches: 0, tournaments: 0 },
          { month: 'May', users: 0, matches: 0, tournaments: 0 },
          { month: 'Jun', users: 0, matches: 0, tournaments: 0 },
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
        if (!isMounted) return;
        logger.error('Failed to fetch dashboard data:', error);
        setUserGrowthData([
          { month: 'Jan', users: 0, matches: 0, tournaments: 0 },
          { month: 'Feb', users: 0, matches: 0, tournaments: 0 },
          { month: 'Mar', users: 0, matches: 0, tournaments: 0 },
          { month: 'Apr', users: 0, matches: 0, tournaments: 0 },
          { month: 'May', users: 0, matches: 0, tournaments: 0 },
          { month: 'Jun', users: 0, matches: 0, tournaments: 0 },
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
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    fetchAllData();
    
    return () => {
      isMounted = false;
    };
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
    tournaments: {
      label: 'Tournaments',
      color: 'hsl(142, 71%, 45%)', // Green color for tournaments (Trophy theme)
    },
    active: {
      label: 'Active Players',
      color: 'hsl(var(--primary))',
    },
  };

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'match': return Swords;
      case 'tournament': return Trophy;
      case 'user': return Users;
      case 'transaction': return Coins;
      default: return Activity;
    }
  };

  const getStatusColor = (status: string): string => {
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
        <div className="p-6 md:p-8 lg:p-10 space-y-8">
          <div className="flex items-center justify-center min-h-[500px]">
            <div className="text-center space-y-4">
              <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              <div className="text-muted-foreground text-lg font-medium">Loading dashboard data...</div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 md:p-8 lg:p-10 space-y-8 bg-background min-h-screen">
        {/* Welcome Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary via-primary to-accent flex items-center justify-center shadow-xl ring-4 ring-primary/10">
                <LayoutDashboard className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
                  Dashboard Overview
                </h1>
                <p className="text-base text-muted-foreground mt-1.5">
                  Real-time insights and platform statistics
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline" className="gap-2.5 px-5 py-2.5 border-success/40 bg-success/10 hover:bg-success/20 transition-colors text-base">
              <div className="h-2.5 w-2.5 rounded-full bg-success animate-pulse" />
              <span className="text-success font-semibold">System Operational</span>
            </Badge>
            <Button 
              variant="outline" 
              size="default" 
              onClick={() => navigate('/live')}
              className="shadow-sm hover:shadow-md hover:bg-primary/5 hover:border-primary/30 transition-all duration-200 gap-2"
            >
              <Eye className="h-4 w-4" />
              Live Monitor
            </Button>
          </div>
        </div>

        {/* Primary Metrics Grid - Most Important Stats */}
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Players"
            value={stats.totalUsers.toLocaleString()}
            icon={Users}
            description="Registered users"
            trend={{ value: 'Growing steadily', isPositive: true }}
            variant="primary"
          />
          <StatCard
            title="Active Now"
            value={stats.activePlayers}
            icon={Zap}
            description="Currently online"
            trend={{ value: 'Real-time count', isPositive: true }}
            variant="accent"
          />
          <StatCard
            title="Ongoing Matches"
            value={stats.ongoingMatches}
            icon={Swords}
            description="In progress"
          />
          <StatCard
            title="Total Coins"
            value={stats.totalCoins.toLocaleString()}
            icon={Coins}
            description="In circulation"
            trend={{ value: 'Economy health', isPositive: true }}
          />
        </div>

        {/* Charts Section - Visual Analytics */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* User Growth Chart */}
          <Card className="border-2 border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-4 border-b border-border/50">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Platform Growth Trend
                  </CardTitle>
                  <CardDescription className="text-sm">Monthly users, matches, and tournaments statistics</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/reports')}
                  className="text-muted-foreground hover:text-primary"
                >
                  View Details
                  <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <ChartContainer config={chartConfig} className="h-[280px] w-full">
                <AreaChart data={userGrowthData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05}/>
                      </linearGradient>
                      <linearGradient id="colorMatches" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0.05}/>
                      </linearGradient>
                      <linearGradient id="colorTournaments" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.05}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
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
                    <ChartTooltip 
                      content={<ChartTooltipContent />}
                      cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '5 5' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="users" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2.5}
                      fillOpacity={1} 
                      fill="url(#colorUsers)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="matches" 
                      stroke="hsl(var(--accent))" 
                      strokeWidth={2.5}
                      fillOpacity={1} 
                      fill="url(#colorMatches)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="tournaments" 
                      stroke="hsl(142, 71%, 45%)" 
                      strokeWidth={2.5}
                      fillOpacity={1} 
                      fill="url(#colorTournaments)" 
                    />
                  </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Weekly Activity Chart */}
          <Card className="border-2 border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-4 border-b border-border/50">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-accent" />
                    Weekly Activity
                  </CardTitle>
                  <CardDescription className="text-sm">Daily active players and matches</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/reports')}
                  className="text-muted-foreground hover:text-accent"
                >
                  View Details
                  <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <ChartContainer config={chartConfig} className="h-[280px] w-full">
                <BarChart data={weeklyActivityData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
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
                    <ChartTooltip 
                      content={<ChartTooltipContent />}
                      cursor={{ fill: 'hsl(var(--primary))', opacity: 0.1 }}
                    />
                    <Bar 
                      dataKey="active" 
                      fill="hsl(var(--primary))" 
                      radius={[6, 6, 0, 0]}
                      opacity={0.85}
                    />
                    <Bar 
                      dataKey="matches" 
                      fill="hsl(var(--accent))" 
                      radius={[6, 6, 0, 0]}
                      opacity={0.85}
                    />
                  </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Metrics and Activity Feed */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Tournament & Match Stats */}
          <div className="lg:col-span-1 space-y-5">
            <Card className="border-2 border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-accent" />
                  Tournament Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <PlayCircle className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Active</p>
                      <p className="text-2xl font-bold">{stats.ongoingTournaments}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/tournaments')}
                    className="hover:bg-primary/10"
                  >
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-accent/5 to-primary/5 border border-accent/10">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Award className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Completed</p>
                      <p className="text-2xl font-bold">{stats.completedTournaments}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/tournaments')}
                    className="hover:bg-accent/10"
                  >
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Match Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Swords className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Completed</p>
                      <p className="text-2xl font-bold">{stats.completedMatches.toLocaleString()}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/matches')}
                    className="hover:bg-primary/10"
                  >
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity Feed */}
          <Card className="lg:col-span-2 border-2 border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-4 border-b border-border/50">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription className="text-sm">Latest platform events and updates</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/reports')}
                  className="text-muted-foreground hover:text-primary"
                >
                  View All
                  <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {recentActivity.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Activity className="h-16 w-16 mx-auto mb-4 opacity-30" />
                    <p className="text-base font-medium">No recent activity</p>
                    <p className="text-sm mt-1">Activity will appear here as events occur</p>
                  </div>
                ) : (
                  recentActivity.map((activity, index) => {
                    const Icon = getActivityIcon(activity.type);
                    return (
                      <div 
                        key={activity.id || index}
                        className="flex items-start gap-4 p-4 rounded-xl border-2 border-border/50 hover:bg-gradient-to-r hover:from-primary/5 hover:to-accent/5 hover:border-primary/30 transition-all duration-200 group cursor-pointer"
                      >
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-200 shadow-md">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2.5 mb-2">
                            <p className="text-base font-semibold text-foreground">{activity.action}</p>
                            <Badge variant="outline" className={`text-xs px-2.5 py-1 ${getStatusColor(activity.status)}`}>
                              {activity.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                            <span className="font-medium text-foreground/80">{activity.user}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {activity.time}
                            </span>
                          </div>
                        </div>
                        <ArrowUpRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:text-primary transition-all flex-shrink-0" />
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Panel */}
        <Card className="border-2 border-border/50 shadow-lg bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm">
          <CardHeader className="pb-4 border-b border-border/50">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
            <CardDescription className="text-sm">Fast access to frequently used features</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <Button 
                variant="outline" 
                className="h-auto flex-col gap-3 p-5 hover:bg-gradient-to-br hover:from-primary/10 hover:to-primary/5 hover:border-primary/40 hover:shadow-md transition-all duration-200 group" 
                onClick={() => navigate('/users')}
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <span className="font-semibold">Users</span>
                <span className="text-xs text-muted-foreground">Manage players</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto flex-col gap-3 p-5 hover:bg-gradient-to-br hover:from-accent/10 hover:to-accent/5 hover:border-accent/40 hover:shadow-md transition-all duration-200 group" 
                onClick={() => navigate('/matches')}
              >
                <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 group-hover:scale-110 transition-all">
                  <Swords className="h-6 w-6 text-accent" />
                </div>
                <span className="font-semibold">Matches</span>
                <span className="text-xs text-muted-foreground">View matches</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto flex-col gap-3 p-5 hover:bg-gradient-to-br hover:from-primary/10 hover:to-primary/5 hover:border-primary/40 hover:shadow-md transition-all duration-200 group" 
                onClick={() => navigate('/tournaments')}
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all">
                  <Trophy className="h-6 w-6 text-primary" />
                </div>
                <span className="font-semibold">Tournaments</span>
                <span className="text-xs text-muted-foreground">Manage events</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto flex-col gap-3 p-5 hover:bg-gradient-to-br hover:from-accent/10 hover:to-accent/5 hover:border-accent/40 hover:shadow-md transition-all duration-200 group" 
                onClick={() => navigate('/transactions')}
              >
                <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 group-hover:scale-110 transition-all">
                  <DollarSign className="h-6 w-6 text-accent" />
                </div>
                <span className="font-semibold">Transactions</span>
                <span className="text-xs text-muted-foreground">View economy</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto flex-col gap-3 p-5 hover:bg-gradient-to-br hover:from-primary/10 hover:to-primary/5 hover:border-primary/40 hover:shadow-md transition-all duration-200 group" 
                onClick={() => navigate('/reports')}
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <span className="font-semibold">Reports</span>
                <span className="text-xs text-muted-foreground">Analytics</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
