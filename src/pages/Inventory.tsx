import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useBranchFilter } from "@/hooks/useBranchFilter";
import { format } from "date-fns";
import { toast } from "sonner";
import api from "@/lib/api";
import { queryClient } from "@/lib/queryClient";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Search, RefreshCw, PlusCircle } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function InventoryPage() {
  const { storeId, isAdmin } = useBranchFilter();

  const { data: inventoryData, isLoading } = useQuery({
    queryKey: ["inventory", { storeId }],
    queryFn: () =>
      storeId ? api.inventory.getByStore(storeId) : api.inventory.getAll(),
  });

  const { data: statusCounts } = useQuery({
    queryKey: ["inventory", "status"],
    queryFn: () => api.inventory.getStatusCount(),
  });

  const refreshViewMutation = useMutation({
    mutationFn: () => api.inventory.refreshMaterializedView(),
    onSuccess: () => {
      toast.success("Materialized view refreshed successfully.");
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
    onError: () => {
      toast.error("Failed to refresh materialized view.");
    },
  });

  const inventory = Array.isArray(inventoryData)
    ? inventoryData
    : (inventoryData as any)?.data || [];

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "in stock":
        return "bg-emerald-100 text-emerald-800";
      case "low stock":
        return "bg-amber-100 text-amber-800";
      case "out of stock":
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  return (
    <div className="space-y-6">
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
            <Button
              variant="outline"
              onClick={() => refreshViewMutation.mutate()}
              disabled={refreshViewMutation.isPending}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${refreshViewMutation.isPending ? "animate-spin" : ""}`}
              />
              Refresh Materialized View
            </Button>
          )}
          <Button className="bg-blue-600 hover:bg-blue-700">
            <PlusCircle className="mr-2 h-4 w-4" />
            Restock Items
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search inventory by product name or ID..."
            className="pl-9 bg-white"
          />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-semibold text-slate-600">
                Product
              </TableHead>
              {isAdmin && (
                <TableHead className="font-semibold text-slate-600">
                  Store
                </TableHead>
              )}
              <TableHead className="font-semibold text-slate-600">
                Qty
              </TableHead>
              <TableHead className="font-semibold text-slate-600">
                Status
              </TableHead>
              <TableHead className="font-semibold text-slate-600">
                Last Updated
              </TableHead>
              <TableHead className="font-semibold text-slate-600 text-right">
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
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-8 w-16 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
            ) : inventory.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={isAdmin ? 6 : 5}
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
                  <TableCell className="font-medium text-slate-900">
                    {item.name ?? `Product #${item.productId}`}
                  </TableCell>
                  {isAdmin && (
                    <TableCell>
                      {item.storeName ?? `Store #${item.storeId}`}
                    </TableCell>
                  )}
                  <TableCell className="font-bold">{item.quantity}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`font-semibold border-transparent ${getStatusColor(
                        item.status ??
                          (item.quantity > 10
                            ? "In Stock"
                            : item.quantity > 0
                              ? "Low Stock"
                              : "Out of Stock"),
                      )}`}
                    >
                      {item.status ??
                        (item.quantity > 10
                          ? "In Stock"
                          : item.quantity > 0
                            ? "Low Stock"
                            : "Out of Stock")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-500">
                    {item.lastUpdated
                      ? format(new Date(item.lastUpdated), "PP")
                      : "N/A"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Update
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
