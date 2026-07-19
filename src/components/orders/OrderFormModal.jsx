import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from '../common/RNBridge';
import { useData } from '../../context/DataContext';
import { COLORS } from '../../theme/colors';
import { ShoppingCart, User, Phone, MapPin, Share2, DollarSign, Truck, Calendar, Link as LinkIcon, Plus, Trash2, X, Check } from 'lucide-react';

export const OrderFormModal = ({ visible, onClose, initialOrder = null }) => {
  const { products, batches, addOrder, updateOrder } = useData();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [platform, setPlatform] = useState('IG');
  const [socialUsername, setSocialUsername] = useState('');

  const [selectedItems, setSelectedItems] = useState([]);

  const [shippingFee, setShippingFee] = useState('30000');
  const [isFreeship, setIsFreeship] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('COD');

  const [orderType, setOrderType] = useState('Có sẵn');
  const [sourceLink, setSourceLink] = useState('');
  const [depositAmount, setDepositAmount] = useState('0');
  const [estimatedArrivalDate, setEstimatedArrivalDate] = useState('');

  const [status, setStatus] = useState('Chờ xử lý');
  const [orderNotes, setOrderNotes] = useState('');

  useEffect(() => {
    if (initialOrder) {
      setCustomerName(initialOrder.customerName || '');
      setCustomerPhone(initialOrder.customerPhone || '');
      setCustomerAddress(initialOrder.customerAddress || '');
      setPlatform(initialOrder.platform || 'IG');
      setSocialUsername(initialOrder.socialUsername || '');
      setSelectedItems(initialOrder.items || []);
      setShippingFee(String(initialOrder.shippingFee || '0'));
      setIsFreeship(!!initialOrder.isFreeship);
      setPaymentMethod(initialOrder.paymentMethod || 'COD');
      setOrderType(initialOrder.orderType || 'Có sẵn');
      setSourceLink(initialOrder.sourceLink || '');
      setDepositAmount(String(initialOrder.depositAmount || '0'));
      setEstimatedArrivalDate(initialOrder.estimatedArrivalDate || '');
      setStatus(initialOrder.status || 'Chờ xử lý');
      setOrderNotes(initialOrder.orderNotes || '');
    } else {
      setCustomerName('');
      setCustomerPhone('');
      setCustomerAddress('');
      setPlatform('IG');
      setSocialUsername('');
      setSelectedItems(products.length > 0 ? [{
        productId: products[0].id,
        sku: products[0].sku,
        productName: products[0].name,
        batchId: products[0].batchId,
        quantity: 1,
        unitPrice: products[0].sellingPrice,
        unitCost: products[0].costPrice,
        note: ''
      }] : []);
      setShippingFee('30000');
      setIsFreeship(false);
      setPaymentMethod('COD');
      setOrderType('Có sẵn');
      setSourceLink('');
      setDepositAmount('0');
      setEstimatedArrivalDate('');
      setStatus('Chờ xử lý');
      setOrderNotes('');
    }
  }, [initialOrder, visible]);

  const handleAddItem = () => {
    if (!products.length) return;
    const defaultP = products[0];
    setSelectedItems(prev => [...prev, {
      productId: defaultP.id,
      sku: defaultP.sku,
      productName: defaultP.name,
      batchId: defaultP.batchId,
      quantity: 1,
      unitPrice: defaultP.sellingPrice,
      unitCost: defaultP.costPrice,
      note: ''
    }]);
  };

  const handleUpdateItem = (index, field, value) => {
    setSelectedItems(prev => {
      const copy = [...prev];
      if (field === 'productId') {
        const foundP = products.find(p => p.id === value);
        if (foundP) {
          copy[index] = {
            ...copy[index],
            productId: foundP.id,
            sku: foundP.sku,
            productName: foundP.name,
            batchId: foundP.batchId,
            unitPrice: foundP.sellingPrice,
            unitCost: foundP.costPrice
          };
        }
      } else {
        copy[index] = { ...copy[index], [field]: value };
      }
      return copy;
    });
  };

  const handleRemoveItem = (index) => {
    setSelectedItems(prev => prev.filter((_, i) => i !== index));
  };

  const subtotal = selectedItems.reduce((sum, item) => sum + (Number(item.unitPrice) * (Number(item.quantity) || 1)), 0);
  const actualShip = isFreeship ? 0 : (Number(shippingFee) || 0);
  const grandTotal = subtotal + actualShip;
  const deposit = Number(depositAmount) || 0;
  const remainingDebt = Math.max(0, grandTotal - deposit);

  const handleSubmit = () => {
    if (!customerName.trim()) {
      alert('Vui lòng nhập Tên khách hàng!');
      return;
    }
    if (selectedItems.length === 0) {
      alert('Đơn hàng cần có ít nhất 1 sản phẩm!');
      return;
    }

    const payload = {
      customerName,
      customerPhone,
      customerAddress,
      platform,
      socialUsername,
      items: selectedItems,
      shippingFee: Number(shippingFee) || 0,
      isFreeship,
      paymentMethod,
      orderType,
      sourceLink: orderType === 'Order' ? sourceLink : '',
      depositAmount: deposit,
      remainingDebt: remainingDebt,
      estimatedArrivalDate: orderType === 'Order' ? estimatedArrivalDate : '',
      status,
      orderNotes
    };

    if (initialOrder) {
      updateOrder(initialOrder.id, payload);
    } else {
      addOrder(payload);
    }

    onClose();
  };

  const formatCurrency = (val) => {
    return (Number(val) || 0).toLocaleString('vi-VN') + ' đ';
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.modalContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {initialOrder ? `✏️ Chỉnh Sửa Đơn Hàng ${initialOrder.code}` : '➕ Tạo Đơn Hàng Mới'}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionHeader}>👤 1. Thông Tin Khách Hàng</Text>
          <View style={styles.grid2}>
            <View style={styles.col}>
              <Text style={styles.label}>Tên khách hàng *:</Text>
              <TextInput
                style={styles.input}
                placeholder="Ví dụ: Nguyễn Thị Mai"
                placeholderTextColor={COLORS.textMuted}
                value={customerName}
                onChangeText={setCustomerName}
              />
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>Số điện thoại:</Text>
              <TextInput
                style={styles.input}
                keyboardType="phone-pad"
                placeholder="0987654321"
                placeholderTextColor={COLORS.textMuted}
                value={customerPhone}
                onChangeText={setCustomerPhone}
              />
            </View>
          </View>

          <Text style={styles.label}>Địa chỉ giao hàng:</Text>
          <TextInput
            style={styles.input}
            placeholder="Số nhà, Tên đường, Phường/Xã, Quận/Huyện, TP..."
            placeholderTextColor={COLORS.textMuted}
            value={customerAddress}
            onChangeText={setCustomerAddress}
          />

          <View style={styles.grid2}>
            <View style={styles.col}>
              <Text style={styles.label}>Nguồn khách (Nền tảng):</Text>
              <View style={styles.platformSelector}>
                {['IG', 'FB', 'Threads', 'TikTok', 'Khác'].map(p => (
                  <TouchableOpacity
                    key={p}
                    style={[styles.platformChip, platform === p && styles.platformChipActive]}
                    onPress={() => setPlatform(p)}
                  >
                    <Text style={[styles.platformChipText, platform === p && styles.platformChipTextActive]}>
                      {p}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>Username / Nickname đối chiếu:</Text>
              <TextInput
                style={styles.input}
                placeholder="Ví dụ: @mainguyen_99, FB Mai Nguyễn"
                placeholderTextColor={COLORS.textMuted}
                value={socialUsername}
                onChangeText={setSocialUsername}
              />
            </View>
          </View>

          <Text style={styles.sectionHeader}>🏷️ 2. Phân Loại Đơn Hàng & Đơn Order</Text>
          <View style={styles.typeSelectorRow}>
            <TouchableOpacity
              style={[styles.typeBadge, orderType === 'Có sẵn' && styles.typeBadgeInStockActive]}
              onPress={() => setOrderType('Có sẵn')}
            >
              <Text style={[styles.typeBadgeText, orderType === 'Có sẵn' && styles.typeBadgeTextActive]}>
                ✅ Đơn Hàng Có Sẵn
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.typeBadge, orderType === 'Order' && styles.typeBadgeOrderActive]}
              onPress={() => setOrderType('Order')}
            >
              <Text style={[styles.typeBadgeText, orderType === 'Order' && styles.typeBadgeTextActive]}>
                📦 Đơn Hàng Order (Hàng về sau)
              </Text>
            </TouchableOpacity>
          </View>

          {orderType === 'Order' && (
            <View style={styles.orderTypeDetailsCard}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: COLORS.statusPending, marginBottom: 8 }}>
                📌 Thông Tin Đặt Hàng Order & Công Nợ:
              </Text>

              <Text style={styles.label}>Link / Nguồn hàng Order:</Text>
              <TextInput
                style={styles.input}
                placeholder="Link Taobao, 1688, Shopee, IG xưởng..."
                placeholderTextColor={COLORS.textMuted}
                value={sourceLink}
                onChangeText={setSourceLink}
              />

              <View style={styles.grid2}>
                <View style={styles.col}>
                  <Text style={styles.label}>Tiền khách cọc trước (VND):</Text>
                  <TextInput
                    style={[styles.input, { borderColor: COLORS.statusPending, fontWeight: '700', color: COLORS.statusPending }]}
                    keyboardType="numeric"
                    placeholder="200000"
                    placeholderTextColor={COLORS.textMuted}
                    value={depositAmount}
                    onChangeText={setDepositAmount}
                  />
                </View>

                <View style={styles.col}>
                  <Text style={styles.label}>Số tiền còn nợ (Tự động tính):</Text>
                  <View style={styles.debtDisplayBox}>
                    <Text style={styles.debtDisplayText}>{formatCurrency(remainingDebt)}</Text>
                  </View>
                </View>
              </View>

              <Text style={styles.label}>Ngày dự kiến hàng về kho:</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD (Ví dụ: 2026-07-25)"
                placeholderTextColor={COLORS.textMuted}
                value={estimatedArrivalDate}
                onChangeText={setEstimatedArrivalDate}
              />
            </View>
          )}

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
            <Text style={styles.sectionHeader}>🛍️ 3. Chọn Sản Phẩm Từ Kho Hàng</Text>
            <TouchableOpacity style={styles.addItemBtn} onPress={handleAddItem}>
              <Plus size={14} color="#ffffff" style={{ marginRight: 4 }} />
              <Text style={styles.addItemBtnText}>Thêm Sản Phẩm</Text>
            </TouchableOpacity>
          </View>

          {selectedItems.map((item, index) => (
            <View key={index} style={styles.itemCard}>
              <View style={styles.itemRow1}>
                <Text style={styles.itemIndex}>Món #{index + 1}:</Text>
                {selectedItems.length > 1 && (
                  <TouchableOpacity onPress={() => handleRemoveItem(index)}>
                    <Trash2 size={16} color={COLORS.danger} />
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.selectProductBox}>
                {products.map(p => (
                  <TouchableOpacity
                    key={p.id}
                    style={[styles.prodChip, item.productId === p.id && styles.prodChipActive]}
                    onPress={() => handleUpdateItem(index, 'productId', p.id)}
                  >
                    <Text style={[styles.prodChipText, item.productId === p.id && styles.prodChipTextActive]}>
                      [{p.sku}] {p.name} - {formatCurrency(p.sellingPrice)} (Tồn: {p.stock})
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.grid3}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Số lượng:</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    placeholder="1"
                    placeholderTextColor={COLORS.textMuted}
                    value={String(item.quantity)}
                    onChangeText={(val) => handleUpdateItem(index, 'quantity', val)}
                  />
                </View>

                <View style={{ flex: 2 }}>
                  <Text style={styles.label}>Đơn giá bán (VND):</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    placeholder="150000"
                    placeholderTextColor={COLORS.textMuted}
                    value={String(item.unitPrice)}
                    onChangeText={(val) => handleUpdateItem(index, 'unitPrice', val)}
                  />
                </View>
              </View>

              <Text style={styles.label}>Ghi chú sản phẩm món này:</Text>
              <TextInput
                style={styles.input}
                placeholder="Ghi chú size, màu sắc, gói quà..."
                placeholderTextColor={COLORS.textMuted}
                value={item.note}
                onChangeText={(val) => handleUpdateItem(index, 'note', val)}
              />
            </View>
          ))}

          <Text style={styles.sectionHeader}>🚚 4. Vận Chuyển & Thanh Toán</Text>
          <View style={styles.grid2}>
            <View style={styles.col}>
              <Text style={styles.label}>Phí vận chuyển (VND):</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="30000"
                placeholderTextColor={COLORS.textMuted}
                value={shippingFee}
                onChangeText={setShippingFee}
                editable={!isFreeship}
              />
              <TouchableOpacity 
                style={styles.freeshipToggle} 
                onPress={() => setIsFreeship(!isFreeship)}
              >
                <View style={[styles.checkbox, isFreeship && styles.checkboxActive]}>
                  {isFreeship && <Check size={12} color="#ffffff" />}
                </View>
                <Text style={styles.freeshipText}>Tick chọn Freeship (Miễn phí ship)</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>Hình thức thanh toán:</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  style={[styles.payChip, paymentMethod === 'COD' && styles.payChipActive]}
                  onPress={() => setPaymentMethod('COD')}
                >
                  <Text style={[styles.payChipText, paymentMethod === 'COD' && styles.payChipTextActive]}>
                    💵 COD (Thu hộ)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.payChip, paymentMethod === 'Chuyển khoản full' && styles.payChipActive]}
                  onPress={() => setPaymentMethod('Chuyển khoản full')}
                >
                  <Text style={[styles.payChipText, paymentMethod === 'Chuyển khoản full' && styles.payChipTextActive]}>
                    💳 CK Full
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <Text style={styles.sectionHeader}>🔄 5. Trạng Thái Đơn Hàng & Ghi Chú</Text>
          <Text style={styles.label}>Trạng thái đơn hàng:</Text>
          <View style={styles.statusGrid}>
            {['Chờ xử lý', 'Đã chốt', 'Đang giao', 'Đã giao', 'Hoàn/Hủy'].map(st => (
              <TouchableOpacity
                key={st}
                style={[styles.statusBadgeBtn, status === st && styles.statusBadgeBtnActive]}
                onPress={() => setStatus(st)}
              >
                <Text style={[styles.statusBadgeBtnText, status === st && styles.statusBadgeBtnTextActive]}>
                  {st}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Ghi chú riêng cho đơn hàng này:</Text>
          <TextInput
            style={[styles.input, { height: 60 }]}
            multiline
            placeholder="Nhập ghi chú giao giờ hành chính, liên hệ trước..."
            placeholderTextColor={COLORS.textMuted}
            value={orderNotes}
            onChangeText={setOrderNotes}
          />

          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tiền hàng:</Text>
              <Text style={styles.summaryVal}>{formatCurrency(subtotal)}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Phí ship:</Text>
              <Text style={styles.summaryVal}>{isFreeship ? 'Miễn phí (Freeship)' : formatCurrency(actualShip)}</Text>
            </View>

            <View style={[styles.summaryRow, { borderTopWidth: 1, borderTopColor: COLORS.cardBorder, paddingTop: 8, marginTop: 4 }]}>
              <Text style={styles.summaryGrandTitle}>TỔNG THU ĐƠN HÀNG:</Text>
              <Text style={styles.summaryGrandVal}>{formatCurrency(grandTotal)}</Text>
            </View>

            {orderType === 'Order' && (
              <View style={styles.summaryRow}>
                <Text style={{ color: COLORS.statusPending, fontSize: 13, fontWeight: '700' }}>
                  Đã cọc: {formatCurrency(deposit)} | CÒN NỢ THU COD:
                </Text>
                <Text style={{ color: COLORS.danger, fontSize: 15, fontWeight: '800' }}>
                  {formatCurrency(remainingDebt)}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelBtnText}>Hủy</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <Check size={18} color="#ffffff" style={{ marginRight: 6 }} />
            <Text style={styles.submitBtnText}>
              {initialOrder ? 'Lưu Thay Đổi Đơn Hàng' : 'Tạo Đơn Hàng Mới'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
  modalContainer: {
    width: '100%',
    maxWidth: 760,
    maxHeight: '92vh',
    backgroundColor: COLORS.cardDark,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
    backgroundColor: '#162032'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textMain
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceHover
  },
  body: {
    padding: 20,
    flex: 1
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primaryLight,
    marginBottom: 8,
    marginTop: 14
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSub,
    marginBottom: 6,
    marginTop: 8
  },
  input: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: COLORS.textMain,
    fontSize: 14,
    outlineStyle: 'none'
  },
  grid2: {
    flexDirection: 'row',
    gap: 12
  },
  col: {
    flex: 1
  },
  platformSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6
  },
  platformChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: COLORS.cardBorder
  },
  platformChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary
  },
  platformChipText: {
    fontSize: 12,
    color: COLORS.textMuted
  },
  platformChipTextActive: {
    color: '#ffffff',
    fontWeight: '700'
  },
  typeSelectorRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10
  },
  typeBadge: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#0f172a',
    borderWidth: 1.5,
    borderColor: COLORS.cardBorder,
    alignItems: 'center'
  },
  typeBadgeInStockActive: {
    borderColor: COLORS.success,
    backgroundColor: 'rgba(16, 185, 129, 0.15)'
  },
  typeBadgeOrderActive: {
    borderColor: COLORS.statusPending,
    backgroundColor: 'rgba(245, 158, 11, 0.15)'
  },
  typeBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted
  },
  typeBadgeTextActive: {
    color: COLORS.textMain,
    fontWeight: '700'
  },
  orderTypeDetailsCard: {
    backgroundColor: '#162032',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.statusPending,
    marginBottom: 12
  },
  debtDisplayBox: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: COLORS.danger,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: 'center'
  },
  debtDisplayText: {
    color: COLORS.danger,
    fontWeight: '800',
    fontSize: 14
  },
  addItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8
  },
  addItemBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700'
  },
  itemCard: {
    backgroundColor: '#111c2e',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 10
  },
  itemRow1: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  itemIndex: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMain
  },
  selectProductBox: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8
  },
  prodChip: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.cardBorder
  },
  prodChipActive: {
    borderColor: COLORS.primaryLight,
    backgroundColor: 'rgba(59, 130, 246, 0.2)'
  },
  prodChipText: {
    fontSize: 12,
    color: COLORS.textMuted
  },
  prodChipTextActive: {
    color: COLORS.textMain,
    fontWeight: '600'
  },
  grid3: {
    flexDirection: 'row',
    gap: 10
  },
  freeshipToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8
  },
  checkboxActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary
  },
  freeshipText: {
    fontSize: 13,
    color: COLORS.textSub
  },
  payChip: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    alignItems: 'center'
  },
  payChipActive: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(59, 130, 246, 0.2)'
  },
  payChipText: {
    fontSize: 13,
    color: COLORS.textMuted
  },
  payChipTextActive: {
    color: COLORS.textMain,
    fontWeight: '700'
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6
  },
  statusBadgeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: COLORS.cardBorder
  },
  statusBadgeBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary
  },
  statusBadgeBtnText: {
    fontSize: 13,
    color: COLORS.textMuted
  },
  statusBadgeBtnTextActive: {
    color: '#ffffff',
    fontWeight: '700'
  },
  summaryCard: {
    backgroundColor: '#162032',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginTop: 16,
    gap: 6
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  summaryLabel: {
    fontSize: 13,
    color: COLORS.textMuted
  },
  summaryVal: {
    fontSize: 13,
    color: COLORS.textMain,
    fontWeight: '600'
  },
  summaryGrandTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primaryLight
  },
  summaryGrandVal: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primaryLight
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
    backgroundColor: '#162032'
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceHover
  },
  cancelBtnText: {
    color: COLORS.textSub,
    fontWeight: '600',
    fontSize: 14
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: COLORS.primary
  },
  submitBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14
  }
});
