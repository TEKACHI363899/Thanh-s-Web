import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from '../common/RNBridge';
import { useData } from '../../context/DataContext';
import { COLORS } from '../../theme/colors';
import { Plus, Search, Filter, Calendar, Edit2, Trash2, Tag, ChevronDown, CheckCircle, Clock, Truck, XCircle, AlertCircle, Phone, User, Globe, FileText } from 'lucide-react';
import { OrderFormModal } from './OrderFormModal';

export const OrderDataGrid = () => {
  const { orders, batches, deleteOrder, setOrderStatus } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedOrderType, setSelectedOrderType] = useState('ALL');
  const [selectedMonth, setSelectedMonth] = useState('ALL');

  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);

  const filteredOrders = orders.filter(o => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = !term || 
      (o.customerName && o.customerName.toLowerCase().includes(term)) ||
      (o.customerPhone && o.customerPhone.includes(term)) ||
      (o.socialUsername && o.socialUsername.toLowerCase().includes(term)) ||
      (o.code && o.code.toLowerCase().includes(term));

    const matchesStatus = selectedStatus === 'ALL' || o.status === selectedStatus;
    const matchesType = selectedOrderType === 'ALL' || o.orderType === selectedOrderType;

    let matchesMonth = true;
    if (selectedMonth !== 'ALL' && o.createdDate) {
      matchesMonth = o.createdDate.startsWith(selectedMonth);
    }

    return matchesSearch && matchesStatus && matchesType && matchesMonth;
  });

  const handleEdit = (order) => {
    setEditingOrder(order);
    setIsOrderModalOpen(true);
  };

  const handleDelete = (order) => {
    if (window.confirm(`Bạn có chắc muốn XÓA đơn hàng ${order.code} của khách "${order.customerName}"?`)) {
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
          <Text style={styles.mainTitle}>📊 Bảng Danh Sách Đơn Hàng & Data Grid</Text>
          <Text style={styles.subtitle}>
            Tra cứu siêu tốc theo Tên, SĐT, IG/FB Username • Trạng thái "Đã giao" tự động trừ tồn kho
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.bigCreateOrderBtn} 
          onPress={() => {
            setEditingOrder(null);
            setIsOrderModalOpen(true);
          }}
        >
          <Plus size={22} color="#ffffff" style={{ marginRight: 8 }} />
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
          <Text style={[styles.statVal, { color: COLORS.danger, fontSize: 20 }]}>
            {formatCurrency(orders.reduce((sum, o) => sum + (o.remainingDebt || 0), 0))}
          </Text>
          <Text style={styles.statLabel}>Tổng Nợ Khách Order</Text>
        </View>
      </View>

      {/* Filter & Search Toolbar */}
      <View style={styles.filterCard}>
        {/* Instant Search Bar */}
        <View style={styles.largeSearchBox}>
          <Search size={22} color={COLORS.primaryLight} style={{ marginRight: 10 }} />
          <TextInput
            style={styles.largeSearchInput}
            placeholder="🔍 Nhập Tên, SĐT, hoặc IG/FB Username để xem ngay toàn bộ lịch sử mua hàng..."
            placeholderTextColor={COLORS.textMuted}
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
          {searchTerm ? (
            <TouchableOpacity onPress={() => setSearchTerm('')} style={styles.clearSearchBtn}>
              <Text style={{ color: COLORS.textMuted, fontSize: 13, fontWeight: '700' }}>✕ Xóa tìm</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Filter Chip Groups */}
        <View style={styles.filterChipsRow}>
          {/* Status Filters */}
          <View style={styles.chipGroup}>
            <Text style={styles.chipGroupLabel}>Trạng thái đơn:</Text>
            {['ALL', 'Chờ xử lý', 'Đã chốt', 'Đang giao', 'Đã giao', 'Hoàn/Hủy'].map(st => (
              <TouchableOpacity
                key={st}
                style={[styles.largeChip, selectedStatus === st && styles.largeChipActive]}
                onPress={() => setSelectedStatus(st)}
              >
                <Text style={[styles.largeChipText, selectedStatus === st && styles.largeChipTextActive]}>
                  {st === 'ALL' ? 'Tất cả' : st}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Type Filters */}
          <View style={styles.chipGroup}>
            <Text style={styles.chipGroupLabel}>Loại đơn:</Text>
            {['ALL', 'Có sẵn', 'Order'].map(t => (
              <TouchableOpacity
                key={t}
                style={[styles.largeChip, selectedOrderType === t && styles.largeChipActive]}
                onPress={() => setSelectedOrderType(t)}
              >
                <Text style={[styles.largeChipText, selectedOrderType === t && styles.largeChipTextActive]}>
                  {t === 'ALL' ? 'Tất cả' : t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Data Grid Table View */}
      <ScrollView style={styles.tableScrollView} horizontal showsHorizontalScrollIndicator={true}>
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.trHeader}>
            <Text style={[styles.th, { width: 110 }]}>Mã Đơn</Text>
            <Text style={[styles.th, { width: 130 }]}>Ngày Tạo</Text>
            <Text style={[styles.th, { width: 220 }]}>Tên Khách & SĐT</Text>
            <Text style={[styles.th, { width: 270 }]}>Sản Phẩm & Lô</Text>
            <Text style={[styles.th, { width: 160 }]}>Tổng Tiền</Text>
            <Text style={[styles.th, { width: 180 }]}>Trạng Thái (Đổi Trực Tiếp)</Text>
            <Text style={[styles.th, { width: 150 }]}>Nợ / Cọc</Text>
            <Text style={[styles.th, { width: 180 }]}>Ghi Chú</Text>
            <Text style={[styles.th, { width: 140, textAlign: 'center' }]}>Thao Tác</Text>
          </View>

          {/* Table Rows */}
          {filteredOrders.length === 0 ? (
            <View style={styles.emptyBox}>
              <FileText size={40} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>Không tìm thấy đơn hàng nào phù hợp với tìm kiếm</Text>
            </View>
          ) : (
            filteredOrders.map((ord, idx) => {
              const stStyle = getStatusBadgeStyle(ord.status);
              const StIcon = stStyle.icon;
              const totalVal = ord.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0) + (ord.isFreeship ? 0 : ord.shippingFee);

              return (
                <View key={ord.id} style={[styles.tr, idx % 2 === 1 && styles.trEven]}>
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
                  <View style={[styles.td, { width: 220 }]}>
                    <Text style={styles.customerName}>{ord.customerName}</Text>
                    {ord.customerPhone ? (
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                        <Phone size={14} color={COLORS.textMuted} style={{ marginRight: 6 }} />
                        <Text style={styles.customerPhone}>{ord.customerPhone}</Text>
                      </View>
                    ) : null}
                  </View>

                  {/* Products */}
                  <View style={[styles.td, { width: 270 }]}>
                    {ord.items.map((it, i) => (
                      <Text key={i} style={styles.itemSummaryText} numberOfLines={2}>
                        • [{it.sku}] {it.productName} (x{it.quantity})
                      </Text>
                    ))}
                  </View>

                  {/* Total */}
                  <View style={[styles.td, { width: 140 }]}>
                    <Text style={styles.totalPriceText}>{formatCurrency(totalVal)}</Text>
                    <Text style={styles.payMethodText}>{ord.paymentMethod}</Text>
                  </View>

                  {/* Interactive Status Dropdown */}
                  <View style={[styles.td, { width: 160 }]}>
                    <View style={[styles.statusDropdownContainer, { backgroundColor: stStyle.bg }]}>
                      <StIcon size={15} color={stStyle.text} style={{ marginRight: 6 }} />
                      <select
                        value={ord.status}
                        onChange={(e) => setOrderStatus(ord.id, e.target.value)}
                        style={{
                          backgroundColor: 'transparent',
                          border: 'none',
                          color: stStyle.text,
                          fontWeight: '800',
                          fontSize: '13px',
                          outline: 'none',
                          cursor: 'pointer',
                          paddingVertical: '4px'
                        }}
                      >
                        <option value="Chờ xử lý" style={{ background: '#1e293b', color: '#f8fafc' }}>Chờ xử lý</option>
                        <option value="Đã chốt" style={{ background: '#1e293b', color: '#f8fafc' }}>Đã chốt</option>
                        <option value="Đang giao" style={{ background: '#1e293b', color: '#f8fafc' }}>Đang giao</option>
                        <option value="Đã giao" style={{ background: '#1e293b', color: '#f8fafc' }}>Đã giao (Trừ kho)</option>
                        <option value="Hoàn/Hủy" style={{ background: '#1e293b', color: '#f8fafc' }}>Hoàn/Hủy</option>
                      </select>
                    </View>
                  </View>

                  {/* Debt / Deposit */}
                  <View style={[styles.td, { width: 130 }]}>
                    {ord.remainingDebt > 0 ? (
                      <View>
                        <Text style={styles.debtVal}>Nợ: {formatCurrency(ord.remainingDebt)}</Text>
                        <Text style={styles.depositVal}>Cọc: {formatCurrency(ord.depositAmount)}</Text>
                      </View>
                    ) : (
                      <Text style={styles.noDebtText}>✅ Hết nợ</Text>
                    )}
                  </View>

                  {/* Notes */}
                  <View style={[styles.td, { width: 160 }]}>
                    <Text style={styles.notesText} numberOfLines={2}>{ord.orderNotes || 'Không'}</Text>
                  </View>

                  {/* Actions: Edit & Delete Buttons */}
                  <View style={[styles.td, { width: 130, flexDirection: 'row', justifyContent: 'center', gap: 8 }]}>
                    <TouchableOpacity style={styles.bigEditBtn} onPress={() => handleEdit(ord)}>
                      <Edit2 size={16} color={COLORS.primaryLight} style={{ marginRight: 4 }} />
                      <Text style={{ color: COLORS.primaryLight, fontWeight: '700', fontSize: 13 }}>Sửa</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.bigDeleteBtn} onPress={() => handleDelete(ord)}>
                      <Trash2 size={16} color={COLORS.danger} style={{ marginRight: 4 }} />
                      <Text style={{ color: COLORS.danger, fontWeight: '700', fontSize: 13 }}>Xóa</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

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
    backgroundColor: COLORS.bgDark
  },
  topBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  filterCard: {
    backgroundColor: COLORS.cardDark,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 16,
    gap: 14
  },
  largeSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: COLORS.cardBorder
  },
  largeSearchInput: {
    flex: 1,
    color: COLORS.textMain,
    fontSize: 15,
    paddingVertical: 14,
    outlineStyle: 'none'
  },
  clearSearchBtn: {
    padding: 6,
    backgroundColor: COLORS.surfaceHover,
    borderRadius: 6
  },
  filterChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    alignItems: 'center'
  },
  chipGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  chipGroupLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSub,
    marginRight: 4
  },
  largeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: COLORS.cardBorder
  },
  largeChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary
  },
  largeChipText: {
    fontSize: 13,
    color: COLORS.textMuted
  },
  largeChipTextActive: {
    color: '#ffffff',
    fontWeight: '800'
  },
  tableScrollView: {
    backgroundColor: COLORS.cardDark,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    overflow: 'hidden'
  },
  table: {
    minWidth: 1400
  },
  trHeader: {
    flexDirection: 'row',
    backgroundColor: '#162032',
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.cardBorder,
    paddingVertical: 14,
    paddingHorizontal: 12
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
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b'
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
    fontWeight: '700',
    color: COLORS.textMain
  },
  customerPhone: {
    fontSize: 13,
    color: COLORS.textMuted
  },
  platformBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start'
  },
  platformText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primaryLight
  },
  socialUser: {
    fontSize: 13,
    color: COLORS.textSub,
    marginTop: 4
  },
  itemSummaryText: {
    fontSize: 13,
    color: COLORS.textSub
  },
  totalPriceText: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.textMain
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
    paddingVertical: 6,
    borderRadius: 10
  },
  debtVal: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.danger
  },
  depositVal: {
    fontSize: 12,
    color: COLORS.statusPending
  },
  noDebtText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.success
  },
  notesText: {
    fontSize: 13,
    color: COLORS.textMuted
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
    padding: 60,
    alignItems: 'center',
    gap: 12
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 15,
    fontWeight: '600'
  }
});
