import { useState } from 'react';
import { AlertTriangle, CheckCircle, DollarSign, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCurrency } from '@/contexts/CurrencyContext';
import { ToolData } from '@/data/dashboardData';

interface BudgetAlertsProps {
  data: ToolData[];
  monthlyBudget?: number;
}

export function BudgetAlerts({ data, monthlyBudget = 300 }: BudgetAlertsProps) {
  const [perToolBudget, setPerToolBudget] = useState(50);
  const [yearlyBudget, setYearlyBudget] = useState(3600);
  const [showOverBudget, setShowOverBudget] = useState(false);
  const { formatCurrency, convertAmount } = useCurrency();

  if (data.length === 0) {
    return null;
  }

  // Calculate totals
  const totalYearly = convertAmount(data.reduce((sum, tool) => sum + (tool.monthlyCost * 12), 0));
  const budgetUsage = (totalYearly / yearlyBudget) * 100;

  // Identify tools over budget
  const overBudgetTools = data.filter(tool => convertAmount(tool.monthlyCost) > perToolBudget);

  // Generate alerts
  const alerts = [];

  if (budgetUsage > 100) {
    alerts.push({
      type: 'high' as const,
      title: 'Budget Exceeded',
      message: `Total yearly cost (${formatCurrency(totalYearly)}) exceeds budget by ${formatCurrency(totalYearly - yearlyBudget)}`,
      icon: AlertTriangle
    });
  } else if (budgetUsage > 80) {
    alerts.push({
      type: 'medium' as const,
      title: 'Budget Warning',
      message: `Using ${budgetUsage.toFixed(1)}% of yearly budget`,
      icon: AlertTriangle
    });
  }

  if (overBudgetTools.length > 0) {
    alerts.push({
      type: 'medium' as const,
      title: 'Tools Over Budget',
      message: `${overBudgetTools.length} tools exceed per-tool budget of ${formatCurrency(perToolBudget)}`,
      icon: DollarSign
    });
  }

  const severityConfig = {
    high: {
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
      borderColor: 'border-destructive/20',
      icon: AlertTriangle
    },
    medium: {
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      borderColor: 'border-warning/20',
      icon: AlertTriangle
    },
    low: {
      color: 'text-info',
      bgColor: 'bg-info/10',
      borderColor: 'border-info/20',
      icon: Calendar
    }
  };

  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-success" />
            Budget Status - All Good!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-success/20 bg-success/10">
            <CheckCircle className="h-4 w-4 text-success" />
            <AlertDescription>
              No budget alerts. Your tool spending is within the defined limits.
            </AlertDescription>
          </Alert>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="space-y-2">
              <Label htmlFor="per-tool-budget">Budget per Tool</Label>
              <Input
                id="per-tool-budget"
                type="number"
                value={perToolBudget}
                onChange={(e) => setPerToolBudget(Number(e.target.value))}
                placeholder="50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="yearly-budget">Total Budget (per year)</Label>
              <Input
                id="yearly-budget"
                type="number"
                value={yearlyBudget}
                onChange={(e) => setYearlyBudget(Number(e.target.value))}
                placeholder="3600"
              />
            </div>
            <div className="space-y-2">
              <Label>Budget Usage</Label>
              <div className="text-2xl font-semibold text-success">
                {budgetUsage.toFixed(1)}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-warning" />
          Budget Alerts ({alerts.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Alert Summary */}
        <div className="space-y-3">
          {alerts.map((alert, index) => {
            const config = severityConfig[alert.type];
            return (
              <Alert key={index} className={`${config.borderColor} ${config.bgColor}`}>
                <config.icon className={`h-4 w-4 ${config.color}`} />
                <AlertDescription>
                  <span className="font-medium">{alert.title}:</span> {alert.message}
                </AlertDescription>
              </Alert>
            );
          })}
        </div>

        {/* Budget Controls - PRD Required Input Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
          <div className="space-y-2">
            <Label htmlFor="per-tool-budget">Budget per tool</Label>
            <Input
              id="per-tool-budget"
              type="number"
              value={perToolBudget}
              onChange={(e) => setPerToolBudget(Number(e.target.value))}
              placeholder="50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="yearly-budget">Total Budget (per year)</Label>
            <Input
              id="yearly-budget"
              type="number"
              value={yearlyBudget}
              onChange={(e) => setYearlyBudget(Number(e.target.value))}
              placeholder="3600"
            />
          </div>
          <div className="space-y-2">
            <Label>Budget Usage</Label>
            <div className={`text-2xl font-semibold ${budgetUsage > 100 ? 'text-destructive' : budgetUsage > 80 ? 'text-warning' : 'text-success'}`}>
              {budgetUsage.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Tools Over Budget - PRD Required Alert */}
        {overBudgetTools.length > 0 && (
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowOverBudget(!showOverBudget)}
              className="w-full justify-between"
            >
              Tools Over Budget ({overBudgetTools.length})
              <span>{showOverBudget ? '−' : '+'}</span>
            </Button>
            {showOverBudget && (
              <div className="space-y-2 pl-4 border-l-2 border-warning">
                {overBudgetTools.map(tool => (
                  <div key={tool.id} className="flex items-center justify-between p-2 bg-warning/5 rounded">
                    <span className="font-medium">{tool.name}</span>
                    <Badge variant="destructive">
                      {formatCurrency(convertAmount(tool.monthlyCost))}/month
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}