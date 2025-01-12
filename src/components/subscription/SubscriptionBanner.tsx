import { useSubscriptionStatus } from '@/lib/stripe/hooks/useSubscriptionStatus';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export function SubscriptionBanner() {
  const { subscription, isActive, willCancel, renewalDate } = useSubscriptionStatus();

  if (!subscription || isActive && !willCancel) {
    return null;
  }

  if (subscription.status === 'past_due') {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-400" />
          <p className="ml-3 text-sm text-red-700">
            Your payment is past due. Please update your payment method to continue using premium features.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="ml-auto"
            onClick={() => {/* Implement payment update flow */}}
          >
            Update Payment
          </Button>
        </div>
      </div>
    );
  }

  if (willCancel && renewalDate) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-yellow-400" />
          <p className="ml-3 text-sm text-yellow-700">
            Your subscription will end on {renewalDate.toLocaleDateString()}. 
            Renew now to keep your premium features.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="ml-auto"
            onClick={() => {/* Implement renewal flow */}}
          >
            Renew Now
          </Button>
        </div>
      </div>
    );
  }

  return null;
}