import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Heart, RotateCcw, ShieldCheck, ShoppingBag, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/storefront/ProductCard";
import { StoreLayout } from "@/components/storefront/StoreLayout";
import { useCart } from "@/context/CartContext";
import { useProduct } from "@/lib/api";

const ProductPage = () => {
  const { id } = useParams();
  const { add } = useCart();
  const { data, isLoading } = useProduct(id);
  const product = data?.product;
  const related = data?.related ?? [];
  const [activeImage, setActiveImage] = useState("");
  const image = activeImage || product?.imageUrl;

  if (isLoading) return <StoreLayout><div className="container py-32 text-center">Loading product…</div></StoreLayout>;
  if (!product) return <StoreLayout><div className="container py-32 text-center">Product not found</div></StoreLayout>;

  return (
    <StoreLayout>
      <div className="container py-8">
        <p className="text-xs text-muted-foreground"><Link to="/" className="hover:text-maroon">Home</Link> / <Link to="/shop" className="hover:text-maroon">Shop</Link> / {product.name}</p>
      </div>
      <div className="container grid md:grid-cols-2 gap-10 pb-16">
        <div className="space-y-3">
          <div className="aspect-[4/5] bg-secondary overflow-hidden">
            <img src={image} alt={product.name} className="w-full h-full object-cover" />
          </div>
          <div className="grid grid-cols-4 gap-3">
            {product.gallery.map((src) => (
              <button key={src} onClick={() => setActiveImage(src)}
                className={`aspect-square bg-secondary overflow-hidden border-2 ${image === src ? "border-maroon" : "border-transparent hover:border-maroon"}`}>
                <img src={src} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-maroon">{product.fabric}</p>
          <h1 className="font-display text-4xl mt-2">{product.name}</h1>
          <p className="text-xs text-muted-foreground mt-2">SKU {product.sku}</p>
          <div className="gold-divider my-6" />
          <p className="text-foreground/80 leading-relaxed">{product.description}</p>

          <div className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between border-b border-border pb-2"><span className="text-muted-foreground">Fabric</span><span>{product.fabric}</span></div>
            <div className="flex justify-between border-b border-border pb-2"><span className="text-muted-foreground">Occasion</span><span>{product.occasion || "Everyday"} </span></div>
            <div className="flex justify-between border-b border-border pb-2"><span className="text-muted-foreground">Colour</span><span>{product.color || "Assorted"}</span></div>
            <div className="flex justify-between border-b border-border pb-2"><span className="text-muted-foreground">Care</span><span>Dry clean recommended</span></div>
          </div>

          <div className="flex gap-3 mt-8">
            <Button onClick={() => add(product)} disabled={!product.inStock} className="flex-1 h-12 rounded-none bg-maroon hover:bg-maroon-deep">
              <ShoppingBag className="h-4 w-4 mr-2" /> {product.inStock ? "Add to Bag" : "Unavailable"}
            </Button>
            <Button variant="outline" size="icon" className="h-12 w-12 rounded-none border-charcoal"><Heart className="h-4 w-4" /></Button>
          </div>

          <div className="mt-8 flex justify-around text-center text-xs">
            <div><Truck className="h-5 w-5 mx-auto text-maroon mb-1" /> Free Shipping</div>
            <div><RotateCcw className="h-5 w-5 mx-auto text-maroon mb-1" /> 7-Day Exchange</div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="container pb-20">
          <h2 className="font-display text-3xl mb-8">You May Also Love</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {related.map((item) => <ProductCard key={item.id} product={item} />)}
          </div>
        </section>
      )}
    </StoreLayout>
  );
};

export default ProductPage;
