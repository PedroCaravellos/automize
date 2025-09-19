-- Add missing segmento column to negocios table
ALTER TABLE public.negocios 
ADD COLUMN segmento text;