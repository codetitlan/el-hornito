'use client';

import React, { useState, useEffect } from 'react';
import { Key, Settings, AlertTriangle, ExternalLink, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { hasPersonalApiKey } from '@/lib/api';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';

interface ApiKeyRequiredBannerProps {
  className?: string;
}

export function ApiKeyRequiredBanner({ className }: ApiKeyRequiredBannerProps) {
  const [hasApiKey, setHasApiKey] = useState(true); // Start with true to avoid flash
  const [isDismissed, setIsDismissed] = useState(false);
  const t = useTranslations('errors.apiKeyBanner');
  const router = useRouter();

  useEffect(() => {
    // Check if user has configured a personal API key
    const hasKey = hasPersonalApiKey();
    setHasApiKey(hasKey);

    // Check if user dismissed this banner for this session
    const dismissed = sessionStorage.getItem('api-key-banner-dismissed');
    setIsDismissed(!!dismissed);
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('api-key-banner-dismissed', 'true');
  };

  // Don't show if user has API key or has dismissed
  if (hasApiKey || isDismissed) {
    return null;
  }

  return (
    <div
      className={`relative bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4 ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
          <Key className="w-4 h-4 text-amber-600" />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <h3 className="font-medium text-amber-900">{t('title')}</h3>
          </div>

          <p className="text-sm text-amber-700 mb-3">{t('description')}</p>

          <div className="flex flex-col sm:flex-row gap-2 mb-3">
            <Button
              size="sm"
              onClick={() => router.push('/settings')}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              <Settings size={14} className="mr-1" />
              {t('configureButton')}
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                window.open('https://console.anthropic.com/', '_blank')
              }
              className="border-amber-300 text-amber-700 hover:bg-amber-50"
            >
              <ExternalLink size={14} className="mr-1" />
              {t('getKeyButton')}
            </Button>
          </div>

          <p className="text-xs text-amber-600">{t('helpText')}</p>
        </div>

        <button
          onClick={handleDismiss}
          className="flex-shrink-0 p-1 text-amber-400 hover:text-amber-600 transition-colors"
          title={t('dismiss')}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
