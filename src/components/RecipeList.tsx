// Example usage for RecipeCard component
// This demonstrates how RecipeCard could be integrated for future features

import React from 'react';
import { RecipeCard } from '@/components/RecipeCard';
import { Recipe } from '@/types';

interface RecipeListProps {
  recipes: Recipe[];
  onRecipeSelect: (recipe: Recipe) => void;
  className?: string;
}

/**
 * RecipeList Component - Future Implementation Example
 *
 * This component demonstrates how the RecipeCard could be used
 * for features like:
 * - Recipe history/favorites
 * - Multiple recipe suggestions
 * - Recipe search results
 * - Recipe collections
 */
export function RecipeList({
  recipes,
  onRecipeSelect,
  className,
}: RecipeListProps) {
  if (recipes.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No recipes found</p>
      </div>
    );
  }

  return (
    <div
      className={`grid gap-4 md:grid-cols-2 lg:grid-cols-3 ${className || ''}`}
    >
      {recipes.map((recipe, index) => (
        <RecipeCard
          key={`${recipe.title}-${index}`}
          recipe={recipe}
          onClick={() => onRecipeSelect(recipe)}
          className="h-full"
        />
      ))}
    </div>
  );
}

// Potential future integration points:

// 1. Recipe History Page
// <RecipeList
//   recipes={savedRecipes}
//   onRecipeSelect={setSelectedRecipe}
// />

// 2. Multiple Recipe Suggestions
// <RecipeList
//   recipes={multipleRecipeSuggestions}
//   onRecipeSelect={setSelectedRecipe}
// />

// 3. Recipe Search Results
// <RecipeList
//   recipes={searchResults}
//   onRecipeSelect={setSelectedRecipe}
// />

export default RecipeList;
