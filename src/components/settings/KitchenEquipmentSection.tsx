import React from 'react';
import { useTranslations } from 'next-intl';
import { KitchenEquipment } from '@/types';
import { SETTINGS_CONFIG } from '@/lib/constants';
import { EquipmentGrid } from './EquipmentGrid';

interface KitchenEquipmentSectionProps {
  equipment: KitchenEquipment;
  onChange: (equipment: KitchenEquipment) => void;
  disabled?: boolean;
  className?: string;
}

export const KitchenEquipmentSection: React.FC<
  KitchenEquipmentSectionProps
> = ({ equipment, onChange, disabled = false, className = '' }) => {
  const t = useTranslations('settings.kitchenEquipment');

  const updateEquipment = (field: keyof KitchenEquipment, value: string[]) => {
    onChange({
      ...equipment,
      [field]: value,
    });
  };

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Basic Appliances */}
      <EquipmentGrid
        label={t('basicAppliances')}
        description={t('basicAppliancesDescription')}
        items={[...SETTINGS_CONFIG.BASIC_APPLIANCES]}
        selected={equipment.basicAppliances}
        onChange={(selected) => updateEquipment('basicAppliances', selected)}
        disabled={disabled}
        columns={3}
      />

      {/* Advanced Appliances */}
      <EquipmentGrid
        label={t('advancedAppliances')}
        description={t('advancedAppliancesDescription')}
        items={[...SETTINGS_CONFIG.ADVANCED_APPLIANCES]}
        selected={equipment.advancedAppliances}
        onChange={(selected) => updateEquipment('advancedAppliances', selected)}
        disabled={disabled}
        columns={3}
      />

      {/* Cookware */}
      <EquipmentGrid
        label={t('cookware')}
        description={t('cookwareDescription')}
        items={[...SETTINGS_CONFIG.COOKWARE]}
        selected={equipment.cookware}
        onChange={(selected) => updateEquipment('cookware', selected)}
        disabled={disabled}
        columns={3}
      />

      {/* Baking Equipment */}
      <EquipmentGrid
        label={t('bakingEquipment')}
        description={t('bakingEquipmentDescription')}
        items={[...SETTINGS_CONFIG.BAKING_EQUIPMENT]}
        selected={equipment.bakingEquipment}
        onChange={(selected) => updateEquipment('bakingEquipment', selected)}
        disabled={disabled}
        columns={3}
      />

      {/* Other Equipment */}
      <div className="space-y-2">
        <label
          htmlFor="other-equipment"
          className="block text-sm font-medium text-gray-900"
        >
          {t('other')}
        </label>
        <p className="text-sm text-gray-500">{t('otherDescription')}</p>
        <textarea
          id="other-equipment"
          rows={4}
          value={equipment.other.join('\n')}
          onChange={(e) => {
            const lines = e.target.value
              .split('\n')
              .filter((line) => line.trim() !== '');
            updateEquipment('other', lines);
          }}
          disabled={disabled}
          placeholder={t('otherPlaceholder')}
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
        <p className="text-xs text-gray-400">{t('otherNote')}</p>
      </div>

      {/* Equipment Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">
          {t('summary.title')}
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">
              {t('summary.basicAppliances')}
            </span>
            <span className="ml-2 font-medium">
              {equipment.basicAppliances.length}
            </span>
          </div>
          <div>
            <span className="text-gray-500">
              {t('summary.advancedAppliances')}
            </span>
            <span className="ml-2 font-medium">
              {equipment.advancedAppliances.length}
            </span>
          </div>
          <div>
            <span className="text-gray-500">{t('summary.cookware')}</span>
            <span className="ml-2 font-medium">
              {equipment.cookware.length}
            </span>
          </div>
          <div>
            <span className="text-gray-500">
              {t('summary.bakingEquipment')}
            </span>
            <span className="ml-2 font-medium">
              {equipment.bakingEquipment.length}
            </span>
          </div>
        </div>
        {equipment.other.length > 0 && (
          <div className="mt-2 text-sm">
            <span className="text-gray-500">{t('summary.other')}</span>
            <span className="ml-2 font-medium">{equipment.other.length}</span>
          </div>
        )}
      </div>
    </div>
  );
};
