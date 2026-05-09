import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useBranchFilter } from '@/hooks/useBranchFilter';
import { StatCard } from '@/components/dashboard/StatCard';
import { SalesChart } from '@/components/dashboard/SalesChart';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function Dashboard() {
  const { storeId, isAdmin } = useBranchFilter();

  const { data: dashboardData, isLoading, isError } = useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: () => api.analytics.getDashboard(),
  });

  const { data: monthlySales } = useQuery({
    queryKey: ['analytics', 'monthly-sales'],
    queryFn: () => api.analytics.getMonthlySales(),
  });

  const { data: storeSummary } = useQuery({
    queryKey: ['analytics', 'store-summary'],
    queryFn: () => api.analytics.getStoreSummary(),
  });

  const dData = dashboardData as any;

  return (
    <div className="flex-1 space-y-6 overflow-hidden flex flex-col">
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)
        ) : isError ? (
          <Alert variant="destructive" className="col-span-full">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>Failed to load dashboard metrics. Backend services may be down.</AlertDescription>
          </Alert>
        ) : (
          <>
            <StatCard 
              title="Total Revenue" 
              value={`PKR ${Number(dData?.totalRevenue || 0).toLocaleString()}`} 
              trend={dData?.revenueTrend ? `↑ ${dData.revenueTrend}%` : undefined} 
              subtitle="vs last month" 
              status="success" 
            />
            <StatCard 
              title="Total Sales" 
              value={(dData?.totalSales || 0).toLocaleString()} 
              trend={dData?.salesTrend ? `↑ ${dData.salesTrend}%` : undefined} 
              subtitle="vs last month" 
              status="success" 
            />
            <StatCard 
              title="Active Items" 
              value={(dData?.activeItems || 0).toLocaleString()} 
              trend="0%" 
              subtitle="no change" 
              status="neutral" 
            />
            <StatCard 
              title="Low Stock Alert" 
              value={`${dData?.lowStockItems || 0} Items`} 
              subtitle={dData?.lowStockItems > 0 ? "Action Required" : "Stock Healthy"} 
              status={dData?.lowStockItems > 0 ? "error" : "success"} 
              isAlert={dData?.lowStockItems > 0} 
            />
          </>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-80">
        <div className="col-span-1 lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-sm uppercase tracking-wider text-slate-700">Monthly Revenue Performance</h4>
            <select className="text-xs bg-slate-50 border-slate-200 rounded p-1">
              <option>Last 6 Months</option>
            </select>
          </div>
          <div className="flex-1 min-h-[200px]">
             {/* Mocking data or use API if it worked */}
             <SalesChart data={(monthlySales as any[]) || []} />
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col">
          <h4 className="font-bold text-sm uppercase tracking-wider text-slate-700 mb-4">Store Contribution</h4>
          <div className="space-y-4">
            {(storeSummary as any[] || []).map((store: any, idx: number) => {
              const bgColors = ["bg-blue-500", "bg-emerald-500", "bg-amber-500"];
              const bgColor = bgColors[idx % bgColors.length];
              return (
                <div key={store.id || idx}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${bgColor}`}></div>
                      <span className="text-xs font-medium uppercase">{store.name || store.location || `Store ${store.id}`}</span>
                    </div>
                    <span className="text-xs font-bold">{store.percentage || 0}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
                    <div className={`${bgColor} h-full`} style={{ width: `${store.percentage || 0}%` }}></div>
                  </div>
                </div>
              );
            })}
            
            {!(storeSummary as any[] || []).length && (
              <div className="text-sm text-slate-500 text-center py-4">No store performance data available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
