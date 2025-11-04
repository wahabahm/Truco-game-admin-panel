import { useEffect, useState } from 'react';
import { Users, Coins, Activity, Swords, Trophy, TrendingUp } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { apiService } from '@/services/apiService';
import { AppLayout } from '@/components/layout/AppLayout';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCoins: 0,
    activePlayers: 0,
    ongoingMatches: 0,
    ongoingTournaments: 0,
    completedMatches: 0,
    completedTournaments: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      const data = await apiService.getDashboardStats();
      setStats(data);
    };
    fetchStats();
  }, []);

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your Truco game platform
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Users"
            value={stats.totalUsers.toLocaleString()}
            icon={Users}
            description="Registered players"
            trend={{ value: '12% from last month', isPositive: true }}
          />
          <StatCard
            title="Total Coins"
            value={stats.totalCoins.toLocaleString()}
            icon={Coins}
            description="In circulation"
          />
          <StatCard
            title="Active Players"
            value={stats.activePlayers}
            icon={Activity}
            description="Currently online"
          />
          <StatCard
            title="Ongoing Matches"
            value={stats.ongoingMatches}
            icon={Swords}
            description="In progress"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Ongoing Tournaments"
            value={stats.ongoingTournaments}
            icon={Trophy}
            description="Active tournaments"
          />
          <StatCard
            title="Completed Matches"
            value={stats.completedMatches.toLocaleString()}
            icon={Swords}
            description="All-time"
          />
          <StatCard
            title="Completed Tournaments"
            value={stats.completedTournaments}
            icon={TrendingUp}
            description="All-time"
          />
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
