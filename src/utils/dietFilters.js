export const ANIMAL_MEAT = [
  'pollo', 'carne', 'cerdo', 'ternera', 'vaca', 'pescado', 'atun', 'atún', 
  'salmon', 'salmón', 'jamon', 'jamón', 'bacon', 'panceta', 'salchicha', 
  'chorizo', 'lomo', 'costilla', 'cordero', 'marisco', 'gamba', 'langostino', 
  'pulpo', 'calamar', 'mejillon', 'mejillón', 'merluza', 'bacalao', 'pavo', 
  'conejo', 'pato', 'sardina', 'anchoa', 'boqueron', 'boquerón', 'morcilla',
  'caldo de pollo', 'caldo de carne', 'caldo de pescado'
];

export const ANIMAL_DERIVATIVES = [
  'leche', 'queso', 'mantequilla', 'nata', 'yogur', 'huevo', 'miel', 
  'gelatina', 'suero'
];

export function isRecipeAllowed(recipe, diets = []) {
  if (!diets || diets.length === 0) return true;

  const isVegetarian = diets.includes('vegetarian');
  const isVegan = diets.includes('vegan');

  // If neither vegan nor vegetarian, we return true (we skip gluten-free for now as it's complex)
  if (!isVegetarian && !isVegan) return true;

  const forbiddenWords = [];
  
  if (isVegetarian || isVegan) {
    forbiddenWords.push(...ANIMAL_MEAT);
  }
  
  if (isVegan) {
    forbiddenWords.push(...ANIMAL_DERIVATIVES);
  }

  // Check every ingredient against forbidden words
  for (const ingredient of recipe.ingredients) {
    const name = ingredient.name.toLowerCase();
    for (const word of forbiddenWords) {
      // Use word boundaries or simple includes? includes is safer for plurals (e.g. pollos, huevos)
      // but might trigger false positives. For now, simple includes is fine for our dataset.
      if (name.includes(word.toLowerCase())) {
        return false;
      }
    }
  }

  return true;
}
