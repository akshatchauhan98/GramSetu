import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ allowedRoles = [] }) {
  const { user, token, isAuthenticated, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F7F2] flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-3xl border border-emerald-100 shadow-md space-y-4 max-w-sm w-full">
          <Loader2 className="w-10 h-10 text-[#0F3D2E] animate-spin mx-auto" />
          <h2 className="text-lg font-extrabold text-[#0F3D2E]">GramSetu</h2>
          <p className="text-sm font-medium text-[#5C6B63]">Checking session status...</p>
        </div>
      </div>
    );
  }

  // Safe Demo / Active User Fallback
  const activeUser =
    user || {
      id: 'demo-mill-procurement',
      name: 'Moradabad Rice Works',
      role: 'mill',
      district: 'Moradabad',
      state: 'Uttar Pradesh',
    };

  // Role check if specific allowedRoles provided
  if (allowedRoles.length > 0 && !allowedRoles.includes(activeUser.role)) {
    if (activeUser.role === 'mill') return <Navigate to="/mill" replace />;
    if (activeUser.role === 'gov') return <Navigate to="/gov" replace />;
    return <Navigate to="/farmer" replace />;
  }

  return <Outlet context={{ activeUser }} />;
}
