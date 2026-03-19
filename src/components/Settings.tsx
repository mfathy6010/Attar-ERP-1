import React, { useState } from 'react';
import { 
  Building2, 
  Palette, 
  Database, 
  Printer, 
  Globe, 
  ShieldCheck, 
  Save, 
  Upload, 
  Check,
  ChevronRight,
  Calculator,
  Percent,
  Ruler,
  X,
  CheckCircle2,
  RotateCcw
} from 'lucide-react';
import { useApp } from '../AppContext';
import { motion } from 'framer-motion';

const Settings: React.FC = () => {
  const { settings, setSettings } = useApp();
  const [activeSection, setActiveSection] = useState('company');
  const [showSaveMessage, setShowSaveMessage] = useState(false);
  const [newUnit, setNewUnit] = useState('');

  const sections = [
    { id: 'company', label: 'بيانات الشركة', icon: Building2 },
    { id: 'appearance', label: 'المظهر واللون', icon: Palette },
    { id: 'inventory', label: 'المخزون والتقييم', icon: Database },
    { id: 'taxes', label: 'الضرائب', icon: Percent },
    { id: 'printing', label: 'الطباعة والفواتير', icon: Printer },
    { id: 'language', label: 'اللغة والنظام', icon: Globe },
    { id: 'units', label: 'وحدات القياس', icon: Ruler },
  ];

  const handleSave = () => {
    setShowSaveMessage(true);
    setTimeout(() => setShowSaveMessage(false), 3000);
  };

  const addUnit = () => {
    if (newUnit.trim() && !settings.units.includes(newUnit.trim())) {
      setSettings({ ...settings, units: [...settings.units, newUnit.trim()] });
      setNewUnit('');
    }
  };

  const removeUnit = (unit: string) => {
    setSettings({ ...settings, units: settings.units.filter(u => u !== unit) });
  };

  const restoreDefaultColors = () => {
    setSettings({
      ...settings,
      primaryColor: '#2d6a61',
      sidebarColor: '#2d6a61',
      backgroundColor: '#f1f5f9',
      fontColor: '#1e293b',
      fontHighlightColor: '#d9f99d',
      theme: 'light'
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings({ ...settings, companyLogo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full">
      {/* Sidebar Navigation */}
      <div className="w-full lg:w-64 flex flex-col gap-2">
        <h1 className="text-3xl font-bold mb-6">الإعدادات</h1>
        {sections.map(section => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`flex items-center justify-between p-4 rounded-2xl font-bold text-sm transition-all ${
              activeSection === section.id 
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' 
                : 'bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-100 dark:border-gray-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <section.icon size={20} />
              <span>{section.label}</span>
            </div>
            <ChevronRight size={16} className={activeSection === section.id ? 'opacity-100' : 'opacity-0'} />
          </button>
        ))}
      </div>

      {/* Settings Content */}
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col">
        <div className="p-8 flex-1 overflow-y-auto">
          {activeSection === 'company' && (
            <div className="space-y-8 max-w-2xl">
              <div className="flex items-center gap-6">
                <div className="relative group">
                  <img src={settings.companyLogo} alt="Logo" className="w-24 h-24 rounded-2xl object-cover border-2 border-gray-100 dark:border-gray-700" />
                  <label className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer">
                    <Upload size={24} />
                    <input 
                      type="file" 
                      accept="image/*"
                      className="hidden" 
                      onChange={handleLogoUpload}
                    />
                  </label>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold">شعار الشركة</h3>
                  <div className="mt-2 flex gap-2">
                    <input 
                      type="text" 
                      placeholder="أدخل رابط صورة اللوجو هنا..."
                      className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none text-sm"
                      value={settings.companyLogo}
                      onChange={(e) => setSettings({ ...settings, companyLogo: e.target.value })}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">اضغط على الصورة لاختيار ملف من جهازك، أو أدخل رابطاً مباشراً</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500">اسم الشركة</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-emerald-500"
                    value={settings.companyName}
                    onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500">العنوان</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-emerald-500"
                    value={settings.companyAddress}
                    onChange={(e) => setSettings({ ...settings, companyAddress: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500">السجل التجاري</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-emerald-500"
                    value={settings.commercialRegister}
                    onChange={(e) => setSettings({ ...settings, commercialRegister: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500">البطاقة الضريبية</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-emerald-500"
                    value={settings.taxId}
                    onChange={(e) => setSettings({ ...settings, taxId: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {activeSection === 'appearance' && (
            <div className="space-y-8 max-w-2xl">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">تخصيص الألوان</h3>
                  <button 
                    onClick={restoreDefaultColors}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                  >
                    <RotateCcw size={14} />
                    استعادة الألوان الافتراضية
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500">اللون الأساسي للنظام</label>
                    <div className="flex gap-2">
                      <input 
                        type="color" 
                        className="w-12 h-12 rounded-lg cursor-pointer border-none"
                        value={settings.primaryColor}
                        onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                      />
                      <input 
                        type="text" 
                        className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none font-mono"
                        value={settings.primaryColor}
                        onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500">لون القائمة الجانبية</label>
                    <div className="flex gap-2">
                      <input 
                        type="color" 
                        className="w-12 h-12 rounded-lg cursor-pointer border-none"
                        value={settings.sidebarColor}
                        onChange={(e) => setSettings({ ...settings, sidebarColor: e.target.value })}
                      />
                      <input 
                        type="text" 
                        className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none font-mono"
                        value={settings.sidebarColor}
                        onChange={(e) => setSettings({ ...settings, sidebarColor: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500">لون خلفية النظام</label>
                    <div className="flex gap-2">
                      <input 
                        type="color" 
                        className="w-12 h-12 rounded-lg cursor-pointer border-none"
                        value={settings.backgroundColor}
                        onChange={(e) => setSettings({ ...settings, backgroundColor: e.target.value })}
                      />
                      <input 
                        type="text" 
                        className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none font-mono"
                        value={settings.backgroundColor}
                        onChange={(e) => setSettings({ ...settings, backgroundColor: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500">لون الخطوط الأساسي</label>
                    <div className="flex gap-2">
                      <input 
                        type="color" 
                        className="w-12 h-12 rounded-lg cursor-pointer border-none"
                        value={settings.fontColor}
                        onChange={(e) => setSettings({ ...settings, fontColor: e.target.value })}
                      />
                      <input 
                        type="text" 
                        className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none font-mono"
                        value={settings.fontColor}
                        onChange={(e) => setSettings({ ...settings, fontColor: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500">لون تظليل الخطوط (Highlight)</label>
                    <div className="flex gap-2">
                      <input 
                        type="color" 
                        className="w-12 h-12 rounded-lg cursor-pointer border-none"
                        value={settings.fontHighlightColor}
                        onChange={(e) => setSettings({ ...settings, fontHighlightColor: e.target.value })}
                      />
                      <input 
                        type="text" 
                        className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none font-mono"
                        value={settings.fontHighlightColor}
                        onChange={(e) => setSettings({ ...settings, fontHighlightColor: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-bold">وضع المظهر</h3>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setSettings({ ...settings, theme: 'light' })}
                    className={`flex-1 p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${settings.theme === 'light' ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-gray-100'}`}
                  >
                    <div className="w-full h-20 bg-gray-100 rounded-lg" />
                    <span className="font-bold">فاتح (Light)</span>
                  </button>
                  <button 
                    onClick={() => setSettings({ ...settings, theme: 'dark' })}
                    className={`flex-1 p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${settings.theme === 'dark' ? 'border-emerald-500 bg-emerald-900/20 text-emerald-400' : 'border-gray-100'}`}
                  >
                    <div className="w-full h-20 bg-gray-900 rounded-lg" />
                    <span className="font-bold">داكن (Dark)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'inventory' && (
            <div className="space-y-8 max-w-2xl">
              <div className="space-y-4">
                <h3 className="text-xl font-bold">طريقة تقييم المخزون</h3>
                <p className="text-sm text-gray-400">تؤثر هذه الطريقة على حساب تكلفة البضاعة المباعة وصافي الأرباح</p>
                <div className="grid grid-cols-1 gap-4">
                  {[
                    { id: 'FIFO', label: 'الصادر أولاً يصرف أولاً (FIFO)', desc: 'يتم تقييم المخزون بناءً على أقدم أسعار شراء' },
                    { id: 'LIFO', label: 'الصادر أخيراً يصرف أولاً (LIFO)', desc: 'يتم تقييم المخزون بناءً على أحدث أسعار شراء' },
                    { id: 'AVCO', label: 'متوسط التكلفة (Average Cost)', desc: 'يتم حساب متوسط سعر الشراء لجميع الكميات المتاحة' },
                  ].map(method => (
                    <button
                      key={method.id}
                      onClick={() => setSettings({ ...settings, inventoryMethod: method.id as any })}
                      className={`flex items-center justify-between p-6 rounded-2xl border-2 transition-all text-right ${
                        settings.inventoryMethod === method.id 
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' 
                          : 'border-gray-100 dark:border-gray-700'
                      }`}
                    >
                      <div>
                        <h4 className={`font-bold ${settings.inventoryMethod === method.id ? 'text-emerald-600' : ''}`}>{method.label}</h4>
                        <p className="text-xs text-gray-400 mt-1">{method.desc}</p>
                      </div>
                      {settings.inventoryMethod === method.id && <Check className="text-emerald-600" size={24} />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'taxes' && (
            <div className="space-y-8 max-w-2xl">
              <div className="flex items-center justify-between p-6 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700">
                <div>
                  <h3 className="font-bold">تفعيل ضريبة القيمة المضافة</h3>
                  <p className="text-xs text-gray-400">تطبيق الضريبة تلقائياً على جميع الفواتير</p>
                </div>
                <button 
                  onClick={() => setSettings({ ...settings, taxEnabled: !settings.taxEnabled })}
                  className={`w-14 h-8 rounded-full transition-all relative ${settings.taxEnabled ? 'bg-emerald-500' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${settings.taxEnabled ? 'right-7' : 'right-1'}`} />
                </button>
              </div>

              {settings.taxEnabled && (
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500">نسبة الضريبة (%)</label>
                  <div className="relative max-w-xs">
                    <input 
                      type="number" 
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-emerald-500"
                      value={settings.taxRate}
                      onChange={(e) => setSettings({ ...settings, taxRate: parseFloat(e.target.value) || 0 })}
                    />
                    <Percent className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  </div>
                </div>
              )}
            </div>
          )}

          {activeSection === 'printing' && (
            <div className="space-y-8 max-w-2xl">
              <div className="space-y-4">
                <h3 className="text-xl font-bold">إعدادات الفواتير والطباعة</h3>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500">تذييل الفاتورة (Footer)</label>
                    <textarea 
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="اكتب رسالة تظهر في نهاية الفاتورة..."
                      value={settings.invoiceFooter}
                      onChange={(e) => setSettings({ ...settings, invoiceFooter: e.target.value })}
                    />
                  </div>
                  
                  <div className="p-6 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30">
                    <h4 className="font-bold mb-4 flex items-center gap-2">
                      <Check size={18} className="text-emerald-500" />
                      معاينة تذييل الفاتورة
                    </h4>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                      <div className="w-16 h-1 bg-gray-200 dark:bg-gray-700 mx-auto mb-4 rounded-full" />
                      <p className="text-sm text-gray-600 dark:text-gray-300 italic">
                        {settings.invoiceFooter || "لا يوجد نص تذييل حالياً"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 flex items-center justify-between">
                      <span className="text-sm font-bold">طباعة شعار الشركة</span>
                      <button className="w-10 h-6 rounded-full bg-emerald-500 relative">
                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                      </button>
                    </div>
                    <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 flex items-center justify-between">
                      <span className="text-sm font-bold">إظهار الباركود</span>
                      <button className="w-10 h-6 rounded-full bg-emerald-500 relative">
                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'units' && (
            <div className="space-y-8 max-w-2xl">
              <div className="space-y-4">
                <h3 className="text-xl font-bold">وحدات القياس</h3>
                <p className="text-sm text-gray-400">إضافة أو حذف وحدات القياس المستخدمة في المنتجات</p>
                
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="اسم الوحدة (مثال: كرتونة)"
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-emerald-500"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addUnit()}
                  />
                  <button 
                    onClick={addUnit}
                    className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-all"
                  >
                    إضافة
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-6">
                  {settings.units.map(unit => (
                    <div 
                      key={unit}
                      className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 group"
                    >
                      <span className="font-bold">{unit}</span>
                      <button 
                        onClick={() => removeUnit(unit)}
                        className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-between">
          <div className="flex-1">
            {showSaveMessage && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 text-emerald-600 font-bold"
              >
                <CheckCircle2 size={20} />
                تم حفظ جميع الإعدادات بنجاح!
              </motion.div>
            )}
          </div>
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/20"
          >
            <Save size={20} />
            حفظ جميع الإعدادات
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
