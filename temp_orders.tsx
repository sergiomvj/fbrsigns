import { useState } from "react";
import { Plus, Search, Filter, Eye, Edit, FileText, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OrderStatus } from "@/types";
import { useOrders } from "@/hooks/useQuery";
import { useGenerateInvoice, useUpdateOrder, useCreateOrder, useDeleteOrder } from "@/hooks/useMutations";
import { OrderForm } from "@/components/orders/OrderForm";

export default function Orders() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orderFormOpen, setOrderFormOpen] = useState(false);
  const [generatingOrderId, setGeneratingOrderId] = useState<string | null>(null);
  
  const { data: orders, isLoading } = useOrders();
  const generateInvoiceMutation = useGenerateInvoice();
  const updateOrderMutation = useUpdateOrder();
  const createOrderMutation = useCreateOrder();
  const deleteOrderMutation = useDeleteOrder();

  const handleOrderAction = (order: any) => {
    setSelectedOrder(order);
    setOrderFormOpen(true);
  };

  const handleUpdateOrder = (data: any) => {
    updateOrderMutation.mutate({ orderId: data.id, data });
  };

  const handleCreateNewOrder = (data: any) => {
    createOrderMutation.mutate(data);
  };

  const handleGenerateInvoice = (orderId: string) => {
    setGeneratingOrderId(orderId);
    generateInvoiceMutation.mutate(orderId, {
      onSettled: () => setGeneratingOrderId(null)
    });
  };

  const handleDeleteOrder = (orderId: string) => {
    if (confirm('Are you sure you want to delete this order?')) {
      deleteOrderMutation.mutate(orderId);
    }
  };

  const filteredOrders = orders?.filter(order =>
    order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusVariant = (status: OrderStatus) => {
    switch (status) {
      case 'Pendente':
        return 'secondary';
      case 'Confirmado':
        return 'default';
      case 'Em Produção':
        return 'default';
      case 'Pronto':
        return 'outline';
      case 'Entregue':
        return 'outline';
      case 'Cancelado':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">
            Manage customer orders and track their status
          </p>
        </div>
        <Button onClick={() => {
          setSelectedOrder(null);
          setOrderFormOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          New Order
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders, customers..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter by Status
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Orders ({orders?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Invoice</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders?.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id.slice(0, 8)}...</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.customer_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {order.customer_email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(order.status as OrderStatus)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      $ {Number(order.total).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      {new Date(order.created_at).toLocaleDateString('en-US')}
                    </TableCell>
                    <TableCell>
                      {order.invoice_number ? (
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-green-600">
                            {order.invoice_number}
                          </Badge>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleGenerateInvoice(order.id)}
                          disabled={generatingOrderId === order.id}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          {generatingOrderId === order.id ? 'Generating...' : 'Generate Invoice'}
                        </Button>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleOrderAction(order)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleOrderAction(order)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-destructive hover:text-destructive/80"
                          onClick={() => handleDeleteOrder(order.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )) || (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No orders found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <OrderForm
        order={selectedOrder}
        open={orderFormOpen}
        onClose={() => {
          setOrderFormOpen(false);
          setSelectedOrder(null);
        }}
        onUpdate={handleUpdateOrder}
        onCreate={handleCreateNewOrder}
      /></div>
  );
}
