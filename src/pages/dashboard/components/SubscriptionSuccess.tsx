import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import { CheckCircle } from 'lucide-react';

export function SubscriptionSuccess() {
  const navigate = useNavigate();
  const { refreshUser, user } = useAuthStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/dashboard', { replace: true });
    }, 3000);

    if (user) {
      refreshUser(user.id);
    }

    return () => clearTimeout(timer);
  }, [navigate, refreshUser, user]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
        <p className="text-gray-600">
          Your subscription has been updated. You'll be redirected to the dashboard shortly.
        </p>
      </div>
    </div>
  );
}