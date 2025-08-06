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
import { UploadOptions } from "@/components/dashboard/UploadOptions";
import { ExportButtons } from "@/components/dashboard/ExportButtons";
import { CurrencyToggle } from "@/components/dashboard/CurrencyToggle";
import { useCurrency } from "@/contexts/CurrencyContext";
import { 
  sampleToolData, 
  calculateKPIs, 
  getChartData,
  ToolData
} from "@/data/dashboardData";

const Index = () => {
  const [currentData, setCurrentData] = useState<ToolData[]>([]);
  const [dataSource, setDataSource] = useState<'none' | 'uploaded' | 'google-sheets'>('none');
  const [connectedSheetUrl, setConnectedSheetUrl] = useState<string>('');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const { formatCurrency } = useCurrency();

  const handleDataUploaded = (uploadedData: ToolData[], source: 'csv' | 'google-sheets' = 'csv', sheetUrl?: string) => {
    setCurrentData(uploadedData);
    setDataSource(source === 'google-sheets' ? 'google-sheets' : 'uploaded');
    if (sheetUrl) setConnectedSheetUrl(sheetUrl);
    setUploadDialogOpen(false);
  };

  const handleRefreshData = async () => {
    if (dataSource === 'google-sheets' && connectedSheetUrl) {
      try {
        // Extract sheet ID and format URL
        const extractSheetId = (url: string): string | null => {
          const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
          return match ? match[1] : null;
        };
        
        const formatGoogleSheetsUrl = (sheetId: string): string => {
          return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
        };
        
        const sheetId = extractSheetId(connectedSheetUrl);
        if (!sheetId) throw new Error('Invalid Google Sheets URL');
        
        const csvUrl = formatGoogleSheetsUrl(sheetId);
        const response = await fetch(csvUrl);
        if (!response.ok) throw new Error('Failed to fetch Google Sheets data');
        
        const csvText = await response.text();
        const { parseCSV } = await import('@/utils/fileProcessing');
        const blob = new Blob([csvText], { type: 'text/csv' });
        const file = new File([blob], 'google-sheet.csv', { type: 'text/csv' });
        const result = await parseCSV(file);
        
        if (result.errors.length > 0) {
          throw new Error(`Data parsing errors: ${result.errors.join(', ')}`);
        }
        
        setCurrentData(result.data);
      } catch (error) {
        console.error('Failed to refresh data:', error);
      }
    }
  };

  // Show no data state when no data is loaded
  const hasData = currentData.length > 0;

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
                 {dataSource === 'google-sheets' && (
                   <span className="ml-2 text-primary font-medium">• Connected to Google Sheets</span>
                 )}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <CurrencyToggle />
              
              <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Upload className="h-4 w-4" />
                    Upload Data
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Import Your Data</DialogTitle>
                  </DialogHeader>
                  <UploadOptions onDataUploaded={handleDataUploaded} onClose={() => setUploadDialogOpen(false)} />
                </DialogContent>
              </Dialog>
              
              {dataSource === 'google-sheets' && (
                <Button variant="outline" size="sm" onClick={handleRefreshData} className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Refresh Data
                </Button>
              )}
              
              <ExportButtons data={currentData} filename="tool-dashboard" variant="compact" />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {!hasData ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className="text-center">
              <h3 className="text-2xl font-semibold mb-2">No Data Available</h3>
              <p className="text-muted-foreground mb-6">Upload your tool data to get started with the dashboard analysis</p>
              <Button onClick={() => setUploadDialogOpen(true)} className="gap-2">
                <Upload className="h-4 w-4" />
                Upload Data
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* KPI Cards - Only show the required 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-export-id="kpi-cards">
              <KPICard
                title="Total Monthly Cost"
                value={formatCurrency(kpis.totalMonthly)}
                subtitle="across all tools"
                icon={DollarSign}
                trend={{ value: 12, label: "vs last month" }}
                variant="default"
              />
              <KPICard
                title="Total Yearly Cost"
                value={formatCurrency(kpis.totalYearly)}
                subtitle="projected annual spend"
                icon={TrendingUp}
                trend={{ value: -5, label: "vs last year" }}
                variant="success"
              />
            </div>

            {/* Charts - Only show the required 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div data-export-id="cost-by-tool-chart">
                <CostByToolChart data={chartData.costByTool} />
              </div>
              <div data-export-id="cost-by-person-chart">
                <CostByPersonChart data={chartData.costByPerson} />
              </div>
            </div>

            {/* Budget Alerts */}
            <div data-export-id="budget-alerts">
              <BudgetAlerts data={currentData} monthlyBudget={300} />
            </div>

            {/* Detailed Table */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Detailed Tool Analysis</h2>
                <ExportButtons data={currentData} filename="tools-table" />
              </div>
              <div data-export-id="tools-table">
                <ToolsTable data={currentData} />
              </div>
            </div>

            {/* Footer */}
            <div className="pt-8 border-t">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Last updated: {new Date().toLocaleDateString()}
                  {dataSource === 'google-sheets' && ' • Connected to Google Sheets'}
                </p>
                {dataSource === 'google-sheets' && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                    Live sync enabled
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
