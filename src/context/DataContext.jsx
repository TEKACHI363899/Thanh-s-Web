import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, collection, onSnapshot, doc, setDoc, deleteDoc, broadcastRealtimeEvent } from '../services/firebase';

const DataContext = createContext();

const safeParse = (key, fallback) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch (err) {
    console.warn("Error parsing localStorage key:", key, err);
    return fallback;
  }
};

// Initial mock data defaults (Set to empty arrays [] for clean production startup)
const INITIAL_BATCHES = [];
const INITIAL_PRODUCTS = [];
const INITIAL_EXPENSES = [];
const INITIAL_ORDERS = [];

export const DataProvider = ({ children }) => {
  const [batches, setBatches] = useState(() => safeParse('thanh_app_batches', INITIAL_BATCHES));
  const [products, setProducts] = useState(() => safeParse('thanh_app_products', INITIAL_PRODUCTS));
  const [orders, setOrders] = useState(() => safeParse('thanh_app_orders', INITIAL_ORDERS));
  const [expenses, setExpenses] = useState(() => safeParse('thanh_app_expenses', INITIAL_EXPENSES));
  const [isCloudConnected, setIsCloudConnected] = useState(false);

  // Manual Full Data Reload Helper (Forces instant sync from LocalStorage / Firestore)
  const refreshAllData = () => {
    setBatches(safeParse('thanh_app_batches', INITIAL_BATCHES));
    setProducts(safeParse('thanh_app_products', INITIAL_PRODUCTS));
    setOrders(safeParse('thanh_app_orders', INITIAL_ORDERS));
    setExpenses(safeParse('thanh_app_expenses', INITIAL_EXPENSES));
  };

  // Firestore Realtime Subscription & Initial Sync
  useEffect(() => {
    let unsubs = [];
    try {
      if (db) {
        // Subscribe to Batches
        const unsubBatches = onSnapshot(collection(db, 'batches'), (snapshot) => {
          const list = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
          setBatches(list);
          setIsCloudConnected(true);
        }, (err) => console.warn("Firestore Batches listener warning:", err));
        unsubs.push(unsubBatches);

        // Subscribe to Products
        const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
          const list = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
          setProducts(list);
          setIsCloudConnected(true);
        }, (err) => console.warn("Firestore Products listener warning:", err));
        unsubs.push(unsubProducts);

        // Subscribe to Orders
        const unsubOrders = onSnapshot(collection(db, 'orders'), (snapshot) => {
          const list = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
          setOrders(list);
          setIsCloudConnected(true);
        }, (err) => console.warn("Firestore Orders listener warning:", err));
        unsubs.push(unsubOrders);

        // Subscribe to Expenses
        const unsubExpenses = onSnapshot(collection(db, 'expenses'), (snapshot) => {
          const list = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
          setExpenses(list);
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
        setProducts(safeParse('thanh_app_products', INITIAL_PRODUCTS));
      } else if (e.key === 'thanh_app_batches') {
        setBatches(safeParse('thanh_app_batches', INITIAL_BATCHES));
      } else if (e.key === 'thanh_app_orders') {
        setOrders(safeParse('thanh_app_orders', INITIAL_ORDERS));
      } else if (e.key === 'thanh_app_expenses') {
        setExpenses(safeParse('thanh_app_expenses', INITIAL_EXPENSES));
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
      if (db) {
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

  const generateNextSKU = (category) => {
    const catPrefix = category === 'TS' ? 'TS' : 'QA';
    const matchingProducts = products.filter(p => p.category === category);
    
    let maxNum = 0;
    matchingProducts.forEach(p => {
      const numPart = p.sku.replace(catPrefix, '');
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
    const newSku = productData.sku || generateNextSKU(productData.category);
    const newProduct = {
      ...productData,
      id: 'prod_' + Date.now(),
      sku: newSku,
      soldCount: 0,
      stock: Number(productData.stock) || 0,
      costPrice: Number(productData.costPrice) || 0,
      marginPercent: Number(productData.marginPercent) || 0,
      sellingPrice: Number(productData.sellingPrice) || 0
    };
    setProducts(prev => [newProduct, ...prev]);
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
    const newBatch = {
      ...batchData,
      id: 'batch_' + Date.now(),
      totalCapital: Number(batchData.totalCapital) || 0
    };
    setBatches(prev => [newBatch, ...prev]);
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
    const newExp = {
      ...expenseData,
      id: 'exp_' + Date.now(),
      amount: Number(expenseData.amount) || 0
    };
    setExpenses(prev => [newExp, ...prev]);
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
    const newOrderCode = 'DH-' + (1000 + orders.length + 1);
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const newOrder = {
      ...orderData,
      id: 'ord_' + Date.now(),
      code: newOrderCode,
      createdDate: orderData.createdDate || nowStr,
      shippingFee: Number(orderData.shippingFee) || 0,
      depositAmount: Number(orderData.depositAmount) || 0,
      remainingDebt: Number(orderData.remainingDebt) || 0
    };

    setOrders(prev => [newOrder, ...prev]);
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
      expenses
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
      if (parsed.batches) setBatches(parsed.batches);
      if (parsed.products) setProducts(parsed.products);
      if (parsed.orders) setOrders(parsed.orders);
      if (parsed.expenses) setExpenses(parsed.expenses);
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
