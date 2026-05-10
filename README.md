# Retail Management System — Frontend

A multi-branch retail management dashboard built with React, Vite, and TypeScript. Connects to a NestJS + Oracle DB backend.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Routing | React Router DOM v6 |
| Data Fetching | TanStack Query (React Query) v5 |
| Forms | React Hook Form + Zod |
| State | Zustand |
| Charts | Recharts |
| Invoice | react-pdf/renderer (client-side) |
| Icons | Lucide React |
| Notifications | Sonner |

---

## Prerequisites

- Node.js 18+
- Backend running at `http://localhost:5000`
- Oracle DB connected to backend

---

## Getting Started

### 1. Clone and install

```bash
git clone <your-repo-url>
cd retail-frontend
npm install
```

### 2. Environment setup

Create `.env.local` in the root:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Install shadcn/ui components

```bash
npx shadcn@latest add card table button input select badge skeleton tabs separator avatar dropdown-menu sonner dialog label
```

### 4. Start development server

```bash
npm run dev
```

App runs at `http://localhost:5173`

---

## Project Structure

```
src/
├── components/
│   ├── audit/
│   │   ├── AuditTable.tsx        # Audit log table with trigger badge
│   │   └── TriggerBadge.tsx      # Purple ⚡ badge for DB trigger rows
│   ├── dashboard/
│   │   ├── StatCard.tsx          # KPI stat cards
│   │   └── SalesChart.tsx        # Monthly sales chart
│   ├── inventory/
│   │   ├── RestockModal.tsx      # Restock multiple items modal
│   │   └── CreateInventoryModal.tsx # Create inventory record modal
│   ├── invoice/
│   │   ├── InvoiceTemplate.tsx   # react-pdf invoice document
│   │   └── InvoicePreview.tsx    # Live invoice preview panel
│   ├── layout/
│   │   ├── Sidebar.tsx           # Navigation sidebar
│   │   └── Topbar.tsx            # Top bar with user info
│   └── shared/
│       └── UpdateQuantityModal.tsx # Reusable update modal
├── hooks/
│   ├── useAuth.ts                # Auth state hook
│   └── useBranchFilter.ts        # Branch scoping hook
├── lib/
│   ├── api.ts                    # Typed API client
│   ├── auth.ts                   # Zustand auth store
│   ├── queryClient.ts            # React Query client
│   └── utils.ts                  # Utility functions
└── pages/
    ├── Login.tsx
    ├── Dashboard.tsx
    ├── Sales.tsx
    ├── NewSale.tsx
    ├── SaleDetails.tsx
    ├── Products.tsx
    ├── Customers.tsx
    ├── CustomerDetails.tsx
    ├── Inventory.tsx
    ├── Audit.tsx
    ├── Fragmentation.tsx
    ├── Stores.tsx
    └── Admin.tsx
```

---

## Authentication

Authentication is simulated on the frontend — no auth API exists. Credentials are hardcoded:

| Username | Password | Role | Branch | Store ID |
|---|---|---|---|---|
| `admin` | `admin123` | Admin | All | — |
| `gulshan` | `gulshan123` | Manager | Gulshan | 1 |
| `defense` | `defense123` | Manager | Defense | 2 |
| `awami` | `awami123` | Manager | Awami | 3 |

Session is persisted in Zustand + localStorage.

---

## Role-Based Access

### Admin
- View all branches, all sales, all inventory
- Full CRUD on stores, products, customers, inventory
- Access to analytics dashboard, fragmentation view, admin panel
- Refresh Oracle materialized view manually

### Branch Manager
- Scoped to their branch only via `useBranchFilter` hook
- View their branch sales, inventory, audit logs
- Process new sales, restock inventory
- No access to other branches, fragmentation, or admin panel

```ts
// useBranchFilter hook
const { storeId, isAdmin, isManager, branch } = useBranchFilter();
// storeId is null for admin, 1/2/3 for managers
```

---

## API Client

All API calls go through `lib/api.ts`. The client:

1. **Unwraps** NestJS response interceptor format `{ success, data }` automatically
2. **Normalizes** Oracle `UPPER_CASE` column names to `camelCase` automatically

```ts
import api from '@/lib/api'

// Examples
const stores    = await api.stores.getAll()
const customers = await api.customers.getAll({ page: 1, limit: 20 })
const sale      = await api.sales.process({ store_id: 1, product_id: 2, quantity: 1, customer_id: 1 })
```

### Available namespaces

