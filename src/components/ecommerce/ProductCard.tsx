import React from 'react';
import { Star, ShoppingCart, Eye, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  additional_images?: string[];
  category?: string;
  unit?: string;
  categories?: {
    name: string;
    has_sizes?: boolean;
    has_colors?: boolean;
  };
  has_sizes?: boolean;
  has_colors?: boolean;
  product_variants?: {
    image_url: string | null;
  }[];
}

interface ProductCardProps {
  product: Product;
  onViewDetails?: () => void;
  viewMode?: 'grid' | 'list';
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onViewDetails,
  viewMode = 'grid'
}) => {
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { t, i18n } = useTranslation('content');
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);

  console.log('ProductCard debug:', {
    id: product.id,
    additional_images: product.additional_images,
    isArray: Array.isArray(product.additional_images)
  });

  const allImages = React.useMemo(() => {
    const images = [];
    if (product.image_url) images.push(product.image_url);
    if (product.additional_images && Array.isArray(product.additional_images)) {
      images.push(...product.additional_images);
    }

    // Add variant images
    if (product.product_variants && Array.isArray(product.product_variants)) {
      const variantImages = product.product_variants
        .map(v => v.image_url)
        .filter((url): url is string => !!url);
      images.push(...variantImages);
    }

    const uniqueImages = Array.from(new Set(images.filter(Boolean)));
    return uniqueImages.length > 0 ? uniqueImages : ['/placeholder.svg'];
  }, [product.image_url, product.additional_images, product.product_variants]);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const isWishlisted = isInWishlist(product.id);

  const slugify = (s: string) => s?.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || '';

  const formatPrice = (price: number) => {
    const locale = i18n.language === 'pt' ? 'pt-BR' : i18n.language === 'es' ? 'es-ES' : 'en-US';
    return new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD' }).format(price);
  };

  const hasOptions = product.has_sizes || product.has_colors || product.categories?.has_sizes || product.categories?.has_colors;

  const handleAddToCart = () => {
    if (hasOptions) {
      if (onViewDetails) {
        onViewDetails();
      } else {
        // If onViewDetails is not provided, navigate to ecommerce page with selected product
        navigate('/ecommerce', { state: { selectedProduct: product } });
      }
      return;
    }

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      unit: product.unit
    });
  };

  return (
    <GlassCard
      variant="interactive"
      className={`group ${viewMode === "list"
        ? "flex flex-col sm:flex-row gap-4 sm:gap-6"
        : ""
        }`}
    >
      {/* Product Image Carousel */}
      <div className={`${viewMode === "list"
        ? "w-full sm:w-48 sm:flex-shrink-0 h-48 sm:h-auto"
        : "mb-4 sm:mb-6"
        } aspect-square rounded-lg overflow-hidden bg-muted relative`}>

        {/* Main Image */}
        <img
          src={allImages[currentImageIndex] || "/placeholder.svg"}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder.svg";
          }}
        />

        {/* Carousel Controls */}
        {allImages.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white opacity-100 hover:bg-black/70 z-20"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white opacity-100 hover:bg-black/70 z-20"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            {/* Dots Indicator */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-20">
              {allImages.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${idx === currentImageIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Category Badge */}
        {(product.categories?.name || product.category) && (
          <Badge
            variant="secondary"
            className="absolute top-2 left-2 bg-background/90 backdrop-blur-sm text-xs z-10"
          >
            {t(`shop.categories.${slugify(product.categories?.name || product.category || '')}` as any, { defaultValue: product.categories?.name || product.category })}
          </Badge>
        )}

        {/* Options Available Badge */}
        {hasOptions && (
          <Badge
            variant="default"
            className="absolute bottom-2 left-2 bg-primary/90 backdrop-blur-sm text-xs z-10"
          >
            Options Available ( size /color )
          </Badge>
        )}

        {/* Wishlist Button */}
        <button
          className={`absolute top-2 right-2 p-2 rounded-full backdrop-blur-sm transition-colors z-20 ${isWishlisted
            ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
            : 'bg-background/60 text-muted-foreground hover:bg-background/80 hover:text-primary'
            }`}
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Rating */}
        <div className="absolute top-2 right-12 hidden sm:flex items-center gap-1 bg-background/90 backdrop-blur-sm rounded-full px-2 py-1 z-10">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className="h-3 w-3 fill-yellow-400 text-yellow-400"
            />
          ))}
          <span className="text-xs text-muted-foreground ml-1">(4.8)</span>
        </div>
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <div className="mb-3">
          <h3 className="text-lg sm:text-xl font-semibold group-hover:text-primary transition-colors line-clamp-2">
            {product.name}
          </h3>
        </div>

        {product.description && (
          <p className="text-muted-foreground mb-4 text-sm line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Price and Actions */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col">
            <span className="text-xl sm:text-2xl font-bold text-gradient">
              {formatPrice(product.price)}
            </span>
            {product.unit && (
              <span className="text-xs text-muted-foreground">
                {t('shop.perUnit', { unit: product.unit })}
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
            {onViewDetails && !hasOptions && (
              <GlassButton
                variant="outline"
                size="sm"
                onClick={onViewDetails}
                className="whitespace-nowrap min-h-[44px] sm:min-h-auto"
              >
                <Eye className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">
                  {viewMode === 'list' ? t('shop.productCard.viewDetailsLong') : t('shop.productCard.viewShort')}
                </span>
                <span className="sm:hidden">{t('shop.productCard.viewShort')}</span>
              </GlassButton>
            )}
            <GlassButton
              variant="default"
              size="sm"
              onClick={handleAddToCart}
              className="whitespace-nowrap min-h-[44px] sm:min-h-auto"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">
                {hasOptions
                  ? (viewMode === 'list' ? t('shop.productCard.viewDetailsLong') : t('shop.productCard.viewShort'))
                  : (viewMode === 'list' ? t('shop.productCard.addToCartLong') : t('shop.productCard.addShort'))
                }
              </span>
              <span className="sm:hidden">
                {hasOptions ? t('shop.productCard.viewShort') : t('shop.productCard.addShort')}
              </span>
            </GlassButton>
          </div>
        </div>

        {/* Rating for mobile - shown below actions */}
        <div className="flex sm:hidden items-center gap-1 mt-3 text-xs text-muted-foreground">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className="h-3 w-3 fill-yellow-400 text-yellow-400"
            />
          ))}
          <span className="ml-1">(4.8)</span>
        </div>

        {/* Additional Info for List View */}
        {viewMode === 'list' && (
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-4 text-xs text-muted-foreground">
            <span>✓ {t('shop.productCard.info.fastDelivery')}</span>
            <span>✓ {t('shop.productCard.info.warrantyIncluded')}</span>
            <span className="hidden sm:inline">✓ {t('shop.productCard.info.professionalInstallation')}</span>
          </div>
        )}
      </div>
    </GlassCard>
  );
};