import React from 'react';
import { ChevronDown } from 'lucide-react';

interface SettingsSelectOption {
  value: string;
  label: string;
  description?: string;
}

interface SettingsSelectProps {
  label: string;
  description?: string;
  value: string;
  options: SettingsSelectOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export const SettingsSelect: React.FC<SettingsSelectProps> = ({
  label,
  description,
  value,
  options,
  onChange,
  disabled = false,
  placeholder = 'Select an option...',
  className = '',
}) => {
  const selectId = React.useId();

  return (
    <div className={`space-y-2 ${className}`}>
      <label
        htmlFor={selectId}
        className="block text-sm font-medium text-gray-900"
      >
        {label}
      </label>
      {description && <p className="text-sm text-gray-500">{description}</p>}

      <div className="relative">
        <select
          id={selectId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`
            block w-full rounded-lg border-0 py-2.5 pl-3 pr-10 text-gray-900 shadow-sm ring-1 ring-inset 
            ring-gray-300 focus:ring-2 focus:ring-orange-600 sm:text-sm sm:leading-6 appearance-none
            ${
              disabled
                ? 'bg-gray-50 text-gray-500 cursor-not-allowed'
                : 'bg-white cursor-pointer hover:ring-gray-400'
            }
          `}
        >
          {placeholder && !value && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <ChevronDown className="h-4 w-4 text-gray-400" aria-hidden="true" />
        </div>
      </div>

      {/* Show description for selected option */}
      {value &&
        (() => {
          const selectedOption = options.find((opt) => opt.value === value);
          return selectedOption?.description ? (
            <p className="text-xs text-gray-500 italic">
              {selectedOption.description}
            </p>
          ) : null;
        })()}
    </div>
  );
};
