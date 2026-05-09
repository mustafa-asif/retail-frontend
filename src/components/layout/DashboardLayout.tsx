import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/lib/auth';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function DashboardLayout() {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fafc] text-[#1e293b] font-sans">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full">
        <Topbar />
        
        {/* Branch Banner for Managers */}
        {user?.role === 'manager' && user.branch && (
          <div className={`h-1.5 w-full shrink-0 ${
            user.branch === 'Gulshan' ? 'bg-blue-500' : 
            user.branch === 'Defense' ? 'bg-emerald-500' : 
            'bg-amber-500'
          }`} />
        )}
        
        <div className="flex-1 overflow-x-hidden overflow-y-auto w-full p-8 space-y-6">
          <div className="mx-auto w-full max-w-7xl">
             <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
