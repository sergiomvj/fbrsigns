import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, User, Trash2, CreditCard } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCart } from '@/hooks/useCart';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { LoginDialog } from '@/components/auth/LoginDialog';
import { useTranslation } from 'react-i18next';
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { createPaymentIntent } from "@/services/stripe";

// Initialize Stripe with the key from environment variables
const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
console.log("[Checkout] Initializing Stripe with key present:", !!stripeKey);

const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

const getCheckoutSchema = (t: any) => z.object({
  // Shipping Address
  street: z.string().min(5, t('shop.checkout.validation.streetRequired')),
  number: z.string().min(1, t('shop.checkout.validation.numberRequired')),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().min(2, t('shop.checkout.validation.cityRequired')),
  state: z.string().min(2, t('shop.checkout.validation.stateRequired')),
  zipCode: z.string().min(5, t('shop.checkout.validation.zipCodeRequired')),
  // Additional
  notes: z.string().optional()
});

type CheckoutForm = z.infer<ReturnType<typeof getCheckoutSchema>>;

interface CheckoutProps {
  onBack: () => void;
  onSuccess: () => void;
}

const CheckoutContent: React.FC<CheckoutProps & { clientSecret: string }> = ({ onBack, onSuccess, clientSecret }) => {
  const { state, clearCart } = useCart();
  const { t, i18n } = useTranslation('content');
  const stripe = useStripe();
  const elements = useElements();
  
  const [user, setUser] = useState<any>(null);
  const [customer, setCustomer] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auth check
  useEffect(() => {
    // Initial check
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        supabase.from('customers').select('*').eq('user_id', user.id).maybeSingle()
          .then(({ data }) => setCustomer(data));
      }
    });

    // Listen for auth changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        supabase.from('customers').select('*').eq('user_id', currentUser.id).maybeSingle()
          .then(({ data }) => setCustomer(data));
      } else {
        setCustomer(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const form = useForm<CheckoutForm>({
    resolver: zodResolver(getCheckoutSchema(t)),
    defaultValues: {
      street: '', number: '', complement: '', neighborhood: '', city: '', state: '', zipCode: '', notes: ''
    }
  });

  const formatPrice = (price: number) => {
    const locale = i18n.language === 'pt' ? 'pt-BR' : i18n.language === 'es' ? 'es-ES' : 'en-US';
    return new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD' }).format(price);
  };

  const onSubmit = async (data: CheckoutForm) => {
    setErrorMessage(null);
    console.log("[Checkout] Form submitted", data);

    if (!stripe || !elements) {
      console.error("[Checkout] Stripe or Elements not ready");
      return;
    }

    if (!user) {
      toast({ title: t('shop.checkout.signInRequired'), variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Create Order in Supabase
      const shippingAddress = {
        street: data.street,
        number: data.number,
        complement: data.complement || '',
        neighborhood: data.neighborhood,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode
      };

      const orderPayload = {
        customer_id: customer?.id || null,
        customer_name: customer?.full_name || user.email,
        customer_email: user.email,
        customer_phone: customer?.phone,
        payment_method: 'credit_card',
        shipping_address: shippingAddress,
        notes: data.notes || '',
        status: 'Pendente'
      };

      console.log("[Checkout] Creating order...", orderPayload);
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderPayload)
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Create Order Items
      const orderItems = state.items.map(item => ({
        order_id: order.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;

      // 3. Confirm Payment with Stripe
      console.log("[Checkout] Confirming payment with Stripe...");
      const { error: stripeError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + '/order-confirmation/' + order.id,
          payment_method_data: {
            billing_details: {
              name: customer?.full_name || user.email,
              email: user.email,
              address: {
                line1: shippingAddress.street + ' ' + shippingAddress.number,
                city: shippingAddress.city,
                state: shippingAddress.state,
                postal_code: shippingAddress.zipCode,
                country: 'US',
              }
            }
          }
        },
        redirect: 'if_required',
      });

      if (stripeError) {
        console.error("[Checkout] Stripe Error:", stripeError);
        throw new Error(stripeError.message);
      }

      console.log("[Checkout] Payment successful!");
      clearCart();
      toast({
        title: "Order placed successfully!",
        description: `Order #${order.invoice_number || order.id.slice(0, 8)} created.`
      });
      onSuccess();

    } catch (error: any) {
      console.error('[Checkout] Submission Error:', error);
      setErrorMessage(error.message || "An unexpected error occurred.");
      toast({
        title: t('shop.checkout.errorProcessing'),
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('shop.checkout.back')}
        </Button>
        <h1 className="text-3xl font-bold">{t('shop.checkout.title')}</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Auth Section */}
          {!user && (
             <GlassCard className="p-6 mb-8 text-center">
                <h2 className="text-xl font-semibold mb-4">{t('shop.checkout.haveAccount')}</h2>
                <div className="flex justify-center gap-4">
                  <LoginDialog><GlassButton variant="outline">{t('shop.checkout.signIn')}</GlassButton></LoginDialog>
                </div>
             </GlassCard>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Shipping Address */}
              <GlassCard className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <MapPin className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">{t('shop.checkout.shippingAddress')}</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                   <FormField control={form.control} name="street" render={({ field }) => (
                     <FormItem><FormLabel>{t('shop.checkout.streetAddress')}</FormLabel><FormControl><Input {...field} className="glass-input" /></FormControl><FormMessage /></FormItem>
                   )} />
                   <FormField control={form.control} name="number" render={({ field }) => (
                     <FormItem><FormLabel>{t('shop.checkout.number')}</FormLabel><FormControl><Input {...field} className="glass-input" /></FormControl><FormMessage /></FormItem>
                   )} />
                   <FormField control={form.control} name="city" render={({ field }) => (
                     <FormItem><FormLabel>{t('shop.checkout.city')}</FormLabel><FormControl><Input {...field} className="glass-input" /></FormControl><FormMessage /></FormItem>
                   )} />
                   <FormField control={form.control} name="state" render={({ field }) => (
                     <FormItem><FormLabel>{t('shop.checkout.state')}</FormLabel><FormControl><Input {...field} className="glass-input" /></FormControl><FormMessage /></FormItem>
                   )} />
                   <FormField control={form.control} name="zipCode" render={({ field }) => (
                     <FormItem><FormLabel>{t('shop.checkout.zipCode')}</FormLabel><FormControl><Input {...field} className="glass-input" /></FormControl><FormMessage /></FormItem>
                   )} />
                </div>
              </GlassCard>

              {/* Payment Element */}
              <GlassCard className="p-6">
                 <div className="flex items-center gap-2 mb-6">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-semibold">{t('shop.checkout.paymentMethod')}</h2>
                 </div>
                 <PaymentElement />
              </GlassCard>
              
              {/* Additional Notes */}
              <GlassCard className="p-6">
                <FormField control={form.control} name="notes" render={({ field }) => (
                  <FormItem><FormLabel>{t('shop.checkout.notes')}</FormLabel><FormControl><Textarea {...field} className="glass-input" /></FormControl><FormMessage /></FormItem>
                )} />
              </GlassCard>

              {/* Error Display */}
              {errorMessage && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
                  <p className="font-bold">Payment Error:</p>
                  <p>{errorMessage}</p>
                </div>
              )}

              <GlassButton type="submit" className="w-full" size="lg" disabled={isSubmitting || !user || !stripe || !elements}>
                {isSubmitting ? t('shop.checkout.processing') : t('shop.checkout.placeOrder')}
              </GlassButton>
            </form>
          </Form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <GlassCard className="p-6 sticky top-8">
            <h2 className="text-xl font-semibold mb-6">{t('shop.checkout.orderSummary')}</h2>
            <div className="space-y-4">
               {state.items.map(item => (
                 <div key={item.id} className="flex gap-3">
                   <div className="flex-1"><p className="text-sm font-medium">{item.name}</p><p className="text-xs text-muted-foreground">{item.quantity}x {formatPrice(item.price)}</p></div>
                   <div className="text-sm font-medium">{formatPrice(item.price * item.quantity)}</div>
                 </div>
               ))}
            </div>
            <div className="border-t border-border/50 pt-4 mt-6">
               <div className="flex justify-between font-bold text-lg"><span>{t('shop.checkout.total')}:</span><span className="text-gradient">{formatPrice(state.total)}</span></div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export const Checkout: React.FC<CheckoutProps> = (props) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const { state } = useCart();
  const { t } = useTranslation('content');

  useEffect(() => {
    console.log("[Checkout] Mounting Checkout Component");
    if (state.total > 0) {
      createPaymentIntent(state.total).then(res => {
        if (res?.clientSecret) {
          console.log("[Checkout] Client Secret received");
          setClientSecret(res.clientSecret);
        }
      }).catch(err => {
        console.error("[Checkout] Failed to fetch client secret:", err);
      });
    }
  }, [state.total]);

  if (!stripePromise) {
    return <div className="text-center py-20 text-destructive">Stripe configuration missing (VITE_STRIPE_PUBLISHABLE_KEY).</div>;
  }

  if (state.items.length === 0) {
     return <div className="text-center py-20">{t('shop.checkout.emptyCart')}</div>;
  }

  if (!clientSecret) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutContent {...props} clientSecret={clientSecret} />
    </Elements>
  );
};
