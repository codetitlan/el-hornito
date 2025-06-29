import React from 'react';
import { useTranslations } from 'next-intl';
import { CookingPreferences } from '@/types';
import { SETTINGS_CONFIG } from '@/lib/constants';
import { PreferenceChips } from './PreferenceChips';
import { SettingsSelect } from './SettingsSelect';

interface CookingPreferencesSectionProps {
  preferences: CookingPreferences;
  onChange: (preferences: CookingPreferences) => void;
  disabled?: boolean;
  className?: string;
}

export const CookingPreferencesSection: React.FC<
  CookingPreferencesSectionProps
> = ({ preferences, onChange, disabled = false, className = '' }) => {
  const t = useTranslations('settings.cookingPreferences');

  const updatePreferences = (
    field: keyof CookingPreferences,
    value: string | string[] | number | undefined
  ) => {
    onChange({
      ...preferences,
      [field]: value,
    });
  };

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Cuisine Types */}
      <PreferenceChips
        label={t('cuisineTypes')}
        description={t('cuisineTypesDescription')}
        selected={preferences.cuisineTypes}
        options={[...SETTINGS_CONFIG.CUISINE_TYPES]}
        onChange={(selected) => updatePreferences('cuisineTypes', selected)}
        disabled={disabled}
        maxSelections={8}
      />

      {/* Dietary Restrictions */}
      <PreferenceChips
        label={t('dietaryRestrictions')}
        description={t('dietaryRestrictionsDescription')}
        selected={preferences.dietaryRestrictions}
        options={[...SETTINGS_CONFIG.DIETARY_RESTRICTIONS]}
        onChange={(selected) =>
          updatePreferences('dietaryRestrictions', selected)
        }
        disabled={disabled}
      />

      {/* Spice Level */}
      <SettingsSelect
        label={t('spiceLevel')}
        description={t('spiceLevelDescription')}
        value={preferences.spiceLevel}
        options={SETTINGS_CONFIG.SPICE_LEVELS.map((level) => ({ ...level }))}
        onChange={(value) => updatePreferences('spiceLevel', value)}
        disabled={disabled}
        placeholder={t('spiceLevelPlaceholder')}
      />

      {/* Cooking Time Preference */}
      <SettingsSelect
        label={t('cookingTime')}
        description={t('cookingTimeDescription')}
        value={preferences.cookingTimePreference}
        options={SETTINGS_CONFIG.COOKING_TIME_PREFERENCES.map((pref) => ({
          ...pref,
        }))}
        onChange={(value) => updatePreferences('cookingTimePreference', value)}
        disabled={disabled}
        placeholder={t('cookingTimePlaceholder')}
      />

      {/* Meal Types */}
      <PreferenceChips
        label={t('mealTypes')}
        description={t('mealTypesDescription')}
        selected={preferences.mealTypes}
        options={[...SETTINGS_CONFIG.MEAL_TYPES]}
        onChange={(selected) => updatePreferences('mealTypes', selected)}
        disabled={disabled}
        maxSelections={6}
      />

      {/* Default Servings */}
      <div className="space-y-2">
        <label
          htmlFor="servings"
          className="block text-sm font-medium text-gray-900"
        >
          {t('servings')}
        </label>
        <p className="text-sm text-gray-500">{t('servingsDescription')}</p>
        <div className="flex items-center space-x-4">
          <input
            type="range"
            id="servings"
            min="1"
            max="12"
            value={preferences.defaultServings}
            onChange={(e) =>
              updatePreferences('defaultServings', parseInt(e.target.value))
            }
            disabled={disabled}
            className={`
              flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          />
          <div className="flex items-center justify-center w-16 h-10 bg-orange-50 border border-orange-200 rounded-lg">
            <span className="text-sm font-semibold text-orange-800">
              {preferences.defaultServings}
            </span>
          </div>
        </div>
        <div className="flex justify-between text-xs text-gray-400">
          <span>{t('servingsMinLabel')}</span>
          <span>{t('servingsMaxLabel')}</span>
        </div>
      </div>

      {/* Additional Notes */}
      <div className="space-y-2">
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-gray-900"
        >
          {t('additionalNotes')}
        </label>
        <p className="text-sm text-gray-500">
          {t('additionalNotesDescription')}
        </p>
        <textarea
          id="notes"
          rows={3}
          value={preferences.additionalNotes || ''}
          onChange={(e) =>
            updatePreferences('additionalNotes', e.target.value || undefined)
          }
          disabled={disabled}
          placeholder={t('additionalNotesPlaceholder')}
          className={`
            block w-full rounded-lg border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset 
            ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-orange-600 sm:text-sm sm:leading-6
            ${
              disabled
                ? 'bg-gray-50 text-gray-500 cursor-not-allowed'
                : 'bg-white'
            }
          `}
        />
      </div>
    </div>
  );
};
