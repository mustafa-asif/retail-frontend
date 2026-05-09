import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/lib/auth';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Topbar() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/dashboard')) return 'Dashboard';
    if (path.startsWith('/sales')) return 'Sales';
    if (path.startsWith('/products')) return 'Products';
    if (path.startsWith('/inventory')) return 'Inventory';
    if (path.startsWith('/customers')) return 'Customers';
    if (path.startsWith('/audit')) return 'Audit Logs';
    if (path.startsWith('/fragmentation')) return 'Fragmentation';
    if (path.startsWith('/stores')) return 'Stores';
    if (path.startsWith('/admin')) return 'Admin';
    return 'Overview';
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <span className="text-slate-900 font-medium">{getPageTitle()}</span>
        <span className="mx-1 italic">/</span>
        <span>Overview</span>
      </div>
      <div className="flex items-center gap-4">
        {user?.role === 'admin' ? (
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100 text-xs font-bold tracking-wide uppercase">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            All Branches
          </div>
        ) : (
           <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 text-slate-700 rounded-full border border-slate-200 text-xs font-bold tracking-wide uppercase">
            <span className="w-2 h-2 rounded-full bg-slate-500"></span>
            {user?.branch} Branch
          </div>
        )}
        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-500 hover:text-slate-700">
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </header>
  );
}
