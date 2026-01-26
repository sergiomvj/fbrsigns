import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    ArrowRight,
    Star,
    Shield,
    Clock,
    Eye,
    Palette,
    Wrench,
    Sparkles
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { PageLayout } from "@/components/layout/PageLayout";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { AIProjectAssistant } from "@/components/forms/AIProjectAssistant";

import heroImage from "@/assets/signage-business-hero.jpg";
import heroMainBg from "@/assets/hero-main-bg.jpg";
import galleryStorefront from "@/assets/gallery-storefront-sign.jpg";
import galleryDigitalLED from "@/assets/gallery-digital-led.jpg";
import galleryVehicleWrap from "@/assets/gallery-vehicle-wrap.jpg";
import galleryTradeShow from "@/assets/gallery-trade-show.jpg";
import galleryIlluminated from "@/assets/gallery-illuminated-sign.jpg";
import heroBg1 from "@/assets/hero-bg-1.jpg";
import heroBg2 from "@/assets/hero-bg-2.jpg";
import heroBg3 from "@/assets/hero-bg-3.jpg";
import heroBg4 from "@/assets/hero-bg-4.jpg";
import heroBg5 from "@/assets/hero-bg-5.jpg";


const heroBgImages = [
    heroBg1,
    heroBg2,
    heroBg3,
    heroBg4,
    heroBg5
];

