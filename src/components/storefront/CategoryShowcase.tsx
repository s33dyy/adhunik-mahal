import { Link } from "react-router-dom";
import { useCatalog } from "@/lib/api";

export function CategoryShowcase() {
  const { data } = useCatalog();
  const categories = data?.categories ?? [];

  return (
    <section className="container py-20">
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="text-[11px] tracking-[0.3em] uppercase text-maroon mb-2">Browse by Weave</p>
          <h2 className="font-display text-4xl md:text-5xl">Shop by Category</h2>
        </div>
        <Link to="/shop" className="text-sm uppercase tracking-widest text-charcoal hover:text-maroon hidden md:inline-block">
          View All
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {categories.map((category, index) => (
          <Link key={category.slug} to={`/shop?cat=${category.slug}`}
            className={`group relative aspect-[3/4] overflow-hidden bg-secondary ${index === 0 ? "md:row-span-2 md:aspect-auto" : ""}`}>
            <img src={category.imageUrl} alt={category.name} loading="lazy"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-1">{category.count} pieces</p>
              <h3 className="font-display text-xl md:text-2xl text-primary-foreground leading-tight">{category.name}</h3>
              <span className="inline-block mt-2 text-xs text-primary-foreground/80 border-b border-gold/60 pb-0.5">Explore</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
