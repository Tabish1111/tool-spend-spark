import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, TrendingUp, DollarSign, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { ToolData } from "@/data/dashboardData";
import { cn } from "@/lib/utils";

interface BudgetAlertsProps {
  data: ToolData[];
  monthlyBudget?: number;
}

export function BudgetAlerts({ data, monthlyBudget = 300 }: BudgetAlertsProps) {
  const [perToolBudget, setPerToolBudget] = useState<number>(50);
  const [showOverBudgetTools, setShowOverBudgetTools] = useState(false);
  const [showLowUtilityTools, setShowLowUtilityTools] = useState(false);
  
  const totalMonthly = data.reduce((sum, tool) => sum + tool.monthlyCost, 0);
  const budgetUsage = (totalMonthly / monthlyBudget) * 100;
  const overBudgetTools = data.filter(tool => tool.isOverBudget);
  const expensiveTools = data.filter(tool => tool.monthlyCost > perToolBudget);
  const lowUtilityTools = data.filter(tool => tool.gunaHonestyMeter < 5);
  
  // Tools renewing soon (within 30 days)
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const renewingSoon = data.filter(tool => {
    const renewalDate = new Date(tool.renewalDate);
    return renewalDate <= thirtyDaysFromNow && renewalDate >= now;
  });

  const alerts = [
    ...(budgetUsage > 80 ? [{
      type: 'budget' as const,
      severity: budgetUsage > 100 ? 'high' as const : 'medium' as const,
      title: budgetUsage > 100 ? 'Budget Exceeded' : 'Budget Warning',
      description: `${budgetUsage.toFixed(1)}% of monthly budget used ($${totalMonthly.toFixed(2)} / $${monthlyBudget})`,
      action: 'Review Spending'
    }] : []),
    
    ...(expensiveTools.length > 0 ? [{
      type: 'overbudget' as const,
      severity: 'high' as const,
      title: 'Tools Over Budget',
      description: `${expensiveTools.length} tool(s) exceed $${perToolBudget} per tool budget`,
      action: 'Review Tools'
    }] : []),
    
    ...(renewingSoon.length > 0 ? [{
      type: 'renewal' as const,
      severity: 'medium' as const,
      title: 'Upcoming Renewals',
      description: `${renewingSoon.length} subscription(s) renewing within 30 days`,
      action: 'Check Renewals'
    }] : []),
    
    ...(lowUtilityTools.length > 0 ? [{
      type: 'utility' as const,
      severity: 'low' as const,
      title: 'Low Utility Tools',
      description: `${lowUtilityTools.length} tool(s) with Guna Honesty Score < 5`,
      action: 'Review Necessity'
    }] : [])
  ];

  const severityConfig = {
    high: {
      color: 'destructive',
      icon: AlertTriangle,
      bg: 'bg-destructive/5 border-destructive/20'
    },
    medium: {
      color: 'warning',
      icon: TrendingUp,
      bg: 'bg-warning/5 border-warning/20'
    },
    low: {
      color: 'secondary',
      icon: DollarSign,
      bg: 'bg-muted/50 border-border'
    }
  };

  if (alerts.length === 0) {
    return (
      <Card className="p-6 bg-gradient-to-br from-success/5 to-success/10 border-success/20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-success/10">
            <DollarSign className="h-5 w-5 text-success" />
          </div>
          <div>
            <h3 className="font-semibold text-success">All Good!</h3>
            <p className="text-sm text-muted-foreground">
              No budget alerts or issues detected.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Budget Alerts</h3>
          <Badge variant="outline" className="gap-1">
            <AlertTriangle className="h-3 w-3" />
            {alerts.length} Alert{alerts.length > 1 ? 's' : ''}
          </Badge>
        </div>
        
        {/* Per Tool Budget Input */}
        <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
          <Label htmlFor="per-tool-budget" className="text-sm font-medium">
            Budget per tool:
          </Label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">$</span>
            <Input
              id="per-tool-budget"
              type="number"
              value={perToolBudget}
              onChange={(e) => setPerToolBudget(Number(e.target.value) || 0)}
              className="w-24 h-8"
              min="0"
              step="10"
            />
            <span className="text-sm text-muted-foreground">/month</span>
          </div>
        </div>
        
        <div className="space-y-3">
          {alerts.map((alert, index) => {
            const config = severityConfig[alert.severity];
            const Icon = config.icon;
            
            return (
              <div 
                key={index}
                className={cn(
                  "p-4 rounded-lg border",
                  config.bg
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      alert.severity === 'high' ? 'bg-destructive/10' :
                      alert.severity === 'medium' ? 'bg-warning/10' :
                      'bg-muted'
                    )}>
                      <Icon className={cn(
                        "h-4 w-4",
                        alert.severity === 'high' ? 'text-destructive' :
                        alert.severity === 'medium' ? 'text-warning' :
                        'text-muted-foreground'
                      )} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-medium text-foreground">
                        {alert.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {alert.description}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="shrink-0"
                    onClick={() => {
                      if (alert.type === 'overbudget') {
                        setShowOverBudgetTools(!showOverBudgetTools);
                      } else if (alert.type === 'utility') {
                        setShowLowUtilityTools(!showLowUtilityTools);
                      }
                    }}
                  >
                    {alert.action}
                    {(alert.type === 'overbudget' && showOverBudgetTools) || 
                     (alert.type === 'utility' && showLowUtilityTools) ? 
                      <ChevronUp className="h-3 w-3 ml-1" /> : 
                      <ChevronDown className="h-3 w-3 ml-1" />
                    }
                  </Button>
                </div>
              </div>
            );
          })}
          </div>
        
        {/* Over Budget Tools List */}
        {showOverBudgetTools && expensiveTools.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Tools Over ${perToolBudget}/month Budget
            </h4>
            <div className="space-y-2">
              {expensiveTools.map((tool) => (
                <div 
                  key={tool.id}
                  className="flex items-center justify-between p-3 bg-destructive/5 border border-destructive/20 rounded-lg"
                >
                  <div>
                    <span className="font-medium">{tool.name}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      ({tool.category})
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-medium text-destructive">
                      ${tool.monthlyCost}/month
                    </span>
                    <div className="text-xs text-muted-foreground">
                      ${(tool.monthlyCost - perToolBudget).toFixed(2)} over budget
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Low Utility Tools List */}
        {showLowUtilityTools && lowUtilityTools.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Low Utility Tools (Guna Score &lt; 5)
            </h4>
            <div className="space-y-2">
              {lowUtilityTools.map((tool) => (
                <div 
                  key={tool.id}
                  className="flex items-center justify-between p-3 bg-warning/5 border border-warning/20 rounded-lg"
                >
                  <div>
                    <span className="font-medium">{tool.name}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      ({tool.category})
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-medium text-warning">
                      Score: {tool.gunaHonestyMeter}/10
                    </span>
                    <div className="text-xs text-muted-foreground">
                      ${tool.monthlyCost}/month
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {renewingSoon.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Upcoming Renewals
            </h4>
            <div className="space-y-2">
              {renewingSoon.map((tool) => (
                <div 
                  key={tool.id}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                >
                  <div>
                    <span className="font-medium">{tool.name}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      ${tool.monthlyCost}/month
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date(tool.renewalDate).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}