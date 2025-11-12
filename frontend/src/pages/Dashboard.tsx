import { useEffect, useState } from 'react';
import { Users, Coins, LayoutDashboard, TrendingUp, TrendingDown, Trophy, Swords } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { apiService } from '@/services/apiService';
import { AppLayout } from '@/components/layout/AppLayout';
import { logger } from '@/utils/logger';
import type { DashboardStats } from '@/types';

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalCoins: 0,
    coinsIssued: 0,
    coinsUsedInTournaments: 0,
    coinsUsedInMatches: 0
  });

  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const fetchStats = async () => {
      try {
        const statsData = await apiService.getDashboardStats();
        if (!isMounted) return;
        setStats(statsData);
      } catch (error) {
        if (!isMounted) return;
        logger.error('Failed to fetch dashboard data:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    fetchStats();
    
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <AppLayout>
        <div className="p-4 sm:p-6 md:p-8 lg:p-10 space-y-6 sm:space-y-8">
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
      <div className="relative p-4 sm:p-6 md:p-8 lg:p-10 space-y-6 sm:space-y-8 md:space-y-10 bg-background w-full particle-bg">
        {/* Animated background elements */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-500" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl animate-pulse delay-700" />
        </div>

        {/* Welcome Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 animate-fade-in">
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/30 blur-2xl rounded-3xl animate-pulse-glow" />
                <div className="relative h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-gradient-to-br from-primary via-primary to-accent flex items-center justify-center shadow-2xl ring-4 ring-primary/20 transform hover:scale-110 transition-transform duration-300 float">
                  <LayoutDashboard className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
                  Game Control Center
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground/80 mt-2 font-medium">
                  Real-time platform statistics & analytics
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Primary Metrics Grid */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl animate-scale-in">
          <div className="animate-fade-in delay-100">
            <StatCard
              title="Total Players"
              value={stats.totalUsers.toLocaleString()}
              icon={Users}
              description="Active registered users"
              variant="primary"
            />
          </div>
          <div className="animate-fade-in delay-200">
            <StatCard
              title="Total Coins"
              value={stats.totalCoins.toLocaleString()}
              icon={Coins}
              description="Currently in circulation"
              variant="default"
            />
          </div>
          <div className="animate-fade-in delay-300">
            <StatCard
              title="Coins Issued"
              value={(stats.coinsIssued || 0).toLocaleString()}
              icon={TrendingUp}
              description="Total coins ever issued"
              variant="success"
            />
          </div>
        </div>

        {/* Economy Breakdown */}
        <div className="space-y-6 animate-fade-in delay-400">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-accent/20 blur-xl rounded-xl" />
              <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-accent/30 to-accent/20 flex items-center justify-center shadow-lg border border-accent/40">
                <Coins className="h-5 w-5 text-accent" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight bg-gradient-to-r from-foreground to-accent bg-clip-text text-transparent">
                Economy Breakdown
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground/70 mt-1 font-medium">Detailed coin usage & transaction statistics</p>
            </div>
          </div>
          
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl">
            <div className="animate-fade-in delay-500">
              <StatCard
                title="Tournament Fees"
                value={(stats.coinsUsedInTournaments || 0).toLocaleString()}
                icon={Trophy}
                description="Coins spent on tournaments"
                variant="accent"
              />
            </div>
            <div className="animate-fade-in delay-600">
              <StatCard
                title="Match Fees"
                value={(stats.coinsUsedInMatches || 0).toLocaleString()}
                icon={Swords}
                description="Coins spent on matches"
                variant="accent"
              />
            </div>
            <div className="animate-fade-in delay-700">
              <StatCard
                title="Total Spent"
                value={((stats.coinsUsedInTournaments || 0) + (stats.coinsUsedInMatches || 0)).toLocaleString()}
                icon={TrendingDown}
                description="Combined entry fees"
                variant="secondary"
              />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
