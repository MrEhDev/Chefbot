import React, { useState } from 'react';
import Header from './components/layout/Header';
import OnboardingWizard from './components/wizard/OnboardingWizard';
import MenuViewer from './components/menu/MenuViewer';
import ShoppingList from './components/shopping/ShoppingList';
import RecipeCatalog from './components/recipes/RecipeCatalog';
import RecipeFormModal from './components/recipes/RecipeFormModal';
import { useAppStore } from './store/useAppStore';

function App() {
  const hasCompletedOnboarding = useAppStore((state) => state.hasCompletedOnboarding);
  const [currentTab, setCurrentTab] = useState('menu');

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
