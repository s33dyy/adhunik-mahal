import { Link } from "react-router-dom";
import { Award, MapPin, MessageCircle, PackageCheck, Sparkles, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StoreLayout } from "@/components/storefront/StoreLayout";
import { useCatalog } from "@/lib/api";

const promises = [
  { icon: Award, title: "Curated Handloom", text: "Each piece is selected for weave quality, drape, finish and occasion fit." },
  { icon: Truck, title: "All-India Shipping", text: "Orders are packed carefully and shipped after confirmation." },
  { icon: PackageCheck, title: "Exchange Support", text: "A seven-day exchange window helps you shop special pieces with confidence." },
];

const About = () => {
  const { data } = useCatalog();
  const settings = data?.settings;

  return (
    <StoreLayout>
      <section className="bg-gradient-hero text-primary-foreground">
        <div className="container py-24 grid lg:grid-cols-[1fr_420px] gap-12 items-center">
          <div>
            <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-3">Adhunik Mahal</p>
            <h1 className="font-display text-5xl md:text-7xl leading-none">A Kolkata saree atelier for modern heirlooms.</h1>
            <p className="mt-6 text-primary-foreground/75 max-w-2xl">
              We bring together Bengal handloom, South Indian silks, tussar textures, cotton jamdani and festive drapes in a shop built for careful selection, not hurried browsing.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild className="rounded-none bg-gold text-charcoal hover:bg-gold/90 h-12 px-8"><Link to="/shop">Shop Collection</Link></Button>
              <Button asChild variant="outline" className="rounded-none border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground hover:text-charcoal h-12 px-8">
                <a href={`https://wa.me/${settings?.whatsapp || ""}`}><MessageCircle className="h-4 w-4 mr-2" /> WhatsApp Us</a>
              </Button>
            </div>
          </div>
          <div className="bg-primary-foreground/10 border border-primary-foreground/15 p-6">
            <Sparkles className="h-8 w-8 text-gold mb-5" />
            <h2 className="font-display text-3xl">What We Stand For</h2>
            <p className="mt-3 text-sm leading-relaxed text-primary-foreground/75">
              Premium textiles, honest guidance, careful packaging and a boutique buying flow where customers can confirm details directly with the store before payment.
            </p>
            <div className="gold-divider my-6" />
            <p className="flex gap-2 text-sm text-primary-foreground/70"><MapPin className="h-4 w-4 text-gold shrink-0 mt-0.5" /> {settings?.address}</p>
          </div>
        </div>
      </section>

      <section className="container py-20 grid md:grid-cols-3 gap-5">
        {promises.map((promise) => (
          <div key={promise.title} className="border border-border bg-card p-6">
            <promise.icon className="h-6 w-6 text-maroon mb-4" />
            <h3 className="font-display text-2xl">{promise.title}</h3>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{promise.text}</p>
          </div>
        ))}
      </section>

      <section className="container pb-20">
        <div className="bg-secondary border border-border p-8 md:p-12 grid md:grid-cols-2 gap-8">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-maroon">Care & Policies</p>
            <h2 className="font-display text-4xl mt-2">Designed for confident boutique shopping.</h2>
          </div>
          <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
            <p>Most sarees are best dry cleaned and stored folded in breathable fabric covers. Avoid direct perfume spray on zari and tissue silk.</p>
            <p>Shipping is available across India. We maintain a strict no return and no exchange policy to ensure the highest quality of our handpicked sarees.</p>
          </div>
        </div>
      </section>
    </StoreLayout>
  );
};

export default About;

