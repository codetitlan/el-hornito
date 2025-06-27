import React from 'react';
import { Check } from 'lucide-react';

interface EquipmentItem {
  name: string;
  description?: string;
  icon?: React.ReactNode;
}

interface EquipmentGridProps {
  label: string;
  description?: string;
  items: (string | EquipmentItem)[];
  selected: string[];
  onChange: (selected: string[]) => void;
  disabled?: boolean;
  columns?: 2 | 3 | 4;
  className?: string;
}

export const EquipmentGrid: React.FC<EquipmentGridProps> = ({
  label,
  description,
  items,
  selected,
  onChange,
  disabled = false,
  columns = 3,
  className = '',
}) => {
  const toggleItem = (itemName: string) => {
    if (disabled) return;

    if (selected.includes(itemName)) {
      onChange(selected.filter((name) => name !== itemName));
    } else {
      onChange([...selected, itemName]);
    }
  };

  const normalizeItem = (item: string | EquipmentItem): EquipmentItem => {
    return typeof item === 'string' ? { name: item } : item;
  };

  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <h3 className="text-sm font-medium text-gray-900">{label}</h3>
        {description && (
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        )}
        <p className="text-xs text-gray-400 mt-1">
          {selected.length} of {items.length} selected
        </p>
      </div>

      <div className={`grid gap-3 ${gridCols[columns]}`}>
        {items.map((item) => {
          const normalizedItem = normalizeItem(item);
          const isSelected = selected.includes(normalizedItem.name);

          return (
            <button
              key={normalizedItem.name}
              type="button"
              onClick={() => toggleItem(normalizedItem.name)}
              disabled={disabled}
              className={`
                relative p-4 rounded-lg border-2 text-left transition-all duration-200
                ${
                  isSelected
                    ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-200'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2
              `}
            >
              {/* Selection indicator */}
              <div
                className={`
                absolute top-2 right-2 w-5 h-5 rounded-full border-2 flex items-center justify-center
                ${
                  isSelected
                    ? 'border-orange-500 bg-orange-500'
                    : 'border-gray-300 bg-white'
                }
              `}
              >
                {isSelected && (
                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                )}
              </div>

              {/* Icon */}
              {normalizedItem.icon && (
                <div
                  className={`
                  mb-2 w-8 h-8 flex items-center justify-center rounded-lg
                  ${isSelected ? 'text-orange-600' : 'text-gray-600'}
                `}
                >
                  {normalizedItem.icon}
                </div>
              )}

              {/* Content */}
              <div>
                <h4
                  className={`
                  font-medium text-sm
                  ${isSelected ? 'text-orange-900' : 'text-gray-900'}
                `}
                >
                  {normalizedItem.name}
                </h4>
                {normalizedItem.description && (
                  <p
                    className={`
                    text-xs mt-1
                    ${isSelected ? 'text-orange-700' : 'text-gray-500'}
                  `}
                  >
                    {normalizedItem.description}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {selected.length === 0 && (
        <p className="text-sm text-gray-400 italic text-center py-8">
          No equipment selected
        </p>
      )}
    </div>
  );
};
