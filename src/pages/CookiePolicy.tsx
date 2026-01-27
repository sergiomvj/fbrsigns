import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { GlassCard } from '@/components/ui/glass-card';
import { useTranslation } from "react-i18next";

const CookiePolicy = () => {
    const { t } = useTranslation('content');

    return (
        <PageLayout>
            <div className="min-h-screen pt-24 pb-16">
                <div className="max-w-4xl mx-auto px-4">
                    <GlassCard className="p-8">
                        <h1 className="text-4xl font-bold mb-8 text-center">{t('cookiePolicy.title')}</h1>

                        <div className="prose prose-lg max-w-none space-y-6">
                            <p className="text-muted-foreground leading-relaxed">
                                {t('cookiePolicy.content')}
                            </p>
                        </div>
                    </GlassCard>
                </div>
            </div>
        </PageLayout>
    );
};

export default CookiePolicy;
