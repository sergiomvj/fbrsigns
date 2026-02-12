import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { createOrder, CreateOrderData, OrderItem } from "@/services/orderService";
import { Loader2 } from "lucide-react";

interface CheckoutWithOrderProps {
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    size?: string;
    color?: string;
    image?: string;
  }>;
  customerData: {
    email: string;
    name: string;
    phone?: string;
  };
  shippingAddress: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  buttonText?: string;
  className?: string;
}

export function CheckoutWithOrder({
  items,
  customerData,
  shippingAddress,
  buttonText = "Finalizar Compra",
  className = "w-full"
}: CheckoutWithOrderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCheckout = async () => {
    setIsLoading(true);
    
    try {
      console.log("[Checkout] Iniciando processo de compra...");

      // 1. Calcular total
      const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      // 2. Preparar itens do pedido
      const orderItems: OrderItem[] = items.map(item => ({
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
        size: item.size,
        color: item.color,
        image_url: item.image,
      }));

      // 3. Criar pedido no banco
      const orderData: CreateOrderData = {
        customer_email: customerData.email,
        customer_name: customerData.name,
        customer_phone: customerData.phone,
        items: orderItems,
        shipping_address: shippingAddress,
        total: total,
      };

      console.log("[Checkout] Criando pedido...", orderData);
      
      const { order, error: orderError } = await createOrder(orderData);

      if (orderError || !order) {
        throw new Error(orderError?.message || "Erro ao criar pedido");
      }

      console.log("[Checkout] ✅ Pedido criado:", order.id);

      // 4. Criar sessão de checkout Stripe COM o order_id
      const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke(
        "create-checkout-session",
        {
          body: {
            items: items.map(item => ({
              name: item.name,
              amount: Math.round(item.price * 100), // Converter para cents
              quantity: item.quantity,
            })),
            customer_email: customerData.email,
            success_url: `${window.location.origin}/payment-success?order_id=${order.id}`,
            cancel_url: `${window.location.origin}/payment-cancel?order_id=${order.id}`,
            metadata: {
              order_id: order.id, // ← ESSENCIAL para o webhook!
              customer_name: customerData.name,
              customer_email: customerData.email,
            }
          },
        }
      );

      if (checkoutError) {
        console.error("[Checkout] Erro ao criar sessão:", checkoutError);
        throw checkoutError;
      }

      if (!checkoutData?.url) {
        throw new Error("URL de checkout não retornada");
      }

      console.log("[Checkout] ✅ Redirecionando para Stripe...");

      // 5. Redirecionar para Stripe
      window.location.href = checkoutData.url;

    } catch (error: any) {
      console.error("[Checkout] Erro:", error);
      toast({
        title: "Erro no checkout",
        description: error.message || "Não foi possível processar seu pedido. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleCheckout}
      disabled={isLoading || items.length === 0}
      className={className}
      size="lg"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processando...
        </>
      ) : (
        buttonText
      )}
    </Button>
  );
}
