import { Link } from "react-router-dom";
import { Facebook, Instagram, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { useCatalog } from "@/lib/api";

export function Footer() {
  const { data } = useCatalog();
  const settings = data?.settings;
  const categories = data?.categories ?? [];

  return (
    <footer className="bg-charcoal text-primary-foreground mt-24">
      <div className="container py-16 grid md:grid-cols-4 gap-10">
        <div>
          <span className="font-brand text-lg text-gold">ADHUNIK MAHAL</span>
          <p className="mt-4 text-sm text-primary-foreground/70 leading-relaxed">
            A Kolkata atelier curating handloom sarees and apparel from Bengal, South India and beyond. Every drape tells a story.
          </p>
          <div className="flex gap-3 mt-5">
            <a href={settings?.instagram || settings?.facebook || "/about"} className="h-9 w-9 grid place-items-center border border-primary-foreground/20 hover:border-gold hover:text-gold transition" aria-label="Instagram"><Instagram className="h-4 w-4" /></a>
            <a href={settings?.facebook || "/about"} className="h-9 w-9 grid place-items-center border border-primary-foreground/20 hover:border-gold hover:text-gold transition" aria-label="Facebook"><Facebook className="h-4 w-4" /></a>
            <a href={`https://wa.me/${settings?.whatsapp || ""}`} className="h-9 w-9 grid place-items-center border border-primary-foreground/20 hover:border-gold hover:text-gold transition" aria-label="WhatsApp"><MessageCircle className="h-4 w-4" /></a>
          </div>
        </div>

        <div>
          <h4 className="font-display text-lg mb-4 text-gold">Shop</h4>
          <ul className="space-y-2 text-sm text-primary-foreground/70">
            {categories.map((category) => (
              <li key={category.slug}><Link to={`/shop?cat=${category.slug}`} className="hover:text-gold">{category.name}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-display text-lg mb-4 text-gold">Policies</h4>
          <ul className="space-y-2 text-sm text-primary-foreground/70">
            <li><Link to="/about" className="hover:text-gold">Shipping & Delivery</Link></li>
            <li><Link to="/about" className="hover:text-gold">Returns & Exchange</Link></li>
            <li><Link to="/about" className="hover:text-gold">Saree Care Guide</Link></li>
            <li><Link to="/about" className="hover:text-gold">Privacy Policy</Link></li>
            <li><Link to="/about" className="hover:text-gold">Terms of Service</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-lg mb-4 text-gold">Visit Us</h4>
          <ul className="space-y-3 text-sm text-primary-foreground/70">
            <li className="flex gap-2"><MapPin className="h-4 w-4 mt-0.5 text-gold shrink-0" /> {settings?.address}</li>
            <li className="flex gap-2"><Phone className="h-4 w-4 mt-0.5 text-gold shrink-0" /> {settings?.whatsappDisplay}</li>
            <li className="flex gap-2"><Mail className="h-4 w-4 mt-0.5 text-gold shrink-0" /> {settings?.email}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10">
        <div className="container py-5 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-primary-foreground/50">
          <p>© {new Date().getFullYear()} Adhunik Mahal · Crafted in Kolkata</p>
          <p>All India Shipping · WhatsApp Booking</p>
        </div>
      </div>
    </footer>
  );
}
