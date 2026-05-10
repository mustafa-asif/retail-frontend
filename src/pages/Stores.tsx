import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Building, MapPin, User, Settings2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { StoreCreateModal } from "@/components/store/StoreCreateModal";

export default function StoresPage() {
  const [createOpen, setCreateOpen] = useState(false);

  const { data: stores, isLoading } = useQuery({
    queryKey: ["stores"],
    queryFn: () => api.stores.getAll(),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Stores Management
          </h2>
          <p className="text-sm text-slate-500">Manage store branches</p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setCreateOpen(true)}
        >
          <Building className="mr-2 h-4 w-4" />
          Add Store
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isLoading
          ? Array(3)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-48 w-full rounded-xl" />
              ))
          : ((stores as any[]) || []).map((store) => (
              <Card
                key={store.storeId}
                className="hover:border-blue-300 transition-colors cursor-pointer"
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl text-slate-800">
                      {store.storeName}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-blue-600"
                    >
                      <Settings2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3" /> {store.location}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 mt-4 text-center">
                    <div className="bg-slate-50 p-2 rounded border border-slate-100">
                      <p className="text-[10px] uppercase font-bold text-slate-400">
                        Status
                      </p>
                      <p className="text-sm font-medium text-emerald-600">
                        Active
                      </p>
                    </div>
                    <div className="bg-slate-50 p-2 rounded border border-slate-100">
                      <p className="text-[10px] uppercase font-bold text-slate-400">
                        Store ID
                      </p>
                      <p className="text-sm font-mono text-slate-700">
                        #{store.storeId}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>
      <StoreCreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </div>
  );
}
