'use client'

import React, { useState } from 'react'
import { Check, Clock, Users, ChefHat, Lightbulb, Share2, Printer } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Recipe } from '@/types'
import { Button } from './ui/Button'
import { APP_CONFIG } from '@/lib/constants'

interface RecipeDisplayProps {
  recipe: Recipe | null
  className?: string
}

export function RecipeDisplay({ recipe, className }: RecipeDisplayProps) {
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set())
  const [checkedInstructions, setCheckedInstructions] = useState<Set<number>>(new Set())

  if (!recipe) {
    return (
      <div className={cn('text-center py-12', className)}>
        <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <ChefHat className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Recipe Yet</h3>
        <p className="text-gray-500">
          Upload a photo of your fridge to get started with AI-powered recipe suggestions!
        </p>
      </div>
    )
  }

  const toggleIngredient = (index: number) => {
    const newChecked = new Set(checkedIngredients)
    if (newChecked.has(index)) {
      newChecked.delete(index)
    } else {
      newChecked.add(index)
    }
    setCheckedIngredients(newChecked)
  }

  const toggleInstruction = (index: number) => {
    const newChecked = new Set(checkedInstructions)
    if (newChecked.has(index)) {
      newChecked.delete(index)
    } else {
      newChecked.add(index)
    }
    setCheckedInstructions(newChecked)
  }

  const getDifficultyColor = (difficulty: Recipe['difficulty']) => {
    return APP_CONFIG.DIFFICULTY_COLORS[difficulty] || 'text-gray-600 bg-gray-50'
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: recipe.title,
          text: `Check out this recipe: ${recipe.title} - ${recipe.description}`,
          url: window.location.href,
        })
      } catch {
        // User cancelled share or share failed
        handleCopyLink()
      }
    } else {
      handleCopyLink()
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      // You could add a toast notification here
      alert('Link copied to clipboard!')
    } catch (error) {
      console.error('Failed to copy link:', error)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className={cn('max-w-4xl mx-auto space-y-6', className)}>
      {/* Recipe Header */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              {recipe.title}
            </h1>
            <p className="text-gray-600 text-lg mb-4">
              {recipe.description}
            </p>
            
            {/* Recipe Meta Info */}
            <div className="flex flex-wrap gap-4 text-sm">
              {recipe.cookingTime && (
                <div className="flex items-center gap-1 text-gray-600">
                  <Clock size={16} />
                  <span>{recipe.cookingTime}</span>
                </div>
              )}
              
              {recipe.servings && (
                <div className="flex items-center gap-1 text-gray-600">
                  <Users size={16} />
                  <span>{recipe.servings} servings</span>
                </div>
              )}
              
              {recipe.difficulty && (
                <span className={cn(
                  'px-2 py-1 rounded-full text-xs font-medium',
                  getDifficultyColor(recipe.difficulty)
                )}>
                  {recipe.difficulty}
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<Share2 size={16} />}
              onClick={handleShare}
            >
              Share
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={<Printer size={16} />}
              onClick={handlePrint}
            >
              Print
            </Button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Ingredients Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ChefHat size={20} />
              Ingredients
            </h2>
            <div className="space-y-3">
              {recipe.ingredients.map((ingredient, index) => (
                <label
                  key={index}
                  className="flex items-start gap-3 cursor-pointer group"
                >
                  <div className="relative mt-0.5">
                    <input
                      type="checkbox"
                      checked={checkedIngredients.has(index)}
                      onChange={() => toggleIngredient(index)}
                      className="sr-only"
                    />
                    <div className={cn(
                      'w-5 h-5 border-2 rounded flex items-center justify-center transition-all',
                      checkedIngredients.has(index)
                        ? 'bg-orange-500 border-orange-500 text-white'
                        : 'border-gray-300 group-hover:border-orange-400'
                    )}>
                      {checkedIngredients.has(index) && (
                        <Check size={12} />
                      )}
                    </div>
                  </div>
                  <span className={cn(
                    'text-gray-700 leading-5 transition-all',
                    checkedIngredients.has(index) && 'line-through text-gray-400'
                  )}>
                    {ingredient}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Instructions Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Instructions
            </h2>
            <div className="space-y-4">
              {recipe.instructions.map((instruction, index) => (
                <div
                  key={index}
                  className="flex gap-4 group"
                >
                  <div className="flex-shrink-0">
                    <button
                      onClick={() => toggleInstruction(index)}
                      className={cn(
                        'w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-all',
                        checkedInstructions.has(index)
                          ? 'bg-orange-500 border-orange-500 text-white'
                          : 'border-gray-300 text-gray-600 hover:border-orange-400 hover:text-orange-600'
                      )}
                    >
                      {checkedInstructions.has(index) ? (
                        <Check size={14} />
                      ) : (
                        index + 1
                      )}
                    </button>
                  </div>
                  <p className={cn(
                    'text-gray-700 leading-relaxed flex-1 pt-1',
                    checkedInstructions.has(index) && 'line-through text-gray-400'
                  )}>
                    {instruction}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tips Section */}
      {recipe.tips && recipe.tips.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-amber-900 mb-3 flex items-center gap-2">
            <Lightbulb size={20} />
            Chef&apos;s Tips
          </h3>
          <ul className="space-y-2">
            {recipe.tips.map((tip, index) => (
              <li key={index} className="text-amber-800 flex gap-2">
                <span className="text-amber-600 mt-1">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Bar - Sticky on mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-4 space-y-2">
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            icon={<Share2 size={16} />}
            onClick={handleShare}
          >
            Share
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            icon={<Printer size={16} />}
            onClick={handlePrint}
          >
            Print
          </Button>
        </div>
      </div>
    </div>
  )
}
