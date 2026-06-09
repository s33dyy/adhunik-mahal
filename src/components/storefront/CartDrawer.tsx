import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { Minus, Plus, X, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

export function CartDrawer() {
  const { open, setOpen, items, remove, setQty } = useCart();
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="w-full sm:max-w-md bg-background flex flex-col p-0">
        <SheetHeader className="p-5 border-b border-border">
          <SheetTitle className="font-display text-2xl">Your Bag ({items.reduce((sum, item) => sum + item.qty, 0)})</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 grid place-items-center p-8 text-center">
            <div>
              <p className="text-muted-foreground mb-4">Your bag is empty</p>
              <Button onClick={() => setOpen(false)} asChild className="bg-maroon hover:bg-maroon-deep rounded-none">
                <Link to="/shop">Start Shopping</Link>
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {items.map(({ product, qty }) => (
                <div key={product.id} className="flex gap-4 pb-4 border-b border-border last:border-0">
                  <img src={product.imageUrl} alt={product.name} className="w-20 h-24 object-cover bg-secondary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{product.fabric}</p>
                    <h4 className="font-display text-base leading-tight">{product.name}</h4>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center border border-border">
                        <button onClick={() => setQty(product.id, qty - 1)} className="h-7 w-7 grid place-items-center hover:bg-secondary"><Minus className="h-3 w-3" /></button>
                        <span className="w-8 text-center text-sm">{qty}</span>
                        <button onClick={() => setQty(product.id, qty + 1)} className="h-7 w-7 grid place-items-center hover:bg-secondary"><Plus className="h-3 w-3" /></button>
                      </div>
                      <button onClick={() => remove(product.id)} className="ml-auto text-muted-foreground hover:text-destructive">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border p-5 space-y-3 bg-secondary/40">
              <Button asChild onClick={() => setOpen(false)} className="w-full h-12 rounded-none bg-maroon hover:bg-maroon-deep">
                <Link to="/checkout"><MessageCircle className="h-4 w-4 mr-2" /> Checkout via WhatsApp</Link>
              </Button>
              <p className="text-[11px] text-center text-muted-foreground">Cash on Delivery available · Pan-India shipping</p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
