import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import type { Product } from "@/types/store";

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  return (
    <div className="group">
      <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
        <Link to={`/product/${product.slug}`}>
          <img src={product.imageUrl} alt={product.name} loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        </Link>
        {product.tag && (
          <span className="absolute top-3 left-3 bg-maroon text-primary-foreground text-[10px] uppercase tracking-widest px-2.5 py-1">
            {product.tag}
          </span>
        )}
        <Button size="sm" onClick={() => add(product)} disabled={!product.inStock}
          className="absolute bottom-0 left-0 right-0 rounded-none bg-charcoal hover:bg-maroon text-primary-foreground translate-y-full group-hover:translate-y-0 transition-transform h-11">
          <ShoppingBag className="h-4 w-4 mr-2" /> {product.inStock ? "Add to Bag" : "Unavailable"}
        </Button>
      </div>
      <div className="mt-3 space-y-1">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{product.fabric}</p>
        <Link to={`/product/${product.slug}`}>
          <h3 className="font-display text-lg leading-tight hover:text-maroon transition">{product.name}</h3>
        </Link>
      </div>
    </div>
  );
}

export function ProductSkeleton() {
  return (
    <div className="group">
      <div className="relative aspect-[4/5] bg-secondary animate-pulse" />
      <div className="mt-3 space-y-2">
        <div className="h-3 w-1/3 bg-secondary animate-pulse" />
        <div className="h-5 w-3/4 bg-secondary animate-pulse" />
      </div>
    </div>
  );
}
