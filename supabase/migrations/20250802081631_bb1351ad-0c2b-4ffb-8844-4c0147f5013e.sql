-- Create storage bucket for spreadsheet uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('spreadsheets', 'spreadsheets', true);

-- Create policies for spreadsheet uploads
CREATE POLICY "Users can upload spreadsheets" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'spreadsheets');

CREATE POLICY "Users can view spreadsheets" ON storage.objects
FOR SELECT USING (bucket_id = 'spreadsheets');

CREATE POLICY "Users can update spreadsheets" ON storage.objects
FOR UPDATE USING (bucket_id = 'spreadsheets');

CREATE POLICY "Users can delete spreadsheets" ON storage.objects
FOR DELETE USING (bucket_id = 'spreadsheets');