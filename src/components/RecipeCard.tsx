'use client';

import React from 'react';
import { Clock, Users, ChefHat } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Recipe } from '@/types';
import { APP_CONFIG } from '@/lib/constants';

interface RecipeCardProps {
  recipe: Recipe;
  onClick: () => void;
  className?: string;
}

export function RecipeCard({ recipe, onClick, className }: RecipeCardProps) {
  const getDifficultyColor = (difficulty: Recipe['difficulty']) => {
    return (
      APP_CONFIG.DIFFICULTY_COLORS[difficulty] || 'text-gray-600 bg-gray-50'
    );
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white rounded-xl shadow-sm border hover:shadow-md transition-all duration-200 cursor-pointer group',
        className
      )}
    >
      {/* Card Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-lg group-hover:text-orange-600 transition-colors truncate">
              {recipe.title}
            </h3>
            <p className="text-gray-600 text-sm mt-1 line-clamp-2">
              {recipe.description}
            </p>
          </div>

          {/* Recipe Icon */}
          <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
            <ChefHat className="w-6 h-6 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="px-6 pb-4">
        {/* Meta Information */}
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          {recipe.cookingTime && (
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>{recipe.cookingTime}</span>
            </div>
          )}

          {recipe.servings && (
            <div className="flex items-center gap-1">
              <Users size={14} />
              <span>{recipe.servings}</span>
            </div>
          )}

          {recipe.difficulty && (
            <span
              className={cn(
                'px-2 py-0.5 rounded-full text-xs font-medium',
                getDifficultyColor(recipe.difficulty)
              )}
            >
              {recipe.difficulty}
            </span>
          )}
        </div>

        {/* Ingredients Preview */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Ingredients ({recipe.ingredients.length})
          </h4>
          <div className="flex flex-wrap gap-1">
            {recipe.ingredients.slice(0, 3).map((ingredient, index) => (
              <span
                key={index}
                className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded"
              >
                {ingredient.length > 20
                  ? `${ingredient.substring(0, 17)}...`
                  : ingredient}
              </span>
            ))}
            {recipe.ingredients.length > 3 && (
              <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                +{recipe.ingredients.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Instructions Preview */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Instructions ({recipe.instructions.length} steps)
          </h4>
          <p className="text-sm text-gray-600 line-clamp-2">
            {recipe.instructions[0]}
          </p>
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-6 py-3 bg-gray-50 rounded-b-xl border-t">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            Click to view full recipe
          </span>
          <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center group-hover:bg-orange-600 transition-colors">
            <svg
              className="w-3 h-3 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
