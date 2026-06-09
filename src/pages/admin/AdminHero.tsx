import { ChangeEvent, FormEvent, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Edit2, GripVertical, Image as ImageIcon, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api, useAdminHero, useInvalidateStore } from "@/lib/api";
import type { HeroSlide } from "@/types/store";

const blankSlide: Partial<HeroSlide> = {
  eyebrow: "",
  title: "",
  subtitle: "",
  imageUrl: "",
  ctaLabel: "Shop Now",
  ctaHref: "/shop",
  align: "left",
  active: true,
  sortOrder: 0,
};

const AdminHero = () => {
  const invalidate = useInvalidateStore();
  const { data } = useAdminHero();
  const slides = data?.heroSlides ?? [];
  const [editing, setEditing] = useState<Partial<HeroSlide>>(blankSlide);
  const [editingId, setEditingId] = useState<string | undefined>();

  const save = useMutation({
    mutationFn: () => api.saveHero(editing, editingId),
    onSuccess: () => {
      toast.success(editingId ? "Hero slide updated" : "Hero slide created");
      setEditing(blankSlide);
      setEditingId(undefined);
      invalidate();
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not save hero slide"),
  });

  const remove = useMutation({
    mutationFn: api.deleteHero,
    onSuccess: () => {
      toast.success("Hero slide deleted");
      invalidate();
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not delete hero slide"),
  });

  const upload = useMutation({
    mutationFn: api.uploadImage,
    onSuccess: ({ url }) => setEditing((slide) => ({ ...slide, imageUrl: url })),
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

  const edit = (slide: HeroSlide) => {
    setEditing(slide);
    setEditingId(slide.id);
  };

  const quickToggle = (slide: HeroSlide) => {
    api.saveHero({ ...slide, active: !slide.active }, slide.id)
      .then(() => {
        toast.success("Hero slide updated");
        invalidate();
      })
      .catch((error) => toast.error(error instanceof Error ? error.message : "Update failed"));
  };

  return (
    <AdminLayout title="Hero Slides" subtitle="Curate the stories that greet your customers">
      <form onSubmit={submit} className="bg-background border border-border p-5 mb-6 grid lg:grid-cols-[1fr_280px] gap-5">
        <div className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <Input value={editing.eyebrow || ""} onChange={(event) => setEditing((slide) => ({ ...slide, eyebrow: event.target.value }))} placeholder="Eyebrow" className="rounded-none" />
            <Input value={editing.ctaLabel || ""} onChange={(event) => setEditing((slide) => ({ ...slide, ctaLabel: event.target.value }))} placeholder="CTA label" className="rounded-none" />
          </div>
          <Input value={editing.title || ""} onChange={(event) => setEditing((slide) => ({ ...slide, title: event.target.value }))} placeholder="Hero title" className="rounded-none" required />
          <Textarea value={editing.subtitle || ""} onChange={(event) => setEditing((slide) => ({ ...slide, subtitle: event.target.value }))} placeholder="Subtitle" rows={2} className="rounded-none" />
          <div className="grid sm:grid-cols-4 gap-3">
            <Input value={editing.ctaHref || ""} onChange={(event) => setEditing((slide) => ({ ...slide, ctaHref: event.target.value }))} placeholder="/shop" className="rounded-none sm:col-span-2" />
            <select value={editing.align || "left"} onChange={(event) => setEditing((slide) => ({ ...slide, align: event.target.value as "left" | "right" }))} className="h-10 border border-border bg-background px-3 text-sm">
              <option value="left">Left aligned</option>
              <option value="right">Right aligned</option>
            </select>
            <Input type="number" value={editing.sortOrder ?? 0} onChange={(event) => setEditing((slide) => ({ ...slide, sortOrder: Number(event.target.value) }))} className="rounded-none" placeholder="Sort" />
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.active !== false} onChange={(event) => setEditing((slide) => ({ ...slide, active: event.target.checked }))} /> Active on homepage</label>
        </div>
        <div>
          <div className="h-36 bg-secondary border border-border overflow-hidden mb-3">
            {editing.imageUrl ? <img src={editing.imageUrl} alt="" className="h-full w-full object-cover" /> : <div className="h-full grid place-items-center text-xs text-muted-foreground">No image</div>}
          </div>
          <Input value={editing.imageUrl || ""} onChange={(event) => setEditing((slide) => ({ ...slide, imageUrl: event.target.value }))} placeholder="/catalog/hero-1.jpg" className="rounded-none mb-3" required />
          <label className="h-10 border border-dashed border-border hover:border-maroon cursor-pointer flex items-center justify-center text-xs uppercase tracking-widest">
            <Upload className="h-4 w-4 mr-2" /> {upload.isPending ? "Uploading…" : "Upload image"}
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={readUpload} className="hidden" />
          </label>
          <Button disabled={save.isPending} className="w-full mt-3 h-10 rounded-none bg-maroon hover:bg-maroon-deep"><Plus className="h-4 w-4 mr-2" /> {editingId ? "Update Slide" : "New Slide"}</Button>
        </div>
      </form>

      <div className="space-y-3">
        {slides.map((slide, index) => (
          <div key={slide.id} className="bg-background border border-border p-4 flex items-center gap-4">
            <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
            <span className="text-xs font-medium text-muted-foreground w-6">{String(index + 1).padStart(2, "0")}</span>
            <img src={slide.imageUrl} alt="" className="h-20 w-32 object-cover bg-secondary" />
            <div className="flex-1">
              <p className="font-display text-lg whitespace-pre-line">{slide.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">CTA: <span className="text-foreground">{slide.ctaLabel}</span> → {slide.ctaHref}</p>
            </div>
            <span className={`text-[10px] uppercase tracking-widest px-2 py-1 border ${slide.active ? "bg-bottle/10 text-bottle border-bottle/20" : "bg-muted text-muted-foreground border-border"}`}>{slide.active ? "Active" : "Hidden"}</span>
            <label className="relative inline-block w-9 h-5 cursor-pointer">
              <input type="checkbox" checked={slide.active} onChange={() => quickToggle(slide)} className="peer sr-only" />
              <span className="absolute inset-0 bg-muted peer-checked:bg-maroon transition rounded-full" />
              <span className="absolute top-0.5 left-0.5 w-4 h-4 bg-background rounded-full peer-checked:translate-x-4 transition" />
            </label>
            <Button variant="ghost" size="icon" onClick={() => edit(slide)}><Edit2 className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => remove.mutate(slide.id)}><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}
        {slides.length === 0 && (
          <div className="w-full border-2 border-dashed border-border p-8 text-center text-muted-foreground">
            <ImageIcon className="h-6 w-6 mx-auto mb-2" />
            <p className="text-sm">Add a hero slide to populate the homepage carousel.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminHero;
