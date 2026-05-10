import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import api from "@/lib/api";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ArrowLeft, Printer } from "lucide-react";

export default function SaleDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: sale, isLoading } = useQuery({
    queryKey: ["sales", id, "details"],
    queryFn: () => api.sales.getDetails(Number(id)),
    enabled: !!id,
  });

  // After
  const s = (sale as any)?.sale ?? {};
  const details = (sale as any)?.details ?? [];
  
  const { data: customerData } = useQuery({
  queryKey: ['customers', s.customerId],
  queryFn: () => api.customers.getOne(s.customerId),
  enabled: !!s.customerId,
});
const customer = customerData as any;

const { data: storeData } = useQuery({
  queryKey: ['stores', s.storeId],
  queryFn: () => api.stores.getOne(s.storeId),
  enabled: !!s.storeId,
});
const store = storeData as any;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!s) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <h2 className="text-xl font-semibold mb-4">Sale not found</h2>
        <Button onClick={() => navigate("/sales")}>Back to Sales</Button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/sales")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Sale #{s.saleId}</h2>
            <p className="text-sm text-slate-500">
              {s.createdAt ? format(new Date(s.createdAt), "PPpp") : "N/A"}
            </p>
          </div>
        </div>
        <Button onClick={handlePrint}>
          <Printer className="w-4 h-4 mr-2" />
          Print / PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>
              <span className="text-slate-500 w-24 inline-block">Name:</span>{" "}
              <strong>{customer?.name  }</strong>
            </p>
            <p>
              <span className="text-slate-500 w-24 inline-block">Email:</span>{" "}
              {customer?.email || "N/A"}
            </p>
            <p>
              <span className="text-slate-500 w-24 inline-block">Phone:</span>{" "}
              {customer?.phone || "N/A"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>
              <span className="text-slate-500 w-32 inline-block">
                Store Branch:
              </span>{" "}
              <strong>{store?.storeName}</strong>
            </p>
            <p>
              <span className="text-slate-500 w-32 inline-block">
                Payment Method:
              </span>{" "}
              {s?.paymentMethod || "cash"}
            </p>
            <p>
              <span className="text-slate-500 w-32 inline-block">
                Total Amount:
              </span>{" "}
              <strong>PKR {Number(s.total || 0).toLocaleString()}</strong>
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Line Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sale ID</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {details.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-6 text-slate-500"
                  >
                    No items found for this sale.
                  </TableCell>
                </TableRow>
              ) : (
                details.map((item: any, index: number) => (
                  <TableRow key={item.detailId ?? index}>
                    <TableCell>{s.saleId}</TableCell>

                    <TableCell className="font-medium">
                      {item.productName}
                    </TableCell>
                    <TableCell>{item.category ?? "N/A"}</TableCell>
                    <TableCell>
                      PKR {Number(item.unitPrice ?? 0).toLocaleString()}
                    </TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell className="text-right font-semibold">
                      PKR {Number(item.lineTotal ?? 0).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
