import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  AlertCircle, 
  ArrowUpRight, 
  ArrowDownRight,
  Package,
  ShoppingCart,
  FileText
} from 'lucide-react';
import { useApp } from '../AppContext';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend,
  AreaChart,
  Area
} from 'recharts';

const StatCard: React.FC<{ 
  title: string; 
  value: string; 
  trend?: number; 
  icon: React.ElementType; 
  color: string;
  onClick?: () => void;
}> = ({ title, value, trend, icon: Icon, color, onClick }) => (
  <button 
    onClick={onClick}
    className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col gap-4 hover:shadow-md transition-all text-right w-full"
  >
    <div className="flex items-center justify-between w-full">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
      {trend !== undefined && (
        <div className={`flex items-center gap-1 text-sm font-medium ${trend >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
          {trend >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
          {Math.abs(trend)}%
        </div>
      )}
    </div>
    <div>
      <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{title}</p>
      <h3 className="text-2xl font-bold mt-1">{value}</h3>
    </div>
  </button>
);

const Dashboard: React.FC<{ onTabChange: (tab: string) => void }> = ({ onTabChange }) => {
  const { products, invoices, settings, customers, expenses } = useApp();

  const totalSales = invoices.filter(i => i.type === 'sale').reduce((acc, curr) => acc + curr.total, 0) - invoices.filter(i => i.type === 'sale_return').reduce((acc, curr) => acc + curr.total, 0);
  const totalPurchases = invoices.filter(i => i.type === 'purchase').reduce((acc, curr) => acc + curr.total, 0) - invoices.filter(i => i.type === 'purchase_return').reduce((acc, curr) => acc + curr.total, 0);
  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const netProfit = totalSales - totalPurchases - totalExpenses;
  const pendingDues = customers.reduce((acc, curr) => acc + Math.abs(curr.balance || 0), 0);

  const chartData = [
    { name: 'يناير', sales: 0, purchases: 0 },
    { name: 'فبراير', sales: 0, purchases: 0 },
    { name: 'مارس', sales: 0, purchases: 0 },
    { name: 'أبريل', sales: 0, purchases: 0 },
    { name: 'مايو', sales: 0, purchases: 0 },
    { name: 'يونيو', sales: 0, purchases: 0 },
  ];

  const pieData: any[] = [];

  const COLORS = ['#2d6a61', '#14b8a6', '#5eead4', '#99f6e4'];

  const lowStockProducts = products.filter(p => p.quantity <= p.minStock);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">لوحة التحكم</h1>
          <p className="text-gray-500 dark:text-gray-400">مرحباً بك في نظام إدارة العطارة</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-lg font-medium">
          <TrendingUp size={20} />
          <span>أداء متميز هذا الشهر</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="إجمالي المبيعات" 
          value={`${totalSales.toLocaleString()} ${settings.currency}`} 
          trend={12} 
          icon={DollarSign} 
          color="bg-amber-600"
          onClick={() => onTabChange('sales')}
        />
        <StatCard 
          title="إجمالي المشتريات" 
          value={`${totalPurchases.toLocaleString()} ${settings.currency}`} 
          trend={-5} 
          icon={ShoppingCart} 
          color="bg-blue-600"
          onClick={() => onTabChange('sales')}
        />
        <StatCard 
          title="صافي الأرباح" 
          value={`${netProfit.toLocaleString()} ${settings.currency}`} 
          trend={8} 
          icon={TrendingUp} 
          color="bg-indigo-900"
          onClick={() => onTabChange('pl_report')}
        />
        <StatCard 
          title="المبالغ المستحقة" 
          value={`${pendingDues.toLocaleString()} ${settings.currency}`} 
          icon={AlertCircle} 
          color="bg-purple-600"
          onClick={() => onTabChange('customers')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales vs Purchases Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold mb-6">مقارنة المبيعات بالمشتريات</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPurchases" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#14b8a6" fillOpacity={1} fill="url(#colorSales)" strokeWidth={3} name="المبيعات" />
                <Area type="monotone" dataKey="purchases" stroke="#3b82f6" fillOpacity={1} fill="url(#colorPurchases)" strokeWidth={3} name="المشتريات" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Selling Items */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold mb-6">الأصناف الأكثر مبيعاً</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Alerts and Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold">تنبيهات المخزون</h3>
            <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-1 rounded text-xs font-bold">
              {lowStockProducts.length} تنبيه
            </span>
          </div>
          <div className="space-y-4">
            {lowStockProducts.length > 0 ? lowStockProducts.map(product => (
              <div key={product.id} className="flex items-center justify-between p-3 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20">
                <div className="flex items-center gap-3">
                  <Package className="text-red-500" size={20} />
                  <div>
                    <p className="font-bold text-sm">{product.name}</p>
                    <p className="text-xs text-gray-500">الكمية الحالية: {product.quantity} {product.unit}</p>
                  </div>
                </div>
                <button 
                  onClick={() => onTabChange('inventory')}
                  className="text-xs font-bold text-red-600 hover:underline"
                >
                  طلب كمية
                </button>
              </div>
            )) : (
              <p className="text-center text-gray-500 py-8">لا توجد تنبيهات حالياً</p>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold mb-6">الفواتير الآجلة المستحقة اليوم</h3>
          <div className="space-y-4">
            <p className="text-center text-gray-500 py-8">لا توجد فواتير مستحقة اليوم</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
