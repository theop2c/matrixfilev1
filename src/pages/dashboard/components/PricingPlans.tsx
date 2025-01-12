import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/button';
import { Check, Loader2 } from 'lucide-react';
import { STRIPE_CONFIG } from '@/lib/stripe/config';
import { createCheckoutSession } from '@/lib/stripe/client';
import { logger } from '@/lib/logger';

const PLANS = {
  premium: {
    name: 'Premium',
    price: 8.00,
    features: [
      '20MB storage',
      '50 files',
      'Advanced document analysis',
      'Priority support',
      'Custom analysis matrices'
    ],
    priceId: STRIPE_CONFIG.prices.premium
  },
  gold: {
    name: 'Gold',
    price: 18.00,
    features: [
      '50MB storage',
      'Unlimited files',
      'Premium document analysis',
      '24/7 priority support',
      'Custom analysis matrices',
      'Advanced AI features',
      'Team collaboration'
    ],
    priceId: STRIPE_CONFIG.prices.gold
  }
};

export function PricingPlans() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState<string | null>(null);

  const handleUpgrade = async (plan: 'premium' | 'gold') => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setLoading(plan);
      const url = await createCheckoutSession(PLANS[plan].priceId, user.id);
      window.location.href = url;
    } catch (error) {
      logger.error('Upgrade error:', error);
      setLoading(null);
    }
  };

  if (user?.role === 'gold') return null;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-6">Upgrade Your Account</h2>
      <div className="grid md:grid-cols-2 gap-6">
        {Object.entries(PLANS).map(([key, plan]) => (
          <div 
            key={key}
            className={`border rounded-lg p-6 ${
              user?.role === key ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            }`}
          >
            <h3 className="text-lg font-semibold">{plan.name}</h3>
            <p className="text-2xl font-bold mt-2">${plan.price}<span className="text-sm font-normal">/month</span></p>
            <ul className="mt-4 space-y-2">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center text-sm">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Button
              onClick={() => handleUpgrade(key as 'premium' | 'gold')}
              disabled={loading === key || user?.role === key}
              className="w-full mt-6"
            >
              {loading === key ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : user?.role === key ? (
                'Current Plan'
              ) : (
                'Upgrade Now'
              )}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}