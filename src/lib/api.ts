// ============================================================
//  Retail Management — API Client
//  Base: http://localhost:3000
//  Usage: import { storesApi, productsApi, ... } from '@/lib/api'
// ============================================================

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

// ─── Oracle key normalizer ────────────────────────────────────
// Oracle returns UPPER_CASE column names. This maps them to camelCase
// so components can use store.id, store.name etc. consistently.

const KEY_MAP: Record<string, string> = {
  // Stores
  STORE_ID: "storeId",
  STORE_NAME: "storeName",
  LOCATION: "location",
  MANAGER_ID: "managerId",

  // Products
  PRODUCT_ID: "productId",
  PRODUCT_NAME: "name",
  PRICE: "price",
  CATEGORY: "category",
  STOCK: "stock",
  COST: "cost",
  MARGIN: "margin",
  IS_ACTIVE: "isActive",

  // Customers
  CUSTOMER_ID: "customerId",
  CUSTOMER_NAME: "name",
  NAME: "name",
  EMAIL: "email",
  PHONE: "phone",
  ADDRESS: "address",
  CITY: "city",

  // Sales
  SALE_ID: "saleId",
  TOTAL_AMOUNT: "total",
  TOTAL: "total",
  SALE_DATE: "createdAt",
  CREATED_AT: "createdAt",
  PAYMENT_METHOD: "paymentMethod",
  TOTAL_AMT: "total", // Oracle uses TOTAL_AMT not TOTAL_AMOUNT
  RN: "rowNum",

  // Inventory
  INVENTORY_ID: "inventoryId",
  CURRENT_STOCK: "quantity",
  STOCK_STATUS: "status",
  LAST_UPDATED: "lastUpdated",
  REORDER_LEVEL: "reorderLevel",

  // Audit
  LOG_ID: "logId",
  AUDIT_ID: "auditId",
  ACTION: "action",
  TABLE_NAME: "table",
  RECORD_ID: "recordId",
  PERFORMED_BY: "performedBy",
  CHANGED_AT: "createdAt",
  SOURCE: "source",

  // Analytics
  MONTH: "month",
  TOTAL_SALES: "totalSales",
  TOTAL_REVENUE: "totalRevenue",
  TOTAL_CUSTOMERS: "totalCustomers",
  PRODUCT_COUNT: "productCount",
  REVENUE: "revenue",
  UNITS_SOLD: "unitsSold",
  STOCKED: "stocked",
};

function normalizeKey(key: string): string {
  return (
    KEY_MAP[key] ??
    key.toLowerCase().replace(/_([a-z])/g, (_, c) => c.toUpperCase())
  );
}

function normalizeRow(row: unknown): unknown {
  if (Array.isArray(row)) return row.map(normalizeRow);
  if (row !== null && typeof row === "object") {
    const normalized: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(row as Record<string, unknown>)) {
      normalized[normalizeKey(k)] = normalizeRow(v);
    }
    return normalized;
  }
  return row;
}

// ─── Generic fetcher ──────────────────────────────────────────

async function request<T>(
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  path: string,
  options?: {
    body?: unknown;
    query?: Record<string, string | number | undefined>;
  },
): Promise<T> {
  let url = `${BASE_URL}${path}`;

  if (options?.query) {
    const params = new URLSearchParams();
    Object.entries(options.query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") params.set(k, String(v));
    });
    const qs = params.toString();
    if (qs) url += `?${qs}`;
  }

  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error?.message ?? `Request failed: ${res.status}`);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  const json = await res.json();

  // Unwrap NestJS response interceptor format: { success, data }
  const raw = json?.data !== undefined ? json.data : json;

  // Normalize Oracle UPPER_CASE keys → camelCase
  return normalizeRow(raw) as T;
}

// ─── Shared types ─────────────────────────────────────────────

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// ─── Stores ───────────────────────────────────────────────────

export interface Store {
  id: number;
  name: string;
  location: string;
  managerId?: number;
  [key: string]: unknown;
}

export interface CreateStoreDto {
  name: string;
  location: string;
  managerId?: number;
  [key: string]: unknown;
}

export type UpdateStoreDto = Partial<CreateStoreDto>;

