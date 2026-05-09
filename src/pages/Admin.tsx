import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity, Users, Settings, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminPage() {
  const { data: jobs, isLoading: isJobsLoading } = useQuery({
    queryKey: ['admin', 'jobs'],
    queryFn: () => api.admin.getJobs(),
  });

  const { data: users, isLoading: isUsersLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => api.admin.getUsers(),
  });

  const { data: roles, isLoading: isRolesLoading } = useQuery({
    queryKey: ['admin', 'roles'],
    queryFn: () => api.admin.getRoles(),
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Admin Operations</h2>
        <p className="text-sm text-slate-500">Manage system settings, users, and background jobs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="h-full">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <CardTitle>System Jobs</CardTitle>
            </div>
            <CardDescription>Monitor and trigger background processed</CardDescription>
          </CardHeader>
          <CardContent>
            {isJobsLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {((jobs as any[]) || []).map((job, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{job.name}</TableCell>
                      <TableCell>{job.status || 'Idle'}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" onClick={() => api.admin.runJob(job.name)}>
                          Run Now
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!((jobs as any[]) || []).length && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-4 text-slate-500">No jobs defined</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <CardTitle>Users and Roles</CardTitle>
            </div>
            <CardDescription>All system users and their assignments</CardDescription>
          </CardHeader>
          <CardContent>
            {isUsersLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Role</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {((users as any[]) || []).map(u => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.username}</TableCell>
                      <TableCell className="uppercase text-xs">{u.role}</TableCell>
                    </TableRow>
                  ))}
                  {!((users as any[]) || []).length && (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center py-4 text-slate-500">No users found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
            
            <h4 className="font-bold text-sm mt-6 mb-2">Available Roles</h4>
            <div className="flex gap-2 flex-wrap">
              {((roles as any[]) || []).map((r: any) => (
                <div key={r.id} className="px-3 py-1 bg-slate-100 rounded text-sm text-slate-700">
                  {r.name}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
