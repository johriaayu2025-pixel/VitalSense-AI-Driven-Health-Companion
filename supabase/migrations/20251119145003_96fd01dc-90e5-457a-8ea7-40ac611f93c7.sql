-- Enable realtime for health_vitals table
ALTER TABLE public.health_vitals REPLICA IDENTITY FULL;

-- Add publication for realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.health_vitals;