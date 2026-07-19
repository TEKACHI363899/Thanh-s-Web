import React, { createContext, useContext, useState, useEffect } from 'react';
import { broadcastRealtimeEvent } from '../services/firebase';

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

const INITIAL_BATCHES = [
  {
    id: 'batch_1',
    code: 'LÔ-01',
    name: 'Đợt nhập Tháng 7 (Hàng Hè)',
    importDate: '2026-07-01',
    totalCapital: 15000000,
    notes: 'Nhập trang sức bạc và quần áo hè hot trend'
  },
  {
    id: 'batch_2',
    code: 'LÔ-02',
    name: 'Đợt nhập Đồ Order Hàn Quốc',
    importDate: '2026-07-10',
    totalCapital: 25000000,
    notes: 'Đợt hàng quần áo thiết kế & phụ kiện cao cấp'
  }
];

const INITIAL_PRODUCTS = [
  {
    id: 'prod_1',
    sku: 'TS001',
    name: 'Dây chuyền Bạc Ý S925 Cỏ 4 Lá',
    category: 'TS',
    batchId: 'batch_1',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80',
    costPrice: 150000,
    marginPercent: 60,
    sellingPrice: 240000,
    stock: 20,
    soldCount: 8
  },
  {
    id: 'prod_2',
    sku: 'TS002',
    name: 'Bông tai Pearl Vintage mạ vàng 18K',
    category: 'TS',
    batchId: 'batch_1',
    image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=400&q=80',
    costPrice: 90000,
    marginPercent: 80,
    sellingPrice: 162000,
    stock: 15,
    soldCount: 5
  },
  {
    id: 'prod_3',
    sku: 'QA001',
    name: 'Áo Blazer Oversize Dáng Hàn Quốc',
    category: 'QA',
    batchId: 'batch_2',
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&q=80',
    costPrice: 320000,
    marginPercent: 50,
    sellingPrice: 480000,
    stock: 12,
    soldCount: 4
  },
  {
    id: 'prod_4',
    sku: 'QA002',
    name: 'Váy Linen Đốm Hoa Vintage',
    category: 'QA',
    batchId: 'batch_2',
    image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&q=80',
    costPrice: 250000,
    marginPercent: 55,
    sellingPrice: 388000,
    stock: 10,
    soldCount: 3
  }
];

const INITIAL_EXPENSES = [
  {
    id: 'exp_1',
    date: '2026-07-02',
    amount: 350000,
    reason: 'In ấn bao bì xốp + Sticker logo thương hiệu',
    category: 'Bao bì & In ấn'
  },
  {
    id: 'exp_2',
    date: '2026-07-05',
    amount: 1200000,
    reason: 'Phí chạy quảng cáo Facebook & Instagram đợt 1',
    category: 'Quảng cáo'
  },
  {
    id: 'exp_3',
    date: '2026-07-12',
    amount: 180000,
    reason: 'Mua băng keo niêm phong & túi gói hàng',
    category: 'Vật tư gói hàng'
  }
];

const INITIAL_ORDERS = [
  {
    id: 'ord_1',
    code: 'DH-1001',
    createdDate: '2026-07-15 14:30',
    customerName: 'Nguyễn Thị Mai',
    customerPhone: '0987654321',
    customerAddress: '123 Nguyễn Trãi, Quận 1, TP. Hồ Chí Minh',
    platform: 'IG',
    socialUsername: '@mainguyen_99',
    orderType: 'Có sẵn',
    items: [
      {
        productId: 'prod_1',
        sku: 'TS001',
        productName: 'Dây chuyền Bạc Ý S925 Cỏ 4 Lá',
        batchId: 'batch_1',
        quantity: 1,
        unitPrice: 240000,
        unitCost: 150000,
        note: 'Tặng kèm hộp quà đỏ'
      }
    ],
    shippingFee: 30000,
    isFreeship: true,
    paymentMethod: 'Chuyển khoản full',
    depositAmount: 270000,
    remainingDebt: 0,
    sourceLink: '',
    estimatedArrivalDate: '',
    status: 'Đã giao',
    orderNotes: 'Khách quen trên IG, giao giờ hành chính'
  },
  {
    id: 'ord_2',
    code: 'DH-1002',
    createdDate: '2026-07-18 10:15',
    customerName: 'Trần Minh Anh',
    customerPhone: '0912345678',
    customerAddress: '45 Lê Lợi, Phường Bến Nghé, Quận 1',
    platform: 'FB',
    socialUsername: 'Minh Anh Tran (Blue)',
    orderType: 'Order',
    items: [
      {
        productId: 'prod_3',
        sku: 'QA001',
        productName: 'Áo Blazer Oversize Dáng Hàn Quốc',
        batchId: 'batch_2',
        quantity: 1,
        unitPrice: 480000,
        unitCost: 320000,
        note: 'Size M - Màu Be'
      }
    ],
    shippingFee: 35000,
    isFreeship: false,
    paymentMethod: 'COD',
    depositAmount: 200000,
    remainingDebt: 315000,
    sourceLink: 'https://taobao.com/item/67891234',
    estimatedArrivalDate: '2026-07-25',
    status: 'Đang giao',
    orderNotes: 'Đã cọc 200k qua Vietcombank. Thu COD còn lại'
  }
];

