import { useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/button';
import { Loader2, Crown } from 'lucide-react';
import { createCheckoutSession } from '@/lib/stripe/client';
import { STRIPE_CONFIG } from '@/lib/stripe/config';
import { logger } from '@/lib/logger';

export function UpgradeButton() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);

  if (!user || user.role === 'or') return null;

  const targetTier = user.role === 'freemium' ? 'Premium' : 'Gold';
  const priceId = user.role === 'freemium' ? STRIPE_CONFIG.prices.premium : STRIPE_CONFIG.prices.or;

  const handleUpgrade = async () => {
    try {
      setLoading(true);
      const url = await createCheckoutSession(priceId, user.id);
      window.location.href = url;
    } catch (error) {
      logger.error('Upgrade error:', error);
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleUpgrade}
      disabled={loading}
      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <Crown className="w-4 h-4 mr-2" />
          Upgrade to {targetTier}
        </>
      )}
    </Button>
  );
}