import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin } from 'lucide-react';
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
import { StripeHostedCheckout } from '../payments/StripeHostedCheckout';

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

export const Checkout: React.FC<CheckoutProps> = ({ onBack, onSuccess }) => {
  const { state, clearCart } = useCart();
  const { t, i18n } = useTranslation('content');

  const [user, setUser] = useState<any>(null);
  const [customer, setCustomer] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auth check
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        supabase.from('customers').select('*').eq('user_id', user.id).maybeSingle()
          .then(({ data }) => setCustomer(data));
      }
    });

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

  // Convert cart items to Stripe format
  const taxAmount = state.total * 0.065;
  const checkoutItems = [
    ...state.items.map(item => ({
      name: item.name,
      amount: Math.round(item.price * 100),
      quantity: item.quantity
    })),
    {
      name: 'Tax (6.5%)',
      amount: Math.round(taxAmount * 100),
      quantity: 1
    }
  ];

  if (state.items.length === 0) {
    return <div className="text-center py-20">{t('shop.checkout.emptyCart')}</div>;
  }

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
          {!user && (
            <GlassCard className="p-6 mb-8 text-center">
              <h2 className="text-xl font-semibold mb-4">{t('shop.checkout.haveAccount')}</h2>
              <div className="flex justify-center gap-4">
                <LoginDialog><GlassButton variant="outline">{t('shop.checkout.signIn')}</GlassButton></LoginDialog>
              </div>
            </GlassCard>
          )}

          <Form {...form}>
            <div className="space-y-8">
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

              <GlassCard className="p-6">
                <FormField control={form.control} name="notes" render={({ field }) => (
                  <FormItem><FormLabel>{t('shop.checkout.notes')}</FormLabel><FormControl><Textarea {...field} className="glass-input" /></FormControl><FormMessage /></FormItem>
                )} />
              </GlassCard>

              {user ? (
                <StripeHostedCheckout
                  items={checkoutItems}
                  customerEmail={user.email}
                  buttonText={t('shop.checkout.placeOrder')}
                  metadata={{
                    notes: form.getValues('notes'),
                    shipping_address: JSON.stringify(form.getValues())
                  }}
                  className="w-full h-12 text-lg font-semibold"
                />
              ) : (
                <GlassButton className="w-full" size="lg" disabled>
                  {t('shop.checkout.signInRequired')}
                </GlassButton>
              )}
            </div>
          </Form>
        </div>

        <div className="lg:col-span-1">
          <GlassCard className="p-6 sticky top-8">
            <h2 className="text-xl font-semibold mb-6">{t('shop.checkout.orderSummary')}</h2>
            <div className="space-y-4">
              {state.items.map(item => (
                <div key={item.id} className="flex gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.name}</p>
                    {(item.size || item.color) && (
                      <p className="text-xs text-muted-foreground">
                        {[item.size && `Size: ${item.size}`, item.color && `Color: ${item.color}`].filter(Boolean).join(' | ')}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">{item.quantity}x {formatPrice(item.price)}</p>
                  </div>
                  <div className="text-sm font-medium">{formatPrice(item.price * item.quantity)}</div>
                </div>
              ))}
            </div>
            <div className="border-t border-border/50 pt-4 mt-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('shop.checkout.subtotal') || 'Subtotal'}:</span>
                <span>{formatPrice(state.total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('shop.checkout.tax') || 'Tax'} (6.5%):</span>
                <span>{formatPrice(state.total * 0.065)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-border/50">
                <span>{t('shop.checkout.total')}:</span>
                <span className="text-gradient">{formatPrice(state.total * 1.065)}</span>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
