'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Settings, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SettingsManager } from '@/lib/settings';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';

interface OnboardingBannerProps {
  className?: string;
}

export function OnboardingBanner({ className }: OnboardingBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const t = useTranslations('common');
  const router = useRouter();

  useEffect(() => {
    const settingsManager = SettingsManager.getInstance();
    const newUser = settingsManager.isNewUser();
    const configured = settingsManager.hasConfiguredPreferences();

    setIsNewUser(newUser);

    // Show banner if user is new or hasn't configured preferences
    setIsVisible(newUser || !configured);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    // Remember dismissal for this session
    sessionStorage.setItem('onboarding-dismissed', 'true');
  };

  const handleApplySmartDefaults = () => {
    const settingsManager = SettingsManager.getInstance();
    const currentSettings = settingsManager.loadSettings();
    const smartDefaults = settingsManager.getSmartDefaults();

    // Merge smart defaults with current settings
    const updatedSettings = {
      ...currentSettings,
      cookingPreferences: {
        ...currentSettings.cookingPreferences,
        ...smartDefaults.cookingPreferences,
      },
      kitchenEquipment: {
        ...currentSettings.kitchenEquipment,
        ...smartDefaults.kitchenEquipment,
      },
    };

    settingsManager.saveSettings(updatedSettings);
    setIsVisible(false);

    // Refresh page to show updated settings
    window.location.reload();
  };

  if (!isVisible || sessionStorage.getItem('onboarding-dismissed')) {
    return null;
  }

  return (
    <div
      className={`relative bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4 ${className}`}
    >
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 p-1 text-purple-400 hover:text-purple-600 transition-colors"
        title={t('actions.dismiss')}
      >
        <X size={16} />
      </button>

      <div className="flex items-start gap-3 pr-6">
        <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-purple-600" />
        </div>

        <div className="flex-1">
          <h3 className="font-medium text-purple-900 mb-1">
            {isNewUser
              ? t('onboarding.welcomeTitle')
              : t('onboarding.enhanceTitle')}
          </h3>

          <p className="text-sm text-purple-700 mb-3">
            {isNewUser
              ? t('onboarding.welcomeDescription')
              : t('onboarding.enhanceDescription')}
          </p>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleApplySmartDefaults}
              className="border-purple-300 text-purple-700 hover:bg-purple-50"
            >
              <Sparkles size={14} className="mr-1" />
              {t('actions.useSmartDefaults')}
            </Button>

            <Button
              size="sm"
              onClick={() => router.push('/settings')}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Settings size={14} className="mr-1" />
              {t('actions.customizeSettings')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
