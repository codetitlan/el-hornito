'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Camera, Upload, X, Image as ImageIcon } from 'lucide-react';
import { cn, validateFile, formatFileSize } from '@/lib/utils';
import { APP_CONFIG } from '@/lib/constants';
import { Button } from './ui/Button';
import { ProgressSpinner } from './ui/LoadingSpinner';
import { analyzeFridge } from '@/lib/api';
import { Recipe } from '@/types';

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
  const [preferences, setPreferences] = useState('');
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      const validation = validateFile(file);
      if (!validation.isValid) {
        onError(validation.error || 'Invalid file');
        return;
      }

      setSelectedFile(file);
      setUploadState((prev) => ({ ...prev, error: null }));
    },
    [onError]
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
      status: 'Preparing...',
      error: null,
    });

    try {
      const recipe = await analyzeFridge(
        selectedFile,
        preferences || undefined,
        dietaryRestrictions.length > 0 ? dietaryRestrictions : undefined,
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
      setPreferences('');
      setDietaryRestrictions([]);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Analysis failed';
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

  const toggleDietaryRestriction = (restriction: string) => {
    setDietaryRestrictions((prev) =>
      prev.includes(restriction)
        ? prev.filter((r) => r !== restriction)
        : [...prev, restriction]
    );
  };

  const commonRestrictions = [
    'Vegetarian',
    'Vegan',
    'Gluten-free',
    'Dairy-free',
    'Nut-free',
    'Low-carb',
    'Keto',
    'Paleo',
  ];

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
          Our AI is analyzing your fridge contents and creating a perfect recipe
          just for you!
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
                title="Remove image"
                aria-label="Remove selected image"
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
                {isDragActive
                  ? 'Drop your photo here'
                  : 'Upload your fridge photo'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Drag & drop or click to browse (JPEG, PNG, WebP up to 10MB)
              </p>
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
                Take Photo
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Preferences Section */}
      {selectedFile && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cooking Preferences (Optional)
            </label>
            <textarea
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              placeholder="e.g., I prefer quick meals, spicy food, Italian cuisine..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Dietary Restrictions
            </label>
            <div className="flex flex-wrap gap-2">
              {commonRestrictions.map((restriction) => (
                <button
                  key={restriction}
                  onClick={() => toggleDietaryRestriction(restriction)}
                  className={cn(
                    'px-3 py-1 rounded-full text-sm border transition-all',
                    dietaryRestrictions.includes(restriction)
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-orange-400'
                  )}
                >
                  {restriction}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleAnalyze}
            className="w-full"
            size="lg"
            loading={uploadState.isUploading}
          >
            Generate Recipe with AI
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
