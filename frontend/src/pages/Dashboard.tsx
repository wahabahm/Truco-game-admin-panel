import { useEffect, useState } from 'react';
import { Users, Coins, LayoutDashboard } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { apiService } from '@/services/apiService';
import { AppLayout } from '@/components/layout/AppLayout';
import { logger } from '@/utils/logger';
import type { DashboardStats } from '@/types';

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalCoins: 0
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
                  Platform statistics and overview
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Primary Metrics Grid */}
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 max-w-4xl">
          <StatCard
            title="Total Players"
            value={stats.totalUsers.toLocaleString()}
            icon={Users}
            description="Registered users"
            variant="primary"
          />
          <StatCard
            title="Total Coins"
            value={stats.totalCoins.toLocaleString()}
            icon={Coins}
            description="In circulation"
          />
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
