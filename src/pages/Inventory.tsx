import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useBranchFilter } from "@/hooks/useBranchFilter";
import { toast } from "sonner";
import api from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { RestockModal } from "@/components/Inventory/RestockModal";
import { CreateModal } from "@/components/Inventory/CreateModal";
import { UpdateModal } from "@/components/shared/UpdateModal";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, RefreshCw, PlusCircle, Trash2, Pencil } from "lucide-react";

export default function InventoryPage() {
  const { storeId, isAdmin } = useBranchFilter();

  // ─── Update modal state ───────────────────────────────────
  const [updateItem, setUpdateItem] = useState<any>(null);
  const [newQuantity, setNewQuantity] = useState("");

  // ─── Restock modal state ──────────────────────────────────
  const [restockOpen, setRestockOpen] = useState(false);

  // create modal
  const [createOpen, setCreateOpen] = useState(false);

  // ─── Queries ──────────────────────────────────────────────
  const { data: inventoryData, isLoading } = useQuery({
    queryKey: ["inventory", { storeId }],
    queryFn: () =>
      storeId ? api.inventory.getByStore(storeId) : api.inventory.getAll(),
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const inventory = Array.isArray(inventoryData)
    ? inventoryData
    : ((inventoryData as any)?.data ?? []);

  // ─── Refresh MV ───────────────────────────────────────────
  const refreshMv = async () => {
    await api.inventory.refreshMaterializedView();
    queryClient.invalidateQueries({ queryKey: ["inventory"] });
  };

  const refreshViewMutation = useMutation({
    mutationFn: () => api.inventory.refreshMaterializedView(),
    onSuccess: () => {
      toast.success("Materialized view refreshed.");
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
    onError: () => toast.error("Failed to refresh materialized view."),
  });

  // ─── Delete mutation ──────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.inventory.remove(id),
    onSuccess: async () => {
      await refreshMv();
      toast.success("Item deleted successfully.");
    },
    onError: () => toast.error("Failed to delete item."),
  });

  const handleDelete = (inventoryId: number) => {
    if (confirm("Are you sure you want to delete this item?")) {
      deleteMutation.mutate(inventoryId);
    }
  };

  // ─── Update mutation ──────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { quantity: number } }) =>
      api.inventory.update(id, data),
    onSuccess: async () => {
      await refreshMv();
      toast.success("Stock updated successfully.");
      setUpdateItem(null);
      setNewQuantity("");
    },
    onError: () => toast.error("Failed to update stock."),
  });

  // ─── Status color ─────────────────────────────────────────
  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "IN STOCK":
        return "bg-emerald-100 text-emerald-800";
      case "LOW STOCK":
        return "bg-amber-100 text-amber-800";
      case "OUT OF STOCK":
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  // ─── Render ───────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Inventory Status
          </h2>
          <p className="text-sm text-slate-500">
            Monitor stock levels across branches.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <>
              <Button
                variant="outline"
                onClick={() => refreshViewMutation.mutate()}
                disabled={refreshViewMutation.isPending}
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${refreshViewMutation.isPending ? "animate-spin" : ""}`}
                />
                Refresh View
              </Button>
            </>
          )}
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setRestockOpen(true)}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Restock Items
          </Button>
          <Button variant="outline" onClick={() => setCreateOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
        <Input placeholder="Search inventory..." className="pl-9 bg-white" />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-semibold text-slate-600">
                Inventory ID
              </TableHead>
              <TableHead className="font-semibold text-slate-600">
                Product ID
              </TableHead>
              <TableHead className="font-semibold text-slate-600">
                Product
              </TableHead>
              {isAdmin && (
                <>
                  <TableHead className="font-semibold text-slate-600">
                    Store
                  </TableHead>
                  <TableHead className="font-semibold text-slate-600">
                    store ID
                  </TableHead>
                </>
              )}
              <TableHead className="font-semibold text-slate-600">
                Qty
              </TableHead>
              <TableHead className="font-semibold text-slate-600">
                Status
              </TableHead>
              <TableHead className="font-semibold text-slate-600">
                Price
              </TableHead>
              <TableHead className="font-semibold text-slate-600 text-center">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(5)
                .fill(0)
                .map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-12" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                    )}
                    <TableCell>
                      <Skeleton className="h-4 w-12" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-8 w-24 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
            ) : inventory.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={isAdmin ? 7 : 6}
                  className="h-24 text-center text-slate-500"
                >
                  No inventory data available.
                </TableCell>
              </TableRow>
            ) : (
              inventory.map((item: any, index: number) => (
                <TableRow
                  key={
                    item.inventoryId ??
                    `${item.productId}-${item.storeId}-${index}`
                  }
                  className="hover:bg-slate-50/50"
                >
                  <TableCell className="text-slate-500">
                    {item.inventoryId ?? "--"}
                  </TableCell>
                  <TableCell className="text-slate-500">
                    {item.productId}
                  </TableCell>
                  <TableCell className="font-medium text-slate-900">
                    {item.productName ?? `Product ${item.productId}`}
                  </TableCell>
                  {isAdmin && (
                    <>
                      <TableCell>{item.storeName}</TableCell>
                      <TableCell>{item.storeId}</TableCell>
                    </>
                  )}
                  <TableCell className="font-bold">{item.quantity}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`font-semibold border-transparent ${getStatusColor(item.status)}`}
                    >
                      {item.status ?? "Unknown"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-700">
                    PKR {(item.price ?? 0).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-800"
                        onClick={() => {
                          setUpdateItem(item);
                          setNewQuantity(String(item.quantity));
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5 mr-1" />
                        Update
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-800"
                        onClick={() => handleDelete(item.inventoryId)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        {deleteMutation.isPending ? "Deleting..." : "Delete"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── Update Stock Modal ─────────────────────────────── */}
      <UpdateModal
        open={!!updateItem}
        onClose={() => setUpdateItem(null)}
        isPending={updateMutation.isPending}
        title={`Update Stock — ${updateItem?.name}`}
        fields={[
          {
            label: "Store",
            value: updateItem?.storeName ?? `Store #${updateItem?.storeId}`,
          },
          { label: "Current Stock", value: String(updateItem?.quantity) },
        ]}
        inputLabel="New Quantity"
        inputValue={newQuantity}
        onInputChange={setNewQuantity}
        onSubmit={(val) => {
          const parsed = parseInt(val);
          if (isNaN(parsed) || parsed < 0) {
            toast.error("Enter a valid quantity.");
            return;
          }
          updateMutation.mutate({
            id: updateItem.inventoryId,
            data: { quantity: parsed },
          });
        }}
      />

      {/* ── Restock & Create Modals ─────────────────────────── */}
      <RestockModal
        open={restockOpen}
        onClose={() => setRestockOpen(false)}
        storeId={storeId}
        isAdmin={isAdmin}
        onRefreshMv={refreshMv}
      />
      <CreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        storeId={storeId}
        isAdmin={isAdmin}
      />
    </div>
  );
}
