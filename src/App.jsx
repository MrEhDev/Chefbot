import React, { useState, useEffect } from 'react';
import Header from './components/layout/Header';
import OnboardingWizard from './components/wizard/OnboardingWizard';
import MenuViewer from './components/menu/MenuViewer';
import ShoppingList from './components/shopping/ShoppingList';
import RecipeCatalog from './components/recipes/RecipeCatalog';
import RecipeFormModal from './components/recipes/RecipeFormModal';
import { useAppStore } from './store/useAppStore';
import { fetchRecipesFromDB } from './services/apiFirebase';

function App() {
  const hasCompletedOnboarding = useAppStore((state) => state.hasCompletedOnboarding);
  const { setCloudRecipes, isLoadingRecipes, setIsLoadingRecipes } = useAppStore();
  const [currentTab, setCurrentTab] = useState('menu');

  useEffect(() => {
    async function loadRecipes() {
      setIsLoadingRecipes(true);
      const recipes = await fetchRecipesFromDB();
      setCloudRecipes(recipes);
      setIsLoadingRecipes(false);
    }
    loadRecipes();
  }, []);

  if (isLoadingRecipes) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-terracotta border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400 font-medium">Conectando a la base de datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header currentTab={currentTab} setCurrentTab={setCurrentTab} />
      
      <main className="flex-1 w-full max-w-4xl mx-auto p-4 md:p-6 pb-20">
        {!hasCompletedOnboarding ? (
          <OnboardingWizard />
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {currentTab === 'menu' && <MenuViewer />}
            {currentTab === 'catalog' && <RecipeCatalog />}
            {currentTab === 'shopping' && <ShoppingList />}
          </div>
        )}
      </main>
      
      {currentTab === 'new-recipe' && (
        <RecipeFormModal onClose={() => setCurrentTab('menu')} />
      )}
    </div>
  )
}

export default App;
