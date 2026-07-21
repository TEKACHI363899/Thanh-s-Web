import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from '../common/RNBridge';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../theme/colors';
import { Plus, Search, Filter, Calendar, Edit2, Trash2, Tag, ChevronDown, CheckCircle, Clock, Truck, XCircle, AlertCircle, Phone, User, Globe, FileText, Package, RotateCcw, X, Check } from 'lucide-react';
import { OrderFormModal } from './OrderFormModal';

export const OrderDataGrid = () => {
  const { orders, batches, deleteOrder, setOrderStatus } = useData();
  const { requireAdmin } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedOrderType, setSelectedOrderType] = useState('ALL');
  const [selectedBatch, setSelectedBatch] = useState('ALL');
  const [selectedMonth, setSelectedMonth] = useState('ALL');

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);

  // Filter calculation
  const activeFilterCount = (searchTerm.trim() ? 1 : 0) + 
    (selectedStatus !== 'ALL' ? 1 : 0) + 
    (selectedOrderType !== 'ALL' ? 1 : 0) + 
    (selectedBatch !== 'ALL' ? 1 : 0) + 
    (selectedMonth !== 'ALL' ? 1 : 0);

  const filteredOrders = orders.filter(o => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = !term || 
      (o.customerName && o.customerName.toLowerCase().includes(term)) ||
      (o.customerPhone && o.customerPhone.includes(term)) ||
      (o.socialUsername && o.socialUsername.toLowerCase().includes(term)) ||
      (o.code && o.code.toLowerCase().includes(term));

    const matchesStatus = selectedStatus === 'ALL' || o.status === selectedStatus;
    const matchesType = selectedOrderType === 'ALL' || o.orderType === selectedOrderType;
    const matchesBatch = selectedBatch === 'ALL' || (o.items && o.items.some(it => it.batchId === selectedBatch));

    let matchesMonth = true;
    if (selectedMonth !== 'ALL' && o.createdDate) {
      matchesMonth = o.createdDate.startsWith(selectedMonth);
    }

    return matchesSearch && matchesStatus && matchesType && matchesBatch && matchesMonth;
  });

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedStatus('ALL');
    setSelectedOrderType('ALL');
    setSelectedBatch('ALL');
    setSelectedMonth('ALL');
  };

  const handleEdit = (order) => {
    setEditingOrder(order);
    setIsOrderModalOpen(true);
  };

  const handleDelete = (order) => {
    if (window.confirm(`Bạn có chắc muốn XÓA đơn hàng ${order.code} của khách "${order.customerName}"? (Số lượng sản phẩm sẽ được tự động hoàn lại tồn kho)`)) {
      deleteOrder(order.id);
    }
  };

  const formatCurrency = (val) => {
    return (Number(val) || 0).toLocaleString('vi-VN') + ' VNĐ';
  };

  const getStatusBadgeStyle = (st) => {
    switch (st) {
      case 'Chờ xử lý':
        return { bg: 'rgba(245, 158, 11, 0.2)', text: COLORS.statusPending, icon: Clock };
      case 'Đã chốt':
        return { bg: 'rgba(59, 130, 246, 0.2)', text: COLORS.statusConfirmed, icon: CheckCircle };
      case 'Đang giao':
        return { bg: 'rgba(139, 92, 246, 0.2)', text: COLORS.statusShipping, icon: Truck };
      case 'Đã giao':
        return { bg: 'rgba(16, 185, 129, 0.2)', text: COLORS.statusDelivered, icon: CheckCircle };
      case 'Hoàn/Hủy':
        return { bg: 'rgba(239, 68, 68, 0.2)', text: COLORS.statusCancelled, icon: XCircle };
      default:
        return { bg: COLORS.surfaceHover, text: COLORS.textMuted, icon: AlertCircle };
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Banner Toolbar */}
      <View style={styles.topBanner}>
        <View style={{ flex: 1 }}>
          <Text style={styles.mainTitle}>Bảng Danh Sách Đơn Hàng</Text>
          <Text style={styles.subtitle}>
            Tra cứu theo Tên, SĐT • Tự động trừ tồn kho sản phẩm từ thời điểm tạo đơn hàng
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.bigCreateOrderBtn} 
          onPress={() => {
            requireAdmin(() => {
              setEditingOrder(null);
              setIsOrderModalOpen(true);
            }, 'Vui lòng đăng nhập Admin để tạo đơn hàng mới!');
          }}
        >
          <Plus size={18} color="#ffffff" style={{ marginRight: 6 }} />
          <Text style={styles.bigCreateOrderBtnText}>Tạo Đơn Hàng Mới</Text>
        </TouchableOpacity>
      </View>

      {/* KPI Stats Overview Bar */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statVal}>{orders.length}</Text>
          <Text style={styles.statLabel}>Tổng Đơn Hàng</Text>
        </View>

        <View style={[styles.statCard, { borderColor: COLORS.statusPending }]}>
          <Text style={[styles.statVal, { color: COLORS.statusPending }]}>
            {orders.filter(o => o.status === 'Chờ xử lý').length}
          </Text>
          <Text style={styles.statLabel}>Chờ Xử Lý</Text>
        </View>

        <View style={[styles.statCard, { borderColor: COLORS.statusShipping }]}>
          <Text style={[styles.statVal, { color: COLORS.statusShipping }]}>
            {orders.filter(o => o.status === 'Đang giao').length}
          </Text>
          <Text style={styles.statLabel}>Đang Giao</Text>
        </View>

        <View style={[styles.statCard, { borderColor: COLORS.statusDelivered }]}>
          <Text style={[styles.statVal, { color: COLORS.statusDelivered }]}>
            {orders.filter(o => o.status === 'Đã giao').length}
          </Text>
          <Text style={styles.statLabel}>Đã Giao Thành Công</Text>
        </View>

        <View style={[styles.statCard, { borderColor: COLORS.danger }]}>
          <Text style={[styles.statVal, { color: COLORS.danger, fontSize: 18 }]}>
            {formatCurrency(orders.reduce((sum, o) => sum + (o.remainingDebt || 0), 0))}
          </Text>
          <Text style={styles.statLabel}>Tổng Nợ Khách Order</Text>
        </View>
      </View>

      {/* Compact Filter Bar + Single Filter Button */}
      <View style={styles.filterBarRow}>
        <View style={styles.searchBox}>
          <Search size={18} color={COLORS.primaryLight} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm Tên khách, SĐT hoặc Mã đơn..."
            placeholderTextColor={COLORS.textMuted}
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
          {searchTerm ? (
            <TouchableOpacity onPress={() => setSearchTerm('')} style={styles.clearIcon}>
              <X size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Unified Filter Button */}
        <TouchableOpacity 
          style={[styles.filterTriggerBtn, activeFilterCount > 0 && styles.filterTriggerBtnActive]}
          onPress={() => setIsFilterModalOpen(true)}
        >
          <Filter size={16} color={activeFilterCount > 0 ? '#ffffff' : COLORS.primaryLight} style={{ marginRight: 6 }} />
          <Text style={[styles.filterTriggerText, activeFilterCount > 0 && styles.filterTriggerTextActive]}>
            Bộ Lọc {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
          </Text>
        </TouchableOpacity>

        {activeFilterCount > 0 && (
          <TouchableOpacity style={styles.resetFilterBtn} onPress={resetFilters}>
            <RotateCcw size={15} color={COLORS.textMuted} style={{ marginRight: 4 }} />
            <Text style={styles.resetFilterText}>Đặt lại</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Data Grid Table Container (Both Vertical and Horizontal Scrollable) */}
      <View style={styles.tableOuterScrollContainer}>
        <ScrollView style={styles.tableScrollView} horizontal showsHorizontalScrollIndicator={true}>
          <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.trHeader}>
              <Text style={[styles.th, { width: 110 }]}>Mã Đơn</Text>
              <Text style={[styles.th, { width: 130 }]}>Ngày Tạo</Text>
              <Text style={[styles.th, { width: 200 }]}>Tên Khách & SĐT</Text>
              <Text style={[styles.th, { width: 260 }]}>Sản Phẩm & Lô</Text>
              <Text style={[styles.th, { width: 150 }]}>Tổng Tiền</Text>
              <Text style={[styles.th, { width: 170 }]}>Trạng Thái</Text>
              <Text style={[styles.th, { width: 140 }]}>Nợ / Cọc</Text>
              <Text style={[styles.th, { width: 160 }]}>Ghi Chú</Text>
              <Text style={[styles.th, { width: 130, textAlign: 'center' }]}>Thao Tác</Text>
            </View>

            {/* Table Rows */}
            {filteredOrders.length === 0 ? (
              <View style={styles.emptyBox}>
                <FileText size={36} color={COLORS.textMuted} />
                <Text style={styles.emptyText}>Không tìm thấy đơn hàng nào phù hợp với bộ lọc</Text>
              </View>
            ) : (
              filteredOrders.map((ord, idx) => {
                const stStyle = getStatusBadgeStyle(ord.status);
                const totalVal = ord.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0) + (ord.isFreeship ? 0 : ord.shippingFee);

                return (
                  <View key={ord.id} style={styles.tr}>
                    {/* Code */}
                    <View style={[styles.td, { width: 110 }]}>
                      <Text style={styles.codeText}>{ord.code}</Text>
                      <View style={[
                        styles.typeBadgeTag,
                        ord.orderType === 'Order' ? styles.typeOrder : styles.typeInStock
                      ]}>
                        <Text style={styles.typeBadgeText}>{ord.orderType}</Text>
                      </View>
                    </View>

                    {/* Date */}
                    <View style={[styles.td, { width: 130 }]}>
                      <Text style={styles.dateText}>{ord.createdDate}</Text>
                    </View>

                    {/* Customer */}
                    <View style={[styles.td, { width: 200 }]}>
                      <Text style={styles.customerName} numberOfLines={1}>{ord.customerName}</Text>
                      {ord.customerPhone ? (
                        <Text style={styles.customerPhone} numberOfLines={1}>{ord.customerPhone}</Text>
                      ) : null}
                    </View>

                    {/* Products (Compact max-height box to prevent row swelling) */}
                    <View style={[styles.td, { width: 260, maxHeight: 52, overflowY: 'auto' }]}>
                      {ord.items.map((it, i) => (
                        <Text key={i} style={styles.itemSummaryText} numberOfLines={1}>
                          • [{it.sku}] {it.productName} (x{it.quantity})
                        </Text>
                      ))}
                    </View>

                    {/* Total */}
                    <View style={[styles.td, { width: 150 }]}>
                      <Text style={styles.totalPriceText}>{formatCurrency(totalVal)}</Text>
                      <Text style={styles.payMethodText}>{ord.paymentMethod}</Text>
                    </View>

                    {/* Interactive Status Dropdown */}
                    <View style={[styles.td, { width: 170 }]}>
                      <View style={[styles.statusDropdownContainer, { backgroundColor: stStyle.bg }]}>
                        <select
                          value={ord.status}
                          onChange={(e) => {
                            const val = e.target.value;
                            requireAdmin(() => {
                              setOrderStatus(ord.id, val);
                            }, 'Vui lòng đăng nhập Admin để chuyển trạng thái đơn hàng!');
                          }}
                          style={{
                            backgroundColor: 'transparent',
                            border: 'none',
                            color: stStyle.text,
                            fontWeight: '700',
                            fontSize: '13px',
                            outline: 'none',
                            cursor: 'pointer',
                            paddingVertical: '2px',
                            width: '100%'
                          }}
                        >
                          <option value="Chờ xử lý" style={{ background: '#1e293b', color: '#f8fafc' }}>Chờ xử lý</option>
                          <option value="Đã chốt" style={{ background: '#1e293b', color: '#f8fafc' }}>Đã chốt</option>
                          <option value="Đang giao" style={{ background: '#1e293b', color: '#f8fafc' }}>Đang giao</option>
                          <option value="Đã giao" style={{ background: '#1e293b', color: '#f8fafc' }}>Đã giao</option>
                          <option value="Hoàn/Hủy" style={{ background: '#1e293b', color: '#f8fafc' }}>Hoàn/Hủy (Hoàn kho)</option>
                        </select>
                      </View>
                    </View>

                    {/* Debt / Deposit / COD */}
                    <View style={[styles.td, { width: 140 }]}>
                      {ord.remainingDebt > 0 ? (
                        <View>
                          <Text style={styles.debtVal}>COD: {formatCurrency(ord.remainingDebt)}</Text>
                          {ord.depositAmount > 0 ? (
                            <Text style={styles.depositVal}>Cọc: {formatCurrency(ord.depositAmount)}</Text>
                          ) : null}
                        </View>
                      ) : (
                        <Text style={styles.noDebtText}>Đã thanh toán</Text>
                      )}
                    </View>

                    {/* Notes */}
                    <View style={[styles.td, { width: 160 }]}>
                      <Text style={styles.notesText} numberOfLines={1}>{ord.orderNotes || 'Không'}</Text>
                    </View>

                    {/* Actions: Edit & Delete Buttons */}
                    <View style={[styles.td, { width: 130, flexDirection: 'row', justifyContent: 'center', gap: 6 }]}>
                      <TouchableOpacity 
                        style={styles.bigEditBtn} 
                        onPress={() => requireAdmin(() => handleEdit(ord), 'Vui lòng đăng nhập Admin để sửa đơn hàng!')}
                      >
                        <Edit2 size={14} color={COLORS.primaryLight} style={{ marginRight: 2 }} />
                        <Text style={{ color: COLORS.primaryLight, fontWeight: '700', fontSize: 12 }}>Sửa</Text>
                      </TouchableOpacity>

                      <TouchableOpacity 
                        style={styles.bigDeleteBtn} 
                        onPress={() => requireAdmin(() => handleDelete(ord), 'Vui lòng đăng nhập Admin để xóa đơn hàng!')}
                      >
                        <Trash2 size={14} color={COLORS.danger} style={{ marginRight: 2 }} />
                        <Text style={{ color: COLORS.danger, fontWeight: '700', fontSize: 12 }}>Xóa</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>
      </View>

      {/* UNIFIED FILTER MODAL POPUP */}
      {isFilterModalOpen && (
        <View style={styles.overlay}>
          <View style={styles.filterModalCard}>
            <View style={styles.filterModalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Filter size={20} color={COLORS.primaryLight} />
                <Text style={styles.filterModalTitle}>⚡ Bộ Lọc Đơn Hàng Nâng Cao</Text>
              </View>
              <TouchableOpacity onPress={() => setIsFilterModalOpen(false)} style={styles.closeBtn}>
                <X size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.filterModalBody}>
              {/* 1. Keyword search */}
              <Text style={styles.filterSectionLabel}>1. Tìm theo Tên khách, SĐT, Mã đơn:</Text>
              <View style={styles.modalSearchBox}>
                <Search size={18} color={COLORS.primaryLight} style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.modalSearchInput}
                  placeholder="Ví dụ: DH-1001, Nguyễn Văn A, 0987..."
                  placeholderTextColor={COLORS.textMuted}
                  value={searchTerm}
                  onChangeText={setSearchTerm}
                />
              </View>

              {/* 2. Filter by Batch (Lọc theo Lô hàng) */}
              <Text style={styles.filterSectionLabel}>2. Lọc đơn theo Lô Hàng Nhập:</Text>
              <View style={styles.modalSelectWrapper}>
                <Package size={18} color={COLORS.accent} style={{ marginRight: 8 }} />
                <select
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                  style={styles.modalSelect}
                >
                  <option value="ALL" style={{ background: '#1e293b', color: '#f8fafc' }}>
                    📦 Tất cả Lô Hàng ({batches.length})
                  </option>
                  {batches.map(b => (
                    <option key={b.id} value={b.id} style={{ background: '#1e293b', color: '#f8fafc' }}>
                      [{b.code}] {b.name}
                    </option>
                  ))}
                </select>
              </View>

              {/* 3. Status selection */}
              <Text style={styles.filterSectionLabel}>3. Trạng thái đơn hàng:</Text>
              <View style={styles.chipsRow}>
                {['ALL', 'Chờ xử lý', 'Đã chốt', 'Đang giao', 'Đã giao', 'Hoàn/Hủy'].map(st => (
                  <TouchableOpacity
                    key={st}
                    style={[styles.modalChip, selectedStatus === st && styles.modalChipActive]}
                    onPress={() => setSelectedStatus(st)}
                  >
                    <Text style={[styles.modalChipText, selectedStatus === st && styles.modalChipTextActive]}>
                      {st === 'ALL' ? 'Tất cả trạng thái' : st}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* 4. Order type */}
              <Text style={styles.filterSectionLabel}>4. Loại đơn hàng:</Text>
              <View style={styles.chipsRow}>
                {['ALL', 'Có sẵn', 'Order'].map(t => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.modalChip, selectedOrderType === t && styles.modalChipActive]}
                    onPress={() => setSelectedOrderType(t)}
                  >
                    <Text style={[styles.modalChipText, selectedOrderType === t && styles.modalChipTextActive]}>
                      {t === 'ALL' ? 'Tất cả loại' : t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Filter Modal Footer */}
            <View style={styles.filterModalFooter}>
              <TouchableOpacity style={styles.resetModalBtn} onPress={resetFilters}>
                <RotateCcw size={16} color={COLORS.textMuted} style={{ marginRight: 6 }} />
                <Text style={styles.resetModalBtnText}>Xóa Bộ Lọc</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.applyModalBtn} onPress={() => setIsFilterModalOpen(false)}>
                <Check size={18} color="#ffffff" style={{ marginRight: 6 }} />
                <Text style={styles.applyModalBtnText}>Áp Dụng Bộ Lọc</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Order Form Modal */}
      <OrderFormModal
        visible={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        initialOrder={editingOrder}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#0f172a'
  },
  topBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.cardDark,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 16,
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
  bigCreateOrderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10
  },
  bigCreateOrderBtnText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 16
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    flexWrap: 'wrap'
  },
  statCard: {
    flex: 1,
    minWidth: 160,
    backgroundColor: COLORS.cardDark,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.cardBorder,
    alignItems: 'center'
  },
  statVal: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.textMain
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginTop: 4
  },
  filterBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardDark,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.cardBorder
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: '#f8fafc'
  },
  clearIcon: {
    padding: 4
  },
  filterTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardDark,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.primaryLight
  },
  filterTriggerBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary
  },
  filterTriggerText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primaryLight
  },
  filterTriggerTextActive: {
    color: '#ffffff'
  },
  resetFilterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceHover,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12
  },
  resetFilterText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMuted
  },
  tableOuterScrollContainer: {
    backgroundColor: COLORS.cardDark,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    overflow: 'hidden',
    maxHeight: 'calc(100vh - 270px)',
    overflowY: 'auto'
  },
  tableScrollView: {
    overflowX: 'auto'
  },
  table: {
    minWidth: 1280
  },
  trHeader: {
    flexDirection: 'row',
    backgroundColor: '#162032',
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.cardBorder,
    paddingVertical: 12,
    paddingHorizontal: 12
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
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    minHeight: 52
  },
  trEven: {
    backgroundColor: '#172336'
  },
  td: {
    justifyContent: 'center'
  },
  codeText: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.primaryLight
  },
  typeBadgeTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 4,
    alignSelf: 'flex-start'
  },
  typeInStock: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)'
  },
  typeOrder: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)'
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMain
  },
  dateText: {
    fontSize: 13,
    color: COLORS.textMuted
  },
  customerName: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textMain
  },
  customerPhone: {
    fontSize: 13,
    color: COLORS.textMuted
  },
  itemSummaryText: {
    fontSize: 13,
    color: COLORS.textSub,
    lineHeight: 18
  },
  totalPriceText: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.success
  },
  payMethodText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2
  },
  statusDropdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8
  },
  debtVal: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.danger
  },
  depositVal: {
    fontSize: 12,
    color: COLORS.statusPending
  },
  noDebtText: {
    fontSize: 13,
    color: COLORS.success,
    fontWeight: '700'
  },
  notesText: {
    fontSize: 13,
    color: COLORS.textMuted
  },
  bigEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderWidth: 1,
    borderColor: COLORS.primaryLight
  },
  bigDeleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
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
  emptyText: {
    fontSize: 15,
    color: COLORS.textMuted,
    marginTop: 10
  },
  // UNIFIED FILTER MODAL POPUP STYLES
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
  filterModalCard: {
    width: '100%',
    maxWidth: 540,
    backgroundColor: COLORS.cardDark,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: COLORS.cardBorder,
    padding: 22
  },
  filterModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
    paddingBottom: 14
  },
  filterModalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.textMain
  },
  closeBtn: {
    padding: 6,
    backgroundColor: COLORS.surfaceHover,
    borderRadius: 8
  },
  filterModalBody: {
    gap: 14
  },
  filterSectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSub,
    marginTop: 4
  },
  modalSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 10,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: COLORS.cardBorder
  },
  modalSearchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: '#f8fafc'
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  modalChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: COLORS.cardBorder
  },
  modalChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary
  },
  modalChipText: {
    fontSize: 13,
    color: COLORS.textMuted
  },
  modalChipTextActive: {
    color: '#ffffff',
    fontWeight: '800'
  },
  modalSelectWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.accent
  },
  modalSelect: {
    flex: 1,
    backgroundColor: 'transparent',
    border: 'none',
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '700',
    outline: 'none',
    cursor: 'pointer'
  },
  filterModalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 22,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
    paddingTop: 16
  },
  resetModalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceHover
  },
  resetModalBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMuted
  },
  applyModalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.primary
  },
  applyModalBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff'
  }
});
