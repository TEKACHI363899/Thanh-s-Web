import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, collection, onSnapshot, doc, setDoc, deleteDoc, broadcastRealtimeEvent } from '../services/firebase';

const DataContext = createContext();

// Utility: Extract capital first letters of each word in Vietnamese string
export const generatePrefixFromCategoryName = (name) => {
  if (!name || typeof name !== 'string') return 'SP';
  const cleanStr = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove Vietnamese diacritics
    .replace(/[đĐ]/g, 'd')
    .trim();
  
  if (!cleanStr) return 'SP';

  const words = cleanStr.split(/\s+/).filter(Boolean);
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  
  const prefix = words.map(w => w[0].toUpperCase()).join('');
  return prefix || 'SP';
};

const DEFAULT_CUSTOM_CATEGORIES = [
  { code: 'TS', name: 'Trang Sức', prefix: 'TS', icon: '💎' },
  { code: 'QA', name: 'Quần Áo', prefix: 'QA', icon: '👔' }
];

// Unique ID Generator (Combines prefix, timestamp, and random string to prevent ID collisions forever)
const generateUniqueId = (prefix) => {
  const randomPart = Math.random().toString(36).substring(2, 9);
  return `${prefix}_${Date.now()}_${randomPart}`;
};

// Automatic Data Integrity Repair Helper (Deduplicates IDs if old items shared duplicate Date.now IDs)
const sanitizeList = (list, prefix) => {
  if (!Array.isArray(list)) return [];
  const seenIds = new Set();
  return list.map(item => {
    let validId = item.id;
    if (!validId || seenIds.has(validId)) {
      validId = generateUniqueId(prefix);
    }
    seenIds.add(validId);
    return { ...item, id: validId };
  });
};

const safeParse = (key, fallback, prefix) => {
  try {
    const saved = localStorage.getItem(key);
    const parsed = saved ? JSON.parse(saved) : fallback;
    return sanitizeList(parsed, prefix);
  } catch (err) {
    console.warn("Error parsing localStorage key:", key, err);
    return fallback;
  }
};

// Initial mock data defaults
const INITIAL_BATCHES = [];
const INITIAL_PRODUCTS = [];
const INITIAL_EXPENSES = [];
const INITIAL_ORDERS = [];

