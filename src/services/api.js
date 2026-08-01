export const fetchRandomRecipes = async (count = 5) => {
  const recipes = [];
  try {
    // TheMealDB random endpoint only returns 1 meal at a time
    const promises = Array.from({ length: count }).map(() =>
      fetch('https://www.themealdb.com/api/json/v1/1/random.php').then(res => res.json())
    );
    
    const results = await Promise.all(promises);
    
    results.forEach(data => {
      if (data.meals && data.meals[0]) {
        recipes.push(normalizeRecipe(data.meals[0]));
      }
    });
    return recipes;
  } catch (error) {
    console.error("Error fetching recipes from API:", error);
    return [];
  }
};

export const normalizeRecipe = (meal) => {
  const ingredients = [];
  
  for (let i = 1; i <= 20; i++) {
    const rawName = meal[`strIngredient${i}`];
    const rawMeasure = meal[`strMeasure${i}`];
    
    if (rawName && rawName.trim() !== '') {
      ingredients.push(parseIngredient(rawName, rawMeasure));
    }
  }
  
  // Assign random meal type since API doesn't specify
  const mealType = Math.random() > 0.5 ? 'lunch' : 'dinner';
  
  return {
    id: `api_${meal.idMeal}`,
    title: meal.strMeal,
    image: meal.strMealThumb,
    mealType,
    tags: [meal.strCategory, meal.strArea].filter(Boolean),
    servings: 2, // Default servings for TheMealDB is usually 2-4, we normalize to 2
    ingredients,
    instructions: meal.strInstructions.split('\r\n').filter(s => s.trim().length > 0)
  };
};

const parseIngredient = (name, measure) => {
  name = name.trim();
  measure = measure ? measure.trim().toLowerCase() : '';
  
  // Default values
  let amount = 1;
  let unit = 'ud';
  let category = categorizeIngredient(name);

  // Parse amount from measure (e.g. "1 cup", "200 g", "1/2 tsp")
  // Extract number (including fractions or decimals)
  const amountMatch = measure.match(/^(\d+(?:[.,]\d+)?|\d+\/\d+|\d+\s+\d+\/\d+)/);
  if (amountMatch) {
    const numStr = amountMatch[1];
    if (numStr.includes('/')) {
      const parts = numStr.split(' ');
      if (parts.length === 2) {
        const [whole, frac] = parts;
        const [num, den] = frac.split('/');
        amount = parseInt(whole) + (parseInt(num) / parseInt(den));
      } else {
        const [num, den] = numStr.split('/');
        amount = parseInt(num) / parseInt(den);
      }
    } else {
      amount = parseFloat(numStr.replace(',', '.'));
    }
  }

  // Parse unit
  if (measure.includes('g') || measure.includes('gram')) unit = 'g';
  else if (measure.includes('ml') || measure.includes('milliliter')) unit = 'ml';
  else if (measure.includes('kg')) { unit = 'g'; amount *= 1000; }
  else if (measure.includes('cup')) unit = 'cup';
  else if (measure.includes('tbs') || measure.includes('tablespoon')) unit = 'cda';
  else if (measure.includes('tsp') || measure.includes('teaspoon')) unit = 'cdta';
  else if (measure.includes('pinch')) unit = 'pizca';
  else if (measure.includes('slice')) unit = 'loncha';
  
  return {
    name: name.charAt(0).toUpperCase() + name.slice(1),
    category,
    amount: Number(amount.toFixed(1)),
    unit
  };
};

const categorizeIngredient = (name) => {
  const n = name.toLowerCase();
  if (n.match(/chicken|beef|pork|lamb|meat|bacon|sausage/)) return 'Carnes';
  if (n.match(/salmon|fish|tuna|prawn|shrimp|cod/)) return 'Pescados';
  if (n.match(/milk|cheese|butter|cream|yogurt|egg/)) return 'Lácteos y Huevos';
  if (n.match(/tomato|onion|garlic|potato|carrot|pepper|spinach|broccoli|lettuce|mushroom/)) return 'Frutas y Verduras';
  if (n.match(/apple|banana|lemon|orange|berry|fruit/)) return 'Frutas y Verduras';
  if (n.match(/salt|pepper|sugar|oil|vinegar|sauce|soy|spice|herb|basil|oregano/)) return 'Despensa y Especias';
  if (n.match(/flour|bread|pasta|rice|noodle|oat/)) return 'Despensa y Panadería';
  return 'Otros';
};
