import { FormEvent, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StoreLayout } from "@/components/storefront/StoreLayout";
import { api } from "@/lib/api";
import type { Order } from "@/types/store";

const labels: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const TrackOrder = () => {
  const [params] = useSearchParams();
  const [id, setId] = useState(params.get("id") || "");
  const [phone, setPhone] = useState(params.get("phone") || "");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await api.trackOrder(id.trim(), phone.trim());
      setOrder(response.order);
    } catch (error) {
      setOrder(null);
      toast.error(error instanceof Error ? error.message : "Order not found");
    } finally {
      setLoading(false);
    }
  };

  return (
    <StoreLayout>
      <div className="container py-16 max-w-4xl">
        <p className="text-[11px] tracking-[0.3em] uppercase text-maroon mb-2">Order Status</p>
        <h1 className="font-display text-5xl">Track Your Order</h1>
        <p className="text-muted-foreground mt-2">Use the order ID saved after checkout and the WhatsApp phone number used for delivery.</p>

        <form onSubmit={submit} className="mt-10 grid md:grid-cols-[1fr_1fr_auto] gap-4 bg-card border border-border p-5">
          <div><Label>Order ID</Label><Input value={id} onChange={(event) => setId(event.target.value)} required className="mt-1 rounded-none" placeholder="AM260607-ABCD" /></div>
          <div><Label>Phone</Label><Input value={phone} onChange={(event) => setPhone(event.target.value)} required className="mt-1 rounded-none" placeholder="+91…" /></div>
          <Button disabled={loading} className="self-end rounded-none bg-maroon hover:bg-maroon-deep h-10"><Search className="h-4 w-4 mr-2" /> {loading ? "Checking…" : "Track"}</Button>
        </form>

        {order && (
          <div className="mt-8 border border-border bg-background">
            <div className="p-5 border-b border-border flex flex-wrap justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Order</p>
                <h2 className="font-display text-3xl">{order.id}</h2>
              </div>
              <span className="h-8 px-3 grid place-items-center text-[10px] uppercase tracking-widest border border-maroon/30 bg-maroon/10 text-maroon">{labels[order.status]}</span>
            </div>
            <div className="p-5 grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-display text-xl mb-3">Items</h3>
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={`${item.productId}-${item.qty}`} className="flex gap-3 text-sm">
                      <img src={item.imageUrl} alt="" className="h-14 w-12 object-cover bg-secondary" />
                      <div className="flex-1">
                        <p>{item.name}</p>
                        <p className="text-xs text-muted-foreground">Qty {item.qty}</p>
                      </div>
                      <p className="font-medium">₹{item.lineTotal.toLocaleString("en-IN")}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-sm space-y-2">
                <h3 className="font-display text-xl mb-3">Delivery</h3>
                <p><span className="text-muted-foreground">Name:</span> {order.customerName}</p>
                <p><span className="text-muted-foreground">Phone:</span> {order.phone}</p>
                <p><span className="text-muted-foreground">Address:</span> {order.address}, {order.city} - {order.pincode}</p>
                <p className="pt-3 border-t border-border flex justify-between font-display text-2xl"><span>Total</span><span className="text-maroon">₹{order.total.toLocaleString("en-IN")}</span></p>
              </div>
            </div>
          </div>
        )}
      </div>
    </StoreLayout>
  );
};

export default TrackOrder;
