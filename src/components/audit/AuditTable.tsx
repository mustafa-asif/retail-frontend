import React from 'react';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { TriggerBadge } from './TriggerBadge';
import { Badge } from '@/components/ui/badge';

interface AuditTableProps {
  logs: any[];
  isLoading: boolean;
  isAdmin: boolean;
}

export function AuditTable({ logs, isLoading, isAdmin }: AuditTableProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm flex-1 flex flex-col min-h-0">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
        <h4 className="font-bold text-sm uppercase tracking-wider text-slate-700">System Audit Logs</h4>
        <div className="text-xs text-slate-500">Showing {logs.length} entries</div>
      </div>
      
      <div className="overflow-auto flex-1">
        <Table className="text-left border-collapse w-full">
          <TableHeader className="text-[11px] uppercase tracking-wider text-slate-400 bg-white sticky top-0 z-10">
            <TableRow className="border-b border-slate-100">
              <TableHead className="px-6 py-3 font-semibold w-[180px]">Timestamp</TableHead>
              <TableHead className="px-6 py-3 font-semibold">Log ID</TableHead>
              <TableHead className="px-6 py-3 font-semibold">Performed By</TableHead>
              {isAdmin && <TableHead className="px-6 py-3 font-semibold">Store</TableHead>}
              <TableHead className="px-6 py-3 font-semibold">Action</TableHead>
              <TableHead className="px-6 py-3 font-semibold">Table</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-slate-100 text-sm font-mono pb-2">
            {isLoading ? (
               Array(10).fill(0).map((_, i) => (
                 <TableRow key={i}>
                   <TableCell className="px-6 py-3"><Skeleton className="h-4 w-32" /></TableCell>
                   <TableCell className="px-6 py-3"><Skeleton className="h-4 w-16" /></TableCell>
                   <TableCell className="px-6 py-3"><Skeleton className="h-4 w-24" /></TableCell>
                   {isAdmin && <TableCell className="px-6 py-3"><Skeleton className="h-4 w-20" /></TableCell>}
                   <TableCell className="px-6 py-3"><Skeleton className="h-6 w-32 rounded-full" /></TableCell>
                   <TableCell className="px-6 py-3"><Skeleton className="h-4 w-20" /></TableCell>
                 </TableRow>
               ))
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 6 : 5} className="h-32 text-center text-slate-500 font-sans">
                  No audit logs found.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id} className="hover:bg-slate-50/50">
                  <TableCell className="px-6 py-3 text-slate-500">
                    {log.createdAt ? format(new Date(log.createdAt), 'yyyy-MM-dd HH:mm:ss') : 'N/A'}
                  </TableCell>
                  <TableCell className="px-6 py-3 text-slate-400">#{log.id}</TableCell>
                  <TableCell className="px-6 py-3 font-sans">
                    {(!log.performedBy || log.performedBy === 'SYSTEM') ? (
                      <span className="text-slate-400 italic">SYSTEM</span>
                    ) : (
                      <span className="font-medium text-slate-700">{log.performedBy}</span>
                    )}
                  </TableCell>
                  {isAdmin && (
                    <TableCell className="px-6 py-3 font-sans text-slate-600">
                      {log.storeId ? `Store ${log.storeId}` : '-'}
                    </TableCell>
                  )}
                  <TableCell className="px-6 py-3">
                    <TriggerBadge source={log.source} performedBy={log.performedBy} action={log.action} />
                  </TableCell>
                  <TableCell className="px-6 py-3">
                    <Badge variant="secondary" className="font-mono text-[10px] px-1.5 py-0 rounded bg-slate-100 text-slate-600">
                      {log.table || 'UNKNOWN'}
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
