-- =================================================================
-- FIX ALL DATABASE ISSUES (Orders & Customers)
-- Run this script in Supabase SQL Editor to resolve all errors.
-- =================================================================

-- 1. FIX CUSTOMERS TABLE (Registration Error)
-- Ensure 'id' is auto-generated so registration doesn't fail with "null value"
ALTER TABLE public.customers ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- 2. FIX ORDERS TABLE (Status Error)
-- Remove old restrictive constraint
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;

-- Add new constraint allowing Portuguese statuses
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check 
CHECK (status IN (
  'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', -- English
  'Pendente', 'Processando', 'Enviado', 'Entregue', 'Cancelado', -- Portuguese Standard
  'Novo', 'Confirmado', 'Aguardando Pagamento', 'Em Produção', 'Concluído' -- Portuguese Business Logic
));

-- 3. ENABLE DELETION (For Testing)
-- Allow customers to delete their own orders
DROP POLICY IF EXISTS "Customers can delete own orders" ON public.orders;
CREATE POLICY "Customers can delete own orders"
ON public.orders
FOR DELETE
USING (
  auth.uid() IS NOT NULL
  AND (
    (customer_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.customers
      WHERE customers.id = orders.customer_id
      AND customers.user_id = auth.uid()
    ))
    OR (customer_email = (
      SELECT email FROM auth.users WHERE id = auth.uid()
    ))
  )
);

-- Allow customers to delete their own order items
DROP POLICY IF EXISTS "Customers can delete own order items" ON public.order_items;
CREATE POLICY "Customers can delete own order items"
ON public.order_items
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
    AND (
      (orders.customer_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.customers
        WHERE customers.id = orders.customer_id
        AND customers.user_id = auth.uid()
      ))
      OR (orders.customer_email = (
        SELECT email FROM auth.users WHERE id = auth.uid()
      ))
    )
  )
);
