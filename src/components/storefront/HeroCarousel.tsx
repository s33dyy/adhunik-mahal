import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCatalog } from "@/lib/api";

export function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const { data } = useCatalog();
  const slides = data?.heroSlides ?? [];

  useEffect(() => {
    if (slides.length === 0) return;
    const timer = setInterval(() => setIndex((current) => (current + 1) % slides.length), 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) {
    return <section className="h-[520px] bg-secondary animate-pulse" aria-label="Loading featured stories" />;
  }

  return (
    <section className="relative w-full overflow-hidden bg-secondary">
      <div className="relative h-[78vh] min-h-[520px] max-h-[760px]">
        {slides.map((slide, slideIndex) => (
          <div key={slide.id} className={`absolute inset-0 transition-opacity duration-1000 ${index === slideIndex ? "opacity-100" : "opacity-0"}`}>
            <img src={slide.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" width={1920} height={1080} />
            <div className="absolute inset-0 bg-gradient-to-r from-background/85 via-background/30 to-transparent" style={{ direction: slide.align === "right" ? "rtl" : "ltr" }} />
            <div className="container relative h-full flex items-center">
              <div className={`max-w-xl ${slide.align === "right" ? "ml-auto text-right" : ""}`}>
                <p className="text-[11px] tracking-[0.3em] uppercase text-maroon mb-4 animate-fade-up">{slide.eyebrow}</p>
                <h1 className="font-display text-5xl md:text-7xl leading-[0.95] text-charcoal whitespace-pre-line animate-fade-up">{slide.title}</h1>
                <p className="mt-5 text-base text-muted-foreground max-w-md animate-fade-up">{slide.subtitle}</p>
                <div className={`mt-7 flex gap-3 ${slide.align === "right" ? "justify-end" : ""} animate-fade-up`}>
                  <Button asChild size="lg" className="bg-maroon hover:bg-maroon-deep text-primary-foreground rounded-none px-8 h-12">
                    <Link to={slide.ctaHref}>{slide.ctaLabel}</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="border-charcoal text-charcoal hover:bg-charcoal hover:text-primary-foreground rounded-none px-8 h-12">
                    <Link to="/shop">Shop All</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {slides.map((slide, slideIndex) => (
            <button key={slide.id} onClick={() => setIndex(slideIndex)} aria-label={`slide ${slideIndex + 1}`}
              className={`h-1 transition-all ${index === slideIndex ? "w-10 bg-maroon" : "w-6 bg-charcoal/30"}`} />
          ))}
        </div>
      </div>
      <div className="bg-charcoal text-primary-foreground overflow-hidden">
        <div className="flex gap-12 py-3 animate-marquee whitespace-nowrap text-xs uppercase tracking-[0.25em]">
          {Array(2).fill(0).map((_, loop) => (
            <div key={loop} className="flex gap-12 shrink-0">
              <span className="text-gold">Handloom Certified</span>
              <span>Free Shipping All India</span>
              <span className="text-gold">Free Shipping</span>
              <span>WhatsApp to Order</span>
              <span className="text-gold">Curated in Kolkata</span>
              <span>7-day Exchange</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
