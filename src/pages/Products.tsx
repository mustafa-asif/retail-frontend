import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { Search, PlusCircle, Filter, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryClient } from "@/lib/queryClient";
import { Pencil } from "lucide-react";
import { UpdateModal } from "@/components/shared/UpdateModal";
import { CreateProductModal } from "@/components/product/CreateProductModal";

export default function ProductsPage() {
  const [category, setCategory] = useState<string>("all");

  const [updateProduct, setUpdateProduct] = useState<any>(null);
  const [newPrice, setNewPrice] = useState("");

  const [createModalOpen, setCreateModalOpen] = useState(false);

  const { data: productsData, isLoading } = useQuery({
    queryKey: [
      "products",
      { category: category === "all" ? undefined : category },
    ],
    queryFn: () =>
      api.products.getAll(category === "all" ? undefined : category),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.products.remove(id),
    onSuccess: async () => {
      toast.success("Item deleted successfully.");
    },
    onError: () => toast.error("Failed to delete item."),
  });

  const handleDelete = (productId: number) => {
    {
      deleteMutation.mutate(productId);
    }
  };
  const products = Array.isArray(productsData)
    ? productsData
    : (productsData as any)?.data || [];

  // update mutation for price update
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { price: number } }) =>
      api.products.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Price updated successfully.");
      setUpdateProduct(null);
      setNewPrice("");
    },
    onError: () => toast.error("Failed to update price."),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Products Catalog
          </h2>
          <p className="text-sm text-slate-500">
            Manage your product offerings and pricing.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" /> Filter
          </Button>
          <Button
            onClick={() => setCreateModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            New Product
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" onValueChange={setCategory} className="w-full">
        <TabsList className="bg-slate-100/50 p-1 mb-4">
          <TabsTrigger value="all">All Products</TabsTrigger>
        </TabsList>

        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input placeholder="Search products..." className="pl-9 bg-white" />
          </div>
        </div>

        <TabsContent value={category} className="mt-0 outline-none">
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-semibold text-slate-600">
                    ID
                  </TableHead>
                  <TableHead className="font-semibold text-slate-600">
                    Name
                  </TableHead>
                  <TableHead className="font-semibold text-slate-600">
                    Category
                  </TableHead>
                  <TableHead className="font-semibold text-slate-600">
                    Price (PKR)
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
                          <Skeleton className="h-4 w-12" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-32" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-20" />
                        </TableCell>
                        <TableCell className="text-right">
                          <Skeleton className="h-8 w-16 ml-auto" />
                        </TableCell>
                        <TableCell className="text-right">
                          <Skeleton className="h-8 w-16 ml-auto" />
                        </TableCell>
                      </TableRow>
                    ))
                ) : products.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-24 text-center text-slate-500"
                    >
                      No products found in this category.
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product: any) => (
                    <TableRow
                      key={product.productId}
                      className="hover:bg-slate-50/50"
                    >
                      <TableCell className="font-mono text-slate-500 text-xs">
                        PRD-{product.productId}
                      </TableCell>
                      <TableCell className="font-medium text-slate-900">
                        {product.productName ?? `Product ${product.productId}`}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="capitalize text-xs font-normal"
                        >
                          {product.category || "General"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold">
                        PKR {Number(product.price).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-800"
                            onClick={() => {
                              setUpdateProduct(product);
                              setNewPrice(String(product.price));
                            }}
                          >
                            <Pencil className="h-3.5 w-3.5 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-800"
                            onClick={() => handleDelete(product.productId)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-1" />
                            {deleteMutation.isPending
                              ? "Deleting..."
                              : "Delete"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
      <UpdateModal
        open={!!updateProduct}
        onClose={() => setUpdateProduct(null)}
        isPending={updateMutation.isPending}
        title={`Update Price — ${updateProduct?.name}`}
        fields={[
          { label: "Category", value: updateProduct?.category ?? "N/A" },
          {
            label: "Current Price",
            value: `PKR ${Number(updateProduct?.price).toLocaleString()}`,
          },
        ]}
        inputLabel="New Price (PKR)"
        inputValue={newPrice}
        onInputChange={setNewPrice}
        onSubmit={(val) => {
          const parsed = parseFloat(val);
          if (isNaN(parsed) || parsed <= 0) {
            toast.error("Enter a valid price.");
            return;
          }
          updateMutation.mutate({
            id: updateProduct.productId,
            data: { price: parsed },
          });
        }}
      />
      <CreateProductModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}

      />
    </div>
  );
}
