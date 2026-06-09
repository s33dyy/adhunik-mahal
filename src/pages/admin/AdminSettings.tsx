import { FormEvent, useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api, useInvalidateStore } from "@/lib/api";
import type { StoreSettings } from "@/types/store";

const AdminSettings = () => {
  const invalidate = useInvalidateStore();
  const { data } = useQuery({ queryKey: ["admin-settings"], queryFn: api.settings });
  const [settings, setSettings] = useState<Partial<StoreSettings>>({});

  useEffect(() => {
    if (data?.settings) setSettings(data.settings);
  }, [data]);

  const save = useMutation({
    mutationFn: () => api.saveSettings(settings),
    onSuccess: () => {
      toast.success("Store settings saved");
      invalidate();
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not save settings"),
  });

  const set = (key: keyof StoreSettings, value: string) => setSettings((current) => ({ ...current, [key]: value }));

  const submit = (event: FormEvent) => {
    event.preventDefault();
    save.mutate();
  };

  return (
    <AdminLayout title="Store Settings" subtitle="Update the public contact details and storefront notice">
      <form onSubmit={submit} className="bg-background border border-border p-5 max-w-3xl space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className="text-xs uppercase tracking-widest text-muted-foreground">Store Name</label><Input value={settings.name || ""} onChange={(event) => set("name", event.target.value)} className="mt-1 rounded-none" /></div>
          <div><label className="text-xs uppercase tracking-widest text-muted-foreground">Tagline</label><Input value={settings.tagline || ""} onChange={(event) => set("tagline", event.target.value)} className="mt-1 rounded-none" /></div>
          <div><label className="text-xs uppercase tracking-widest text-muted-foreground">WhatsApp Digits</label><Input value={settings.whatsapp || ""} onChange={(event) => set("whatsapp", event.target.value)} className="mt-1 rounded-none" /></div>
          <div><label className="text-xs uppercase tracking-widest text-muted-foreground">Display Phone</label><Input value={settings.whatsappDisplay || ""} onChange={(event) => set("whatsappDisplay", event.target.value)} className="mt-1 rounded-none" /></div>
          <div><label className="text-xs uppercase tracking-widest text-muted-foreground">Email</label><Input value={settings.email || ""} onChange={(event) => set("email", event.target.value)} className="mt-1 rounded-none" /></div>
          <div><label className="text-xs uppercase tracking-widest text-muted-foreground">Facebook</label><Input value={settings.facebook || ""} onChange={(event) => set("facebook", event.target.value)} className="mt-1 rounded-none" /></div>
        </div>
        <div><label className="text-xs uppercase tracking-widest text-muted-foreground">Top Notice</label><Input value={settings.notice || ""} onChange={(event) => set("notice", event.target.value)} className="mt-1 rounded-none" /></div>
        <div><label className="text-xs uppercase tracking-widest text-muted-foreground">Address</label><Textarea value={settings.address || ""} onChange={(event) => set("address", event.target.value)} className="mt-1 rounded-none" rows={3} /></div>
        <Button disabled={save.isPending} className="rounded-none bg-maroon hover:bg-maroon-deep">Save Settings</Button>
      </form>
    </AdminLayout>
  );
};

export default AdminSettings;
