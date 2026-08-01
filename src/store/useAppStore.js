import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAppStore = create(
  persist(
    (set) => ({
      // Theme State
      theme: 'light',
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),

      // Cloud Recipes State
      cloudRecipes: [],
      setCloudRecipes: (recipes) => set({ cloudRecipes: recipes }),
      isLoadingRecipes: true,
      setIsLoadingRecipes: (loading) => set({ isLoadingRecipes: loading }),

      // Custom Recipes State (deprecated, kept for local fallback)
      customRecipes: [],
      addCustomRecipe: (recipe) => set((state) => ({
        customRecipes: [...state.customRecipes, recipe]
      })),

      // Favorites State
      favoriteRecipes: [],
      toggleFavorite: (recipeId) => set((state) => ({
        favoriteRecipes: state.favoriteRecipes.includes(recipeId)
          ? state.favoriteRecipes.filter(id => id !== recipeId)
          : [...state.favoriteRecipes, recipeId]
      })),

      // Admin State
      isAdmin: false,
      setIsAdmin: (val) => set({ isAdmin: val }),

      // Deleted Recipes State (Blacklist - kept for local preferences if they don't want to see a global recipe)
      deletedRecipes: [],
      
      // Meal Type Overrides State
      mealTypeOverrides: {},
      deleteRecipe: (recipeId) => set((state) => {
        // If it's a custom recipe, we can permanently remove it
        if (recipeId.startsWith('custom_')) {
          return {
            customRecipes: state.customRecipes.filter(r => r.id !== recipeId),
            favoriteRecipes: state.favoriteRecipes.filter(id => id !== recipeId)
          };
        }
        // Otherwise (hardcoded or api), add to blacklist
        return {
          deletedRecipes: [...state.deletedRecipes, recipeId],
          favoriteRecipes: state.favoriteRecipes.filter(id => id !== recipeId)
        };
      }),

      // User Preferences State
      hasCompletedOnboarding: false,
      userPreferences: {
        diners: 2,
        days: 7,
        diets: [],      // e.g., 'vegan', 'gluten-free'
        allergies: [],  // e.g., 'nuts', 'lactose'
        tasteLikes: [], // IDs of recipes they liked
      },
      updatePreferences: (prefs) => set((state) => ({
        userPreferences: { ...state.userPreferences, ...prefs }
      })),
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      setMealTypeOverride: (id, type) => set((state) => ({
        mealTypeOverrides: { ...state.mealTypeOverrides, [id]: type }
      })),
      swapMeals: (dayA, typeA, dayB, typeB) => set((state) => {
        const newMenu = JSON.parse(JSON.stringify(state.generatedMenu));
        const itemAIndex = newMenu.findIndex(m => m.day === dayA);
        const itemBIndex = newMenu.findIndex(m => m.day === dayB);
        
        if (itemAIndex === -1 || itemBIndex === -1) return state;

        const temp = newMenu[itemAIndex][typeA];
        newMenu[itemAIndex][typeA] = newMenu[itemBIndex][typeB];
        newMenu[itemBIndex][typeB] = temp;
        
        return { generatedMenu: newMenu };
      }),
      resetOnboarding: () => set({ hasCompletedOnboarding: false, generatedMenu: [] }),

      // Menu State
      generatedMenu: [], // Array of { day: number, lunch: recipeId, dinner: recipeId }
      setGeneratedMenu: (menu) => set({ generatedMenu: menu }),
      updateMeal: (day, type, newRecipeId) => set((state) => ({
        generatedMenu: state.generatedMenu.map((dayPlan) =>
          dayPlan.day === day ? { ...dayPlan, [type]: newRecipeId } : dayPlan
        )
      })),

      // Shopping List State
      checkedItems: [], // Array of ingredient names or IDs
      toggleCheckedItem: (itemName) => set((state) => ({
        checkedItems: state.checkedItems.includes(itemName)
          ? state.checkedItems.filter((i) => i !== itemName)
          : [...state.checkedItems, itemName]
      })),
    }),
    {
      name: 'chefbot-storage', // key in localStorage
    }
  )
);
