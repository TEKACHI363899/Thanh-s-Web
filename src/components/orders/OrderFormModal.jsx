import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from '../common/RNBridge';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../theme/colors';
import { ShoppingCart, User, Phone, MapPin, Share2, DollarSign, Truck, Calendar, Link as LinkIcon, Plus, Trash2, X, Check, Search, ChevronLeft, ChevronRight, ArrowRight, AlertCircle } from 'lucide-react';
import { formatCurrencyInput, parseCurrencyInput } from '../../utils/formatters';

export const OrderFormModal = ({ visible, onClose, initialOrder = null }) => {
  const { products, batches, addOrder, updateOrder } = useData();
  const { requireAdmin } = useAuth();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [platform, setPlatform] = useState('IG');
  const [socialUsername, setSocialUsername] = useState('');

  const [selectedItems, setSelectedItems] = useState([]);

  const [shippingFee, setShippingFee] = useState(30000);
  const [isFreeship, setIsFreeship] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('COD');

  const [orderType, setOrderType] = useState('Có sẵn');
  const [sourceLink, setSourceLink] = useState('');
  const [depositAmount, setDepositAmount] = useState(0);
  const [estimatedArrivalDate, setEstimatedArrivalDate] = useState('');

  const [status, setStatus] = useState('Chờ xử lý');
  const [orderNotes, setOrderNotes] = useState('');

  // 4-Step Wizard Navigation State
  const [currentStep, setCurrentStep] = useState(1);
  const [stepErrorMsg, setStepErrorMsg] = useState('');
  const [showValidation, setShowValidation] = useState(false);

  // Search & Filter state for picking products from warehouse
  const [prodSearchTerm, setProdSearchTerm] = useState('');
  const [prodCatFilter, setProdCatFilter] = useState('ALL');
  const [prodBatchFilter, setProdBatchFilter] = useState('ALL');

  useEffect(() => {
    setCurrentStep(1); // Reset to Step 1 on open
    setStepErrorMsg('');
    setShowValidation(false);
    if (initialOrder) {
      setCustomerName(initialOrder.customerName || '');
      setCustomerPhone(initialOrder.customerPhone || '');
      setCustomerAddress(initialOrder.customerAddress || '');
      setPlatform(initialOrder.platform || 'IG');
      setSocialUsername(initialOrder.socialUsername || '');
      setSelectedItems(initialOrder.items || []);
      setShippingFee(Number(initialOrder.shippingFee || 0));
      setIsFreeship(!!initialOrder.isFreeship);
      setPaymentMethod(initialOrder.paymentMethod || 'COD');
      setOrderType(initialOrder.orderType || 'Có sẵn');
      setSourceLink(initialOrder.sourceLink || '');
      setDepositAmount(Number(initialOrder.depositAmount || 0));
      setEstimatedArrivalDate(initialOrder.estimatedArrivalDate || '');
      setStatus(initialOrder.status || 'Chờ xử lý');
      setOrderNotes(initialOrder.orderNotes || '');
    } else {
      setCustomerName('');
      setCustomerPhone('');
      setCustomerAddress('');
      setPlatform('IG');
      setSocialUsername('');
      setShippingFee(30000);
      setIsFreeship(false);
      setPaymentMethod('COD');
      setOrderType('Có sẵn');
      setSourceLink('');
      setDepositAmount(0);
      setEstimatedArrivalDate('');
      setStatus('Chờ xử lý');
      setOrderNotes('');
      setProdSearchTerm('');
      setProdCatFilter('ALL');
      setProdBatchFilter('ALL');
      if (initialOrder) {
        setSelectedItems(initialOrder.items || []);
      } else {
        const inStockProducts = products.filter(p => p.stock > 0);
        if (inStockProducts.length > 0) {
          const defaultP = inStockProducts[0];
          setSelectedItems([{
            productId: defaultP.id,
            sku: defaultP.sku,
            productName: defaultP.name,
            batchId: defaultP.batchId,
            quantity: 1,
            unitPrice: defaultP.sellingPrice,
            unitCost: defaultP.costPrice,
            note: ''
          }]);
        } else {
          setSelectedItems([]);
        }
      }
    }
  }, [initialOrder, visible]);

  const handleAddItem = () => {
    const inStockProducts = products.filter(p => p.stock > 0);
    if (inStockProducts.length === 0) {
      alert('⚠️ Không thể thêm sản phẩm mới! Tất cả sản phẩm trong kho hiện tại đều đã HẾT HÀNG (Tồn kho = 0). Vui lòng nạp thêm lô hàng trước!');
      return;
    }
    const defaultP = inStockProducts[0];
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
          const isCurrentlySelectedInInitial = initialOrder && initialOrder.items && initialOrder.items.some(it => it.productId === foundP.id);
          if (foundP.stock <= 0 && !isCurrentlySelectedInInitial) {
            alert(`⚠️ Sản phẩm "${foundP.name}" (${foundP.sku}) đã HẾT HÀNG trong kho (Tồn: 0). Không thể chọn vào đơn hàng!`);
            return copy;
          }
          copy[index] = {
            ...copy[index],
            productId: foundP.id,
            sku: foundP.sku,
            productName: foundP.name,
            batchId: foundP.batchId,
            unitPrice: foundP.sellingPrice,
            unitCost: foundP.costPrice,
            quantity: 1
          };
        }
      } else if (field === 'quantity') {
        const valNum = parseInt(value, 10) || 1;
        const currentProd = products.find(p => p.id === copy[index].productId);
        if (currentProd) {
          const prevOrderedQty = initialOrder && initialOrder.items ? (initialOrder.items.find(it => it.productId === currentProd.id)?.quantity || 0) : 0;
          const maxAllowed = currentProd.stock + prevOrderedQty;

          if (valNum > maxAllowed) {
            alert(`⚠️ Số lượng nhập (${valNum}) vượt quá tồn kho khả dụng (${maxAllowed}) của sản phẩm "${currentProd.name}"! Tự động điều chỉnh về ${maxAllowed}.`);
            copy[index].quantity = Math.max(1, maxAllowed);
          } else {
            copy[index].quantity = Math.max(1, valNum);
          }
        } else {
          copy[index].quantity = Math.max(1, valNum);
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

  // Field Error Getters
  const getCustomerNameError = () => {
    const trimmed = customerName.trim();
    if (!trimmed) return 'Tên khách hàng không được để trống!';
    if (/^\d+$/.test(trimmed)) return 'Tên khách hàng không thể chỉ là chữ số!';
    if (trimmed.length < 2) return 'Tên khách hàng quá ngắn (Cần ít nhất 2 ký tự)!';
    return '';
  };

  const getCustomerPhoneError = () => {
    if (customerPhone.trim() && !/^[0-9\s+.-]{8,15}$/.test(customerPhone.trim())) {
      return 'Số điện thoại không hợp lệ (Cần từ 8 - 15 chữ số)!';
    }
    return '';
  };

  // Step 1 Validation Helper
  const validateStep1 = () => {
    const nameErr = getCustomerNameError();
    if (nameErr) return { isValid: false, error: `⚠️ ${nameErr}` };
    const phoneErr = getCustomerPhoneError();
    if (phoneErr) return { isValid: false, error: `⚠️ ${phoneErr}` };
    return { isValid: true, error: '' };
  };

  // Step 2 Validation Helper
  const validateStep2 = () => {
    if (selectedItems.length === 0) {
      return { isValid: false, error: '⚠️ Đơn hàng cần chọn ít nhất 1 sản phẩm!' };
    }
    for (const item of selectedItems) {
      if (!item.productId) {
        return { isValid: false, error: '⚠️ Vui lòng chọn sản phẩm cho từng món hàng!' };
      }
      if (!item.quantity || item.quantity <= 0) {
        return { isValid: false, error: '⚠️ Số lượng sản phẩm phải lớn hơn 0!' };
      }
      const p = products.find(prod => prod.id === item.productId);
      if (p) {
        const prevOrderedQty = initialOrder && initialOrder.items ? (initialOrder.items.find(it => it.productId === p.id)?.quantity || 0) : 0;
        const maxAllowed = p.stock + prevOrderedQty;
        if (item.quantity > maxAllowed) {
          return { isValid: false, error: `⚠️ Sản phẩm "${p.name}" chỉ còn tồn kho ${maxAllowed} sản phẩm!` };
        }
      }
    }
    return { isValid: true, error: '' };
  };

  // Step 3 Validation Helper
  const validateStep3 = () => {
    if (shippingFee < 0) {
      return { isValid: false, error: '⚠️ Phí vận chuyển không thể là số âm!' };
    }
    if (depositAmount < 0) {
      return { isValid: false, error: '⚠️ Tiền cọc trước không thể là số âm!' };
    }
    return { isValid: true, error: '' };
  };

  // Computed Step Checkmarks & Validations
  const step1Valid = validateStep1().isValid;
  const step2Valid = step1Valid && validateStep2().isValid;
  const step3Valid = step2Valid && validateStep3().isValid;
  const step4Valid = step3Valid;

  const handleSubmit = () => {
    requireAdmin(() => {
      setShowValidation(true);
      const v1 = validateStep1();
      if (!v1.isValid) {
        setStepErrorMsg(v1.error);
        setCurrentStep(1);
        return;
      }
      const v2 = validateStep2();
      if (!v2.isValid) {
        setStepErrorMsg(v2.error);
        setCurrentStep(2);
        return;
      }
      const v3 = validateStep3();
      if (!v3.isValid) {
        setStepErrorMsg(v3.error);
        setCurrentStep(3);
        return;
      }

      const payload = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerAddress: customerAddress.trim(),
        platform,
        socialUsername: socialUsername.trim(),
        items: selectedItems,
        shippingFee: actualShip,
        isFreeship,
        paymentMethod,
        orderType,
        sourceLink: '',
        depositAmount: deposit,
        remainingDebt: remainingDebt,
        estimatedArrivalDate: '',
        status,
        orderNotes: orderNotes.trim()
      };

      if (initialOrder) {
        updateOrder(initialOrder.id, payload);
      } else {
        addOrder(payload);
      }

      onClose();
    }, 'Vui lòng đăng nhập Admin để lưu đơn hàng!');
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
            {initialOrder ? `✏️ Chỉnh Sửa Đơn Hàng ${initialOrder.code}` : '➕ Tạo đơn hàng'}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Horizontal Step Progress Bar */}
        <View style={styles.wizardProgressBar}>
          {[
            { id: 1, title: '1. Khách Hàng', isComplete: step1Valid },
            { id: 2, title: '2. Chọn Sản Phẩm', isComplete: step2Valid },
            { id: 3, title: '3. Ship & Thanh Toán', isComplete: step3Valid },
            { id: 4, title: '4. Trạng Thái', isComplete: step4Valid }
          ].map((s, idx, arr) => {
            const isCurrent = currentStep === s.id;
            const isCompleted = s.isComplete;

            return (
              <React.Fragment key={s.id}>
                <TouchableOpacity
                  style={[
                    styles.wizardStepBtn,
                    isCurrent && styles.wizardStepBtnActive,
                    isCompleted && styles.wizardStepBtnCompleted
                  ]}
                  onPress={() => {
                    // Check validation if trying to jump forward
                    if (s.id > currentStep) {
                      setShowValidation(true);
                      if (currentStep === 1) {
                        const v1 = validateStep1();
                        if (!v1.isValid) { setStepErrorMsg(v1.error); return; }
                      }
                      if (currentStep === 2 || s.id > 2) {
                        const v2 = validateStep2();
                        if (!v2.isValid) { setStepErrorMsg(v2.error); return; }
                      }
                      if (currentStep === 3 || s.id > 3) {
                        const v3 = validateStep3();
                        if (!v3.isValid) { setStepErrorMsg(v3.error); return; }
                      }
                    }
                    setStepErrorMsg('');
                    setCurrentStep(s.id);
                  }}
                >
                  <View style={[styles.wizardStepBadge, isCurrent && styles.wizardStepBadgeActive, isCompleted && styles.wizardStepBadgeCompleted]}>
                    <Text style={[styles.wizardStepBadgeText, (isCurrent || isCompleted) && { color: '#ffffff' }]}>
                      {isCompleted ? '✓' : s.id}
                    </Text>
                  </View>
                  <Text style={[styles.wizardStepText, isCurrent && styles.wizardStepTextActive]}>
                    {s.title}
                  </Text>
                </TouchableOpacity>

                {idx < arr.length - 1 && (
                  <View style={styles.wizardArrow}>
                    <Text style={{ color: isCompleted ? COLORS.primaryLight : COLORS.cardBorder, fontSize: 13, fontWeight: '700' }}>➔</Text>
                  </View>
                )}
              </React.Fragment>
            );
          })}
        </View>

        <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
          {/* STEP 1: Thông Tin Khách Hàng */}
          {currentStep === 1 && (
            <View>
              <Text style={styles.sectionHeader}>👤 1. Thông Tin Khách Hàng</Text>
              
              {/* Red Error Banner */}
              {stepErrorMsg ? (
                <View style={styles.inlineErrorBanner}>
                  <AlertCircle size={16} color="#ef4444" style={{ marginRight: 8 }} />
                  <Text style={styles.inlineErrorBannerText}>{stepErrorMsg}</Text>
                </View>
              ) : null}

              <View style={styles.grid2}>
                <View style={styles.col}>
                  <Text style={styles.label}>Tên khách hàng *:</Text>
                  <TextInput
                    style={[
                      styles.input,
                      showValidation && getCustomerNameError() ? styles.inputErrorHighlight : null
                    ]}
                    placeholder="Ví dụ: Nguyễn Thị Mai"
                    placeholderTextColor={COLORS.textMuted}
                    value={customerName}
                    onChangeText={(text) => {
                      setCustomerName(text);
                      if (stepErrorMsg) setStepErrorMsg('');
                    }}
                  />
                  {showValidation && getCustomerNameError() ? (
                    <Text style={styles.fieldErrorText}>❌ {getCustomerNameError()}</Text>
                  ) : null}
                </View>

                <View style={styles.col}>
                  <Text style={styles.label}>Số điện thoại:</Text>
                  <TextInput
                    style={[
                      styles.input,
                      showValidation && getCustomerPhoneError() ? styles.inputErrorHighlight : null
                    ]}
                    keyboardType="phone-pad"
                    placeholder="0987654321"
                    placeholderTextColor={COLORS.textMuted}
                    value={customerPhone}
                    onChangeText={(text) => {
                      setCustomerPhone(text);
                      if (stepErrorMsg) setStepErrorMsg('');
                    }}
                  />
                  {showValidation && getCustomerPhoneError() ? (
                    <Text style={styles.fieldErrorText}>❌ {getCustomerPhoneError()}</Text>
                  ) : null}
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
            </View>
          )}

          {/* STEP 2: Chọn Sản Phẩm Từ Các Lô Hàng */}
          {currentStep === 2 && (
            <View>
              {stepErrorMsg ? (
                <View style={styles.inlineErrorBanner}>
                  <AlertCircle size={16} color="#ef4444" style={{ marginRight: 8 }} />
                  <Text style={styles.inlineErrorBannerText}>{stepErrorMsg}</Text>
                </View>
              ) : null}

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text style={styles.sectionHeader}>📦 2. Chọn Sản Phẩm Từ Các Lô Hàng</Text>
                <TouchableOpacity style={styles.addItemBtn} onPress={handleAddItem}>
                  <Plus size={14} color="#ffffff" style={{ marginRight: 4 }} />
                  <Text style={styles.addItemBtnText}>Thêm Món Mới</Text>
                </TouchableOpacity>
              </View>

              {/* Search & Filter Toolbar for Product Selection */}
              <View style={styles.pickerFilterToolbar}>
                <View style={styles.pickerSearchInputBox}>
                  <Search size={16} color={COLORS.primaryLight} style={{ marginRight: 8 }} />
                  <TextInput
                    style={styles.pickerSearchInput}
                    placeholder="🔍 Nhập Tên sản phẩm hoặc Mã SKU để lọc tìm..."
                    placeholderTextColor={COLORS.textMuted}
                    value={prodSearchTerm}
                    onChangeText={setProdSearchTerm}
                  />
                  {prodSearchTerm ? (
                    <TouchableOpacity onPress={() => setProdSearchTerm('')}>
                      <X size={14} color={COLORS.textMuted} />
                    </TouchableOpacity>
                  ) : null}
                </View>

                <View style={styles.pickerFilterChipsRow}>
                  {['ALL', 'TS', 'QA'].map(cat => (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.pickerFilterChip, prodCatFilter === cat && styles.pickerFilterChipActive]}
                      onPress={() => setProdCatFilter(cat)}
                    >
                      <Text style={[styles.pickerFilterChipText, prodCatFilter === cat && styles.pickerFilterChipTextActive]}>
                        {cat === 'ALL' ? 'Tất cả loại' : (cat === 'TS' ? 'Trang Sức (TS)' : 'Quần Áo (QA)')}
                      </Text>
                    </TouchableOpacity>
                  ))}

                  <select
                    value={prodBatchFilter}
                    onChange={(e) => setProdBatchFilter(e.target.value)}
                    style={styles.pickerBatchSelect}
                  >
                    <option value="ALL" style={{ background: '#1e293b', color: '#f8fafc' }}>📦 Tất cả Lô Hàng</option>
                    {batches.map(b => (
                      <option key={b.id} value={b.id} style={{ background: '#1e293b', color: '#f8fafc' }}>
                        [{b.code}] {b.name}
                      </option>
                    ))}
                  </select>
                </View>
              </View>

              {selectedItems.map((item, index) => {
                const term = prodSearchTerm.toLowerCase().trim();
                const filteredPickerProducts = products.filter(p => {
                  const matchesSearch = !term || p.name.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term);
                  const matchesCat = prodCatFilter === 'ALL' || p.category === prodCatFilter;
                  const matchesBatch = prodBatchFilter === 'ALL' || p.batchId === prodBatchFilter;
                  const isSelected = item.productId === p.id;
                  return isSelected || (matchesSearch && matchesCat && matchesBatch);
                });

                return (
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
                      {filteredPickerProducts.length === 0 ? (
                        <Text style={styles.pickerEmptyText}>Không tìm thấy sản phẩm phù hợp với bộ lọc...</Text>
                      ) : (
                        filteredPickerProducts.map(p => {
                          const isOutOfStock = p.stock <= 0;
                          const isSelected = item.productId === p.id;
                          const batchObj = batches.find(b => b.id === p.batchId);
                          const batchCode = batchObj ? batchObj.code : '';
                          return (
                            <TouchableOpacity
                              key={p.id}
                              disabled={isOutOfStock && !isSelected}
                              style={[
                                styles.prodChip,
                                isSelected && styles.prodChipActive,
                                isOutOfStock && !isSelected && styles.prodChipDisabled
                              ]}
                              onPress={() => {
                                if (isOutOfStock && !isSelected) {
                                  alert(`⚠️ Sản phẩm "${p.name}" (${p.sku}) đã HẾT HÀNG trong kho (Tồn: 0). Vui lòng chọn sản phẩm khác hoặc tạo lô hàng mới!`);
                                  return;
                                }
                                handleUpdateItem(index, 'productId', p.id);
                              }}
                            >
                              <Text style={[
                                styles.prodChipText,
                                isSelected && styles.prodChipTextActive,
                                isOutOfStock && !isSelected && styles.prodChipTextDisabled
                              ]}>
                                {batchCode ? `[${batchCode}] ` : ''}[{p.sku}] {p.name} - {formatCurrency(p.sellingPrice)} {isOutOfStock ? '❌ (HẾT HÀNG)' : `(Tồn: ${p.stock})`}
                              </Text>
                            </TouchableOpacity>
                          );
                        })
                      )}
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
                          placeholder="0"
                          placeholderTextColor={COLORS.textMuted}
                          value={formatCurrencyInput(item.unitPrice)}
                          onChangeText={(val) => handleUpdateItem(index, 'unitPrice', parseCurrencyInput(val))}
                        />
                      </View>
                    </View>

                    <Text style={styles.label}>Ghi chú món này:</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Ghi chú size, màu sắc, gói quà..."
                      placeholderTextColor={COLORS.textMuted}
                      value={item.note}
                      onChangeText={(val) => handleUpdateItem(index, 'note', val)}
                    />
                  </View>
                );
              })}
            </View>
          )}

          {/* STEP 3: Vận Chuyển & Thanh Toán */}
          {currentStep === 3 && (
            <View>
              <Text style={styles.sectionHeader}>🚚 3. Vận Chuyển & Thanh Toán</Text>
              <View style={styles.grid2}>
                <View style={styles.col}>
                  <Text style={styles.label}>Phí vận chuyển (VND):</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={COLORS.textMuted}
                    value={formatCurrencyInput(shippingFee)}
                    onChangeText={(val) => setShippingFee(parseCurrencyInput(val))}
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
                      onPress={() => {
                        setPaymentMethod('Chuyển khoản full');
                        setDepositAmount(grandTotal);
                      }}
                    >
                      <Text style={[styles.payChipText, paymentMethod === 'Chuyển khoản full' && styles.payChipTextActive]}>
                        💳 CK Full
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Deposit Amount Input Block */}
              <View style={{ marginTop: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={styles.label}>Tiền khách cọc trước (VND):</Text>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    <TouchableOpacity
                      style={styles.quickDepositBtn}
                      onPress={() => setDepositAmount(Math.round((subtotal * 0.3) / 1000) * 1000)}
                    >
                      <Text style={styles.quickDepositBtnText}>Cọc 30%</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.quickDepositBtn}
                      onPress={() => setDepositAmount(Math.round((subtotal * 0.5) / 1000) * 1000)}
                    >
                      <Text style={styles.quickDepositBtnText}>Cọc 50%</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.quickDepositBtn}
                      onPress={() => setDepositAmount(grandTotal)}
                    >
                      <Text style={styles.quickDepositBtnText}>Full 100%</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <TextInput
                  style={[styles.input, { borderColor: COLORS.statusPending, fontWeight: '700', color: COLORS.statusPending, fontSize: 15, marginTop: 4 }]}
                  keyboardType="numeric"
                  placeholder="0 (Nhập số tiền khách cọc trước nếu có...)"
                  placeholderTextColor={COLORS.textMuted}
                  value={formatCurrencyInput(depositAmount)}
                  onChangeText={(val) => setDepositAmount(parseCurrencyInput(val))}
                />
              </View>
            </View>
          )}

          {/* STEP 4: Trạng Thái Đơn Hàng & Ghi Chú */}
          {currentStep === 4 && (
            <View>
              <Text style={styles.sectionHeader}>🔄 4. Trạng Thái Đơn Hàng & Ghi Chú</Text>
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
                style={[styles.input, { height: 80 }]}
                multiline
                placeholder="Nhập ghi chú giao giờ hành chính, liên hệ trước..."
                placeholderTextColor={COLORS.textMuted}
                value={orderNotes}
                onChangeText={setOrderNotes}
              />
            </View>
          )}

          {/* Sticky Summary Card (Always visible across all steps) */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>1. Tiền Hàng:</Text>
              <Text style={[styles.summaryVal, { fontWeight: '800', color: COLORS.success }]}>{formatCurrency(subtotal)}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>2. Phí Ship:</Text>
              <Text style={styles.summaryVal}>{isFreeship ? 'Freeship' : formatCurrency(actualShip)}</Text>
            </View>

            {deposit > 0 && (
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: COLORS.statusPending }]}>3. Đã Cọc Trước:</Text>
                <Text style={[styles.summaryVal, { color: COLORS.statusPending, fontWeight: '800' }]}>- {formatCurrency(deposit)}</Text>
              </View>
            )}

            <View style={[styles.summaryRow, { borderTopWidth: 1, borderTopColor: COLORS.cardBorder, paddingTop: 6, marginTop: 4 }]}>
              <Text style={styles.summaryGrandTitle}>
                {deposit > 0 ? 'COD CẦN THU:' : 'TỔNG THU HỘ:'}
              </Text>
              <Text style={[styles.summaryGrandVal, { color: remainingDebt > 0 ? COLORS.danger : COLORS.success }]}>
                {formatCurrency(remainingDebt)}
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Wizard Footer Navigation Bar */}
        <View style={styles.footer}>
          {currentStep > 1 ? (
            <TouchableOpacity 
              style={styles.wizardBackBtn} 
              onPress={() => setCurrentStep(currentStep - 1)}
            >
              <ChevronLeft size={16} color={COLORS.textMain} style={{ marginRight: 4 }} />
              <Text style={styles.wizardBackBtnText}>Quay Lại</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Hủy Thao Tác</Text>
            </TouchableOpacity>
          )}

          {currentStep < 4 ? (
            <TouchableOpacity 
              style={styles.wizardNextBtn} 
              onPress={() => {
                if (currentStep === 1) {
                  const v1 = validateStep1();
                  if (!v1.isValid) { alert(v1.error); return; }
                }
                if (currentStep === 2) {
                  const v2 = validateStep2();
                  if (!v2.isValid) { alert(v2.error); return; }
                }
                if (currentStep === 3) {
                  const v3 = validateStep3();
                  if (!v3.isValid) { alert(v3.error); return; }
                }
                setCurrentStep(currentStep + 1);
              }}
            >
              <Text style={styles.wizardNextBtnText}>
                Tiếp Theo (Bước {currentStep + 1})
              </Text>
              <ChevronRight size={16} color="#ffffff" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
              <Check size={18} color="#ffffff" style={{ marginRight: 6 }} />
              <Text style={styles.submitBtnText}>
                {initialOrder ? 'Lưu Thay Đổi Đơn Hàng' : 'Hoàn Tất & Lưu Đơn Hàng'}
              </Text>
            </TouchableOpacity>
          )}
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
    height: 640,
    maxHeight: '90vh',
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
    paddingVertical: 14,
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
    flex: 1,
    overflowY: 'auto'
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
  pickerFilterToolbar: {
    backgroundColor: '#162032',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginTop: 8,
    marginBottom: 12,
    gap: 8
  },
  pickerSearchInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: COLORS.cardBorder
  },
  pickerSearchInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 13,
    color: '#f8fafc'
  },
  pickerFilterChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap'
  },
  pickerFilterChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: COLORS.cardBorder
  },
  pickerFilterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary
  },
  pickerFilterChipText: {
    fontSize: 12,
    color: COLORS.textMuted
  },
  pickerFilterChipTextActive: {
    color: '#ffffff',
    fontWeight: '700'
  },
  pickerBatchSelect: {
    backgroundColor: '#0f172a',
    border: '1px solid #334155',
    color: '#f8fafc',
    borderRadius: '6px',
    paddingHorizontal: '8px',
    paddingVertical: '5px',
    fontSize: '12px',
    fontWeight: '600',
    outline: 'none',
    cursor: 'pointer'
  },
  pickerEmptyText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    padding: 8
  },
  selectProductBox: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
    maxHeight: 160,
    overflowY: 'auto',
    paddingRight: 4
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
  prodChipDisabled: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderColor: 'rgba(51, 65, 85, 0.5)',
    opacity: 0.6
  },
  prodChipText: {
    fontSize: 12,
    color: COLORS.textMuted
  },
  prodChipTextActive: {
    color: COLORS.textMain,
    fontWeight: '600'
  },
  prodChipTextDisabled: {
    color: '#64748b',
    textDecorationLine: 'line-through'
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
  quickDepositBtn: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: COLORS.statusPending,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  quickDepositBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.statusPending
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
    justifyContent: 'space-between',
    alignItems: 'center',
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
    backgroundColor: COLORS.success
  },
  submitBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14
  },
  wizardProgressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#162032',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder
  },
  wizardStepBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent'
  },
  wizardStepBtnActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderColor: COLORS.primaryLight
  },
  wizardStepBtnCompleted: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)'
  },
  wizardStepBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    justifyContent: 'center',
    alignItems: 'center'
  },
  wizardStepBadgeActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary
  },
  wizardStepBadgeCompleted: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success
  },
  wizardStepBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted
  },
  wizardStepText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted
  },
  wizardStepTextActive: {
    color: COLORS.textMain,
    fontWeight: '800'
  },
  wizardArrow: {
    paddingHorizontal: 2
  },
  wizardBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#334155'
  },
  wizardBackBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13
  },
  wizardNextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: COLORS.primary
  },
  wizardNextBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13
  },
  inlineErrorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14
  },
  inlineErrorBannerText: {
    color: '#ef4444',
    fontSize: 13,
    fontWeight: '700',
    flex: 1
  },
  inputErrorHighlight: {
    borderColor: '#ef4444',
    backgroundColor: 'rgba(239, 68, 68, 0.08)'
  },
  fieldErrorText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 4
  }
});
