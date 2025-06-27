import React, { useState } from 'react';
import { UserSettings } from '@/types';
import { settingsManager } from '@/lib/settings';
import { Button } from '@/components/ui/Button';
import { Download, Upload, Trash2, FileText } from 'lucide-react';

interface DataManagementSectionProps {
  settings: UserSettings;
  onImport: (settings: UserSettings) => void;
  disabled?: boolean;
  className?: string;
}

export const DataManagementSection: React.FC<DataManagementSectionProps> = ({
  settings,
  onImport,
  disabled = false,
  className = '',
}) => {
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  const handleExport = () => {
    try {
      const exportData = settingsManager.exportSettings();
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `elhornito-settings-${
        new Date().toISOString().split('T')[0]
      }.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export settings. Please try again.');
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportError(null);
    setImportSuccess(null);

    if (file.type !== 'application/json') {
      setImportError('Please select a valid JSON file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const result = settingsManager.importSettings(content);

        if (result.success) {
          const newSettings = settingsManager.loadSettings();
          onImport(newSettings);
          setImportSuccess('Settings imported successfully!');
          setTimeout(() => setImportSuccess(null), 3000);
        } else {
          setImportError(result.error || 'Failed to import settings.');
        }
      } catch (err) {
        console.error('Import error:', err);
        setImportError(
          'Invalid file format. Please select a valid settings file.'
        );
      }
    };

    reader.readAsText(file);
    // Clear the input so the same file can be selected again
    event.target.value = '';
  };

  const handleClearData = () => {
    if (
      confirm(
        'Are you sure you want to clear all your settings data? This action cannot be undone.\n\n' +
          'Consider exporting your settings first as a backup.'
      )
    ) {
      const success = settingsManager.clearSettings();
      if (success) {
        const defaultSettings = settingsManager.loadSettings();
        onImport(defaultSettings);
        alert('All settings data has been cleared.');
      } else {
        alert('Failed to clear settings data. Please try again.');
      }
    }
  };

  const getDataSummary = () => {
    const totalPreferences =
      settings.cookingPreferences.cuisineTypes.length +
      settings.cookingPreferences.dietaryRestrictions.length +
      settings.cookingPreferences.mealTypes.length;

    const totalEquipment =
      settings.kitchenEquipment.basicAppliances.length +
      settings.kitchenEquipment.advancedAppliances.length +
      settings.kitchenEquipment.cookware.length +
      settings.kitchenEquipment.bakingEquipment.length +
      settings.kitchenEquipment.other.length;

    return { totalPreferences, totalEquipment };
  };

  const { totalPreferences, totalEquipment } = getDataSummary();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Data Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-5 h-5 text-gray-600" />
          <h4 className="font-medium text-gray-900">Your Data Summary</h4>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Cooking Preferences:</span>
            <span className="font-medium">{totalPreferences} items</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Kitchen Equipment:</span>
            <span className="font-medium">{totalEquipment} items</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Last Updated:</span>
            <span className="font-medium">
              {new Date(settings.lastUpdated).toLocaleDateString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Version:</span>
            <span className="font-medium">{settings.version}</span>
          </div>
        </div>
      </div>

      {/* Export Settings */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Export Settings</h4>
        <p className="text-sm text-gray-600">
          Download your settings as a JSON file to backup or transfer to another
          device.
        </p>
        <Button
          onClick={handleExport}
          disabled={disabled}
          variant="outline"
          className="w-full sm:w-auto"
        >
          <Download className="w-4 h-4 mr-2" />
          Export Settings
        </Button>
      </div>

      {/* Import Settings */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Import Settings</h4>
        <p className="text-sm text-gray-600">
          Upload a previously exported settings file to restore your
          preferences.
        </p>

        <div className="space-y-2">
          <label className="block">
            <input
              type="file"
              accept=".json,application/json"
              onChange={handleImport}
              disabled={disabled}
              className="sr-only"
            />
            <div
              className={`
              inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg 
              text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none 
              focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors cursor-pointer
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            >
              <Upload className="w-4 h-4 mr-2" />
              Import Settings
            </div>
          </label>

          {importError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
              {importError}
            </p>
          )}

          {importSuccess && (
            <p className="text-sm text-green-600 bg-green-50 border border-green-200 rounded p-2">
              {importSuccess}
            </p>
          )}
        </div>
      </div>

      {/* Clear All Data */}
      <div className="space-y-3 pt-4 border-t border-gray-200">
        <h4 className="font-medium text-red-900">Danger Zone</h4>
        <p className="text-sm text-gray-600">
          Permanently delete all your settings data. This action cannot be
          undone.
        </p>
        <Button
          onClick={handleClearData}
          disabled={disabled}
          variant="outline"
          className="w-full sm:w-auto border-red-300 text-red-700 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Clear All Data
        </Button>
      </div>
    </div>
  );
};
