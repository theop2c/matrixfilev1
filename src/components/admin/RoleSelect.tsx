import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Loader2 } from 'lucide-react';
import type { Utilisateur } from '@/types';

interface RoleSelectProps {
  currentRole: Utilisateur['role'];
  onRoleChange: (role: Utilisateur['role']) => Promise<void>;
}

export function RoleSelect({ currentRole, onRoleChange }: RoleSelectProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const roles: Utilisateur['role'][] = ['freemium', 'premium', 'or', 'admin'];

  const handleRoleChange = async (role: Utilisateur['role']) => {
    if (role === currentRole) {
      setIsEditing(false);
      return;
    }

    setLoading(true);
    try {
      await onRoleChange(role);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update role:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role: Utilisateur['role']) => {
    switch (role) {
      case 'or':
        return 'bg-yellow-100 text-yellow-800';
      case 'premium':
        return 'bg-purple-100 text-purple-800';
      case 'admin':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center space-x-2">
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          roles.map((role) => (
            <button
              key={role}
              onClick={() => handleRoleChange(role)}
              className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(role)} 
                ${role === currentRole ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
            >
              {role}
            </button>
          ))
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(currentRole)}`}>
        {currentRole}
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsEditing(true)}
        className="text-gray-500 hover:text-gray-700"
      >
        <Check className="w-4 h-4" />
      </Button>
    </div>
  );
}