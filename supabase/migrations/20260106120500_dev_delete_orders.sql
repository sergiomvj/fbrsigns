-- Allow customers to delete their own orders (DEV MODE)
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

-- Allow customers to delete their own order items (via order ownership)
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
