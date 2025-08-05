import { useState } from 'react';
import { Upload, Link } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileUpload } from './FileUpload';
import { GoogleSheetsUpload } from './GoogleSheetsUpload';
import { ToolData } from '@/data/dashboardData';

interface UploadOptionsProps {
  onDataUploaded: (data: ToolData[]) => void;
  onClose: () => void;
}

export function UploadOptions({ onDataUploaded, onClose }: UploadOptionsProps) {
  const [activeTab, setActiveTab] = useState('csv');

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="csv" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload CSV
          </TabsTrigger>
          <TabsTrigger value="sheets" className="flex items-center gap-2">
            <Link className="h-4 w-4" />
            Google Sheets
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="csv" className="mt-4">
          <FileUpload onDataUploaded={onDataUploaded} onClose={onClose} />
        </TabsContent>
        
        <TabsContent value="sheets" className="mt-4">
          <GoogleSheetsUpload onDataUploaded={onDataUploaded} onClose={onClose} />
        </TabsContent>
      </Tabs>
    </div>
  );
}