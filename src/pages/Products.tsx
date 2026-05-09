import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, PlusCircle, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export default function ProductsPage() {
  const [category, setCategory] = useState<string>('all');

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', { category: category === 'all' ? undefined : category }],
    queryFn: () => api.products.getAll(category === 'all' ? undefined : category),
  });

  const products = Array.isArray(productsData) ? productsData : ((productsData as any)?.data || []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Products Catalog</h2>
          <p className="text-sm text-slate-500">Manage your product offerings and pricing.</p>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="outline"><Filter className="w-4 h-4 mr-2" /> Filter</Button>
           <Button className="bg-blue-600 hover:bg-blue-700">
             <PlusCircle className="mr-2 h-4 w-4" />
             New Product
           </Button>
        </div>
      </div>

      <Tabs defaultValue="all" onValueChange={setCategory} className="w-full">
        <TabsList className="bg-slate-100/50 p-1 mb-4">
          <TabsTrigger value="all">All Products</TabsTrigger>
          <TabsTrigger value="electronics">Electronics</TabsTrigger>
          <TabsTrigger value="clothing">Clothing</TabsTrigger>
          <TabsTrigger value="groceries">Groceries</TabsTrigger>
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
                  <TableHead className="font-semibold text-slate-600">ID</TableHead>
                  <TableHead className="font-semibold text-slate-600">Name</TableHead>
                  <TableHead className="font-semibold text-slate-600">Category</TableHead>
                  <TableHead className="font-semibold text-slate-600">Price (PKR)</TableHead>
                  <TableHead className="font-semibold text-slate-600 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                   Array(5).fill(0).map((_, i) => (
                     <TableRow key={i}>
                       <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                       <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                       <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                       <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                       <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                     </TableRow>
                   ))
                ) : products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                      No products found in this category.
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product: any) => (
                    <TableRow key={product.id} className="hover:bg-slate-50/50">
                      <TableCell className="font-mono text-slate-500 text-xs">PRD-{product.id}</TableCell>
                      <TableCell className="font-medium text-slate-900">{product.name}</TableCell>
                      <TableCell><Badge variant="secondary" className="capitalize text-xs font-normal">{product.category || 'General'}</Badge></TableCell>
                      <TableCell className="font-semibold">PKR {Number(product.price).toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">Edit</Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
