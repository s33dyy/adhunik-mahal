import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CategoryShowcase } from "@/components/storefront/CategoryShowcase";
import { HeroCarousel } from "@/components/storefront/HeroCarousel";
import { ProductCard, ProductSkeleton } from "@/components/storefront/ProductCard";
import { StoreLayout } from "@/components/storefront/StoreLayout";
import { WhyUs } from "@/components/storefront/WhyUs";
import { useCatalog } from "@/lib/api";

const quickFilters = [
  { label: "All", to: "/shop" },
  { label: "Silk", to: "/shop?cat=silk-sarees" },
  { label: "Cotton", to: "/shop?cat=cotton-sarees" },
  { label: "Wedding", to: "/shop?cat=wedding-edit" },
];

const Index = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useCatalog();
  const featuredProducts = data?.featuredProducts ?? [];
  const products = data?.products ?? [];

  return (
    <StoreLayout>
      <HeroCarousel />

      <section className="container py-20">
        <div className="text-center mb-12">
          <p className="text-[11px] tracking-[0.3em] uppercase text-maroon mb-2">Curated This Week</p>
          <h2 className="font-display text-4xl md:text-5xl">Featured Sarees</h2>
          <div className="mx-auto w-24 gold-divider mt-4" />
        </div>
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => <ProductSkeleton key={index} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.slice(0, 4).map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        )}
      </section>

      <CategoryShowcase />
      <WhyUs />

      <section className="container py-20">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <p className="text-[11px] tracking-[0.3em] uppercase text-maroon mb-2">The Atelier</p>
            <h2 className="font-display text-4xl md:text-5xl">Explore Catalog</h2>
          </div>
          <div className="flex gap-2 text-xs uppercase tracking-widest">
            {quickFilters.map((filter, index) => (
              <button key={filter.label} onClick={() => navigate(filter.to)}
                className={`px-4 py-2 border ${index === 0 ? "border-charcoal bg-charcoal text-primary-foreground" : "border-border hover:border-charcoal"}`}>
                {filter.label}
              </button>
            ))}
          </div>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
            {Array.from({ length: 8 }).map((_, index) => <ProductSkeleton key={index} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
            {products.slice(0, 12).map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        )}
        <div className="text-center mt-12">
          <Button asChild variant="outline" className="rounded-none border-charcoal text-charcoal hover:bg-charcoal hover:text-primary-foreground px-10 h-12">
            <Link to="/shop">Browse Full Shop</Link>
          </Button>
        </div>
      </section>

      <section className="bg-gradient-hero text-primary-foreground py-20">
        <div className="container text-center max-w-2xl">
          <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-3">Atelier Story</p>
          <h2 className="font-display text-4xl md:text-5xl">Every weave is a love letter to Bengal.</h2>
          <p className="mt-5 text-primary-foreground/80">
            For three generations, Adhunik Mahal has worked alongside handloom clusters across Murshidabad,
            Bhagalpur and Kanchipuram, bringing you sarees that do not just drape, but belong.
          </p>
          <Button asChild className="mt-8 rounded-none bg-gold text-charcoal hover:bg-gold/90 h-12 px-10">
            <Link to="/about">Read Our Story</Link>
          </Button>
        </div>
      </section>
    </StoreLayout>
  );
};

export default Index;