export const storesApi = {
  /** GET /stores — List all stores */
  getAll: () => request<Store[]>("GET", "/stores"),

  /** GET /stores/:id — Get store by ID */
  getOne: (id: number) => request<Store>("GET", `/stores/${id}`),

  /** POST /stores — Create a new store */
  create: (body: CreateStoreDto) => request<Store>("POST", "/stores", { body }),

  /** PUT /stores/:id — Update store by ID */
  update: (id: number, body: UpdateStoreDto) =>
    request<Store>("PUT", `/stores/${id}`, { body }),

  /** DELETE /stores/:id — Delete store by ID */
  remove: (id: number) => request<void>("DELETE", `/stores/${id}`),
};

// ─── Products ─────────────────────────────────────────────────

export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  stock?: number;
  storeId?: number;
  [key: string]: unknown;
}

export interface CreateProductDto {
  name: string;
  price: number;
  category: string;
  stock?: number;
  storeId?: number;
  [key: string]: unknown;
}

export type UpdateProductDto = Partial<CreateProductDto>;

export const productsApi = {
  /** GET /products — List all products (optional ?category=) */
  getAll: (category?: string) =>
    request<Product[]>("GET", "/products", { query: { category } }),

  /** GET /products/category/:cat — Get products by category slug */
  getByCategory: (cat: string) =>
    request<Product[]>("GET", `/products/category/${encodeURIComponent(cat)}`),

  /** GET /products/:id — Get product by ID */
  getOne: (id: number) => request<Product>("GET", `/products/${id}`),

  /** POST /products — Create a new product */
  create: (body: CreateProductDto) =>
    request<Product>("POST", "/products", { body }),

  /** PUT /products/:id — Update product by ID */
  update: (id: number, body: UpdateProductDto) =>
    request<Product>("PUT", `/products/${id}`, { body }),

  /** DELETE /products/:id — Delete product by ID */
  remove: (id: number) => request<void>("DELETE", `/products/${id}`),
};

// ─── Customers ────────────────────────────────────────────────

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  [key: string]: unknown;
}

export interface CreateCustomerDto {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  [key: string]: unknown;
}

export type UpdateCustomerDto = Partial<CreateCustomerDto>;

export const customersApi = {
  /** GET /customers — List all customers (paginated) */
  getAll: (pagination?: PaginationParams) =>
    request<PaginatedResponse<Customer>>("GET", "/customers", {
      query: pagination,
    }),

  /** GET /customers/:id — Get customer by ID */
  getOne: (id: number) => request<Customer>("GET", `/customers/${id}`),

  /** GET /customers/:id/history — Get purchase history for a customer */
  getPurchaseHistory: (id: number) =>
    request<unknown[]>("GET", `/customers/${id}/history`),

  /** POST /customers — Create a new customer */
  create: (body: CreateCustomerDto) =>
    request<Customer>("POST", "/customers", { body }),

  /** PUT /customers/:id — Update customer by ID */
  update: (id: number, body: UpdateCustomerDto) =>
    request<Customer>("PUT", `/customers/${id}`, { body }),

  /** DELETE /customers/:id — Delete customer by ID */
  remove: (id: number) => request<void>("DELETE", `/customers/${id}`),
};

// ─── Sales ────────────────────────────────────────────────────

export interface SaleItem {
  productId: number;
  qty: number;
}

export interface ProcessSaleDto {
  customerId: number;
  storeId: number;
  items: SaleItem[];
  paymentMethod?: string;
  [key: string]: unknown;
}

export interface Sale {
  id: number;
  customerId: number;
  storeId: number;
  total: number;
  createdAt: string;
  [key: string]: unknown;
}

export interface SalesFilterParams extends PaginationParams {
  from?: string; // ISO date string e.g. '2024-01-01'
  to?: string; // ISO date string e.g. '2024-12-31'
}

export const salesApi = {
  /** GET /sales — List all sales (paginated, optional date range) */
  getAll: (params?: SalesFilterParams) =>
    request<PaginatedResponse<Sale>>("GET", "/sales", { query: params }),

  /** GET /sales/:id — Get sale by ID */
  getOne: (id: number) => request<Sale>("GET", `/sales/${id}`),

  /** GET /sales/:id/details — Get full sale details (line items etc.) */
  getDetails: (id: number) => request<unknown>("GET", `/sales/${id}/details`),

  /** GET /sales/store/:storeId — All sales for a store */
  getByStore: (storeId: number) =>
    request<Sale[]>("GET", `/sales/store/${storeId}`),

  /** GET /sales/customer/:customerId — All sales for a customer */
  getByCustomer: (customerId: number) =>
    request<Sale[]>("GET", `/sales/customer/${customerId}`),

  /** GET /sales/fragment/gulshan — Horizontal fragment: Gulshan store sales */
  getFragmentGulshan: () => request<Sale[]>("GET", "/sales/fragment/gulshan"),

  /** GET /sales/fragment/defense — Horizontal fragment: Defense store sales */
  getFragmentDefense: () => request<Sale[]>("GET", "/sales/fragment/defense"),

  /** GET /sales/fragment/awami — Horizontal fragment: Awami store sales */
  getFragmentAwami: () => request<Sale[]>("GET", "/sales/fragment/awami"),

  /** POST /sales/process — Process a new sale transaction */
  process: (body: ProcessSaleDto) =>
    request<Sale>("POST", "/sales/process", { body }),
};

