import { Settings, Product, Customer, Supplier, Invoice, Recipe, Account } from './types';

export const INITIAL_SETTINGS: Settings = {
  companyName: "عطارة البركة",
  companyAddress: "القاهرة، مصر",
  companyLogo: "https://picsum.photos/seed/spice/200/200",
  taxId: "123-456-789",
  commercialRegister: "98765",
  currency: "EGP",
  taxEnabled: true,
  taxRate: 14,
  language: 'ar',
  theme: 'light',
  primaryColor: '#2d6a61', // Dark Teal
  sidebarColor: '#2d6a61', // Dark Teal
  backgroundColor: '#f1f5f9', // Light Gray-Blue
  fontColor: '#1e293b', // Dark Slate
  fontHighlightColor: '#d9f99d', // Lime Green (Active Item)
  inventoryMethod: 'AVCO',
  invoiceFooter: "شكراً لزيارتكم! نرجو أن تنال منتجاتنا إعجابكم.",
  units: ['كيلو', 'جرام', 'قطعة', 'علبة', 'لتر']
};

export const MOCK_PRODUCTS: Product[] = [
  { id: '1', code: 'P001', name: 'فلفل أسود حصى', unit: 'كيلو', quantity: 50, barcode: '6221234567890', costPrice: 150, salePrice: 200, minStock: 10, category: 'توابل' },
  { id: '2', code: 'P002', name: 'كمون بلدي مطحون', unit: 'كيلو', quantity: 30, barcode: '6221234567891', costPrice: 180, salePrice: 240, minStock: 5, category: 'توابل' },
  { id: '3', code: 'P003', name: 'كركم هندي', unit: 'كيلو', quantity: 20, barcode: '6221234567892', costPrice: 90, salePrice: 130, minStock: 5, category: 'توابل' },
  { id: '4', code: 'P004', name: 'قرفة عيدان', unit: 'كيلو', quantity: 15, barcode: '6221234567893', costPrice: 220, salePrice: 300, minStock: 3, category: 'أعشاب' },
];

export const MOCK_CUSTOMERS: Customer[] = [
  { id: 'c1', name: 'عميل نقدي', phone: '', balance: 0, totalPurchases: 0 },
  { id: 'c2', name: 'أحمد محمد', phone: '01012345678', balance: 0, totalPurchases: 0 },
];

export const MOCK_CHART_OF_ACCOUNTS: Account[] = [
  { id: '1', code: '1', name: 'الأصول', type: 'asset', balance: 0 },
  { id: '11', code: '11', name: 'الأصول الثابتة', type: 'asset', balance: 0, parent: '1' },
  { id: '12', code: '12', name: 'الأصول المتداولة', type: 'asset', balance: 0, parent: '1' },
  { id: '121', code: '121', name: 'الصندوق والنقدية', type: 'asset', balance: 0, parent: '12' },
  { id: '122', code: '122', name: 'البنوك', type: 'asset', balance: 0, parent: '12' },
  { id: '123', code: '123', name: 'العملاء', type: 'asset', balance: 0, parent: '12' },
  { id: '124', code: '124', name: 'المخزون', type: 'asset', balance: 0, parent: '12' },
  { id: '2', code: '2', name: 'الالتزامات', type: 'liability', balance: 0 },
  { id: '21', code: '21', name: 'الالتزامات المتداولة', type: 'liability', balance: 0, parent: '2' },
  { id: '211', code: '211', name: 'الموردين', type: 'liability', balance: 0, parent: '21' },
  { id: '3', code: '3', name: 'حقوق الملكية', type: 'equity', balance: 0 },
  { id: '31', code: '31', name: 'رأس المال', type: 'equity', balance: 0, parent: '3' },
  { id: '4', code: '4', name: 'الإيرادات', type: 'revenue', balance: 0 },
  { id: '41', code: '41', name: 'إيرادات المبيعات', type: 'revenue', balance: 0, parent: '4' },
  { id: '5', code: '5', name: 'المصروفات', type: 'expense', balance: 0 },
  { id: '51', code: '51', name: 'تكلفة المبيعات', type: 'expense', balance: 0, parent: '5' },
  { id: '52', code: '52', name: 'المصروفات الإدارية والعمومية', type: 'expense', balance: 0, parent: '5' },
];
