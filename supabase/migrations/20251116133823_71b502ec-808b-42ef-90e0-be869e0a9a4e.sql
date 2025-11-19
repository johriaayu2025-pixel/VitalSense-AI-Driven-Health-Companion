-- Create medical_scans table for storing scan history
CREATE TABLE IF NOT EXISTS public.medical_scans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  document_type TEXT,
  notes TEXT,
  analysis TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.medical_scans ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own scans" 
ON public.medical_scans 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scans" 
ON public.medical_scans 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own scans" 
ON public.medical_scans 
FOR DELETE 
USING (auth.uid() = user_id);