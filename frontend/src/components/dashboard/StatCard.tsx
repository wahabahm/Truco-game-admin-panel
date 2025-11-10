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
  variant?: 'default' | 'primary' | 'accent' | 'success' | 'secondary';
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
    default: 'border-border/50 bg-card/50 backdrop-blur-sm',
    primary: 'border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent shadow-primary/10',
    accent: 'border-accent/30 bg-gradient-to-br from-accent/10 via-accent/5 to-transparent shadow-accent/10',
    success: 'border-success/30 bg-gradient-to-br from-success/10 via-success/5 to-transparent shadow-success/10',
    secondary: 'border-muted/30 bg-gradient-to-br from-muted/10 via-muted/5 to-transparent'
  };

  const iconVariantStyles = {
    default: 'bg-muted/50 text-muted-foreground',
    primary: 'bg-primary/20 text-primary shadow-lg shadow-primary/20',
    accent: 'bg-accent/20 text-accent shadow-lg shadow-accent/20',
    success: 'bg-success/20 text-success shadow-lg shadow-success/20',
    secondary: 'bg-muted/20 text-muted-foreground shadow-lg'
  };

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] group border-2",
      variantStyles[variant]
    )}>
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Decorative corner accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4 relative z-10">
        <CardTitle className="text-sm font-semibold text-muted-foreground leading-tight uppercase tracking-wider">
          {title}
        </CardTitle>
        <div className={cn(
          "h-12 w-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-md",
          iconVariantStyles[variant],
          iconColor && `bg-[${iconColor}]/10 text-[${iconColor}]`
        )}>
          <Icon className="h-6 w-6" />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3 relative z-10">
        <div className="text-4xl font-bold tracking-tight text-foreground">{value}</div>
        {description && (
          <p className="text-sm text-muted-foreground leading-relaxed font-medium">{description}</p>
        )}
        {trend && (
          <div className={cn(
            "flex items-center gap-2 text-xs font-semibold mt-4 pt-3 border-t border-border/50",
            trend.isPositive ? 'text-success' : 'text-destructive'
          )}>
            <div className={cn(
              "h-5 w-5 rounded-full flex items-center justify-center",
              trend.isPositive ? 'bg-success/10' : 'bg-destructive/10'
            )}>
              <span className="text-sm font-bold">{trend.isPositive ? '↑' : '↓'}</span>
            </div>
            <span>{trend.value}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
