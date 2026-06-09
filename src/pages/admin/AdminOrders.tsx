import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Download, Eye, MessageCircle, Search } from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api, useAdminOrders, useInvalidateStore } from "@/lib/api";
import type { Order, OrderStatus } from "@/types/store";

const ALL: OrderStatus[] = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

const badge: Record<OrderStatus, string> = {
  pending: "bg-muted text-muted-foreground border-border",
  confirmed: "bg-bottle/10 text-bottle border-bottle/30",
  shipped: "bg-accent/15 text-accent-foreground border-accent/40",
  delivered: "bg-maroon/10 text-maroon border-maroon/30",
  cancelled: "bg-destructive/10 text-destructive border-destructive/30",
};

const labels: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const AdminOrders = () => {
  const invalidate = useInvalidateStore();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [selected, setSelected] = useState<Order | null>(null);
  const { data } = useAdminOrders({ q: query, status: filter });
  const { data: allData } = useAdminOrders();
  const orders = data?.orders ?? [];
  const allOrders = useMemo(() => allData?.orders ?? [], [allData?.orders]);

  const update = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) => api.updateOrderStatus(id, status),
    onSuccess: () => {
      toast.success("Order status updated");
      invalidate();
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not update order"),
  });

  const counts = useMemo(() => ALL.reduce((acc, status) => ({ ...acc, [status]: allOrders.filter((order) => order.status === status).length }), {} as Record<OrderStatus, number>), [allOrders]);

  const exportCsv = () => {
    window.location.href = "/api/admin/orders/export";
  };

  return (
    <AdminLayout title="Orders" subtitle="Manage and fulfill customer orders">
      <div className="grid md:grid-cols-5 gap-3 mb-6">
        {ALL.map((status) => (
          <button key={status} onClick={() => setFilter(status)} className={`bg-background border p-4 text-left transition ${filter === status ? "border-maroon ring-1 ring-maroon" : "border-border hover:border-charcoal"}`}>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">{labels[status]}</p>
            <p className="font-display text-2xl mt-1">{counts[status]}</p>
          </button>
        ))}
      </div>

      <div className="bg-background border border-border">
        <div className="p-4 border-b border-border flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by order, customer, phone…" className="pl-9 h-9 rounded-none" />
          </div>
          <button onClick={() => setFilter("all")} className={`px-3 h-9 text-xs uppercase tracking-widest border ${filter === "all" ? "bg-charcoal text-primary-foreground" : "border-border"}`}>All ({allOrders.length})</button>
          <Button variant="outline" className="h-9 rounded-none" onClick={exportCsv}><Download className="h-4 w-4 mr-2" /> Export CSV</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[920px]">
            <thead className="bg-secondary/50 text-xs uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="p-3 text-left">Order</th>
                <th className="p-3 text-left">Customer</th>
                <th className="p-3 text-left">Phone</th>
                <th className="p-3 text-left">City</th>
                <th className="p-3 text-center">Items</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-t border-border hover:bg-secondary/30">
                  <td className="p-3 font-medium">{order.id}</td>
                  <td className="p-3">{order.customerName}</td>
                  <td className="p-3 text-muted-foreground">{order.phone}</td>
                  <td className="p-3 text-muted-foreground">{order.city}</td>
                  <td className="p-3 text-center">{order.itemCount}</td>
                  <td className="p-3 text-muted-foreground whitespace-nowrap">{new Date(order.createdAt).toLocaleDateString("en-IN")}</td>
                  <td className="p-3">
                    <select value={order.status} onChange={(event) => update.mutate({ id: order.id, status: event.target.value as OrderStatus })}
                      className={`text-[10px] uppercase tracking-widest px-2 py-1 border bg-transparent cursor-pointer ${badge[order.status]}`}>
                      {ALL.map((status) => <option key={status} value={status}>{labels[status]}</option>)}
                    </select>
                  </td>
                  <td className="p-3 text-right">
                    <div className="inline-flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelected(order)}><Eye className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-bottle" asChild><a href={`https://wa.me/${order.phone.replace(/\D/g, "")}`}><MessageCircle className="h-3.5 w-3.5" /></a></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 bg-charcoal/60 grid place-items-center p-4" role="dialog" aria-modal="true">
          <div className="bg-background border border-border max-w-2xl w-full max-h-[85vh] overflow-auto">
            <div className="p-5 border-b border-border flex justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Order Detail</p>
                <h3 className="font-display text-3xl">{selected.id}</h3>
              </div>
              <Button variant="outline" className="rounded-none" onClick={() => setSelected(null)}>Close</Button>
            </div>
            <div className="p-5 grid md:grid-cols-2 gap-6">
              <div className="space-y-3 text-sm">
                <p><span className="text-muted-foreground">Customer:</span> {selected.customerName}</p>
                <p><span className="text-muted-foreground">Phone:</span> {selected.phone}</p>
                <p><span className="text-muted-foreground">Address:</span> {selected.address}, {selected.city} - {selected.pincode}</p>
                {selected.notes && <p><span className="text-muted-foreground">Notes:</span> {selected.notes}</p>}
              </div>
              <div className="space-y-3">
                {selected.items.map((item) => (
                  <div key={`${item.productId}-${item.qty}`} className="flex gap-3 text-sm">
                    <img src={item.imageUrl} alt="" className="h-14 w-12 object-cover bg-secondary" />
                    <div className="flex-1">
                      <p>{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.sku} · Qty {item.qty}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminOrders;
