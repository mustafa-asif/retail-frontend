import React from "react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { TriggerBadge } from "./TriggerBadge";
import { Badge } from "../../../components/ui/badge";

interface AuditTableProps {
  logs: any[];
  isLoading: boolean;
  isAdmin: boolean;
}

export function AuditTable({ logs, isLoading, isAdmin }: AuditTableProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm flex-1 flex flex-col min-h-0">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
        <h4 className="font-bold text-sm uppercase tracking-wider text-slate-700">
          System Audit Logs
        </h4>
        <div className="text-xs text-slate-500">
          Showing {logs.length} entries
        </div>
      </div>

      <div className="overflow-auto flex-1">
        <Table className="text-left border-collapse w-full">
          <TableHeader className="text-[11px] uppercase tracking-wider text-slate-400 bg-white sticky top-0 z-10">
            <TableRow className="border-b border-slate-100">
              <TableHead className="px-6 py-3 font-semibold w-[180px]">
                Timestamp
              </TableHead>
              <TableHead className="px-6 py-3 font-semibold">
                Audit ID
              </TableHead>
              <TableHead className="px-6 py-3 font-semibold">
                Performed By
              </TableHead>
              {isAdmin && (
                <TableHead className="px-6 py-3 font-semibold">Store</TableHead>
              )}
              <TableHead className="px-6 py-3 font-semibold">
                Action / Qty Change
              </TableHead>
              <TableHead className="px-6 py-3 font-semibold">Table</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-slate-100 text-sm font-mono pb-2">
            {isLoading ? (
              Array(10)
                .fill(0)
                .map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="px-6 py-3">
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell className="px-6 py-3">
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell className="px-6 py-3">
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="px-6 py-3">
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                    )}
                    <TableCell className="px-6 py-3">
                      <Skeleton className="h-6 w-32 rounded-full" />
                    </TableCell>
                    <TableCell className="px-6 py-3">
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                  </TableRow>
                ))
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={isAdmin ? 6 : 5}
                  className="h-32 text-center text-slate-500 font-sans"
                >
                  No audit logs found.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log, index) => (
                <TableRow
                  key={log.logId ?? index}
                  className="hover:bg-slate-50/50"
                >
                  <TableCell className="px-6 py-3 text-slate-500">
                    {log.createdAt
                      ? format(new Date(log.createdAt), "yyyy-MM-dd HH:mm:ss")
                      : "N/A"}
                  </TableCell>
                  <TableCell className="px-6 py-3 text-slate-400">
                    #{ log.auditId}
                  </TableCell>
                  <TableCell className="px-6 py-3 font-sans">
                    <span className="text-purple-600 italic font-medium">
                      ⚡ TRIGGER
                    </span>
                  </TableCell>
                  {isAdmin && (
                    <TableCell className="px-6 py-3 font-sans text-slate-600">
                      {log.storeId ? `Store ${log.storeId}` : "-"}
                    </TableCell>
                  )}
                  <TableCell className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <Badge
                        className={`font-semibold text-xs border-transparent ${
                          log.action === "UPDATE"
                            ? "bg-blue-100 text-blue-800"
                            : log.action === "DELETE"
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                        }`}
                      >
                        {log.action}
                      </Badge>
                      <span className="text-xs text-slate-500">
                        {log.oldQty ?? "?"} → {log.newQty ?? "N/A"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-3">
                    <Badge
                      variant="secondary"
                      className="font-mono text-[10px] px-1.5 py-0 rounded bg-slate-100 text-slate-600"
                    >
                      INVENTORY
                    </Badge>
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
