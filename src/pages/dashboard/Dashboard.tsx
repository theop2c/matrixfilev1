import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { FileUpload } from './components/FileUpload';
import { FileList } from './components/FileList';
import { DashboardStats } from './components/DashboardStats';
import { UpgradeSuccess } from './components/UpgradeSuccess';
import UpgradeButton from "./components/UpgradeButton";

export function Dashboard() {
  const { user } = useAuthStore();
  const [searchParams] = useSearchParams();
  const isSuccess = searchParams.get('success') === 'true';
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Force a reload of the page when the dashboard is reached
    if (location.state?.reload) {
      navigate(location.pathname, { replace: true, state: {} });
      window.location.reload();
    }
  }, [location, navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {isSuccess && <UpgradeSuccess />}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <div className="mt-1 space-y-1">
              <p className="text-gray-600">Welcome, {user.email}</p>
              <p className="text-sm text-gray-500">ID: {user.id}</p>
              <p className="text-sm text-gray-500">Role: {user.role}</p>
            </div>
          </div>
          <UpgradeButton />
          <DashboardStats />
          <FileUpload />
          <FileList />
        </div>
      </div>
    </div>
  );
}
