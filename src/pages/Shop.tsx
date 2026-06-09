import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Filter } from "lucide-react";
import { ProductCard, ProductSkeleton } from "@/components/storefront/ProductCard";
import { StoreLayout } from "@/components/storefront/StoreLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useCatalog, useProducts } from "@/lib/api";

const sortOptions = [
  { label: "Newest", value: "newest" },
  { label: "Featured", value: "featured" },
  { label: "Price low to high", value: "price_asc" },
  { label: "Price high to low", value: "price_desc" },
  { label: "Name", value: "name" },
];

const Shop = () => {
  const [params, setParams] = useSearchParams();
  const filters = Object.fromEntries(params.entries());
  const { data: catalog } = useCatalog();
  const { data, isLoading } = useProducts(filters);
  const products = filters.featured === "true" ? (data?.products ?? []).filter((product) => product.featured) : data?.products ?? [];
  const categories = catalog?.categories ?? [];
  const allProducts = useMemo(() => catalog?.products ?? [], [catalog?.products]);
  const active = categories.find((category) => category.slug === filters.cat);
  const [sheetOpen, setSheetOpen] = useState(false);

  const facets = useMemo(() => ({
    fabrics: Array.from(new Set(allProducts.map((product) => product.fabric).filter(Boolean))).sort(),
    occasions: Array.from(new Set(allProducts.map((product) => product.occasion).filter(Boolean))).sort(),
  }), [allProducts]);

  const update = (next: Record<string, string>) => {
    const merged = new URLSearchParams(params);
    for (const [key, value] of Object.entries(next)) {
      if (value) merged.set(key, value);
      else merged.delete(key);
    }
    setParams(merged);
  };

  const clear = () => {
    setParams({});
    setSheetOpen(false);
  };

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xs uppercase tracking-widest text-maroon mb-3">Search</h3>
        <Input value={filters.q || ""} onChange={(event) => update({ q: event.target.value })} placeholder="Name, SKU, fabric…" className="rounded-none" />
      </div>

      <div>
        <h3 className="text-xs uppercase tracking-widest text-maroon mb-3">Categories</h3>
        <ul className="space-y-2 text-sm">
          <li><button onClick={() => update({ cat: "", featured: "" })} className={`hover:text-maroon ${!filters.cat && !filters.featured ? "text-maroon font-medium" : ""}`}>All Sarees ({allProducts.length})</button></li>
          <li><button onClick={() => update({ featured: "true", cat: "" })} className={`hover:text-maroon ${filters.featured === "true" ? "text-maroon font-medium" : ""}`}>Featured ({allProducts.filter((product) => product.featured).length})</button></li>
          {categories.map((category) => (
            <li key={category.slug}>
              <button onClick={() => update({ cat: category.slug, featured: "" })} className={`hover:text-maroon ${filters.cat === category.slug ? "text-maroon font-medium" : ""}`}>
                {category.name} ({category.count})
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="gold-divider" />
      <div>
        <h3 className="text-xs uppercase tracking-widest text-maroon mb-3">Occasion</h3>
        <select value={filters.occasion || ""} onChange={(event) => update({ occasion: event.target.value })} className="w-full h-10 border border-border bg-background px-3 text-sm">
          <option value="">All occasions</option>
          {facets.occasions.map((occasion) => <option key={occasion} value={occasion}>{occasion}</option>)}
        </select>
      </div>

      <div>
        <h3 className="text-xs uppercase tracking-widest text-maroon mb-3">Fabric</h3>
        <select value={filters.fabric || ""} onChange={(event) => update({ fabric: event.target.value })} className="w-full h-10 border border-border bg-background px-3 text-sm">
          <option value="">All fabrics</option>
          {facets.fabrics.map((fabric) => <option key={fabric} value={fabric}>{fabric}</option>)}
        </select>
      </div>

      <button onClick={clear} className="w-full h-10 border border-charcoal text-xs uppercase tracking-widest hover:bg-charcoal hover:text-primary-foreground">Clear Filters</button>
    </div>
  );

  return (
    <StoreLayout>
      <div className="bg-secondary border-b border-border">
        <div className="container py-12">
          <p className="text-xs text-muted-foreground"><Link to="/" className="hover:text-maroon">Home</Link> / Shop {active && `/ ${active.name}`}</p>
          <h1 className="font-display text-4xl md:text-5xl mt-3">{active ? active.name : filters.featured ? "Featured Sarees" : "The Full Collection"}</h1>
          <p className="text-muted-foreground mt-2">{products.length} pieces · handpicked from Indian handloom clusters</p>
        </div>
      </div>

      <div className="container py-10 grid lg:grid-cols-[260px_1fr] gap-10">
        <aside className="hidden lg:block">
          <FilterContent />
        </aside>

        <div>
          <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
            <div className="flex items-center gap-4">
              <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden rounded-none border-charcoal text-charcoal h-10">
                    <Filter className="w-4 h-4 mr-2" /> Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="overflow-y-auto">
                  <SheetHeader className="mb-6 text-left">
                    <SheetTitle className="font-display text-2xl">Filters</SheetTitle>
                  </SheetHeader>
                  <FilterContent />
                </SheetContent>
              </Sheet>
              <p className="text-sm text-muted-foreground hidden sm:block">{isLoading ? "Loading catalog…" : `Showing ${products.length} products`}</p>
            </div>
            <select value={filters.sort || "newest"} onChange={(event) => update({ sort: event.target.value })} className="h-10 border border-border bg-background px-3 text-sm shrink-0">
              {sortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
            <p className="text-sm text-muted-foreground sm:hidden w-full">{isLoading ? "Loading catalog…" : `Showing ${products.length} products`}</p>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-10">
              {Array.from({ length: 6 }).map((_, index) => <ProductSkeleton key={index} />)}
            </div>
          ) : products.length === 0 ? (
            <div className="border border-border bg-secondary p-10 text-center">
              <h2 className="font-display text-2xl">No pieces found</h2>
              <p className="text-muted-foreground mt-1">Try another category or search term.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-10">
              {products.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          )}
        </div>
      </div>
    </StoreLayout>
  );
};

export default Shop;
