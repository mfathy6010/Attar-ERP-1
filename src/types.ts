export interface Product {
  id: string;
  code: string;
  name: string;
  unit: string;
  quantity: number;
  barcode: string;
  costPrice: number;
  salePrice: number;
  minStock: number;
  category: string;
  showInPOS?: boolean;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  balance: number;
  totalPurchases: number;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  balance: number;
  totalPurchases: number;
}

export interface InvoiceItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Invoice {
  id: string;
  number: string;
  date: string;
  customerId?: string;
  supplierId?: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paidAmount?: number;
  remainingAmount?: number;
  paymentMethod: 'cash' | 'visa' | 'credit' | 'vodafone' | 'cash_credit';
  type: 'sale' | 'purchase' | 'sale_return' | 'purchase_return' | 'payment_in' | 'payment_out';
}

export interface Recipe {
  id: string;
  productId?: string; // The product being manufactured
  name: string;
  outputQuantity: number;
  outputUnit: string;
  ingredients: {
    productId: string;
    quantity: number;
    unit: string;
    cost: number;
  }[];
  totalCost: number;
  isFinished?: boolean;
  productionQty?: number;
}

export interface Account {
  id: string;
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  balance: number;
  parent?: string;
}

export interface Expense {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  accountId?: string;
}

export interface Settings {
  companyName: string;
  companyAddress: string;
  companyLogo: string;
  taxId: string;
  commercialRegister: string;
  currency: string;
  taxEnabled: boolean;
  taxRate: number;
  language: 'ar' | 'en';
  theme: 'light' | 'dark';
  primaryColor: string;
  sidebarColor: string;
  backgroundColor: string;
  fontColor: string;
  fontHighlightColor: string;
  inventoryMethod: 'FIFO' | 'LIFO' | 'AVCO';
  invoiceFooter: string;
  units: string[];
}
