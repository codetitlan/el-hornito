'use client';

import { useState, useEffect } from 'react';
import { UserSettings } from '@/types';
import { settingsManager } from '@/lib/settings';
import { Button } from '@/components/ui/Button';
import { CookingPreferencesSection } from '@/components/settings/CookingPreferencesSection';
import { KitchenEquipmentSection } from '@/components/settings/KitchenEquipmentSection';
import { DataManagementSection } from '@/components/settings/DataManagementSection';
import { ApiConfigurationSection } from '@/components/settings/ApiConfigurationSection';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Load settings on component mount
  useEffect(() => {
    const loadedSettings = settingsManager.loadSettings();
    setSettings(loadedSettings);
  }, []);

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    setSaveMessage(null);

    try {
      const success = settingsManager.saveSettings(settings);
      if (success) {
        setHasChanges(false);
        setSaveMessage({
          type: 'success',
          text: 'Settings saved successfully!',
        });
      } else {
        setSaveMessage({
          type: 'error',
          text: 'Failed to save settings. Please try again.',
        });
      }
    } catch (err) {
      console.error('Save error:', err);
      setSaveMessage({
        type: 'error',
        text: 'An error occurred while saving settings.',
      });
    } finally {
      setSaving(false);
      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const handleReset = () => {
    if (
      confirm(
        'Are you sure you want to reset all settings to defaults? This cannot be undone.'
      )
    ) {
      settingsManager.clearSettings();
      const defaultSettings = settingsManager.loadSettings();
      setSettings(defaultSettings);
      setHasChanges(false);
      setSaveMessage({ type: 'success', text: 'Settings reset to defaults!' });
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const updateSettings = (updater: (prev: UserSettings) => UserSettings) => {
    if (!settings) return;

    const newSettings = updater(settings);
    setSettings(newSettings);
    setHasChanges(true);
  };

  if (!settings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ChevronLeft className="h-5 w-5 mr-1" />
                Back to Home
              </Link>
              <div className="border-l border-gray-300 pl-4">
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-sm text-gray-600">
                  Customize your cooking experience
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Changes Indicator */}
              {hasChanges && (
                <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Unsaved changes</span>
                </div>
              )}

              {/* Save Message */}
              {saveMessage && (
                <div
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    saveMessage.type === 'success'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {saveMessage.text}
                </div>
              )}

              <Button
                variant="outline"
                onClick={handleReset}
                className="text-gray-600 border-gray-300 hover:bg-gray-50"
              >
                Reset to Defaults
              </Button>

              <Button
                onClick={handleSave}
                disabled={!hasChanges || saving}
                className={`transition-all ${
                  hasChanges
                    ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-lg'
                    : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                }`}
              >
                {saving
                  ? 'Saving...'
                  : hasChanges
                  ? 'Save Changes'
                  : 'All Saved'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Privacy Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-blue-900">
                Privacy & Data Storage
              </h3>
              <div className="mt-2 text-blue-800">
                <p className="text-sm">
                  All your settings are stored locally in your browser and never
                  transmitted to our servers. Your data remains completely
                  private and under your control.
                </p>
                <ul className="mt-2 text-sm list-disc list-inside space-y-1">
                  <li>
                    Settings are saved in your browser&apos;s local storage
                  </li>
                  <li>No personal data is collected or transmitted</li>
                  <li>
                    You can export, import, or clear your data at any time
                  </li>
                  <li>
                    In the future, you&apos;ll be able to sync settings across
                    devices with an account
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Sections */}
        <div className="space-y-8">
          {/* API Configuration Section */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                API Configuration
              </h2>
              <p className="text-gray-600 mt-1">
                Optional: Use your own Anthropic Claude API key for unlimited
                usage
              </p>
            </div>

            <ApiConfigurationSection
              configuration={settings.apiConfiguration}
              onChange={(configuration) =>
                updateSettings((prev) => ({
                  ...prev,
                  apiConfiguration: configuration,
                }))
              }
              disabled={saving}
            />
          </div>

          {/* Cooking Preferences Section */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Cooking Preferences
              </h2>
              <p className="text-gray-600 mt-1">
                Tell us about your cooking style and dietary needs
              </p>
            </div>

            <CookingPreferencesSection
              preferences={settings.cookingPreferences}
              onChange={(preferences) =>
                updateSettings((prev) => ({
                  ...prev,
                  cookingPreferences: preferences,
                }))
              }
              disabled={saving}
            />
          </div>

          {/* Kitchen Equipment Section */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Kitchen Equipment
              </h2>
              <p className="text-gray-600 mt-1">
                Let us know what equipment you have available
              </p>
            </div>

            <KitchenEquipmentSection
              equipment={settings.kitchenEquipment}
              onChange={(equipment) =>
                updateSettings((prev) => ({
                  ...prev,
                  kitchenEquipment: equipment,
                }))
              }
              disabled={saving}
            />
          </div>

          {/* Data Management Section */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Data Management
              </h2>
              <p className="text-gray-600 mt-1">
                Export, import, or clear your settings
              </p>
            </div>

            <DataManagementSection
              settings={settings}
              onImport={(newSettings) => {
                setSettings(newSettings);
                setHasChanges(false);
                setSaveMessage({
                  type: 'success',
                  text: 'Settings imported successfully!',
                });
                setTimeout(() => setSaveMessage(null), 3000);
              }}
              disabled={saving}
            />
          </div>
        </div>

        {/* Bottom Spacing */}
        <div className="h-8"></div>
      </div>
    </div>
  );
}
