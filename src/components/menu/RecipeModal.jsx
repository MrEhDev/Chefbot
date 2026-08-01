import React, { useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { X, Users, CheckCircle2 } from 'lucide-react';

export default function RecipeModal({ recipe, onClose }) {
  const diners = useAppStore((state) => state.userPreferences.diners);

  // Scale amount based on diners vs recipe base servings
  const scaleRatio = diners / recipe.servings;

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col relative z-10 animate-in zoom-in-95 duration-200">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 backdrop-blur text-white p-2 rounded-full transition-colors z-20"
        >
          <X size={20} />
        </button>

        <div className="relative h-64 shrink-0">
          <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 text-white">
            <span className="uppercase text-xs font-bold tracking-widest text-brand-sage mb-2">
              {recipe.mealType === 'lunch' ? 'Almuerzo' : 'Cena'}
            </span>
            <h2 className="text-3xl font-bold leading-tight">{recipe.title}</h2>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="flex items-center gap-2 mb-6 bg-orange-50 dark:bg-orange-900/20 text-brand-terracotta p-3 rounded-xl">
            <Users size={18} />
            <span className="font-medium text-sm">Cantidades calculadas para {diners} {diners === 1 ? 'persona' : 'personas'} (Base: {recipe.servings})</span>
          </div>

          <div className="grid sm:grid-cols-5 gap-8">
            <div className="sm:col-span-2 space-y-4">
              <h3 className="font-bold text-lg border-b dark:border-slate-700 pb-2">Ingredientes</h3>
              <ul className="space-y-3">
                {recipe.ingredients.map((ing, idx) => {
                  const scaledAmount = Number((ing.amount * scaleRatio).toFixed(1));
                  return (
                    <li key={idx} className="flex justify-between items-end border-b border-slate-100 dark:border-slate-800 pb-2 border-dashed">
                      <span className="text-slate-700 dark:text-slate-300 text-sm font-medium">{ing.name}</span>
                      <span className="text-slate-500 text-sm font-semibold">{scaledAmount} {ing.unit}</span>
                    </li>
                  )
                })}
              </ul>
            </div>
            
            <div className="sm:col-span-3 space-y-4">
              <h3 className="font-bold text-lg border-b dark:border-slate-700 pb-2">Preparación</h3>
              <ul className="space-y-4">
                {recipe.instructions.map((step, idx) => (
                  <li key={idx} className="flex gap-3">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-brand-sage text-brand-dark flex items-center justify-center text-xs font-bold mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
