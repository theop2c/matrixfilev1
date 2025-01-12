import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/button';
import { Check, Loader2 } from 'lucide-react';
import { SUBSCRIPTION_PLANS, STRIPE_PRICES } from '@/lib/stripe/config';
import { createCheckoutSession } from '@/lib/stripe/client';

export function PricingPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (plan: 'premium' | 'or') => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setLoading(plan);
      await createCheckoutSession(STRIPE_PRICES[plan], user.id);
    } catch (error) {
      console.error('Subscription error:', error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Plans & Pricing</h2>
          <p className="mt-4 text-xl text-gray-600">
            Choose the perfect plan for your needs
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => (
            <div
              key={key}
              className="bg-white rounded-lg shadow-lg overflow-hidden"
            >
              <div className="px-6 py-8">
                <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                <div className="mt-4">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  {plan.price > 0 && <span className="text-gray-500">/month</span>}
                </div>
                <ul className="mt-6 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="px-6 pb-8">
                {key !== 'gratuit' ? (
                  <Button
                    onClick={() => handleSubscribe(key as 'premium' | 'or')}
                    disabled={loading === key}
                    className="w-full"
                  >
                    {loading === key ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Subscribe'
                    )}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full"
                    disabled
                  >
                    Current Plan
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}