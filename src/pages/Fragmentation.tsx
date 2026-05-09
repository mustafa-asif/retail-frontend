import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

export default function FragmentationPage() {
  // Horizontal - Sales
  const { data: salesG } = useQuery({ queryKey:['frag','sales','G'], queryFn: () => api.fragmentation.getSalesGulshan() });
  const { data: salesD } = useQuery({ queryKey:['frag','sales','D'], queryFn: () => api.fragmentation.getSalesDefense() });
  const { data: salesA } = useQuery({ queryKey:['frag','sales','A'], queryFn: () => api.fragmentation.getSalesAwami() });

  // Vertical - Products
  const { data: prodId } = useQuery({ queryKey:['frag','prod','id'], queryFn: () => api.fragmentation.getProductsIdentity() });
  const { data: prodFin } = useQuery({ queryKey:['frag','prod','fin'], queryFn: () => api.fragmentation.getProductsFinancial() });

  // Vertical - Customers
  const { data: custContact } = useQuery({ queryKey:['frag','cust','contact'], queryFn: () => api.fragmentation.getCustomersContact() });
  const { data: custLoc } = useQuery({ queryKey:['frag','cust','location'], queryFn: () => api.fragmentation.getCustomersLocation() });

  const renderTable = (data: any[], title: string, desc: string, cols: string[]) => (
    <Card className="h-full shadow-sm border-slate-200">
      <CardHeader className="py-4 bg-slate-50 border-b border-slate-100">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription className="text-xs">{desc}</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Table className="text-xs">
          <TableHeader>
            <TableRow>
              {cols.map(c => <TableHead key={c}>{c}</TableHead>)}
            </TableRow>
          </TableHeader>
          <TableBody>
            {(!data || data.length === 0) ? (
              <TableRow><TableCell colSpan={cols.length} className="text-center py-4 text-slate-500">No data</TableCell></TableRow>
            ) : (
              data.slice(0, 5).map((row, i) => (
                <TableRow key={i}>
                  {cols.map((c, j) => <TableCell key={j} className="truncate max-w-[120px]">{String(row[c] || '--')}</TableCell>)}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Database Fragmentation</h2>
        <p className="text-sm text-slate-500 mb-4">
          Visualize how data is partitioned across nodes using horizontal (by store location) and vertical (by data domain) fragmentation.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold">Horizontal Fragmentation: Sales</h3>
        <p className="text-xs text-slate-500">Rows are split out by branch.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {renderTable((salesG as any[]) || [], 'Gulshan Sales', 'Data from Gulshan Node', ['id','total','createdAt'])}
          {renderTable((salesD as any[]) || [], 'Defense Sales', 'Data from Defense Node', ['id','total','createdAt'])}
          {renderTable((salesA as any[]) || [], 'Awami Sales', 'Data from Awami Node', ['id','total','createdAt'])}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="text-lg font-bold">Vertical Fragmentation: Products</h3>
          <p className="text-xs text-slate-500">Columns are split into domain specific sets.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderTable((prodId as any[]) || [], 'Identity Fragment', 'Core identity columns', ['id', 'name', 'category'])}
            {renderTable((prodFin as any[]) || [], 'Financial Fragment', 'Financial columns', ['id', 'price', 'cost', 'margin'])}
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-bold">Vertical Fragmentation: Customers</h3>
          <p className="text-xs text-slate-500">Separates contact info from physical location.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderTable((custContact as any[]) || [], 'Contact Fragment', 'Digital contact data', ['id', 'email', 'phone'])}
            {renderTable((custLoc as any[]) || [], 'Location Fragment', 'Physical address data', ['id', 'address', 'city'])}
          </div>
        </div>
      </div>
    </div>
  );
}
