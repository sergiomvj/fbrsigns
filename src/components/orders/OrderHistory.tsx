import { useEffect, useState } from "react";
import { getCustomerOrders, Order } from "@/services/orderService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  XCircle,
  ChevronRight,
  Loader2,
  ShoppingBag
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface OrderHistoryProps {
  customerEmail: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  PENDING: { 
    label: "Pendente", 
    color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    icon: Clock 
  },
  PAID: { 
    label: "Pago", 
    color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    icon: CheckCircle 
  },
  PROCESSING: { 
    label: "Em Processamento", 
    color: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    icon: Package 
  },
  SHIPPED: { 
    label: "Enviado", 
    color: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
    icon: Truck 
  },
  DELIVERED: { 
    label: "Entregue", 
    color: "bg-green-500/10 text-green-500 border-green-500/20",
    icon: CheckCircle 
  },
  CANCELLED: { 
    label: "Cancelado", 
    color: "bg-red-500/10 text-red-500 border-red-500/20",
    icon: XCircle 
  },
};

const paymentStatusConfig: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Aguardando pagamento", color: "bg-yellow-500/10 text-yellow-500" },
  COMPLETED: { label: "Pago", color: "bg-green-500/10 text-green-500" },
  FAILED: { label: "Falhou", color: "bg-red-500/10 text-red-500" },
  REFUNDED: { label: "Reembolsado", color: "bg-gray-500/10 text-gray-500" },
};

export function OrderHistory({ customerEmail }: OrderHistoryProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, [customerEmail]);

  async function loadOrders() {
    try {
      setLoading(true);
      const { orders, error } = await getCustomerOrders(customerEmail);
      
      if (error) throw error;
      
      setOrders(orders);
    } catch (err) {
      console.error("[OrderHistory] Erro:", err);
      setError("Não foi possível carregar seus pedidos");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-500/20">
        <CardContent className="pt-6">
          <div className="text-center text-red-500">
            <XCircle className="h-12 w-12 mx-auto mb-2" />
            <p>{error}</p>
            <Button onClick={loadOrders} variant="outline" className="mt-4">
              Tentar novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-slate-400" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              Nenhum pedido encontrado
            </h3>
            <p className="text-slate-500">
              Você ainda não fez nenhum pedido. Comece suas compras agora!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">
        Meus Pedidos ({orders.length})
      </h2>

      {orders.map((order) => {
        const status = statusConfig[order.status] || statusConfig.PENDING;
        const paymentStatus = paymentStatusConfig[order.payment_status] || paymentStatusConfig.PENDING;
        const StatusIcon = status.icon;
        const isExpanded = expandedOrder === order.id;

        return (
          <Card key={order.id} className="overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <CardTitle className="text-lg">
                    Pedido #{order.id.slice(-8).toUpperCase()}
                  </CardTitle>
                  <p className="text-sm text-slate-500">
                    {format(new Date(order.created_at), "dd 'de' MMMM 'de' yyyy, HH:mm", {
                      locale: ptBR,
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={status.color}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {status.label}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-slate-500">Total</p>
                  <p className="text-xl font-bold text-slate-900">
                    ${order.total.toFixed(2)}
                  </p>
                </div>
                <Badge className={paymentStatus.color}>
                  {paymentStatus.label}
                </Badge>
              </div>

              {/* Tracking Info */}
              {order.tracking_code && (
                <div className="bg-slate-50 p-3 rounded-lg mb-4">
                  <p className="text-sm font-medium text-slate-900 mb-1">
                    Código de rastreamento
                  </p>
                  <p className="text-sm text-slate-600 font-mono">
                    {order.tracking_code}
                  </p>
                  {order.tracking_url && (
                    <a
                      href={order.tracking_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline mt-1 inline-block"
                    >
                      Rastrear pedido →
                    </a>
                  )}
                </div>
              )}

              {/* Items Preview */}
              {order.items && order.items.length > 0 && (
                <div className="border-t pt-4">
                  <Button
                    variant="ghost"
                    onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                    className="w-full justify-between"
                  >
                    <span className="text-sm">
                      {order.items.length} item{order.items.length > 1 ? "s" : ""}
                    </span>
                    <ChevronRight
                      className={`h-4 w-4 transition-transform ${
                        isExpanded ? "rotate-90" : ""
                      }`}
                    />
                  </Button>

                  {isExpanded && (
                    <div className="mt-4 space-y-3">
                      {order.items.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg"
                        >
                          {item.image_url && (
                            <img
                              src={item.image_url}
                              alt={item.product_name}
                              className="h-12 w-12 object-cover rounded"
                            />
                          )}
                          <div className="flex-1">
                            <p className="font-medium text-sm">{item.product_name}</p>
                            <p className="text-xs text-slate-500">
                              Qtd: {item.quantity} × ${item.unit_price.toFixed(2)}
                            </p>
                            {(item.size || item.color) && (
                              <p className="text-xs text-slate-400">
                                {item.size && `Tamanho: ${item.size}`}
                                {item.size && item.color && " | "}
                                {item.color && `Cor: ${item.color}`}
                              </p>
                            )}
                          </div>
                          <p className="font-bold text-sm">
                            ${item.total_price.toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
