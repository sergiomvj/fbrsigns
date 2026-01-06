-- Fix customers table id column to auto-generate UUIDs
-- This resolves the "null value in column id" error when creating a new customer via auth trigger
ALTER TABLE public.customers ALTER COLUMN id SET DEFAULT gen_random_uuid();
