'use client';

import React, { useState } from 'react';
import { ChefHat, Sparkles, Camera, Utensils } from 'lucide-react';
import { FridgeUploader } from '@/components/FridgeUploader';
import { RecipeDisplay } from '@/components/RecipeDisplay';
import { Recipe } from '@/types';

export default function Home() {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRecipeGenerated = (newRecipe: Recipe) => {
    setRecipe(newRecipe);
    setError(null);

    // Scroll to recipe section on mobile
    setTimeout(() => {
      const recipeSection = document.getElementById('recipe-section');
      if (recipeSection) {
        recipeSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setRecipe(null);
  };

  const handleStartOver = () => {
    setRecipe(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">El Hornito</h1>
                <p className="text-xs text-gray-500">Fridge to Recipe AI</p>
              </div>
            </div>

            {recipe && (
              <button
                onClick={handleStartOver}
                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                Start Over
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!recipe ? (
          <>
            {/* Hero Section */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Sparkles size={16} />
                Powered by Claude AI
              </div>

              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Transform Your{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">
                  Fridge
                </span>{' '}
                Into Amazing Recipes
              </h1>

              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                Upload a photo of your fridge contents and let our AI chef
                create personalized recipes that make the most of what you
                already have. No more food waste, just delicious meals!
              </p>

              {/* Feature Pills */}
              <div className="flex flex-wrap justify-center gap-4 mb-12">
                <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm border">
                  <Camera className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-medium text-gray-700">
                    Photo Analysis
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm border">
                  <Sparkles className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-medium text-gray-700">
                    AI-Powered
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm border">
                  <Utensils className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-medium text-gray-700">
                    Custom Recipes
                  </span>
                </div>
              </div>
            </div>

            {/* Upload Section */}
            <div className="max-w-2xl mx-auto">
              <FridgeUploader
                onRecipeGenerated={handleRecipeGenerated}
                onError={handleError}
                className="bg-white rounded-2xl shadow-sm border p-8"
              />
            </div>

            {/* Error Display */}
            {error && (
              <div className="max-w-2xl mx-auto mt-6">
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-4 h-4 text-red-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-red-800">
                        Something went wrong
                      </h3>
                      <p className="text-sm text-red-700 mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* How It Works Section */}
            <div className="mt-20 text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-12">
                How It Works
              </h2>

              <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    1. Take a Photo
                  </h3>
                  <p className="text-gray-600">
                    Snap a clear photo of your fridge contents or pantry items
                  </p>

                  {/* Connection Line */}
                  <div className="hidden md:block absolute top-8 left-full w-8 h-0.5 bg-gradient-to-r from-orange-300 to-transparent"></div>
                </div>

                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    2. AI Analysis
                  </h3>
                  <p className="text-gray-600">
                    Our AI identifies ingredients and considers your preferences
                  </p>

                  {/* Connection Line */}
                  <div className="hidden md:block absolute top-8 left-full w-8 h-0.5 bg-gradient-to-r from-orange-300 to-transparent"></div>
                </div>

                <div>
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <ChefHat className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    3. Get Recipe
                  </h3>
                  <p className="text-gray-600">
                    Receive a personalized recipe with step-by-step instructions
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Recipe Results Section */
          <div id="recipe-section">
            <RecipeDisplay recipe={recipe} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <ChefHat className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-gray-900">El Hornito</span>
            </div>
            <p className="text-gray-600 text-sm">
              Transforming fridges into feasts with the power of AI
            </p>
            <p className="text-gray-400 text-xs mt-2">
              Powered by Claude AI • Made with ❤️ for food lovers
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
