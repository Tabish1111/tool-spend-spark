import { Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { downloadCSV, downloadJSON, downloadPDF } from '@/utils/exportUtils';
import { useToast } from '@/hooks/use-toast';
import { ToolData } from '@/data/dashboardData';

interface ExportButtonsProps {
  data: ToolData[];
  filename?: string;
  variant?: 'full' | 'compact';
}

export function ExportButtons({ 
  data, 
  filename = "tool-data", 
  variant = "full" 
}: ExportButtonsProps) {
  const { toast } = useToast();

  const handleExportCSV = () => {
    downloadCSV(data, filename);
  };

  const handleExportJSON = () => {
    downloadJSON(data, filename);
  };

  const handleExportPDF = async () => {
    try {
      toast({
        title: "Generating PDF...",
        description: "Please wait while we create your dashboard report.",
      });
      await downloadPDF(filename);
      toast({
        title: "PDF Generated",
        description: "Your dashboard report has been downloaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error generating the PDF report.",
        variant: "destructive",
      });
    }
  };

  if (variant === 'compact') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleExportPDF}>
            <FileText className="h-4 w-4 mr-2" />
            Export as PDF
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export as CSV
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportJSON}>
            <Download className="h-4 w-4 mr-2" />
            Export as JSON
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export Data
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportPDF}>
          <FileText className="h-4 w-4 mr-2" />
          Download as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportCSV}>
          <Download className="h-4 w-4 mr-2" />
          Download as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportJSON}>
          <Download className="h-4 w-4 mr-2" />
          Download as JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}