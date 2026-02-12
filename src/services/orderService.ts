// Order Service - Gerenciamento de pedidos
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

export interface OrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  size?: string;
  color?: string;
  image_url?: string;
}

export interface ShippingAddress {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface CreateOrderData {
  customer_id?: string;
  customer_email: string;
  customer_name: string;
  customer_phone?: string;
  items: OrderItem[];
  shipping_address: ShippingAddress;
  total: number;
  notes?: string;
}

export interface Order {
  id: string;
  status: 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  payment_status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  created_at: string;
  updated_at: string;
  customer_email: string;
  customer_name: string;
  customer_phone?: string;
  total: number;
  shipping_address: ShippingAddress;
  items?: OrderItem[];
  tracking_code?: string;
  tracking_url?: string;
  notes?: string;
}

/**
 * Cria um novo pedido no banco de dados
 */
export async function createOrder(data: CreateOrderData): Promise<{ order: Order | null; error: Error | null }> {
  try {
    console.log("[Order Service] Criando pedido...", data);

    const orderId = uuidv4();
    const now = new Date().toISOString();

    // Criar o pedido
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        id: orderId,
        customer_id: data.customer_id || null,
        customer_email: data.customer_email,
        customer_name: data.customer_name,
        customer_phone: data.customer_phone || null,
        status: "PENDING",
        payment_status: "PENDING",
        total: data.total,
        shipping_address: data.shipping_address,
        notes: data.notes || null,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (orderError) {
      console.error("[Order Service] Erro ao criar pedido:", orderError);
      throw orderError;
    }

    // Criar os itens do pedido
    const orderItems = data.items.map(item => ({
      order_id: orderId,
      product_id: item.product_id,
      product_name: item.product_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
      size: item.size || null,
      color: item.color || null,
      image_url: item.image_url || null,
      created_at: now,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("[Order Service] Erro ao criar itens:", itemsError);
      // Tentar deletar o pedido se os itens falharem
      await supabase.from("orders").delete().eq("id", orderId);
      throw itemsError;
    }

    // Criar histórico inicial
    await createOrderStatusHistory(orderId, "PENDING", "Pedido criado");

    console.log("[Order Service] ✅ Pedido criado com sucesso:", orderId);

    return { order: order as Order, error: null };
  } catch (error) {
    console.error("[Order Service] Erro:", error);
    return { order: null, error: error as Error };
  }
}

/**
 * Busca pedido por ID
 */
export async function getOrderById(orderId: string): Promise<{ order: Order | null; error: Error | null }> {
  try {
    const { data: order, error } = await supabase
      .from("orders")
      .select(`
        *,
        items:order_items(*)
      `)
      .eq("id", orderId)
      .single();

    if (error) throw error;

    return { order: order as Order, error: null };
  } catch (error) {
    console.error("[Order Service] Erro ao buscar pedido:", error);
    return { order: null, error: error as Error };
  }
}

/**
 * Busca pedidos do cliente
 */
export async function getCustomerOrders(customerEmail: string): Promise<{ orders: Order[]; error: Error | null }> {
  try {
    const { data: orders, error } = await supabase
      .from("orders")
      .select(`
        *,
        items:order_items(*)
      `)
      .eq("customer_email", customerEmail)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return { orders: (orders || []) as Order[], error: null };
  } catch (error) {
    console.error("[Order Service] Erro ao buscar pedidos:", error);
    return { orders: [], error: error as Error };
  }
}

/**
 * Atualiza status do pedido
 */
export async function updateOrderStatus(
  orderId: string, 
  status: string, 
  notes?: string
): Promise<{ success: boolean; error: Error | null }> {
  try {
    const { error } = await supabase
      .from("orders")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (error) throw error;

    // Criar histórico
    await createOrderStatusHistory(orderId, status, notes);

    return { success: true, error: null };
  } catch (error) {
    console.error("[Order Service] Erro ao atualizar status:", error);
    return { success: false, error: error as Error };
  }
}

/**
 * Adiciona código de rastreamento
 */
export async function addTrackingCode(
  orderId: string,
  trackingCode: string,
  carrier: string
): Promise<{ success: boolean; error: Error | null }> {
  try {
    const trackingUrl = getTrackingUrl(carrier, trackingCode);

    const { error } = await supabase
      .from("orders")
      .update({
        tracking_code: trackingCode,
        tracking_url: trackingUrl,
        status: "SHIPPED",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (error) throw error;

    await createOrderStatusHistory(orderId, "SHIPPED", `Código de rastreamento: ${trackingCode}`);

    return { success: true, error: null };
  } catch (error) {
    console.error("[Order Service] Erro ao adicionar rastreamento:", error);
    return { success: false, error: error as Error };
  }
}

/**
 * Cria histórico de status
 */
async function createOrderStatusHistory(orderId: string, status: string, notes?: string) {
  try {
    await supabase.from("order_status_history").insert({
      order_id: orderId,
      status,
      notes: notes || null,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Order Service] Erro ao criar histórico:", error);
  }
}

/**
 * Gera URL de rastreamento baseada na transportadora
 */
function getTrackingUrl(carrier: string, code: string): string {
  const carriers: Record<string, string> = {
    "usps": `https://tools.usps.com/go/TrackConfirmAction?tLabels=${code}`,
    "ups": `https://www.ups.com/track?tracknum=${code}`,
    "fedex": `https://www.fedex.com/apps/fedextrack/?tracknumbers=${code}`,
    "dhl": `https://www.dhl.com/en/express/tracking.html?AWB=${code}`,
    "correios": `https://rastreamento.correios.com.br/app/index.php`,
  };

  return carriers[carrier.toLowerCase()] || "";
}

/**
 * Calcula total do pedido incluindo taxas
 */
export function calculateOrderTotal(
  items: OrderItem[],
  shippingCost: number = 0,
  taxRate: number = 0
): { subtotal: number; shipping: number; tax: number; total: number } {
  const subtotal = items.reduce((sum, item) => sum + item.total_price, 0);
  const tax = subtotal * taxRate;
  const total = subtotal + shippingCost + tax;

  return {
    subtotal,
    shipping: shippingCost,
    tax,
    total,
  };
}
