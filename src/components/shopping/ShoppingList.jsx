import React, { useMemo, useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { CheckCircle2, Circle, Copy, Download, ShoppingBasket } from 'lucide-react';
import html2pdf from 'html2pdf.js';

export default function ShoppingList() {
  const { generatedMenu, userPreferences: { diners }, checkedItems, toggleCheckedItem, cloudRecipes } = useAppStore();
  const printRef = useRef();

  const allRecipes = cloudRecipes || [];
  const getRecipe = (id) => allRecipes.find(r => r.id === id);

  const consolidatedList = useMemo(() => {
    const list = {}; // Key: "Name|Unit", Value: { category, amount }
    
    generatedMenu.forEach(day => {
      const lunch = getRecipe(day.lunch);
      const dinner = getRecipe(day.dinner);
      const meals = [lunch, dinner].filter(Boolean);

      meals.forEach(meal => {
        const scaleRatio = diners / meal.servings;
        meal.ingredients.forEach(ing => {
          const key = `${ing.name.toLowerCase().trim()}|${ing.unit}`;
          if (!list[key]) {
            list[key] = { name: ing.name, category: ing.category, amount: 0, unit: ing.unit };
          }
          list[key].amount += (ing.amount * scaleRatio);
        });
      });
    });

    // Group by category
    const grouped = {};
    Object.values(list).forEach(item => {
      if (!grouped[item.category]) grouped[item.category] = [];
      // Clean up amounts
      item.amount = Number(item.amount.toFixed(1));
      if (item.amount > 1000 && item.unit === 'g') {
        item.amount = Number((item.amount / 1000).toFixed(2));
        item.unit = 'kg';
      }
      grouped[item.category].push(item);
    });

    return grouped;
  }, [generatedMenu, diners]);

  const copyToClipboard = () => {
    let text = "🛒 Mi Lista de la Compra Chefbot\n\n";
    Object.entries(consolidatedList).forEach(([category, items]) => {
      text += `--- ${category.toUpperCase()} ---\n`;
      items.forEach(item => {
        const isChecked = checkedItems.includes(`${item.name}-${item.unit}`);
        text += `${isChecked ? '✅' : '⬜'} ${item.amount} ${item.unit} de ${item.name}\n`;
      });
      text += "\n";
    });
    navigator.clipboard.writeText(text);
    alert('¡Lista copiada al portapapeles!');
  };

  const exportPDF = () => {
    const element = printRef.current;
    const opt = {
      margin:       1,
      filename:     'chefbot_lista_compra.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
            <ShoppingBasket className="text-brand-sage" size={32} />
            Lista de la Compra
          </h2>
          <p className="text-slate-500 mt-1">Consolidada e inteligente para {diners} {diners === 1 ? 'persona' : 'personas'}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={copyToClipboard} className="btn-secondary flex items-center gap-2">
            <Copy size={16} /> Copiar
          </button>
          <button onClick={exportPDF} className="btn-primary flex items-center gap-2">
            <Download size={16} /> PDF
          </button>
        </div>
      </div>

      <div ref={printRef} className="card p-6 bg-white dark:bg-slate-900">
        <h1 className="text-2xl font-bold mb-6 text-center text-brand-terracotta hidden print:block">
          Lista de Compra Semanal
        </h1>
        {Object.keys(consolidatedList).length === 0 ? (
          <p className="text-center text-slate-500 py-10">Genera un menú primero para ver tu lista.</p>
        ) : (
          <div className="space-y-8">
            {Object.entries(consolidatedList).map(([category, items]) => (
              <div key={category}>
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 border-b-2 border-brand-mint dark:border-brand-sage pb-2 mb-4 inline-block">
                  {category}
                </h3>
                <div className="grid sm:grid-cols-2 gap-y-3 gap-x-8">
                  {items.map((item, idx) => {
                    const itemId = `${item.name}-${item.unit}`;
                    const isChecked = checkedItems.includes(itemId);
                    return (
                      <div 
                        key={idx} 
                        onClick={() => toggleCheckedItem(itemId)}
                        className={`flex items-center gap-3 cursor-pointer group transition-opacity ${isChecked ? 'opacity-50' : 'opacity-100'}`}
                      >
                        <button className={`shrink-0 transition-colors ${isChecked ? 'text-brand-sage' : 'text-slate-300 group-hover:text-brand-mint'}`}>
                          {isChecked ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                        </button>
                        <span className={`text-slate-700 dark:text-slate-300 transition-all ${isChecked ? 'line-through' : ''}`}>
                          <strong className="font-semibold">{item.amount} {item.unit}</strong> de {item.name}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