// ─── Inventory ────────────────────────────────────────────────

export interface InventoryItem {
  inventoryId: number;
  productId: number;
  storeId: number;
  quantity: number;
  status: string;
  [key: string]: unknown;
}

export interface CreateInventoryDto {
  product_id: number;
  store_id: number;
  quantity: number;
  status?: string;
  [key: string]: unknown;
}

export type UpdateInventoryDto = Partial<CreateInventoryDto>;

export interface RestockItem {
  store_id: number;
  product_id: number;
  quantity: number;
}
export const inventoryApi = {
  /** GET /inventory — List all inventory records */
  getAll: () => request<InventoryItem[]>("GET", "/inventory"),

  /** GET /inventory/status — Inventory count grouped by status */
  getStatusCount: () =>
    request<Record<string, number>>("GET", "/inventory/status"),

  /** GET /inventory/low-stock — Items below restock threshold */
  getLowStock: () => request<InventoryItem[]>("GET", "/inventory/low-stock"),

  /** GET /inventory/store/:storeId — Inventory for a specific store */
  getByStore: (storeId: number) =>
    request<InventoryItem[]>("GET", `/inventory/store/${storeId}`),

  /** GET /inventory/fragment/gulshan — Horizontal fragment: Gulshan */
  getFragmentGulshan: () =>
    request<InventoryItem[]>("GET", "/inventory/fragment/gulshan"),

  /** GET /inventory/fragment/defense — Horizontal fragment: Defense */
  getFragmentDefense: () =>
    request<InventoryItem[]>("GET", "/inventory/fragment/defense"),

  /** GET /inventory/fragment/awami — Horizontal fragment: Awami */
  getFragmentAwami: () =>
    request<InventoryItem[]>("GET", "/inventory/fragment/awami"),

  /** POST /inventory — Create an inventory record */
  create: (body: CreateInventoryDto) =>
    request<InventoryItem>("POST", "/inventory", { body }),

  /** POST /inventory/restock — Restock multiple items */
  restock: (items: RestockItem[]) =>
    request<unknown>("POST", "/inventory/restock", { body: { items } }),

  /** POST /inventory/refresh-mv — Refresh Oracle materialized view */
  refreshMaterializedView: () =>
    request<unknown>("POST", "/inventory/refresh-mv"),

  /** PUT /inventory/:id — Update an inventory record */
  update: (id: number, body: UpdateInventoryDto) =>
    request<InventoryItem>("PUT", `/inventory/${id}`, { body }),

  /** DELETE /inventory/:id — Delete an inventory record */
  remove: (id: number) => request<void>("DELETE", `/inventory/${id}`),
};

// ─── Analytics ────────────────────────────────────────────────

export const analyticsApi = {
  /** GET /analytics/dashboard — Top-level dashboard summary */
  getDashboard: () => request<unknown>("GET", "/analytics/dashboard"),

  /** GET /analytics/store-summary — Stats broken down per store */
  getStoreSummary: () => request<unknown>("GET", "/analytics/store-summary"),

  /** GET /analytics/best-selling — Best-selling products */
  getBestSelling: () => request<unknown[]>("GET", "/analytics/best-selling"),

  /** GET /analytics/monthly-sales — Monthly sales totals (chart data) */
  getMonthlySales: () => request<unknown[]>("GET", "/analytics/monthly-sales"),

  /** GET /analytics/active-products — Active product count/list */
  getActiveProducts: () =>
    request<unknown[]>("GET", "/analytics/active-products"),

  /** GET /analytics/sold-and-stocked — Sold vs stocked comparison */
  getSoldAndStocked: () =>
    request<unknown>("GET", "/analytics/sold-and-stocked"),

  /** GET /analytics/unsold-products — Products with zero sales */
  getUnsoldProducts: () =>
    request<unknown[]>("GET", "/analytics/unsold-products"),

  /** GET /analytics/store-performance/:storeId — Performance metrics for one store */
  getStorePerformance: (storeId: number) =>
    request<unknown>("GET", `/analytics/store-performance/${storeId}`),
};

