import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { ChevronRight, ChevronLeft, Users, Calendar, CheckCircle2, Loader2 } from 'lucide-react';
import { isRecipeAllowed } from '../../utils/dietFilters';

export default function OnboardingWizard() {
  const [step, setStep] = useState(1);
  const updatePreferences = useAppStore((state) => state.updatePreferences);
  const completeOnboarding = useAppStore((state) => state.completeOnboarding);
  const setGeneratedMenu = useAppStore((state) => state.setGeneratedMenu);

  // Local state for wizard
  const [diners, setDiners] = useState(2);
  const [days, setDays] = useState(7);
  const [likedRecipes, setLikedRecipes] = useState([]);
  
  // Mixed recipes for step 2
  const [tasteOptions, setTasteOptions] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const favoriteRecipes = useAppStore((state) => state.favoriteRecipes);
  const cloudRecipes = useAppStore((state) => state.cloudRecipes);
  const deletedRecipes = useAppStore((state) => state.deletedRecipes) || [];

  useEffect(() => {
    if (step === 2 && tasteOptions.length === 0) {
      const loadOptions = async () => {
        setLoadingOptions(true);
        const mealTypeOverrides = useAppStore.getState().mealTypeOverrides;
        let local = [...cloudRecipes].filter(r => (mealTypeOverrides[r.id] || r.mealType) !== 'dessert').sort(() => 0.5 - Math.random());
        setTasteOptions(local.slice(0, 50));
        setLoadingOptions(false);
      };
      loadOptions();
    }
  }, [step, cloudRecipes]);

  const handleNext = () => setStep(step + 1);
  const handlePrev = () => setStep(step - 1);

  const toggleLike = (id) => {
    setLikedRecipes(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
  };

  const generateMenu = () => {
    // Diets removed, pass empty array
    updatePreferences({ diners, days, diets: [], tasteLikes: likedRecipes });

    const mealTypeOverrides = useAppStore.getState().mealTypeOverrides;

    let allAvailable = [...cloudRecipes].filter(r => !deletedRecipes.includes(r.id));
      
    // Remove duplicates by id
    const uniqueAvailable = Array.from(new Map(allAvailable.map(item => [item.id, item])).values());
    
    // Split into favorites and others
    const favorites = uniqueAvailable.filter(r => favoriteRecipes.includes(r.id) || likedRecipes.includes(r.id));
    const others = uniqueAvailable.filter(r => !favoriteRecipes.includes(r.id) && !likedRecipes.includes(r.id));

    const getMealType = (r) => mealTypeOverrides[r.id] || r.mealType;

    const favLunches = favorites.filter(r => getMealType(r) === 'lunch' || getMealType(r) === 'both');
    const favDinners = favorites.filter(r => getMealType(r) === 'dinner' || getMealType(r) === 'both');
    
    const otherLunches = others.filter(r => getMealType(r) === 'lunch' || getMealType(r) === 'both');
    const otherDinners = others.filter(r => getMealType(r) === 'dinner' || getMealType(r) === 'both');
    
    // Fallbacks if empty
    if (otherLunches.length === 0) otherLunches.push(...favLunches);
    if (otherDinners.length === 0) otherDinners.push(...favDinners);
    
    const menu = [];
    for (let i = 1; i <= days; i++) {
      // 50% chance to pick a favorite if available
      const useFavLunch = favLunches.length > 0 && Math.random() > 0.5;
      const useFavDinner = favDinners.length > 0 && Math.random() > 0.5;

      const lunchPool = useFavLunch ? favLunches : otherLunches;
      const dinnerPool = useFavDinner ? favDinners : otherDinners;

      // Safe fallback
      const finalLunchPool = lunchPool.length > 0 ? lunchPool : uniqueAvailable.filter(r => getMealType(r) === 'lunch' || getMealType(r) === 'both');
      const finalDinnerPool = dinnerPool.length > 0 ? dinnerPool : uniqueAvailable.filter(r => getMealType(r) === 'dinner' || getMealType(r) === 'both');

      // If still empty, use fallback recipe
      const safeFallbackLunch = uniqueAvailable.find(r => getMealType(r) === 'lunch' || getMealType(r) === 'both') || cloudRecipes[0];
      const safeFallbackDinner = uniqueAvailable.find(r => getMealType(r) === 'dinner' || getMealType(r) === 'both') || cloudRecipes[0];
      
      let lunch, dinner;
      if (finalLunchPool.length > 0) {
        const index = Math.floor(Math.random() * finalLunchPool.length);
        lunch = finalLunchPool.splice(index, 1)[0];
      } else {
        lunch = safeFallbackLunch;
      }

      if (finalDinnerPool.length > 0) {
        const index = Math.floor(Math.random() * finalDinnerPool.length);
        dinner = finalDinnerPool.splice(index, 1)[0];
      } else {
        dinner = safeFallbackDinner;
      }
      
      menu.push({ day: i, lunch: lunch.id, dinner: dinner.id });
    }
    
    setGeneratedMenu(menu);
    completeOnboarding();
  };

  return (
    <div className="card p-6 sm:p-10 max-w-2xl mx-auto mt-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          {step === 1 && "Empecemos con lo básico"}
          {step === 2 && "¿Qué te apetece más?"}
        </h2>
        <span className="text-sm font-medium text-brand-terracotta bg-orange-100 dark:bg-orange-900/30 px-3 py-1 rounded-full">
          Paso {step} de 2
        </span>
      </div>

      {step === 1 && (
        <div className="space-y-8">
          <div>
            <label className="flex items-center gap-2 text-lg font-medium mb-3">
              <Users size={20} className="text-brand-terracotta" /> ¿Para cuántas personas cocinamos?
            </label>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setDiners(Math.max(1, diners - 1))}
                className="w-12 h-12 rounded-full border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center text-xl font-bold hover:border-brand-terracotta transition-colors"
              >-</button>
              <span className="text-3xl font-bold w-12 text-center">{diners}</span>
              <button 
                onClick={() => setDiners(diners + 1)}
                className="w-12 h-12 rounded-full border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center text-xl font-bold hover:border-brand-terracotta transition-colors"
              >+</button>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-lg font-medium mb-3">
              <Calendar size={20} className="text-brand-terracotta" /> ¿Para cuántos días?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[1, 7, 14, 30].map(d => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  className={`p-3 rounded-xl border-2 transition-all font-medium ${
                    days === d 
                      ? 'border-brand-terracotta bg-orange-50 dark:bg-orange-900/20 text-brand-terracotta' 
                      : 'border-slate-200 dark:border-slate-700 hover:border-brand-mint'
                  }`}
                >
                  {d} {d === 1 ? 'día' : 'días'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <p className="text-slate-600 dark:text-slate-400">Selecciona los platos que más te llamen la atención para calibrar tus gustos (mínimo 2).</p>
          
          {loadingOptions ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="animate-spin text-brand-terracotta" size={32} />
              <span className="ml-3 text-slate-500 font-medium">Buscando nuevas recetas...</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[50vh] overflow-y-auto pr-2">
              {tasteOptions.map(recipe => (
                <div 
                  key={recipe.id}
                  onClick={() => toggleLike(recipe.id)}
                  className={`relative rounded-xl overflow-hidden cursor-pointer border-4 transition-all ${
                    likedRecipes.includes(recipe.id) ? 'border-brand-terracotta' : 'border-transparent'
                  }`}
                >
                  <img src={recipe.image} alt={recipe.title} className="w-full h-32 object-cover bg-slate-200" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-2">
                    <span className="text-white font-medium text-xs line-clamp-2 leading-tight">{recipe.title}</span>
                  </div>
                  {likedRecipes.includes(recipe.id) && (
                    <div className="absolute top-2 right-2 bg-brand-terracotta text-white rounded-full p-1 shadow-md">
                      <CheckCircle2 size={16} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex justify-between mt-10 pt-6 border-t border-slate-100 dark:border-slate-800">
        <button 
          onClick={handlePrev}
          className={`flex items-center gap-2 font-medium px-4 py-2 rounded-lg transition-colors ${
            step === 1 ? 'invisible' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ChevronLeft size={18} /> Atrás
        </button>
        
        {step < 2 ? (
          <button onClick={handleNext} className="btn-primary flex items-center gap-2">
            Siguiente <ChevronRight size={18} />
          </button>
        ) : (
          <button 
            onClick={generateMenu} 
            disabled={likedRecipes.length < 2 || loadingOptions}
            className={`btn-primary flex items-center gap-2 ${likedRecipes.length < 2 || loadingOptions ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Generar Menú 🎉
          </button>
        )}
      </div>
    </div>
  );
}
