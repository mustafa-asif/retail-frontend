import { NavLink, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/lib/auth';
import { 
  LayoutDashboard, 
  Store, 
  Package, 
  Users, 
  ShoppingCart, 
  ClipboardList, 
  BarChart, 
  Database,
  History,
  Settings,
  PlusCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default function Sidebar() {
  const { user } = useAuthStore();
  const location = useLocation();
  const isAdmin = user?.role === 'admin';

  const adminNavItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Stores', href: '/stores', icon: Store },
    { name: 'Products', href: '/products', icon: Package },
    { name: 'Customers', href: '/customers', icon: Users },
    { name: 'Sales', href: '/sales', icon: ShoppingCart },
    { name: 'Inventory', href: '/inventory', icon: ClipboardList },
    { name: 'Analytics', href: '/dashboard#analytics', icon: BarChart }, // Scrolls in dashboard
    { name: 'Fragmentation', href: '/fragmentation', icon: Database },
    { name: 'Audit Logs', href: '/audit', icon: History },
    { name: 'Admin', href: '/admin', icon: Settings },
  ];

  const managerNavItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Products', href: '/products', icon: Package },
    { name: 'Customers', href: '/customers', icon: Users },
    { name: 'Sales', href: '/sales', icon: ShoppingCart },
    { name: 'New Sale', href: '/sales/new', icon: PlusCircle },
    { name: 'Inventory', href: '/inventory', icon: ClipboardList },
    { name: 'Audit Logs', href: '/audit', icon: History },
  ];

  const navItems = isAdmin ? adminNavItems : managerNavItems;

  return (
    <aside className="hidden md:flex w-60 flex-col bg-[#0f172a] text-white shrink-0 h-full">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center font-bold text-lg">R</div>
        <span className="font-bold tracking-tight text-xl uppercase">RETAIL PRO</span>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.href) && item.href !== '/dashboard' || location.pathname === item.href;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors",
                isActive 
                  ? "bg-blue-600 rounded-lg text-white" 
                  : "text-slate-400 hover:text-white"
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" aria-hidden="true" />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto p-4 border-t border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-semibold text-slate-300">
            {user?.name?.substring(0, 2).toUpperCase() || 'U'}
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {user?.role === 'admin' ? 'Administrator' : 'Manager'}
            </p>
            <p className="text-sm font-medium text-white">{user?.name}</p>
          </div>
        </div>
        {user?.branch && (
          <div className="mt-3 text-xs uppercase tracking-wider text-slate-400 font-bold px-1">
            {user.branch} BRANCH
          </div>
        )}
      </div>
    </aside>
  );
}
