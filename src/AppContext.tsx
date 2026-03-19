import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Customer, Supplier, Invoice, Recipe, Account, Settings, Expense } from './types';
import { INITIAL_SETTINGS, MOCK_PRODUCTS, MOCK_CUSTOMERS, MOCK_CHART_OF_ACCOUNTS } from './constants';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc,
  query,
  where
} from 'firebase/firestore';

interface AppContextType {
  products: Product[];
  setProducts: (products: Product[] | ((prev: Product[]) => Product[])) => void;
  customers: Customer[];
  setCustomers: (customers: Customer[] | ((prev: Customer[]) => Customer[])) => void;
  suppliers: Supplier[];
  setSuppliers: (suppliers: Supplier[] | ((prev: Supplier[]) => Supplier[])) => void;
  invoices: Invoice[];
  setInvoices: (invoices: Invoice[] | ((prev: Invoice[]) => Invoice[])) => void;
  recipes: Recipe[];
  setRecipes: (recipes: Recipe[] | ((prev: Recipe[]) => Recipe[])) => void;
  accounts: Account[];
  setAccounts: (accounts: Account[] | ((prev: Account[]) => Account[])) => void;
  expenses: Expense[];
  setExpenses: (expenses: Expense[] | ((prev: Expense[]) => Expense[])) => void;
  settings: Settings;
  setSettings: (settings: Settings | ((prev: Settings) => Settings)) => void;
  user: User | null;
  login: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProductsState] = useState<Product[]>([]);
  const [customers, setCustomersState] = useState<Customer[]>([]);
  const [suppliers, setSuppliersState] = useState<Supplier[]>([]);
  const [invoices, setInvoicesState] = useState<Invoice[]>([]);
  const [recipes, setRecipesState] = useState<Recipe[]>([]);
  const [accounts, setAccountsState] = useState<Account[]>([]);
  const [expenses, setExpensesState] = useState<Expense[]>([]);
  const [settings, setSettingsState] = useState<Settings>(INITIAL_SETTINGS);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Firestore Sync
  useEffect(() => {
    if (!user) {
      setProductsState([]);
      setCustomersState([]);
      setSuppliersState([]);
      setInvoicesState([]);
      setRecipesState([]);
      setAccountsState([]);
      setExpensesState([]);
      setSettingsState(INITIAL_SETTINGS);
      return;
    }

    const uid = user.uid;

    const unsubProducts = onSnapshot(collection(db, `users/${uid}/products`), (snapshot) => {
      setProductsState(snapshot.docs.map(doc => doc.data() as Product));
    }, (error) => handleFirestoreError(error, OperationType.LIST, `users/${uid}/products`));

    const unsubCustomers = onSnapshot(collection(db, `users/${uid}/customers`), (snapshot) => {
      setCustomersState(snapshot.docs.map(doc => doc.data() as Customer));
    }, (error) => handleFirestoreError(error, OperationType.LIST, `users/${uid}/customers`));

    const unsubSuppliers = onSnapshot(collection(db, `users/${uid}/suppliers`), (snapshot) => {
      setSuppliersState(snapshot.docs.map(doc => doc.data() as Supplier));
    }, (error) => handleFirestoreError(error, OperationType.LIST, `users/${uid}/suppliers`));

    const unsubInvoices = onSnapshot(collection(db, `users/${uid}/invoices`), (snapshot) => {
      setInvoicesState(snapshot.docs.map(doc => doc.data() as Invoice));
    }, (error) => handleFirestoreError(error, OperationType.LIST, `users/${uid}/invoices`));

    const unsubRecipes = onSnapshot(collection(db, `users/${uid}/recipes`), (snapshot) => {
      setRecipesState(snapshot.docs.map(doc => doc.data() as Recipe));
    }, (error) => handleFirestoreError(error, OperationType.LIST, `users/${uid}/recipes`));

    const unsubAccounts = onSnapshot(collection(db, `users/${uid}/accounts`), (snapshot) => {
      setAccountsState(snapshot.docs.map(doc => doc.data() as Account));
    }, (error) => handleFirestoreError(error, OperationType.LIST, `users/${uid}/accounts`));

    const unsubExpenses = onSnapshot(collection(db, `users/${uid}/expenses`), (snapshot) => {
      setExpensesState(snapshot.docs.map(doc => doc.data() as Expense));
    }, (error) => handleFirestoreError(error, OperationType.LIST, `users/${uid}/expenses`));

    const unsubSettings = onSnapshot(doc(db, `users/${uid}/settings`, 'current'), (snapshot) => {
      if (snapshot.exists()) {
        setSettingsState(snapshot.data() as Settings);
      } else {
        // Initialize settings for new user
        const initialWithUid = { ...INITIAL_SETTINGS, uid };
        setDoc(doc(db, `users/${uid}/settings`, 'current'), initialWithUid)
          .catch(err => handleFirestoreError(err, OperationType.CREATE, `users/${uid}/settings/current`));
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, `users/${uid}/settings/current`));

    return () => {
      unsubProducts();
      unsubCustomers();
      unsubSuppliers();
      unsubInvoices();
      unsubRecipes();
      unsubAccounts();
      unsubExpenses();
      unsubSettings();
    };
  }, [user]);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        return;
      }
      if (error.code === 'auth/cancelled-popup-request') {
        return;
      }
      console.error("Login failed", error);
      throw error;
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error("Email login failed", error);
      throw error;
    }
  };

  const registerWithEmail = async (email: string, password: string, name: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
    } catch (error: any) {
      console.error("Registration failed", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  // Wrapper functions to write to Firestore
  const setProducts = async (value: Product[] | ((prev: Product[]) => Product[])) => {
    if (!user) return;
    const nextValue = typeof value === 'function' ? value(products) : value;
    
    // Find added items
    const added = nextValue.filter(p => !products.find(op => op.id === p.id));
    for (const item of added) {
      await setDoc(doc(db, `users/${user.uid}/products`, item.id), { ...item, uid: user.uid })
        .catch(err => handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}/products/${item.id}`));
    }

    // Find deleted items
    const deleted = products.filter(p => !nextValue.find(np => np.id === p.id));
    for (const item of deleted) {
      await deleteDoc(doc(db, `users/${user.uid}/products`, item.id))
        .catch(err => handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/products/${item.id}`));
    }

    // Find updated items
    const updated = nextValue.filter(p => {
      const old = products.find(op => op.id === p.id);
      return old && JSON.stringify(old) !== JSON.stringify(p);
    });
    for (const item of updated) {
      await setDoc(doc(db, `users/${user.uid}/products`, item.id), { ...item, uid: user.uid })
        .catch(err => handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/products/${item.id}`));
    }
  };

  const setCustomers = async (value: Customer[] | ((prev: Customer[]) => Customer[])) => {
    if (!user) return;
    const nextValue = typeof value === 'function' ? value(customers) : value;
    
    const added = nextValue.filter(p => !customers.find(op => op.id === p.id));
    for (const item of added) {
      await setDoc(doc(db, `users/${user.uid}/customers`, item.id), { ...item, uid: user.uid });
    }

    const deleted = customers.filter(p => !nextValue.find(np => np.id === p.id));
    for (const item of deleted) {
      await deleteDoc(doc(db, `users/${user.uid}/customers`, item.id));
    }

    const updated = nextValue.filter(p => {
      const old = customers.find(op => op.id === p.id);
      return old && JSON.stringify(old) !== JSON.stringify(p);
    });
    for (const item of updated) {
      await setDoc(doc(db, `users/${user.uid}/customers`, item.id), { ...item, uid: user.uid });
    }
  };

  const setSuppliers = async (value: Supplier[] | ((prev: Supplier[]) => Supplier[])) => {
    if (!user) return;
    const nextValue = typeof value === 'function' ? value(suppliers) : value;
    
    const added = nextValue.filter(p => !suppliers.find(op => op.id === p.id));
    for (const item of added) {
      await setDoc(doc(db, `users/${user.uid}/suppliers`, item.id), { ...item, uid: user.uid });
    }

    const deleted = suppliers.filter(p => !nextValue.find(np => np.id === p.id));
    for (const item of deleted) {
      await deleteDoc(doc(db, `users/${user.uid}/suppliers`, item.id));
    }

    const updated = nextValue.filter(p => {
      const old = suppliers.find(op => op.id === p.id);
      return old && JSON.stringify(old) !== JSON.stringify(p);
    });
    for (const item of updated) {
      await setDoc(doc(db, `users/${user.uid}/suppliers`, item.id), { ...item, uid: user.uid });
    }
  };

  const setInvoices = async (value: Invoice[] | ((prev: Invoice[]) => Invoice[])) => {
    if (!user) return;
    const nextValue = typeof value === 'function' ? value(invoices) : value;
    
    const added = nextValue.filter(p => !invoices.find(op => op.id === p.id));
    for (const item of added) {
      await setDoc(doc(db, `users/${user.uid}/invoices`, item.id), { ...item, uid: user.uid });
    }

    const deleted = invoices.filter(p => !nextValue.find(np => np.id === p.id));
    for (const item of deleted) {
      await deleteDoc(doc(db, `users/${user.uid}/invoices`, item.id));
    }

    const updated = nextValue.filter(p => {
      const old = invoices.find(op => op.id === p.id);
      return old && JSON.stringify(old) !== JSON.stringify(p);
    });
    for (const item of updated) {
      await setDoc(doc(db, `users/${user.uid}/invoices`, item.id), { ...item, uid: user.uid });
    }
  };

  const setRecipes = async (value: Recipe[] | ((prev: Recipe[]) => Recipe[])) => {
    if (!user) return;
    const nextValue = typeof value === 'function' ? value(recipes) : value;
    
    const added = nextValue.filter(p => !recipes.find(op => op.id === p.id));
    for (const item of added) {
      await setDoc(doc(db, `users/${user.uid}/recipes`, item.id), { ...item, uid: user.uid });
    }

    const deleted = recipes.filter(p => !nextValue.find(np => np.id === p.id));
    for (const item of deleted) {
      await deleteDoc(doc(db, `users/${user.uid}/recipes`, item.id));
    }

    const updated = nextValue.filter(p => {
      const old = recipes.find(op => op.id === p.id);
      return old && JSON.stringify(old) !== JSON.stringify(p);
    });
    for (const item of updated) {
      await setDoc(doc(db, `users/${user.uid}/recipes`, item.id), { ...item, uid: user.uid });
    }
  };

  const setAccounts = async (value: Account[] | ((prev: Account[]) => Account[])) => {
    if (!user) return;
    const nextValue = typeof value === 'function' ? value(accounts) : value;
    
    const added = nextValue.filter(p => !accounts.find(op => op.id === p.id));
    for (const item of added) {
      await setDoc(doc(db, `users/${user.uid}/accounts`, item.id), { ...item, uid: user.uid });
    }

    const deleted = accounts.filter(p => !nextValue.find(np => np.id === p.id));
    for (const item of deleted) {
      await deleteDoc(doc(db, `users/${user.uid}/accounts`, item.id));
    }

    const updated = nextValue.filter(p => {
      const old = accounts.find(op => op.id === p.id);
      return old && JSON.stringify(old) !== JSON.stringify(p);
    });
    for (const item of updated) {
      await setDoc(doc(db, `users/${user.uid}/accounts`, item.id), { ...item, uid: user.uid });
    }
  };

  const setExpenses = async (value: Expense[] | ((prev: Expense[]) => Expense[])) => {
    if (!user) return;
    const nextValue = typeof value === 'function' ? value(expenses) : value;
    
    const added = nextValue.filter(p => !expenses.find(op => op.id === p.id));
    for (const item of added) {
      await setDoc(doc(db, `users/${user.uid}/expenses`, item.id), { ...item, uid: user.uid });
    }

    const deleted = expenses.filter(p => !nextValue.find(np => np.id === p.id));
    for (const item of deleted) {
      await deleteDoc(doc(db, `users/${user.uid}/expenses`, item.id));
    }

    const updated = nextValue.filter(p => {
      const old = expenses.find(op => op.id === p.id);
      return old && JSON.stringify(old) !== JSON.stringify(p);
    });
    for (const item of updated) {
      await setDoc(doc(db, `users/${user.uid}/expenses`, item.id), { ...item, uid: user.uid });
    }
  };

  const setSettings = async (value: Settings | ((prev: Settings) => Settings)) => {
    if (!user) return;
    const nextValue = typeof value === 'function' ? value(settings) : value;
    await setDoc(doc(db, `users/${user.uid}/settings`, 'current'), { ...nextValue, uid: user.uid })
      .catch(err => handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/settings/current`));
  };

  return (
    <AppContext.Provider value={{
      products, setProducts,
      customers, setCustomers,
      suppliers, setSuppliers,
      invoices, setInvoices,
      recipes, setRecipes,
      accounts, setAccounts,
      expenses, setExpenses,
      settings, setSettings,
      user, login, loginWithEmail, registerWithEmail, logout, loading
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
