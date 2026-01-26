import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripeJsPromise: Promise<Stripe | null>;

export const getStripeClient = () => {
    const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

    if (!publishableKey) {
        throw new Error('VITE_STRIPE_PUBLISHABLE_KEY is missing from environment variables');
    }

    if (!stripeJsPromise) {
        stripeJsPromise = loadStripe(publishableKey);
    }

    return stripeJsPromise;
};
