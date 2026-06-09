import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Catalog, Category, HeroSlide, Order, OrderStatus, Product, StoreSettings } from "@/types/store";

type RequestOptions = RequestInit & { json?: unknown };

async function request<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const init: RequestInit = {
    ...options,
    credentials: "include",
    headers: {
      ...(options.json ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
    body: options.json ? JSON.stringify(options.json) : options.body,
  };
  const res = await fetch(url, init);
  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await res.json() : await res.text();
  if (!res.ok) {
    throw new Error(typeof data === "object" && data && "error" in data ? String(data.error) : `Request failed: ${res.status}`);
  }
  return data as T;
}

export type ProductFilters = {
  q?: string;
  cat?: string;
  fabric?: string;
  occasion?: string;
  stock?: string;
  status?: string;
  minPrice?: string | number;
  maxPrice?: string | number;
  sort?: string;
};

function queryString(filters: ProductFilters = {}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && String(value) !== "") params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export const api = {
  catalog: () => request<Catalog>("/api/catalog"),
  products: (filters?: ProductFilters) => request<{ products: Product[] }>(`/api/products${queryString(filters)}`),
  product: (slug: string) => request<{ product: Product; related: Product[] }>(`/api/products/${encodeURIComponent(slug)}`),
  trackOrder: (id: string, phone: string) => request<{ order: Order }>(`/api/orders/track?id=${encodeURIComponent(id)}&phone=${encodeURIComponent(phone)}`),
  createOrder: (payload: unknown) => request<{ order: Order; settings: StoreSettings }>("/api/orders", { method: "POST", json: payload }),

  adminSession: () => request<{ authenticated: boolean; user?: { email: string } }>("/api/admin/session"),
  adminLogin: (email: string, password: string) => request<{ user: { email: string } }>("/api/admin/login", { method: "POST", json: { email, password } }),
  adminLogout: () => request<{ ok: boolean }>("/api/admin/logout", { method: "POST" }),
  dashboard: () => request<{ stats: Record<string, number>; recentOrders: Order[]; topProducts: (Product & { sold: number })[] }>("/api/admin/dashboard"),
  adminProducts: (filters?: ProductFilters) => request<{ products: Product[] }>(`/api/admin/products${queryString(filters)}`),
  saveProduct: (product: Partial<Product>, id?: string) => request<{ product: Product }>(id ? `/api/admin/products/${encodeURIComponent(id)}` : "/api/admin/products", { method: id ? "PUT" : "POST", json: product }),
  deleteProduct: (id: string) => request<{ ok: boolean }>(`/api/admin/products/${encodeURIComponent(id)}`, { method: "DELETE" }),
  adminCategories: () => request<{ categories: Category[] }>("/api/admin/categories"),
  saveCategory: (category: Partial<Category>, slug?: string) => request<{ category: Category }>(slug ? `/api/admin/categories/${encodeURIComponent(slug)}` : "/api/admin/categories", { method: slug ? "PUT" : "POST", json: category }),
  deleteCategory: (slug: string) => request<{ ok: boolean }>(`/api/admin/categories/${encodeURIComponent(slug)}`, { method: "DELETE" }),
  setFeatured: (productIds: string[]) => request<{ products: Product[] }>("/api/admin/featured", { method: "PUT", json: { productIds } }),
  adminHero: () => request<{ heroSlides: HeroSlide[] }>("/api/admin/hero"),
  saveHero: (slide: Partial<HeroSlide>, id?: string) => request<{ heroSlide: HeroSlide }>(id ? `/api/admin/hero/${encodeURIComponent(id)}` : "/api/admin/hero", { method: id ? "PUT" : "POST", json: slide }),
  deleteHero: (id: string) => request<{ ok: boolean }>(`/api/admin/hero/${encodeURIComponent(id)}`, { method: "DELETE" }),
  adminOrders: (filters?: { q?: string; status?: string }) => request<{ orders: Order[] }>(`/api/admin/orders${queryString(filters)}`),
  updateOrderStatus: (id: string, status: OrderStatus) => request<{ order: Order }>(`/api/admin/orders/${encodeURIComponent(id)}`, { method: "PUT", json: { status } }),
  uploadImage: (payload: { fileName: string; dataUrl: string }) => request<{ url: string }>("/api/admin/uploads", { method: "POST", json: payload }),
  settings: () => request<{ settings: StoreSettings }>("/api/admin/settings"),
  saveSettings: (settings: Partial<StoreSettings>) => request<{ settings: StoreSettings }>("/api/admin/settings", { method: "PUT", json: settings }),
};

export function useCatalog() {
  return useQuery({ queryKey: ["catalog"], queryFn: api.catalog });
}

export function useProducts(filters?: ProductFilters) {
  return useQuery({ queryKey: ["products", filters], queryFn: () => api.products(filters) });
}

export function useProduct(slug: string | undefined) {
  return useQuery({ queryKey: ["product", slug], queryFn: () => api.product(slug || ""), enabled: Boolean(slug) });
}

export function useAdminSession() {
  return useQuery({ queryKey: ["admin-session"], queryFn: api.adminSession, retry: false });
}

export function useAdminProducts(filters?: ProductFilters) {
  return useQuery({ queryKey: ["admin-products", filters], queryFn: () => api.adminProducts(filters) });
}

export function useAdminCategories() {
  return useQuery({ queryKey: ["admin-categories"], queryFn: api.adminCategories });
}

export function useAdminHero() {
  return useQuery({ queryKey: ["admin-hero"], queryFn: api.adminHero });
}

export function useAdminOrders(filters?: { q?: string; status?: string }) {
  return useQuery({ queryKey: ["admin-orders", filters], queryFn: () => api.adminOrders(filters) });
}

export function useInvalidateStore() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["catalog"] });
    queryClient.invalidateQueries({ queryKey: ["products"] });
    queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
    queryClient.invalidateQueries({ queryKey: ["admin-hero"] });
    queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  };
}

export function useUploadImage() {
  return useMutation({ mutationFn: api.uploadImage });
}

