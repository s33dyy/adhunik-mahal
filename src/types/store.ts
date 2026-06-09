export type ProductStatus = "active" | "draft";
export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

export type Category = {
  slug: string;
  name: string;
  description: string;
  imageUrl: string;
  image: string;
  active: boolean;
  count: number;
  sortOrder: number;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  categorySlug: string;
  category: string;
  sku: string;
  fabric: string;
  occasion: string;
  color: string;
  description: string;
  imageUrl: string;
  image: string;
  gallery: string[];
  featured: boolean;
  inStock: boolean;
  status: ProductStatus;
  tag?: string;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
};

export type HeroSlide = {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  img: string;
  ctaLabel: string;
  cta: string;
  ctaHref: string;
  to: string;
  align: "left" | "right";
  active: boolean;
  sortOrder: number;
};

export type StoreSettings = {
  name: string;
  tagline: string;
  whatsapp: string;
  whatsappDisplay: string;
  email: string;
  address: string;
  facebook: string;
  instagram: string;
  notice: string;
};

export type OrderItem = {
  productId: string;
  slug: string;
  name: string;
  sku: string;
  imageUrl: string;
  qty: number;
};

export type Order = {
  id: string;
  customerName: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  notes: string;
  items: OrderItem[];
  itemCount: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
};

export type Catalog = {
  categories: Category[];
  products: Product[];
  featuredProducts: Product[];
  heroSlides: HeroSlide[];
  settings: StoreSettings;
};

