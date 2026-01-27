import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { GlassCard } from '@/components/ui/glass-card';
import { useTranslation } from "react-i18next";

const ReturnRefundPolicy = () => {
    const { t } = useTranslation('content');

    const sections = t('returnRefundPolicy.sections', { returnObjects: true }) as Array<{ title: string; content: string }>;

    return (
        <PageLayout>
            <div className="min-h-screen pt-24 pb-16">
                <div className="max-w-4xl mx-auto px-4">
                    <GlassCard className="p-8">
                        <h1 className="text-4xl font-bold mb-4 text-center">{t('returnRefundPolicy.title')}</h1>
                        <p className="text-center text-muted-foreground mb-8">{t('returnRefundPolicy.lastUpdated')}</p>

                        <div className="prose prose-lg max-w-none space-y-8">
                            <section>
                                <p className="text-muted-foreground leading-relaxed">
                                    {t('returnRefundPolicy.intro')}
                                </p>
                            </section>

                            {Array.isArray(sections) && sections.map((section, index) => (
                                <section key={index}>
                                    <h2 className="text-2xl font-semibold mb-4 text-foreground">{section.title}</h2>
                                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                                        {section.content}
                                    </p>
                                </section>
                            ))}
                        </div>
                    </GlassCard>
                </div>
            </div>
        </PageLayout>
    );
};

export default ReturnRefundPolicy;
