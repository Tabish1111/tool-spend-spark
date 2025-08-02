import { 
  DollarSign, 
  TrendingUp, 
  Target,
  BarChart3,
  Download,
  RefreshCw,
  Settings
} from "lucide-react";
import { KPICard } from "@/components/dashboard/KPICard";
import { ToolsTable } from "@/components/dashboard/ToolsTable";
import { BudgetAlerts } from "@/components/dashboard/BudgetAlerts";
import { 
  CostByToolChart, 
  CostByPersonChart, 
  NeedVsWantChart,
  GunaHonestyTrend 
} from "@/components/dashboard/Charts";
import { Button } from "@/components/ui/button";
import { 
  sampleToolData, 
  calculateKPIs, 
  getChartData 
} from "@/data/dashboardData";

const Index = () => {
  const kpis = calculateKPIs(sampleToolData);
  const chartData = getChartData(sampleToolData);
  
  // Prepare data for Guna Honesty chart
  const gunaData = sampleToolData.map(tool => ({
    name: tool.name,
    honesty: tool.gunaHonestyMeter
  }));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Tool Cost Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Comprehensive analysis of team tool spending and utilization
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Sync Data
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Total Monthly Cost"
            value={`$${kpis.totalMonthly.toFixed(2)}`}
            subtitle="across all tools"
            icon={DollarSign}
            trend={{ value: 12, label: "vs last month" }}
            variant="default"
          />
          <KPICard
            title="Total Yearly Cost"
            value={`$${kpis.totalYearly.toFixed(0)}`}
            subtitle="projected annual spend"
            icon={TrendingUp}
            trend={{ value: -5, label: "vs last year" }}
            variant="success"
          />
          <KPICard
            title="Avg Guna Honesty"
            value={kpis.averageGunaHonesty.toFixed(1)}
            subtitle="out of 10.0"
            icon={Target}
            trend={{ value: 8, label: "improvement" }}
            variant="warning"
          />
          <KPICard
            title="Tool Distribution"
            value={`${kpis.needCount} / ${kpis.wantCount}`}
            subtitle="Need vs Want tools"
            icon={BarChart3}
            variant="default"
          />
        </div>

        {/* Budget Alerts */}
        <BudgetAlerts data={sampleToolData} monthlyBudget={300} />

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CostByToolChart data={chartData.costByTool} />
          <CostByPersonChart data={chartData.costByPerson} />
          <NeedVsWantChart data={chartData.needVsWant} />
          <GunaHonestyTrend data={gunaData} />
        </div>

        {/* Detailed Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Detailed Tool Analysis</h2>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export Table
            </Button>
          </div>
          <ToolsTable data={sampleToolData} />
        </div>

        {/* Footer */}
        <div className="pt-8 border-t">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()} • Connected to Google Sheets
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              Live sync enabled
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
