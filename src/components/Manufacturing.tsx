import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Search, 
  Factory, 
  Calculator, 
  CheckCircle2, 
  X, 
  ArrowRight,
  Package,
  Scale,
  Save,
  AlertTriangle,
  Edit2,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { useApp } from '../AppContext';
import { Recipe, Product } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

const Manufacturing: React.FC = () => {
  const { products, setProducts, recipes, setRecipes, settings } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRecipeId, setEditingRecipeId] = useState<string | null>(null);
  const [newRecipe, setNewRecipe] = useState<Partial<Recipe>>({
    productId: '',
    name: '',
    outputQuantity: 1,
    outputUnit: 'كيلو',
    ingredients: [],
    totalCost: 0,
    isFinished: false
  });

  const [productionModal, setProductionModal] = useState<Recipe | null>(null);
  const [productionQty, setProductionQty] = useState(1);
  const [showIngredientsDropdown, setShowIngredientsDropdown] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void } | null>(null);

  const calculateIngredientCost = (product: Product, quantity: number, unit: string) => {
    if (unit === 'جم' || unit === 'جرام') {
      return (product.costPrice / 1000) * quantity;
    }
    return product.costPrice * quantity;
  };

  const addIngredient = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (product.quantity <= 0) {
      setError(`عذراً، الصنف "${product.name}" ليس له رصيد في المخزن حالياً.`);
      setTimeout(() => setError(null), 3000);
      return;
    }

    const quantity = 100;
    const unit = 'جم';
    const cost = calculateIngredientCost(product, quantity, unit);

    const newIngredient = {
      productId: product.id,
      quantity,
      unit,
      cost
    };

    const updatedIngredients = [...(newRecipe.ingredients || []), newIngredient];
    const totalCost = updatedIngredients.reduce((acc, curr) => acc + curr.cost, 0);
    
    setNewRecipe({
      ...newRecipe,
      ingredients: updatedIngredients,
      totalCost
    });
  };

  const removeIngredient = (index: number) => {
    const updatedIngredients = [...(newRecipe.ingredients || [])];
    updatedIngredients.splice(index, 1);
    const totalCost = updatedIngredients.reduce((acc, curr) => acc + curr.cost, 0);
    setNewRecipe({ ...newRecipe, ingredients: updatedIngredients, totalCost });
  };

  const updateIngredientQuantity = (index: number, quantity: number) => {
    const updatedIngredients = [...(newRecipe.ingredients || [])];
    const product = products.find(p => p.id === updatedIngredients[index].productId);
    if (!product) return;

    // Handle integer for "قطعة"
    const finalQuantity = updatedIngredients[index].unit === 'قطعة' ? Math.round(quantity) : quantity;

    updatedIngredients[index].quantity = finalQuantity;
    updatedIngredients[index].cost = calculateIngredientCost(product, finalQuantity, updatedIngredients[index].unit);
    
    const totalCost = updatedIngredients.reduce((acc, curr) => acc + curr.cost, 0);
    setNewRecipe({ ...newRecipe, ingredients: updatedIngredients, totalCost });
  };

  const updateIngredientUnit = (index: number, unit: string) => {
    const updatedIngredients = [...(newRecipe.ingredients || [])];
    const product = products.find(p => p.id === updatedIngredients[index].productId);
    if (!product) return;

    updatedIngredients[index].unit = unit;
    updatedIngredients[index].cost = calculateIngredientCost(product, updatedIngredients[index].quantity, unit);
    
    const totalCost = updatedIngredients.reduce((acc, curr) => acc + curr.cost, 0);
    setNewRecipe({ ...newRecipe, ingredients: updatedIngredients, totalCost });
  };

  const saveRecipe = () => {
    if (!newRecipe.productId || !newRecipe.ingredients?.length) return;
    
    if (editingRecipeId) {
      setRecipes(recipes.map(r => 
        r.id === editingRecipeId 
          ? { ...newRecipe as Recipe, id: editingRecipeId } 
          : r
      ));
    } else {
      const recipeToAdd: Recipe = {
        ...newRecipe as Recipe,
        id: Math.random().toString(36).substr(2, 9),
        isFinished: false
      };
      setRecipes([...recipes, recipeToAdd]);
    }

    setShowAddModal(false);
    setEditingRecipeId(null);
    setNewRecipe({ productId: '', name: '', outputQuantity: 1, outputUnit: 'كيلو', ingredients: [], totalCost: 0, isFinished: false });
  };

  const finishManufacturing = () => {
    if (!productionModal) return;

    // Check if enough raw materials
    for (const ing of productionModal.ingredients) {
      const product = products.find(p => p.id === ing.productId);
      const requiredQty = ing.unit === 'جم' || ing.unit === 'جرام' ? (ing.quantity / 1000) * productionQty : ing.quantity * productionQty;
      if (!product || product.quantity < requiredQty) {
        setError(`عذراً، لا توجد كمية كافية من ${product?.name}`);
        setTimeout(() => setError(null), 5000);
        return;
      }
    }

    // Deduct raw materials and add finished product
    setProducts(prev => {
      let updatedProducts = [...prev];
      
      // Deduct raw
      for (const ing of productionModal.ingredients) {
        const requiredQty = ing.unit === 'جم' || ing.unit === 'جرام' ? (ing.quantity / 1000) * productionQty : ing.quantity * productionQty;
        updatedProducts = updatedProducts.map(p => 
          p.id === ing.productId 
            ? { ...p, quantity: p.quantity - requiredQty }
            : p
        );
      }

      // Add finished product and update cost
      updatedProducts = updatedProducts.map(p => {
        if (p.id === productionModal.productId) {
          const addedQty = productionModal.outputQuantity * productionQty;
          const unitCost = productionModal.totalCost / productionModal.outputQuantity;
          return { 
            ...p, 
            quantity: p.quantity + addedQty,
            costPrice: unitCost // Update cost price in inventory
          };
        }
        return p;
      });

      return updatedProducts;
    });

    // Mark recipe as finished
    setRecipes(recipes.map(r => 
      r.id === productionModal.id 
        ? { ...r, isFinished: true, productionQty: productionQty } 
        : r
    ));

    alert(`تم إنتاج ${productionQty * productionModal.outputQuantity} ${productionModal.outputUnit} من ${productionModal.name} بنجاح!`);
    setProductionModal(null);
  };

  const deleteRecipe = (recipe: Recipe) => {
    if (recipe.isFinished) {
      // Reverse inventory changes
      setProducts(prev => {
        let updatedProducts = [...prev];
        const pQty = recipe.productionQty || 1;

        // Add back raw materials
        for (const ing of recipe.ingredients) {
          const requiredQty = ing.unit === 'جم' || ing.unit === 'جرام' ? (ing.quantity / 1000) * pQty : ing.quantity * pQty;
          updatedProducts = updatedProducts.map(p => 
            p.id === ing.productId 
              ? { ...p, quantity: p.quantity + requiredQty }
              : p
          );
        }

        // Deduct finished product
        updatedProducts = updatedProducts.map(p => {
          if (p.id === recipe.productId) {
            const addedQty = recipe.outputQuantity * pQty;
            return { 
              ...p, 
              quantity: Math.max(0, p.quantity - addedQty)
            };
          }
          return p;
        });

        return updatedProducts;
      });
    }

    setRecipes(recipes.filter(r => r.id !== recipe.id));
  };

  const clearAllRecipes = () => {
    setConfirmModal({
      isOpen: true,
      title: 'تأكيد الحذف',
      message: 'هل أنت متأكد من مسح جميع أوامر التصنيع؟ سيتم التراجع عن حركات المخزون لجميع الأوامر المنتهية.',
      onConfirm: () => {
        // Reverse inventory for all finished recipes
        setProducts(prev => {
          let updatedProducts = [...prev];
          
          recipes.forEach(recipe => {
            if (recipe.isFinished) {
              const pQty = recipe.productionQty || 1;
              // Add back raw materials
              recipe.ingredients.forEach(ing => {
                const requiredQty = ing.unit === 'جم' || ing.unit === 'جرام' ? (ing.quantity / 1000) * pQty : ing.quantity * pQty;
                updatedProducts = updatedProducts.map(p => 
                  p.id === ing.productId 
                    ? { ...p, quantity: p.quantity + requiredQty }
                    : p
                );
              });

              // Deduct finished product
              updatedProducts = updatedProducts.map(p => {
                if (p.id === recipe.productId) {
                  const addedQty = recipe.outputQuantity * pQty;
                  return { 
                    ...p, 
                    quantity: Math.max(0, p.quantity - addedQty)
                  };
                }
                return p;
              });
            }
          });

          return updatedProducts;
        });

        setRecipes([]);
        setConfirmModal(null);
      }
    });
  };

  const editRecipe = (recipe: Recipe) => {
    setEditingRecipeId(recipe.id);
    setNewRecipe(recipe);
    setShowAddModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">أوامر التصنيع</h1>
          <p className="text-gray-500 dark:text-gray-400">إدارة أوامر التصنيع وحساب تكاليف الإنتاج</p>
        </div>
        <div className="flex items-center gap-3">
          {recipes.length > 0 && (
            <button 
              onClick={clearAllRecipes}
              className="flex items-center gap-2 px-6 py-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold text-sm hover:bg-red-100 dark:hover:bg-red-900/40 transition-all border border-red-100 dark:border-red-900/30"
            >
              <Trash2 size={18} />
              مسح الكل
            </button>
          )}
          <button 
            onClick={() => {
              setEditingRecipeId(null);
              setNewRecipe({ productId: '', name: '', outputQuantity: 1, outputUnit: 'كيلو', ingredients: [], totalCost: 0, isFinished: false });
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 px-6 py-2 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/20"
          >
            <Plus size={18} />
            إضافة أمر تصنيع جديد
          </button>
        </div>
      </div>

      {/* Recipes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-gray-800 p-12 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700 text-center text-gray-400">
            <Factory size={48} className="mx-auto mb-4 opacity-20" />
            <p>لا توجد أوامر تصنيع حالياً</p>
          </div>
        ) : recipes.map(recipe => (
          <div key={recipe.id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">{recipe.name}</h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => editRecipe(recipe)}
                  className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => {
                    setConfirmModal({
                      isOpen: true,
                      title: 'تأكيد الحذف',
                      message: 'هل أنت متأكد من حذف أمر التصنيع؟ سيتم التراجع عن حركات المخزون المرتبطة به.',
                      onConfirm: () => {
                        deleteRecipe(recipe);
                        setConfirmModal(null);
                      }
                    });
                  }}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
                <span className={`px-2 py-1 rounded text-xs font-bold ${recipe.isFinished ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'}`}>
                  {recipe.isFinished ? 'منتهي' : 'قيد الانتظار'}
                </span>
              </div>
            </div>
            
            <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl">
              <span className="text-xs text-gray-500">إجمالي التكلفة:</span>
              <span className="font-bold text-emerald-600">{recipe.totalCost.toFixed(2)} {settings.currency}</span>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-500">المكونات الأساسية:</p>
              <div className="flex flex-wrap gap-2">
                {recipe.ingredients.map((ing, idx) => {
                  const p = products.find(prod => prod.id === ing.productId);
                  return (
                    <span key={idx} className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-[10px] font-medium">
                      {p?.name} ({ing.quantity} {ing.unit})
                    </span>
                  );
                })}
              </div>
            </div>

            {!recipe.isFinished && (
              <button 
                onClick={() => setProductionModal(recipe)}
                className="mt-4 w-full bg-emerald-600 text-white py-2 rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={16} />
                إنهاء أمر التصنيع
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Confirm Modal */}
      <AnimatePresence>
        {confirmModal?.isOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmModal(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white dark:bg-gray-800 w-full max-w-sm rounded-3xl p-8 shadow-2xl overflow-hidden text-center"
              dir="rtl"
            >
              <h3 className="text-2xl font-bold mb-4">{confirmModal.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-8">{confirmModal.message}</p>
              <div className="flex gap-4">
                <button 
                  onClick={confirmModal.onConfirm}
                  className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition-all"
                >
                  تأكيد
                </button>
                <button 
                  onClick={() => setConfirmModal(null)}
                  className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 py-3 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Recipe Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white dark:bg-gray-800 w-full max-w-4xl rounded-3xl p-8 shadow-2xl overflow-y-auto max-h-[90vh] scroll-smooth"
              id="recipe-modal-content"
              dir="rtl"
            >
              {/* Scroll Buttons */}
              <div className="fixed left-8 bottom-8 flex flex-col gap-2 z-50">
                <button 
                  onClick={() => document.getElementById('recipe-modal-content')?.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="p-3 bg-gray-800 text-white rounded-full shadow-lg hover:bg-gray-700 transition-all opacity-50 hover:opacity-100"
                  title="أعلى"
                >
                  <ArrowUp size={20} />
                </button>
                <button 
                  onClick={() => {
                    const el = document.getElementById('recipe-modal-content');
                    el?.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
                  }}
                  className="p-3 bg-gray-800 text-white rounded-full shadow-lg hover:bg-gray-700 transition-all opacity-50 hover:opacity-100"
                  title="أسفل"
                >
                  <ArrowDown size={20} />
                </button>
              </div>

              <div className="flex items-center justify-between mb-8 border-b border-gray-100 dark:border-gray-700 pb-4">
                <h3 className="text-2xl font-bold">{editingRecipeId ? 'تعديل أمر التصنيع' : 'أمر تصنيع جديد'}</h3>
                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 p-4 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400 overflow-hidden"
                  >
                    <AlertTriangle size={20} className="shrink-0" />
                    <p className="text-sm font-bold">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-8">
                {/* Top Section: Main Info */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500">المنتج النهائي</label>
                    <select 
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                      value={newRecipe.productId}
                      onChange={(e) => {
                        const p = products.find(prod => prod.id === e.target.value);
                        setNewRecipe({ ...newRecipe, productId: e.target.value, name: p?.name || '' });
                      }}
                    >
                      <option value="">اختر المنتج...</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500">الوحدة</label>
                    <select 
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                      value={newRecipe.outputUnit}
                      onChange={(e) => setNewRecipe({ ...newRecipe, outputUnit: e.target.value })}
                    >
                      {settings.units.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500">إجمالي الكمية المنتجة</label>
                    <input 
                      type="number" 
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-center"
                      value={newRecipe.outputQuantity}
                      onChange={(e) => setNewRecipe({ ...newRecipe, outputQuantity: parseFloat(e.target.value) || 1 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500">إجمالي التكلفة</label>
                    <div className="w-full px-4 py-3 rounded-xl border border-emerald-200 dark:border-emerald-900/30 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 font-black text-center text-xl">
                      {newRecipe.totalCost?.toFixed(2)} <span className="text-xs">{settings.currency}</span>
                    </div>
                  </div>
                </div>

                {/* Middle Section: Ingredients List */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <h4 className="text-lg font-bold flex items-center gap-2">
                      <Package size={20} className="text-emerald-600" />
                      المكونات (الخامات)
                    </h4>
                    <div className="relative">
                      <button 
                        onClick={() => setShowIngredientsDropdown(!showIngredientsDropdown)}
                        className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-md"
                      >
                        <Plus size={16} /> إضافة مكون
                      </button>
                      {showIngredientsDropdown && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setShowIngredientsDropdown(false)} />
                          <div className="absolute left-0 top-full mt-2 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl z-20 max-h-64 overflow-y-auto p-2">
                            <div className="p-2 border-b border-gray-100 dark:border-gray-700 mb-2">
                              <div className="relative">
                                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                <input type="text" placeholder="بحث عن صنف..." className="w-full pr-8 pl-3 py-2 text-xs bg-gray-50 dark:bg-gray-900 rounded-lg outline-none" />
                              </div>
                            </div>
                            {products.map(p => (
                              <button 
                                key={p.id}
                                onClick={() => {
                                  addIngredient(p.id);
                                  setShowIngredientsDropdown(false);
                                }}
                                className="w-full text-right px-4 py-3 text-sm hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-colors flex items-center justify-between group"
                              >
                                <span className="font-bold">{p.name}</span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full ${p.quantity > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                  رصيد: {p.quantity}
                                </span>
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden">
                    <table className="w-full text-right border-collapse">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 text-xs font-bold uppercase">
                          <th className="px-6 py-4">اسم الصنف</th>
                          <th className="px-6 py-4 text-center">الوحدة</th>
                          <th className="px-6 py-4 text-center">كمية / وزن</th>
                          <th className="px-6 py-4 text-center">التكلفة</th>
                          <th className="px-6 py-4 w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {newRecipe.ingredients?.map((ing, idx) => {
                          const p = products.find(prod => prod.id === ing.productId);
                          return (
                            <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors">
                              <td className="px-6 py-4 font-bold">{p?.name}</td>
                              <td className="px-6 py-4">
                                <select 
                                  className="w-full bg-transparent border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                                  value={ing.unit}
                                  onChange={(e) => updateIngredientUnit(idx, e.target.value)}
                                >
                                  <option value="جم">جم</option>
                                  <option value="جرام">جرام</option>
                                  <option value="كيلو">كيلو</option>
                                  <option value="قطعة">قطعة</option>
                                </select>
                              </td>
                              <td className="px-6 py-4">
                                <input 
                                  type="number" 
                                  className="w-24 mx-auto bg-transparent border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 text-xs text-center outline-none focus:ring-1 focus:ring-emerald-500 font-bold"
                                  value={ing.quantity}
                                  onChange={(e) => updateIngredientQuantity(idx, parseFloat(e.target.value) || 0)}
                                />
                              </td>
                              <td className="px-6 py-4 text-center font-bold text-emerald-600">
                                {ing.cost.toFixed(2)} <span className="text-[10px]">{settings.currency}</span>
                              </td>
                              <td className="px-6 py-4">
                                <button onClick={() => removeIngredient(idx)} className="text-red-400 hover:text-red-600 transition-colors">
                                  <Trash2 size={18} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                        {(!newRecipe.ingredients || newRecipe.ingredients.length === 0) && (
                          <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">
                              لم يتم إضافة مكونات بعد...
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Bottom Section: Unit Cost */}
                <div className="flex justify-end">
                  <div className="bg-blue-600 text-white px-8 py-4 rounded-2xl shadow-xl flex items-center gap-6">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold opacity-80">تكلفة الوحدة الواحدة</span>
                      <span className="text-3xl font-black">
                        {(newRecipe.totalCost && newRecipe.outputQuantity ? (newRecipe.totalCost / newRecipe.outputQuantity).toFixed(2) : 0)} 
                        <span className="text-sm font-bold mr-2">{settings.currency}</span>
                      </span>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <Calculator size={24} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-10 flex gap-4 border-t border-gray-100 dark:border-gray-700 pt-8">
                <button 
                  onClick={saveRecipe}
                  className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20"
                >
                  <Save size={22} />
                  حفظ
                </button>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 py-4 rounded-2xl font-bold text-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Production Modal */}
      <AnimatePresence>
        {productionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setProductionModal(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white dark:bg-gray-800 w-full max-w-md rounded-3xl p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
              dir="rtl"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold">إنهاء أمر التصنيع</h3>
                <button onClick={() => setProductionModal(null)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 p-4 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400 overflow-hidden"
                  >
                    <AlertTriangle size={20} className="shrink-0" />
                    <p className="text-sm font-bold">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl">
                  <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-xl">
                    <Factory size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold">{productionModal.name}</h4>
                    <p className="text-xs text-gray-500">إجمالي التكلفة: {productionModal.totalCost.toFixed(2)} {settings.currency}</p>
                    <p className="text-[10px] text-blue-500 font-bold">تكلفة الوحدة: {(productionModal.totalCost / productionModal.outputQuantity).toFixed(2)} {settings.currency}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500">عدد مرات تكرار الأمر (الكمية النهائية: {productionQty * productionModal.outputQuantity} {productionModal.outputUnit})</label>
                  <input 
                    type="number" 
                    className="w-full px-6 py-4 rounded-2xl border-2 border-emerald-100 dark:border-emerald-900/30 bg-white dark:bg-gray-800 outline-none focus:border-emerald-500 text-2xl font-black text-center"
                    value={productionQty}
                    onChange={(e) => setProductionQty(parseFloat(e.target.value) || 1)}
                  />
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-2xl border border-amber-100 dark:border-amber-900/30 flex gap-3">
                  <AlertTriangle size={20} className="text-amber-600 shrink-0" />
                  <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                    عند إنهاء التصنيع، سيتم خصم المكونات الخام من المخزن وإضافة المنتج النهائي بالكمية المحددة وتحديث تكلفته.
                  </p>
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                <button 
                  onClick={finishManufacturing}
                  className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/20"
                >
                  إنهاء التصنيع
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Manufacturing;
