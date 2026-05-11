import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { format } from "date-fns";

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
import { ArrowLeft, Edit, ShoppingCart } from "lucide-react";

export default function CustomerDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: customer, isLoading: isCustomerLoading } = useQuery({
    queryKey: ["customers", id],
    queryFn: () => api.customers.getOne(Number(id)),
    enabled: !!id,
  });

  const { data: history, isLoading: isHistoryLoading } = useQuery({
    queryKey: ["customers", id, "history"],
    queryFn: () => api.customers.getPurchaseHistory(Number(id)),
    enabled: !!id,
  });

  if (isCustomerLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  const cust = (customer as any) ?? {};
  const historyData = (history as any) ?? {};
  const purchases = historyData?.orders ?? [];
  const totalSpent = historyData?.total_spent ?? 0;
  const purchaseCount = historyData?.total_orders ?? 0;
  const favouriteProduct = historyData?.favourite_product;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/customers")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold">
              {cust?.name || "Customer Details"}
            </h2>
            <p className="text-sm text-slate-500">ID: {cust?.customerId}</p>
          </div>
        </div>
        <Button variant="outline">
          <Edit className="w-4 h-4 mr-2" />
          Edit Customer
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Email Address
                </p>
                <p className="text-base">{cust?.email || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Phone Number
                </p>
                <p className="text-base">{cust?.phone || "N/A"}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-medium text-slate-500">
                  Physical Address
                </p>
                <p className="text-base">
                  {cust?.city || "No address provided"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <CardContent className="space-y-6">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Spent
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              PKR {Number(totalSpent).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Purchases
            </p>
            <div className="flex items-center gap-2 mt-1">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
              <span className="text-xl font-bold text-slate-900">
                {purchaseCount}
              </span>
            </div>
          </div>
          {favouriteProduct && (
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Favourite Product
              </p>
              <p className="text-base font-semibold text-slate-900 mt-1">
                {favouriteProduct.PRODUCT_NAME}
              </p>
              <p className="text-xs text-slate-500">
                Ordered {favouriteProduct.TOTAL_QTY} times
              </p>
            </div>
          )}
        </CardContent>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Purchase History</CardTitle>
        </CardHeader>
        <CardContent>
          {isHistoryLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sale ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Store</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchases.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-6 text-slate-500"
                    >
                      No purchase history found.
                    </TableCell>
                  </TableRow>
                ) : (
                  purchases.map((sale: any, index: number) => (
                    <TableRow key={sale.saleId ?? sale.SALE_ID ?? index}>
                      <TableCell className="font-medium">
                        #{sale.saleId ?? sale.SALE_ID}
                      </TableCell>
                      <TableCell>
                        {(sale.createdAt ?? sale.SALE_DATE)
                          ? format(
                              new Date(sale.createdAt ?? sale.SALE_DATE),
                              "PP",
                            )
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        {sale.storeName ??
                          sale.STORE_NAME ??
                          `Store ${sale.storeId}`}
                      </TableCell>
                      <TableCell className="font-semibold">
                        PKR{" "}
                        {Number(
                          sale.total ?? sale.TOTAL_AMT ?? 0,
                        ).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            navigate(`/sales/${sale.saleId ?? sale.SALE_ID}`)
                          }
                        >
                          View Sale
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
