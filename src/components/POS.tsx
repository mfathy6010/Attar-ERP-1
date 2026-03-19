import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  User, 
  Scale, 
  CreditCard, 
  Banknote, 
  Clock, 
  CheckCircle2,
  Printer,
  ChevronDown,
  X,
  Package,
  ShoppingCart
} from 'lucide-react';
import { useApp } from '../AppContext';
import { Product, InvoiceItem, Invoice } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

const POS: React.FC = () => {
  const { products, setProducts, customers, setCustomers, invoices, setInvoices, settings } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<InvoiceItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState(customers[0]);
  const [discount, setDiscount] = useState({ type: 'value', value: 0 });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'visa' | 'credit' | 'vodafone' | 'cash_credit'>('cash');
  const [suspendedOrders, setSuspendedOrders] = useState<any[]>([]);
  const [paidAmount, setPaidAmount] = useState<number>(0);

  React.useEffect(() => {
    let barcode = '';
    let lastKeyTime = Date.now();

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const currentTime = Date.now();
      
      // If more than 50ms passed since last key, it's probably manual typing, reset barcode
      if (currentTime - lastKeyTime > 50) {
        barcode = '';
      }
      
      lastKeyTime = currentTime;

      if (e.key === 'Enter' && barcode.length > 3) {
        // Barcode scanned
        const exactMatch = products.find(p => p.barcode === barcode || p.code === barcode);
        if (exactMatch) {
          addToCart(exactMatch);
          setSearchQuery(''); // Clear search query if it was focused
        }
        barcode = '';
        e.preventDefault(); // Prevent default enter behavior
      } else if (e.key.length === 1) {
        barcode += e.key;
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [products, cart]); // Depend on products and cart to get latest state in addToCart

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      (p.showInPOS !== false) && (p.name.includes(searchQuery) || p.code.includes(searchQuery) || (p.barcode && p.barcode.includes(searchQuery)))
    );
  }, [products, searchQuery]);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim() !== '') {
      const exactMatch = products.find(p => p.barcode === searchQuery.trim() || p.code === searchQuery.trim());
      if (exactMatch) {
        addToCart(exactMatch);
        setSearchQuery('');
      } else if (filteredProducts.length === 1) {
        addToCart(filteredProducts[0]);
        setSearchQuery('');
      }
    }
  };

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.productId === product.id);
    if (existing) {
      setCart(cart.map(item => 
        item.productId === product.id 
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
          : item
      ));
    } else {
      setCart([...cart, {
        productId: product.id,
        name: product.name,
        quantity: 1,
        price: product.salePrice,
        total: product.salePrice
      }]);
    }
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.productId === productId) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty, total: newQty * item.price };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const manualUpdateQuantity = (productId: string, value: string) => {
    const qty = parseFloat(value) || 0;
    setCart(cart.map(item => {
      if (item.productId === productId) {
        return { ...item, quantity: qty, total: qty * item.price };
      }
      return item;
    }).filter(item => item.quantity >= 0));
  };

  const subtotal = cart.reduce((acc, curr) => acc + curr.total, 0);
  const discountAmount = discount.type === 'percent' ? (subtotal * discount.value / 100) : discount.value;
  const taxAmount = settings.taxEnabled ? ((subtotal - discountAmount) * settings.taxRate / 100) : 0;
  const total = subtotal - discountAmount + taxAmount;
  const remainingAmount = total - paidAmount;

  const handleCompleteSale = () => {
    if (!selectedCustomer) {
      alert('يرجى اختيار عميل');
      return;
    }

    const newInvoice: Invoice = {
      id: Math.random().toString(36).substr(2, 9),
      number: `INV-${Date.now()}`,
      date: new Date().toISOString(),
      customerId: selectedCustomer.id,
      items: cart,
      subtotal,
      discount: discountAmount,
      tax: taxAmount,
      total,
      paidAmount,
      remainingAmount: total - paidAmount,
      paymentMethod,
      type: 'sale'
    };

    setInvoices([...invoices, newInvoice]);
    
    // Update customer totals and balance
    setCustomers(customers.map(c => {
      if (c.id === selectedCustomer.id) {
        const debt = total - paidAmount;
        const isLegacy = (c.balance || 0) < 0;
        return {
          ...c,
          totalPurchases: (c.totalPurchases || 0) + total,
          balance: isLegacy ? (c.balance || 0) - debt : (c.balance || 0) + debt
        };
      }
      return c;
    }));

    // Update stock
    setProducts(products.map(p => {
      const cartItem = cart.find(item => item.productId === p.id);
      if (cartItem) {
        return { ...p, quantity: p.quantity - cartItem.quantity };
      }
      return p;
    }));

    setCart([]);
    setPaidAmount(0);
    setShowPaymentModal(false);
    alert('تمت عملية البيع بنجاح!');
  };

  const suspendOrder = () => {
    if (cart.length === 0) return;
    if (!selectedCustomer) {
      alert('يرجى اختيار عميل');
      return;
    }
    setSuspendedOrders([...suspendedOrders, { id: Date.now(), cart, customer: selectedCustomer }]);
    setCart([]);
    alert('تم تعليق الطلب');
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Products Section */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        <div className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="البحث بالاسم، الكود، أو الباركود..."
            className="w-full pr-12 pl-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-emerald-500 outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pb-4">
          {filteredProducts.map(product => (
            <button
              key={product.id}
              onClick={() => addToCart(product)}
              className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all text-right flex flex-col gap-2 group"
            >
              <div className="w-full aspect-square bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/20 transition-colors">
                <Package size={32} />
              </div>
              <h4 className="font-bold text-sm truncate">{product.name}</h4>
              <p className="text-emerald-600 dark:text-emerald-400 font-bold">{product.salePrice} {settings.currency}</p>
              <p className="text-xs text-gray-500">متاح: {product.quantity} {product.unit}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Cart Section */}
      <div className="w-full lg:w-96 flex flex-col gap-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm h-full overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4">
          <h3 className="font-bold flex items-center gap-2">
            <ShoppingCart size={20} className="text-emerald-600" />
            سلة المشتريات
          </h3>
          <button onClick={() => setCart([])} className="text-gray-400 hover:text-red-500">
            <Trash2 size={20} />
          </button>
        </div>

        {/* Customer Selection */}
        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900/50 p-2 rounded-xl">
          <User size={18} className="text-gray-400" />
          <select 
            className="bg-transparent flex-1 outline-none text-sm font-medium"
            value={selectedCustomer?.id || ''}
            onChange={(e) => {
              const customer = customers.find(c => c.id === e.target.value);
              if (customer) setSelectedCustomer(customer);
            }}
          >
            <option value="" disabled>اختر عميل</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto space-y-3 py-2">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2">
              <ShoppingCart size={48} opacity={0.2} />
              <p className="text-sm">السلة فارغة</p>
            </div>
          ) : cart.map(item => (
            <div key={item.productId} className="flex items-center justify-between gap-2 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate">{item.name}</p>
                <p className="text-xs text-gray-500">{item.price} × {item.quantity}</p>
              </div>
              <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-1">
                <button onClick={() => updateQuantity(item.productId, -1)} className="p-1 hover:text-emerald-600"><Minus size={14} /></button>
                <input 
                  type="number" 
                  className="text-xs font-bold w-12 text-center bg-transparent outline-none"
                  value={item.quantity}
                  onChange={(e) => manualUpdateQuantity(item.productId, e.target.value)}
                />
                <button onClick={() => updateQuantity(item.productId, 1)} className="p-1 hover:text-emerald-600"><Plus size={14} /></button>
              </div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-sm text-emerald-600">{item.total.toFixed(2)}</p>
                <button 
                  onClick={() => setCart(cart.filter(i => i.productId !== item.productId))}
                  className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="border-t border-gray-100 dark:border-gray-700 pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">المجموع الفرعي:</span>
            <span className="font-bold">{subtotal.toFixed(2)} {settings.currency}</span>
          </div>
          <div className="flex justify-between text-sm items-center">
            <span className="text-gray-500">الخصم:</span>
            <div className="flex items-center gap-2">
              <input 
                type="number" 
                className="w-16 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded px-1 py-0.5 text-xs text-center"
                value={discount.value}
                onChange={(e) => setDiscount({ ...discount, value: parseFloat(e.target.value) || 0 })}
              />
              <select 
                className="bg-transparent text-xs font-bold"
                value={discount.type}
                onChange={(e) => setDiscount({ ...discount, type: e.target.value as any })}
              >
                <option value="value">ج.م</option>
                <option value="percent">%</option>
              </select>
            </div>
          </div>
          {settings.taxEnabled && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">الضريبة ({settings.taxRate}%):</span>
              <span className="font-bold">{taxAmount.toFixed(2)} {settings.currency}</span>
            </div>
          )}
          <div className="flex justify-between text-xl font-black text-emerald-600 pt-2">
            <span>الإجمالي:</span>
            <span>{total.toFixed(2)} {settings.currency}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2 mt-2">
          <button 
            onClick={suspendOrder}
            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
          >
            <Clock size={18} />
            تعليق
          </button>
          <button 
            onClick={() => {
              setPaidAmount(total);
              setShowPaymentModal(true);
            }}
            disabled={cart.length === 0}
            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-900/20"
          >
            <CheckCircle2 size={18} />
            دفع
          </button>
        </div>
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPaymentModal(false)}
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
                <h3 className="text-2xl font-bold">إتمام الدفع</h3>
                <button onClick={() => setShowPaymentModal(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
              </div>

              <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-2xl text-center mb-8">
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">المبلغ المطلوب سداده</p>
                <h2 className="text-4xl font-black text-emerald-600">{total.toFixed(2)} <span className="text-lg font-bold">{settings.currency}</span></h2>
                
                <div className="mt-4 pt-4 border-t border-emerald-100 dark:border-emerald-800 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">المبلغ المدفوع</p>
                    <input 
                      type="number" 
                      className="w-full bg-white dark:bg-gray-800 border border-emerald-200 dark:border-emerald-700 rounded-lg px-2 py-1 text-center font-bold text-emerald-600 outline-none focus:ring-2 focus:ring-emerald-500"
                      value={paidAmount || ''}
                      onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">{remainingAmount >= 0 ? 'المبلغ المتبقي' : 'الباقي (الفكة)'}</p>
                    <div className={`w-full rounded-lg px-2 py-1 text-center font-bold ${remainingAmount >= 0 ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600'}`}>
                      {Math.abs(remainingAmount).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <p className="font-bold text-sm text-gray-500">اختر طريقة الدفع:</p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'cash', label: 'نقدي', icon: Banknote },
                    { id: 'cash_credit', label: 'نقدي/آجل', icon: CreditCard },
                    { id: 'credit', label: 'آجل', icon: Clock },
                    { id: 'vodafone', label: 'فودافون كاش', icon: CheckCircle2 },
                  ].map(method => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id as any)}
                      className={`flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                        paymentMethod === method.id 
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' 
                          : 'border-gray-100 dark:border-gray-700 hover:border-emerald-200'
                      }`}
                    >
                      <method.icon size={24} />
                      <span className="font-bold text-sm">{method.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                <button 
                  onClick={handleCompleteSale}
                  className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2"
                >
                  <Printer size={20} />
                  تأكيد وطباعة
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default POS;
