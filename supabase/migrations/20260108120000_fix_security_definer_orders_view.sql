-- Fix security definer view for orders_with_items

DROP VIEW IF EXISTS public.orders_with_items;
CREATE VIEW public.orders_with_items WITH (security_invoker = on) AS
SELECT 
  o.id,
  o.customer_id,
  o.customer_name,
  o.customer_email,
  o.customer_phone,
  o.status,
  o.total,
  o.payment_method,
  o.shipping_address,
  o.notes,
  o.invoice_number,
  o.invoice_generated_at,
  o.created_at,
  o.updated_at,
  COALESCE(
    json_agg(
      json_build_object(
        'id', oi.id, 
        'name', oi.name, 
        'description', oi.description, 
        'quantity', oi.quantity, 
        'price', oi.price, 
        'total', oi.total
      )
    ) FILTER (WHERE oi.id IS NOT NULL), 
    '[]'::json
  ) AS items
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY 
  o.id, o.customer_id, o.customer_name, o.customer_email, 
  o.customer_phone, o.status, o.total, o.payment_method, 
  o.shipping_address, o.notes, o.invoice_number, 
  o.invoice_generated_at, o.created_at, o.updated_at;
