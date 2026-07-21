import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from '../common/RNBridge';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../theme/colors';
import { DollarSign, FileText, PieChart, Plus, Edit2, Trash2, Calendar, TrendingUp, Package, Users, ShieldAlert, Check } from 'lucide-react';
import { formatCurrencyInput, parseCurrencyInput } from '../../utils/formatters';

export const FinanceModule = () => {
  const { 
    expenses, 
    orders, 
    products, 
    batches, 
    availableCapital, 
    setAvailableCapital, 
    addExpense, 
    updateExpense, 
    deleteExpense 
  } = useData();

  const { requireAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState('PROFIT');

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [expDate, setExpDate] = useState('');
  const [expAmount, setExpAmount] = useState(100000);
  const [expReason, setExpReason] = useState('');
  const [expCategory, setExpCategory] = useState('Bao bì & In ấn');

  const currentMonthStr = new Date().toISOString().substring(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);

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
        amount: Number(expAmount) || 0,
        reason: expReason,
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

  // Capital Balance & Real Cash Calculations
  const totalCapitalInvestedAllBatches = batches.reduce((sum, b) => sum + (Number(b.totalCapital) || 0), 0);
  const actualCashRemaining = Number(availableCapital || 0) - totalCapitalInvestedAllBatches;

  // Expected Inventory Revenue & Profit Calculations
  const expectedInventoryRevenue = products.reduce((sum, p) => sum + (Number(p.sellingPrice) || 0) * (Number(p.stock) || 0), 0);
  const expectedInventoryCost = products.reduce((sum, p) => sum + (Number(p.costPrice) || 0) * (Number(p.stock) || 0), 0);
  const expectedInventoryProfit = expectedInventoryRevenue - expectedInventoryCost;
  const totalProductsInInventory = products.reduce((sum, p) => sum + (Number(p.stock) || 0), 0);

  // Delivered Orders Calculations in Selected Month
  const deliveredOrdersInMonth = orders.filter(o => {
    const isDelivered = o.status === 'Đã giao';
    const isMonth = o.createdDate && o.createdDate.startsWith(selectedMonth);
    return isDelivered && isMonth;
  });

  const totalDeliveredRevenue = deliveredOrdersInMonth.reduce((sum, o) => {
    const itemsTotal = o.items.reduce((s, it) => s + (it.unitPrice * it.quantity), 0);
    return sum + itemsTotal;
  }, 0);

  const totalCostOfGoodsSold = deliveredOrdersInMonth.reduce((sum, o) => {
    return sum + o.items.reduce((s, it) => s + ((it.unitCost || 0) * it.quantity), 0);
  }, 0);

  const monthlyExpenses = expenses.filter(e => e.date && e.date.startsWith(selectedMonth));
  const totalOperatingExpenses = monthlyExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  const netProfit = totalDeliveredRevenue - totalCostOfGoodsSold - totalOperatingExpenses;
  const adminSplitShare = Math.round(netProfit / 2);

  return (
    <View style={styles.container}>
      {/* Header Banner */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.mainTitle}>Báo Cáo Tài Chính & Lợi Nhuận</Text>
          <Text style={styles.subtitle}>
            Tính toán dòng tiền thực tế, nguồn vốn đang có và doanh thu/lợi nhuận dự kiến
          </Text>
        </View>

        <View style={styles.largeTabsRow}>
          <TouchableOpacity
            style={[styles.largeTabBtn, activeTab === 'PROFIT' && styles.largeTabBtnActive]}
            onPress={() => setActiveTab('PROFIT')}
          >
            <TrendingUp size={16} color={activeTab === 'PROFIT' ? '#ffffff' : COLORS.textMuted} style={{ marginRight: 6 }} />
            <Text style={[styles.largeTabText, activeTab === 'PROFIT' && styles.largeTabTextActive]}>
              Báo Cáo Lợi Nhuận
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.largeTabBtn, activeTab === 'EXPENSES' && styles.largeTabBtnActive]}
            onPress={() => setActiveTab('EXPENSES')}
          >
            <FileText size={16} color={activeTab === 'EXPENSES' ? '#ffffff' : COLORS.textMuted} style={{ marginRight: 6 }} />
            <Text style={[styles.largeTabText, activeTab === 'EXPENSES' && styles.largeTabTextActive]}>
              Sổ Chi Phí Vận Hành ({expenses.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.largeTabBtn, activeTab === 'BATCHES' && styles.largeTabBtnActive]}
            onPress={() => setActiveTab('BATCHES')}
          >
            <Package size={16} color={activeTab === 'BATCHES' ? '#ffffff' : COLORS.textMuted} style={{ marginRight: 6 }} />
            <Text style={[styles.largeTabText, activeTab === 'BATCHES' && styles.largeTabTextActive]}>
              Báo Cáo Lô Hàng
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {activeTab === 'PROFIT' && (
          <View style={{ gap: 18 }}>
            {/* 1. CAPITAL BALANCE & ACTUAL CASH REMAINING */}
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
                    placeholder="100.000.000 VNĐ"
                    placeholderTextColor={COLORS.textMuted}
                    value={formatCurrencyInput(availableCapital)}
                    onChangeText={(val) => setAvailableCapital(parseCurrencyInput(val))}
                  />
                  <Text style={styles.capitalInputSub}>Số vốn ban đầu / vốn đầu tư sẵn có</Text>
                </View>

                <View style={styles.capitalStatCard}>
                  <Text style={styles.capitalCardLabel}>Tổng Vốn Đã Nhập Hàng (Tất Cả Các Lô):</Text>
                  <Text style={styles.capitalValInvested}>- {formatCurrency(totalCapitalInvestedAllBatches)}</Text>
                  <Text style={styles.capitalInputSub}>Tổng {batches.length} đợt lô hàng đã nhập kho</Text>
                </View>

                <View style={[
                  styles.capitalStatCard, 
                  { borderColor: actualCashRemaining >= 0 ? COLORS.success : COLORS.danger }
                ]}>
                  <Text style={styles.capitalCardLabel}>Tổng Tiền Thực Tế Còn Lại (Tiền Mặt/Ví):</Text>
                  <Text style={[
                    styles.capitalValCash, 
                    { color: actualCashRemaining >= 0 ? COLORS.success : COLORS.danger }
                  ]}>
                    {formatCurrency(actualCashRemaining)}
                  </Text>
                  <Text style={styles.capitalInputSub}>
                    {actualCashRemaining >= 0 ? 'Dòng tiền khả dụng an toàn' : 'Cảnh báo: Nhập quá nguồn vốn!'}
                  </Text>
                </View>
              </View>
            </View>

            {/* 2. EXPECTED REVENUE & PROFIT FROM PRODUCTS */}
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
                  <Text style={styles.metricSub}>Giá trị bán khi giải phóng hết {totalProductsInInventory} sp trong kho</Text>
                </View>

                <View style={styles.largeMetricCard}>
                  <Text style={styles.metricLabel}>2. Giá Trị Vốn Hàng Tồn Kho</Text>
                  <Text style={styles.metricValCost}>{formatCurrency(expectedInventoryCost)}</Text>
                  <Text style={styles.metricSub}>Giá gốc hiện tại của tất cả sp đang tồn kho</Text>
                </View>

                <View style={styles.largeMetricCard}>
                  <Text style={styles.metricLabel}>3. Tổng Lợi Nhuận Dự Kiến (Kho Hàng)</Text>
                  <Text style={{ fontSize: 22, fontWeight: '900', color: COLORS.success, marginTop: 4 }}>
                    + {formatCurrency(expectedInventoryProfit)}
                  </Text>
                  <Text style={styles.metricSub}>Lợi nhuận gộp dự kiến khi bán hết kho sản phẩm</Text>
                </View>
              </View>
            </View>

            {/* 3. MONTHLY DELIVERED PROFIT REPORT */}
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
                  backgroundColor: '#0f172a',
                  border: '1.5px solid #334155',
                  color: '#f8fafc',
                  padding: '10px 16px',
                  borderRadius: '10px',
                  fontSize: '16px',
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
                <Text style={styles.metricSub}>Từ {deliveredOrdersInMonth.length} đơn hàng đã hoàn thành</Text>
              </View>

              <View style={styles.largeMetricCard}>
                <Text style={styles.metricLabel}>2. Vốn Hàng Đã Bán</Text>
                <Text style={styles.metricValCost}>- {formatCurrency(totalCostOfGoodsSold)}</Text>
                <Text style={styles.metricSub}>Tiền gốc của sản phẩm trong đơn đã giao</Text>
              </View>

              <View style={styles.largeMetricCard}>
                <Text style={styles.metricLabel}>3. Chi Phí Vận Hành</Text>
                <Text style={styles.metricValExp}>- {formatCurrency(totalOperatingExpenses)}</Text>
                <Text style={styles.metricSub}>{monthlyExpenses.length} khoản chi (bao bì, ads, sticker...)</Text>
              </View>
            </View>

            <View style={styles.netProfitCard}>
              <View style={styles.netProfitHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <PieChart size={28} color={COLORS.success} />
                  <Text style={styles.netProfitTitle}>LỢI NHUẬN RÒNG THÁNG {selectedMonth}</Text>
                </View>
                <Text style={styles.netProfitFormulaNote}>
                  [ Lợi nhuận ròng = Tổng thu - Vốn hàng bán - Chi phí vận hành ]
                </Text>
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
                  <Text style={{ color: COLORS.textMuted, fontSize: 15 }}>Chưa có khoản chi vận hành nào được ghi nhận</Text>
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
                    <Text style={[styles.tdText, { width: 340 }]} numberOfLines={2}>{exp.reason}</Text>

                    <View style={[styles.td, { width: 130, flexDirection: 'row', justifyContent: 'center', gap: 8 }]}>
                      <TouchableOpacity style={styles.bigEditBtn} onPress={() => startEditExpense(exp)}>
                        <Edit2 size={16} color={COLORS.primaryLight} style={{ marginRight: 4 }} />
                        <Text style={{ color: COLORS.primaryLight, fontWeight: '700', fontSize: 13 }}>Sửa</Text>
                      </TouchableOpacity>

                      <TouchableOpacity style={styles.bigDeleteBtn} onPress={() => handleDeleteExpense(exp)}>
                        <Trash2 size={16} color={COLORS.danger} style={{ marginRight: 4 }} />
                        <Text style={{ color: COLORS.danger, fontWeight: '700', fontSize: 13 }}>Xóa</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>
          </View>
        )}

        {activeTab === 'BATCHES' && (
          <View style={{ gap: 16 }}>
            <Text style={styles.sectionHeading}>Thống Kê Thu Hồi Vốn & Lợi Nhuận Theo Từng Lô Hàng:</Text>

            {batches.map(b => {
              const batchProducts = products.filter(p => p.batchId === b.id);
              const totalCostInvested = b.totalCapital;

              const totalItemsSold = batchProducts.reduce((sum, p) => sum + p.soldCount, 0);
              const totalRevenueFromBatch = batchProducts.reduce((sum, p) => sum + (p.soldCount * p.sellingPrice), 0);
              const capitalRecovered = batchProducts.reduce((sum, p) => sum + (p.soldCount * p.costPrice), 0);
              const remainingStockVal = batchProducts.reduce((sum, p) => sum + (p.stock * p.costPrice), 0);

              const expectedBatchRevenue = batchProducts.reduce((sum, p) => sum + ((p.stock + p.soldCount) * p.sellingPrice), 0);
              const expectedBatchProfit = expectedBatchRevenue - totalCostInvested;

              const percentCapitalRecovered = totalCostInvested > 0 ? Math.min(100, Math.round((capitalRecovered / totalCostInvested) * 100)) : 0;

              return (
                <View key={b.id} style={styles.batchReportCard}>
                  <View style={styles.batchReportHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <Package size={24} color={COLORS.accent} />
                      <Text style={styles.batchReportTitle}>{b.code} - {b.name}</Text>
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
                      <Text style={styles.bValCost}>{formatCurrency(capitalRecovered)} ({percentCapitalRecovered}%)</Text>
                    </View>

                    <View style={styles.batchStatBox}>
                      <Text style={styles.bLabel}>Doanh thu đã thu về</Text>
                      <Text style={styles.bValRev}>{formatCurrency(totalRevenueFromBatch)}</Text>
                    </View>

                    <View style={styles.batchStatBox}>
                      <Text style={styles.bLabel}>Tổng thu dự kiến (bán hết)</Text>
                      <Text style={{ color: COLORS.accent, fontSize: 15, fontWeight: '800' }}>
                        {formatCurrency(expectedBatchRevenue)}
                      </Text>
                    </View>

                    <View style={styles.batchStatBox}>
                      <Text style={styles.bLabel}>Lợi nhuận dự kiến lô</Text>
                      <Text style={{ color: expectedBatchProfit >= 0 ? COLORS.success : COLORS.danger, fontSize: 15, fontWeight: '800' }}>
                        {expectedBatchProfit >= 0 ? '+' : ''}{formatCurrency(expectedBatchProfit)}
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
            <TextInput
              type="date"
              style={styles.largeInput}
              value={expDate}
              onChangeText={setExpDate}
            />

            <Text style={styles.inputLabel}>Danh mục chi phí:</Text>
            <select
              value={expCategory}
              onChange={(e) => setExpCategory(e.target.value)}
              style={styles.selectStyle}
            >
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
    backgroundColor: '#0f172a',
    maxWidth: '100%',
    boxSizing: 'border-box'
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
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.textMain
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 4
  },
  largeTabsRow: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#0f172a',
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
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMuted
  },
  largeTabTextActive: {
    color: '#ffffff'
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
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.textMain
  },
  capitalSubNote: {
    fontSize: 12,
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
    backgroundColor: '#162032',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.primary
  },
  capitalStatCard: {
    flex: 1,
    minWidth: 240,
    backgroundColor: '#162032',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.cardBorder
  },
  capitalCardLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 6
  },
  capitalInput: {
    backgroundColor: '#0f172a',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: COLORS.primaryLight,
    fontSize: 18,
    fontWeight: '900'
  },
  capitalInputSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 6
  },
  capitalValInvested: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.danger
  },
  capitalValCash: {
    fontSize: 20,
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
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.accent
  },
  expectedSubNote: {
    fontSize: 12,
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
    fontSize: 14,
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
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted
  },
  metricValRevenue: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.primaryLight,
    marginTop: 4
  },
  metricValCost: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.danger,
    marginTop: 4
  },
  metricValExp: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.statusPending,
    marginTop: 4
  },
  metricSub: {
    fontSize: 11,
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
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.success
  },
  netProfitFormulaNote: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontStyle: 'italic'
  },
  netProfitAmount: {
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.success,
    marginBottom: 16
  },
  adminSplitBox: {
    backgroundColor: '#0f172a',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder
  },
  adminSplitTitle: {
    fontSize: 13,
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
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted
  },
  adminAmount: {
    fontSize: 20,
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
    fontSize: 16,
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
    fontSize: 14
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
    backgroundColor: '#162032',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.cardBorder
  },
  th: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase'
  },
  tr: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b'
  },
  trEven: {
    backgroundColor: 'transparent'
  },
  tdText: {
    color: COLORS.textMain,
    fontSize: 14
  },
  tdAmount: {
    color: COLORS.danger,
    fontSize: 14,
    fontWeight: '800'
  },
  td: {
    justifyContent: 'center'
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
    fontSize: 12,
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
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textMain
  },
  batchReportDate: {
    fontSize: 12,
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
    backgroundColor: '#0f172a',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.cardBorder
  },
  bLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: 4
  },
  bVal: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textMain
  },
  bValSold: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primaryLight
  },
  bValCost: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.success
  },
  bValRev: {
    fontSize: 15,
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
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.textMain,
    marginBottom: 16
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginTop: 10,
    marginBottom: 6
  },
  largeInput: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: COLORS.textMain,
    fontSize: 14,
    outlineStyle: 'none'
  },
  selectStyle: {
    backgroundColor: '#0f172a',
    border: '1px solid #334155',
    color: '#f8fafc',
    padding: '10px 12px',
    borderRadius: '8px',
    fontSize: '14px',
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
    fontSize: 14
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
    fontSize: 14
  }
});