export const DataProvider = ({ children }) => {
  const [batches, setBatches] = useState(() => safeParse('thanh_app_batches', INITIAL_BATCHES));
  const [products, setProducts] = useState(() => safeParse('thanh_app_products', INITIAL_PRODUCTS));
  const [orders, setOrders] = useState(() => safeParse('thanh_app_orders', INITIAL_ORDERS));
  const [expenses, setExpenses] = useState(() => safeParse('thanh_app_expenses', INITIAL_EXPENSES));

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

  useEffect(() => {
    if (typeof window === 'undefined' || !window.BroadcastChannel) return;
    const channel = new BroadcastChannel('thanh_management_realtime_sync');
    channel.onmessage = (event) => {
      const { type } = event.data;
      if (type === 'REFRESH_DATA') {
        setBatches(safeParse('thanh_app_batches', INITIAL_BATCHES));
        setProducts(safeParse('thanh_app_products', INITIAL_PRODUCTS));
        setOrders(safeParse('thanh_app_orders', INITIAL_ORDERS));
        setExpenses(safeParse('thanh_app_expenses', INITIAL_EXPENSES));
      }
    };
    return () => channel.close();
  }, []);

  const notifyChange = () => {
    broadcastRealtimeEvent('REFRESH_DATA', {});
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
    notifyChange();
    return newProduct;
  };

  const updateProduct = (id, updatedData) => {
    setProducts(prev => prev.map(p => p.id === id ? { 
      ...p, 
      ...updatedData,
      stock: Number(updatedData.stock),
      costPrice: Number(updatedData.costPrice),
      marginPercent: Number(updatedData.marginPercent),
      sellingPrice: Number(updatedData.sellingPrice)
    } : p));
    notifyChange();
  };

  const deleteProduct = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    notifyChange();
  };

  const addBatch = (batchData) => {
    const newBatch = {
      ...batchData,
      id: 'batch_' + Date.now(),
      totalCapital: Number(batchData.totalCapital) || 0
    };
    setBatches(prev => [newBatch, ...prev]);
    notifyChange();
  };

  const updateBatch = (id, updatedData) => {
    setBatches(prev => prev.map(b => b.id === id ? {
      ...b,
      ...updatedData,
      totalCapital: Number(updatedData.totalCapital)
    } : b));
    notifyChange();
  };

  const deleteBatch = (id) => {
    setBatches(prev => prev.filter(b => b.id !== id));
    notifyChange();
  };

  const addExpense = (expenseData) => {
    const newExp = {
      ...expenseData,
      id: 'exp_' + Date.now(),
      amount: Number(expenseData.amount) || 0
    };
    setExpenses(prev => [newExp, ...prev]);
    notifyChange();
  };

  const updateExpense = (id, updatedData) => {
    setExpenses(prev => prev.map(e => e.id === id ? {
      ...e,
      ...updatedData,
      amount: Number(updatedData.amount)
    } : e));
    notifyChange();
  };

  const deleteExpense = (id) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
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

    if (newOrder.status === 'Đã giao') {
      applyStockDeduction(newOrder.items, 'deduct');
    }

    notifyChange();
    return newOrder;
  };

  const updateOrder = (id, updatedData) => {
    const oldOrder = orders.find(o => o.id === id);
    if (!oldOrder) return;

    const wasDelivered = oldOrder.status === 'Đã giao';
    const isNowDelivered = updatedData.status === 'Đã giao';

    setOrders(prev => prev.map(o => o.id === id ? { ...o, ...updatedData } : o));

    if (!wasDelivered && isNowDelivered) {
      applyStockDeduction(updatedData.items || oldOrder.items, 'deduct');
    } else if (wasDelivered && !isNowDelivered) {
      applyStockDeduction(oldOrder.items, 'restore');
    }

    notifyChange();
  };

  const deleteOrder = (id) => {
    const targetOrder = orders.find(o => o.id === id);
    if (targetOrder && targetOrder.status === 'Đã giao') {
      applyStockDeduction(targetOrder.items, 'restore');
    }
    setOrders(prev => prev.filter(o => o.id !== id));
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
          return {
            ...p,
            stock: newStock,
            soldCount: newSold
          };
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

  return (
    <DataContext.Provider value={{
      batches,
      products,
      orders,
      expenses,
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