export const DataProvider = ({ children }) => {
  const [batches, setBatches] = useState(() => safeParse('thanh_app_batches', INITIAL_BATCHES, 'batch'));
  const [products, setProducts] = useState(() => safeParse('thanh_app_products', INITIAL_PRODUCTS, 'prod'));
  const [orders, setOrders] = useState(() => safeParse('thanh_app_orders', INITIAL_ORDERS, 'ord'));
  const [expenses, setExpenses] = useState(() => safeParse('thanh_app_expenses', INITIAL_EXPENSES, 'exp'));
  const [isCloudConnected, setIsCloudConnected] = useState(false);

  const [customCategories, setCustomCategories] = useState(() => {
    try {
      const saved = localStorage.getItem('thanh_app_custom_categories');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_CUSTOM_CATEGORIES;
  });

  useEffect(() => {
    try {
      localStorage.setItem('thanh_app_custom_categories', JSON.stringify(customCategories));
    } catch (e) {}
  }, [customCategories]);

  const addCustomCategory = (categoryName, customPrefixInput) => {
    const prefix = (customPrefixInput || generatePrefixFromCategoryName(categoryName)).toUpperCase().trim();
    const newCat = {
      code: prefix,
      name: categoryName.trim(),
      prefix: prefix,
      icon: '📦'
    };
    setCustomCategories(prev => {
      if (prev.some(c => c.code === newCat.code)) return prev;
      return [...prev, newCat];
    });
    notifyChange();
    return newCat;
  };

  const deleteCustomCategory = (categoryCode) => {
    setCustomCategories(prev => {
      const updated = prev.filter(c => c.code !== categoryCode && c.prefix !== categoryCode);
      try {
        localStorage.setItem('thanh_app_custom_categories', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    notifyChange();
  };

  // Manual Full Data Reload Helper
  const refreshAllData = () => {
    setBatches(safeParse('thanh_app_batches', INITIAL_BATCHES, 'batch'));
    setProducts(safeParse('thanh_app_products', INITIAL_PRODUCTS, 'prod'));
    setOrders(safeParse('thanh_app_orders', INITIAL_ORDERS, 'ord'));
    setExpenses(safeParse('thanh_app_expenses', INITIAL_EXPENSES, 'exp'));
  };

  // Firestore Realtime Subscription & Initial Sync with Hybrid Local Merge Guard
  useEffect(() => {
    let unsubs = [];
    try {
      if (db) {
        // Subscribe to Batches
        const unsubBatches = onSnapshot(collection(db, 'batches'), (snapshot) => {
          const list = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
          setBatches(prevLocal => {
            const cloudIds = new Set(list.map(item => item.id));
            const recentLocal = prevLocal.filter(item => !cloudIds.has(item.id) && item._createdAt && (Date.now() - item._createdAt < 120000));
            return sanitizeList([...list, ...recentLocal], 'batch');
          });
          setIsCloudConnected(true);
        }, (err) => console.warn("Firestore Batches listener warning:", err));
        unsubs.push(unsubBatches);

        // Subscribe to Products
        const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
          const list = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
          setProducts(prevLocal => {
            const cloudIds = new Set(list.map(item => item.id));
            const recentLocal = prevLocal.filter(item => !cloudIds.has(item.id) && item._createdAt && (Date.now() - item._createdAt < 120000));
            return sanitizeList([...list, ...recentLocal], 'prod');
          });
          setIsCloudConnected(true);
        }, (err) => console.warn("Firestore Products listener warning:", err));
        unsubs.push(unsubProducts);

        // Subscribe to Orders
        const unsubOrders = onSnapshot(collection(db, 'orders'), (snapshot) => {
          const list = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
          setOrders(prevLocal => {
            const cloudIds = new Set(list.map(item => item.id));
            const recentLocal = prevLocal.filter(item => !cloudIds.has(item.id) && item._createdAt && (Date.now() - item._createdAt < 120000));
            return sanitizeList([...list, ...recentLocal], 'ord');
          });
          setIsCloudConnected(true);
        }, (err) => console.warn("Firestore Orders listener warning:", err));
        unsubs.push(unsubOrders);

        // Subscribe to Expenses
        const unsubExpenses = onSnapshot(collection(db, 'expenses'), (snapshot) => {
          const list = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
          setExpenses(prevLocal => {
            const cloudIds = new Set(list.map(item => item.id));
            const recentLocal = prevLocal.filter(item => !cloudIds.has(item.id) && item._createdAt && (Date.now() - item._createdAt < 120000));
            return sanitizeList([...list, ...recentLocal], 'exp');
          });
          setIsCloudConnected(true);
        }, (err) => console.warn("Firestore Expenses listener warning:", err));
        unsubs.push(unsubExpenses);
      }
    } catch (e) {
      console.warn("Cloud Firestore initialization error, falling back to local:", e);
    }

    return () => {
      unsubs.forEach(unsub => unsub && unsub());
    };
  }, []);

  // Save to LocalStorage as secondary cache
  useEffect(() => {
    try { localStorage.setItem('thanh_app_batches', JSON.stringify(batches)); } catch (e) {}
  }, [batches]);

  useEffect(() => {
    try { localStorage.setItem('thanh_app_products', JSON.stringify(products)); } catch (e) {}
  }, [products]);

  useEffect(() => {
    try { localStorage.setItem('thanh_app_orders', JSON.stringify(orders)); } catch (e) {}
  }, [orders]);

  useEffect(() => {
    try { localStorage.setItem('thanh_app_expenses', JSON.stringify(expenses)); } catch (e) {}
  }, [expenses]);

  // Realtime Tab Sync & Cross-Window Storage Event Listener
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'thanh_app_products') {
        setProducts(safeParse('thanh_app_products', INITIAL_PRODUCTS, 'prod'));
      } else if (e.key === 'thanh_app_batches') {
        setBatches(safeParse('thanh_app_batches', INITIAL_BATCHES, 'batch'));
      } else if (e.key === 'thanh_app_orders') {
        setOrders(safeParse('thanh_app_orders', INITIAL_ORDERS, 'ord'));
      } else if (e.key === 'thanh_app_expenses') {
        setExpenses(safeParse('thanh_app_expenses', INITIAL_EXPENSES, 'exp'));
      } else if (e.key === 'thanh_app_custom_categories') {
        try { setCustomCategories(JSON.parse(e.newValue)); } catch (err) {}
      }
    };

    window.addEventListener('storage', handleStorageChange);

    if (typeof window !== 'undefined' && window.BroadcastChannel) {
      const channel = new BroadcastChannel('thanh_management_realtime_sync');
      channel.onmessage = (event) => {
        const { type } = event.data;
        if (type === 'REFRESH_DATA') {
          refreshAllData();
        }
      };
      return () => {
        window.removeEventListener('storage', handleStorageChange);
        channel.close();
      };
    }

    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const notifyChange = () => {
    broadcastRealtimeEvent('REFRESH_DATA', {});
  };

  // Helper function to sync a item to Cloud Firestore if connected
  const syncToCloud = async (collectionName, id, data, isDelete = false) => {
    try {
      if (db && id) {
        const docRef = doc(db, collectionName, id);
        if (isDelete) {
          await deleteDoc(docRef);
        } else {
          await setDoc(docRef, data, { merge: true });
        }
      }
    } catch (err) {
      console.warn(`Firestore sync error on ${collectionName}/${id}:`, err);
    }
  };

  const generateNextSKU = (categoryCode, customPrefixInput) => {
    let catPrefix = 'TS';
    if (customPrefixInput) {
      catPrefix = customPrefixInput.toUpperCase().trim();
    } else if (categoryCode) {
      const foundCat = customCategories.find(c => c.code === categoryCode || c.name === categoryCode);
      if (foundCat) {
        catPrefix = foundCat.prefix || foundCat.code;
      } else {
        catPrefix = categoryCode.toUpperCase().trim();
      }
    }

    const matchingProducts = products.filter(p => {
      if (!p.sku) return false;
      const cleanSkuPrefix = p.sku.replace(/\d+$/, '').toUpperCase();
      return p.category === categoryCode || cleanSkuPrefix === catPrefix || p.sku.toUpperCase().startsWith(catPrefix);
    });
    
    let maxNum = 0;
    matchingProducts.forEach(p => {
      const numPart = p.sku.replace(new RegExp(`^${catPrefix}`, 'i'), '').replace(/\D+/g, '');
      const val = parseInt(numPart, 10);
      if (!isNaN(val) && val > maxNum) {
        maxNum = val;
      }
    });

    const nextNum = maxNum + 1;
    const padded = String(nextNum).padStart(3, '0');
    return `${catPrefix}${padded}`;
  };

  const addProduct = (productData) => {
    const uniqueId = generateUniqueId('prod');
    const newSku = productData.sku || generateNextSKU(productData.category);
    const newProduct = {
      ...productData,
      id: uniqueId,
      sku: newSku,
      soldCount: 0,
      stock: Number(productData.stock) || 0,
      costPrice: Number(productData.costPrice) || 0,
      marginPercent: Number(productData.marginPercent) || 0,
      sellingPrice: Number(productData.sellingPrice) || 0,
      _createdAt: Date.now()
    };
    setProducts(prev => [newProduct, ...prev.filter(p => p.id !== uniqueId)]);
    syncToCloud('products', newProduct.id, newProduct);
    notifyChange();
    return newProduct;
  };

  const updateProduct = (id, updatedData) => {
    let finalUpdated = null;
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        finalUpdated = {
          ...p,
          ...updatedData,
          stock: Number(updatedData.stock),
          costPrice: Number(updatedData.costPrice),
          marginPercent: Number(updatedData.marginPercent),
          sellingPrice: Number(updatedData.sellingPrice)
        };
        return finalUpdated;
      }
      return p;
    }));
    if (finalUpdated) syncToCloud('products', id, finalUpdated);
    notifyChange();
  };

  const deleteProduct = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    syncToCloud('products', id, null, true);
    notifyChange();
  };

  const addBatch = (batchData) => {
    const uniqueId = generateUniqueId('batch');
    const newBatch = {
      ...batchData,
      id: uniqueId,
      totalCapital: Number(batchData.totalCapital) || 0,
      _createdAt: Date.now()
    };
    setBatches(prev => [newBatch, ...prev.filter(b => b.id !== uniqueId)]);
    syncToCloud('batches', newBatch.id, newBatch);
    notifyChange();
  };

  const updateBatch = (id, updatedData) => {
    let finalUpdated = null;
    setBatches(prev => prev.map(b => {
      if (b.id === id) {
        finalUpdated = {
          ...b,
          ...updatedData,
          totalCapital: Number(updatedData.totalCapital)
        };
        return finalUpdated;
      }
      return b;
    }));
    if (finalUpdated) syncToCloud('batches', id, finalUpdated);
    notifyChange();
  };

  const deleteBatch = (id) => {
    setBatches(prev => prev.filter(b => b.id !== id));
    syncToCloud('batches', id, null, true);
    notifyChange();
  };

  const addExpense = (expenseData) => {
    const uniqueId = generateUniqueId('exp');
    const newExp = {
      ...expenseData,
      id: uniqueId,
      amount: Number(expenseData.amount) || 0,
      _createdAt: Date.now()
    };
    setExpenses(prev => [newExp, ...prev.filter(e => e.id !== uniqueId)]);
    syncToCloud('expenses', newExp.id, newExp);
    notifyChange();
  };

  const updateExpense = (id, updatedData) => {
    let finalUpdated = null;
    setExpenses(prev => prev.map(e => {
      if (e.id === id) {
        finalUpdated = {
          ...e,
          ...updatedData,
          amount: Number(updatedData.amount)
        };
        return finalUpdated;
      }
      return e;
    }));
    if (finalUpdated) syncToCloud('expenses', id, finalUpdated);
    notifyChange();
  };

  const deleteExpense = (id) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    syncToCloud('expenses', id, null, true);
    notifyChange();
  };

  const addOrder = (orderData) => {
    const uniqueId = generateUniqueId('ord');
    const newOrderCode = 'DH-' + (1000 + orders.length + 1);
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const newOrder = {
      ...orderData,
      id: uniqueId,
      code: newOrderCode,
      createdDate: orderData.createdDate || nowStr,
      shippingFee: Number(orderData.shippingFee) || 0,
      depositAmount: Number(orderData.depositAmount) || 0,
      remainingDebt: Number(orderData.remainingDebt) || 0,
      _createdAt: Date.now()
    };

    setOrders(prev => [newOrder, ...prev.filter(o => o.id !== uniqueId)]);
    syncToCloud('orders', newOrder.id, newOrder);

    // Deduct stock immediately upon order creation (unless status is Hoàn/Hủy right away)
    if (newOrder.status !== 'Hoàn/Hủy') {
      applyStockDeduction(newOrder.items, 'deduct');
    }

    notifyChange();
    return newOrder;
  };

  const updateOrder = (id, updatedData) => {
    const oldOrder = orders.find(o => o.id === id);
    if (!oldOrder) return;

    const wasCancelled = oldOrder.status === 'Hoàn/Hủy';
    const isNowCancelled = updatedData.status === 'Hoàn/Hủy';
    const finalOrder = { ...oldOrder, ...updatedData };

    setOrders(prev => prev.map(o => o.id === id ? finalOrder : o));
    syncToCloud('orders', id, finalOrder);

    // If order gets cancelled, restore stock. If restored from cancelled back to active, deduct stock.
    if (!wasCancelled && isNowCancelled) {
      applyStockDeduction(oldOrder.items, 'restore');
    } else if (wasCancelled && !isNowCancelled) {
      applyStockDeduction(updatedData.items || oldOrder.items, 'deduct');
    }

    notifyChange();
  };

  const deleteOrder = (id) => {
    const targetOrder = orders.find(o => o.id === id);
    // If deleted order was active (not cancelled), restore stock
    if (targetOrder && targetOrder.status !== 'Hoàn/Hủy') {
      applyStockDeduction(targetOrder.items, 'restore');
    }
    setOrders(prev => prev.filter(o => o.id !== id));
    syncToCloud('orders', id, null, true);
    notifyChange();
  };

  const applyStockDeduction = (orderItems, action) => {
    if (!orderItems || !orderItems.length) return;
    
    setProducts(prevProducts => {
      return prevProducts.map(p => {
        const matchedItem = orderItems.find(item => item.productId === p.id);
        if (matchedItem) {
          const qty = Number(matchedItem.quantity) || 1;
          const deltaStock = action === 'deduct' ? -qty : qty;
          const deltaSold = action === 'deduct' ? qty : -qty;

          const newStock = Math.max(0, p.stock + deltaStock);
          const newSold = Math.max(0, p.soldCount + deltaSold);
          const updatedP = {
            ...p,
            stock: newStock,
            soldCount: newSold
          };
          syncToCloud('products', updatedP.id, updatedP);
          return updatedP;
        }
        return p;
      });
    });
  };

  const setOrderStatus = (orderId, newStatus) => {
    const target = orders.find(o => o.id === orderId);
    if (target) {
      updateOrder(orderId, { ...target, status: newStatus });
    }
  };

  // Full System Data Export & Import Helper (Backup JSON)
  const exportBackupJSON = () => {
    const backupData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      batches,
      products,
      orders,
      expenses,
      customCategories
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `THANH_STORE_DATA_BACKUP_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importBackupJSON = (jsonData) => {
    try {
      const parsed = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      if (parsed.batches) setBatches(sanitizeList(parsed.batches, 'batch'));
      if (parsed.products) setProducts(sanitizeList(parsed.products, 'prod'));
      if (parsed.orders) setOrders(sanitizeList(parsed.orders, 'ord'));
      if (parsed.expenses) setExpenses(sanitizeList(parsed.expenses, 'exp'));
      if (parsed.customCategories) setCustomCategories(parsed.customCategories);
      notifyChange();
      return true;
    } catch (e) {
      console.error("Error importing backup JSON:", e);
      return false;
    }
  };

  return (
    <DataContext.Provider value={{
      batches,
      products,
      orders,
      expenses,
      customCategories,
      addCustomCategory,
      deleteCustomCategory,
      isCloudConnected,
      refreshAllData,
      exportBackupJSON,
      importBackupJSON,
      generateNextSKU,
      addProduct,
      updateProduct,
      deleteProduct,
      addBatch,
      updateBatch,
      deleteBatch,
      addExpense,
      updateExpense,
      deleteExpense,
      addOrder,
      updateOrder,
      deleteOrder,
      setOrderStatus
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
