import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import recipesData from '../../data/recipes.json';
import RecipeCard from './RecipeCard';
import RecipeModal from './RecipeModal';
import { RefreshCw, Save } from 'lucide-react';

export default function MenuViewer() {
  const generatedMenu = useAppStore((state) => state.generatedMenu);
  const updateMeal = useAppStore((state) => state.updateMeal);
  const customRecipes = useAppStore((state) => state.customRecipes);
  const resetOnboarding = useAppStore((state) => state.resetOnboarding);
  const deletedRecipes = useAppStore((state) => state.deletedRecipes) || [];
  const swapMeals = useAppStore((state) => state.swapMeals);
  const mealTypeOverrides = useAppStore((state) => state.mealTypeOverrides);
  const [selectedRecipeId, setSelectedRecipeId] = useState(null);

  const allRecipes = [...recipesData, ...customRecipes].filter(r => !deletedRecipes.includes(r.id));

  const getRecipe = (id) => allRecipes.find(r => r.id === id) || recipesData[0]; // fallback if api/custom recipe missing

  const swapRecipe = (day, mealType, currentRecipeId) => {
    const available = allRecipes.filter(r => {
      const type = mealTypeOverrides[r.id] || r.mealType;
      return (type === mealType || type === 'both') && r.id !== currentRecipeId;
    });
    if (available.length > 0) {
      const newRecipe = available[Math.floor(Math.random() * available.length)];
      updateMeal(day, mealType, newRecipe.id);
    }
  };

  const handleDragStart = (e, day, type) => {
    e.dataTransfer.setData("text/plain", JSON.stringify({ day, type }));
    e.target.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = (e, targetDay, targetType) => {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData("text/plain"));
      if (data.day !== targetDay || data.type !== targetType) {
        swapMeals(data.day, data.type, targetDay, targetType);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Tu Menú Semanal</h2>
          <p className="text-slate-500 mt-1">Recetas adaptadas a tus preferencias</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => {
              if (window.confirm('¿Estás seguro de que quieres borrar tu menú actual y volver a empezar?')) {
                resetOnboarding();
              }
            }} 
            className="px-4 py-2 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 font-medium rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors shadow-sm"
          >
            Reiniciar Menú
          </button>
          <button className="btn-primary flex items-center gap-2">
            <Save size={18} /> Guardar
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {generatedMenu.map((dayPlan) => {
          const lunch = getRecipe(dayPlan.lunch);
          const dinner = getRecipe(dayPlan.dinner);
          
          return (
            <div key={dayPlan.day} className="card p-5">
              <h3 className="text-xl font-semibold mb-4 border-b border-slate-100 dark:border-slate-700 pb-2">
                Día {dayPlan.day}
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                {lunch && (
                  <div 
                    className="space-y-2" 
                    onDragOver={handleDragOver} 
                    onDrop={(e) => handleDrop(e, dayPlan.day, 'lunch')}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-brand-terracotta uppercase tracking-wider">Almuerzo</span>
                      <button 
                        onClick={() => swapRecipe(dayPlan.day, 'lunch', lunch.id)}
                        className="text-slate-400 hover:text-brand-terracotta transition-colors flex items-center gap-1 text-xs font-medium"
                      >
                        <RefreshCw size={12} /> Cambiar
                      </button>
                    </div>
                    <div 
                      draggable 
                      onDragStart={(e) => handleDragStart(e, dayPlan.day, 'lunch')}
                      onDragEnd={handleDragEnd}
                      className="cursor-move"
                    >
                      <RecipeCard recipe={lunch} onClick={() => setSelectedRecipeId(lunch.id)} />
                    </div>
                  </div>
                )}
                
                {dinner && (
                  <div 
                    className="space-y-2" 
                    onDragOver={handleDragOver} 
                    onDrop={(e) => handleDrop(e, dayPlan.day, 'dinner')}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-brand-sage uppercase tracking-wider">Cena</span>
                      <button 
                        onClick={() => swapRecipe(dayPlan.day, 'dinner', dinner.id)}
                        className="text-slate-400 hover:text-brand-sage transition-colors flex items-center gap-1 text-xs font-medium"
                      >
                        <RefreshCw size={12} /> Cambiar
                      </button>
                    </div>
                    <div 
                      draggable 
                      onDragStart={(e) => handleDragStart(e, dayPlan.day, 'dinner')}
                      onDragEnd={handleDragEnd}
                      className="cursor-move"
                    >
                      <RecipeCard recipe={dinner} onClick={() => setSelectedRecipeId(dinner.id)} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {selectedRecipeId && (
        <RecipeModal 
          recipe={getRecipe(selectedRecipeId)} 
          onClose={() => setSelectedRecipeId(null)} 
        />
      )}
    </div>
  );
}
