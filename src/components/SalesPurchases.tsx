import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  FileText, 
  ArrowUpRight, 
  ArrowDownRight, 
  User, 
  Truck, 
  Filter, 
  Calendar,
  ChevronDown,
  X,
  Save,
  Printer,
  Trash2,
  Edit,
  Eye,
  Phone,
  Mail,
  MapPin,
  Upload,
  Download,
  DollarSign
} from 'lucide-react';
import { useApp } from '../AppContext';
import { Invoice, Product, Supplier, Customer } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

const SalesPurchases: React.FC<{ initialTab?: 'sales' | 'purchases' | 'customers' | 'suppliers' }> = ({ initialTab = 'sales' }) => {
  const { 
    invoices, setInvoices, 
    products, setProducts, 
    customers, setCustomers, 
    suppliers, setSuppliers, 
    settings 
  } = useApp();
  const [activeTab, setActiveTab] = useState<'sales' | 'purchases' | 'customers' | 'suppliers'>(initialTab);
  const [showAddPurchaseModal, setShowAddPurchaseModal] = useState(false);
  const [showEntityModal, setShowEntityModal] = useState(false);
  const [entityType, setEntityType] = useState<'customer' | 'supplier'>('customer');
  const [editingEntity, setEditingEntity] = useState<Customer | Supplier | null>(null);
  const [viewingEntity, setViewingEntity] = useState<Customer | Supplier | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState({ entityId: '', amount: 0, date: new Date().toISOString().split('T')[0], notes: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void } | null>(null);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) {
          if (activeTab === 'customers') {
            setCustomers([...customers, ...json]);
          } else if (activeTab === 'suppliers') {
            setSuppliers([...suppliers, ...json]);
          } else if (activeTab === 'sales' || activeTab === 'purchases') {
            setInvoices([...invoices, ...json]);
          }
          alert('تم استيراد البيانات بنجاح');
        } else {
          alert('تنسيق الملف غير صحيح. يجب أن يكون مصفوفة.');
        }
      } catch (err) {
        alert('حدث خطأ أثناء قراءة الملف. تأكد من أنه ملف JSON صحيح.');
      }
    };
    reader.readAsText(file);
  };

  const exportToCSV = () => {
    let dataToExport: any[] = [];
    let filename = '';

    if (activeTab === 'customers') {
      dataToExport = customers;
      filename = 'customers.csv';
    } else if (activeTab === 'suppliers') {
      dataToExport = suppliers;
      filename = 'suppliers.csv';
    } else if (activeTab === 'sales') {
      dataToExport = invoices.filter(i => i.type === 'sale' || i.type === 'sale_return');
      filename = 'sales.csv';
    } else if (activeTab === 'purchases') {
      dataToExport = invoices.filter(i => i.type === 'purchase' || i.type === 'purchase_return');
      filename = 'purchases.csv';
    }

    if (dataToExport.length === 0) {
      alert('لا توجد بيانات للتصدير');
      return;
    }

    const headers = Object.keys(dataToExport[0]).join(',');
    const csvRows = dataToExport.map(row => {
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
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredInvoices = invoices.filter(i => {
    const isType = activeTab === 'sales' 
      ? (i.type === 'sale' || i.type === 'sale_return' || i.type === 'payment_in') 
      : (i.type === 'purchase' || i.type === 'purchase_return' || i.type === 'payment_out');
    return isType && (i.number.includes(searchQuery) || (i.customerId || i.supplierId || '').includes(searchQuery));
  });

  const filteredCustomers = customers.filter(c => 
    c.name.includes(searchQuery) || c.phone.includes(searchQuery) || c.email.includes(searchQuery)
  );

  const filteredSuppliers = suppliers.filter(s => 
    s.name.includes(searchQuery) || s.phone.includes(searchQuery) || s.email.includes(searchQuery)
  );

  const [newPurchase, setNewPurchase] = useState<Partial<Invoice>>({
    number: `PUR-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    items: [],
    subtotal: 0,
    discount: 0,
    tax: 0,
    total: 0,
    paidAmount: 0,
    remainingAmount: 0,
    paymentMethod: 'cash',
    type: 'purchase'
  });

  const [newEntity, setNewEntity] = useState<Partial<Customer | Supplier>>({
    name: '',
    phone: '',
    email: '',
    address: '',
    balance: 0,
    totalPurchases: 0
  });

  const addPurchaseItem = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const newItem = {
      productId: product.id,
      name: product.name,
      quantity: 1,
      price: product.costPrice,
      total: product.costPrice
    };

    const updatedItems = [...(newPurchase.items || []), newItem];
    const newSubtotal = updatedItems.reduce((acc, curr) => acc + curr.total, 0);
    const newTotal = newSubtotal;
    setNewPurchase({ 
      ...newPurchase, 
      items: updatedItems, 
      subtotal: newSubtotal, 
      total: newTotal,
      paidAmount: newPurchase.paymentMethod === 'credit' ? (newPurchase.paidAmount || 0) : newTotal,
      remainingAmount: newPurchase.paymentMethod === 'credit' ? newTotal - (newPurchase.paidAmount || 0) : 0
    });
  };

  const handleAddPurchase = () => {
    if (!newPurchase.items?.length) return;
    
    const invoiceToAdd: Invoice = {
      ...newPurchase as Invoice,
      id: newPurchase.id || Math.random().toString(36).substr(2, 9)
    };

    if (newPurchase.id) {
      setInvoices(invoices.map(inv => inv.id === invoiceToAdd.id ? invoiceToAdd : inv));
    } else {
      setInvoices([...invoices, invoiceToAdd]);
    }

    // Update customer/supplier totals
    if (invoiceToAdd.type === 'purchase' || invoiceToAdd.type === 'purchase_return') {
      if (invoiceToAdd.supplierId) {
        setSuppliers(suppliers.map(s => {
          if (s.id === invoiceToAdd.supplierId) {
            const amount = invoiceToAdd.type === 'purchase' ? invoiceToAdd.total : -invoiceToAdd.total;
            const debt = invoiceToAdd.type === 'purchase' ? (invoiceToAdd.remainingAmount || 0) : -(invoiceToAdd.remainingAmount || 0);
            const isLegacy = (s.balance || 0) < 0;
            return {
              ...s,
              totalPurchases: (s.totalPurchases || 0) + amount,
              balance: invoiceToAdd.paymentMethod === 'credit' 
                ? (isLegacy ? (s.balance || 0) - debt : (s.balance || 0) + debt)
                : (s.balance || 0)
            };
          }
          return s;
        }));
      }
    } else if (invoiceToAdd.type === 'sale' || invoiceToAdd.type === 'sale_return') {
      if (invoiceToAdd.customerId) {
        setCustomers(customers.map(c => {
          if (c.id === invoiceToAdd.customerId) {
            const amount = invoiceToAdd.type === 'sale' ? invoiceToAdd.total : -invoiceToAdd.total;
            const debt = invoiceToAdd.type === 'sale' ? (invoiceToAdd.remainingAmount || 0) : -(invoiceToAdd.remainingAmount || 0);
            const isLegacy = (c.balance || 0) < 0;
            return {
              ...c,
              totalPurchases: (c.totalPurchases || 0) + amount,
              balance: invoiceToAdd.paymentMethod === 'credit' 
                ? (isLegacy ? (c.balance || 0) - debt : (c.balance || 0) + debt)
                : (c.balance || 0)
            };
          }
          return c;
        }));
      }
    }

    // Update stock and cost prices
    setProducts(products.map(p => {
      const item = invoiceToAdd.items.find(i => i.productId === p.id);
      if (item) {
        let qtyChange = 0;
        if (invoiceToAdd.type === 'purchase') qtyChange = item.quantity;
        else if (invoiceToAdd.type === 'purchase_return') qtyChange = -item.quantity;
        else if (invoiceToAdd.type === 'sale') qtyChange = -item.quantity;
        else if (invoiceToAdd.type === 'sale_return') qtyChange = item.quantity;

        const newQty = p.quantity + qtyChange;
        
        // Update cost price only on purchases
        let newCostPrice = p.costPrice;
        if (invoiceToAdd.type === 'purchase' && newQty > 0) {
          const oldTotalCost = p.quantity * p.costPrice;
          const newTotalCost = item.quantity * item.price;
          newCostPrice = (oldTotalCost + newTotalCost) / newQty;
        }

        return { 
          ...p, 
          quantity: newQty, 
          costPrice: newCostPrice 
        };
      }
      return p;
    }));

    setShowAddPurchaseModal(false);
    alert('تم تسجيل العملية وتحديث البيانات بنجاح!');
  };

  const handleDeleteInvoice = (invoice: Invoice) => {
    setConfirmModal({
      isOpen: true,
      title: 'تأكيد الحذف',
      message: 'هل أنت متأكد من حذف هذه الفاتورة؟ سيتم التراجع عن حركات المخزون والحسابات المرتبطة بها.',
      onConfirm: () => {
        // 1. Reverse stock changes
        setProducts(products.map(p => {
          const item = invoice.items.find(i => i.productId === p.id);
          if (item) {
            let qtyChange = 0;
            if (invoice.type === 'sale') qtyChange = item.quantity;
            else if (invoice.type === 'purchase') qtyChange = -item.quantity;
            else if (invoice.type === 'sale_return') qtyChange = -item.quantity;
            else if (invoice.type === 'purchase_return') qtyChange = item.quantity;

            return { ...p, quantity: p.quantity + qtyChange };
          }
          return p;
        }));

        // 2. Reverse customer/supplier balance
        if (invoice.type === 'sale' || invoice.type === 'sale_return' || invoice.type === 'payment_in') {
          if (invoice.customerId) {
            setCustomers(customers.map(c => {
              if (c.id === invoice.customerId) {
                let amount = 0;
                let debt = 0;
                if (invoice.type === 'sale') {
                  amount = invoice.total;
                  debt = invoice.remainingAmount || 0;
                } else if (invoice.type === 'sale_return') {
                  amount = -invoice.total;
                  debt = -(invoice.remainingAmount || 0);
                } else if (invoice.type === 'payment_in') {
                  amount = invoice.total;
                  debt = -invoice.total; // Reversing payment increases debt
                }
                
                const isLegacy = (c.balance || 0) < 0;
                const newBalance = isLegacy ? (c.balance || 0) + debt : (c.balance || 0) - debt;

                return {
                  ...c,
                  totalPurchases: invoice.type !== 'payment_in' ? (c.totalPurchases || 0) - amount : (c.totalPurchases || 0),
                  balance: invoice.type === 'payment_in' ? newBalance : (invoice.paymentMethod === 'credit' ? newBalance : (c.balance || 0))
                };
              }
              return c;
            }));
          }
        } else if (invoice.type === 'purchase' || invoice.type === 'purchase_return' || invoice.type === 'payment_out') {
          if (invoice.supplierId) {
            setSuppliers(suppliers.map(s => {
              if (s.id === invoice.supplierId) {
                let amount = 0;
                let debt = 0;
                if (invoice.type === 'purchase') {
                  amount = invoice.total;
                  debt = invoice.remainingAmount || 0;
                } else if (invoice.type === 'purchase_return') {
                  amount = -invoice.total;
                  debt = -(invoice.remainingAmount || 0);
                } else if (invoice.type === 'payment_out') {
                  amount = invoice.total;
                  debt = -invoice.total; // Reversing payment increases debt
                }
                
                const isLegacy = (s.balance || 0) < 0;
                const newBalance = isLegacy ? (s.balance || 0) + debt : (s.balance || 0) - debt;

                return {
                  ...s,
                  totalPurchases: invoice.type !== 'payment_out' ? (s.totalPurchases || 0) - amount : (s.totalPurchases || 0),
                  balance: invoice.type === 'payment_out' ? newBalance : (invoice.paymentMethod === 'credit' ? newBalance : (s.balance || 0))
                };
              }
              return s;
            }));
          }
        }

        // 3. Remove invoice
        setInvoices(invoices.filter(i => i.id !== invoice.id));
        setConfirmModal(null);
      }
    });
  };

  const handlePaymentSubmit = () => {
    if (!paymentData.entityId || paymentData.amount <= 0) {
      alert('يرجى اختيار العميل/المورد وإدخال مبلغ صحيح');
      return;
    }
    
    if (activeTab === 'customers') {
      setCustomers(customers.map(c => {
        if (c.id === paymentData.entityId) {
          const isLegacy = (c.balance || 0) < 0;
          return { ...c, balance: isLegacy ? (c.balance || 0) + paymentData.amount : (c.balance || 0) - paymentData.amount };
        }
        return c;
      }));
      
      const newPayment: Invoice = {
        id: Math.random().toString(36).substr(2, 9),
        number: `PAY-IN-${Date.now()}`,
        date: paymentData.date,
        customerId: paymentData.entityId,
        items: [],
        subtotal: paymentData.amount,
        discount: 0,
        tax: 0,
        total: paymentData.amount,
        paidAmount: paymentData.amount,
        remainingAmount: 0,
        paymentMethod: 'cash',
        type: 'payment_in'
      };
      setInvoices([...invoices, newPayment]);
      
    } else {
      setSuppliers(suppliers.map(s => {
        if (s.id === paymentData.entityId) {
          const isLegacy = (s.balance || 0) < 0;
          return { ...s, balance: isLegacy ? (s.balance || 0) + paymentData.amount : (s.balance || 0) - paymentData.amount };
        }
        return s;
      }));
      
      const newPayment: Invoice = {
        id: Math.random().toString(36).substr(2, 9),
        number: `PAY-OUT-${Date.now()}`,
        date: paymentData.date,
        supplierId: paymentData.entityId,
        items: [],
        subtotal: paymentData.amount,
        discount: 0,
        tax: 0,
        total: paymentData.amount,
        paidAmount: paymentData.amount,
        remainingAmount: 0,
        paymentMethod: 'cash',
        type: 'payment_out'
      };
      setInvoices([...invoices, newPayment]);
    }
    
    setShowPaymentModal(false);
    alert('تم تحصيل الدفعة بنجاح!');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">المبيعات والمشتريات</h1>
          <p className="text-gray-500 dark:text-gray-400">إدارة الفواتير، المرتجعات، وحسابات العملاء والموردين</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer">
            <Upload size={18} />
            استيراد
            <input type="file" accept=".json" className="hidden" onChange={handleImport} />
          </label>
          <button 
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
          >
            <Download size={18} />
            تصدير
          </button>
        </div>
        {activeTab === 'sales' && (
          <div className="flex gap-2">
            <button 
              onClick={() => {
                setNewPurchase({ 
                  number: `SAL-${Date.now()}`, 
                  date: new Date().toISOString().split('T')[0], 
                  items: [], 
                  subtotal: 0, 
                  discount: 0, 
                  tax: 0, 
                  total: 0, 
                  paymentMethod: 'cash', 
                  type: 'sale' 
                });
                setShowAddPurchaseModal(true);
              }}
              className="flex items-center gap-2 px-6 py-2 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/20"
            >
              <Plus size={18} />
              تسجيل مبيعات
            </button>
            <button 
              onClick={() => {
                setNewPurchase({ 
                  number: `SRET-${Date.now()}`, 
                  date: new Date().toISOString().split('T')[0], 
                  items: [], 
                  subtotal: 0, 
                  discount: 0, 
                  tax: 0, 
                  total: 0, 
                  paymentMethod: 'cash', 
                  type: 'sale_return' 
                });
                setShowAddPurchaseModal(true);
              }}
              className="flex items-center gap-2 px-6 py-2 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 transition-all shadow-lg shadow-red-900/20"
            >
              <ArrowDownRight size={18} />
              مرتجع مبيعات
            </button>
          </div>
        )}
        {activeTab === 'purchases' && (
          <div className="flex gap-2">
            <button 
              onClick={() => {
                setNewPurchase({ 
                  number: `PUR-${Date.now()}`, 
                  date: new Date().toISOString().split('T')[0], 
                  items: [], 
                  subtotal: 0, 
                  discount: 0, 
                  tax: 0, 
                  total: 0, 
                  paymentMethod: 'cash', 
                  type: 'purchase' 
                });
                setShowAddPurchaseModal(true);
              }}
              className="flex items-center gap-2 px-6 py-2 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/20"
            >
              <Plus size={18} />
              تسجيل مشتريات
            </button>
            <button 
              onClick={() => {
                setNewPurchase({ 
                  number: `PRET-${Date.now()}`, 
                  date: new Date().toISOString().split('T')[0], 
                  items: [], 
                  subtotal: 0, 
                  discount: 0, 
                  tax: 0, 
                  total: 0, 
                  paymentMethod: 'cash', 
                  type: 'purchase_return' 
                });
                setShowAddPurchaseModal(true);
              }}
              className="flex items-center gap-2 px-6 py-2 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 transition-all shadow-lg shadow-red-900/20"
            >
              <ArrowUpRight size={18} />
              مرتجع مشتريات
            </button>
          </div>
        )}
        {(activeTab === 'customers' || activeTab === 'suppliers') && (
          <div className="flex gap-2">
            <button 
              onClick={() => {
                setPaymentData({ entityId: '', amount: 0, date: new Date().toISOString().split('T')[0], notes: '' });
                setShowPaymentModal(true);
              }}
              className="flex items-center gap-2 px-6 py-2 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20"
            >
              <DollarSign size={18} />
              {activeTab === 'customers' ? 'تحصيل دفعة' : 'سداد دفعة'}
            </button>
            <button 
              onClick={() => {
                setEntityType(activeTab === 'customers' ? 'customer' : 'supplier');
                setEditingEntity(null);
                setNewEntity({ name: '', phone: '', email: '', address: '', balance: 0 });
                setShowEntityModal(true);
              }}
              className="flex items-center gap-2 px-6 py-2 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/20"
            >
              <Plus size={18} />
              إضافة {activeTab === 'customers' ? 'عميل' : 'مورد'} جديد
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-1 rounded-2xl border border-gray-100 dark:border-gray-700 w-fit">
        {[
          { id: 'sales', label: 'المبيعات', icon: ArrowUpRight },
          { id: 'purchases', label: 'المشتريات', icon: ArrowDownRight },
          { id: 'customers', label: 'العملاء', icon: User },
          { id: 'suppliers', label: 'الموردين', icon: Truck },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl font-bold text-sm transition-all ${
              activeTab === tab.id 
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' 
                : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="البحث برقم الفاتورة أو الاسم..."
              className="w-full pr-12 pl-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-600 dark:text-gray-300">
              <Calendar size={18} />
              التاريخ
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-600 dark:text-gray-300">
              <Filter size={18} />
              تصفية
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100 dark:border-gray-700">
                {(activeTab === 'sales' || activeTab === 'purchases') ? (
                  <>
                    <th className="px-6 py-4 font-bold">رقم الفاتورة</th>
                    <th className="px-6 py-4 font-bold">التاريخ</th>
                    <th className="px-6 py-4 font-bold">{activeTab === 'sales' ? 'العميل' : 'المورد'}</th>
                    <th className="px-6 py-4 font-bold">طريقة الدفع</th>
                    <th className="px-6 py-4 font-bold">الإجمالي</th>
                  </>
                ) : (
                  <>
                    <th className="px-6 py-4 font-bold">الاسم</th>
                    <th className="px-6 py-4 font-bold">رقم الهاتف</th>
                    <th className="px-6 py-4 font-bold">إجمالي المشتريات</th>
                    <th className="px-6 py-4 font-bold">المستحق</th>
                  </>
                )}
                <th className="px-6 py-4 font-bold">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {activeTab === 'sales' || activeTab === 'purchases' ? (
                filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">لا توجد فواتير حالياً</td>
                  </tr>
                ) : filteredInvoices.map(invoice => (
                  <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono font-bold text-gray-600 dark:text-gray-300">
                      <div className="flex flex-col gap-1">
                        <span>{invoice.number}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full w-fit ${
                          invoice.type === 'sale' ? 'bg-emerald-100 text-emerald-700' :
                          invoice.type === 'sale_return' ? 'bg-red-100 text-red-700' :
                          invoice.type === 'purchase' ? 'bg-blue-100 text-blue-700' :
                          invoice.type === 'purchase_return' ? 'bg-amber-100 text-amber-700' :
                          invoice.type === 'payment_in' ? 'bg-purple-100 text-purple-700' :
                          'bg-indigo-100 text-indigo-700'
                        }`}>
                          {invoice.type === 'sale' ? 'مبيعات' :
                           invoice.type === 'sale_return' ? 'مرتجع مبيعات' :
                           invoice.type === 'purchase' ? 'مشتريات' :
                           invoice.type === 'purchase_return' ? 'مرتجع مشتريات' :
                           invoice.type === 'payment_in' ? 'سند قبض' :
                           'سند صرف'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">{new Date(invoice.date).toLocaleDateString('ar-EG')}</td>
                    <td className="px-6 py-4 text-sm">
                      {activeTab === 'sales' 
                        ? customers.find(c => c.id === invoice.customerId)?.name || 'عميل نقدي'
                        : suppliers.find(s => s.id === invoice.supplierId)?.name || 'مورد عام'
                      }
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold">
                        {invoice.paymentMethod === 'cash' ? 'نقدي' : invoice.paymentMethod === 'visa' ? 'فيزا' : 'آجل'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-emerald-600">{invoice.total.toFixed(2)} {settings.currency}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-gray-400 hover:text-emerald-600 transition-all"><Printer size={16} /></button>
                        <button className="p-2 text-gray-400 hover:text-blue-600 transition-all"><FileText size={16} /></button>
                        {invoice.type !== 'payment_in' && invoice.type !== 'payment_out' && (
                          <button 
                            onClick={() => {
                              setNewPurchase(invoice);
                              setShowAddPurchaseModal(true);
                            }}
                            className="p-2 text-gray-400 hover:text-amber-600 transition-all"
                          >
                            <Edit size={16} />
                          </button>
                        )}
                        <button 
                          onClick={() => handleDeleteInvoice(invoice)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                (activeTab === 'customers' ? filteredCustomers : filteredSuppliers).length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">لا توجد بيانات حالياً</td>
                  </tr>
                ) : (activeTab === 'customers' ? filteredCustomers : filteredSuppliers).map(entity => (
                  <tr key={entity.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold">{entity.name}</td>
                    <td className="px-6 py-4 text-sm">{entity.phone}</td>
                    <td className="px-6 py-4 text-sm font-bold text-blue-600">{(entity.totalPurchases || 0).toFixed(2)} {settings.currency}</td>
                    <td className="px-6 py-4 font-bold text-red-600">{Math.abs(entity.balance || 0).toFixed(2)} {settings.currency}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setViewingEntity(entity)}
                          className="p-2 text-gray-400 hover:text-emerald-600 transition-all"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => {
                            setEntityType(activeTab === 'customers' ? 'customer' : 'supplier');
                            setEditingEntity(entity);
                            setNewEntity(entity);
                            setShowEntityModal(true);
                          }}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-all"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => {
                            setConfirmModal({
                              isOpen: true,
                              title: 'تأكيد الحذف',
                              message: 'هل أنت متأكد من حذف هذا السجل؟',
                              onConfirm: () => {
                                if (activeTab === 'customers') {
                                  setCustomers(customers.filter(c => c.id !== entity.id));
                                } else {
                                  setSuppliers(suppliers.filter(s => s.id !== entity.id));
                                }
                                setConfirmModal(null);
                              }
                            });
                          }}
                          className="p-2 text-gray-400 hover:text-red-600 transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
                <h3 className="text-2xl font-bold">تحصيل دفعة ({activeTab === 'customers' ? 'عميل' : 'مورد'})</h3>
                <button onClick={() => setShowPaymentModal(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500">{activeTab === 'customers' ? 'العميل' : 'المورد'}</label>
                  <select 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    value={paymentData.entityId}
                    onChange={(e) => setPaymentData({ ...paymentData, entityId: e.target.value })}
                  >
                    <option value="">اختر {activeTab === 'customers' ? 'العميل' : 'المورد'}</option>
                    {(activeTab === 'customers' ? customers : suppliers).map(entity => (
                      <option key={entity.id} value={entity.id}>{entity.name} (الرصيد: {Math.abs(entity.balance || 0).toFixed(2)})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500">المبلغ</label>
                  <input 
                    type="number" 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    value={paymentData.amount || ''}
                    onChange={(e) => setPaymentData({ ...paymentData, amount: parseFloat(e.target.value) || 0 })}
                  />
                  {paymentData.entityId && (
                    <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl mt-2">
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400">الرصيد المتبقي:</span>
                      <span className="text-lg font-black text-blue-700 dark:text-blue-300" dir="ltr">
                        {(() => {
                          const entity = (activeTab === 'customers' ? customers : suppliers).find(e => e.id === paymentData.entityId);
                          const balance = entity?.balance || 0;
                          const isLegacy = balance < 0;
                          const remaining = isLegacy ? balance + paymentData.amount : balance - paymentData.amount;
                          return Math.abs(remaining).toFixed(2);
                        })()} {settings.currency}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500">التاريخ</label>
                  <input 
                    type="date" 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    value={paymentData.date}
                    onChange={(e) => setPaymentData({ ...paymentData, date: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500">ملاحظات</label>
                  <textarea 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
                    rows={3}
                    value={paymentData.notes}
                    onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={handlePaymentSubmit}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all"
                  >
                    تأكيد التحصيل
                  </button>
                  <button 
                    onClick={() => setShowPaymentModal(false)}
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

      {/* Add Purchase Modal */}
      <AnimatePresence>
        {showAddPurchaseModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddPurchaseModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white dark:bg-gray-800 w-full max-w-4xl rounded-3xl p-8 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
              dir="rtl"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold">
                  {newPurchase.type === 'purchase' ? 'تسجيل فاتورة مشتريات جديدة' :
                   newPurchase.type === 'sale' ? 'تسجيل فاتورة مبيعات جديدة' :
                   newPurchase.type === 'sale_return' ? 'مرتجع مبيعات' :
                   'مرتجع مشتريات'}
                </h3>
                <button onClick={() => setShowAddPurchaseModal(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500">رقم الفاتورة</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none"
                    value={newPurchase.number}
                    readOnly
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500">التاريخ</label>
                  <input 
                    type="date" 
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none"
                    value={newPurchase.date}
                    onChange={(e) => setNewPurchase({ ...newPurchase, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500">
                    {newPurchase.type === 'sale' || newPurchase.type === 'sale_return' ? 'العميل' : 'المورد'}
                  </label>
                  <select 
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none"
                    value={(newPurchase.type === 'sale' || newPurchase.type === 'sale_return' ? newPurchase.customerId : newPurchase.supplierId) || ''}
                    onChange={(e) => {
                      if (newPurchase.type === 'sale' || newPurchase.type === 'sale_return') {
                        setNewPurchase({ ...newPurchase, customerId: e.target.value });
                      } else {
                        setNewPurchase({ ...newPurchase, supplierId: e.target.value });
                      }
                    }}
                  >
                    <option value="">اختر {newPurchase.type === 'sale' || newPurchase.type === 'sale_return' ? 'العميل' : 'المورد'}</option>
                    {(newPurchase.type === 'sale' || newPurchase.type === 'sale_return' ? customers : suppliers).map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold">الأصناف</h4>
                  <button 
                    onClick={() => {
                      const newItem = { productId: '', quantity: 1, price: 0, total: 0 };
                      const updatedItems = [...newPurchase.items, newItem];
                      const newSubtotal = updatedItems.reduce((sum, i) => sum + i.total, 0);
                      const newTotal = newSubtotal;
                      setNewPurchase({ 
                        ...newPurchase, 
                        items: updatedItems,
                        subtotal: newSubtotal,
                        total: newTotal,
                        paidAmount: newPurchase.paymentMethod === 'credit' ? (newPurchase.paidAmount || 0) : newTotal,
                        remainingAmount: newPurchase.paymentMethod === 'credit' ? newTotal - (newPurchase.paidAmount || 0) : 0
                      });
                    }}
                    className="text-sm text-emerald-600 font-bold flex items-center gap-1"
                  >
                    <Plus size={16} /> إضافة صنف
                  </button>
                </div>
                <div className="space-y-3">
                  {newPurchase.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400">الصنف</label>
                        <select 
                          className="w-full bg-transparent outline-none text-sm font-bold"
                          value={item.productId}
                          onChange={(e) => {
                            const product = products.find(p => p.id === e.target.value);
                            const price = product ? (newPurchase.type === 'sale' || newPurchase.type === 'sale_return' ? product.salePrice : product.costPrice) : 0;
                            const updatedItems = [...newPurchase.items];
                            updatedItems[index] = { 
                              ...item, 
                              productId: e.target.value,
                              price: price,
                              total: price * item.quantity
                            };
                            const newSubtotal = updatedItems.reduce((sum, i) => sum + i.total, 0);
                            const newTotal = newSubtotal;
                            setNewPurchase({ 
                              ...newPurchase, 
                              items: updatedItems,
                              subtotal: newSubtotal,
                              total: newTotal,
                              paidAmount: newPurchase.paymentMethod === 'credit' ? (newPurchase.paidAmount || 0) : newTotal,
                              remainingAmount: newPurchase.paymentMethod === 'credit' ? newTotal - (newPurchase.paidAmount || 0) : 0
                            });
                          }}
                        >
                          <option value="">اختر الصنف</option>
                          {products.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400">الكمية</label>
                        <input 
                          type="number" 
                          className="w-full bg-transparent outline-none text-sm font-bold"
                          value={item.quantity}
                          onChange={(e) => {
                            const qty = parseFloat(e.target.value) || 0;
                            const updatedItems = [...newPurchase.items];
                            updatedItems[index] = { ...item, quantity: qty, total: qty * item.price };
                            const newSubtotal = updatedItems.reduce((sum, i) => sum + i.total, 0);
                            const newTotal = newSubtotal;
                            setNewPurchase({ 
                              ...newPurchase, 
                              items: updatedItems,
                              subtotal: newSubtotal,
                              total: newTotal,
                              paidAmount: newPurchase.paymentMethod === 'credit' ? (newPurchase.paidAmount || 0) : newTotal,
                              remainingAmount: newPurchase.paymentMethod === 'credit' ? newTotal - (newPurchase.paidAmount || 0) : 0
                            });
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400">
                          {newPurchase.type === 'sale' || newPurchase.type === 'sale_return' ? 'سعر البيع' : 'سعر الشراء'}
                        </label>
                        <input 
                          type="number" 
                          className="w-full bg-transparent outline-none text-sm font-bold"
                          value={item.price}
                          onChange={(e) => {
                            const price = parseFloat(e.target.value) || 0;
                            const updatedItems = [...newPurchase.items];
                            updatedItems[index] = { ...item, price: price, total: price * item.quantity };
                            const newSubtotal = updatedItems.reduce((sum, i) => sum + i.total, 0);
                            const newTotal = newSubtotal;
                            setNewPurchase({ 
                              ...newPurchase, 
                              items: updatedItems,
                              subtotal: newSubtotal,
                              total: newTotal,
                              paidAmount: newPurchase.paymentMethod === 'credit' ? (newPurchase.paidAmount || 0) : newTotal,
                              remainingAmount: newPurchase.paymentMethod === 'credit' ? newTotal - (newPurchase.paidAmount || 0) : 0
                            });
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400">الإجمالي</label>
                          <div className="text-sm font-bold text-emerald-600">{item.total.toFixed(2)}</div>
                        </div>
                        <button 
                          onClick={() => {
                            const updatedItems = newPurchase.items.filter((_, i) => i !== index);
                            const newSubtotal = updatedItems.reduce((sum, i) => sum + i.total, 0);
                            const newTotal = newSubtotal;
                            setNewPurchase({ 
                              ...newPurchase, 
                              items: updatedItems,
                              subtotal: newSubtotal,
                              total: newTotal,
                              paidAmount: newPurchase.paymentMethod === 'credit' ? (newPurchase.paidAmount || 0) : newTotal,
                              remainingAmount: newPurchase.paymentMethod === 'credit' ? newTotal - (newPurchase.paidAmount || 0) : 0
                            });
                          }}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-bold text-gray-500 w-24">طريقة الدفع</label>
                    <div className="flex gap-2">
                      {['cash', 'visa', 'credit'].map(method => (
                        <button
                          key={method}
                          onClick={() => setNewPurchase({ 
                            ...newPurchase, 
                            paymentMethod: method as any,
                            paidAmount: method === 'credit' ? 0 : newPurchase.total,
                            remainingAmount: method === 'credit' ? newPurchase.total : 0
                          })}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            newPurchase.paymentMethod === method 
                              ? 'bg-emerald-600 text-white' 
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
                          }`}
                        >
                          {method === 'cash' ? 'نقدي' : method === 'visa' ? 'فيزا' : 'آجل'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-3xl space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">الإجمالي الفرعي</span>
                    <span className="font-bold">{newPurchase.subtotal.toFixed(2)} {settings.currency}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-3 border-t border-gray-200 dark:border-gray-700">
                    <span>الإجمالي النهائي</span>
                    <span className="text-emerald-600">{newPurchase.total.toFixed(2)} {settings.currency}</span>
                  </div>
                  {newPurchase.paymentMethod === 'credit' && (
                    <>
                      <div className="flex justify-between items-center text-sm pt-3 border-t border-gray-200 dark:border-gray-700">
                        <span className="text-gray-500">المبلغ المدفوع</span>
                        <input 
                          type="number" 
                          className="w-32 px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 outline-none focus:ring-2 focus:ring-emerald-500 text-left"
                          value={newPurchase.paidAmount || ''}
                          onChange={(e) => {
                            const paid = parseFloat(e.target.value) || 0;
                            setNewPurchase({ 
                              ...newPurchase, 
                              paidAmount: paid,
                              remainingAmount: newPurchase.total - paid
                            });
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-sm font-bold">
                        <span className="text-red-500">المبلغ المتبقي</span>
                        <span className="text-red-600">{(newPurchase.total - (newPurchase.paidAmount || 0)).toFixed(2)} {settings.currency}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                <button 
                  onClick={handleAddPurchase}
                  className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                >
                  <Save size={20} />
                  حفظ الفاتورة
                </button>
                <button 
                  onClick={() => setShowAddPurchaseModal(false)}
                  className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 py-4 rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add/Edit Entity Modal */}
      <AnimatePresence>
        {showEntityModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEntityModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white dark:bg-gray-800 w-full max-w-lg rounded-3xl p-8 shadow-2xl overflow-hidden"
              dir="rtl"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold">
                  {editingEntity ? 'تعديل' : 'إضافة'} {entityType === 'customer' ? 'عميل' : 'مورد'}
                </h3>
                <button onClick={() => setShowEntityModal(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500">الاسم</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none"
                    value={newEntity.name}
                    onChange={(e) => setNewEntity({ ...newEntity, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500">رقم الهاتف</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none"
                      value={newEntity.phone}
                      onChange={(e) => setNewEntity({ ...newEntity, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500">الرصيد الافتتاحي</label>
                    <input 
                      type="number" 
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none"
                      value={newEntity.balance}
                      onChange={(e) => setNewEntity({ ...newEntity, balance: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500">البريد الإلكتروني</label>
                  <input 
                    type="email" 
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none"
                    value={newEntity.email}
                    onChange={(e) => setNewEntity({ ...newEntity, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500">العنوان</label>
                  <textarea 
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none h-24 resize-none"
                    value={newEntity.address}
                    onChange={(e) => setNewEntity({ ...newEntity, address: e.target.value })}
                  ></textarea>
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                <button 
                  onClick={() => {
                    if (!newEntity.name) return;
                    if (editingEntity) {
                      if (entityType === 'customer') {
                        setCustomers(customers.map(c => c.id === editingEntity.id ? { ...newEntity as Customer } : c));
                      } else {
                        setSuppliers(suppliers.map(s => s.id === editingEntity.id ? { ...newEntity as Supplier } : s));
                      }
                    } else {
                      const entityToAdd = {
                        ...newEntity,
                        id: Math.random().toString(36).substr(2, 9)
                      };
                      if (entityType === 'customer') {
                        setCustomers([...customers, entityToAdd as Customer]);
                      } else {
                        setSuppliers([...suppliers, entityToAdd as Supplier]);
                      }
                    }
                    setShowEntityModal(false);
                  }}
                  className="flex-1 bg-emerald-600 text-white py-3 rounded-2xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                >
                  <Save size={20} />
                  حفظ البيانات
                </button>
                <button 
                  onClick={() => setShowEntityModal(false)}
                  className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 py-3 rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Entity Details Modal */}
      <AnimatePresence>
        {viewingEntity && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewingEntity(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white dark:bg-gray-800 w-full max-w-lg rounded-3xl p-8 shadow-2xl overflow-hidden"
              dir="rtl"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold">تفاصيل {activeTab === 'customers' ? 'العميل' : 'المورد'}</h3>
                <button onClick={() => setViewingEntity(null)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                  <div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full">
                    <User size={32} />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold">{viewingEntity.name}</h4>
                    <p className="text-gray-500 text-sm">إجمالي المشتريات: {(viewingEntity.totalPurchases || 0).toFixed(2)} {settings.currency}</p>
                    <p className="text-gray-500 text-sm">رصيد الحساب: {Math.abs(viewingEntity.balance || 0).toFixed(2)} {settings.currency}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                    <Phone size={18} className="text-emerald-600" />
                    <span className="font-medium">{viewingEntity.phone || 'لا يوجد رقم هاتف'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                    <Mail size={18} className="text-emerald-600" />
                    <span className="font-medium">{viewingEntity.email || 'لا يوجد بريد إلكتروني'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                    <MapPin size={18} className="text-emerald-600" />
                    <span className="font-medium">{viewingEntity.address || 'لا يوجد عنوان مسجل'}</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
                  <h5 className="font-bold mb-4">آخر العمليات</h5>
                  <div className="space-y-3">
                    {invoices.filter(i => i.customerId === viewingEntity.id || i.supplierId === viewingEntity.id).slice(0, 3).map(inv => (
                      <div key={inv.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/30 rounded-xl text-sm">
                        <span className="font-mono font-bold">{inv.number}</span>
                        <span className="text-gray-500">{new Date(inv.date).toLocaleDateString('ar-EG')}</span>
                        <span className="font-bold text-emerald-600">{inv.total.toFixed(2)}</span>
                      </div>
                    ))}
                    {invoices.filter(i => i.customerId === viewingEntity.id || i.supplierId === viewingEntity.id).length === 0 && (
                      <p className="text-center text-gray-400 text-sm py-4">لا توجد عمليات مسجلة لهذا الحساب</p>
                    )}
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setViewingEntity(null)}
                className="w-full mt-8 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 py-3 rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
              >
                إغلاق
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SalesPurchases;
