import { USER_ROLE_NAMES } from '@/lib/constants';
import type { Utilisateur } from '@/types';

interface UserRoleBadgeProps {
  role: Utilisateur['role'];
}

export function UserRoleBadge({ role }: UserRoleBadgeProps) {
  const getBadgeStyles = () => {
    switch (role) {
      case 'or':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'premium':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getBadgeStyles()}`}>
      {USER_ROLE_NAMES[role]}
    </span>
  );
}