// ─── Audit ────────────────────────────────────────────────────

export interface AuditLog {
  id: number;
  action: string;
  table?: string;
  storeId?: number;
  createdAt: string;
  [key: string]: unknown;
}

export const auditApi = {
  /** GET /audit — List all audit logs (paginated) */
  getAll: (pagination?: PaginationParams) =>
    request<PaginatedResponse<AuditLog>>("GET", "/audit", {
      query: pagination,
    }),

  /** GET /audit/summary — Audit summary, optional ?month=YYYY-MM */
  getSummary: (month?: string) =>
    request<unknown>("GET", "/audit/summary", { query: { month } }),

  /** GET /audit/dml — DML audit log, optional ?table=&action= */
  getDmlLog: (filters?: { table?: string; action?: string }) =>
    request<AuditLog[]>("GET", "/audit/dml", { query: filters }),

  /** GET /audit/store/:storeId — Audit logs for a store (paginated) */
  getByStore: (storeId: number, pagination?: PaginationParams) =>
    request<PaginatedResponse<AuditLog>>("GET", `/audit/store/${storeId}`, {
      query: pagination,
    }),
};

// ─── Fragmentation ────────────────────────────────────────────

export const fragmentationApi = {
  // Horizontal: Sales
  /** GET /fragmentation/sales/gulshan */
  getSalesGulshan: () => request<unknown[]>("GET", "/sales/fragment/gulshan"),
  /** GET /fragmentation/sales/defense */
  getSalesDefense: () => request<unknown[]>("GET", "/sales/fragment/defense"),
  /** GET /fragmentation/sales/awami */
  getSalesAwami: () => request<unknown[]>("GET", "/sales/fragment/awami"),

  // Horizontal: Inventory
  /** GET /fragmentation/inventory/gulshan */
  getInventoryGulshan: () =>
    request<unknown[]>("GET", "/inventory/fragment/gulshan"),
  /** GET /fragmentation/inventory/defense */
  getInventoryDefense: () =>
    request<unknown[]>("GET", "/inventory/fragment/defense"),
  /** GET /fragmentation/inventory/awami */
  getInventoryAwami: () =>
    request<unknown[]>("GET", "/inventory/fragment/awami"),

  // Vertical: Products
  /** GET /fragmentation/products/identity — id, name, category cols */
  getProductsIdentity: () =>
    request<unknown[]>("GET", "/fragmentation/products/identity"),
  /** GET /fragmentation/products/financial — price, cost, margin cols */
  getProductsFinancial: () =>
    request<unknown[]>("GET", "/fragmentation/products/financial"),

  // Vertical: Customers
  /** GET /fragmentation/customers/contact — email, phone cols */
  getCustomersContact: () =>
    request<unknown[]>("GET", "/fragmentation/customers/contact"),
  /** GET /fragmentation/customers/location — address, city cols */
  getCustomersLocation: () =>
    request<unknown[]>("GET", "/fragmentation/customers/location"),
};

// ─── Admin ────────────────────────────────────────────────────

export interface AdminJob {
  name: string;
  status?: string;
  lastRun?: string;
  [key: string]: unknown;
}

export interface AdminUser {
  id: number;
  username: string;
  role?: string;
  [key: string]: unknown;
}

export interface AdminRole {
  id: number;
  name: string;
  [key: string]: unknown;
}

export const adminApi = {
  /** GET /admin/jobs — List all scheduled/background jobs */
  getJobs: () => request<AdminJob[]>("GET", "/admin/jobs"),

  /** GET /admin/users — List all system users */
  getUsers: () => request<AdminUser[]>("GET", "/admin/users"),

  /** GET /admin/roles — List all user roles */
  getRoles: () => request<AdminRole[]>("GET", "/admin/roles"),

  /** POST /admin/jobs/run/:jobName — Manually trigger a job by name */
  runJob: (jobName: string) =>
    request<unknown>("POST", `/admin/jobs/run/${encodeURIComponent(jobName)}`),
};

// ─── Barrel export ────────────────────────────────────────────

export const api = {
  stores: storesApi,
  products: productsApi,
  customers: customersApi,
  sales: salesApi,
  inventory: inventoryApi,
  analytics: analyticsApi,
  audit: auditApi,
  fragmentation: fragmentationApi,
  admin: adminApi,
};

export default api;
