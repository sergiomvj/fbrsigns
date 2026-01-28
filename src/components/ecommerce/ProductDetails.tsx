import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, ShoppingCart, Star, Info, Truck, Shield, Award, Heart } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { PageLayout } from '@/components/layout/PageLayout';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from 'react-i18next';
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  description?: string;
  detailed_description?: string;
  price: number;
  image_url?: string;
  additional_images?: string[];
  category?: string;
  unit?: string;
  specifications?: Record<string, any>;
  material?: string;
  dimensions?: string;
  warranty_info?: string;
  installation_info?: string;
  lead_time_days?: number;
  min_quantity?: number;
  max_quantity?: number;
}

interface ProductDetailsProps {
  product: Product;
  onBack: () => void;
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({ product, onBack }) => {
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { t, i18n } = useTranslation('content');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  console.log('ProductDetails debug:', {
    id: product.id,
    name: product.name,
    additional_images: product.additional_images,
    type: typeof product.additional_images,
    isArray: Array.isArray(product.additional_images)
  });

  const isWishlisted = isInWishlist(product.id);
  const [quantity, setQuantity] = useState(product.min_quantity || 1);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [variants, setVariants] = useState<any[]>([]);
  const [selectedColor, setSelectedColor] = useState<string>("");

  useEffect(() => {
    if (product?.id) {
      const fetchVariants = async () => {
        const { data, error } = await supabase
          .from('product_variants')
          .select('*')
          .eq('product_id', product.id);

        if (data) {
          setVariants(data);
        }
      };
      fetchVariants();
    }
  }, [product]);

  const availableSizes = Array.from(new Set(variants.filter(v => v.size).map(v => v.size)));
  const availableColors = Array.from(new Set(variants.filter(v => v.color).map(v => v.color)));

  const selectedVariant = variants.find(v =>
    (!v.size || v.size === selectedSize) &&
    (!v.color || v.color === selectedColor)
  );

  // Logic to find variant for image display:
  // 1. If exact match (Size + Color), use it.
  // 2. If only color is selected, find *any* variant with that color to show the image.
  const imageVariant = useMemo(() => {
    if (selectedVariant) return selectedVariant;
    if (selectedColor) {
      return variants.find(v => v.color === selectedColor && v.image_url);
    }
    return null;
  }, [selectedVariant, selectedColor, variants]);

  const currentPrice = selectedVariant
    ? Number(product.price) + Number(selectedVariant.additional_price || 0)
    : Number(product.price);

  const formatPrice = (price: number) => {
    const locale = i18n.language === 'pt' ? 'pt-BR' : i18n.language === 'es' ? 'es-ES' : 'en-US';
    return new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD' }).format(price);
  };

  const isWearCategory = product.category?.toLowerCase().includes("wear") || product.category?.toLowerCase().includes("signature") || variants.some(v => v.size);

  const allImages = useMemo(() => {
    const images: string[] = [];

    // Prioritize image from the resolved "image variant" (can be exact match or just color match)
    if (imageVariant?.image_url) {
      images.push(imageVariant.image_url);
    }

    if (product.image_url) {
      images.push(product.image_url);
    }

    if (product.additional_images) {
      images.push(...product.additional_images);
    }

    const unique = Array.from(new Set(images.filter(Boolean)));
    return unique.length > 0 ? unique : ["/placeholder.svg"];
  }, [product, imageVariant]);

  useEffect(() => {
    // Reset to first image (variant image) when variant changes and has specific image
    if (imageVariant?.image_url) {
      setSelectedImageIndex(0);
    }
  }, [imageVariant]);

  const handleAddToCart = () => {
    if (isWearCategory && !selectedSize) {
      toast({
        title: t('shop.productDetails.selectSize') || "Please select a size",
        description: t('shop.productDetails.sizeRequired') || "You must select a size to continue.",
        variant: "destructive",
      });
      return;
    }

    const itemToAdd = {
      id: isWearCategory ? `${product.id}-${selectedSize}` : product.id,
      name: isWearCategory ? `${product.name} (${selectedSize})` : product.name,
      price: product.price,
      image_url: selectedVariant?.image_url || product.image_url,
      unit: product.unit,
      size: isWearCategory ? selectedSize : undefined
    };

    for (let i = 0; i < quantity; i++) {
      addItem(itemToAdd);
    }
  };

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-6 hover:bg-muted/50"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('shop.productDetails.backToProducts')}
        </Button>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <GlassCard className="aspect-square overflow-hidden">
              <img
                src={allImages[selectedImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder.svg";
                }}
              />
            </GlassCard>

            {allImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {allImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${index === selectedImageIndex
                      ? 'border-primary shadow-glow'
                      : 'border-border/50 hover:border-primary/50'
                      }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.svg";
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {product.category && (
                  <Badge variant="secondary">{product.category}</Badge>
                )}
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="h-4 w-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                  <span className="text-sm text-muted-foreground ml-2">(4.8)</span>
                </div>
              </div>

              <h1 className="text-3xl lg:text-4xl font-bold mb-4">{product.name}</h1>

              <p className="text-lg text-muted-foreground mb-6">
                {product.description || product.detailed_description}
              </p>

              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl font-bold text-gradient">
                  {formatPrice(product.price)}
                </span>
                {product.unit && (
                  <span className="text-lg text-muted-foreground">
                    /{product.unit}
                  </span>
                )}
              </div>
            </div>

            {/* Size Selector for Wear Category or if variants exist */}
            {(isWearCategory || availableSizes.length > 0) && (
              <GlassCard className="p-4">
                <label className="text-sm font-medium mb-2 block">{t('shop.productDetails.size', { defaultValue: 'Size' })}:</label>
                <Select value={selectedSize} onValueChange={setSelectedSize}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t('shop.productDetails.selectSize') || "Select a size"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSizes.length > 0 ? (
                      availableSizes.map((size) => (
                        <SelectItem key={size} value={size}>
                          {size}
                        </SelectItem>
                      ))
                    ) : (
                      ["S", "M", "L", "XL", "2XL", "3XL"].map((size) => (
                        <SelectItem key={size} value={size}>
                          {size}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </GlassCard>
            )}

            {/* Color Selector */}
            {availableColors.length > 0 && (
              <GlassCard className="p-4">
                <label className="text-sm font-medium mb-2 block">Color:</label>
                <Select value={selectedColor} onValueChange={setSelectedColor}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a color" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableColors.map((color) => (
                      <SelectItem key={color} value={color}>
                        {color}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </GlassCard>
            )}

            {/* Quantity Selector */}
            <GlassCard className="p-4">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-medium">{t('shop.productDetails.quantity')}:</label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max((product.min_quantity || 1), quantity - 1))}
                    disabled={quantity <= (product.min_quantity || 1)}
                  >
                    -
                  </Button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(product.max_quantity ? Math.min(product.max_quantity, quantity + 1) : quantity + 1)}
                    disabled={product.max_quantity ? quantity >= product.max_quantity : false}
                  >
                    +
                  </Button>
                </div>
              </div>

              {(product.min_quantity || product.max_quantity) && (
                <p className="text-xs text-muted-foreground">
                  {product.min_quantity && `${t('shop.productDetails.min')}: ${product.min_quantity}`}
                  {product.min_quantity && product.max_quantity && ' • '}
                  {product.max_quantity && `${t('shop.productDetails.max')}: ${product.max_quantity}`}
                </p>
              )}
            </GlassCard>

            {/* Add to Cart and Wishlist */}
            <div className="flex gap-4">
              <GlassButton
                className="flex-1"
                size="lg"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {t('shop.productDetails.addToCart')}
              </GlassButton>

              <GlassButton
                variant="outline"
                size="lg"
                className={`w-16 ${isWishlisted ? 'text-red-500 border-red-500/50 hover:bg-red-500/10' : ''}`}
                onClick={() => toggleWishlist(product.id)}
              >
                <Heart className={`h-6 w-6 ${isWishlisted ? 'fill-current' : ''}`} />
              </GlassButton>
            </div>

            {/* Product Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Truck className="h-4 w-4 text-primary" />
                <span>{t('shop.productDetails.deliveryIn', { days: product.lead_time_days || 7 })}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-primary" />
                <span>{t('shop.productDetails.warrantyIncluded')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Award className="h-4 w-4 text-primary" />
                <span>{t('shop.productDetails.premiumQuality')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Tabs */}
        <div className="mt-12">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="description">{t('shop.productDetails.tabs.description')}</TabsTrigger>
              <TabsTrigger value="specifications">{t('shop.productDetails.tabs.specifications')}</TabsTrigger>
              <TabsTrigger value="installation">{t('shop.productDetails.tabs.installation')}</TabsTrigger>
              <TabsTrigger value="warranty">{t('shop.productDetails.tabs.warranty')}</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-6">
              <GlassCard className="p-6">
                <div className="prose prose-invert max-w-none">
                  <p className="text-muted-foreground leading-relaxed">
                    {product.detailed_description || product.description ||
                      t('shop.productDetails.noDescription')}
                  </p>

                  {isWearCategory && (
                    <div className="mt-8 pt-8 border-t border-white/10">
                      <h3 className="text-lg font-semibold mb-4">Size Chart – Next Level 6210 (Unisex)</h3>
                      <p className="text-sm text-muted-foreground mb-4">Measurements in inches</p>
                      <div className="rounded-md border border-white/10 overflow-hidden max-w-lg">
                        <Table>
                          <TableHeader className="bg-white/5">
                            <TableRow className="border-white/10 hover:bg-white/5">
                              <TableHead className="text-white">Size</TableHead>
                              <TableHead className="text-white">Chest Width (in)</TableHead>
                              <TableHead className="text-white">Body Length (in)</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {[
                              { size: "S", chest: "18", length: "28" },
                              { size: "M", chest: "20", length: "29" },
                              { size: "L", chest: "22", length: "30" },
                              { size: "XL", chest: "24", length: "31" },
                              { size: "2XL", chest: "26", length: "32" },
                              { size: "3XL", chest: "28", length: "33" },
                            ].map((row) => (
                              <TableRow key={row.size} className="border-white/10 hover:bg-white/5">
                                <TableCell className="font-medium">{row.size}</TableCell>
                                <TableCell>{row.chest}</TableCell>
                                <TableCell>{row.length}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}
                </div>
              </GlassCard>
            </TabsContent>

            <TabsContent value="specifications" className="mt-6">
              <GlassCard className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {product.material && (
                    <div>
                      <h4 className="font-semibold mb-2">{t('shop.productDetails.material')}</h4>
                      <p className="text-muted-foreground">{product.material}</p>
                    </div>
                  )}

                  {product.dimensions && (
                    <div>
                      <h4 className="font-semibold mb-2">{t('shop.productDetails.dimensions')}</h4>
                      <p className="text-muted-foreground">{product.dimensions}</p>
                    </div>
                  )}

                  {product.specifications && Object.keys(product.specifications).length > 0 && (
                    <div className="md:col-span-2">
                      <h4 className="font-semibold mb-4">{t('shop.productDetails.technicalSpecs')}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {Object.entries(product.specifications).map(([key, value]) => (
                          <div key={key} className="flex justify-between py-2 border-b border-border/30">
                            <span className="capitalize">{key.replace('_', ' ')}</span>
                            <span className="text-muted-foreground">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </GlassCard>
            </TabsContent>

            <TabsContent value="installation" className="mt-6">
              <GlassCard className="p-6">
                <div className="prose prose-invert max-w-none">
                  <p className="text-muted-foreground leading-relaxed">
                    {product.installation_info ||
                      t('shop.productDetails.defaultInstallationInfo')}
                  </p>
                </div>
              </GlassCard>
            </TabsContent>

            <TabsContent value="warranty" className="mt-6">
              <GlassCard className="p-6">
                <div className="prose prose-invert max-w-none">
                  <p className="text-muted-foreground leading-relaxed">
                    {product.warranty_info ||
                      t('shop.productDetails.defaultWarrantyInfo')}
                  </p>
                </div>
              </GlassCard>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PageLayout>
  );
};