export default function About() {
    const [currentBgIndex, setCurrentBgIndex] = useState(0);
    const [showAIAssistant, setShowAIAssistant] = useState(false);
    const { t } = useTranslation();

    // Dynamic data with translations
    const stats = [
        { label: t('content:stats.experience.label'), value: t('content:stats.experience.value') },
        { label: t('content:stats.clients.label'), value: t('content:stats.clients.value') },
        { label: t('content:stats.projects.label'), value: t('content:stats.projects.value') },
        { label: t('content:stats.success.label'), value: t('content:stats.success.value') }
    ];

    const features = [
        {
            icon: Shield,
            title: t('content:features.premiumMaterials.title'),
            description: t('content:features.premiumMaterials.description')
        },
        {
            icon: Clock,
            title: t('content:features.fastTurnaround.title'),
            description: t('content:features.fastTurnaround.description')
        },
        {
            icon: Palette,
            title: t('content:features.customDesign.title'),
            description: t('content:features.customDesign.description')
        },
        {
            icon: Wrench,
            title: t('content:features.installation.title'),
            description: t('content:features.installation.description')
        }
    ];

    const featuredProducts = [
        {
            id: "custom-signs",
            name: t('content:products.customSigns.name'),
            description: t('content:products.customSigns.description'),
            price: t('content:products.customSigns.price'),
            image: galleryStorefront
        },
        {
            id: "digital-led",
            name: t('content:products.digitalLED.name'),
            description: t('content:products.digitalLED.description'),
            price: t('content:products.digitalLED.price'),
            image: galleryDigitalLED
        },
        {
            id: "vehicle-wraps",
            name: t('content:products.vehicleWraps.name'),
            description: t('content:products.vehicleWraps.description'),
            price: t('content:products.vehicleWraps.price'),
            image: galleryVehicleWrap
        },
        {
            id: "trade-show",
            name: t('content:products.tradeShow.name'),
            description: t('content:products.tradeShow.description'),
            price: t('content:products.tradeShow.price'),
            image: galleryTradeShow
        }
    ];

    const testimonials = [
        {
            name: t('content:testimonials.client1.name'),
            company: t('content:testimonials.client1.company'),
            text: t('content:testimonials.client1.quote'),
            rating: 5
        },
        {
            name: t('content:testimonials.client2.name'),
            company: t('content:testimonials.client2.company'),
            text: t('content:testimonials.client2.quote'),
            rating: 5
        },
        {
            name: t('content:testimonials.client3.name'),
            company: t('content:testimonials.client3.company'),
            text: t('content:testimonials.client3.quote'),
            rating: 5
        }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentBgIndex((prevIndex) => (prevIndex + 1) % heroBgImages.length);
        }, 4000); // Change every 4 seconds

        return () => clearInterval(interval);
    }, []);
    return (
        <PageLayout>
            {/* Hero Section */}
            <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
                {/* Hero Background Image */}
                <div className="absolute inset-0 z-0">
                    <img
                        src={heroMainBg}
                        alt="Professional signage background"
                        className="w-full h-full object-cover object-center"
                    />

                    {/* Black Overlay with 70% opacity */}
                    <div className="absolute inset-0 bg-black/70" />

                    {/* Floating Particles Effect */}
                    <div className="absolute inset-0">
                        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary/40 rounded-full particle-animate"
                            style={{ animationDelay: '0s' }} />
                        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-secondary/60 rounded-full particle-animate"
                            style={{ animationDelay: '1s' }} />
                        <div className="absolute top-1/2 left-3/4 w-1.5 h-1.5 bg-accent/50 rounded-full particle-animate"
                            style={{ animationDelay: '2s' }} />
                        <div className="absolute top-1/6 right-1/3 w-1 h-1 bg-primary/30 rounded-full particle-animate"
                            style={{ animationDelay: '3s' }} />
                        <div className="absolute bottom-1/4 left-1/6 w-1.5 h-1.5 bg-secondary/40 rounded-full particle-animate"
                            style={{ animationDelay: '4s' }} />
                        <div className="absolute top-3/4 left-2/3 w-1 h-1 bg-accent/60 rounded-full particle-animate"
                            style={{ animationDelay: '5s' }} />
                    </div>
                </div>

                <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center justify-center">
                    <div className="animate-fade-in">
                        <h1 className="text-5xl lg:text-7xl xl:text-8xl font-bold leading-tight mb-6">
                            {t('content:hero.title')}<br />
                            <span className="text-gradient">{t('content:hero.subtitle')}</span>
                        </h1>
                        <p className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-3xl mx-auto">
                            {t('content:hero.description')}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 mb-12 justify-center">
                            <GlassButton variant="hero" size="xl" onClick={() => setShowAIAssistant(true)}>
                                <Sparkles className="h-5 w-5 mr-2" />
                                {t('content:hero.cta')}
                                <ArrowRight className="h-5 w-5 ml-2" />
                            </GlassButton>
                            <GlassButton variant="outline" size="xl" asChild>
                                <Link to="/products">{t('navigation:menu.products')}</Link>
                            </GlassButton>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-2xl mx-auto">
                            {stats.map((stat, index) => (
                                <div key={stat.label} className="text-center">
                                    <div className="text-2xl lg:text-3xl font-bold text-gradient mb-1">
                                        {stat.value}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-1/4 left-8 w-16 h-16 bg-gradient-primary rounded-full opacity-10 animate-glow" />
                <div className="absolute bottom-1/4 right-8 w-20 h-20 bg-gradient-secondary rounded-full opacity-15 animate-glow" />
            </section>

            {/* Features Section */}
            <section className="py-20 lg:py-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-5xl font-bold mb-6">
                            {t('content:features.title')}
                        </h2>
                        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                            {t('content:features.subtitle')}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <GlassCard key={feature.title} variant="interactive" className="text-center group">
                                    <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow group-hover:shadow-glow-secondary transition-all duration-300">
                                        <Icon className="h-8 w-8 text-white" />
                                    </div>
                                    <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                                    <p className="text-muted-foreground">{feature.description}</p>
                                </GlassCard>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            <section className="py-20 lg:py-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-5xl font-bold mb-6">
                            {t('content:products.title')}
                        </h2>
                        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                            {t('content:products.subtitle')}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {featuredProducts.map((product, index) => (
                            <GlassCard key={product.name} variant="interactive" className="group overflow-hidden">
                                <div className="aspect-square mb-6 rounded-lg overflow-hidden bg-muted">
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                </div>
                                <h3 className="text-xl font-semibold mb-3">{product.name}</h3>
                                <p className="text-muted-foreground mb-4 text-sm">{product.description}</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-lg font-semibold text-gradient">{product.price}</span>
                                    <GlassButton variant="outline" size="sm" asChild>
                                        <Link to={`/products/${product.id}`}>
                                            <Eye className="h-4 w-4 mr-2" />
                                            {t('content:products.viewDetails')}
                                        </Link>
                                    </GlassButton>
                                </div>
                            </GlassCard>
                        ))}
                    </div>

                    <div className="text-center mt-12">
                        <GlassButton variant="hero" size="lg" asChild>
                            <Link to="/products">
                                {t('content:products.viewAllProducts')}
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </GlassButton>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-20 lg:py-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-5xl font-bold mb-6">
                            {t('content:testimonials.title')}
                        </h2>
                        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                            {t('content:about.whyChooseUs')}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <GlassCard key={testimonial.name} className="relative">
                                <div className="flex items-center mb-4">
                                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                                        <Star key={i} className="h-5 w-5 text-warning fill-warning" />
                                    ))}
                                </div>
                                <p className="text-muted-foreground mb-6 italic">"{testimonial.text}"</p>
                                <div>
                                    <p className="font-semibold">{testimonial.name}</p>
                                    <p className="text-sm text-muted-foreground">{testimonial.company}</p>
                                </div>
                            </GlassCard>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 lg:py-32">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <GlassCard variant="hero">
                        <h2 className="text-3xl lg:text-5xl font-bold mb-6">
                            {t('content:cta.title')}
                        </h2>
                        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                            {t('content:cta.subtitle')}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <GlassButton variant="hero" size="xl" asChild>
                                <Link to="/contact">
                                    {t('content:cta.button')}
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </GlassButton>
                            <GlassButton variant="outline" size="xl" asChild>
                                <Link to="/portfolio">{t('common:buttons.viewAll')}</Link>
                            </GlassButton>
                        </div>
                    </GlassCard>
                </div>
            </section>

            {/* Floating Start Project button */}
            <GlassButton
                variant="hero"
                size="xl"
                onClick={() => setShowAIAssistant(true)}
                className="hidden md:inline-flex fixed bottom-6 right-6 z-[100]"
                aria-label="Start your project"
            >
                <Sparkles className="h-5 w-5 mr-2" />
                {t('content:hero.cta')}
            </GlassButton>

            {/* AI Project Assistant Dialog */}
            <AIProjectAssistant
                open={showAIAssistant}
                onOpenChange={setShowAIAssistant}
            />
        </PageLayout>
    );
}
