import { handleSubscriptionUpdate } from '@/lib/stripe/webhook';
import { logger } from '@/lib/logger';
import Stripe from 'stripe';

const stripe = new Stripe(import.meta.env.VITE_STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia'
});

export async function handleWebhook(req: Request) {
  try {
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return new Response('No signature', { status: 400 });
    }

    const event = stripe.webhooks.constructEvent(
      await req.text(),
      signature,
      import.meta.env.VITE_STRIPE_WEBHOOK_SECRET
    );

    switch (event.type) {
      case 'checkout.session.completed':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event);
        break;
      default:
        logger.info(`Unhandled event type: ${event.type}`);
    }

    return new Response('Webhook handled successfully', { status: 200 });
  } catch (error) {
    logger.error('Webhook error:', error);
    return new Response(
      'Webhook error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      { status: 400 }
    );
  }
}