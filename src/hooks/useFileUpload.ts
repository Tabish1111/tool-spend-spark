import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { parseCSV, validateToolData, ParseResult } from '@/utils/fileProcessing';
import { ToolData } from '@/data/dashboardData';
import { useToast } from '@/hooks/use-toast';

export function useFileUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const uploadFile = async (file: File): Promise<{ success: boolean; data?: ToolData[] }> => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Validate file type
      if (!file.name.toLowerCase().endsWith('.csv')) {
        throw new Error('Please upload a CSV file');
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        throw new Error('File size must be less than 10MB');
      }

      setUploadProgress(25);

      // Parse the CSV file
      const parseResult: ParseResult = await parseCSV(file);
      
      if (parseResult.errors.length > 0) {
        throw new Error(`Parse errors: ${parseResult.errors.join(', ')}`);
      }

      setUploadProgress(50);

      // Validate the parsed data
      const validation = validateToolData(parseResult.data);
      if (!validation.isValid) {
        throw new Error(`Validation errors: ${validation.errors.join(', ')}`);
      }

      setUploadProgress(75);

      // Upload file to Supabase Storage
      const fileName = `${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('spreadsheets')
        .upload(fileName, file);

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      setUploadProgress(100);

      toast({
        title: "Upload Successful",
        description: `Processed ${parseResult.data.length} tools from your spreadsheet`,
      });

      return { success: true, data: parseResult.data };

    } catch (error) {
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });

      return { success: false };
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return {
    uploadFile,
    isUploading,
    uploadProgress
  };
}