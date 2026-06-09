import { ArrowDownRight, ArrowUpRight, IndianRupee, ShoppingBag, TrendingUp, Users } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

const statusBadge: Record<string, string> = {
  confirmed: "bg-bottle/10 text-bottle border-bottle/20",
  shipped: "bg-accent/10 text-accent-foreground border-accent/30",
  pending: "bg-muted text-muted-foreground border-border",
  delivered: "bg-maroon/10 text-maroon border-maroon/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

const AdminDashboard = () => {
  const { data, isLoading } = useQuery({ queryKey: ["dashboard"], queryFn: api.dashboard });
  const stats = data?.stats ?? {};
  const cards = [
    { label: "Orders", value: String(stats.orders || 0), change: "+ saved", up: true, icon: ShoppingBag },
    { label: "Customers", value: String(stats.customers || 0), change: "local", up: false, icon: Users },
  ];

  return (
    <AdminLayout title="Dashboard" subtitle="Welcome back to your atelier console">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <div key={card.label} className="bg-background border border-border p-5">
            <div className="flex items-start justify-between">
              <card.icon className="h-5 w-5 text-maroon" />
              <span className={`text-xs flex items-center gap-0.5 ${card.up ? "text-bottle" : "text-muted-foreground"}`}>
                {card.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}{card.change}
              </span>
            </div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mt-4">{card.label}</p>
            <p className="font-display text-3xl mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-background border border-border p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display text-xl">Sales Overview</h3>
            <p className="text-xs text-muted-foreground">SQLite orders</p>
          </div>
          <div className="h-48 flex items-end gap-1.5">
            {!isLoading && (data?.recentOrders ?? []).length === 0 && <div className="w-full h-full grid place-items-center text-sm text-muted-foreground">Orders will appear here after checkout.</div>}
          </div>
        </div>

        <div className="bg-background border border-border p-5">
          <h3 className="font-display text-xl mb-4">Top Sellers</h3>
          <div className="space-y-3">
            {(data?.topProducts ?? []).map((product, index) => (
              <div key={product.id} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-4">{index + 1}</span>
                <img src={product.imageUrl} alt="" className="h-10 w-10 object-cover bg-secondary" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.sold} sold</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-background border border-border mt-6">
        <div className="p-5 border-b border-border flex justify-between items-center">
          <h3 className="font-display text-xl">Recent Orders</h3>
          <a href="/admin/orders" className="text-xs text-maroon hover:underline">View all</a>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-xs uppercase tracking-widest text-muted-foreground">
            <tr><th className="text-left p-3">Order</th><th className="text-left p-3">Customer</th><th className="text-left p-3">Date</th><th className="text-left p-3">Status</th></tr>
          </thead>
          <tbody>
            {(data?.recentOrders ?? []).map((order) => (
              <tr key={order.id} className="border-t border-border hover:bg-secondary/30">
                <td className="p-3 font-medium">{order.id}</td>
                <td className="p-3">{order.customerName}</td>
                <td className="p-3 text-muted-foreground">{new Date(order.createdAt).toLocaleDateString("en-IN")}</td>
                <td className="p-3"><span className={`text-[10px] uppercase tracking-widest px-2 py-1 border ${statusBadge[order.status]}`}>{order.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
