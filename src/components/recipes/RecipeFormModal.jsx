import React, { useState } from 'react';
import { X, Plus, Trash2, Camera, Check, Link as LinkIcon, Loader2 } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { addRecipeToDB } from '../../services/apiFirebase';

export default function RecipeFormModal({ onClose }) {
  const cloudRecipes = useAppStore(state => state.cloudRecipes);
  const setCloudRecipes = useAppStore(state => state.setCloudRecipes);
  const [importUrl, setImportUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    image: '',
    mealType: 'lunch',
    servings: 2,
    tags: [],
    ingredients: [{ name: '', amount: 1, unit: 'ud', category: 'Otros' }],
    instructions: ['']
  });

  const handleImportFromUrl = async () => {
    if (!importUrl) return;
    setIsImporting(true);
    setImportError('');
    
    try {
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(importUrl)}`;
      const res = await fetch(proxyUrl);
      if (!res.ok) throw new Error("No se pudo cargar la página");
      
      const htmlText = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlText, "text/html");
      
      const scripts = doc.querySelectorAll('script[type="application/ld+json"]');
      let recipeData = null;
      
      for (const script of scripts) {
        try {
          const json = JSON.parse(script.textContent);
          
          if (json['@type'] === 'Recipe') {
            recipeData = json;
            break;
          } else if (Array.isArray(json)) {
            recipeData = json.find(item => item['@type'] === 'Recipe');
            if (recipeData) break;
          } else if (json['@graph']) {
            recipeData = json['@graph'].find(item => item['@type'] === 'Recipe');
            if (recipeData) break;
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
      
      if (!recipeData) {
        throw new Error("No se encontró formato de receta estándar en esta web.");
      }
      
      // Extract data
      let title = recipeData.name || '';
      let image = '';
      if (typeof recipeData.image === 'string') image = recipeData.image;
      else if (Array.isArray(recipeData.image)) image = recipeData.image[0];
      else if (recipeData.image && recipeData.image.url) image = recipeData.image.url;
      
      const servingsString = recipeData.recipeYield || '';
      const servings = parseInt(servingsString) || 4;
      
      // Parse Ingredients
      const rawIngredients = recipeData.recipeIngredient || [];
      const ingredients = rawIngredients.length > 0 
        ? rawIngredients.map(ing => ({ name: ing, amount: 1, unit: 'ud', category: 'Otros' }))
        : [{ name: '', amount: 1, unit: 'ud', category: 'Otros' }];
        
      // Parse Instructions
      let instructions = [];
      const rawInstructions = recipeData.recipeInstructions || [];
      if (Array.isArray(rawInstructions)) {
        instructions = rawInstructions.map(step => typeof step === 'string' ? step : (step.text || step.name));
      } else if (typeof rawInstructions === 'string') {
        instructions = [rawInstructions];
      }
      
      if (instructions.length === 0) instructions = [''];
      
      setFormData(prev => ({
        ...prev,
        title,
        image,
        servings,
        ingredients,
        instructions
      }));
      
    } catch (err) {
      setImportError(err.message || "Hubo un error importando la receta.");
    } finally {
      setIsImporting(false);
    }
  };

  const handleAddIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: '', amount: 1, unit: 'ud', category: 'Otros' }]
    }));
  };

  const handleRemoveIngredient = (index) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index][field] = field === 'amount' ? Number(value) : value;
    setFormData({ ...formData, ingredients: newIngredients });
  };

  const handleAddInstruction = () => {
    setFormData(prev => ({ ...prev, instructions: [...prev.instructions, ''] }));
  };

  const handleRemoveInstruction = (index) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index)
    }));
  };

  const handleInstructionChange = (index, value) => {
    const newInstructions = [...formData.instructions];
    newInstructions[index] = value;
    setFormData({ ...formData, instructions: newInstructions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newRecipe = {
      ...formData,
      id: `custom_${Date.now()}`,
      // Filter out empty ingredients/instructions
      ingredients: formData.ingredients.filter(i => i.name.trim() !== ''),
      instructions: formData.instructions.filter(i => i.trim() !== ''),
      image: formData.image || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&q=80&w=400&h=300'
    };
    
    // Optimistic update
    setCloudRecipes([...cloudRecipes, newRecipe]);
    
    // Save to DB
    await addRecipeToDB(newRecipe);
    
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col relative z-10 animate-in zoom-in-95 duration-200">
        
        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <h2 className="text-2xl font-bold text-brand-terracotta">Añadir Nueva Receta</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-8">
          
          {/* Importador Mágico */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl space-y-3 border border-slate-100 dark:border-slate-700">
            <h3 className="font-bold flex items-center gap-2 text-brand-terracotta">
              <LinkIcon size={18} /> Importador Mágico ✨
            </h3>
            <p className="text-sm text-slate-500">Pega el enlace de un blog de recetas (pequerecetas.com, directoalpaladar.com, etc) y lo rellenaremos por ti.</p>
            <div className="flex gap-2">
              <input 
                type="url" 
                value={importUrl} 
                onChange={e => setImportUrl(e.target.value)} 
                className="flex-1 p-2.5 rounded-lg border dark:border-slate-700 bg-white dark:bg-slate-900" 
                placeholder="https://..." 
              />
              <button 
                onClick={handleImportFromUrl} 
                disabled={isImporting || !importUrl}
                className="btn-primary whitespace-nowrap disabled:opacity-50"
              >
                {isImporting ? <Loader2 className="animate-spin" size={18} /> : 'Extraer Datos'}
              </button>
            </div>
            {importError && <p className="text-red-500 text-sm mt-1">{importError}</p>}
          </div>

          <form id="recipe-form" onSubmit={handleSubmit} className="space-y-8">
            {/* Basics */}
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">Datos Básicos</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre del plato *</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-2.5 rounded-lg border dark:border-slate-700 bg-transparent" placeholder="Ej. Macarrones con tomate" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">URL de la imagen (Opcional)</label>
                <div className="flex gap-2">
                  <div className="flex items-center justify-center w-10 shrink-0 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <Camera size={18} className="text-slate-400" />
                  </div>
                  <input type="url" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="w-full p-2.5 rounded-lg border dark:border-slate-700 bg-transparent" placeholder="https://..." />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tipo de Comida</label>
                <select value={formData.mealType} onChange={e => setFormData({...formData, mealType: e.target.value})} className="w-full p-2.5 rounded-lg border dark:border-slate-700 bg-transparent">
                  <option value="lunch">Almuerzo</option>
                  <option value="dinner">Cena</option>
                  <option value="dessert">Postres y Otros</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Raciones (Comensales base) *</label>
                <input required type="number" min="1" value={formData.servings} onChange={e => setFormData({...formData, servings: Number(e.target.value)})} className="w-full p-2.5 rounded-lg border dark:border-slate-700 bg-transparent" />
              </div>
            </div>
          </div>

          {/* Ingredients */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">Ingredientes</h3>
              <button type="button" onClick={handleAddIngredient} className="text-brand-sage flex items-center gap-1 text-sm font-medium hover:text-green-600 transition-colors">
                <Plus size={16} /> Añadir
              </button>
            </div>
            
            {formData.ingredients.map((ing, idx) => (
              <div key={idx} className="flex gap-2 items-start">
                <input required type="text" placeholder="Nombre" value={ing.name} onChange={e => handleIngredientChange(idx, 'name', e.target.value)} className="flex-1 p-2 rounded-lg border dark:border-slate-700 bg-transparent min-w-[100px]" />
                <input required type="number" step="0.1" min="0" value={ing.amount} onChange={e => handleIngredientChange(idx, 'amount', e.target.value)} className="w-20 p-2 rounded-lg border dark:border-slate-700 bg-transparent" />
                <select value={ing.unit} onChange={e => handleIngredientChange(idx, 'unit', e.target.value)} className="w-24 p-2 rounded-lg border dark:border-slate-700 bg-transparent">
                  <option value="ud">Unidades</option>
                  <option value="g">Gramos</option>
                  <option value="ml">Mililitros</option>
                  <option value="cda">Cdas</option>
                  <option value="cdta">Cdtas</option>
                  <option value="cup">Tazas</option>
                  <option value="pizca">Pizca</option>
                  <option value="loncha">Lonchas</option>
                </select>
                <select value={ing.category} onChange={e => handleIngredientChange(idx, 'category', e.target.value)} className="w-32 p-2 rounded-lg border dark:border-slate-700 bg-transparent hidden sm:block">
                  <option value="Frutas y Verduras">Frutas/Verd</option>
                  <option value="Carnes">Carnes</option>
                  <option value="Pescados">Pescados</option>
                  <option value="Lácteos y Huevos">Lácteos/Huevos</option>
                  <option value="Despensa y Panadería">Despensa</option>
                  <option value="Especias">Especias</option>
                  <option value="Otros">Otros</option>
                </select>
                <button type="button" onClick={() => handleRemoveIngredient(idx)} className="p-2.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          {/* Instructions */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">Preparación</h3>
              <button type="button" onClick={handleAddInstruction} className="text-brand-sage flex items-center gap-1 text-sm font-medium hover:text-green-600 transition-colors">
                <Plus size={16} /> Añadir Paso
              </button>
            </div>
            
            <div className="space-y-3">
              {formData.instructions.map((inst, idx) => (
                <div key={idx} className="flex gap-2">
                  <span className="shrink-0 w-8 h-10 flex items-center justify-center font-bold text-slate-400">{idx + 1}.</span>
                  <input required type="text" placeholder="Instrucción del paso..." value={inst} onChange={e => handleInstructionChange(idx, e.target.value)} className="flex-1 p-2 rounded-lg border dark:border-slate-700 bg-transparent" />
                  <button type="button" onClick={() => handleRemoveInstruction(idx)} className="p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
          </form>
        </div>
        
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-slate-900 p-6">
          <button type="button" onClick={onClose} className="px-5 py-2 font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">Cancelar</button>
          <button type="submit" form="recipe-form" className="btn-primary flex items-center gap-2">
            <Check size={18} /> Guardar Receta
          </button>
        </div>

      </div>
    </div>
  );
}
