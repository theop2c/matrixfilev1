import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { FileUpload } from './components/FileUpload';
import { FileList } from './components/FileList';
import { DashboardStats } from './components/DashboardStats';
//import { UpgradeSuccess } from './components/UpgradeSuccess';
import UpgradeButton from "./components/UpgradeButton";
import DashboardProfile from './components/DashboardProfile';

export function Dashboard() {
  const { user } = useAuthStore();
  //const [searchParams] = useSearchParams();
  //const isSuccess = searchParams.get('success') === 'true';
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Handle reload logic correctly
    if (location.state?.reload) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  if (!user) return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Loading...</p>
    </div>
  );

  return (
    
      <div className="max-w-7xl mx-auto px-4 py-8">
        
         
            <div className="mt-1 space-y-1">
          <DashboardProfile />
          <UpgradeButton />
          <DashboardStats />
          <FileUpload />
          <FileList />
        
      </div>
    </div>
  );
}
