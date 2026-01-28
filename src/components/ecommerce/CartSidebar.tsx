import React from 'react';
import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useTranslation } from 'react-i18next';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, onClose, onCheckout }) => {
  const { state, removeItem, updateQuantity, clearCart } = useCart();
  const { t, i18n } = useTranslation('content');

  const formatPrice = (price: number) => {
    const locale = i18n.language === 'pt' ? 'pt-BR' : i18n.language === 'es' ? 'es-ES' : 'en-US';
    return new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD' }).format(price);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg glass-card border-l border-border/50">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-xl">
            <ShoppingBag className="h-5 w-5" />
            {t('shop.cart.title', { count: state.itemCount })}
          </SheetTitle>
          <SheetDescription>
            {t('shop.cart.description')}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col h-full pt-6">
          {state.items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground mb-2">{t('shop.cart.empty')}</p>
              <p className="text-sm text-muted-foreground mb-4">
                {t('shop.cart.emptyDescription')}
              </p>
              <Button onClick={onClose} variant="outline">
                {t('shop.cart.continueShopping')}
              </Button>
            </div>
          ) : (
            <>
              <div className="flex-1 space-y-4 overflow-y-auto pr-2">
                {state.items.map((item) => (
                  <GlassCard key={item.id} className="p-4">
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <img
                          src={item.image_url || "/placeholder.svg"}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/placeholder.svg";
                          }}
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm leading-tight mb-2 truncate">
                          {item.name}
                        </h4>

                        {(item.size || item.color) && (
                          <div className="flex flex-wrap gap-2 mb-2 text-xs text-muted-foreground">
                            {item.size && <span className="bg-secondary/50 px-1.5 py-0.5 rounded">Size: {item.size}</span>}
                            {item.color && <span className="bg-secondary/50 px-1.5 py-0.5 rounded">Color: {item.color}</span>}
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-gradient">
                            {formatPrice(item.price)}
                            {item.unit && (
                              <span className="text-xs text-muted-foreground ml-1">
                                /{item.unit}
                              </span>
                            )}
                          </span>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2">
                            <GlassButton
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="h-8 w-8 p-0"
                            >
                              <Minus className="h-3 w-3" />
                            </GlassButton>

                            <span className="w-8 text-center text-sm font-medium">
                              {item.quantity}
                            </span>

                            <GlassButton
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="h-8 w-8 p-0"
                            >
                              <Plus className="h-3 w-3" />
                            </GlassButton>
                          </div>

                          <GlassButton
                            size="sm"
                            variant="outline"
                            onClick={() => removeItem(item.id)}
                            className="h-8 w-8 p-0 hover:bg-destructive/20"
                          >
                            <Trash2 className="h-3 w-3" />
                          </GlassButton>
                        </div>

                        {/* Item Total */}
                        <div className="text-right mt-2">
                          <span className="text-sm text-muted-foreground">
                            {t('shop.cart.itemTotal')}: {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>

              {/* Cart Summary */}
              <div className="border-t border-border/50 pt-4 mt-4 space-y-4">
                <div className="flex items-center justify-between text-lg font-bold">
                  <span>{t('shop.cart.total')}:</span>
                  <span className="text-gradient">{formatPrice(state.total)}</span>
                </div>

                <div className="space-y-3">
                  <GlassButton
                    className="w-full"
                    onClick={onCheckout}
                    size="lg"
                  >
                    {t('shop.cart.checkout')}
                  </GlassButton>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={onClose}
                      className="flex-1"
                    >
                      {t('shop.cart.continueShopping')}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={clearCart}
                      className="px-4"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};