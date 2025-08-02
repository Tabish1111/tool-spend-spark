import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ChartCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  actions?: ReactNode;
}

export function ChartCard({ 
  title, 
  description, 
  children, 
  className,
  actions 
}: ChartCardProps) {
  return (
    <Card className={cn(
      "p-6 bg-gradient-to-br from-card to-card/80 border-border/50",
      "shadow-chart hover:shadow-lg transition-all duration-200",
      className
    )}>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-foreground">
              {title}
            </h3>
            {description && (
              <p className="text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
        <div className="h-[300px] w-full">
          {children}
        </div>
      </div>
    </Card>
  );
}