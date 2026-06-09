import { ChangeEvent, FormEvent, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Edit2, GripVertical, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api, useAdminCategories, useInvalidateStore } from "@/lib/api";
import type { Category } from "@/types/store";

const blankCategory: Partial<Category> = {
  name: "",
  slug: "",
  description: "",
  imageUrl: "",
  active: true,
  sortOrder: 0,
};

const AdminCategories = () => {
  const invalidate = useInvalidateStore();
  const { data } = useAdminCategories();
  const categories = data?.categories ?? [];
  const [editing, setEditing] = useState<Partial<Category>>(blankCategory);
  const [editingSlug, setEditingSlug] = useState<string | undefined>();

  const save = useMutation({
    mutationFn: () => api.saveCategory(editing, editingSlug),
    onSuccess: () => {
      toast.success(editingSlug ? "Category updated" : "Category created");
      setEditing(blankCategory);
      setEditingSlug(undefined);
      invalidate();
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not save category"),
  });

  const remove = useMutation({
    mutationFn: api.deleteCategory,
    onSuccess: () => {
      toast.success("Category deleted");
      invalidate();
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not delete category"),
  });

  const upload = useMutation({
    mutationFn: api.uploadImage,
    onSuccess: ({ url }) => setEditing((category) => ({ ...category, imageUrl: url })),
    onError: (error) => toast.error(error instanceof Error ? error.message : "Upload failed"),
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    save.mutate();
  };

  const readUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => upload.mutate({ fileName: file.name, dataUrl: String(reader.result) });
    reader.readAsDataURL(file);
  };

  const edit = (category: Category) => {
    setEditing(category);
    setEditingSlug(category.slug);
  };

  const toggle = (category: Category) => {
    api.saveCategory({ ...category, active: !category.active }, category.slug)
      .then(() => {
        toast.success("Category updated");
        invalidate();
      })
      .catch((error) => toast.error(error instanceof Error ? error.message : "Update failed"));
  };

  return (
    <AdminLayout title="Categories" subtitle="Organize your catalog into beautiful collections">
      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <div className="bg-background border border-border">
          <div className="p-4 border-b border-border flex justify-between items-center">
            <h3 className="font-display text-xl">All Categories ({categories.length})</h3>
            <Button onClick={() => { setEditing(blankCategory); setEditingSlug(undefined); }} className="h-9 rounded-none bg-maroon hover:bg-maroon-deep"><Plus className="h-4 w-4 mr-2" /> New Category</Button>
          </div>
          <div className="divide-y divide-border">
            {categories.map((category) => (
              <div key={category.slug} className="p-4 flex items-center gap-4 hover:bg-secondary/30">
                <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                <img src={category.imageUrl} alt="" className="h-14 w-14 object-cover bg-secondary" />
                <div className="flex-1">
                  <p className="font-medium">{category.name}</p>
                  <p className="text-xs text-muted-foreground">/{category.slug} · {category.count} products · sort {category.sortOrder}</p>
                </div>
                <label className="relative inline-block w-9 h-5 cursor-pointer">
                  <input type="checkbox" checked={category.active} onChange={() => toggle(category)} className="peer sr-only" />
                  <span className="absolute inset-0 bg-muted peer-checked:bg-bottle transition rounded-full" />
                  <span className="absolute top-0.5 left-0.5 w-4 h-4 bg-background rounded-full peer-checked:translate-x-4 transition" />
                </label>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => edit(category)}><Edit2 className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => remove.mutate(category.slug)}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={submit} className="bg-background border border-border p-5">
          <h3 className="font-display text-xl mb-4">{editingSlug ? "Edit Category" : "Add Category"}</h3>
          <div className="space-y-4 text-sm">
            <div><label className="text-xs uppercase tracking-widest text-muted-foreground">Name</label><Input value={editing.name || ""} onChange={(event) => setEditing((category) => ({ ...category, name: event.target.value }))} className="mt-1 rounded-none" placeholder="Linen Sarees" required /></div>
            <div><label className="text-xs uppercase tracking-widest text-muted-foreground">Slug</label><Input value={editing.slug || ""} onChange={(event) => setEditing((category) => ({ ...category, slug: event.target.value }))} className="mt-1 rounded-none" placeholder="linen-sarees" disabled={Boolean(editingSlug)} /></div>
            <div><label className="text-xs uppercase tracking-widest text-muted-foreground">Description</label><Textarea value={editing.description || ""} onChange={(event) => setEditing((category) => ({ ...category, description: event.target.value }))} rows={3} className="mt-1 rounded-none" /></div>
            <div><label className="text-xs uppercase tracking-widest text-muted-foreground">Sort Order</label><Input type="number" value={editing.sortOrder ?? 0} onChange={(event) => setEditing((category) => ({ ...category, sortOrder: Number(event.target.value) }))} className="mt-1 rounded-none" /></div>
            <div>
              <label className="text-xs uppercase tracking-widest text-muted-foreground">Cover Image</label>
              <Input value={editing.imageUrl || ""} onChange={(event) => setEditing((category) => ({ ...category, imageUrl: event.target.value }))} className="mt-1 rounded-none" placeholder="/catalog/saree.jpg" required />
              {editing.imageUrl && <img src={editing.imageUrl} alt="" className="mt-2 h-28 w-full object-cover bg-secondary" />}
              <label className="mt-2 border-2 border-dashed border-border p-4 text-center text-muted-foreground text-xs flex items-center justify-center cursor-pointer hover:border-maroon hover:text-maroon">
                <Upload className="h-4 w-4 mr-2" /> {upload.isPending ? "Uploading…" : "Upload cover image"}
                <input type="file" accept="image/png,image/jpeg,image/webp" onChange={readUpload} className="hidden" />
              </label>
            </div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.active !== false} onChange={(event) => setEditing((category) => ({ ...category, active: event.target.checked }))} /> Active in storefront</label>
            <Button disabled={save.isPending} className="w-full rounded-none bg-maroon hover:bg-maroon-deep h-10">{editingSlug ? "Update Category" : "Create Category"}</Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AdminCategories;
