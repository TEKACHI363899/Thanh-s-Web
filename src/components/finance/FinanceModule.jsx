import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from '../common/RNBridge';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../theme/colors';
import { DollarSign, FileText, PieChart, Plus, Edit2, Trash2, Calendar, TrendingUp, Package, Users, ShieldAlert, Check } from 'lucide-react';
import { formatCurrencyInput, parseCurrencyInput } from '../../utils/formatters';

export const FinanceModule = () => {
  const { expenses, orders, products, batches, addExpense, updateExpense, deleteExpense } = useData();
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

  const handleOpenAddExpense = () => {
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
      setExpCategory(exp.category || 'Khác');
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

  const deliveredOrdersInMonth = orders.filter(o => {
    const isDelivered = o.status === 'Đã giao';
    const isMonth = o.createdDate && o.createdDate.startsWith(selectedMonth);
    return isDelivered && isMonth;
  });

  const totalDeliveredRevenue = deliveredOrdersInMonth.reduce((sum, o) => {
    const itemsTotal = o.items.reduce((s, it) => s + (it.unitPrice * it.quantity), 0);
    return sum + itemsTotal; // Doanh thu thuần = 100% tiền hàng, KHÔNG tính phí ship thu hộ shipper
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
            Tính lợi nhuận ròng thực tế dựa trên dữ liệu đơn hàng và chi phí vận hành
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
            <View style={styles.monthSelectorCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Calendar size={22} color={COLORS.primaryLight} />
                <Text style={styles.monthSelectorLabel}>Chọn Tháng Báo Cáo Lợi Nhuận:</Text>
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
                  <Text style={styles.adminSplitTitle}>🤝 CHIA TIỀN LỢI NHUẬN GIỮA 2 QUẢN LÝ (50 / 50):</Text>
                </View>

                <View style={styles.splitRow}>
                  <View style={styles.adminCol}>
                    <Text style={styles.adminName}>👨‍💼 Admin 1 (Quản lý 1):</Text>
                    <Text style={styles.adminAmount}>{formatCurrency(adminSplitShare)}</Text>
                  </View>

                  <View style={styles.adminDivider} />

                  <View style={styles.adminCol}>
                    <Text style={styles.adminName}>👩‍💼 Admin 2 (Quản lý 2):</Text>
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
                      <Text style={styles.bLabel}>Doanh thu thu về</Text>
                      <Text style={styles.bValRev}>{formatCurrency(totalRevenueFromBatch)}</Text>
                    </View>

                    <View style={styles.batchStatBox}>
                      <Text style={styles.bLabel}>Giá trị tồn kho còn lại</Text>
                      <Text style={{ color: COLORS.textMuted, fontSize: 15, fontWeight: '800' }}>
                        {formatCurrency(remainingStockVal)}
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
              {editingExpenseId === 'NEW' ? '➕ Ghi Khoản Chi Vận Hành Mới' : '✏️ Chỉnh Sửa Khoản Chi'}
            </Text>

            <Text style={styles.inputLabel}>Ngày chi (Bảng chọn datepicker):</Text>
            <TextInput
              type="date"
              style={styles.largeInput}
              value={expDate}
              onChangeText={setExpDate}
            />

            <Text style={styles.inputLabel}>Số tiền chi (Hiển thị trực tiếp VNĐ) *:</Text>
            <TextInput
              style={[styles.largeInput, { color: COLORS.danger, fontWeight: '800', fontSize: 16 }]}
              keyboardType="numeric"
              placeholder="0 VNĐ"
              placeholderTextColor={COLORS.textMuted}
              value={formatCurrencyInput(expAmount)}
              onChangeText={(val) => setExpAmount(parseCurrencyInput(val))}
            />

            <Text style={styles.inputLabel}>Danh mục chi phí:</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
              {['Bao bì & In ấn', 'Quảng cáo', 'Vật tư gói hàng', 'Phần mềm', 'Khác'].map(c => (
                <TouchableOpacity
                  key={c}
                  style={[styles.largeCatChip, expCategory === c && styles.largeCatChipActive]}
                  onPress={() => setExpCategory(c)}
                >
                  <Text style={[styles.largeCatChipText, expCategory === c && styles.largeCatChipTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Lý do chi chi tiết *:</Text>
            <TextInput
              style={[styles.largeInput, { height: 80 }]}
              multiline
              placeholder="Ví dụ: In 500 túi xốp logo, Tiền băng keo niêm phong..."
              placeholderTextColor={COLORS.textMuted}
              value={expReason}
              onChangeText={setExpReason}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsExpenseModalOpen(false)}>
                <Text style={styles.cancelText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveExpense}>
                <Check size={18} color="#ffffff" style={{ marginRight: 6 }} />
                <Text style={styles.saveText}>Lưu Khoản Chi</Text>
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
    padding: 20,
    backgroundColor: COLORS.bgDark
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
    flexWrap: 'wrap',
    gap: 14
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.textMain
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 4
  },
  largeTabsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardDark,
    borderRadius: 12,
    padding: 6,
    borderWidth: 1,
    borderColor: COLORS.cardBorder
  },
  largeTabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10
  },
  largeTabBtnActive: {
    backgroundColor: COLORS.primary
  },
  largeTabText: {
    fontSize: 14,
    color: COLORS.textMuted
  },
  largeTabTextActive: {
    color: '#ffffff',
    fontWeight: '800'
  },
  monthSelectorCard: {
    backgroundColor: COLORS.cardDark,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  monthSelectorLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textMain
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap'
  },
  largeMetricCard: {
    flex: 1,
    minWidth: 240,
    backgroundColor: COLORS.cardDark,
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder
  },
  metricLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textSub
  },
  metricValRevenue: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.success,
    marginTop: 10
  },
  metricValCost: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.statusPending,
    marginTop: 10
  },
  metricValExp: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.danger,
    marginTop: 10
  },
  metricSub: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 6
  },
  netProfitCard: {
    backgroundColor: '#162032',
    padding: 24,
    borderRadius: 18,
    borderWidth: 2.5,
    borderColor: COLORS.success
  },
  netProfitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10
  },
  netProfitTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.success
  },
  netProfitFormulaNote: {
    fontSize: 13,
    color: COLORS.textMuted
  },
  netProfitAmount: {
    fontSize: 42,
    fontWeight: '900',
    color: COLORS.success,
    marginVertical: 14
  },
  adminSplitBox: {
    backgroundColor: '#0f172a',
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder
  },
  adminSplitTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primaryLight
  },
  splitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10
  },
  adminCol: {
    flex: 1,
    alignItems: 'center'
  },
  adminDivider: {
    width: 1.5,
    height: 48,
    backgroundColor: COLORS.cardBorder
  },
  adminName: {
    fontSize: 14,
    color: COLORS.textSub
  },
  adminAmount: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.textMain,
    marginTop: 6
  },
  expenseToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textMain
  },
  bigAddExpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.danger,
    paddingHorizontal: 18,
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
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.cardBorder
  },
  th: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase'
  },
  tr: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b'
  },
  trEven: {
    backgroundColor: '#172336'
  },
  tdText: {
    fontSize: 14,
    color: COLORS.textMain
  },
  tdAmount: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.danger
  },
  td: {
    justifyContent: 'center'
  },
  catBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: 'flex-start'
  },
  catBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryLight
  },
  bigEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderWidth: 1,
    borderColor: COLORS.primaryLight
  },
  bigDeleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: COLORS.danger
  },
  emptyBox: {
    padding: 40,
    alignItems: 'center'
  },
  batchReportCard: {
    backgroundColor: COLORS.cardDark,
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder
  },
  batchReportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14
  },
  batchReportTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textMain
  },
  batchReportDate: {
    fontSize: 13,
    color: COLORS.textMuted
  },
  batchStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
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
    fontSize: 12,
    color: COLORS.textMuted
  },
  bVal: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.textMain,
    marginTop: 4
  },
  bValSold: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.success,
    marginTop: 4
  },
  bValCost: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.statusPending,
    marginTop: 4
  },
  bValRev: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.primaryLight,
    marginTop: 4
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    padding: 16
  },
  modalBox: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: COLORS.cardDark,
    borderRadius: 16,
    padding: 22,
    borderWidth: 1,
    borderColor: COLORS.cardBorder
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textMain,
    marginBottom: 14
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSub,
    marginBottom: 6,
    marginTop: 10
  },
  largeInput: {
    backgroundColor: '#0f172a',
    borderWidth: 1.5,
    borderColor: COLORS.cardBorder,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: COLORS.textMain,
    fontSize: 15,
    outlineStyle: 'none'
  },
  largeCatChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: COLORS.cardBorder
  },
  largeCatChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary
  },
  largeCatChipText: {
    fontSize: 12,
    color: COLORS.textMuted
  },
  largeCatChipTextActive: {
    color: '#ffffff',
    fontWeight: '800'
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 20
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceHover
  },
  cancelText: {
    color: COLORS.textMuted,
    fontWeight: '700',
    fontSize: 14
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.danger
  },
  saveText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 14
  }
});
