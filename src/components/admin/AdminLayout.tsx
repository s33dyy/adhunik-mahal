import { Link, NavLink, useNavigate } from "react-router-dom";
import { ReactNode } from "react";
import { LayoutDashboard, Package, FolderTree, Star, Image, ShoppingCart, LogOut, Settings, Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const nav = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: FolderTree },
  { to: "/admin/featured", label: "Featured", icon: Star },
  { to: "/admin/hero", label: "Hero Slides", icon: Image },
  { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
];

export function AdminLayout({ children, title, subtitle }: { children: ReactNode; title: string; subtitle?: string }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const logout = async () => {
    await api.adminLogout();
    queryClient.setQueryData(["admin-session"], { authenticated: false });
    toast.success("Signed out");
    navigate("/admin/login", { replace: true });
  };
  return (
    <div className="min-h-screen bg-secondary/40 flex">
      <aside className="w-60 bg-charcoal text-primary-foreground flex flex-col">
        <Link to="/admin" className="p-5 border-b border-primary-foreground/10">
          <span className="font-brand text-gold text-sm">ADHUNIK MAHAL</span>
          <p className="text-[10px] uppercase tracking-widest text-primary-foreground/50 mt-1">Admin Panel</p>
        </Link>
        <nav className="flex-1 p-3 space-y-1">
          {nav.map(n => (
            <NavLink key={n.to} to={n.to} end={n.end}
              className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded text-sm transition ${isActive ? "bg-maroon text-primary-foreground" : "text-primary-foreground/70 hover:bg-primary-foreground/10"}`}>
              <n.icon className="h-4 w-4" /> {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-primary-foreground/10 space-y-1">
          <button onClick={() => navigate("/admin/settings")} className="flex items-center gap-3 px-3 py-2 rounded text-sm w-full text-primary-foreground/70 hover:bg-primary-foreground/10">
            <Settings className="h-4 w-4" /> Settings
          </button>
          <button onClick={logout} className="flex items-center gap-3 px-3 py-2 rounded text-sm w-full text-primary-foreground/70 hover:bg-primary-foreground/10">
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-background border-b border-border flex items-center px-6 gap-4 sticky top-0 z-30">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search products, orders, customers…" className="pl-9 h-9 bg-secondary border-secondary" />
          </div>
          <Button variant="ghost" size="icon"><Bell className="h-4 w-4" /></Button>
          <div className="flex items-center gap-3 pl-3 border-l border-border">
            <div className="h-8 w-8 rounded-full bg-maroon text-primary-foreground grid place-items-center text-xs font-medium">AM</div>
            <div className="text-xs">
              <p className="font-medium">Admin</p>
              <p className="text-muted-foreground">Owner</p>
            </div>
          </div>
        </header>
        <div className="px-6 py-8 flex-1">
          <div className="mb-6">
            <h1 className="font-display text-3xl">{title}</h1>
            {subtitle && <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
