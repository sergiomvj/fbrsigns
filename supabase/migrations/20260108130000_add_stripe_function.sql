-- Create get_stripe_publishable_key function
-- This function allows the frontend to retrieve the Stripe Publishable Key
-- It needs SECURITY DEFINER to access the integrations table which is restricted to admins

CREATE OR REPLACE FUNCTION public.get_stripe_publishable_key()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  pub_key text;
BEGIN
  SELECT config->>'publishable_key' INTO pub_key
  FROM public.integrations
  WHERE provider = 'stripe' AND is_active = true
  LIMIT 1;
  
  RETURN pub_key;
END;
$$;

-- Grant execute permission to everyone so customers can initiate payments
GRANT EXECUTE ON FUNCTION public.get_stripe_publishable_key() TO anon, authenticated, service_role;
