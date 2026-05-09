import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: string; // e.g. "↑ 12.5%"
  subtitle?: string; // e.g. "vs last month"
  status?: 'neutral' | 'success' | 'warning' | 'error';
  isAlert?: boolean; // For the low stock alert style
}

export function StatCard({ title, value, trend, subtitle, status = 'neutral', isAlert }: StatCardProps) {
  return (
    <Card className={cn("p-5 rounded-xl border border-slate-200 shadow-sm", isAlert && "border-l-4 border-l-red-500")}>
      <CardContent className="p-0">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{title}</p>
        <h3 className={cn("text-2xl font-bold mt-1", isAlert ? "text-red-600" : "text-slate-900")}>
          {value}
        </h3>
        
        {(trend || subtitle) && (
          <div className={cn(
            "flex items-center gap-1 mt-2 text-xs font-medium",
             status === 'success' ? "text-emerald-600" :
             status === 'error' ? "text-red-600" :
             status === 'warning' ? "text-amber-600" :
             "text-slate-400"
          )}>
            {trend && <span>{trend}</span>}
            {subtitle && <span className="text-slate-400 ml-1 italic font-normal">{subtitle}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
