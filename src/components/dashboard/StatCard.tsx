import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export const StatCard = ({ title, value, icon: Icon, description, trend }: StatCardProps) => {
  return (
    <Card className="hover-lift overflow-hidden relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-2">{description}</p>
        )}
        {trend && (
          <div className={`text-xs mt-2 font-medium flex items-center gap-1 ${trend.isPositive ? 'text-success' : 'text-destructive'}`}>
            <span className="text-base">{trend.isPositive ? '↑' : '↓'}</span>
            {trend.value}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
