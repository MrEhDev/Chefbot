import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Search, Heart, Trash2 } from 'lucide-react';
import RecipeModal from '../menu/RecipeModal';
import { deleteRecipeFromDB } from '../../services/apiFirebase';

export default function RecipeCatalog() {
  const { 
    cloudRecipes,
    setCloudRecipes,
    favoriteRecipes, 
    toggleFavorite, 
    deletedRecipes = [], 
    deleteRecipe,
    mealTypeOverrides,
    setMealTypeOverride,
    isAdmin
  } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecipeId, setSelectedRecipeId] = useState(null);

  const allRecipes = [...cloudRecipes].filter(r => !deletedRecipes.includes(r.id));

  const filteredRecipes = allRecipes.filter(recipe => 
    recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipe.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getRecipe = (id) => allRecipes.find(r => r.id === id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Catálogo de Recetas</h2>
          <p className="text-slate-500 mt-1">Explora {allRecipes.length} recetas y marca tus favoritas</p>
        </div>
      </div>

      {/* Buscador */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="text-slate-400" size={20} />
        </div>
        <input
          type="text"
          className="block w-full pl-10 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-sage outline-none transition-shadow"
          placeholder="Buscar por nombre o ingrediente..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Grid de Recetas */}
      {filteredRecipes.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          No se encontraron recetas con "{searchQuery}"
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map((recipe) => {
            const isFavorite = favoriteRecipes.includes(recipe.id);
            return (
              <div 
                key={recipe.id}
                className="card overflow-hidden group cursor-pointer hover:-translate-y-1 transition-all duration-300"
                onClick={() => setSelectedRecipeId(recipe.id)}
              >
                <div className="relative h-48">
                  <img 
                    src={recipe.image} 
                    alt={recipe.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(recipe.id);
                    }}
                    className="absolute top-3 right-3 p-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur rounded-full hover:scale-110 transition-transform shadow-sm"
                  >
                    <Heart 
                      size={20} 
                      className={isFavorite ? "fill-red-500 text-red-500" : "text-slate-400"} 
                    />
                  </button>
                  {isAdmin && (
                    <button 
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (window.confirm(`¿Estás seguro de que quieres eliminar "${recipe.title}" del catálogo GLOBALMENTE? No volverá a aparecer para ningún usuario.`)) {
                          const success = await deleteRecipeFromDB(recipe.id);
                          if (success) {
                            setCloudRecipes(cloudRecipes.filter(r => r.id !== recipe.id));
                          }
                        }
                      }}
                      className="absolute top-3 left-3 p-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur rounded-full hover:bg-red-50 hover:text-red-500 transition-colors shadow-sm text-red-400"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                  <div className="absolute bottom-3 left-3 flex gap-2">
                    <select
                      onClick={(e) => e.stopPropagation()}
                      value={mealTypeOverrides[recipe.id] || recipe.mealType}
                      onChange={(e) => {
                        e.stopPropagation();
                        setMealTypeOverride(recipe.id, e.target.value);
                      }}
                      className="px-2 py-1 text-xs font-semibold bg-white/95 dark:bg-slate-900/95 text-brand-terracotta rounded-md shadow-sm border-0 outline-none cursor-pointer appearance-none pr-6 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2210%22%20height%3D%2210%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23e67e22%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_0.2rem_center]"
                    >
                      <option value="lunch">☀️ Comida</option>
                      <option value="dinner">🌙 Cena</option>
                      <option value="both">☀️🌙 Ambas</option>
                    </select>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 line-clamp-1">{recipe.title}</h3>
                  <p className="text-slate-500 text-sm mt-1">{recipe.ingredients.length} ingredientes</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedRecipeId && (
        <RecipeModal 
          recipe={getRecipe(selectedRecipeId)} 
          onClose={() => setSelectedRecipeId(null)}
          onSwap={null}
        />
      )}
    </div>
  );
}
