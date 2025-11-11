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
    default: 'border-border/60 bg-gradient-to-br from-card via-card/95 to-card/90 backdrop-blur-md game-card',
    primary: 'border-primary/40 bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 backdrop-blur-md game-card neon-border',
    accent: 'border-accent/40 bg-gradient-to-br from-accent/15 via-accent/10 to-accent/5 backdrop-blur-md game-card',
    success: 'border-success/40 bg-gradient-to-br from-success/15 via-success/10 to-success/5 backdrop-blur-md game-card',
    secondary: 'border-muted/40 bg-gradient-to-br from-muted/15 via-muted/10 to-muted/5 backdrop-blur-md game-card'
  };

  const iconVariantStyles = {
    default: 'bg-gradient-to-br from-muted/60 to-muted/40 text-muted-foreground shadow-lg',
    primary: 'bg-gradient-to-br from-primary/30 to-primary/20 text-primary shadow-xl shadow-primary/30 neon-glow',
    accent: 'bg-gradient-to-br from-accent/30 to-accent/20 text-accent shadow-xl shadow-accent/30 neon-glow-accent',
    success: 'bg-gradient-to-br from-success/30 to-success/20 text-success shadow-xl shadow-success/30',
    secondary: 'bg-gradient-to-br from-muted/30 to-muted/20 text-muted-foreground shadow-lg'
  };

  const glowStyles = {
    default: '',
    primary: 'group-hover:shadow-[0_0_30px_hsl(var(--primary)/0.4)]',
    accent: 'group-hover:shadow-[0_0_30px_hsl(var(--accent)/0.4)]',
    success: 'group-hover:shadow-[0_0_30px_hsl(var(--success)/0.4)]',
    secondary: ''
  };

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:scale-[1.03] hover:-translate-y-1 group border-2",
      variantStyles[variant],
      glowStyles[variant]
    )}>
      {/* Animated shimmer effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </div>
      
      {/* Glowing corner accent */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/20 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Animated border glow */}
      <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className={cn(
          "absolute inset-0 rounded-lg blur-sm",
          variant === 'primary' ? 'bg-primary/20' : 
          variant === 'accent' ? 'bg-accent/20' : 
          variant === 'success' ? 'bg-success/20' : 'bg-border/20'
        )} />
      </div>
      
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4 relative z-10">
        <CardTitle className="text-xs font-bold text-muted-foreground/80 leading-tight uppercase tracking-widest">
          {title}
        </CardTitle>
        <div className={cn(
          "h-12 w-12 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-2xl relative",
          iconVariantStyles[variant],
          iconColor && `bg-[${iconColor}]/20 text-[${iconColor}]`
        )}>
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <Icon className="h-5 w-5 relative z-10" />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3 relative z-10">
        <div className="text-5xl font-black tracking-tight text-foreground bg-gradient-to-br from-foreground to-foreground/80 bg-clip-text text-transparent">
          {value}
        </div>
        {description && (
          <p className="text-sm text-muted-foreground/70 leading-relaxed font-medium">{description}</p>
        )}
        {trend && (
          <div className={cn(
            "flex items-center gap-2 text-xs font-bold mt-4 pt-3 border-t border-border/30",
            trend.isPositive ? 'text-success' : 'text-destructive'
          )}>
            <div className={cn(
              "h-6 w-6 rounded-full flex items-center justify-center shadow-lg",
              trend.isPositive ? 'bg-success/20 border border-success/40' : 'bg-destructive/20 border border-destructive/40'
            )}>
              <span className="text-sm font-bold">{trend.isPositive ? '↑' : '↓'}</span>
            </div>
            <span className="font-semibold">{trend.value}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
