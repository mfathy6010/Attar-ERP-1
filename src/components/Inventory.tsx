import React, { useState } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Download, 
  Upload, 
  Search, 
  Filter, 
  MoreVertical,
  AlertTriangle,
  Barcode,
  RefreshCw,
  X,
  Save
} from 'lucide-react';
import { useApp } from '../AppContext';
import { Product } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

const Inventory: React.FC = () => {
  const { products, setProducts, settings } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showOpeningBalanceModal, setShowOpeningBalanceModal] = useState(false);
  const [openingBalanceData, setOpeningBalanceData] = useState({ productId: '', quantity: 0, costPrice: 0 });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    code: '',
    name: '',
    unit: 'كيلو',
    quantity: 0,
    costPrice: 0,
    salePrice: 0,
    minStock: 5,
    category: 'توابل',
    showInPOS: true
  });

  const filteredProducts = products.filter(p => 
    p.name.includes(searchQuery) || p.code.includes(searchQuery)
  );

  const handleSaveProduct = () => {
    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? { ...editingProduct } : p));
      setEditingProduct(null);
    } else {
      const productToAdd: Product = {
        ...newProduct as Product,
        id: Math.random().toString(36).substr(2, 9),
        barcode: `622${Math.floor(Math.random() * 10000000000)}`
      };
      setProducts([...products, productToAdd]);
      setShowAddModal(false);
      setNewProduct({
        code: '',
        name: '',
        unit: 'كيلو',
        quantity: 0,
        costPrice: 0,
        salePrice: 0,
        minStock: 5,
        category: 'توابل',
        showInPOS: true
      });
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) {
          const importedProducts = json.map((p: any) => ({
            ...p,
            id: p.id || Math.random().toString(36).substr(2, 9),
            barcode: p.barcode || `622${Math.floor(Math.random() * 10000000000)}`,
            showInPOS: p.showInPOS !== undefined ? p.showInPOS : true
          }));
          setProducts([...products, ...importedProducts]);
          alert('تم استيراد البيانات بنجاح');
        } else {
          alert('تنسيق الملف غير صحيح. يجب أن يكون مصفوفة من المنتجات.');
        }
      } catch (err) {
        alert('حدث خطأ أثناء قراءة الملف. تأكد من أنه ملف JSON صحيح.');
      }
    };
    reader.readAsText(file);
  };

  const exportToCSV = () => {
    if (products.length === 0) {
      alert('لا توجد بيانات للتصدير');
      return;
    }

    const headers = Object.keys(products[0]).join(',');
    const csvRows = products.map(row => {
      return Object.values(row).map(value => {
        if (typeof value === 'object') return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(',');
    });

    const csvContent = [headers, ...csvRows].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'inventory.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const deleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const handleSaveOpeningBalance = () => {
    if (!openingBalanceData.productId || openingBalanceData.quantity <= 0) {
      alert('يرجى اختيار منتج وإدخال كمية صحيحة');
      return;
    }

    setProducts(products.map(p => {
      if (p.id === openingBalanceData.productId) {
        return {
          ...p,
          quantity: p.quantity + openingBalanceData.quantity,
          costPrice: openingBalanceData.costPrice > 0 ? openingBalanceData.costPrice : p.costPrice
        };
      }
      return p;
    }));

    setShowOpeningBalanceModal(false);
    setOpeningBalanceData({ productId: '', quantity: 0, costPrice: 0 });
    alert('تم إضافة الرصيد الافتتاحي بنجاح');
  };

  const exportToExcel = () => {
    exportToCSV();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">إدارة المخازن</h1>
          <p className="text-gray-500 dark:text-gray-400">إدارة المنتجات والكميات والباركود</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer">
            <Upload size={18} />
            استيراد
            <input type="file" accept=".json" className="hidden" onChange={handleImport} />
          </label>
          <button 
            onClick={exportToExcel}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
          >
            <Download size={18} />
            تصدير
          </button>
          <button 
            onClick={() => setShowOpeningBalanceModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20"
          >
            <RefreshCw size={18} />
            الأرصدة الافتتاحية
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-2 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/20"
          >
            <Plus size={18} />
            إضافة منتج
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="البحث بالاسم أو الكود أو الباركود..."
            className="w-full pr-12 pl-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-600 dark:text-gray-300">
          <Filter size={18} />
          تصفية
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100 dark:border-gray-700">
                <th className="px-6 py-4 font-bold">كود الصنف</th>
                <th className="px-6 py-4 font-bold">اسم الصنف</th>
                <th className="px-6 py-4 font-bold">الوحدة</th>
                <th className="px-6 py-4 font-bold">الكمية</th>
                <th className="px-6 py-4 font-bold">سعر التكلفة</th>
                <th className="px-6 py-4 font-bold">سعر البيع</th>
                <th className="px-6 py-4 font-bold">الحالة</th>
                <th className="px-6 py-4 font-bold">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredProducts.map(product => (
                <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono text-gray-500">{product.code}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-sm">{product.name}</span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Barcode size={12} /> {product.barcode}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">{product.unit}</td>
                  <td className="px-6 py-4">
                    <span className={`font-bold ${product.quantity <= product.minStock ? 'text-red-500' : ''}`}>
                      {product.quantity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">{product.costPrice} {settings.currency}</td>
                  <td className="px-6 py-4 text-sm font-bold text-emerald-600">{product.salePrice} {settings.currency}</td>
                  <td className="px-6 py-4">
                    {product.quantity <= product.minStock ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] font-bold">
                        <AlertTriangle size={10} /> منخفض
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                        متوفر
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setEditingProduct(product)}
                        className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => deleteProduct(product.id)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Opening Balance Modal */}
      <AnimatePresence>
        {showOpeningBalanceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowOpeningBalanceModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white dark:bg-gray-800 w-full max-w-md rounded-3xl p-8 shadow-2xl overflow-hidden"
              dir="rtl"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold">إضافة رصيد افتتاحي</h3>
                <button onClick={() => setShowOpeningBalanceModal(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500">المنتج</label>
                  <select 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    value={openingBalanceData.productId}
                    onChange={(e) => setOpeningBalanceData({ ...openingBalanceData, productId: e.target.value })}
                  >
                    <option value="">اختر المنتج</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} (الرصيد الحالي: {p.quantity})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500">الكمية الافتتاحية</label>
                  <input 
                    type="number" 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    value={openingBalanceData.quantity || ''}
                    onChange={(e) => setOpeningBalanceData({ ...openingBalanceData, quantity: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500">سعر التكلفة (اختياري - لتحديث التكلفة)</label>
                  <input 
                    type="number" 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    value={openingBalanceData.costPrice || ''}
                    onChange={(e) => setOpeningBalanceData({ ...openingBalanceData, costPrice: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={handleSaveOpeningBalance}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all"
                  >
                    حفظ الرصيد
                  </button>
                  <button 
                    onClick={() => setShowOpeningBalanceModal(false)}
                    className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 py-3 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {(showAddModal || editingProduct) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowAddModal(false); setEditingProduct(null); }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white dark:bg-gray-800 w-full max-w-2xl rounded-3xl p-8 shadow-2xl overflow-hidden"
              dir="rtl"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold">{editingProduct ? 'تعديل منتج' : 'إضافة منتج جديد'}</h3>
                <button onClick={() => { setShowAddModal(false); setEditingProduct(null); }} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500">كود الصنف</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-emerald-500"
                    value={editingProduct ? editingProduct.code : newProduct.code}
                    onChange={(e) => editingProduct ? setEditingProduct({ ...editingProduct, code: e.target.value }) : setNewProduct({ ...newProduct, code: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500">اسم الصنف</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-emerald-500"
                    value={editingProduct ? editingProduct.name : newProduct.name}
                    onChange={(e) => editingProduct ? setEditingProduct({ ...editingProduct, name: e.target.value }) : setNewProduct({ ...newProduct, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500">الوحدة</label>
                  <select 
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-emerald-500"
                    value={editingProduct ? editingProduct.unit : newProduct.unit}
                    onChange={(e) => editingProduct ? setEditingProduct({ ...editingProduct, unit: e.target.value }) : setNewProduct({ ...newProduct, unit: e.target.value })}
                  >
                    {settings.units.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500">الكمية الحالية</label>
                  <input 
                    type="number" 
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-emerald-500"
                    value={editingProduct ? editingProduct.quantity : newProduct.quantity}
                    onChange={(e) => editingProduct ? setEditingProduct({ ...editingProduct, quantity: parseFloat(e.target.value) || 0 }) : setNewProduct({ ...newProduct, quantity: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500">سعر التكلفة</label>
                  <input 
                    type="number" 
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-emerald-500"
                    value={editingProduct ? editingProduct.costPrice : newProduct.costPrice}
                    onChange={(e) => editingProduct ? setEditingProduct({ ...editingProduct, costPrice: parseFloat(e.target.value) || 0 }) : setNewProduct({ ...newProduct, costPrice: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500">سعر البيع</label>
                  <input 
                    type="number" 
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-emerald-500"
                    value={editingProduct ? editingProduct.salePrice : newProduct.salePrice}
                    onChange={(e) => editingProduct ? setEditingProduct({ ...editingProduct, salePrice: parseFloat(e.target.value) || 0 }) : setNewProduct({ ...newProduct, salePrice: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500">الباركود</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-emerald-500"
                      value={editingProduct ? editingProduct.barcode : newProduct.barcode}
                      onChange={(e) => editingProduct ? setEditingProduct({ ...editingProduct, barcode: e.target.value }) : setNewProduct({ ...newProduct, barcode: e.target.value })}
                    />
                    <button 
                      type="button"
                      onClick={() => {
                        const barcode = Math.floor(100000000000 + Math.random() * 900000000000).toString();
                        if (editingProduct) setEditingProduct({ ...editingProduct, barcode });
                        else setNewProduct({ ...newProduct, barcode });
                      }}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                    >
                      <RefreshCw size={18} />
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500">الحد الأدنى للمخزون</label>
                  <input 
                    type="number" 
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-emerald-500"
                    value={editingProduct ? editingProduct.minStock : newProduct.minStock}
                    onChange={(e) => editingProduct ? setEditingProduct({ ...editingProduct, minStock: parseFloat(e.target.value) || 0 }) : setNewProduct({ ...newProduct, minStock: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="md:col-span-2 flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl">
                  <input 
                    type="checkbox"
                    id="showInPOS"
                    className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    checked={editingProduct ? (editingProduct.showInPOS !== false) : (newProduct.showInPOS !== false)}
                    onChange={(e) => editingProduct ? setEditingProduct({ ...editingProduct, showInPOS: e.target.checked }) : setNewProduct({ ...newProduct, showInPOS: e.target.checked })}
                  />
                  <label htmlFor="showInPOS" className="text-sm font-bold cursor-pointer">إظهار في نقطة البيع</label>
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                <button 
                  onClick={handleSaveProduct}
                  className="flex-1 bg-emerald-600 text-white py-3 rounded-2xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                >
                  <Save size={20} />
                  حفظ البيانات
                </button>
                <button 
                  onClick={() => { setShowAddModal(false); setEditingProduct(null); }}
                  className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 py-3 rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Inventory;
