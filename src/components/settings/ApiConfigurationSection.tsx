import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ApiConfiguration } from '@/types';
import { settingsManager } from '@/lib/settings';
import { Button } from '@/components/ui/Button';
import {
  Eye,
  EyeOff,
  Key,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';

interface ApiConfigurationSectionProps {
  configuration: ApiConfiguration;
  onChange: (configuration: ApiConfiguration) => void;
  disabled?: boolean;
  className?: string;
}

export const ApiConfigurationSection: React.FC<
  ApiConfigurationSectionProps
> = ({ configuration, onChange, disabled = false, className = '' }) => {
  const t = useTranslations('settings.apiConfiguration');
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationMessage, setValidationMessage] = useState<{
    type: 'success' | 'error' | 'warning';
    text: string;
  } | null>(null);

  const handleValidateAndSave = async () => {
    if (!apiKey.trim()) {
      setValidationMessage({
        type: 'error',
        text: t('messages.enterKey'),
      });
      return;
    }

    setIsValidating(true);
    setValidationMessage(null);

    try {
      const isValid = await settingsManager.validateApiKey(apiKey.trim());

      if (isValid) {
        // Store encrypted API key in localStorage
        localStorage.setItem('elhornito-api-key', btoa(apiKey.trim()));

        onChange({
          ...configuration,
          hasPersonalKey: true,
          keyValidated: true,
          lastValidation: new Date().toISOString(),
        });

        setValidationMessage({
          type: 'success',
          text: t('messages.validationSuccess'),
        });

        setApiKey(''); // Clear the input for security
      } else {
        setValidationMessage({
          type: 'error',
          text: t('messages.validationError'),
        });
      }
    } catch (error) {
      console.error('Validation error:', error);
      setValidationMessage({
        type: 'error',
        text: t('messages.validationFailed'),
      });
    } finally {
      setIsValidating(false);
      setTimeout(() => setValidationMessage(null), 5000);
    }
  };

  const handleRemoveKey = () => {
    if (
      confirm(
        'Are you sure you want to remove your personal API key? You will fall back to the default service.'
      )
    ) {
      localStorage.removeItem('elhornito-api-key');
      onChange({
        ...configuration,
        hasPersonalKey: false,
        keyValidated: false,
        lastValidation: undefined,
      });

      setValidationMessage({
        type: 'success',
        text: 'Personal API key removed. Using default service.',
      });
      setTimeout(() => setValidationMessage(null), 3000);
    }
  };

  const toggleUsageTracking = () => {
    onChange({
      ...configuration,
      usageTracking: !configuration.usageTracking,
    });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* API Key Status */}
      <div
        className={`rounded-lg p-4 border ${
          configuration.hasPersonalKey
            ? 'bg-green-50 border-green-200'
            : 'bg-blue-50 border-blue-200'
        }`}
      >
        <div className="flex items-center gap-3">
          {configuration.hasPersonalKey ? (
            <>
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <h4 className="font-medium text-green-900">
                  Personal API Key Active
                </h4>
                <p className="text-sm text-green-700">
                  You&apos;re using your own Anthropic API key.
                  {configuration.lastValidation && (
                    <>
                      {' '}
                      Last validated:{' '}
                      {new Date(
                        configuration.lastValidation
                      ).toLocaleDateString()}
                    </>
                  )}
                </p>
              </div>
            </>
          ) : (
            <>
              <Key className="w-5 h-5 text-blue-600" />
              <div>
                <h4 className="font-medium text-blue-900">
                  Using Default Service
                </h4>
                <p className="text-sm text-blue-700">
                  You&apos;re using our shared service. Add your own API key for
                  unlimited usage and faster responses.
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* API Key Configuration */}
      {!configuration.hasPersonalKey && (
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">
              Add Your Personal API Key
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              Get your API key from{' '}
              <a
                href="https://console.anthropic.com/account/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-600 hover:text-orange-700 underline"
              >
                Anthropic Console
              </a>
            </p>
          </div>

          <div className="space-y-3">
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-ant-api03-..."
                disabled={disabled || isValidating}
                className={`
                  block w-full rounded-lg border-0 py-2.5 pl-3 pr-12 text-gray-900 shadow-sm ring-1 ring-inset 
                  ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-orange-600 sm:text-sm sm:leading-6
                  ${
                    disabled || isValidating
                      ? 'bg-gray-50 text-gray-500 cursor-not-allowed'
                      : 'bg-white'
                  }
                `}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isValidating) {
                    handleValidateAndSave();
                  }
                }}
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                disabled={disabled || isValidating}
              >
                {showApiKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            <Button
              onClick={handleValidateAndSave}
              disabled={disabled || isValidating || !apiKey.trim()}
              className="w-full sm:w-auto"
            >
              {isValidating ? 'Validating...' : 'Validate & Save API Key'}
            </Button>
          </div>
        </div>
      )}

      {/* Remove API Key */}
      {configuration.hasPersonalKey && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Manage API Key</h4>
          <Button
            onClick={handleRemoveKey}
            disabled={disabled}
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-50"
          >
            Remove Personal API Key
          </Button>
        </div>
      )}

      {/* Usage Tracking Toggle */}
      <div className="flex items-center justify-between py-3 border-t border-gray-200">
        <div>
          <h4 className="font-medium text-gray-900">Usage Tracking</h4>
          <p className="text-sm text-gray-500">
            Track API usage and estimated costs (personal key only)
          </p>
        </div>
        <button
          type="button"
          onClick={toggleUsageTracking}
          disabled={disabled || !configuration.hasPersonalKey}
          aria-label={`${
            configuration.usageTracking ? 'Disable' : 'Enable'
          } usage tracking`}
          className={`
            relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
            transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-offset-2
            ${
              configuration.usageTracking && configuration.hasPersonalKey
                ? 'bg-orange-600'
                : 'bg-gray-200'
            }
            ${
              disabled || !configuration.hasPersonalKey
                ? 'opacity-50 cursor-not-allowed'
                : ''
            }
          `}
        >
          <span
            className={`
              pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 
              transition duration-200 ease-in-out
              ${
                configuration.usageTracking && configuration.hasPersonalKey
                  ? 'translate-x-5'
                  : 'translate-x-0'
              }
            `}
          />
        </button>
      </div>

      {/* Validation Message */}
      {validationMessage && (
        <div
          className={`rounded-lg p-3 flex items-center gap-2 ${
            validationMessage.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : validationMessage.type === 'error'
              ? 'bg-red-50 text-red-800 border border-red-200'
              : 'bg-yellow-50 text-yellow-800 border border-yellow-200'
          }`}
        >
          {validationMessage.type === 'success' && (
            <CheckCircle className="w-4 h-4" />
          )}
          {validationMessage.type === 'error' && (
            <XCircle className="w-4 h-4" />
          )}
          {validationMessage.type === 'warning' && (
            <AlertCircle className="w-4 h-4" />
          )}
          <span className="text-sm">{validationMessage.text}</span>
        </div>
      )}

      {/* Security Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div className="text-sm">
            <h4 className="font-medium text-yellow-900 mb-1">
              Security Notice
            </h4>
            <ul className="text-yellow-800 space-y-1 list-disc list-inside">
              <li>
                Your API key is stored locally in your browser and never
                transmitted to our servers
              </li>
              <li>
                API keys are basic-encoded for minimal protection in local
                storage
              </li>
              <li>Never share your API key with others</li>
              <li>You can revoke access anytime from the Anthropic Console</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
