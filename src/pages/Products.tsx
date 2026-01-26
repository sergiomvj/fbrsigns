import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Grid, List, Loader2 } from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";
import { ProductCard } from "@/components/ecommerce/ProductCard";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { useTranslation } from "react-i18next";
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
  specifications?: any; // Changed from Record<string, any> to any for compatibility
  material?: string;
  dimensions?: string;
  warranty_info?: string;
  installation_info?: string;
  lead_time_days?: number;
  min_quantity?: number;
  max_quantity?: number;
  categories?: {
    name: string;
    has_sizes?: boolean;
    has_colors?: boolean;
  };
}

interface ProductsProps {
  onProductSelect?: (product: Product) => void;
  useLayout?: boolean;
}

export default function Products({ onProductSelect, useLayout = true }: ProductsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Products");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { addItem } = useCart();
  const { t } = useTranslation('content');

  const slugify = (s: string) => s?.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || '';
  const getCategoryLabel = (name: string) => {
    if (name === 'All Products') return t('shop.allProducts');
    return t(`shop.categories.${slugify(name)}`, { defaultValue: name });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      unit: product.unit
    });
  };

  // Fetch categories from Supabase
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      return [{ id: 'all', name: 'All Products' }, ...data];
    }
  });

  // Fetch products from Supabase
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            name,
            has_sizes,
            has_colors
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const isLoading = categoriesLoading || productsLoading;

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All Products" ||
      product.categories?.name === selectedCategory ||
      product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const content = (
    <section className="py-16 sm:py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search Hero */}
        <div className="relative max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-muted-foreground" />
            <Input
              placeholder={t('shop.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-14 text-lg glass-input rounded-full shadow-lg"
            />
          </div>
        </div>

        {/* Filters */}
        <GlassCard className="mb-8 sm:mb-12">
          <div className="flex flex-col lg:flex-row gap-6">


            {/* Category Filter - Mobile Dropdown */}
            <div className="block sm:hidden">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('shop.selectCategory')} />
                </SelectTrigger>
                <SelectContent className="z-50 bg-background/95 backdrop-blur-xl border border-border shadow-glass">
                  {categories.map((category: any) => (
                    <SelectItem key={category.id || category.name} value={category.name}>
                      {getCategoryLabel(category.name)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category Filter - Desktop Buttons */}
            <div className="hidden sm:flex flex-wrap gap-2">
              {categories.map((category: any) => (
                <GlassButton
                  key={category.id || category.name}
                  variant={selectedCategory === category.name ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.name)}
                  disabled={isLoading}
                >
                  {getCategoryLabel(category.name)}
                </GlassButton>
              ))}
            </div>

            {/* View Mode */}
            <div className="flex gap-2">
              <GlassButton
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
                aria-label={t('shop.gridView')}
              >
                <Grid className="h-4 w-4" />
              </GlassButton>
              <GlassButton
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("list")}
                aria-label={t('shop.listView')}
              >
                <List className="h-4 w-4" />
              </GlassButton>
            </div>
          </div>
        </GlassCard>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-lg text-muted-foreground">{t('shop.loading')}</span>
          </div>
        )}

        {/* Products Grid */}
        {!isLoading && (
          <div
            className={`grid gap-4 sm:gap-6 ${viewMode === "grid"
              ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
              : "grid-cols-1"
              }`}
          >
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                viewMode={viewMode}
                onViewDetails={onProductSelect ? () => onProductSelect(product) : undefined}
              />
            ))}
          </div>
        )}

        {!isLoading && filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-xl text-muted-foreground">
              {t('shop.noResults')}
            </p>
          </div>
        )}
      </div>
    </section>
  );

  return useLayout ? <PageLayout>{content}</PageLayout> : content;
}