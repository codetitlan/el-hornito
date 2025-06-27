import React from 'react';
import { X } from 'lucide-react';

interface PreferenceChipsProps {
  label: string;
  description?: string;
  selected: string[];
  options: string[];
  onChange: (selected: string[]) => void;
  disabled?: boolean;
  maxSelections?: number;
  className?: string;
}

export const PreferenceChips: React.FC<PreferenceChipsProps> = ({
  label,
  description,
  selected,
  options,
  onChange,
  disabled = false,
  maxSelections,
  className = '',
}) => {
  const toggleOption = (option: string) => {
    if (disabled) return;

    if (selected.includes(option)) {
      // Remove option
      onChange(selected.filter((item) => item !== option));
    } else {
      // Add option (check max limit)
      if (maxSelections && selected.length >= maxSelections) {
        return; // Don't add if at max limit
      }
      onChange([...selected, option]);
    }
  };

  const removeOption = (option: string) => {
    if (disabled) return;
    onChange(selected.filter((item) => item !== option));
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div>
        <h3 className="text-sm font-medium text-gray-900">{label}</h3>
        {description && (
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        )}
        {maxSelections && (
          <p className="text-xs text-gray-400 mt-1">
            {selected.length}/{maxSelections} selected
          </p>
        )}
      </div>

      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((option) => (
            <div
              key={option}
              className={`
                inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium
                ${
                  disabled
                    ? 'bg-gray-100 text-gray-500'
                    : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                }
              `}
            >
              <span>{option}</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeOption(option)}
                  className="ml-1 flex-shrink-0 hover:bg-orange-300 rounded-full p-0.5 transition-colors"
                  aria-label={`Remove ${option}`}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Available options */}
      <div className="flex flex-wrap gap-2">
        {options
          .filter((option) => !selected.includes(option))
          .map((option) => {
            const isDisabledByLimit = maxSelections
              ? selected.length >= maxSelections
              : false;
            const isOptionDisabled = disabled || isDisabledByLimit;

            return (
              <button
                key={option}
                type="button"
                onClick={() => toggleOption(option)}
                disabled={isOptionDisabled}
                className={`
                  px-3 py-1 rounded-full text-sm font-medium border transition-colors
                  ${
                    isOptionDisabled
                      ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-800 cursor-pointer'
                  }
                `}
              >
                {option}
              </button>
            );
          })}
      </div>

      {selected.length === 0 && (
        <p className="text-sm text-gray-400 italic">No preferences selected</p>
      )}
    </div>
  );
};
