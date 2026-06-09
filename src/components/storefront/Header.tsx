import { FormEvent, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { ChevronDown, Heart, Menu, Search, ShoppingBag, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useCart } from "@/context/CartContext";
import { useCatalog } from "@/lib/api";

const nav = [
  { label: "Home", to: "/" },
  { label: "Shop All", to: "/shop" },
  { label: "Wedding Edit", to: "/shop?cat=wedding-edit" },
  { label: "New Arrivals", to: "/shop?sort=newest" },
  { label: "About", to: "/about" },
];

export function Header() {
  const navigate = useNavigate();
  const { count, setOpen } = useCart();
  const { data } = useCatalog();
  const categories = data?.categories ?? [];
  const settings = data?.settings;
  const [menuOpen, setMenuOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [search, setSearch] = useState("");

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    const q = search.trim();
    navigate(q ? `/shop?q=${encodeURIComponent(q)}` : "/shop");
  };

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
      <div className="bg-maroon text-primary-foreground text-xs">
        <div className="container flex items-center justify-between py-2 gap-4">
          <p className="hidden sm:block tracking-wider uppercase">{settings?.notice || "Free shipping across India"}</p>
          <p className="sm:hidden text-center w-full">Free India shipping</p>
          <div className="hidden md:flex items-center gap-4 text-[11px]">
            <Link to="/track" className="hover:text-gold transition">Track Order</Link>
            <span className="opacity-40">|</span>
            <Link to="/admin/login" className="hover:text-gold transition">Admin</Link>
          </div>
        </div>
      </div>

      <div className="container py-4 flex items-center gap-6">
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden -ml-2">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] bg-background">
            <Link to="/" onClick={() => setMenuOpen(false)} className="block mb-6">
              <span className="font-brand text-lg text-maroon">ADHUNIK MAHAL</span>
            </Link>
            <nav className="flex flex-col gap-1">
              {nav.map((item) => (
                <NavLink key={item.to} to={item.to} onClick={() => setMenuOpen(false)}
                  className="py-2.5 px-3 rounded text-sm hover:bg-secondary">{item.label}</NavLink>
              ))}
              <div className="my-3 gold-divider" />
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground px-3 mb-2">Shop by Category</p>
              {categories.map((category) => (
                <Link key={category.slug} to={`/shop?cat=${category.slug}`} onClick={() => setMenuOpen(false)}
                  className="py-2 px-3 rounded text-sm hover:bg-secondary">{category.name}</Link>
              ))}
              <div className="my-3 gold-divider" />
              <Link to="/track" onClick={() => setMenuOpen(false)} className="py-2 px-3 text-sm">Track Order</Link>
              <Link to="/admin/login" onClick={() => setMenuOpen(false)} className="py-2 px-3 text-sm">Admin Login</Link>
            </nav>
          </SheetContent>
        </Sheet>

        <Link to="/" className="flex flex-col leading-none">
          <span className="font-brand text-lg md:text-xl text-maroon">ADHUNIK MAHAL</span>
          <span className="hidden md:block text-[10px] tracking-[0.25em] text-muted-foreground uppercase mt-1">{settings?.tagline}</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1 ml-6">
          {nav.slice(0, 2).map((item) => (
            <NavLink key={item.to} to={item.to}
              className={({ isActive }) => `px-3 py-2 text-sm hover:text-maroon transition ${isActive ? "text-maroon" : "text-foreground"}`}>
              {item.label}
            </NavLink>
          ))}
          <div className="relative" onMouseEnter={() => setMegaOpen(true)} onMouseLeave={() => setMegaOpen(false)}>
            <button className="px-3 py-2 text-sm flex items-center gap-1 hover:text-maroon">
              Categories <ChevronDown className="h-3 w-3" />
            </button>
            {megaOpen && (
              <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 w-[680px] z-50">
                <div className="bg-card border border-border shadow-elegant p-6 grid grid-cols-3 gap-6">
                  <div className="col-span-2 grid grid-cols-2 gap-3">
                    {categories.map((category) => (
                      <Link key={category.slug} to={`/shop?cat=${category.slug}`}
                        className="group flex items-center gap-3 p-2 rounded hover:bg-secondary">
                        <img src={category.imageUrl} alt={category.name} className="h-14 w-14 object-cover rounded-sm" loading="lazy" />
                        <div>
                          <div className="text-sm font-medium group-hover:text-maroon">{category.name}</div>
                          <div className="text-[11px] text-muted-foreground">{category.count} pieces</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <div className="bg-gradient-hero text-primary-foreground p-4 flex flex-col justify-end">
                    <p className="text-[10px] uppercase tracking-widest text-gold">Wedding 2026</p>
                    <h4 className="font-display text-xl mt-1">Bridal Heirlooms</h4>
                    <Link to="/shop?cat=wedding-edit" className="text-xs underline mt-2 text-gold-soft">Explore</Link>
                  </div>
                </div>
              </div>
            )}
          </div>
          {nav.slice(2).map((item) => (
            <NavLink key={item.to} to={item.to}
              className={({ isActive }) => `px-3 py-2 text-sm hover:text-maroon transition ${isActive ? "text-maroon" : "text-foreground"}`}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <form onSubmit={submitSearch} className="hidden md:flex flex-1 max-w-md ml-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(event) => setSearch(event.target.value)}
            placeholder="Search sarees, fabrics, occasions…" className="pl-9 bg-secondary border-secondary focus-visible:ring-maroon" />
        </form>

        <div className="flex items-center gap-1 md:ml-2 ml-auto">
          <Button variant="ghost" size="icon" className="hidden md:inline-flex" asChild>
            <Link to="/admin/login" aria-label="Account"><User className="h-5 w-5" /></Link>
          </Button>
          <Button variant="ghost" size="icon" className="hidden sm:inline-flex" asChild>
            <Link to="/shop?featured=true" aria-label="Wishlist"><Heart className="h-5 w-5" /></Link>
          </Button>
          <Button variant="ghost" size="icon" className="relative" onClick={() => setOpen(true)} aria-label="Cart">
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-maroon text-primary-foreground text-[10px] font-medium rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
                {count}
              </span>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
