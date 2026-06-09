import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Edit2, Filter, Plus, Search, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api, useAdminCategories, useAdminProducts, useInvalidateStore } from "@/lib/api";
import type { Product } from "@/types/store";

const blankProduct: Partial<Product> = {
  name: "",
  sku: "",
  categorySlug: "silk-sarees",
  fabric: "",
  occasion: "",
  color: "",
  description: "",
  imageUrl: "",
  gallery: [],
  featured: false,
  status: "active",
  tag: "",
  sortOrder: 0,
};

const AdminProducts = () => {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateStore();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [editing, setEditing] = useState<Partial<Product>>(blankProduct);
  const [editingId, setEditingId] = useState<string | undefined>();
  const { data } = useAdminProducts({ q: search, status });
  const { data: categoryData } = useAdminCategories();
  const products = data?.products ?? [];
  const categories = categoryData?.categories ?? [];
  const subtitle = useMemo(() => `${products.length} pieces in your catalog`, [products.length]);

  const save = useMutation({
    mutationFn: () => api.saveProduct(editing, editingId),
    onSuccess: () => {
      toast.success(editingId ? "Product updated" : "Product created");
      setEditing(blankProduct);
      setEditingId(undefined);
      invalidate();
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not save product"),
  });

  const remove = useMutation({
    mutationFn: api.deleteProduct,
    onSuccess: () => {
      toast.success("Product deleted");
      invalidate();
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not delete product"),
  });

  const upload = useMutation({
    mutationFn: api.uploadImage,
    onSuccess: ({ url }) => setEditing((product) => ({ ...product, imageUrl: url, gallery: Array.from(new Set([...(product.gallery ?? []), url])) })),
    onError: (error) => toast.error(error instanceof Error ? error.message : "Upload failed"),
  });

  const set = (key: keyof Product, value: unknown) => setEditing((product) => ({ ...product, [key]: value }));

  const submit = (event: FormEvent) => {
    event.preventDefault();
    save.mutate();
  };

  const choose = (product: Product) => {
    setEditing(product);
    setEditingId(product.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const readUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => upload.mutate({ fileName: file.name, dataUrl: String(reader.result) });
    reader.readAsDataURL(file);
  };

  const quickToggle = (product: Product, patch: Partial<Product>) => {
    api.saveProduct({ ...product, ...patch }, product.id)
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ["admin-products"] });
        queryClient.invalidateQueries({ queryKey: ["catalog"] });
        toast.success("Product updated");
      })
      .catch((error) => toast.error(error instanceof Error ? error.message : "Update failed"));
  };

  return (
    <AdminLayout title="Products" subtitle={subtitle}>
      <form onSubmit={submit} className="bg-background border border-border p-5 mb-6 grid lg:grid-cols-[1fr_280px] gap-6">
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <Input value={editing.name || ""} onChange={(event) => set("name", event.target.value)} placeholder="Product name" className="rounded-none" required />
            <Input value={editing.sku || ""} onChange={(event) => set("sku", event.target.value)} placeholder="SKU" className="rounded-none" required />
          </div>
          <div className="grid sm:grid-cols-4 gap-3">
            <select value={editing.categorySlug || ""} onChange={(event) => set("categorySlug", event.target.value)} className="h-10 border border-border bg-background px-3 text-sm">
              {categories.map((category) => <option key={category.slug} value={category.slug}>{category.name}</option>)}
            </select>
          </div>
          <div className="grid sm:grid-cols-4 gap-3">
            <Input value={editing.fabric || ""} onChange={(event) => set("fabric", event.target.value)} placeholder="Fabric" className="rounded-none" />
            <Input value={editing.occasion || ""} onChange={(event) => set("occasion", event.target.value)} placeholder="Occasion" className="rounded-none" />
            <Input value={editing.color || ""} onChange={(event) => set("color", event.target.value)} placeholder="Colour" className="rounded-none" />
            <Input value={editing.tag || ""} onChange={(event) => set("tag", event.target.value)} placeholder="Tag" className="rounded-none" />
          </div>
          <Textarea value={editing.description || ""} onChange={(event) => set("description", event.target.value)} placeholder="Description" rows={3} className="rounded-none" />
          <div className="grid sm:grid-cols-4 gap-3 text-sm">
            <select value={editing.status || "active"} onChange={(event) => set("status", event.target.value)} className="h-10 border border-border bg-background px-3">
              <option value="active">Active</option>
              <option value="draft">Draft</option>
            </select>
            <label className="flex items-center gap-2 h-10 px-3 border border-border"><input type="checkbox" checked={Boolean(editing.featured)} onChange={(event) => set("featured", event.target.checked)} /> Featured</label>
            <Input type="number" value={editing.sortOrder ?? 0} onChange={(event) => set("sortOrder", Number(event.target.value))} placeholder="Sort" className="rounded-none" />
          </div>
        </div>
        <div>
          <div className="aspect-[4/5] bg-secondary border border-border overflow-hidden mb-3">
            {editing.imageUrl ? <img src={editing.imageUrl} alt="" className="h-full w-full object-cover" /> : <div className="h-full grid place-items-center text-xs text-muted-foreground">No image</div>}
          </div>
          <Input value={editing.imageUrl || ""} onChange={(event) => set("imageUrl", event.target.value)} placeholder="/catalog/saree.jpg" className="rounded-none mb-3" />
          <label className="h-10 border border-dashed border-border hover:border-maroon cursor-pointer flex items-center justify-center text-xs uppercase tracking-widest">
            <Upload className="h-4 w-4 mr-2" /> {upload.isPending ? "Uploading…" : "Upload image"}
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={readUpload} className="hidden" />
          </label>
          <Button type="submit" disabled={save.isPending} className="w-full mt-3 rounded-none bg-maroon hover:bg-maroon-deep">{editingId ? "Update Product" : "Create Product"}</Button>
          {editingId && <Button type="button" variant="outline" onClick={() => { setEditing(blankProduct); setEditingId(undefined); }} className="w-full mt-2 rounded-none">Cancel Edit</Button>}
        </div>
      </form>

      <div className="bg-background border border-border">
        <div className="p-4 border-b border-border flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products…" className="pl-9 h-9 rounded-none" />
          </div>
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-9 border border-border bg-background px-3 text-sm">
            <option value="all">All status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
          </select>
          <Button variant="outline" className="h-9 rounded-none"><Filter className="h-4 w-4 mr-2" /> Filter</Button>
          <Button onClick={() => { setEditing(blankProduct); setEditingId(undefined); }} className="h-9 rounded-none bg-maroon hover:bg-maroon-deep"><Plus className="h-4 w-4 mr-2" /> Add Product</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[980px]">
            <thead className="bg-secondary/50 text-xs uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="p-3 text-left">Product</th>
                <th className="p-3 text-left">Category</th>
                <th className="p-3 text-left">Fabric</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Featured</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-t border-border hover:bg-secondary/30">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <img src={product.imageUrl} alt="" className="h-12 w-12 object-cover bg-secondary" />
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-muted-foreground capitalize">{product.categorySlug.replace("-", " ")}</td>
                  <td className="p-3 text-muted-foreground">{product.fabric}</td>
                  <td className="p-3 text-center">
                    <button onClick={() => quickToggle(product, { status: product.status === "active" ? "draft" : "active" })}
                      className="text-[10px] uppercase tracking-widest px-2 py-1 border border-border bg-secondary">
                      {product.status}
                    </button>
                  </td>
                  <td className="p-3 text-center">
                    <label className="relative inline-block w-9 h-5 cursor-pointer">
                      <input type="checkbox" checked={product.featured} onChange={(event) => quickToggle(product, { featured: event.target.checked })} className="peer sr-only" />
                      <span className="absolute inset-0 bg-muted peer-checked:bg-maroon transition rounded-full" />
                      <span className="absolute top-0.5 left-0.5 w-4 h-4 bg-background rounded-full peer-checked:translate-x-4 transition" />
                    </label>
                  </td>
                  <td className="p-3 text-right">
                    <div className="inline-flex gap-1">
                      <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => choose(product)}><Edit2 className="h-3.5 w-3.5" /></Button>
                      <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => remove.mutate(product.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-border flex justify-between items-center text-xs text-muted-foreground">
          <span>Showing {products.length} products</span>
          <span>Changes persist in SQLite</span>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminProducts;
