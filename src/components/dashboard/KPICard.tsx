import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  variant?: 'default' | 'success' | 'warning' | 'danger';
  className?: string;
}

export function KPICard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  variant = 'default',
  className 
}: KPICardProps) {
  const variantStyles = {
    default: 'border-border bg-card',
    success: 'border-success/20 bg-gradient-to-br from-success/5 to-success/10',
    warning: 'border-warning/20 bg-gradient-to-br from-warning/5 to-warning/10',
    danger: 'border-destructive/20 bg-gradient-to-br from-destructive/5 to-destructive/10'
  };

  const iconStyles = {
    default: 'text-primary',
    success: 'text-success',
    warning: 'text-warning', 
    danger: 'text-destructive'
  };

  return (
    <Card className={cn(
      "relative p-6 transition-all duration-200 hover:shadow-lg",
      "bg-gradient-to-br from-card to-card/80",
      "border border-border/50",
      variantStyles[variant],
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            {title}
          </p>
          <div className="space-y-1">
            <p className="text-3xl font-bold text-foreground">
              {value}
            </p>
            {subtitle && (
              <p className="text-sm text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>
          {trend && (
            <div className="flex items-center gap-2">
              <span className={cn(
                "text-xs font-medium px-2 py-1 rounded-full",
                trend.value > 0 
                  ? "bg-success/10 text-success" 
                  : trend.value < 0 
                    ? "bg-destructive/10 text-destructive"
                    : "bg-muted text-muted-foreground"
              )}>
                {trend.value > 0 ? '+' : ''}{trend.value}%
              </span>
              <span className="text-xs text-muted-foreground">
                {trend.label}
              </span>
            </div>
          )}
        </div>
        <div className={cn(
          "p-3 rounded-xl bg-background/50 backdrop-blur-sm",
          iconStyles[variant]
        )}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </Card>
  );
}