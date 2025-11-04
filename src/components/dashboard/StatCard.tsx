import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'accent';
  iconColor?: string;
}

export const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  description, 
  trend,
  variant = 'default',
  iconColor
}: StatCardProps) => {
  const variantStyles = {
    default: 'border-border/50',
    primary: 'border-primary/20 bg-gradient-to-br from-primary/5 to-primary/0',
    accent: 'border-accent/20 bg-gradient-to-br from-accent/5 to-accent/0'
  };

  const iconVariantStyles = {
    default: 'bg-muted text-muted-foreground',
    primary: 'bg-primary/10 text-primary',
    accent: 'bg-accent/10 text-accent'
  };

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/30 group",
      variantStyles[variant]
    )}>
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground leading-none">
          {title}
        </CardTitle>
        <div className={cn(
          "h-9 w-9 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3",
          iconVariantStyles[variant],
          iconColor && `bg-[${iconColor}]/10 text-[${iconColor}]`
        )}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-1">
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
        )}
        {trend && (
          <div className={cn(
            "flex items-center gap-1.5 text-xs font-medium mt-2 pt-1",
            trend.isPositive ? 'text-success' : 'text-destructive'
          )}>
            <span className="text-sm font-semibold">{trend.isPositive ? '↑' : '↓'}</span>
            <span>{trend.value}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
