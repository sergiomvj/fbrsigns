-- Drop the existing constraint if it exists (to fix the unknown value issue)
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;

-- Recreate the constraint with a known list of allowed values
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check 
CHECK (status IN (
  'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', -- English
  'Pendente', 'Processando', 'Enviado', 'Entregue', 'Cancelado', -- Portuguese Standard
  'Novo', 'Confirmado', 'Aguardando Pagamento', 'Em Produção', 'Concluído' -- Portuguese Business Logic
));
