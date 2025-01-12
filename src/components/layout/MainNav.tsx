import { useLocation, Link } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, LogOut, ListChecks, History, Settings } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/button';
import { LanguageToggle } from '@/components/LanguageToggle';
import { useTranslation } from '@/hooks/useTranslation';

export function MainNav() {
  const location = useLocation();
  const { user, signOut } = useAuthStore();
  const { t } = useTranslation();

  const navigation = [
    { name: t('dashboard.title'), href: '/dashboard', icon: LayoutDashboard },
    { name: t('chat.title'), href: '/chat', icon: MessageSquare },
    { name: 'Matrices', href: '/matrices', icon: ListChecks },
    { name: 'History', href: '/history', icon: History },
    ...(user?.email === 'theo.saintadam@gmail.com' ? [
      { name: 'Admin', href: '/admin', icon: Settings }
    ] : [])
  ];

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`inline-flex items-center px-4 text-sm font-medium border-b-2 ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  {item.name}
                </Link>
              );
            })}
          </div>
          
          <div className="flex items-center space-x-4">
            <LanguageToggle />
            <Button
              onClick={() => signOut()}
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-700"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {t('auth.signOut')}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}