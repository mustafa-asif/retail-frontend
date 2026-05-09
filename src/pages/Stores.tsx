import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Building, MapPin, User, Settings2 } from 'lucide-react';
import { Button } from '../../components/ui/button';

export default function StoresPage() {
  const { data: stores, isLoading } = useQuery({
    queryKey: ['stores'],
    queryFn: () => api.stores.getAll(),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Stores Management</h2>
          <p className="text-sm text-slate-500">Manage store branches</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Building className="mr-2 h-4 w-4" />
          Add Store
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isLoading ? (
           Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-xl" />)
        ) : (
          ((stores as any[]) || []).map(store => (
            <Card key={store.id} className="hover:border-blue-300 transition-colors cursor-pointer">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl text-slate-800">{store.name}</CardTitle>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600"><Settings2 className="h-4 w-4" /></Button>
                </div>
                <CardDescription className="flex items-center gap-1 mt-1">
                  <MapPin className="h-3 w-3" /> {store.location}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Manager Id</p>
                    <p className="text-sm font-medium text-slate-900">{store.managerId || 'Unassigned'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4 text-center">
                   <div className="bg-slate-50 p-2 rounded border border-slate-100">
                     <p className="text-[10px] uppercase font-bold text-slate-400">Status</p>
                     <p className="text-sm font-medium text-emerald-600">Active</p>
                   </div>
                   <div className="bg-slate-50 p-2 rounded border border-slate-100">
                     <p className="text-[10px] uppercase font-bold text-slate-400">Store ID</p>
                     <p className="text-sm font-mono text-slate-700">#{store.id}</p>
                   </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
