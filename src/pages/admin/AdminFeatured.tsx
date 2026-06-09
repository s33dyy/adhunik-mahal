import { useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { api, useAdminProducts, useInvalidateStore } from "@/lib/api";

const AdminFeatured = () => {
  const invalidate = useInvalidateStore();
  const { data } = useAdminProducts({ status: "active" });
  const products = useMemo(() => data?.products ?? [], [data?.products]);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    setSelected(products.filter((product) => product.featured).map((product) => product.id).slice(0, 4));
  }, [products]);

  const save = useMutation({
    mutationFn: api.setFeatured,
    onSuccess: () => {
      toast.success("Featured products updated");
      invalidate();
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not update featured products"),
  });

  const toggle = (id: string) => {
    setSelected((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (current.length >= 4) {
        toast.error("Choose exactly 4 featured products. Remove one first.");
        return current;
      }
      return [...current, id];
    });
  };

  return (
    <AdminLayout title="Featured Products" subtitle="Choose exactly 4 pieces to feature on your homepage">
      <div className="bg-maroon/5 border border-maroon/20 p-4 mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Star className="h-5 w-5 text-maroon shrink-0" />
          <p className="text-sm">Featured products appear in the curated section of your homepage. Selected <strong>{selected.length}/4</strong>.</p>
        </div>
        <Button disabled={selected.length !== 4 || save.isPending} onClick={() => save.mutate(selected)} className="rounded-none bg-maroon hover:bg-maroon-deep">Save Featured</Button>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {products.map((product) => (
          <label key={product.id} className="relative bg-background border border-border cursor-pointer group has-[:checked]:border-maroon has-[:checked]:ring-2 has-[:checked]:ring-maroon/30">
            <input type="checkbox" checked={selected.includes(product.id)} onChange={() => toggle(product.id)} className="absolute top-3 right-3 z-10 h-5 w-5 accent-maroon" />
            <div className="aspect-[4/5] bg-secondary overflow-hidden">
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
            </div>
            <div className="p-3">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{product.fabric}</p>
              <p className="font-display text-base truncate">{product.name}</p>
              <p className="text-sm text-maroon font-medium mt-1">₹{product.price.toLocaleString("en-IN")}</p>
            </div>
            {selected.includes(product.id) && <span className="absolute top-3 left-3 bg-maroon text-primary-foreground text-[10px] uppercase tracking-widest px-2 py-1">Featured</span>}
          </label>
        ))}
      </div>
    </AdminLayout>
  );
};

export default AdminFeatured;
