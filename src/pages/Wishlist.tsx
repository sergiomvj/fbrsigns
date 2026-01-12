import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { ProductCard } from '@/components/ecommerce/ProductCard';
import { useWishlist } from '@/hooks/useWishlist';
import { Loader2, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function Wishlist() {
  const { wishlist, isLoading } = useWishlist();
  const { t } = useTranslation(['content', 'common']);

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <Heart className="h-8 w-8 text-red-500 fill-current" />
          {t('common:wishlist.title') || "My Wishlist"}
        </h1>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : wishlist.length === 0 ? (
          <div className="text-center py-20 bg-muted/30 rounded-lg">
            <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">{t('common:wishlist.empty') || "Your wishlist is empty"}</h2>
            <p className="text-muted-foreground mb-6">{t('common:wishlist.emptyDesc') || "Start adding items you love!"}</p>
            <Link to="/products">
              <Button>{t('common:buttons.browseProducts') || "Browse Products"}</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlist.map((item) => (
              item.products && (
                <ProductCard 
                  key={item.id} 
                  product={item.products}
                />
              )
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
