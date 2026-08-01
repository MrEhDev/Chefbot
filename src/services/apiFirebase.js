import { app, db } from './firebase';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';

export async function fetchRecipesFromDB() {
  const querySnapshot = await getDocs(collection(db, "recipes"));
  const recipes = [];
  querySnapshot.forEach((doc) => {
    recipes.push(doc.data());
  });
  return recipes;
}

export async function addRecipeToDB(recipe) {
  try {
    const docRef = doc(db, 'recipes', recipe.id);
    await setDoc(docRef, recipe);
    return true;
  } catch (error) {
    console.error("Error adding document: ", error);
    return false;
  }
}

export async function deleteRecipeFromDB(recipeId) {
  try {
    await deleteDoc(doc(db, 'recipes', recipeId));
    return true;
  } catch (error) {
    console.error("Error removing document: ", error);
    return false;
  }
}
