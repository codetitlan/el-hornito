'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Camera, Upload, X, Image as ImageIcon } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { cn, validateFile, formatFileSize } from '@/lib/utils';
import { APP_CONFIG } from '@/lib/constants';
import { Button } from './ui/Button';
import { ProgressSpinner } from './ui/LoadingSpinner';
import { analyzeFridge } from '@/lib/api';
import { Recipe, UserSettings } from '@/types';
import { SettingsManager } from '@/lib/settings';
import { useTranslations } from 'next-intl';

interface FridgeUploaderProps {
  onRecipeGenerated: (recipe: Recipe) => void;
  onError: (error: string) => void;
  className?: string;
}

interface UploadState {
  isUploading: boolean;
  progress: number;
  status: string;
  error: string | null;
}

export function FridgeUploader({
  onRecipeGenerated,
  onError,
  className,
}: FridgeUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    status: '',
    error: null,
  });
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const t = useTranslations('common.fridgeUploader');

  // Load user settings on component mount
  useEffect(() => {
    const settingsManager = SettingsManager.getInstance();
    const settings = settingsManager.loadSettings();
    setUserSettings(settings);
  }, []);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      const validation = validateFile(file);
      if (!validation.isValid) {
        onError(validation.error || t('invalidFile'));
        return;
      }

      setSelectedFile(file);
      setUploadState((prev) => ({ ...prev, error: null }));
    },
    [onError, t]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    maxSize: APP_CONFIG.MAX_FILE_SIZE,
    multiple: false,
    onDropRejected: (fileRejections) => {
      const rejection = fileRejections[0];
      if (rejection) {
        const error = rejection.errors[0];
        if (error.code === 'file-too-large') {
          onError(APP_CONFIG.ERROR_MESSAGES.FILE_TOO_LARGE);
        } else if (error.code === 'file-invalid-type') {
          onError(APP_CONFIG.ERROR_MESSAGES.INVALID_FILE_TYPE);
        } else {
          onError(error.message);
        }
      }
    },
  });

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setUploadState({
      isUploading: true,
      progress: 0,
      status: t('preparing'),
      error: null,
    });

    try {
      const recipe = await analyzeFridge(
        selectedFile,
        userSettings || undefined,
        {
          onProgress: (progress) => {
            setUploadState((prev) => ({ ...prev, progress }));
          },
          onStatusUpdate: (status) => {
            setUploadState((prev) => ({ ...prev, status }));
          },
        }
      );

      onRecipeGenerated(recipe);

      // Reset form
      setSelectedFile(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t('analysisFailed');
      onError(errorMessage);
      setUploadState((prev) => ({ ...prev, error: errorMessage }));
    } finally {
      setUploadState((prev) => ({
        ...prev,
        isUploading: false,
        progress: 0,
        status: '',
      }));
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setUploadState((prev) => ({ ...prev, error: null }));
  };

  if (uploadState.isUploading) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center p-8 space-y-4',
          className
        )}
      >
        <ProgressSpinner
          progress={uploadState.progress}
          size="lg"
          message={uploadState.status}
        />
        <p className="text-center text-gray-600 max-w-md">
          {t('analyzingMessage')}
        </p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* File Upload Area */}
      <div
        {...getRootProps()}
        className={cn(
          'relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200',
          isDragActive
            ? 'border-orange-400 bg-orange-50'
            : selectedFile
            ? 'border-green-400 bg-green-50'
            : 'border-gray-300 hover:border-orange-400 hover:bg-orange-50/50'
        )}
      >
        <input {...getInputProps()} />

        {selectedFile ? (
          <div className="space-y-4">
            <div className="relative inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={URL.createObjectURL(selectedFile)}
                alt="Selected fridge photo"
                className="w-32 h-32 object-cover rounded-lg border shadow-sm"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile();
                }}
                title={t('removeImage')}
                aria-label={t('removeSelectedImage')}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <X size={12} />
              </button>
            </div>
            <div>
              <p className="font-medium text-gray-900">{selectedFile.name}</p>
              <p className="text-sm text-gray-500">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
              {isDragActive ? (
                <Upload className="w-8 h-8 text-orange-600" />
              ) : (
                <ImageIcon className="w-8 h-8 text-orange-600" />
              )}
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900">
                {isDragActive ? t('dropPhoto') : t('uploadPhoto')}
              </p>
              <p className="text-sm text-gray-500 mt-1">{t('dragDrop')}</p>
            </div>

            {/* Camera option for mobile */}
            <div className="pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                size="sm"
                icon={<Camera size={16} />}
                onClick={(e) => {
                  e.stopPropagation();
                  // Trigger camera input
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.capture = 'environment';
                  input.onchange = (e) => {
                    const files = (e.target as HTMLInputElement).files;
                    if (files && files[0]) {
                      onDrop([files[0]]);
                    }
                  };
                  input.click();
                }}
              >
                {t('takePhoto')}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Settings Preview and Generate Button */}
      {selectedFile && (
        <div className="space-y-4">
          {/* Settings Preview */}
          {userSettings && (
            <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-medium text-orange-900">
                  {t('yourRecipePreferences')}
                </h3>
                <Link
                  href="/settings"
                  className="text-xs text-orange-600 hover:text-orange-800 underline transition-colors"
                >
                  {t('edit')}
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                {/* Dietary Preferences */}
                {userSettings.cookingPreferences.dietaryRestrictions.length >
                  0 && (
                  <div>
                    <span className="font-medium text-orange-800">
                      {t('dietary')}
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {userSettings.cookingPreferences.dietaryRestrictions
                        .slice(0, 3)
                        .map((restriction) => (
                          <span
                            key={restriction}
                            className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs"
                          >
                            {restriction}
                          </span>
                        ))}
                      {userSettings.cookingPreferences.dietaryRestrictions
                        .length > 3 && (
                        <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs">
                          +
                          {userSettings.cookingPreferences.dietaryRestrictions
                            .length - 3}{' '}
                          more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Cuisine Preferences */}
                {userSettings.cookingPreferences.cuisineTypes.length > 0 && (
                  <div>
                    <span className="font-medium text-orange-800">
                      {t('cuisines')}
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {userSettings.cookingPreferences.cuisineTypes
                        .slice(0, 3)
                        .map((cuisine) => (
                          <span
                            key={cuisine}
                            className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs"
                          >
                            {cuisine}
                          </span>
                        ))}
                      {userSettings.cookingPreferences.cuisineTypes.length >
                        3 && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs">
                          +
                          {userSettings.cookingPreferences.cuisineTypes.length -
                            3}{' '}
                          more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Cooking Time & Spice Level */}
                <div>
                  <span className="font-medium text-orange-800">
                    {t('preferences')}
                  </span>
                  <div className="text-orange-700 mt-1">
                    {userSettings.cookingPreferences.cookingTimePreference && (
                      <span className="capitalize">
                        {userSettings.cookingPreferences.cookingTimePreference}{' '}
                        {t('meals')}
                      </span>
                    )}
                    {userSettings.cookingPreferences.spiceLevel &&
                      userSettings.cookingPreferences.cookingTimePreference &&
                      ', '}
                    {userSettings.cookingPreferences.spiceLevel && (
                      <span className="capitalize">
                        {userSettings.cookingPreferences.spiceLevel}{' '}
                        {t('spice')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Equipment */}
                {(userSettings.kitchenEquipment.basicAppliances.length > 0 ||
                  userSettings.kitchenEquipment.cookware.length > 0) && (
                  <div>
                    <span className="font-medium text-orange-800">
                      {t('equipment')}
                    </span>
                    <div className="text-orange-700 mt-1">
                      {userSettings.kitchenEquipment.basicAppliances
                        .slice(0, 2)
                        .join(', ')}
                      {userSettings.kitchenEquipment.cookware.length > 0 &&
                        userSettings.kitchenEquipment.basicAppliances.length >
                          0 &&
                        ', '}
                      {userSettings.kitchenEquipment.cookware
                        .slice(0, 1)
                        .join(', ')}
                      {userSettings.kitchenEquipment.basicAppliances.length +
                        userSettings.kitchenEquipment.cookware.length >
                        3 && '...'}
                    </div>
                  </div>
                )}
              </div>

              {/* Empty state */}
              {userSettings.cookingPreferences.dietaryRestrictions.length ===
                0 &&
                userSettings.cookingPreferences.cuisineTypes.length === 0 && (
                  <div className="text-orange-600 text-sm">
                    {t('tip')} <strong>{t('tipText')}</strong>
                  </div>
                )}
            </div>
          )}

          {/* Fallback notice if no settings loaded */}
          {!userSettings && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>{t('personalizedRecipeGeneration')}</strong>{' '}
                {t('personalizedRecipeDescription')}{' '}
                <Link
                  href="/settings"
                  className="underline hover:text-blue-800 transition-colors"
                >
                  {t('setUpPreferences')}
                </Link>
              </p>
            </div>
          )}

          <Button
            onClick={handleAnalyze}
            className="w-full"
            size="lg"
            loading={uploadState.isUploading}
          >
            {t('generateRecipe')}
          </Button>
        </div>
      )}

      {/* Error Display */}
      {uploadState.error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{uploadState.error}</p>
        </div>
      )}
    </div>
  );
}
