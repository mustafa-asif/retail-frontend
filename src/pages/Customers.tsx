import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, PlusCircle, User } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function CustomersPage() {
  const navigate = useNavigate();

  const { data: customersData, isLoading } = useQuery({
    queryKey: ['customers', { page: 1, limit: 20 }],
    queryFn: () => api.customers.getAll({ page: 1, limit: 20 }),
  });

  const customers = Array.isArray(customersData) ? customersData : customersData?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Customers</h2>
          <p className="text-sm text-slate-500">View and manage customer directory.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Customer
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input placeholder="Search customers..." className="pl-9 bg-white" />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-semibold text-slate-600">Customer</TableHead>
              <TableHead className="font-semibold text-slate-600">Email</TableHead>
              <TableHead className="font-semibold text-slate-600">Phone</TableHead>
              <TableHead className="font-semibold text-slate-600 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
               Array(5).fill(0).map((_, i) => (
                 <TableRow key={i}>
                   <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                   <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                   <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                   <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                 </TableRow>
               ))
            ) : customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-slate-500">
                  No customers found.
                </TableCell>
              </TableRow>
            ) : (
              customers.map((customer: any) => (
                <TableRow key={customer.id} className="hover:bg-slate-50/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                        <User className="h-4 w-4" />
                      </div>
                      <span className="font-medium text-slate-900">{customer.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600">{customer.email || 'N/A'}</TableCell>
                  <TableCell className="text-slate-600">{customer.phone || 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/customers/${customer.id}`)}>
                      View Profile
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
