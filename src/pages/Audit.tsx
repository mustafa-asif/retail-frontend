import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useBranchFilter } from "@/hooks/useBranchFilter";
import api from "@/lib/api";

import { AuditTable } from "@/components/audit/AuditTable";
import { Card, CardContent } from "@/components/ui/card";
// import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Download, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AuditPage() {
  const { storeId, isAdmin } = useBranchFilter();
  const [page, setPage] = useState(1);
  const [month, setMonth] = useState("2024-05");

  const { data: auditData, isLoading: isLoadingLogs } = useQuery({
    queryKey: ["audit", { storeId, page }],
    queryFn: () =>
      storeId
        ? api.audit.getByStore(storeId, { page, limit: 50 })
        : api.audit.getAll({ page, limit: 50 }),
  });

  const { data: summaryData, isLoading: isLoadingSummary } = useQuery({
    queryKey: ["audit", "summary", month],
    queryFn: () => api.audit.getSummary(month),
  });

  const logs = Array.isArray(auditData)
    ? auditData
    : (auditData as any)?.data || [];

  // We use the exact summary from the API
  const summary = (summaryData as any) || {
    inserts: 0,
    updates: 0,
    deletes: 0,
    triggers: 0,
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 shrink-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Audit Logs
          </h2>
          <p className="text-sm text-slate-500">
            {isAdmin
              ? "Comprehensive system audit and trigger execution logs."
              : "Audit logs include both your actions and automatic system triggers."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" /> Export to CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 shrink-0">
        <Card className="bg-purple-50/50 border-purple-200 shadow-sm md:col-span-2">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-purple-600 uppercase tracking-widest">
                Triggers fired this month
              </p>
              <h3 className="text-3xl font-bold text-purple-900 mt-1">
                {logs.length}
              </h3>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
              ⚡
            </div>
          </CardContent>
        </Card>
      </div>

    

      {/* Make Table take remaining space */}
      <AuditTable logs={logs} isLoading={isLoadingLogs} isAdmin={isAdmin} />
    </div>
  );
}
