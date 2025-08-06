import { useState } from 'react';
import { Link, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { ToolData } from '@/data/dashboardData';
import { parseCSV, processCSVData } from '@/utils/fileProcessing';

interface GoogleSheetsUploadProps {
  onDataUploaded: (data: ToolData[], source?: 'csv' | 'google-sheets', sheetUrl?: string) => void;
  onClose: () => void;
}

export function GoogleSheetsUpload({ onDataUploaded, onClose }: GoogleSheetsUploadProps) {
  const [sheetUrl, setSheetUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [connectedSheet, setConnectedSheet] = useState<string | null>(null);
  const { toast } = useToast();

  const extractSheetId = (url: string): string | null => {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
  };

  const formatGoogleSheetsUrl = (sheetId: string): string => {
    return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0`;
  };

  const fetchGoogleSheetData = async (url: string): Promise<ToolData[]> => {
    const sheetId = extractSheetId(url);
    if (!sheetId) {
      throw new Error('Invalid Google Sheets URL. Please provide a valid sharing link.');
    }

    const csvUrl = formatGoogleSheetsUrl(sheetId);
    
    try {
      const response = await fetch(csvUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch data from Google Sheets. Make sure the sheet is publicly accessible.');
      }

      const csvText = await response.text();
      const blob = new Blob([csvText], { type: 'text/csv' });
      const file = new File([blob], 'google-sheet.csv', { type: 'text/csv' });

      const parseResult = await parseCSV(file);
      if (parseResult.errors.length > 0) {
        throw new Error('Failed to parse CSV data from Google Sheets');
      }

      const processResult = processCSVData(parseResult.data);
      if (processResult.errors.length > 0) {
        throw new Error(`Data processing errors: ${processResult.errors.join(', ')}`);
      }

      return processResult.data;
    } catch (error) {
      console.error('Error fetching Google Sheets data:', error);
      throw error;
    }
  };

  const handleConnect = async () => {
    if (!sheetUrl.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a Google Sheets URL",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const data = await fetchGoogleSheetData(sheetUrl);
      setConnectedSheet(sheetUrl);
      onDataUploaded(data, 'google-sheets', sheetUrl);
      toast({
        title: "Connected Successfully",
        description: `Imported ${data.length} tools from Google Sheets`,
      });
      onClose();
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect to Google Sheets",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!connectedSheet) return;
    
    setIsLoading(true);
    try {
      const data = await fetchGoogleSheetData(connectedSheet);
      onDataUploaded(data, 'google-sheets', connectedSheet);
      toast({
        title: "Data Refreshed",
        description: `Updated with ${data.length} tools from Google Sheets`,
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: error instanceof Error ? error.message : "Failed to refresh data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link className="h-5 w-5" />
          Connect Google Sheets
        </CardTitle>
        <CardDescription>
          Import data directly from a Google Sheets document
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            <strong>Setup Instructions:</strong>
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>Open your Google Sheets document</li>
              <li>Click "Share" and set to "Anyone with the link can view"</li>
              <li>Copy the sharing link and paste it below</li>
            </ol>
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Input
            placeholder="https://docs.google.com/spreadsheets/d/..."
            value={sheetUrl}
            onChange={(e) => setSheetUrl(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handleConnect} 
            disabled={isLoading || !sheetUrl.trim()}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Link className="h-4 w-4 mr-2" />
                Connect Sheet
              </>
            )}
          </Button>
          
          {connectedSheet && (
            <Button 
              variant="outline" 
              onClick={handleRefresh} 
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>

        {connectedSheet && (
          <Alert>
            <AlertDescription>
              Connected to: {connectedSheet.substring(0, 50)}...
            </AlertDescription>
          </Alert>
        )}

        <Alert>
          <AlertDescription>
            <strong>Required CSV format:</strong> Tool Name, Accounts, Monthly Cost, Assigned Person, Category, Guna Honesty Meter, Renewal Date, Notes
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}