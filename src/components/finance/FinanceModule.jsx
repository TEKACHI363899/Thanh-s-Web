import React, { useState, useMemo } from 'react';
import { TYPOGRAPHY } from '../../theme/typography';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from '../common/RNBridge';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../theme/colors';
import {
  DollarSign,
  FileText,
  PieChart,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  TrendingUp,
  Package,
  Users,
  Check,
  BarChart3,
  Boxes
} from 'lucide-react';
import { formatCurrencyInput, parseCurrencyInput } from '../../utils/formatters';

export const FinanceModule = () => {
  const {
    expenses,
    orders,
    products,
    batches,
    customCategories,
    availableCapital,
    setAvailableCapital,
    addExpense,
    updateExpense,
    deleteExpense
  } = useData();

  const { requireAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState('PROFIT');

  const [capitalInputStr, setCapitalInputStr] = React.useState(() => {
    return availableCapital ? formatCurrencyInput(availableCapital) : '';
  });

  React.useEffect(() => {
    const num = parseCurrencyInput(capitalInputStr);
    if (num !== availableCapital) {
      setCapitalInputStr(availableCapital ? formatCurrencyInput(availableCapital) : '');
    }
  }, [availableCapital]);

  const handleCapitalChange = (val) => {
    requireAdmin(() => {
      setCapitalInputStr(val);
      const parsed = parseCurrencyInput(val);
      setAvailableCapital(parsed);
    }, 'Vui lòng đăng nhập Admin để thay đổi Nguồn vốn khả dụng!');
  };

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [expDate, setExpDate] = useState('');
  const [expAmount, setExpAmount] = useState(100000);
  const [expReason, setExpReason] = useState('');
  const [expCategory, setExpCategory] = useState('Bao bì & In ấn');

  const currentMonthStr = useMemo(() => new Date().toISOString().substring(0, 7), []);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);
  const [hoveredMonthData, setHoveredMonthData] = useState(null);

  const startAddExpense = () => {
    requireAdmin(() => {
      setEditingExpenseId('NEW');
      setExpDate(new Date().toISOString().substring(0, 10));
      setExpAmount(100000);
      setExpReason('');
      setExpCategory('Bao bì & In ấn');
      setIsExpenseModalOpen(true);
    }, 'Vui lòng đăng nhập Admin để ghi khoản chi mới!');
  };

  const startEditExpense = (exp) => {
    requireAdmin(() => {
      setEditingExpenseId(exp.id);
      setExpDate(exp.date || '');
      setExpAmount(Number(exp.amount || 0));
      setExpReason(exp.reason || '');
      setExpCategory(exp.category || 'Chi phí khác');
      setIsExpenseModalOpen(true);
    }, 'Vui lòng đăng nhập Admin để sửa khoản chi!');
  };

  const handleSaveExpense = () => {
    requireAdmin(() => {
      if (!expReason.trim() || !expAmount) {
        alert('Vui lòng nhập số tiền và lý do chi!');
        return;
      }

      const payload = {
        date: expDate,
        amount: Math.max(0, Number(expAmount) || 0),
        reason: expReason.trim(),
        category: expCategory
      };

      if (editingExpenseId === 'NEW') {
        addExpense(payload);
      } else {
        updateExpense(editingExpenseId, payload);
      }

      setIsExpenseModalOpen(false);
    }, 'Vui lòng đăng nhập Admin để lưu khoản chi!');
  };

  const handleDeleteExpense = (exp) => {
    requireAdmin(() => {
      if (window.confirm(`Xóa khoản chi "${exp.reason}" (${formatCurrency(exp.amount)})?`)) {
        deleteExpense(exp.id);
      }
    }, 'Vui lòng đăng nhập Admin để xóa khoản chi!');
  };

  const formatCurrency = (val) => {
    return (Number(val) || 0).toLocaleString('vi-VN') + ' VNĐ';
  };

  // Product groups
  const looseProducts = useMemo(() => products.filter((p) => !p.batchId || p.is_loose), [products]);

  // Capital Balance & Real Cash Calculations
  const totalCapitalInvestedAllBatches = useMemo(() => {
    return batches.reduce((sum, b) => sum + (Number(b.totalCapital) || 0), 0);
  }, [batches]);
  const actualCashRemaining = Number(availableCapital || 0) - totalCapitalInvestedAllBatches;

  // Expected Inventory Revenue & Profit Calculations (Full warehouse)
  const expectedInventoryRevenue = useMemo(() => {
    return products.reduce((sum, p) => sum + (Number(p.sellingPrice) || 0) * (Number(p.stock) || 0), 0);
  }, [products]);

  const expectedInventoryCost = useMemo(() => {
    return products.reduce((sum, p) => sum + (Number(p.costPrice) || 0) * (Number(p.stock) || 0), 0);
  }, [products]);

  const expectedInventoryProfit = expectedInventoryRevenue - expectedInventoryCost;
  const totalProductsInInventory = useMemo(() => {
    return products.reduce((sum, p) => sum + (Number(p.stock) || 0), 0);
  }, [products]);

  // Delivered Orders Calculations in Selected Month
  const deliveredOrdersInMonth = useMemo(() => {
    return orders.filter((o) => {
      const isDelivered = o.status === 'Đã giao';
      const isMonth = o.createdDate && o.createdDate.startsWith(selectedMonth);
      return isDelivered && isMonth;
    });
  }, [orders, selectedMonth]);

  const totalDeliveredRevenue = useMemo(() => {
    return deliveredOrdersInMonth.reduce((sum, o) => {
      const itemsTotal = o.items.reduce((s, it) => s + (Number(it.unitPrice) || 0) * (Number(it.quantity) || 1), 0);
      return sum + itemsTotal;
    }, 0);
  }, [deliveredOrdersInMonth]);

  const totalCostOfGoodsSold = useMemo(() => {
    return deliveredOrdersInMonth.reduce((sum, o) => {
      return (
        sum +
        o.items.reduce((s, it) => {
          const p = products.find((prod) => prod.id === it.productId);
          const unitCost = it.unitCost !== undefined ? Number(it.unitCost) : p ? Number(p.costPrice) : 0;
          return s + unitCost * (Number(it.quantity) || 1);
        }, 0)
      );
    }, 0);
  }, [deliveredOrdersInMonth, products]);

  // Revenue Source Breakdown (Batched vs Loose)
  const batchedRevenue = useMemo(() => {
    return deliveredOrdersInMonth.reduce((sum, o) => {
      return (
        sum +
        o.items
          .filter((it) => it.batchId && !it.is_loose)
          .reduce((s, it) => s + (Number(it.unitPrice) || 0) * (Number(it.quantity) || 1), 0)
      );
    }, 0);
  }, [deliveredOrdersInMonth]);

  const looseRevenue = useMemo(() => {
    return deliveredOrdersInMonth.reduce((sum, o) => {
      return (
        sum +
        o.items
          .filter((it) => !it.batchId || it.is_loose)
          .reduce((s, it) => s + (Number(it.unitPrice) || 0) * (Number(it.quantity) || 1), 0)
      );
    }, 0);
  }, [deliveredOrdersInMonth]);

  const batchedSharePercent =
    totalDeliveredRevenue > 0 ? Math.round((batchedRevenue / totalDeliveredRevenue) * 100) : 0;
  const looseSharePercent = totalDeliveredRevenue > 0 ? Math.round((looseRevenue / totalDeliveredRevenue) * 100) : 0;

  // Category breakdown in selected month
  const categoryBreakdown = useMemo(() => {
    const map = {};
    deliveredOrdersInMonth.forEach((o) => {
      o.items.forEach((it) => {
        const p = products.find((prod) => prod.id === it.productId);
        const catCode = p?.category || 'TS';
        const foundCat = customCategories.find((c) => c.code === catCode || c.name === catCode);
        const catName = foundCat
          ? foundCat.name
          : catCode === 'TS'
            ? 'Trang Sức'
            : catCode === 'QA'
              ? 'Quần Áo'
              : catCode;
        const rev = (Number(it.unitPrice) || 0) * (Number(it.quantity) || 1);
        if (!map[catName]) {
          map[catName] = { name: catName, revenue: 0, count: 0 };
        }
        map[catName].revenue += rev;
        map[catName].count += Number(it.quantity) || 1;
      });
    });
    return Object.values(map);
  }, [deliveredOrdersInMonth, products, customCategories]);

  const monthlyExpenses = useMemo(() => {
    return expenses.filter((e) => e.date && e.date.startsWith(selectedMonth));
  }, [expenses, selectedMonth]);

  const totalOperatingExpenses = useMemo(() => {
    return monthlyExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  }, [monthlyExpenses]);

  const grossProfit = totalDeliveredRevenue - totalCostOfGoodsSold;
  const netProfit = grossProfit - totalOperatingExpenses;
  const adminSplitShare = Math.round(netProfit / 2);

  const grossMarginRate = totalDeliveredRevenue > 0 ? Math.round((grossProfit / totalDeliveredRevenue) * 100) : 0;
  const netMarginRate = totalDeliveredRevenue > 0 ? Math.round((netProfit / totalDeliveredRevenue) * 100) : 0;

  // Multi-Month Data Series (Last 6 Months Comparison for Multi-Bar Chart)
  const monthlyChartSeries = useMemo(() => {
    const result = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mStr = d.toISOString().substring(0, 7);
      const label = `T${d.getMonth() + 1}/${d.getFullYear().toString().slice(-2)}`;

      const mOrders = orders.filter((o) => o.status === 'Đã giao' && o.createdDate && o.createdDate.startsWith(mStr));
      const mRevenue = mOrders.reduce((sum, o) => {
        return sum + o.items.reduce((s, it) => s + (Number(it.unitPrice) || 0) * (Number(it.quantity) || 1), 0);
      }, 0);
      const mCogs = mOrders.reduce((sum, o) => {
        return (
          sum +
          o.items.reduce((s, it) => {
            const p = products.find((prod) => prod.id === it.productId);
            const unitCost = it.unitCost !== undefined ? Number(it.unitCost) : p ? Number(p.costPrice) : 0;
            return s + unitCost * (Number(it.quantity) || 1);
          }, 0)
        );
      }, 0);
      const mExp = expenses
        .filter((e) => e.date && e.date.startsWith(mStr))
        .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
      const mNet = mRevenue - mCogs - mExp;

      result.push({
        monthStr: mStr,
        label,
        revenue: mRevenue,
        cogs: mCogs,
        expenses: mExp,
        netProfit: mNet
      });
    }
    return result;
  }, [orders, expenses, products]);

  // Max value in chart for relative height computation
  const maxChartVal = useMemo(() => {
    let m = 1000000;
    monthlyChartSeries.forEach((s) => {
      if (s.revenue > m) m = s.revenue;
      if (s.cogs > m) m = s.cogs;
      if (s.expenses > m) m = s.expenses;
      if (s.netProfit > m) m = s.netProfit;
    });
    return m;
  }, [monthlyChartSeries]);

  // Dedicated Loose Goods Metrics for Tab BATCHES
  const looseMetrics = useMemo(() => {
    const totalSoldUnits = looseProducts.reduce((sum, p) => sum + (Number(p.soldCount) || 0), 0);
    const totalStockUnits = looseProducts.reduce((sum, p) => sum + (Number(p.stock) || 0), 0);
    const revenueEarned = looseProducts.reduce(
      (sum, p) => sum + (Number(p.soldCount) || 0) * (Number(p.sellingPrice) || 0),
      0
    );
    const capitalRecovered = looseProducts.reduce(
      (sum, p) => sum + (Number(p.soldCount) || 0) * (Number(p.costPrice) || 0),
      0
    );
    const remainingStockVal = looseProducts.reduce(
      (sum, p) => sum + (Number(p.stock) || 0) * (Number(p.costPrice) || 0),
      0
    );
    const expectedRevenue = looseProducts.reduce(
      (sum, p) => sum + ((Number(p.stock) || 0) + (Number(p.soldCount) || 0)) * (Number(p.sellingPrice) || 0),
      0
    );
    const totalCostOfAll = looseProducts.reduce(
      (sum, p) => sum + ((Number(p.stock) || 0) + (Number(p.soldCount) || 0)) * (Number(p.costPrice) || 0),
      0
    );
    const expectedProfit = expectedRevenue - totalCostOfAll;
    const grossProfitVal = revenueEarned - capitalRecovered;
    const marginRate = revenueEarned > 0 ? Math.round((grossProfitVal / revenueEarned) * 100) : 0;

    return {
      count: looseProducts.length,
      totalSoldUnits,
      totalStockUnits,
      revenueEarned,
      capitalRecovered,
      remainingStockVal,
      expectedRevenue,
      expectedProfit,
      grossProfitVal,
      marginRate
    };
  }, [looseProducts]);

  return (
    <View style={styles.container}>
      {/* Header Banner */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.mainTitle}>Báo Cáo Tài Chính & Doanh Thu</Text>
          <Text style={styles.subtitle}>
            Phân tích đa chiều: Biểu đồ tăng trưởng, tỷ trọng Hàng Lô vs Hàng Lẻ & dòng tiền thực tế
          </Text>
        </View>

        <View style={styles.largeTabsRow}>
          <TouchableOpacity
            style={[styles.largeTabBtn, activeTab === 'PROFIT' && styles.largeTabBtnActive]}
            onPress={() => setActiveTab('PROFIT')}
          >
            <TrendingUp
              size={16}
              color={activeTab === 'PROFIT' ? '#ffffff' : COLORS.textMuted}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.largeTabText, activeTab === 'PROFIT' && styles.largeTabTextActive]}>
              Báo Cáo Lợi Nhuận
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.largeTabBtn, activeTab === 'EXPENSES' && styles.largeTabBtnActive]}
            onPress={() => setActiveTab('EXPENSES')}
          >
            <FileText
              size={16}
              color={activeTab === 'EXPENSES' ? '#ffffff' : COLORS.textMuted}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.largeTabText, activeTab === 'EXPENSES' && styles.largeTabTextActive]}>
              Sổ Chi Phí Vận Hành ({expenses.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.largeTabBtn, activeTab === 'BATCHES' && styles.largeTabBtnActive]}
            onPress={() => setActiveTab('BATCHES')}
          >
            <Package
              size={16}
              color={activeTab === 'BATCHES' ? '#ffffff' : COLORS.textMuted}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.largeTabText, activeTab === 'BATCHES' && styles.largeTabTextActive]}>
              Báo Cáo Lô & Hàng Lẻ
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={{ flex: 1, overflowY: 'auto' }} showsVerticalScrollIndicator={true}>
        {activeTab === 'PROFIT' && (
          <View style={{ gap: 20, paddingBottom: 30 }}>
            {/* 1. VISUAL INTERACTIVE 4-PILLAR MONTHLY BAR CHART */}
            <View style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <BarChart3 size={22} color={COLORS.primaryLight} />
                  <Text style={styles.chartTitle}>Biểu Đồ So Sánh Doanh Thu, Vốn & Lợi Nhuận 6 Tháng Gần Nhất</Text>
                </View>
                {hoveredMonthData && (
                  <View style={styles.chartHoverIndicator}>
                    <Text style={styles.chartHoverText}>
                      Tháng {hoveredMonthData.label}: Thu {formatCurrency(hoveredMonthData.revenue)} | Lời Ròng{' '}
                      {formatCurrency(hoveredMonthData.netProfit)}
                    </Text>
                  </View>
                )}
              </View>

              {/* Chart Legend */}
              <View style={styles.legendRow}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#3b82f6' }]} />
                  <Text style={styles.legendLabel}>1. Tổng Doanh Thu</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#f59e0b' }]} />
                  <Text style={styles.legendLabel}>2. Giá Vốn (COGS)</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#ef4444' }]} />
                  <Text style={styles.legendLabel}>3. Chi Phí Vận Hành</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#10b981' }]} />
                  <Text style={styles.legendLabel}>4. Lợi Nhuận Ròng</Text>
                </View>
              </View>

              {/* Bars Container */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'space-between',
                  height: '220px',
                  paddingTop: '20px',
                  borderBottom: '1px solid #334155',
                  gap: '8px'
                }}
              >
                {monthlyChartSeries.map((item) => {
                  const revHeight = Math.max(4, Math.round((item.revenue / maxChartVal) * 160));
                  const cogsHeight = Math.max(4, Math.round((item.cogs / maxChartVal) * 160));
                  const expHeight = Math.max(4, Math.round((item.expenses / maxChartVal) * 160));
                  const netHeight = Math.max(4, Math.round((Math.max(0, item.netProfit) / maxChartVal) * 160));
                  const isCurrent = item.monthStr === selectedMonth;

                  return (
                    <div
                      key={item.monthStr}
                      onMouseEnter={() => setHoveredMonthData(item)}
                      onMouseLeave={() => setHoveredMonthData(null)}
                      onClick={() => setSelectedMonth(item.monthStr)}
                      style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        height: '100%',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '8px',
                        backgroundColor: isCurrent ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
                        border: isCurrent ? '1.5px solid #3b82f6' : '1px solid transparent',
                        transition: 'all 0.2s ease'
                      }}
                      title={`Bấm để xem chi tiết tháng ${item.label}`}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'flex-end',
                          justifyContent: 'center',
                          gap: '4px',
                          width: '100%',
                          height: '170px'
                        }}
                      >
                        <div
                          style={{
                            width: '22%',
                            height: `${revHeight}px`,
                            backgroundColor: '#3b82f6',
                            borderRadius: '4px 4px 0 0',
                            transition: 'height 0.3s ease'
                          }}
                          title={`Doanh thu: ${formatCurrency(item.revenue)}`}
                        />
                        <div
                          style={{
                            width: '22%',
                            height: `${cogsHeight}px`,
                            backgroundColor: '#f59e0b',
                            borderRadius: '4px 4px 0 0',
                            transition: 'height 0.3s ease'
                          }}
                          title={`Giá vốn: ${formatCurrency(item.cogs)}`}
                        />
                        <div
                          style={{
                            width: '22%',
                            height: `${expHeight}px`,
                            backgroundColor: '#ef4444',
                            borderRadius: '4px 4px 0 0',
                            transition: 'height 0.3s ease'
                          }}
                          title={`Chi phí: ${formatCurrency(item.expenses)}`}
                        />
                        <div
                          style={{
                            width: '22%',
                            height: `${netHeight}px`,
                            backgroundColor: '#10b981',
                            borderRadius: '4px 4px 0 0',
                            transition: 'height 0.3s ease'
                          }}
                          title={`Lợi nhuận: ${formatCurrency(item.netProfit)}`}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: isCurrent ? '800' : '600',
                          color: isCurrent ? '#60a5fa' : COLORS.textMuted,
                          marginTop: '6px'
                        }}
                      >
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}
              >
                <span style={{ ...TYPOGRAPHY.caption2, color: COLORS.textMuted }}>
                  * Gợi ý: Bấm vào từng cột tháng trên biểu đồ để xem bảng chi tiết lợi nhuận tương ứng bên dưới.
                </span>
                <span style={{ ...TYPOGRAPHY.caption2, color: COLORS.primaryLight, fontWeight: '700' }}>
                  Đang xem: Tháng {selectedMonth}
                </span>
              </div>
            </View>

            {/* 2. REVENUE DISTRIBUTION: BATCHED VS LOOSE GOODS & CATEGORIES */}
            <View style={styles.distributionCard}>
              <View style={styles.capitalHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <PieChart size={22} color={COLORS.accent} />
                  <Text style={styles.expectedTitle}>Cơ Cấu Nguồn Thu Tháng {selectedMonth}: Hàng Lô vs Hàng Lẻ</Text>
                </View>
                <Text style={styles.expectedSubNote}>[ Tổng thu: {formatCurrency(totalDeliveredRevenue)} ]</Text>
              </View>

              {/* Progress Proportion Bar */}
              <View style={styles.ratioBarOuter}>
                <div
                  style={{
                    height: '24px',
                    width: '100%',
                    display: 'flex',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155'
                  }}
                >
                  <div
                    style={{
                      width: `${batchedSharePercent}%`,
                      backgroundColor: '#6366f1',
                      transition: 'width 0.4s ease'
                    }}
                    title={`Hàng theo lô: ${batchedSharePercent}% (${formatCurrency(batchedRevenue)})`}
                  />
                  <div
                    style={{
                      width: `${looseSharePercent}%`,
                      backgroundColor: '#f59e0b',
                      transition: 'width 0.4s ease'
                    }}
                    title={`Hàng lẻ: ${looseSharePercent}% (${formatCurrency(looseRevenue)})`}
                  />
                </div>

                <View style={styles.ratioStatsRow}>
                  <View style={styles.ratioStatItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#6366f1' }]} />
                    <Text style={styles.ratioStatLabel}>Hàng Nhập Theo Lô:</Text>
                    <Text style={styles.ratioStatVal}>
                      {formatCurrency(batchedRevenue)} ({batchedSharePercent}%)
                    </Text>
                  </View>

                  <View style={styles.ratioStatItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#f59e0b' }]} />
                    <Text style={styles.ratioStatLabel}>Hàng Lẻ (Không theo lô):</Text>
                    <Text style={[styles.ratioStatVal, { color: COLORS.warning }]}>
                      {formatCurrency(looseRevenue)} ({looseSharePercent}%)
                    </Text>
                  </View>
                </View>
              </View>

              {/* Category Breakdown Tiles */}
              {categoryBreakdown.length > 0 && (
                <View style={styles.categoryBreakdownSection}>
                  <Text style={styles.catBreakdownHeading}>Phân bổ doanh thu theo danh mục mặt hàng:</Text>
                  <View style={styles.categoryGrid}>
                    {categoryBreakdown.map((c) => {
                      const share =
                        totalDeliveredRevenue > 0 ? Math.round((c.revenue / totalDeliveredRevenue) * 100) : 0;
                      return (
                        <View key={c.name} style={styles.categoryTile}>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={styles.categoryTileName}>{c.name}</Text>
                            <Text style={styles.categoryTileShare}>{share}%</Text>
                          </View>
                          <Text style={styles.categoryTileRev}>{formatCurrency(c.revenue)}</Text>
                          <Text style={styles.categoryTileCount}>{c.count} món đã giao</Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              )}
            </View>

            {/* 3. MONTHLY PROFIT SUMMARY & METRICS */}
            <View style={styles.monthSelectorCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Calendar size={22} color={COLORS.primaryLight} />
                <Text style={styles.monthSelectorLabel}>Chọn Tháng Báo Cáo Lợi Nhuận Thực Tế (Đơn Đã Giao):</Text>
              </View>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                style={{
                  backgroundColor: COLORS.bgDark,
                  border: '1.5px solid #334155',
                  color: COLORS.textMain,
                  padding: '10px 16px',
                  borderRadius: '10px',
                  ...TYPOGRAPHY.callout,
                  fontWeight: '700',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              />
            </View>

            <View style={styles.metricsGrid}>
              <View style={styles.largeMetricCard}>
                <Text style={styles.metricLabel}>1. Tổng Thu (Đơn Đã Giao)</Text>
                <Text style={styles.metricValRevenue}>{formatCurrency(totalDeliveredRevenue)}</Text>
                <Text style={styles.metricSub}>Từ {deliveredOrdersInMonth.length} đơn hàng đã hoàn tất</Text>
              </View>

              <View style={styles.largeMetricCard}>
                <Text style={styles.metricLabel}>2. Vốn Hàng Đã Bán (COGS)</Text>
                <Text style={styles.metricValCost}>- {formatCurrency(totalCostOfGoodsSold)}</Text>
                <Text style={styles.metricSub}>Tiền gốc sản phẩm trong đơn đã giao</Text>
              </View>

              <View style={styles.largeMetricCard}>
                <Text style={styles.metricLabel}>3. Chi Phí Vận Hành</Text>
                <Text style={styles.metricValExp}>- {formatCurrency(totalOperatingExpenses)}</Text>
                <Text style={styles.metricSub}>{monthlyExpenses.length} khoản chi (bao bì, in ấn, ads...)</Text>
              </View>
            </View>

            {/* Net Profit & Profit Sharing */}
            <View style={styles.netProfitCard}>
              <View style={styles.netProfitHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <PieChart size={28} color={COLORS.success} />
                  <Text style={styles.netProfitTitle}>LỢI NHUẬN RÒNG THÁNG {selectedMonth}</Text>
                </View>
                <View style={styles.marginPillsRow}>
                  <View style={styles.marginPill}>
                    <Text style={styles.marginPillLabel}>Biên Lợi Nhuận Gộp:</Text>
                    <Text style={styles.marginPillVal}>{grossMarginRate}%</Text>
                  </View>
                  <View style={[styles.marginPill, { borderColor: COLORS.success }]}>
                    <Text style={styles.marginPillLabel}>Biên Lợi Nhuận Ròng:</Text>
                    <Text style={[styles.marginPillVal, { color: COLORS.success }]}>{netMarginRate}%</Text>
                  </View>
                </View>
              </View>

              <Text style={styles.netProfitAmount}>{formatCurrency(netProfit)}</Text>

              <View style={styles.adminSplitBox}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <Users size={22} color={COLORS.primaryLight} />
                  <Text style={styles.adminSplitTitle}>CHIA TIỀN LỢI NHUẬN GIỮA 2 QUẢN LÝ (50 / 50):</Text>
                </View>

                <View style={styles.splitRow}>
                  <View style={styles.adminCol}>
                    <Text style={styles.adminName}>Admin 1 (Quản lý 1):</Text>
                    <Text style={styles.adminAmount}>{formatCurrency(adminSplitShare)}</Text>
                  </View>

                  <View style={styles.adminDivider} />

                  <View style={styles.adminCol}>
                    <Text style={styles.adminName}>Admin 2 (Quản lý 2):</Text>
                    <Text style={styles.adminAmount}>{formatCurrency(adminSplitShare)}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* 4. CAPITAL BALANCE & ACTUAL CASH REMAINING */}
            <View style={styles.capitalOverviewCard}>
              <View style={styles.capitalHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <DollarSign size={22} color={COLORS.primaryLight} />
                  <Text style={styles.capitalTitle}>Bảng Cân Đối Nguồn Vốn & Tiền Mặt Thực Tế</Text>
                </View>
                <Text style={styles.capitalSubNote}>
                  [ Tiền thực tế còn lại = Nguồn vốn đang có - Tổng tiền nhập từ các lô ]
                </Text>
              </View>

              <View style={styles.capitalGrid}>
                <View style={styles.capitalCardInputBox}>
                  <Text style={styles.capitalCardLabel}>Nguồn Vốn Đang Có (Nhập VNĐ) *:</Text>
                  <TextInput
                    style={styles.capitalInput}
                    keyboardType="numeric"
                    placeholder="Nhập số vốn (Ví dụ: 100.000.000)..."
                    placeholderTextColor={COLORS.textMuted}
                    value={capitalInputStr}
                    onChangeText={handleCapitalChange}
                    onBlur={() => {
                      const parsed = parseCurrencyInput(capitalInputStr);
                      setCapitalInputStr(parsed ? formatCurrencyInput(parsed) : '');
                    }}
                  />
                  <Text style={styles.capitalInputSub}>Số vốn ban đầu / vốn đầu tư sẵn có</Text>
                </View>

                <View style={styles.capitalStatCard}>
                  <Text style={styles.capitalCardLabel}>Tổng Vốn Đã Nhập Hàng (Tất Cả Các Lô):</Text>
                  <Text style={styles.capitalValInvested}>- {formatCurrency(totalCapitalInvestedAllBatches)}</Text>
                  <Text style={styles.capitalInputSub}>Tổng {batches.length} đợt lô hàng đã nhập kho</Text>
                </View>

                <View
                  style={[
                    styles.capitalStatCard,
                    { borderColor: actualCashRemaining >= 0 ? COLORS.success : COLORS.danger }
                  ]}
                >
                  <Text style={styles.capitalCardLabel}>Tổng Tiền Thực Tế Còn Lại (Tiền Mặt/Ví):</Text>
                  <Text
                    style={[
                      styles.capitalValCash,
                      { color: actualCashRemaining >= 0 ? COLORS.success : COLORS.danger }
                    ]}
                  >
                    {formatCurrency(actualCashRemaining)}
                  </Text>
                  <Text style={styles.capitalInputSub}>
                    {actualCashRemaining >= 0 ? 'Dòng tiền khả dụng an toàn' : 'Cảnh báo: Nhập quá nguồn vốn!'}
                  </Text>
                </View>
              </View>
            </View>

            {/* 5. EXPECTED REVENUE & PROFIT FROM PRODUCTS */}
            <View style={styles.expectedRevenueCard}>
              <View style={styles.capitalHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <TrendingUp size={22} color={COLORS.accent} />
                  <Text style={styles.expectedTitle}>Tổng Thu & Lợi Nhuận Dự Kiến (Kho Sản Phẩm Tồn)</Text>
                </View>
                <Text style={styles.expectedSubNote}>
                  [ Tự động tổng hợp từ {products.length} sản phẩm ({totalProductsInInventory} tồn) với % lời đã cài ]
                </Text>
              </View>

              <View style={styles.metricsGrid}>
                <View style={styles.largeMetricCard}>
                  <Text style={styles.metricLabel}>1. Tổng Doanh Thu Dự Kiến (Kho Hàng)</Text>
                  <Text style={styles.metricValRevenue}>{formatCurrency(expectedInventoryRevenue)}</Text>
                  <Text style={styles.metricSub}>
                    Giá trị bán khi giải phóng hết {totalProductsInInventory} sp trong kho
                  </Text>
                </View>

                <View style={styles.largeMetricCard}>
                  <Text style={styles.metricLabel}>2. Giá Trị Vốn Hàng Tồn Kho</Text>
                  <Text style={styles.metricValCost}>{formatCurrency(expectedInventoryCost)}</Text>
                  <Text style={styles.metricSub}>Giá gốc hiện tại của tất cả sp đang tồn kho</Text>
                </View>

                <View style={styles.largeMetricCard}>
                  <Text style={styles.metricLabel}>3. Tổng Lợi Nhuận Dự Kiến (Kho Hàng)</Text>
                  <Text style={{ ...TYPOGRAPHY.title2, fontWeight: '900', color: COLORS.success, marginTop: 4 }}>
                    + {formatCurrency(expectedInventoryProfit)}
                  </Text>
                  <Text style={styles.metricSub}>Lợi nhuận gộp dự kiến khi bán hết kho sản phẩm</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'EXPENSES' && (
          <View style={{ gap: 18 }}>
            <View style={styles.expenseToolbar}>
              <Text style={styles.sectionHeading}>Sổ Chi Phí Vận Hành (In ấn, Ads, Băng keo, Sticker...)</Text>

              <TouchableOpacity style={styles.bigAddExpBtn} onPress={startAddExpense}>
                <Plus size={20} color="#ffffff" style={{ marginRight: 8 }} />
                <Text style={styles.bigAddExpBtnText}>Ghi Khoản Chi Mới</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.tableCard}>
              <View style={styles.trHeader}>
                <Text style={[styles.th, { width: 140 }]}>Ngày Chi</Text>
                <Text style={[styles.th, { width: 160 }]}>Số Tiền</Text>
                <Text style={[styles.th, { width: 180 }]}>Danh Mục</Text>
                <Text style={[styles.th, { width: 340 }]}>Lý Do Chi Chi Tiết</Text>
                <Text style={[styles.th, { width: 130, textAlign: 'center' }]}>Thao Tác</Text>
              </View>

              {expenses.length === 0 ? (
                <View style={styles.emptyBox}>
                  <Text style={{ color: COLORS.textMuted, ...TYPOGRAPHY.callout }}>
                    Chưa có khoản chi vận hành nào được ghi nhận
                  </Text>
                </View>
              ) : (
                expenses.map((exp, idx) => (
                  <View key={exp.id} style={[styles.tr, idx % 2 === 1 && styles.trEven]}>
                    <Text style={[styles.tdText, { width: 140 }]}>{exp.date}</Text>
                    <Text style={[styles.tdAmount, { width: 160 }]}>{formatCurrency(exp.amount)}</Text>
                    <View style={[styles.td, { width: 180 }]}>
                      <View style={styles.catBadge}>
                        <Text style={styles.catBadgeText}>{exp.category || 'Chi phí khác'}</Text>
                      </View>
                    </View>
                    <Text style={[styles.tdText, { width: 340 }]} numberOfLines={2}>
                      {exp.reason}
                    </Text>

                    <View style={[styles.td, { width: 130, flexDirection: 'row', justifyContent: 'center', gap: 8 }]}>
                      <TouchableOpacity style={styles.bigEditBtn} onPress={() => startEditExpense(exp)}>
                        <Edit2 size={16} color={COLORS.primaryLight} style={{ marginRight: 4 }} />
                        <Text style={{ color: COLORS.primaryLight, fontWeight: '700', ...TYPOGRAPHY.footnote }}>
                          Sửa
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity style={styles.bigDeleteBtn} onPress={() => handleDeleteExpense(exp)}>
                        <Trash2 size={16} color={COLORS.danger} style={{ marginRight: 4 }} />
                        <Text style={{ color: COLORS.danger, fontWeight: '700', ...TYPOGRAPHY.footnote }}>Xóa</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>
          </View>
        )}

        {activeTab === 'BATCHES' && (
          <View style={{ gap: 18, paddingBottom: 30 }}>
            {/* DEDICATED LOOSE GOODS FINANCIAL SUMMARY CARD */}
            <View style={styles.looseGoodsHighlightCard}>
              <View style={styles.batchReportHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      padding: '8px',
                      backgroundColor: 'rgba(245, 158, 11, 0.15)',
                      borderRadius: '8px',
                      border: '1px solid rgba(245, 158, 11, 0.3)'
                    }}
                  >
                    <Boxes size={22} color={COLORS.warning} />
                  </div>
                  <View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={[styles.batchReportTitle, { color: COLORS.warning }]}>
                        [LẺ] Hàng Lẻ (Không Theo Lô)
                      </Text>
                      <View style={styles.looseBadgePill}>
                        <Text style={styles.looseBadgePillText}>{looseMetrics.count} loại sản phẩm</Text>
                      </View>
                    </View>
                    <Text style={styles.batchReportDate}>
                      Tổng hợp toàn bộ các mặt hàng bán lẻ nhập trực tiếp ngoài lô dự án
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.batchStatsGrid}>
                <View style={styles.batchStatBox}>
                  <Text style={styles.bLabel}>Số lượng tồn kho lẻ</Text>
                  <Text style={[styles.bVal, { color: COLORS.warning }]}>{looseMetrics.totalStockUnits} món</Text>
                </View>

                <View style={styles.batchStatBox}>
                  <Text style={styles.bLabel}>Đã bán ra</Text>
                  <Text style={styles.bValSold}>{looseMetrics.totalSoldUnits} món</Text>
                </View>

                <View style={styles.batchStatBox}>
                  <Text style={styles.bLabel}>Vốn giá gốc đã thu hồi</Text>
                  <Text style={styles.bValCost}>{formatCurrency(looseMetrics.capitalRecovered)}</Text>
                </View>

                <View style={styles.batchStatBox}>
                  <Text style={styles.bLabel}>Doanh thu lẻ đã thu</Text>
                  <Text style={styles.bValRev}>{formatCurrency(looseMetrics.revenueEarned)}</Text>
                </View>

                <View style={styles.batchStatBox}>
                  <Text style={styles.bLabel}>Giá trị vốn tồn kho lẻ</Text>
                  <Text style={{ color: COLORS.primaryLight, ...TYPOGRAPHY.callout, fontWeight: '800' }}>
                    {formatCurrency(looseMetrics.remainingStockVal)}
                  </Text>
                </View>

                <View style={styles.batchStatBox}>
                  <Text style={styles.bLabel}>Lợi nhuận dự kiến lẻ</Text>
                  <Text
                    style={{
                      color: looseMetrics.expectedProfit >= 0 ? COLORS.success : COLORS.danger,
                      ...TYPOGRAPHY.callout,
                      fontWeight: '800'
                    }}
                  >
                    {looseMetrics.expectedProfit >= 0 ? '+' : ''}
                    {formatCurrency(looseMetrics.expectedProfit)}
                  </Text>
                </View>
              </View>
            </View>

            <Text style={styles.sectionHeading}>
              Thống Kê Thu Hồi Vốn & Lợi Nhuận Theo Từng Lô Hàng ({batches.length} Lô):
            </Text>

            {batches.map((b) => {
              const batchProducts = products.filter((p) => p.batchId === b.id);
              const totalCostInvested = Number(b.totalCapital) || 0;

              const totalItemsSold = batchProducts.reduce((sum, p) => sum + (Number(p.soldCount) || 0), 0);
              const totalRevenueFromBatch = batchProducts.reduce(
                (sum, p) => sum + (Number(p.soldCount) || 0) * (Number(p.sellingPrice) || 0),
                0
              );
              const capitalRecovered = batchProducts.reduce(
                (sum, p) => sum + (Number(p.soldCount) || 0) * (Number(p.costPrice) || 0),
                0
              );

              const expectedBatchRevenue = batchProducts.reduce(
                (sum, p) => sum + ((Number(p.stock) || 0) + (Number(p.soldCount) || 0)) * (Number(p.sellingPrice) || 0),
                0
              );
              const expectedBatchProfit = expectedBatchRevenue - totalCostInvested;

              const percentCapitalRecovered =
                totalCostInvested > 0 ? Math.min(100, Math.round((capitalRecovered / totalCostInvested) * 100)) : 0;

              return (
                <View key={b.id} style={styles.batchReportCard}>
                  <View style={styles.batchReportHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <Package size={24} color={COLORS.accent} />
                      <Text style={styles.batchReportTitle}>
                        {b.code} - {b.name}
                      </Text>
                    </View>
                    <Text style={styles.batchReportDate}>Nhập ngày: {b.importDate}</Text>
                  </View>

                  <View style={styles.batchStatsGrid}>
                    <View style={styles.batchStatBox}>
                      <Text style={styles.bLabel}>Tổng vốn lô</Text>
                      <Text style={styles.bVal}>{formatCurrency(totalCostInvested)}</Text>
                    </View>

                    <View style={styles.batchStatBox}>
                      <Text style={styles.bLabel}>Đã bán ra</Text>
                      <Text style={styles.bValSold}>{totalItemsSold} sp</Text>
                    </View>

                    <View style={styles.batchStatBox}>
                      <Text style={styles.bLabel}>Vốn đã thu hồi</Text>
                      <Text style={styles.bValCost}>
                        {formatCurrency(capitalRecovered)} ({percentCapitalRecovered}%)
                      </Text>
                    </View>

                    <View style={styles.batchStatBox}>
                      <Text style={styles.bLabel}>Doanh thu đã thu về</Text>
                      <Text style={styles.bValRev}>{formatCurrency(totalRevenueFromBatch)}</Text>
                    </View>

                    <View style={styles.batchStatBox}>
                      <Text style={styles.bLabel}>Tổng thu dự kiến (bán hết)</Text>
                      <Text style={{ color: COLORS.accent, ...TYPOGRAPHY.callout, fontWeight: '800' }}>
                        {formatCurrency(expectedBatchRevenue)}
                      </Text>
                    </View>

                    <View style={styles.batchStatBox}>
                      <Text style={styles.bLabel}>Lợi nhuận dự kiến lô</Text>
                      <Text
                        style={{
                          color: expectedBatchProfit >= 0 ? COLORS.success : COLORS.danger,
                          ...TYPOGRAPHY.callout,
                          fontWeight: '800'
                        }}
                      >
                        {expectedBatchProfit >= 0 ? '+' : ''}
                        {formatCurrency(expectedBatchProfit)}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Expense Modal */}
      {isExpenseModalOpen && (
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              {editingExpenseId === 'NEW' ? 'Ghi Khoản Chi Vận Hành Mới' : 'Chỉnh Sửa Khoản Chi'}
            </Text>

            <Text style={styles.inputLabel}>Ngày chi (Bảng chọn datepicker):</Text>
            <TextInput type="date" style={styles.largeInput} value={expDate} onChangeText={setExpDate} />

            <Text style={styles.inputLabel}>Danh mục chi phí:</Text>
            <select value={expCategory} onChange={(e) => setExpCategory(e.target.value)} style={styles.selectStyle}>
              <option value="Bao bì & In ấn">Bao bì & In ấn (Hộp, Túi, Sticker...)</option>
              <option value="Băng keo & Đóng gói">Băng keo & Vật tư đóng gói</option>
              <option value="Quảng cáo & Marketing">Quảng cáo Facebook / TikTok Ads</option>
              <option value="Vận chuyển & Phụ phí">Phí vận chuyển nhập hàng</option>
              <option value="Chi phí khác">Chi phí khác</option>
            </select>

            <Text style={styles.inputLabel}>Số tiền chi (VNĐ) *:</Text>
            <TextInput
              style={[styles.largeInput, { color: COLORS.danger, fontWeight: '800' }]}
              keyboardType="numeric"
              placeholder="100.000 VNĐ"
              placeholderTextColor={COLORS.textMuted}
              value={formatCurrencyInput(expAmount)}
              onChangeText={(val) => setExpAmount(parseCurrencyInput(val))}
            />

            <Text style={styles.inputLabel}>Lý do chi chi tiết *:</Text>
            <TextInput
              style={styles.largeInput}
              placeholder="Ví dụ: In 1000 túi niêm phong logo Thành Store..."
              placeholderTextColor={COLORS.textMuted}
              value={expReason}
              onChangeText={setExpReason}
            />

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setIsExpenseModalOpen(false)}>
                <Text style={styles.modalCancelText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalSaveBtn} onPress={handleSaveExpense}>
                <Check size={18} color="#ffffff" style={{ marginRight: 6 }} />
                <Text style={styles.modalSaveText}>Lưu Khoản Chi</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
    backgroundColor: COLORS.bgDark,
    maxWidth: '100%',
    boxSizing: 'border-box',
    overflowY: 'auto',
    maxHeight: '100vh'
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.cardDark,
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 14
  },
  mainTitle: {
    ...TYPOGRAPHY.title2,
    fontWeight: '900',
    color: COLORS.textMain
  },
  subtitle: {
    ...TYPOGRAPHY.footnote,
    color: COLORS.textMuted,
    marginTop: 4
  },
  largeTabsRow: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: COLORS.bgDark,
    padding: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder
  },
  largeTabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: 'transparent'
  },
  largeTabBtnActive: {
    backgroundColor: COLORS.primary
  },
  largeTabText: {
    ...TYPOGRAPHY.subhead,
    fontWeight: '700',
    color: COLORS.textMuted
  },
  largeTabTextActive: {
    color: '#ffffff'
  },

  /* Multi-Bar Chart Styles */
  chartCard: {
    backgroundColor: COLORS.cardDark,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.cardBorder,
    padding: 18,
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
    paddingBottom: 12,
    marginBottom: 12,
    flexWrap: 'wrap',
    gap: 8
  },
  chartTitle: {
    ...TYPOGRAPHY.callout,
    fontWeight: '900',
    color: COLORS.textMain
  },
  chartHoverIndicator: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8
  },
  chartHoverText: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.primaryLight,
    fontWeight: '700'
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 10,
    flexWrap: 'wrap'
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 3
  },
  legendLabel: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.textMuted,
    fontWeight: '600'
  },

  /* Revenue Distribution Card Styles */
  distributionCard: {
    backgroundColor: COLORS.cardDark,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.accent,
    padding: 18
  },
  ratioBarOuter: {
    gap: 10,
    marginTop: 6
  },
  ratioStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
    paddingTop: 4
  },
  ratioStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  ratioStatLabel: {
    ...TYPOGRAPHY.footnote,
    fontWeight: '700',
    color: COLORS.textMuted
  },
  ratioStatVal: {
    ...TYPOGRAPHY.footnote,
    fontWeight: '800',
    color: COLORS.primaryLight
  },
  categoryBreakdownSection: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder
  },
  catBreakdownHeading: {
    ...TYPOGRAPHY.caption1,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10
  },
  categoryGrid: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap'
  },
  categoryTile: {
    flex: 1,
    minWidth: 150,
    backgroundColor: COLORS.bgDark,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.cardBorder
  },
  categoryTileName: {
    ...TYPOGRAPHY.caption1,
    fontWeight: '700',
    color: COLORS.textMuted
  },
  categoryTileShare: {
    ...TYPOGRAPHY.caption2,
    fontWeight: '800',
    color: COLORS.accent
  },
  categoryTileRev: {
    ...TYPOGRAPHY.subhead,
    fontWeight: '900',
    color: COLORS.textMain,
    marginTop: 4
  },
  categoryTileCount: {
    ...TYPOGRAPHY.caption2,
    color: COLORS.textMuted,
    marginTop: 2
  },

  /* Loose Goods Highlight Card Styles */
  looseGoodsHighlightCard: {
    backgroundColor: 'rgba(245, 158, 11, 0.06)',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    padding: 18,
    boxShadow: '0 4px 16px rgba(245, 158, 11, 0.08)'
  },
  looseBadgePill: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)'
  },
  looseBadgePillText: {
    ...TYPOGRAPHY.caption2,
    fontWeight: '800',
    color: COLORS.warning
  },

  /* Capital Overview Card Styles */
  capitalOverviewCard: {
    backgroundColor: COLORS.cardDark,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.primaryLight,
    padding: 18,
    marginBottom: 8
  },
  capitalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
    paddingBottom: 12,
    marginBottom: 14,
    flexWrap: 'wrap',
    gap: 8
  },
  capitalTitle: {
    ...TYPOGRAPHY.callout,
    fontWeight: '900',
    color: COLORS.textMain
  },
  capitalSubNote: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.textMuted,
    fontStyle: 'italic'
  },
  capitalGrid: {
    flexDirection: 'row',
    gap: 14,
    flexWrap: 'wrap'
  },
  capitalCardInputBox: {
    flex: 1,
    minWidth: 240,
    backgroundColor: COLORS.sidebarBg,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.primary
  },
  capitalStatCard: {
    flex: 1,
    minWidth: 240,
    backgroundColor: COLORS.sidebarBg,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.cardBorder
  },
  capitalCardLabel: {
    ...TYPOGRAPHY.caption1,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 6
  },
  capitalInput: {
    backgroundColor: COLORS.bgDark,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: COLORS.primaryLight,
    ...TYPOGRAPHY.headline,
    fontWeight: '900'
  },
  capitalInputSub: {
    ...TYPOGRAPHY.caption2,
    color: COLORS.textMuted,
    marginTop: 6
  },
  capitalValInvested: {
    ...TYPOGRAPHY.title3,
    fontWeight: '900',
    color: COLORS.danger
  },
  capitalValCash: {
    ...TYPOGRAPHY.title3,
    fontWeight: '900'
  },

  /* Expected Revenue Card Styles */
  expectedRevenueCard: {
    backgroundColor: COLORS.cardDark,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.accent,
    padding: 18,
    marginBottom: 8
  },
  expectedTitle: {
    ...TYPOGRAPHY.callout,
    fontWeight: '900',
    color: COLORS.accent
  },
  expectedSubNote: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.textMuted,
    fontStyle: 'italic'
  },

  monthSelectorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.cardDark,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    flexWrap: 'wrap',
    gap: 12
  },
  monthSelectorLabel: {
    ...TYPOGRAPHY.subhead,
    fontWeight: '800',
    color: COLORS.textMain
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 14,
    flexWrap: 'wrap'
  },
  largeMetricCard: {
    flex: 1,
    minWidth: 220,
    backgroundColor: COLORS.cardDark,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder
  },
  metricLabel: {
    ...TYPOGRAPHY.footnote,
    fontWeight: '700',
    color: COLORS.textMuted
  },
  metricValRevenue: {
    ...TYPOGRAPHY.title2,
    fontWeight: '900',
    color: COLORS.primaryLight,
    marginTop: 4
  },
  metricValCost: {
    ...TYPOGRAPHY.title2,
    fontWeight: '900',
    color: COLORS.danger,
    marginTop: 4
  },
  metricValExp: {
    ...TYPOGRAPHY.title2,
    fontWeight: '900',
    color: COLORS.statusPending,
    marginTop: 4
  },
  metricSub: {
    ...TYPOGRAPHY.caption2,
    color: COLORS.textMuted,
    marginTop: 6
  },
  netProfitCard: {
    backgroundColor: COLORS.cardDark,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.success,
    padding: 20
  },
  netProfitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    flexWrap: 'wrap',
    gap: 10
  },
  netProfitTitle: {
    ...TYPOGRAPHY.headline,
    fontWeight: '900',
    color: COLORS.success
  },
  marginPillsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap'
  },
  marginPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.bgDark,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.cardBorder
  },
  marginPillLabel: {
    ...TYPOGRAPHY.caption2,
    color: COLORS.textMuted,
    fontWeight: '600'
  },
  marginPillVal: {
    ...TYPOGRAPHY.caption1,
    fontWeight: '800',
    color: COLORS.primaryLight
  },
  netProfitAmount: {
    ...TYPOGRAPHY.body,
    fontWeight: '900',
    color: COLORS.success,
    marginBottom: 16
  },
  adminSplitBox: {
    backgroundColor: COLORS.bgDark,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder
  },
  adminSplitTitle: {
    ...TYPOGRAPHY.footnote,
    fontWeight: '800',
    color: COLORS.primaryLight
  },
  splitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14
  },
  adminCol: {
    flex: 1
  },
  adminName: {
    ...TYPOGRAPHY.footnote,
    fontWeight: '700',
    color: COLORS.textMuted
  },
  adminAmount: {
    ...TYPOGRAPHY.title3,
    fontWeight: '900',
    color: COLORS.textMain,
    marginTop: 2
  },
  adminDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.cardBorder
  },
  expenseToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12
  },
  sectionHeading: {
    ...TYPOGRAPHY.callout,
    fontWeight: '800',
    color: COLORS.textMain
  },
  bigAddExpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10
  },
  bigAddExpBtnText: {
    color: '#ffffff',
    fontWeight: '800',
    ...TYPOGRAPHY.subhead
  },
  tableCard: {
    backgroundColor: COLORS.cardDark,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    overflow: 'hidden'
  },
  trHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.sidebarBg,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.cardBorder,
    alignItems: 'center'
  },
  th: {
    color: COLORS.textMuted,
    ...TYPOGRAPHY.caption1,
    fontWeight: '800',
    textTransform: 'uppercase',
    paddingHorizontal: 4,
    overflow: 'hidden'
  },
  tr: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardDark
  },
  trEven: {
    backgroundColor: 'transparent'
  },
  tdText: {
    color: COLORS.textMain,
    ...TYPOGRAPHY.subhead
  },
  tdAmount: {
    color: COLORS.danger,
    ...TYPOGRAPHY.subhead,
    fontWeight: '800'
  },
  td: {
    justifyContent: 'center',
    paddingHorizontal: 4,
    overflow: 'hidden'
  },
  catBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start'
  },
  catBadgeText: {
    color: COLORS.primaryLight,
    ...TYPOGRAPHY.caption1,
    fontWeight: '700'
  },
  bigEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(59, 130, 246, 0.12)'
  },
  bigDeleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.12)'
  },
  emptyBox: {
    padding: 30,
    alignItems: 'center'
  },
  batchReportCard: {
    backgroundColor: COLORS.cardDark,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 16
  },
  batchReportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
    paddingBottom: 10,
    marginBottom: 12
  },
  batchReportTitle: {
    ...TYPOGRAPHY.callout,
    fontWeight: '800',
    color: COLORS.textMain
  },
  batchReportDate: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.textMuted
  },
  batchStatsGrid: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap'
  },
  batchStatBox: {
    flex: 1,
    minWidth: 150,
    backgroundColor: COLORS.bgDark,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.cardBorder
  },
  bLabel: {
    ...TYPOGRAPHY.caption2,
    color: COLORS.textMuted,
    marginBottom: 4
  },
  bVal: {
    ...TYPOGRAPHY.callout,
    fontWeight: '800',
    color: COLORS.textMain
  },
  bValSold: {
    ...TYPOGRAPHY.callout,
    fontWeight: '800',
    color: COLORS.primaryLight
  },
  bValCost: {
    ...TYPOGRAPHY.callout,
    fontWeight: '800',
    color: COLORS.success
  },
  bValRev: {
    ...TYPOGRAPHY.callout,
    fontWeight: '800',
    color: COLORS.accent
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999
  },
  modalBox: {
    width: 480,
    maxWidth: '90%',
    backgroundColor: COLORS.cardDark,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.cardBorder,
    padding: 20
  },
  modalTitle: {
    ...TYPOGRAPHY.headline,
    fontWeight: '900',
    color: COLORS.textMain,
    marginBottom: 16
  },
  inputLabel: {
    ...TYPOGRAPHY.footnote,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginTop: 10,
    marginBottom: 6
  },
  largeInput: {
    backgroundColor: COLORS.bgDark,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: COLORS.textMain,
    ...TYPOGRAPHY.subhead,
    outlineStyle: 'none'
  },
  selectStyle: {
    backgroundColor: COLORS.bgDark,
    border: '1px solid #334155',
    color: COLORS.textMain,
    padding: '10px 12px',
    borderRadius: '8px',
    ...TYPOGRAPHY.subhead,
    outline: 'none',
    width: '100%'
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 20
  },
  modalCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceHover
  },
  modalCancelText: {
    color: COLORS.textMuted,
    fontWeight: '700',
    ...TYPOGRAPHY.subhead
  },
  modalSaveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: COLORS.primary
  },
  modalSaveText: {
    color: '#ffffff',
    fontWeight: '800',
    ...TYPOGRAPHY.subhead
  }
});
