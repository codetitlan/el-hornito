import React from 'react';

interface SettingsToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export const SettingsToggle: React.FC<SettingsToggleProps> = ({
  label,
  description,
  checked,
  onChange,
  disabled = false,
  className = '',
}) => {
  const toggleId = React.useId();

  return (
    <div className={`flex items-center justify-between py-3 ${className}`}>
      <div className="flex-1 min-w-0">
        <label
          htmlFor={toggleId}
          className="text-sm font-medium text-gray-900 cursor-pointer"
        >
          {label}
        </label>
        {description && (
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        )}
      </div>

      <div className="ml-4 flex-shrink-0">
        <button
          type="button"
          id={toggleId}
          role="switch"
          aria-checked={checked ? 'true' : 'false'}
          disabled={disabled}
          onClick={() => onChange(!checked)}
          className={`
            relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
            transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-offset-2
            ${checked ? 'bg-orange-600' : 'bg-gray-200'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <span
            aria-hidden="true"
            className={`
              pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 
              transition duration-200 ease-in-out
              ${checked ? 'translate-x-5' : 'translate-x-0'}
            `}
          />
        </button>
      </div>
    </div>
  );
};
