import React from 'react';
import { Clock, Users } from 'lucide-react';

export default function RecipeCard({ recipe, onClick }) {
  return (
    <div 
      onClick={onClick}
      className="group flex gap-4 p-3 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-brand-mint dark:hover:border-brand-sage cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50"
    >
      <img 
        src={recipe.image} 
        alt={recipe.title} 
        className="w-24 h-24 rounded-lg object-cover group-hover:scale-105 transition-transform duration-300" 
      />
      <div className="flex flex-col justify-center flex-1">
        <h4 className="font-semibold text-slate-800 dark:text-slate-100 line-clamp-2 leading-tight">
          {recipe.title}
        </h4>
        <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 font-medium">
          <span className="flex items-center gap-1"><Clock size={12} /> 30 min</span>
          <span className="flex items-center gap-1"><Users size={12} /> {recipe.servings} raciones</span>
        </div>
        <div className="flex gap-1 mt-2 flex-wrap">
          {recipe.tags.slice(0,2).map(tag => (
            <span key={tag} className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-600 dark:text-slate-300">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
