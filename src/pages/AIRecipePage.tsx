import React, { useState } from 'react';
import { Camera, Upload, Clock, Users, ChefHat, ShoppingBag, Loader } from 'lucide-react';
import NavigationBar from '../components/NavigationBar';
import type { Recipe } from '../types/types';
import type { AIRecipePageProps } from '../types/types';

const AIRecipePage: React.FC<AIRecipePageProps> = ({ cartCount }) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_BASE_URL = 'http://localhost:9393';

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match(/image\/(jpeg|jpg|png)/)) {
      setError('Please upload a JPG or PNG image');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError('');
    setRecipe(null);
  };

  const generateRecipe = async () => {
    if (!selectedImage) {
      setError('Please select an image first');
      return;
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      setError('Please login to use AI recipe generation');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('image', selectedImage);

      const response = await fetch(`${API_BASE_URL}/api/ai/generate-recipe`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to generate recipe');
      }

      const data = await response.text();
      parseRecipeText(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate recipe');
    } finally {
      setLoading(false);
    }
  };

  const parseRecipeText = (text: string) => {
    try {
      const lines = text.split('\n').filter(line => line.trim() !== '');
  
      const recipe: Recipe = {
        recipe_name: '',
        ingredients: [],
        instructions: [],
        cooking_time: '',
        servings: ''
      };
  
      let currentSection = '';
  
      for (const line of lines) {
        const cleanLine = line.trim();
  
        // Recipe name (first line)
        if (cleanLine.startsWith('🍽️')) {
          recipe.recipe_name = cleanLine.replace('🍽️', '').trim();
        }
        // Cooking time
        else if (cleanLine.startsWith('️ Cooking Time:')) {
          recipe.cooking_time = cleanLine.split('Cooking Time:')[1].trim();
        }
        // Servings
        else if (cleanLine.startsWith('Servings:')) {
          recipe.servings = cleanLine.split('Servings:')[1].trim();
        }
        // Detect section switches
        else if (cleanLine.toUpperCase().includes('INGREDIENTS:')) {
          currentSection = 'ingredients';
        } 
        else if (cleanLine.toUpperCase().includes('INSTRUCTIONS:')) {
          currentSection = 'instructions';
        } 
        // Ingredients (• bullet)
        else if (currentSection === 'ingredients' && cleanLine.startsWith('•')) {
          recipe.ingredients.push(cleanLine.substring(1).trim());
        } 
        // Instructions (numbered)
        else if (currentSection === 'instructions' && /^\d+\./.test(cleanLine)) {
          recipe.instructions.push(cleanLine.replace(/^\d+\.\s*/, '').trim());
        }
      }
  
      setRecipe(recipe);
    } catch (error) {
      console.error('Error parsing recipe:', error);
      setError('Failed to parse recipe data');
    }
  };
  

  const addToShoppingList = async () => {
    if (!selectedImage || !recipe) return;

    const token = localStorage.getItem('authToken');
    if (!token) {
      setError('Please login to add to shopping list');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('image', selectedImage);

      const response = await fetch(`${API_BASE_URL}/api/shopping-list/add-from-recipe`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to add to shopping list');
      }

      alert('Ingredients added to shopping list!');
      
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to add to shopping list');
    }
  };

  const resetForm = () => {
    setSelectedImage(null);
    setPreviewUrl('');
    setRecipe(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Navigation Bar */}
      <NavigationBar cartCount={cartCount} />

      <div className="max-w-6xl mx-auto px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-block bg-orange-500 p-4 rounded-2xl mb-4">
            <ChefHat size={48} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI Recipe Generator
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Upload a photo of any dish and get instant recipes with ingredients and instructions powered by Google Gemini AI
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Food Image</h2>

            {!previewUrl ? (
              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center">
                    <Camera size={64} className="text-gray-400 mb-4" />
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      Click to upload
                    </p>
                    <p className="text-sm text-gray-600 mb-4">
                      JPG or PNG (Max 10MB)
                    </p>
                    <div className="flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-lg font-medium">
                      <Upload size={20} />
                      Choose Image
                    </div>
                  </div>
                </label>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-80 object-cover"
                  />
                  <button
                    onClick={resetForm}
                    className="absolute top-4 right-4 bg-white text-gray-700 px-4 py-2 rounded-lg text-sm font-medium shadow-lg hover:bg-gray-100"
                  >
                    Change Image
                  </button>
                </div>

                <button
                  onClick={generateRecipe}
                  disabled={loading}
                  className="w-full bg-orange-500 text-white py-4 px-6 rounded-lg text-lg font-semibold flex items-center justify-center gap-3 hover:bg-orange-600 disabled:bg-orange-400 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader size={24} className="animate-spin" />
                      Generating Recipe...
                    </>
                  ) : (
                    <>
                      <ChefHat size={24} />
                      Generate Recipe
                    </>
                  )}
                </button>
              </div>
            )}

            {error && (
              <div className="mt-4 bg-red-50 text-red-600 p-4 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Info Cards */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="bg-orange-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Camera size={20} className="text-orange-600" />
                  <span className="text-sm font-medium text-gray-900">AI Powered</span>
                </div>
                <p className="text-xs text-gray-600">Uses Google Gemini 2.0</p>
              </div>
              <div className="bg-green-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ShoppingBag size={20} className="text-green-600" />
                  <span className="text-sm font-medium text-gray-900">Smart Lists</span>
                </div>
                <p className="text-xs text-gray-600">Auto-add ingredients</p>
              </div>
            </div>
          </div>

          {/* Recipe Display Section */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Generated Recipe</h2>

            {!recipe ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <ChefHat size={64} className="text-gray-300 mb-4" />
                <p className="text-gray-600">
                  Upload an image and click "Generate Recipe" to see the magic happen!
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Recipe Header */}
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {recipe.recipe_name}
                  </h3>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock size={16} />
                      <span>{recipe.cooking_time || "30 minutes"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users size={16} />
                      <span>{recipe.servings || "4 servings"}</span>
                    </div>
                  </div>
                </div>

                {/* Ingredients */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Ingredients</h4>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <ul className="space-y-2">
                      {recipe.ingredients.map((ingredient, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="text-orange-500 font-bold">•</span>
                          <span>{ingredient}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Instructions */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Instructions</h4>
                  <div className="space-y-3">
                    {recipe.instructions.map((instruction, index) => (
                      <div key={index} className="flex gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                          {index + 1}
                        </div>
                        <p className="text-sm text-gray-700 pt-1">{instruction}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={addToShoppingList}
                    className="flex-1 bg-green-500 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-green-600"
                  >
                    <ShoppingBag size={20} />
                    Add to Shopping List
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200"
                  >
                    Print
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-16 bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload size={32} className="text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">1. Upload Image</h3>
              <p className="text-sm text-gray-600">
                Take a photo or upload an image of any dish you want to recreate
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ChefHat size={32} className="text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">2. AI Analysis</h3>
              <p className="text-sm text-gray-600">
                Our AI analyzes the dish and generates a detailed recipe
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag size={32} className="text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">3. Cook & Enjoy</h3>
              <p className="text-sm text-gray-600">
                Add ingredients to your shopping list and start cooking!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIRecipePage;