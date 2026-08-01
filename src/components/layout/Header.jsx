import React, { useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Moon, Sun, Utensils } from 'lucide-react';

export default function Header({ currentTab, setCurrentTab }) {
  const theme = useAppStore((state) => state.theme);
  const toggleTheme = useAppStore((state) => state.toggleTheme);
  const hasCompletedOnboarding = useAppStore((state) => state.hasCompletedOnboarding);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 p-4">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => hasCompletedOnboarding && setCurrentTab('menu')}>
          <Utensils className="text-brand-terracotta" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-brand-terracotta to-orange-400 bg-clip-text text-transparent">
            Chefbot
          </h1>
        </div>
        
        <div className="flex items-center gap-6">
          {hasCompletedOnboarding && (
            <nav className="hidden sm:flex items-center gap-4 font-medium">
              <button 
                onClick={() => setCurrentTab('menu')}
                className={`transition-colors ${currentTab === 'menu' ? 'text-brand-terracotta' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
              >
                Mi Menú
              </button>
              <button 
                onClick={() => setCurrentTab('catalog')}
                className={`transition-colors ${currentTab === 'catalog' ? 'text-brand-terracotta' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
              >
                Catálogo
              </button>
              <button 
                onClick={() => setCurrentTab('shopping')}
                className={`transition-colors ${currentTab === 'shopping' ? 'text-brand-terracotta' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
              >
                Lista de Compra
              </button>
              <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
              <button 
                onClick={() => setCurrentTab('new-recipe')}
                className="text-sm bg-brand-sage text-brand-dark px-3 py-1.5 rounded-full hover:bg-green-300 transition-colors shadow-sm font-semibold"
              >
                + Nueva Receta
              </button>
            </nav>
          )}
          
          <button 
            onClick={toggleTheme} 
            className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            aria-label="Alternar tema"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>
      {/* Mobile nav */}
      {hasCompletedOnboarding && (
        <nav className="sm:hidden flex justify-around items-center mt-4 border-t border-slate-100 dark:border-slate-800 pt-3 text-sm">
          <button 
            onClick={() => setCurrentTab('menu')}
            className={`font-medium transition-colors ${currentTab === 'menu' ? 'text-brand-terracotta' : 'text-slate-500'}`}
          >
            Menú
          </button>
          <button 
            onClick={() => setCurrentTab('catalog')}
            className={`font-medium transition-colors ${currentTab === 'catalog' ? 'text-brand-terracotta' : 'text-slate-500'}`}
          >
            Catálogo
          </button>
          <button 
            onClick={() => setCurrentTab('shopping')}
            className={`font-medium transition-colors ${currentTab === 'shopping' ? 'text-brand-terracotta' : 'text-slate-500'}`}
          >
            Compra
          </button>
          <button 
            onClick={() => setCurrentTab('new-recipe')}
            className="bg-brand-sage text-brand-dark px-3 py-1 rounded-full font-semibold"
          >
            + Añadir
          </button>
        </nav>
      )}
    </header>
  );
}
