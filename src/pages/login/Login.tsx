import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth';
import { Button } from '../../components/ui/button';
import { LogIn } from 'lucide-react';

export function Login() {
  const { user, signIn } = useAuthStore();

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome</h1>
          <p className="text-gray-600">Sign in to access your AI File Analyzer</p>
        </div>

        <Button
          onClick={() => signIn()}
          className="w-full flex items-center justify-center gap-2"
        >
          <LogIn className="w-5 h-5" />
          Sign in with Google
        </Button>
      </div>
    </div>
  );
}