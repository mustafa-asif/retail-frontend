import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useBranchFilter } from "@/hooks/useBranchFilter";
import api from "@/lib/api";

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
import { PlusCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function SalesPage() {
  const { storeId, isAdmin } = useBranchFilter();
  const navigate = useNavigate();

  const { data: salesData, isLoading } = useQuery({
    queryKey: ["sales", { storeId }],
    queryFn: () =>
      (storeId
        ? api.sales.getByStore(storeId)
        : api.sales.getAll()) as Promise<any>,
  });

  // Extract from paginated response or array
  const sales = Array.isArray(salesData)
    ? salesData
    : (salesData as any)?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Sales
          </h2>
          <p className="text-sm text-slate-500">
            Manage and view sales transactions.
          </p>
        </div>
        <Button
          onClick={() => navigate("/sales/new")}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          New Sale
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search sales by ID or Customer..."
            className="pl-9 bg-white"
          />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-semibold text-slate-600">
                Sale ID
              </TableHead>
              <TableHead className="font-semibold text-slate-600">
                Date
              </TableHead>
              <TableHead className="font-semibold text-slate-600">
                Customer ID
              </TableHead>
              {isAdmin && (
                <TableHead className="font-semibold text-slate-600">
                  Store
                </TableHead>
              )}
              <TableHead className="font-semibold text-slate-600">
                Amount
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
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
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
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-8 w-16 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
            ) : sales.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={isAdmin ? 6 : 5}
                  className="h-24 text-center"
                >
                  No sales found.
                </TableCell>
              </TableRow>
            ) : (
              sales.map((sale: any, index: number) => (
                <TableRow
                  key={sale.saleId ?? index}
                  className="hover:bg-slate-50/50"
                >
                  <TableCell className="font-medium">
                    ID-{sale.saleId ?? "N/A"}
                  </TableCell>
                  <TableCell>
                    {sale.createdAt
                      ? format(new Date(sale.createdAt), "PPpp")
                      : "N/A"}
                  </TableCell>
                  <TableCell>Customer {sale.customerId}</TableCell>
                  {isAdmin && <TableCell>Store {sale.storeId}</TableCell>}
                  <TableCell className="font-bold">
                    PKR {(sale.total ?? 0).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/sales/${sale.saleId}`)}
                    >
                      View
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
