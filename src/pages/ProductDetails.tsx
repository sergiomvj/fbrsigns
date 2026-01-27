import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, CheckCircle, Shield, Clock, Wrench } from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { supabase } from "@/integrations/supabase/client";

// Import images for fallback/featured items
import galleryStorefront from "@/assets/gallery-storefront-sign.jpg";
import galleryDigitalLED from "@/assets/gallery-digital-led.jpg";
import galleryVehicleWrap from "@/assets/gallery-vehicle-wrap.jpg";
import galleryTradeShow from "@/assets/gallery-trade-show.jpg";

export default function ProductDetails() {
    const { id } = useParams();
    const { t } = useTranslation();
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Hardcoded data for featured products to ensure they always work
    const featuredMap: Record<string, any> = {
        "custom-signs": {
            name: t('content:products.customSigns.name'),
            description: t('content:products.customSigns.description'),
            price: t('content:products.customSigns.price'),
            image: galleryStorefront,
            details: t('content:products.customSigns.details')
        },
        "digital-led": {
            name: t('content:products.digitalLED.name'),
            description: t('content:products.digitalLED.description'),
            price: t('content:products.digitalLED.price'),
            image: galleryDigitalLED,
            details: t('content:products.digitalLED.details')
        },
        "vehicle-wraps": {
            name: t('content:products.vehicleWraps.name'),
            description: t('content:products.vehicleWraps.description'),
            price: t('content:products.vehicleWraps.price'),
            image: galleryVehicleWrap,
            details: t('content:products.vehicleWraps.details')
        },
        "trade-show": {
            name: t('content:products.tradeShow.name'),
            description: t('content:products.tradeShow.description'),
            price: t('content:products.tradeShow.price'),
            image: galleryTradeShow,
            details: t('content:products.tradeShow.details')
        }
    };

    useEffect(() => {
        async function fetchProduct() {
            setLoading(true);

            // 1. Check if it's a featured hardcoded product
            if (id && featuredMap[id]) {
                setProduct(featuredMap[id]);
                setLoading(false);
                return;
            }

            // 2. Otherwise try to fetch from Supabase
            try {
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (data) {
                    setProduct(data);
                } else {
                    // If not found in DB, we might want to show not found or just null
                    console.log("Product not found in DB");
                }
            } catch (error) {
                console.error("Error fetching product:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchProduct();
    }, [id, t]);

    if (loading) {
        return (
            <PageLayout>
                <div className="min-h-[60vh] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
            </PageLayout>
        );
    }

    if (!product) {
        return (
            <PageLayout>
                <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
                    <h2 className="text-3xl font-bold mb-4">{t('content:shop.productDetails.notFound.title')}</h2>
                    <p className="text-muted-foreground mb-8">{t('content:shop.productDetails.notFound.description')}</p>
                    <GlassButton asChild>
                        <Link to="/products">{t('content:shop.productDetails.notFound.backButton')}</Link>
                    </GlassButton>
                </div>
            </PageLayout>
        );
    }

    return (
        <PageLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
                <div className="mb-8">
                    <Link to="/products" className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        {t('content:shop.productDetails.backToProducts')}
                    </Link>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 items-start">
                    {/* Image Section */}
                    <div className="relative rounded-2xl overflow-hidden glass-card aspect-video lg:aspect-square">
                        <img
                            src={product.image || product.image_url || "/placeholder.svg"}
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Content Section */}
                    <div>
                        <h1 className="text-4xl lg:text-5xl font-bold mb-4">{product.name}</h1>
                        <p className="text-2xl text-gradient font-bold mb-6">{product.price}</p>

                        <GlassCard className="mb-8">
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                {product.detailed_description || product.details || product.description}
                            </p>
                        </GlassCard>

                        <div className="grid sm:grid-cols-2 gap-4 mb-8">
                            <div className="flex items-center gap-3 text-muted-foreground">
                                <CheckCircle className="h-5 w-5 text-primary" />
                                <span>{t('content:shop.productDetails.features.premiumQuality')}</span>
                            </div>
                            <div className="flex items-center gap-3 text-muted-foreground">
                                <Shield className="h-5 w-5 text-primary" />
                                <span>{t('content:shop.productDetails.features.warrantyIncluded')}</span>
                            </div>
                            <div className="flex items-center gap-3 text-muted-foreground">
                                <Clock className="h-5 w-5 text-primary" />
                                <span>{t('content:shop.productDetails.features.fastTurnaround')}</span>
                            </div>
                            <div className="flex items-center gap-3 text-muted-foreground">
                                <Wrench className="h-5 w-5 text-primary" />
                                <span>{t('content:shop.productDetails.features.professionalInstall')}</span>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <GlassButton size="xl" onClick={() => window.location.href = '/contact'}>
                                {t('content:shop.productDetails.actions.getQuote')}
                            </GlassButton>
                            <GlassButton size="xl" variant="outline" onClick={() => window.location.href = '/contact'} >
                                {t('content:shop.productDetails.actions.contactUs')}
                            </GlassButton>
                        </div>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
}
