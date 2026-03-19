import React, { useState } from 'react';
import { 
  FileText, 
  PieChart, 
  BarChart3, 
  ChevronRight, 
  ChevronDown, 
  Folder, 
  File, 
  Search, 
  Download,
  Printer,
  X,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Plus
} from 'lucide-react';
import { useApp } from '../AppContext';
import { Account } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

const Accounting: React.FC<{ initialTab?: 'coa' | 'reports' | 'expenses' | 'cash', initialReport?: string | null }> = ({ initialTab = 'coa', initialReport = null }) => {
  const { accounts, setAccounts, settings, invoices, products, expenses, setExpenses, customers, suppliers } = useApp();
  const [activeTab, setActiveTab] = useState<'coa' | 'reports' | 'expenses' | 'cash'>(initialTab);
  const [selectedReport, setSelectedReport] = useState<string | null>(initialReport);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: 0,
    category: 'عام',
    date: new Date().toISOString().split('T')[0]
  });
  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(new Set(['1', '2', '3', '4', '5', '12']));

  const generateEgyptianCOA = () => {
    if (window.confirm('هل أنت متأكد من إنشاء شجرة الحسابات المصرية؟ سيتم استبدال الحسابات الحالية.')) {
      const egyptianCOA: Account[] = [
        { id: '1', code: '1', name: 'الأصول', type: 'asset', balance: 0 },
        { id: '11', code: '11', name: 'الأصول الثابتة', type: 'asset', balance: 0, parent: '1' },
        { id: '111', code: '111', name: 'الآلات والمعدات', type: 'asset', balance: 0, parent: '11' },
        { id: '112', code: '112', name: 'وسائل نقل وانتقال', type: 'asset', balance: 0, parent: '11' },
        { id: '113', code: '113', name: 'أثاث وتجهيزات مكتبية', type: 'asset', balance: 0, parent: '11' },
        { id: '12', code: '12', name: 'الأصول المتداولة', type: 'asset', balance: 0, parent: '1' },
        { id: '121', code: '121', name: 'النقدية بالصندوق والبنوك', type: 'asset', balance: 0, parent: '12' },
        { id: '1211', code: '1211', name: 'الصندوق الرئيسي', type: 'asset', balance: 0, parent: '121' },
        { id: '1212', code: '1212', name: 'البنك الأهلي المصري', type: 'asset', balance: 0, parent: '121' },
        { id: '122', code: '122', name: 'العملاء', type: 'asset', balance: 0, parent: '12' },
        { id: '123', code: '123', name: 'المخزون', type: 'asset', balance: 0, parent: '12' },
        { id: '1231', code: '1231', name: 'مخزون بضاعة بغرض البيع', type: 'asset', balance: 0, parent: '123' },
        { id: '1232', code: '1232', name: 'مخزون خامات', type: 'asset', balance: 0, parent: '123' },
        { id: '2', code: '2', name: 'الخصوم', type: 'liability', balance: 0 },
        { id: '21', code: '21', name: 'الخصوم المتداولة', type: 'liability', balance: 0, parent: '2' },
        { id: '211', code: '211', name: 'الموردين', type: 'liability', balance: 0, parent: '21' },
        { id: '212', code: '212', name: 'أوراق دفع', type: 'liability', balance: 0, parent: '21' },
        { id: '213', code: '213', name: 'مصروفات مستحقة', type: 'liability', balance: 0, parent: '21' },
        { id: '3', code: '3', name: 'حقوق الملكية', type: 'equity', balance: 0 },
        { id: '31', code: '31', name: 'رأس المال', type: 'equity', balance: 0, parent: '3' },
        { id: '32', code: '32', name: 'الأرباح المحتجزة', type: 'equity', balance: 0, parent: '3' },
        { id: '33', code: '33', name: 'جاري الشركاء', type: 'equity', balance: 0, parent: '3' },
        { id: '4', code: '4', name: 'الإيرادات', type: 'revenue', balance: 0 },
        { id: '41', code: '41', name: 'إيرادات المبيعات', type: 'revenue', balance: 0, parent: '4' },
        { id: '42', code: '42', name: 'إيرادات أخرى', type: 'revenue', balance: 0, parent: '4' },
        { id: '5', code: '5', name: 'المصروفات', type: 'expense', balance: 0 },
        { id: '51', code: '51', name: 'تكلفة المبيعات', type: 'expense', balance: 0, parent: '5' },
        { id: '52', code: '52', name: 'المصروفات العمومية والإدارية', type: 'expense', balance: 0, parent: '5' },
        { id: '521', code: '521', name: 'الأجور والرواتب', type: 'expense', balance: 0, parent: '52' },
        { id: '522', code: '522', name: 'الإيجارات', type: 'expense', balance: 0, parent: '52' },
        { id: '523', code: '523', name: 'الكهرباء والمياه', type: 'expense', balance: 0, parent: '52' },
        { id: '524', code: '524', name: 'مصروفات بنكية', type: 'expense', balance: 0, parent: '52' }
      ];
      setAccounts(egyptianCOA);
    }
  };

  const toggleAccount = (id: string) => {
    const next = new Set(expandedAccounts);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedAccounts(next);
  };

  const renderAccountRow = (account: Account, depth: number = 0) => {
    const children = accounts.filter(a => a.parent === account.id);
    const isExpanded = expandedAccounts.has(account.id);
    const hasChildren = children.length > 0;

    return (
      <React.Fragment key={account.id}>
        <tr className={`hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors cursor-pointer ${depth === 0 ? 'bg-gray-50/50 dark:bg-gray-900/20 font-bold' : ''}`} onClick={() => hasChildren && toggleAccount(account.id)}>
          <td className="px-6 py-3 text-sm">
            <div className="flex items-center gap-2" style={{ paddingRight: `${depth * 1.5}rem` }}>
              {hasChildren ? (
                isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
              ) : (
                <div className="w-3.5" />
              )}
              {hasChildren ? <Folder size={16} className="text-amber-500" /> : <File size={16} className="text-gray-400" />}
              <span>{account.code} - {account.name}</span>
            </div>
          </td>
          <td className="px-6 py-3 text-sm text-center">
            <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
              account.type === 'asset' ? 'bg-blue-100 text-blue-600' :
              account.type === 'liability' ? 'bg-red-100 text-red-600' :
              account.type === 'revenue' ? 'bg-emerald-100 text-emerald-600' :
              'bg-gray-100 text-gray-600'
            }`}>
              {account.type}
            </span>
          </td>
          <td className="px-6 py-3 text-sm font-bold text-left">{account.balance.toLocaleString()} {settings.currency}</td>
        </tr>
        {hasChildren && isExpanded && children.map(child => renderAccountRow(child, depth + 1))}
      </React.Fragment>
    );
  };

  const reportCategories = [
    {
      title: 'التقارير المالية الختامية',
      reports: [
        { id: 'pl', title: 'قائمة الدخل (الأرباح والخسائر)', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
        { id: 'trial', title: 'ميزان المراجعة', icon: BarChart3, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
        { id: 'balance', title: 'الميزانية العمومية', icon: PieChart, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
        { id: 'cash_flow', title: 'حركة الصندوق والنقدية', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-100/50 dark:bg-emerald-900/30' },
      ]
    },
    {
      title: 'تقارير المبيعات',
      reports: [
        { id: 'sales_daily', title: 'المبيعات اليومية', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
        { id: 'sales_by_item', title: 'المبيعات حسب الصنف', icon: Package, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
        { id: 'sales_by_customer', title: 'المبيعات حسب العميل', icon: FileText, color: 'text-cyan-600', bg: 'bg-cyan-50 dark:bg-cyan-900/20' },
        { id: 'sales_credit', title: 'الفواتير الآجلة', icon: FileText, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
        { id: 'sales_top_items', title: 'أكثر الأصناف مبيعاً', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
      ]
    },
    {
      title: 'تقارير المشتريات',
      reports: [
        { id: 'purchases_daily', title: 'المشتريات اليومية', icon: FileText, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
        { id: 'purchases_by_supplier', title: 'المشتريات حسب المورد', icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
        { id: 'purchases_unpaid', title: 'فواتير شراء غير مدفوعة', icon: FileText, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
        { id: 'purchases_top_items', title: 'الأصناف الأكثر شراءً', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
      ]
    },
    {
      title: 'تقارير المخزون',
      reports: [
        { id: 'inventory_balance', title: 'رصيد المخزون', icon: Package, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
        { id: 'inventory_movement', title: 'حركة الصنف', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
        { id: 'inventory_low', title: 'الأصناف الناقصة', icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
        { id: 'inventory_stagnant', title: 'الأصناف الراكدة', icon: FileText, color: 'text-gray-600', bg: 'bg-gray-50 dark:bg-gray-900/20' },
        { id: 'inventory_audit', title: 'تقرير الجرد', icon: Printer, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
      ]
    }
  ];

  const allReports = reportCategories.flatMap(c => c.reports);

  const inventoryStats = {
    totalItems: products.length,
    totalCostValue: products.reduce((acc, p) => acc + (p.costPrice * p.quantity), 0),
    totalSaleValue: products.reduce((acc, p) => acc + (p.salePrice * p.quantity), 0),
    lowStockCount: products.filter(p => p.quantity <= p.minStock).length
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">الحسابات والتقارير</h1>
          <p className="text-gray-500 dark:text-gray-400">إدارة شجرة الحسابات والتقارير المالية الختامية</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
            <Printer size={18} />
            طباعة
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
            <Download size={18} />
            تصدير
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-1 rounded-2xl border border-gray-100 dark:border-gray-700 w-fit">
        <button
          onClick={() => setActiveTab('coa')}
          className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'coa' ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          شجرة الحسابات
        </button>
        <button
          onClick={() => setActiveTab('cash')}
          className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'cash' ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          الصندوق والنقدية
        </button>
        <button
          onClick={() => setActiveTab('expenses')}
          className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'expenses' ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          المصروفات
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'reports' ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          التقارير المالية
        </button>
      </div>

      {activeTab === 'coa' && (
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <div className="relative max-w-md w-full">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="البحث في شجرة الحسابات..."
                className="w-full pr-12 pl-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
              />
            </div>
            {accounts.length === 0 && (
              <button 
                onClick={generateEgyptianCOA}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-all mr-4"
              >
                <Plus size={18} />
                إنشاء شجرة الحسابات المصرية
              </button>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100 dark:border-gray-700">
                  <th className="px-6 py-4 font-bold">الحساب</th>
                  <th className="px-6 py-4 font-bold text-center">النوع</th>
                  <th className="px-6 py-4 font-bold text-left">الرصيد</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {accounts.filter(a => !a.parent).map(account => renderAccountRow(account))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'cash' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-3xl border border-emerald-100 dark:border-emerald-900/30">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-800/50 rounded-xl text-emerald-600 dark:text-emerald-400">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">إجمالي المقبوضات</p>
                  <h3 className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
                    {invoices.filter(i => i.type === 'sale' || i.type === 'purchase_return' || i.type === 'payment_in').reduce((sum, i) => sum + (i.paidAmount !== undefined ? i.paidAmount : i.total), 0).toLocaleString()} {settings.currency}
                  </h3>
                </div>
              </div>
            </div>
            
            <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-3xl border border-red-100 dark:border-red-900/30">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-red-100 dark:bg-red-800/50 rounded-xl text-red-600 dark:text-red-400">
                  <TrendingDown size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold text-red-600 dark:text-red-400">إجمالي المدفوعات</p>
                  <h3 className="text-2xl font-black text-red-700 dark:text-red-300">
                    {(invoices.filter(i => i.type === 'purchase' || i.type === 'sale_return' || i.type === 'payment_out').reduce((sum, i) => sum + (i.paidAmount !== undefined ? i.paidAmount : i.total), 0) + expenses.reduce((sum, e) => sum + e.amount, 0)).toLocaleString()} {settings.currency}
                  </h3>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-3xl border border-blue-100 dark:border-blue-900/30">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-800/50 rounded-xl text-blue-600 dark:text-blue-400">
                  <DollarSign size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold text-blue-600 dark:text-blue-400">الرصيد الحالي (الصندوق)</p>
                  <h3 className="text-2xl font-black text-blue-700 dark:text-blue-300">
                    {(
                      invoices.filter(i => i.type === 'sale' || i.type === 'purchase_return' || i.type === 'payment_in').reduce((sum, i) => sum + (i.paidAmount !== undefined ? i.paidAmount : i.total), 0) -
                      invoices.filter(i => i.type === 'purchase' || i.type === 'sale_return' || i.type === 'payment_out').reduce((sum, i) => sum + (i.paidAmount !== undefined ? i.paidAmount : i.total), 0) -
                      expenses.reduce((sum, e) => sum + e.amount, 0)
                    ).toLocaleString()} {settings.currency}
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'expenses' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">سجل المصروفات</h2>
            <button 
              onClick={() => setShowAddExpenseModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-all"
            >
              <Plus size={18} />
              إضافة مصروف
            </button>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
            <table className="w-full text-right" dir="rtl">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                  <th className="px-6 py-4 text-sm font-bold text-gray-500">التاريخ</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-500">البيان</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-500">الفئة</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-500 text-left">المبلغ</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map(expense => (
                  <tr key={expense.id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-900/30">
                    <td className="px-6 py-4 text-sm">{expense.date}</td>
                    <td className="px-6 py-4 text-sm font-bold">{expense.description}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-xs">{expense.category}</span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-red-500 text-left">{expense.amount.toLocaleString()} {settings.currency}</td>
                  </tr>
                ))}
                {expenses.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">لا توجد مصروفات مسجلة</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-8">
          {reportCategories.map((category, idx) => (
            <div key={idx} className="space-y-4">
              <h2 className="text-xl font-bold border-r-4 border-emerald-500 pr-4">{category.title}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {category.reports.map(report => (
                  <button
                    key={report.id}
                    onClick={() => setSelectedReport(report.id)}
                    className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col items-center text-center gap-4 group"
                  >
                    <div className={`p-4 rounded-2xl ${report.bg} ${report.color} group-hover:scale-110 transition-transform`}>
                      <report.icon size={28} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm">{report.title}</h3>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Report Modal */}
      <AnimatePresence>
        {selectedReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedReport(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white dark:bg-gray-800 w-full max-w-4xl rounded-3xl p-8 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
              dir="rtl"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold">{allReports.find(r => r.id === selectedReport)?.title}</h3>
                <button onClick={() => setSelectedReport(null)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-6">
                {selectedReport === 'trial' ? (
                  <div className="border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden">
                    <table className="w-full text-right text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-900/50">
                        <tr>
                          <th className="px-6 py-3 font-bold">كود الحساب</th>
                          <th className="px-6 py-3 font-bold">اسم الحساب</th>
                          <th className="px-6 py-3 font-bold text-left">مدين</th>
                          <th className="px-6 py-3 font-bold text-left">دائن</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {accounts.filter(a => a.balance !== 0).map(account => (
                          <tr key={account.id}>
                            <td className="px-6 py-3 font-mono">{account.code}</td>
                            <td className="px-6 py-3 font-bold">{account.name}</td>
                            <td className="px-6 py-3 text-left">
                              {(account.type === 'asset' || account.type === 'expense') ? account.balance.toLocaleString() : '-'}
                            </td>
                            <td className="px-6 py-3 text-left">
                              {(account.type === 'liability' || account.type === 'equity' || account.type === 'revenue') ? Math.abs(account.balance).toLocaleString() : '-'}
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-gray-50 dark:bg-gray-900/50 font-black">
                          <td colSpan={2} className="px-6 py-4 text-lg">الإجمالي</td>
                          <td className="px-6 py-4 text-left text-lg">
                            {accounts.filter(a => a.type === 'asset' || a.type === 'expense').reduce((sum, a) => sum + a.balance, 0).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-left text-lg">
                            {Math.abs(accounts.filter(a => a.type === 'liability' || a.type === 'equity' || a.type === 'revenue').reduce((sum, a) => sum + a.balance, 0)).toLocaleString()}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ) : selectedReport === 'balance' ? (
                  <div className="space-y-8">
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <h4 className="font-bold text-lg border-b pb-2 text-blue-600">الأصول</h4>
                        {accounts.filter(a => a.type === 'asset' && !a.parent).map(asset => (
                          <div key={asset.id} className="flex justify-between items-center text-sm">
                            <span>{asset.name}</span>
                            <span className="font-bold">{asset.balance.toLocaleString()} {settings.currency}</span>
                          </div>
                        ))}
                        <div className="flex justify-between items-center pt-4 border-t font-black text-blue-700">
                          <span>إجمالي الأصول</span>
                          <span>{accounts.filter(a => a.type === 'asset').reduce((sum, a) => sum + a.balance, 0).toLocaleString()} {settings.currency}</span>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h4 className="font-bold text-lg border-b pb-2 text-red-600">الخصوم وحقوق الملكية</h4>
                        <div className="space-y-2">
                          <p className="text-xs font-bold text-gray-400 uppercase">الخصوم</p>
                          {accounts.filter(a => a.type === 'liability' && !a.parent).map(liab => (
                            <div key={liab.id} className="flex justify-between items-center text-sm">
                              <span>{liab.name}</span>
                              <span className="font-bold">{Math.abs(liab.balance).toLocaleString()} {settings.currency}</span>
                            </div>
                          ))}
                        </div>
                        <div className="space-y-2 pt-4">
                          <p className="text-xs font-bold text-gray-400 uppercase">حقوق الملكية</p>
                          {accounts.filter(a => a.type === 'equity' && !a.parent).map(eq => (
                            <div key={eq.id} className="flex justify-between items-center text-sm">
                              <span>{eq.name}</span>
                              <span className="font-bold">{Math.abs(eq.balance).toLocaleString()} {settings.currency}</span>
                            </div>
                          ))}
                          {/* Add Net Profit to Equity */}
                          <div className="flex justify-between items-center text-sm italic text-emerald-600">
                            <span>صافي أرباح الفترة</span>
                            <span className="font-bold">
                              {(
                                (invoices.filter(inv => inv.type === 'sale').reduce((acc, inv) => acc + inv.total, 0) - 
                                 invoices.filter(inv => inv.type === 'sale_return').reduce((acc, inv) => acc + inv.total, 0)) -
                                expenses.reduce((acc, exp) => acc + exp.amount, 0) -
                                (invoices.filter(inv => inv.type === 'purchase').reduce((acc, inv) => acc + inv.total, 0) -
                                 invoices.filter(inv => inv.type === 'purchase_return').reduce((acc, inv) => acc + inv.total, 0))
                              ).toLocaleString()} {settings.currency}
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t font-black text-red-700">
                          <span>إجمالي الخصوم وحقوق الملكية</span>
                          <span>
                            {(
                              Math.abs(accounts.filter(a => a.type === 'liability' || a.type === 'equity').reduce((sum, a) => sum + a.balance, 0)) +
                              ((invoices.filter(inv => inv.type === 'sale').reduce((acc, inv) => acc + inv.total, 0) - 
                                invoices.filter(inv => inv.type === 'sale_return').reduce((acc, inv) => acc + inv.total, 0)) -
                               expenses.reduce((acc, exp) => acc + exp.amount, 0) -
                               (invoices.filter(inv => inv.type === 'purchase').reduce((acc, inv) => acc + inv.total, 0) -
                                invoices.filter(inv => inv.type === 'purchase_return').reduce((acc, inv) => acc + inv.total, 0)))
                            ).toLocaleString()} {settings.currency}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : selectedReport === 'cash_flow' ? (
                  <div className="space-y-6">
                    <div className="border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden">
                      <table className="w-full text-right text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-900/50">
                          <tr>
                            <th className="px-6 py-3 font-bold">التاريخ</th>
                            <th className="px-6 py-3 font-bold">البيان</th>
                            <th className="px-6 py-3 font-bold">النوع</th>
                            <th className="px-6 py-3 font-bold text-left">وارد</th>
                            <th className="px-6 py-3 font-bold text-left">صادر</th>
                            <th className="px-6 py-3 font-bold text-left">الرصيد</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                          {(() => {
                            const movements: any[] = [];
                            invoices.forEach(inv => {
                              if (inv.paidAmount && inv.paidAmount > 0) {
                                movements.push({
                                  date: inv.date,
                                  desc: `فاتورة ${inv.type === 'sale' ? 'مبيعات' : inv.type === 'purchase' ? 'مشتريات' : 'دفع'} رقم ${inv.number}`,
                                  type: (inv.type === 'sale' || inv.type === 'purchase_return' || inv.type === 'payment_in') ? 'وارد' : 'صادر',
                                  amount: inv.paidAmount
                                });
                              }
                            });
                            expenses.forEach(exp => {
                              movements.push({
                                date: exp.date,
                                desc: `مصروف: ${exp.description}`,
                                type: 'صادر',
                                amount: exp.amount
                              });
                            });
                            
                            movements.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                            
                            let runningBalance = 0;
                            return movements.map((m, idx) => {
                              if (m.type === 'وارد') runningBalance += m.amount;
                              else runningBalance -= m.amount;
                              
                              return (
                                <tr key={idx}>
                                  <td className="px-6 py-3">{new Date(m.date).toLocaleDateString('ar-EG')}</td>
                                  <td className="px-6 py-3 font-bold">{m.desc}</td>
                                  <td className="px-6 py-3">
                                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${m.type === 'وارد' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                      {m.type}
                                    </span>
                                  </td>
                                  <td className="px-6 py-3 text-left text-emerald-600 font-bold">{m.type === 'وارد' ? m.amount.toLocaleString() : '-'}</td>
                                  <td className="px-6 py-3 text-left text-red-600 font-bold">{m.type === 'صادر' ? m.amount.toLocaleString() : '-'}</td>
                                  <td className="px-6 py-3 text-left font-black">{runningBalance.toLocaleString()}</td>
                                </tr>
                              );
                            });
                          })()}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : selectedReport === 'sales_daily' ? (
                  <div className="border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden">
                    <table className="w-full text-right text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-900/50">
                        <tr>
                          <th className="px-6 py-3 font-bold">التاريخ</th>
                          <th className="px-6 py-3 font-bold">عدد الفواتير</th>
                          <th className="px-6 py-3 font-bold text-left">إجمالي المبيعات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {(() => {
                          const dailySales: { [date: string]: { count: number, total: number } } = {};
                          invoices.filter(i => i.type === 'sale').forEach(inv => {
                            const date = inv.date.split('T')[0];
                            if (!dailySales[date]) dailySales[date] = { count: 0, total: 0 };
                            dailySales[date].count++;
                            dailySales[date].total += inv.total;
                          });
                          return Object.entries(dailySales).sort((a, b) => b[0].localeCompare(a[0])).map(([date, data]) => (
                            <tr key={date}>
                              <td className="px-6 py-3">{new Date(date).toLocaleDateString('ar-EG')}</td>
                              <td className="px-6 py-3">{data.count}</td>
                              <td className="px-6 py-3 text-left font-bold">{data.total.toLocaleString()} {settings.currency}</td>
                            </tr>
                          ));
                        })()}
                      </tbody>
                    </table>
                  </div>
                ) : selectedReport === 'sales_by_item' ? (
                  <div className="border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden">
                    <table className="w-full text-right text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-900/50">
                        <tr>
                          <th className="px-6 py-3 font-bold">الصنف</th>
                          <th className="px-6 py-3 font-bold">الكمية المباعة</th>
                          <th className="px-6 py-3 font-bold text-left">إجمالي المبيعات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {(() => {
                          const itemSales: { [id: string]: { name: string, qty: number, total: number } } = {};
                          invoices.filter(i => i.type === 'sale').forEach(inv => {
                            inv.items.forEach(item => {
                              if (!itemSales[item.productId]) itemSales[item.productId] = { name: item.name, qty: 0, total: 0 };
                              itemSales[item.productId].qty += item.quantity;
                              itemSales[item.productId].total += item.total;
                            });
                          });
                          return Object.values(itemSales).sort((a, b) => b.total - a.total).map((data, idx) => (
                            <tr key={idx}>
                              <td className="px-6 py-3 font-bold">{data.name}</td>
                              <td className="px-6 py-3">{data.qty.toLocaleString()}</td>
                              <td className="px-6 py-3 text-left font-bold">{data.total.toLocaleString()} {settings.currency}</td>
                            </tr>
                          ));
                        })()}
                      </tbody>
                    </table>
                  </div>
                ) : selectedReport === 'purchases_daily' ? (
                  <div className="border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden">
                    <table className="w-full text-right text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-900/50">
                        <tr>
                          <th className="px-6 py-3 font-bold">التاريخ</th>
                          <th className="px-6 py-3 font-bold">عدد الفواتير</th>
                          <th className="px-6 py-3 font-bold text-left">إجمالي المشتريات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {(() => {
                          const dailyPurchases: { [date: string]: { count: number, total: number } } = {};
                          invoices.filter(i => i.type === 'purchase').forEach(inv => {
                            const date = inv.date.split('T')[0];
                            if (!dailyPurchases[date]) dailyPurchases[date] = { count: 0, total: 0 };
                            dailyPurchases[date].count++;
                            dailyPurchases[date].total += inv.total;
                          });
                          return Object.entries(dailyPurchases).sort((a, b) => b[0].localeCompare(a[0])).map(([date, data]) => (
                            <tr key={date}>
                              <td className="px-6 py-3">{new Date(date).toLocaleDateString('ar-EG')}</td>
                              <td className="px-6 py-3">{data.count}</td>
                              <td className="px-6 py-3 text-left font-bold">{data.total.toLocaleString()} {settings.currency}</td>
                            </tr>
                          ));
                        })()}
                      </tbody>
                    </table>
                  </div>
                ) : selectedReport === 'sales_by_customer' ? (
                  <div className="border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden">
                    <table className="w-full text-right text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-900/50">
                        <tr>
                          <th className="px-6 py-3 font-bold">العميل</th>
                          <th className="px-6 py-3 font-bold">عدد الفواتير</th>
                          <th className="px-6 py-3 font-bold text-left">إجمالي المبيعات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {(() => {
                          const customerSales: { [id: string]: { name: string, count: number, total: number } } = {};
                          invoices.filter(i => i.type === 'sale').forEach(inv => {
                            const cId = inv.customerId || 'cash';
                            if (!customerSales[cId]) {
                              const customer = customers.find(c => c.id === cId);
                              customerSales[cId] = { name: customer?.name || 'عميل نقدي', count: 0, total: 0 };
                            }
                            customerSales[cId].count++;
                            customerSales[cId].total += inv.total;
                          });
                          return Object.values(customerSales).sort((a, b) => b.total - a.total).map((data, idx) => (
                            <tr key={idx}>
                              <td className="px-6 py-3 font-bold">{data.name}</td>
                              <td className="px-6 py-3">{data.count}</td>
                              <td className="px-6 py-3 text-left font-bold">{data.total.toLocaleString()} {settings.currency}</td>
                            </tr>
                          ));
                        })()}
                      </tbody>
                    </table>
                  </div>
                ) : selectedReport === 'sales_credit' ? (
                  <div className="border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden">
                    <table className="w-full text-right text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-900/50">
                        <tr>
                          <th className="px-6 py-3 font-bold">رقم الفاتورة</th>
                          <th className="px-6 py-3 font-bold">العميل</th>
                          <th className="px-6 py-3 font-bold">التاريخ</th>
                          <th className="px-6 py-3 font-bold text-left">المبلغ المتبقي</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {invoices.filter(i => i.type === 'sale' && i.remainingAmount && i.remainingAmount > 0).map(inv => (
                          <tr key={inv.id}>
                            <td className="px-6 py-3 font-mono font-bold">{inv.number}</td>
                            <td className="px-6 py-3">{customers.find(c => c.id === inv.customerId)?.name || 'عميل نقدي'}</td>
                            <td className="px-6 py-3">{new Date(inv.date).toLocaleDateString('ar-EG')}</td>
                            <td className="px-6 py-3 text-left font-bold text-red-500">{inv.remainingAmount?.toLocaleString()} {settings.currency}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : selectedReport === 'purchases_by_supplier' ? (
                  <div className="border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden">
                    <table className="w-full text-right text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-900/50">
                        <tr>
                          <th className="px-6 py-3 font-bold">المورد</th>
                          <th className="px-6 py-3 font-bold">عدد الفواتير</th>
                          <th className="px-6 py-3 font-bold text-left">إجمالي المشتريات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {(() => {
                          const supplierPurchases: { [id: string]: { name: string, count: number, total: number } } = {};
                          invoices.filter(i => i.type === 'purchase').forEach(inv => {
                            const sId = inv.supplierId || 'general';
                            if (!supplierPurchases[sId]) {
                              const supplier = suppliers.find(s => s.id === sId);
                              supplierPurchases[sId] = { name: supplier?.name || 'مورد عام', count: 0, total: 0 };
                            }
                            supplierPurchases[sId].count++;
                            supplierPurchases[sId].total += inv.total;
                          });
                          return Object.values(supplierPurchases).sort((a, b) => b.total - a.total).map((data, idx) => (
                            <tr key={idx}>
                              <td className="px-6 py-3 font-bold">{data.name}</td>
                              <td className="px-6 py-3">{data.count}</td>
                              <td className="px-6 py-3 text-left font-bold">{data.total.toLocaleString()} {settings.currency}</td>
                            </tr>
                          ));
                        })()}
                      </tbody>
                    </table>
                  </div>
                ) : selectedReport === 'inventory_low' ? (
                  <div className="border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden">
                    <table className="w-full text-right text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-900/50">
                        <tr>
                          <th className="px-6 py-3 font-bold">الصنف</th>
                          <th className="px-6 py-3 font-bold">الرصيد الحالي</th>
                          <th className="px-6 py-3 font-bold">حد الطلب</th>
                          <th className="px-6 py-3 font-bold text-left">الحالة</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {products.filter(p => p.quantity <= p.minStock).map(product => (
                          <tr key={product.id}>
                            <td className="px-6 py-3 font-bold">{product.name}</td>
                            <td className="px-6 py-3 text-red-600 font-bold">{product.quantity} {product.unit}</td>
                            <td className="px-6 py-3">{product.minStock} {product.unit}</td>
                            <td className="px-6 py-3 text-left">
                              <span className="px-2 py-1 bg-red-100 text-red-600 rounded-lg text-[10px] font-bold">منخفض جداً</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : selectedReport === 'sales_top_items' ? (
                  <div className="border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden">
                    <table className="w-full text-right text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-900/50">
                        <tr>
                          <th className="px-6 py-3 font-bold">الصنف</th>
                          <th className="px-6 py-3 font-bold">الكمية المباعة</th>
                          <th className="px-6 py-3 font-bold text-left">إجمالي المبيعات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {(() => {
                          const itemSales: { [id: string]: { name: string, qty: number, total: number } } = {};
                          invoices.filter(i => i.type === 'sale').forEach(inv => {
                            inv.items.forEach(item => {
                              if (!itemSales[item.productId]) itemSales[item.productId] = { name: item.name, qty: 0, total: 0 };
                              itemSales[item.productId].qty += item.quantity;
                              itemSales[item.productId].total += item.total;
                            });
                          });
                          return Object.values(itemSales).sort((a, b) => b.qty - a.qty).slice(0, 10).map((data, idx) => (
                            <tr key={idx}>
                              <td className="px-6 py-3 font-bold">{data.name}</td>
                              <td className="px-6 py-3">{data.qty.toLocaleString()}</td>
                              <td className="px-6 py-3 text-left font-bold">{data.total.toLocaleString()} {settings.currency}</td>
                            </tr>
                          ));
                        })()}
                      </tbody>
                    </table>
                  </div>
                ) : selectedReport === 'purchases_unpaid' ? (
                  <div className="border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden">
                    <table className="w-full text-right text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-900/50">
                        <tr>
                          <th className="px-6 py-3 font-bold">رقم الفاتورة</th>
                          <th className="px-6 py-3 font-bold">المورد</th>
                          <th className="px-6 py-3 font-bold">التاريخ</th>
                          <th className="px-6 py-3 font-bold text-left">المبلغ المتبقي</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {invoices.filter(i => i.type === 'purchase' && i.remainingAmount && i.remainingAmount > 0).map(inv => (
                          <tr key={inv.id}>
                            <td className="px-6 py-3 font-mono font-bold">{inv.number}</td>
                            <td className="px-6 py-3">{suppliers.find(s => s.id === inv.supplierId)?.name || 'مورد عام'}</td>
                            <td className="px-6 py-3">{new Date(inv.date).toLocaleDateString('ar-EG')}</td>
                            <td className="px-6 py-3 text-left font-bold text-red-500">{inv.remainingAmount?.toLocaleString()} {settings.currency}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : selectedReport === 'inventory_audit' ? (
                  <div className="border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden">
                    <table className="w-full text-right text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-900/50">
                        <tr>
                          <th className="px-6 py-3 font-bold">الصنف</th>
                          <th className="px-6 py-3 font-bold">الرصيد الدفتري</th>
                          <th className="px-6 py-3 font-bold">الرصيد الفعلي</th>
                          <th className="px-6 py-3 font-bold text-left">الفرق</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {products.map(product => (
                          <tr key={product.id}>
                            <td className="px-6 py-3 font-bold">{product.name}</td>
                            <td className="px-6 py-3">{product.quantity} {product.unit}</td>
                            <td className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 w-32"></td>
                            <td className="px-6 py-3 text-left"></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : selectedReport === 'purchases_top_items' ? (
                  <div className="border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden">
                    <table className="w-full text-right text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-900/50">
                        <tr>
                          <th className="px-6 py-3 font-bold">الصنف</th>
                          <th className="px-6 py-3 font-bold">الكمية المشتراة</th>
                          <th className="px-6 py-3 font-bold text-left">إجمالي المشتريات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {(() => {
                          const itemPurchases: { [id: string]: { name: string, qty: number, total: number } } = {};
                          invoices.filter(i => i.type === 'purchase').forEach(inv => {
                            inv.items.forEach(item => {
                              if (!itemPurchases[item.productId]) itemPurchases[item.productId] = { name: item.name, qty: 0, total: 0 };
                              itemPurchases[item.productId].qty += item.quantity;
                              itemPurchases[item.productId].total += item.total;
                            });
                          });
                          return Object.values(itemPurchases).sort((a, b) => b.qty - a.qty).slice(0, 10).map((data, idx) => (
                            <tr key={idx}>
                              <td className="px-6 py-3 font-bold">{data.name}</td>
                              <td className="px-6 py-3">{data.qty.toLocaleString()}</td>
                              <td className="px-6 py-3 text-left font-bold">{data.total.toLocaleString()} {settings.currency}</td>
                            </tr>
                          ));
                        })()}
                      </tbody>
                    </table>
                  </div>
                ) : selectedReport === 'inventory_stagnant' ? (
                  <div className="border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden">
                    <table className="w-full text-right text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-900/50">
                        <tr>
                          <th className="px-6 py-3 font-bold">الصنف</th>
                          <th className="px-6 py-3 font-bold">الرصيد الحالي</th>
                          <th className="px-6 py-3 font-bold">آخر حركة بيع</th>
                          <th className="px-6 py-3 font-bold text-left">أيام الركود</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {products.map(product => {
                          const lastSale = invoices
                            .filter(i => i.type === 'sale' && i.items.some(item => item.productId === product.id))
                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
                          
                          const lastDate = lastSale ? new Date(lastSale.date) : new Date(0);
                          const daysStagnant = Math.floor((new Date().getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
                          
                          if (daysStagnant < 30) return null;

                          return (
                            <tr key={product.id}>
                              <td className="px-6 py-3 font-bold">{product.name}</td>
                              <td className="px-6 py-3">{product.quantity} {product.unit}</td>
                              <td className="px-6 py-3">{lastSale ? new Date(lastSale.date).toLocaleDateString('ar-EG') : 'لا يوجد'}</td>
                              <td className="px-6 py-3 text-left font-bold text-amber-600">{daysStagnant} يوم</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : selectedReport === 'inventory_movement' ? (
                  <div className="space-y-6">
                    <div className="border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden">
                      <table className="w-full text-right text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-900/50">
                          <tr>
                            <th className="px-6 py-3 font-bold">التاريخ</th>
                            <th className="px-6 py-3 font-bold">الصنف</th>
                            <th className="px-6 py-3 font-bold">النوع</th>
                            <th className="px-6 py-3 font-bold text-left">الكمية</th>
                            <th className="px-6 py-3 font-bold text-left">الرصيد بعد</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                          {(() => {
                            const movements: any[] = [];
                            invoices.forEach(inv => {
                              inv.items.forEach(item => {
                                movements.push({
                                  date: inv.date,
                                  productId: item.productId,
                                  productName: item.name,
                                  type: inv.type === 'sale' ? 'صادر (بيع)' : inv.type === 'purchase' ? 'وارد (شراء)' : 'مرتجع',
                                  quantity: item.quantity,
                                  isPositive: inv.type === 'purchase' || inv.type === 'sale_return'
                                });
                              });
                            });
                            
                            // Sort movements by date ascending to calculate running balance
                            movements.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                            
                            const productBalances: { [id: string]: number } = {};
                            const movementsWithBalance = movements.map(m => {
                              if (!productBalances[m.productId]) productBalances[m.productId] = 0;
                              if (m.isPositive) productBalances[m.productId] += m.quantity;
                              else productBalances[m.productId] -= m.quantity;
                              return { ...m, balanceAfter: productBalances[m.productId] };
                            });

                            // Sort back to descending for display
                            return movementsWithBalance.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((m, idx) => (
                              <tr key={idx}>
                                <td className="px-6 py-3">{new Date(m.date).toLocaleDateString('ar-EG')}</td>
                                <td className="px-6 py-3 font-bold">{m.productName}</td>
                                <td className="px-6 py-3">
                                  <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${m.isPositive ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                    {m.type}
                                  </span>
                                </td>
                                <td className={`px-6 py-3 text-left font-bold ${m.isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                                  {m.isPositive ? '+' : '-'}{m.quantity.toLocaleString()}
                                </td>
                                <td className="px-6 py-3 text-left font-black">{m.balanceAfter.toLocaleString()}</td>
                              </tr>
                            ));
                          })()}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : selectedReport === 'inventory_balance' || selectedReport === 'inventory' ? (
                  <>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                        <p className="text-xs text-amber-600 font-bold mb-1">إجمالي الأصناف</p>
                        <h4 className="text-xl font-black text-amber-700">{inventoryStats.totalItems}</h4>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                        <p className="text-xs text-blue-600 font-bold mb-1">قيمة المخزون (تكلفة)</p>
                        <h4 className="text-xl font-black text-blue-700">{inventoryStats.totalCostValue.toLocaleString()} {settings.currency}</h4>
                      </div>
                      <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                        <p className="text-xs text-emerald-600 font-bold mb-1">قيمة المخزون (بيع)</p>
                        <h4 className="text-xl font-black text-emerald-700">{inventoryStats.totalSaleValue.toLocaleString()} {settings.currency}</h4>
                      </div>
                      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl border border-red-100 dark:border-red-900/30">
                        <p className="text-xs text-red-600 font-bold mb-1">أصناف منخفضة</p>
                        <h4 className="text-xl font-black text-red-700">{inventoryStats.lowStockCount}</h4>
                      </div>
                    </div>

                    <div className="border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden">
                      <table className="w-full text-right text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-900/50">
                          <tr>
                            <th className="px-6 py-3 font-bold">الصنف</th>
                            <th className="px-6 py-3 font-bold">الكمية</th>
                            <th className="px-6 py-3 font-bold">سعر التكلفة</th>
                            <th className="px-6 py-3 font-bold">سعر البيع</th>
                            <th className="px-6 py-3 font-bold text-left">إجمالي القيمة (بيع)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                          {products.map(product => (
                            <tr key={product.id} className={product.quantity <= product.minStock ? 'bg-red-50/30 dark:bg-red-900/10' : ''}>
                              <td className="px-6 py-3 font-bold">{product.name}</td>
                              <td className="px-6 py-3">{product.quantity} {product.unit}</td>
                              <td className="px-6 py-3">{product.costPrice.toLocaleString()}</td>
                              <td className="px-6 py-3">{product.salePrice.toLocaleString()}</td>
                              <td className="px-6 py-3 text-left font-bold">{(product.salePrice * product.quantity).toLocaleString()} {settings.currency}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : selectedReport === 'pl' ? (
                  <>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                        <p className="text-xs text-emerald-600 font-bold mb-1">إجمالي الإيرادات</p>
                        <h4 className="text-xl font-black text-emerald-700">
                          {(invoices.filter(inv => inv.type === 'sale').reduce((acc, inv) => acc + inv.total, 0) - 
                            invoices.filter(inv => inv.type === 'sale_return').reduce((acc, inv) => acc + inv.total, 0)).toLocaleString()} {settings.currency}
                        </h4>
                      </div>
                      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl border border-red-100 dark:border-red-900/30">
                        <p className="text-xs text-red-600 font-bold mb-1">إجمالي المصروفات</p>
                        <h4 className="text-xl font-black text-red-700">
                          {expenses.reduce((acc, exp) => acc + exp.amount, 0).toLocaleString()} {settings.currency}
                        </h4>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                        <p className="text-xs text-blue-600 font-bold mb-1">صافي الربح</p>
                        <h4 className="text-xl font-black text-blue-700">
                          {(
                            (invoices.filter(inv => inv.type === 'sale').reduce((acc, inv) => acc + inv.total, 0) - 
                             invoices.filter(inv => inv.type === 'sale_return').reduce((acc, inv) => acc + inv.total, 0)) -
                            expenses.reduce((acc, exp) => acc + exp.amount, 0) -
                            (invoices.filter(inv => inv.type === 'purchase').reduce((acc, inv) => acc + inv.total, 0) -
                             invoices.filter(inv => inv.type === 'purchase_return').reduce((acc, inv) => acc + inv.total, 0))
                          ).toLocaleString()} {settings.currency}
                        </h4>
                      </div>
                    </div>

                    <div className="border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden">
                      <table className="w-full text-right text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-900/50">
                          <tr>
                            <th className="px-6 py-3 font-bold">البند</th>
                            <th className="px-6 py-3 font-bold text-left">القيمة</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                          <tr>
                            <td className="px-6 py-3 font-bold">إجمالي المبيعات</td>
                            <td className="px-6 py-3 text-left">{invoices.filter(inv => inv.type === 'sale').reduce((acc, inv) => acc + inv.total, 0).toLocaleString()} {settings.currency}</td>
                          </tr>
                          <tr>
                            <td className="px-6 py-3 font-bold">مرتجع مبيعات</td>
                            <td className="px-6 py-3 text-left text-red-500">({invoices.filter(inv => inv.type === 'sale_return').reduce((acc, inv) => acc + inv.total, 0).toLocaleString()}) {settings.currency}</td>
                          </tr>
                          <tr className="bg-gray-50 dark:bg-gray-900/30">
                            <td className="px-6 py-3 font-bold">تكلفة البضاعة المباعة (المشتريات)</td>
                            <td className="px-6 py-3 text-left text-red-500">
                              ({(invoices.filter(inv => inv.type === 'purchase').reduce((acc, inv) => acc + inv.total, 0) -
                                 invoices.filter(inv => inv.type === 'purchase_return').reduce((acc, inv) => acc + inv.total, 0)).toLocaleString()}) {settings.currency}
                            </td>
                          </tr>
                          {expenses.map(exp => (
                            <tr key={exp.id}>
                              <td className="px-6 py-3 font-bold">{exp.description}</td>
                              <td className="px-6 py-3 text-left text-red-500">({exp.amount.toLocaleString()}) {settings.currency}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    هذا التقرير قيد التطوير وسيتم ربطه بالبيانات الفعلية قريباً.
                  </div>
                )}
              </div>

              <div className="mt-8 flex gap-4">
                <button className="flex-1 bg-emerald-600 text-white py-3 rounded-2xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2">
                  <Printer size={20} />
                  طباعة التقرير
                </button>
                <button className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 py-3 rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all">
                  تصدير PDF
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Expense Modal */}
      <AnimatePresence>
        {showAddExpenseModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddExpenseModal(false)}
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
                <h3 className="text-2xl font-bold">إضافة مصروف جديد</h3>
                <button onClick={() => setShowAddExpenseModal(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500">البيان / الوصف</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-emerald-500"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500">المبلغ</label>
                  <input 
                    type="number" 
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-emerald-500"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500">الفئة</label>
                  <select 
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-emerald-500"
                    value={newExpense.category}
                    onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                  >
                    <option value="عام">عام</option>
                    <option value="إيجار">إيجار</option>
                    <option value="كهرباء">كهرباء</option>
                    <option value="مياه">مياه</option>
                    <option value="رواتب">رواتب</option>
                    <option value="أخرى">أخرى</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500">التاريخ</label>
                  <input 
                    type="date" 
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-emerald-500"
                    value={newExpense.date}
                    onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                  />
                </div>

                <button 
                  onClick={() => {
                    const expense = {
                      ...newExpense,
                      id: Math.random().toString(36).substr(2, 9)
                    };
                    setExpenses([...expenses, expense]);
                    setShowAddExpenseModal(false);
                    setNewExpense({
                      description: '',
                      amount: 0,
                      category: 'عام',
                      date: new Date().toISOString().split('T')[0]
                    });
                  }}
                  className="w-full bg-emerald-600 text-white py-3 rounded-2xl font-bold hover:bg-emerald-700 transition-all"
                >
                  حفظ المصروف
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Accounting;