```
api.stores        → getAll, getOne, create, update, remove
api.products      → getAll, getByCategory, getOne, create, update, remove
api.customers     → getAll, getOne, getPurchaseHistory, create, update, remove
api.sales         → getAll, getOne, getDetails, getByStore, getByCustomer,
                    getFragmentGulshan/Defense/Awami, process
api.inventory     → getAll, getStatusCount, getLowStock, getByStore,
                    getFragmentGulshan/Defense/Awami, create, restock,
                    refreshMaterializedView, update, remove
api.analytics     → getDashboard, getStoreSummary, getBestSelling, getMonthlySales,
                    getActiveProducts, getSoldAndStocked, getUnsoldProducts, getStorePerformance
api.audit         → getAll, getSummary, getDmlLog, getByStore
api.fragmentation → getSalesGulshan/Defense/Awami, getInventoryGulshan/Defense/Awami,
                    getProductsIdentity, getProductsFinancial,
                    getCustomersContact, getCustomersLocation
api.admin         → getJobs, getUsers, getRoles, runJob
```

---

## Oracle Materialized View

The inventory list is served from an Oracle materialized view (`MV_INVENTORY_STATUS`). After any write operation (restock, update, create), the view must be refreshed to show updated data.

This is handled **automatically** after:
- Sale processed → `api.inventory.refreshMaterializedView()` called in `NewSale.tsx`
- Restock submitted → called in `RestockModal.tsx`
- Inventory updated → called in `Inventory.tsx` update mutation
- Inventory created → called in `CreateInventoryModal.tsx`

Admin can also trigger it manually via the **Refresh View** button on the Inventory page.

---

## Oracle DB Triggers

The backend has Oracle triggers that fire automatically on inventory changes. These create rows in the audit log table. The Audit page displays these with a purple **⚡ TRIGGER** badge to distinguish them from manual user actions.

Triggers fire on:
- `PROCESS_SALE` stored procedure (reduces inventory qty)
- Direct `UPDATE inventory` (restock, manual update)
- `DELETE inventory`

---

## Invoice Generation

Invoices are generated **entirely on the frontend** using `react-pdf/renderer`. No invoice API exists.

- **Live preview** shown on the New Sale page as you fill the form
- **Download PDF** button generates and downloads the invoice instantly
- Invoice number format: `INV-{storeId}-{timestamp}`
- Currency: PKR

---

## Branch Colors

| Branch | Color | Tailwind |
|---|---|---|
| Gulshan | Blue | `blue-500` |
| Defense | Emerald | `emerald-500` |
| Awami | Amber | `amber-500` |

---

## Key Oracle Column Mappings

The API client normalizes these automatically via `KEY_MAP` in `lib/api.ts`:

| Oracle Column | Frontend Field |
|---|---|
| `STORE_ID` | `storeId` |
| `STORE_NAME` | `name` |
| `PRODUCT_ID` | `productId` |
| `PRODUCT_NAME` | `name` |
| `CUSTOMER_ID` | `customerId` |
| `CUSTOMER_NAME` | `name` |
| `SALE_ID` | `saleId` |
| `TOTAL_AMT` | `total` |
| `SALE_DATE` | `createdAt` |
| `INVENTORY_ID` | `inventoryId` |
| `CURRENT_STOCK` | `quantity` |
| `STOCK_STATUS` | `status` |
| `AUDIT_ID` | `logId` |
| `CHANGED_AT` | `createdAt` |
| `UNIT_PRICE` | `unitPrice` |
| `LINE_TOTAL` | `lineTotal` |

If a new Oracle column appears as `undefined` in the UI, add it to `KEY_MAP` in `lib/api.ts`.

---

## Common Issues

### Data shows as undefined
Oracle returned a column name not in `KEY_MAP`. Check the network tab for the raw response and add the mapping to `KEY_MAP` in `lib/api.ts`.

### Inventory not updating after restock/sale
The materialized view needs refreshing. Ensure `api.inventory.refreshMaterializedView()` is called in `onSuccess` of your mutation. Also use `queryClient.removeQueries({ queryKey: ['inventory'] })` instead of `invalidateQueries` to force a fresh fetch.

### 400 Bad Request on sale process
The `PROCESS_SALE` stored procedure expects snake_case fields: `store_id`, `product_id`, `quantity`, `customer_id`. Ensure these exact names are sent.

### ORA-01422: exact fetch returns more than one row
Duplicate inventory records exist for the same `product_id` + `store_id`. Run this in Oracle:
```sql
DELETE FROM inventory
WHERE inventory_id NOT IN (
  SELECT MAX(inventory_id) FROM inventory GROUP BY product_id, store_id
);
COMMIT;
```

### ORA-02292: integrity constraint violated on delete
Delete child records first (sale_details, inventory) before deleting a product or store.

---

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

---

## Backend

The backend is a separate NestJS project at `../backend`. Start it with:

```bash
cd ../backend
npm run start:dev
```

Runs on `http://localhost:5000`.