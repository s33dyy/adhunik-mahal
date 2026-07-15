import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Truck } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StoreLayout } from "@/components/storefront/StoreLayout";
import { useCart } from "@/context/CartContext";
import { api } from "@/lib/api";

const schema = z.object({
  name: z.string().trim().min(2, "Name required").max(80),
  phone: z.string().trim().regex(/^[0-9+\-\s]{10,15}$/, "Valid phone required"),
  address: z.string().trim().min(10, "Full address required").max(400),
  city: z.string().trim().min(2, "City required").max(60),
  pincode: z.string().trim().regex(/^[0-9]{6}$/, "6-digit pincode required"),
  notes: z.string().max(400).optional(),
});

const Checkout = () => {
  const { items, clear } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", address: "", city: "", pincode: "", notes: "" });
  const set = (key: string, value: string) => setForm((state) => ({ ...state, [key]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    if (items.length === 0) {
      toast.error("Your bag is empty");
      return;
    }
    setLoading(true);
    try {
      const response = await api.createOrder({
        ...parsed.data,
        items: items.map((item) => ({ productId: item.product.id, qty: item.qty })),
      });
      toast.success(`Order ${response.order.id} placed successfully!`);
      clear();
      navigate(`/track?id=${encodeURIComponent(response.order.id)}&phone=${encodeURIComponent(form.phone)}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not place order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <StoreLayout>
      <div className="container py-12 max-w-6xl">
        <h1 className="font-display text-4xl md:text-5xl mb-10">Checkout</h1>

        <form onSubmit={submit} className="grid lg:grid-cols-[1fr_400px] gap-10">
          <div className="space-y-8">
            <div className="bg-card border border-border p-6 space-y-4">
              <h2 className="font-display text-2xl">Contact & Delivery</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><Label>Full Name *</Label><Input value={form.name} onChange={(event) => set("name", event.target.value)} required maxLength={80} className="mt-1 rounded-none" /></div>
                <div><Label>Phone *</Label><Input value={form.phone} onChange={(event) => set("phone", event.target.value)} required maxLength={15} className="mt-1 rounded-none" /></div>
              </div>
              <div><Label>Delivery Address *</Label><Textarea value={form.address} onChange={(event) => set("address", event.target.value)} required maxLength={400} rows={3} className="mt-1 rounded-none" placeholder="House / Flat, Street, Landmark" /></div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><Label>City *</Label><Input value={form.city} onChange={(event) => set("city", event.target.value)} required maxLength={60} className="mt-1 rounded-none" /></div>
                <div><Label>Pincode *</Label><Input value={form.pincode} onChange={(event) => set("pincode", event.target.value)} required maxLength={6} className="mt-1 rounded-none" /></div>
              </div>
              <div><Label>Notes for the Atelier</Label><Textarea value={form.notes} onChange={(event) => set("notes", event.target.value)} maxLength={400} rows={3} className="mt-1 rounded-none" placeholder="Blouse stitching, gift wrap, fabric questions…" /></div>
            </div>
          </div>

          <aside>
            <div className="bg-card border border-border sticky top-28">
              <div className="p-6 border-b border-border">
                <h3 className="font-display text-xl mb-4">Order Summary</h3>
                {items.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Your bag is empty</p>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.product.id} className="flex gap-3 text-sm">
                        <img src={item.product.imageUrl} alt={item.product.name} className="w-12 h-14 object-cover bg-secondary" />
                        <div className="flex-1 min-w-0">
                          <p className="truncate">{item.product.name}</p>
                          <p className="text-xs text-muted-foreground">Qty {item.qty}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="p-6 pt-0">
                <Button type="submit" disabled={loading || items.length === 0} className="w-full h-12 rounded-none bg-maroon hover:bg-maroon-deep">
                  {loading ? "Placing Order…" : "Place Order"}
                </Button>
                <div className="flex justify-center mt-4 text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-1.5"><Truck className="h-3.5 w-3.5 text-maroon" /> All-India ship</div>
                </div>
              </div>
            </div>
          </aside>
        </form>
      </div>
    </StoreLayout>
  );
};

export default Checkout;
