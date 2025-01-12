import { BrowserRouter as Router } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/auth';
import { AppRoutes } from './routes';

export default function App() {
  const { initialize } = useAuthStore();

  useEffect(() => {
    const unsubscribe = initialize();
    return () => unsubscribe();
  }, [initialize]);

  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}