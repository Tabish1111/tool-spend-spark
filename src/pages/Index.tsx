import { useState } from "react";
import { 
  DollarSign, 
  TrendingUp, 
  Target,
  BarChart3,
  Upload,
  RefreshCw
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileUpload } from "@/components/dashboard/FileUpload";
import { ExportButtons } from "@/components/dashboard/ExportButtons";
import { 
  sampleToolData, 
  calculateKPIs, 
  getChartData,
  ToolData
} from "@/data/dashboardData";

const Index = () => {
  const [currentData, setCurrentData] = useState<ToolData[]>(sampleToolData);
  const [dataSource, setDataSource] = useState<'sample' | 'uploaded'>('sample');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  const handleDataUploaded = (uploadedData: ToolData[]) => {
    setCurrentData(uploadedData);
    setDataSource('uploaded');
    setUploadDialogOpen(false);
  };

  const handleUseSampleData = () => {
    setCurrentData(sampleToolData);
    setDataSource('sample');
  };

  const kpis = calculateKPIs(currentData);
  const chartData = getChartData(currentData);
  
  // Prepare data for Guna Honesty chart
  const gunaData = currentData.map(tool => ({
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
                {dataSource === 'uploaded' && (
                  <span className="ml-2 text-primary font-medium">• Using uploaded data</span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Upload className="h-4 w-4" />
                    Upload
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Upload Your Spreadsheet</DialogTitle>
                  </DialogHeader>
                  <FileUpload onDataUploaded={handleDataUploaded} />
                </DialogContent>
              </Dialog>
              
              {dataSource === 'uploaded' && (
                <Button variant="outline" size="sm" onClick={handleUseSampleData} className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Use Sample Data
                </Button>
              )}
              
              <ExportButtons data={currentData} filename="tool-dashboard" variant="compact" />
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
        <BudgetAlerts data={currentData} monthlyBudget={300} />

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
            <ExportButtons data={currentData} filename="tools-table" />
          </div>
          <ToolsTable data={currentData} />
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
