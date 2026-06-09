import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";

const AdminLogin = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      await api.adminLogin(email.trim(), password);
      queryClient.setQueryData(["admin-session"], { authenticated: true, user: { email: email.trim() } });
      toast.success("Welcome back");
      navigate("/admin", { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:flex bg-gradient-hero text-primary-foreground p-12 flex-col justify-between">
        <Link to="/" className="font-brand text-gold">ADHUNIK MAHAL</Link>
        <div>
          <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-2">Atelier Console</p>
          <h2 className="font-display text-5xl leading-tight">Manage your<br/>boutique with grace.</h2>
          <p className="mt-4 text-primary-foreground/70 max-w-md">Orders, inventory, featured edits, hero stories and catalog settings are managed from this local console.</p>
        </div>
        <p className="text-xs text-primary-foreground/40">© Adhunik Mahal · Kolkata</p>
      </div>
      <div className="flex items-center justify-center p-8">
        <form onSubmit={submit} className="w-full max-w-sm space-y-6">
          <div>
            <div className="h-12 w-12 bg-maroon text-primary-foreground grid place-items-center mb-5"><Lock className="h-5 w-5" /></div>
            <h1 className="font-display text-3xl">Admin Login</h1>
            <p className="text-sm text-muted-foreground mt-1">Use the credentials from your local environment file</p>
          </div>
          <div className="space-y-4">
            <div><Label>Email</Label><Input value={email} onChange={(event) => setEmail(event.target.value)} type="email" className="mt-1 rounded-none" required /></div>
            <div><Label>Password</Label><Input value={password} onChange={(event) => setPassword(event.target.value)} type="password" className="mt-1 rounded-none" required /></div>
          </div>
          <Button type="submit" disabled={loading} className="w-full h-11 rounded-none bg-maroon hover:bg-maroon-deep">
            {loading ? "Signing in…" : "Sign in to Admin"}
          </Button>
          <Link to="/" className="block text-center text-xs text-muted-foreground hover:text-maroon">Back to store</Link>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
