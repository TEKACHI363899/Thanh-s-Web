import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ScrollView } from '../common/RNBridge';
import { useData, generatePrefixFromCategoryName } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../theme/colors';
import { Package, Tag, DollarSign, Percent, X, Check, Info, Upload, Trash2, Image as ImageIcon, Plus } from 'lucide-react';
import { formatCurrencyInput, parseCurrencyInput } from '../../utils/formatters';

export const ProductFormModal = ({ visible, onClose, initialProduct = null }) => {
  const { batches, customCategories, addCustomCategory, deleteCustomCategory, addProduct, updateProduct, generateNextSKU } = useData();
  const { requireAdmin } = useAuth();

  const [category, setCategory] = useState('TS');
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [batchId, setBatchId] = useState('');
  const [image, setImage] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef(null);
  const [costPrice, setCostPrice] = useState(0);
  const [marginPercent, setMarginPercent] = useState(30);
  const [sellingPrice, setSellingPrice] = useState(0);
  const [stock, setStock] = useState(1);
  const [isManualPrice, setIsManualPrice] = useState(false);

  // Custom Category State
  const [showAddCustomCat, setShowAddCustomCat] = useState(false);
  const [customCatName, setCustomCatName] = useState('');
  const [customCatPrefix, setCustomCatPrefix] = useState('');

  const handleCreateCustomCategory = () => {
    requireAdmin(() => {
      if (!customCatName.trim()) {
        alert('Vui lòng nhập Tên loại mặt hàng mới!');
        return;
      }
      const createdCat = addCustomCategory(customCatName, customCatPrefix);
      setCategory(createdCat.code);
      setSku(generateNextSKU(createdCat.code, createdCat.prefix));
      setShowAddCustomCat(false);
      setCustomCatName('');
      setCustomCatPrefix('');
    }, 'Vui lòng đăng nhập Admin để tạo loại mặt hàng mới!');
  };

  const handleDeleteCategory = (cat) => {
    requireAdmin(() => {
      if (window.confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn phân loại SKU "${cat.name}" (${cat.prefix}) khỏi hệ thống?`)) {
        deleteCustomCategory(cat.code);
        if (category === cat.code) {
          setCategory('TS');
          setSku(generateNextSKU('TS'));
        }
      }
    }, 'Vui lòng đăng nhập Admin để xóa phân loại SKU!');
  };

  // Read file and convert to Base64
  const handleFileRead = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('Vui lòng chọn hoặc kéo thả đúng tệp hình ảnh (PNG, JPG, WEBP)!');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileRead(e.dataTransfer.files[0]);
    }
  };

  const handlePaste = (e) => {
    const items = (e.clipboardData || e.originalEvent?.clipboardData)?.items;
    if (!items) return;
    for (let index = 0; index < items.length; index++) {
      const item = items[index];
      if (item.type.indexOf('image') !== -1) {
        e.preventDefault();
        const blob = item.getAsFile();
        handleFileRead(blob);
        break;
      }
    }
  };

  // Attach global paste listener when modal is visible
  useEffect(() => {
    if (!visible) return;
    const onPasteWindow = (e) => handlePaste(e);
    window.addEventListener('paste', onPasteWindow);
    return () => {
      window.removeEventListener('paste', onPasteWindow);
    };
  }, [visible]);

  const [showValidation, setShowValidation] = useState(false);
  const [stepErrorMsg, setStepErrorMsg] = useState('');

  useEffect(() => {
    setShowValidation(false);
    setStepErrorMsg('');
    if (initialProduct) {
      setCategory(initialProduct.category || 'TS');
      setSku(initialProduct.sku || '');
      setName(initialProduct.name || '');
      setBatchId(initialProduct.batchId || (batches.length > 0 ? batches[0].id : ''));
      setImage(initialProduct.image || '');
      setCostPrice(initialProduct.costPrice || '');
      setMarginPercent(initialProduct.marginPercent || 30);
      setSellingPrice(initialProduct.sellingPrice || '');
      setStock(initialProduct.stock || 1);
      setIsManualPrice(true);
    } else {
      setCategory('TS');
      setSku(generateNextSKU('TS'));
      setName('');
      setBatchId(batches.length > 0 ? batches[0].id : '');
      setImage('');
      setCostPrice(''); // Default empty for new products
      setMarginPercent(30);
      setSellingPrice('');
      setStock(1);
      setIsManualPrice(false);
    }
  }, [initialProduct, visible, batches]);

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    if (!initialProduct) {
      setSku(generateNextSKU(cat));
    }
  };

  const handleCostPriceChange = (val) => {
    setCostPrice(val);
    if (stepErrorMsg) setStepErrorMsg('');
    if (!isManualPrice) {
      recalculateSellingPrice(val, marginPercent);
    }
  };

  const handleMarginChange = (val) => {
    setMarginPercent(val);
    if (!isManualPrice) {
      recalculateSellingPrice(costPrice, val);
    }
  };

  const recalculateSellingPrice = (costVal, marginVal) => {
    const cost = Number(costVal) || 0;
    const margin = parseFloat(marginVal) || 0;
    if (cost > 0) {
      const rawPrice = cost * (1 + margin / 100);
      const rounded = Math.round(rawPrice / 1000) * 1000;
      setSellingPrice(rounded);
    } else {
      setSellingPrice('');
    }
  };

  const getNameError = () => {
    if (!name.trim()) return 'Tên sản phẩm không được để trống!';
    return '';
  };

  const getCostPriceError = () => {
    const num = Number(costPrice);
    if (!costPrice || isNaN(num) || num <= 0) {
      return 'Vui lòng nhập Giá Gốc sản phẩm (phải lớn hơn 0 VNĐ)!';
    }
    return '';
  };

  const handleSubmit = () => {
    requireAdmin(() => {
      setShowValidation(true);
      const nameErr = getNameError();
      if (nameErr) {
        setStepErrorMsg(`⚠️ ${nameErr}`);
        return;
      }

      const costErr = getCostPriceError();
      if (costErr) {
        setStepErrorMsg(`⚠️ ${costErr}`);
        return;
      }

      const payload = {
        category,
        sku,
        name: name.trim(),
        batchId,
        image: image || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&q=80',
        costPrice: Number(costPrice) || 0,
        marginPercent: Number(marginPercent) || 0,
        sellingPrice: Number(sellingPrice) || Number(costPrice) || 0,
        stock: Number(stock) || 0
      };

      if (initialProduct) {
        updateProduct(initialProduct.id, payload);
      } else {
        addProduct(payload);
      }

      onClose();
    }, 'Vui lòng đăng nhập Admin để lưu sản phẩm!');
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.modalContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {initialProduct ? '✏️ Chỉnh Sửa Sản Phẩm' : '➕ Thêm Sản Phẩm Mới'}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
          {stepErrorMsg ? (
            <View style={styles.inlineErrorBanner}>
              <Text style={styles.inlineErrorBannerText}>{stepErrorMsg}</Text>
            </View>
          ) : null}

          <Text style={styles.label}>1. Phân loại sản phẩm (SKU tự động tăng):</Text>
          <View style={styles.categoryRow}>
            {customCategories.map(cat => {
              const isDefault = cat.code === 'TS' || cat.code === 'QA';
              return (
                <View key={cat.code} style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TouchableOpacity 
                    style={[styles.catBadge, category === cat.code && styles.catBadgeTSActive]} 
                    onPress={() => handleCategoryChange(cat.code)}
                  >
                    <Text style={[styles.catBadgeText, category === cat.code && styles.catTextActive]}>
                      {cat.icon || '📦'} {cat.name} ({cat.prefix || cat.code})
                    </Text>

                    {!isDefault && (
                      <TouchableOpacity 
                        style={styles.deleteCatIconBtn}
                        onPress={(e) => {
                          e.stopPropagation();
                          handleDeleteCategory(cat);
                        }}
                        title="Xóa phân loại SKU này khỏi hệ thống"
                      >
                        <X size={13} color="#ef4444" />
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                </View>
              );
            })}

            <TouchableOpacity 
              style={styles.addCustomCatTriggerBtn}
              onPress={() => setShowAddCustomCat(!showAddCustomCat)}
            >
              <Plus size={15} color={COLORS.primaryLight} style={{ marginRight: 4 }} />
              <Text style={styles.addCustomCatTriggerText}>➕ Thêm loại mới</Text>
            </TouchableOpacity>
          </View>

          {/* INLINE FORM CREATING NEW CUSTOM CATEGORY */}
          {showAddCustomCat && (
            <View style={styles.addCustomCatCard}>
              <Text style={styles.addCustomCatTitle}>✨ Thêm Loại Mặt Hàng Mới (Tự Động Sinh Mã Prefix SKU)</Text>
              
              <Text style={styles.label}>Tên Loại Mặt Hàng Mới *:</Text>
              <TextInput
                style={styles.input}
                placeholder="Ví dụ: Móc Khóa, Nước Hoa, Túi Xách..."
                placeholderTextColor={COLORS.textMuted}
                value={customCatName}
                onChangeText={(val) => {
                  setCustomCatName(val);
                  setCustomCatPrefix(generatePrefixFromCategoryName(val));
                }}
              />

              <View style={styles.grid2}>
                <View style={styles.col}>
                  <Text style={styles.label}>Mã Prefix SKU (Lấy chữ cái đầu):</Text>
                  <TextInput
                    style={[styles.input, { fontWeight: '800', color: COLORS.accent }]}
                    placeholder="MK"
                    placeholderTextColor={COLORS.textMuted}
                    value={customCatPrefix}
                    onChangeText={(val) => setCustomCatPrefix(val.toUpperCase())}
                  />
                </View>

                <View style={styles.col}>
                  <Text style={styles.label}>Mã SKU mẫu tiếp theo:</Text>
                  <View style={styles.previewSkuBadge}>
                    <Text style={styles.previewSkuText}>
                      {customCatPrefix ? `${customCatPrefix.toUpperCase()}001` : 'MK001'}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                <TouchableOpacity style={styles.confirmAddCatBtn} onPress={handleCreateCustomCategory}>
                  <Check size={16} color="#ffffff" style={{ marginRight: 6 }} />
                  <Text style={styles.confirmAddCatText}>Tạo Phân Loại & Dùng Ngay</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.cancelAddCatBtn} onPress={() => setShowAddCustomCat(false)}>
                  <Text style={styles.cancelAddCatText}>Hủy</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.skuBox}>
            <Tag size={16} color={COLORS.primaryLight} />
            <Text style={styles.skuText}>Mã SKU Tự Động: </Text>
            <Text style={[styles.skuCode, { color: COLORS.primaryLight }]}>
              {sku}
            </Text>
          </View>

          <Text style={styles.label}>2. Tên sản phẩm *:</Text>
          <TextInput
            style={[
              styles.input,
              showValidation && getNameError() ? styles.inputErrorHighlight : null
            ]}
            placeholder="Ví dụ: Dây chuyền bạc Ý S925, Áo sơ mi lụa..."
            placeholderTextColor={COLORS.textMuted}
            value={name}
            onChangeText={(val) => {
              setName(val);
              if (stepErrorMsg) setStepErrorMsg('');
            }}
          />
          {showValidation && getNameError() ? (
            <Text style={styles.fieldErrorText}>❌ {getNameError()}</Text>
          ) : null}

          <Text style={styles.label}>3. Gắn vào Lô hàng (Đợt nhập):</Text>
          <View style={styles.selectBox}>
            {batches.map(b => (
              <TouchableOpacity
                key={b.id}
                style={[styles.batchChip, batchId === b.id && styles.batchChipActive]}
                onPress={() => setBatchId(b.id)}
              >
                <Text style={[styles.batchChipText, batchId === b.id && styles.batchChipTextActive]}>
                  📦 {b.code} - {b.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>4. Hình ảnh sản phẩm (Kéo thả tệp hoặc Dán Ctrl+V):</Text>
          
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            style={{
              border: isDragging ? `2px dashed ${COLORS.primaryLight}` : `2px dashed ${COLORS.cardBorder}`,
              backgroundColor: isDragging ? 'rgba(59, 130, 246, 0.15)' : '#0f172a',
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              marginBottom: '10px'
            }}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileRead(e.target.files[0]);
                }
              }}
            />

            {image ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <img
                  src={image}
                  alt="Product preview"
                  style={{
                    maxHeight: '160px',
                    maxWidth: '100%',
                    borderRadius: '8px',
                    objectFit: 'cover',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                  }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '12px', color: COLORS.success, fontWeight: '600' }}>
                    ✓ Đã tải ảnh thành công
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setImage('');
                    }}
                    style={{
                      backgroundColor: 'rgba(239, 68, 68, 0.2)',
                      border: '1px solid #ef4444',
                      color: '#ef4444',
                      borderRadius: '6px',
                      padding: '4px 8px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    🗑️ Xóa ảnh
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <Upload size={28} color={COLORS.primaryLight} />
                <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: COLORS.textMain }}>
                  Kéo & thả ảnh vào đây, hoặc <span style={{ color: COLORS.primaryLight }}>bấm để chọn tệp</span>
                </p>
                <p style={{ margin: 0, fontSize: '12px', color: COLORS.textMuted }}>
                  💡 Mẹo: Chụp màn hình / Copy ảnh rồi bấm <strong style={{ color: COLORS.statusPending }}>Ctrl + V</strong> để dán trực tiếp
                </p>
              </div>
            )}
          </div>

          <Text style={[styles.label, { fontSize: 12, color: COLORS.textMuted }]}>Hoặc chèn Link URL ảnh từ internet:</Text>
          <TextInput
            style={styles.input}
            placeholder="https://images.unsplash.com/..."
            placeholderTextColor={COLORS.textMuted}
            value={image}
            onChangeText={setImage}
          />

          <View style={styles.priceSection}>
            <Text style={styles.sectionTitle}>💰 Thiết Lập Giá Cả & Lợi Nhuận</Text>

            <View style={styles.grid2}>
              <View style={styles.col}>
                <Text style={styles.label}>Giá gốc (Nhập VNĐ) *:</Text>
                <TextInput
                  style={[
                    styles.input,
                    showValidation && getCostPriceError() ? styles.inputErrorHighlight : null
                  ]}
                  keyboardType="numeric"
                  placeholder="Nhập giá gốc (VD: 150.000)..."
                  placeholderTextColor={COLORS.textMuted}
                  value={costPrice ? formatCurrencyInput(costPrice) : ''}
                  onChangeText={(val) => handleCostPriceChange(parseCurrencyInput(val))}
                />
                {showValidation && getCostPriceError() ? (
                  <Text style={styles.fieldErrorText}>❌ {getCostPriceError()}</Text>
                ) : null}
              </View>

              <View style={styles.col}>
                <Text style={styles.label}>% Lợi nhuận mong muốn:</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder="50"
                  placeholderTextColor={COLORS.textMuted}
                  value={marginPercent}
                  onChangeText={handleMarginChange}
                />
              </View>
            </View>

            <View style={{ marginTop: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={styles.label}>Giá bán tự động / Sửa tay (VNĐ):</Text>
                {isManualPrice && (
                  <TouchableOpacity onPress={() => {
                    setIsManualPrice(false);
                    recalculateSellingPrice(costPrice, marginPercent);
                  }}>
                    <Text style={{ color: COLORS.primaryLight, fontSize: 12 }}>🔄 Khôi phục tính tự động</Text>
                  </TouchableOpacity>
                )}
              </View>

              <TextInput
                style={[styles.input, styles.priceInputHighlight]}
                keyboardType="numeric"
                placeholder="0 VNĐ"
                placeholderTextColor={COLORS.textMuted}
                value={formatCurrencyInput(sellingPrice)}
                onChangeText={(val) => {
                  setSellingPrice(parseCurrencyInput(val));
                  setIsManualPrice(true);
                }}
              />

              <View style={styles.calcFormulaNote}>
                <Info size={14} color={COLORS.primaryLight} style={{ marginRight: 6 }} />
                <Text style={styles.calcFormulaText}>
                  Công thức: Giá bán = Giá gốc × (1 + % Lợi nhuận / 100). Đã làm tròn số.
                </Text>
              </View>
            </View>
          </View>

          <Text style={styles.label}>5. Số lượng nhập vào tồn kho:</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="10"
            placeholderTextColor={COLORS.textMuted}
            value={stock}
            onChangeText={setStock}
          />
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelBtnText}>Hủy Bỏ</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <Check size={18} color="#ffffff" style={{ marginRight: 6 }} />
            <Text style={styles.submitBtnText}>
              {initialProduct ? 'Cập Nhật Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
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
    maxWidth: 620,
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
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSub,
    marginBottom: 8,
    marginTop: 14
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 12
  },
  catBadge: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#0f172a',
    borderWidth: 1.5,
    borderColor: COLORS.cardBorder,
    alignItems: 'center'
  },
  catBadgeTSActive: {
    borderColor: COLORS.categoryTS,
    backgroundColor: 'rgba(236, 72, 153, 0.15)'
  },
  catBadgeQAActive: {
    borderColor: COLORS.categoryQA,
    backgroundColor: 'rgba(6, 182, 212, 0.15)'
  },
  catBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted
  },
  catTextActive: {
    color: COLORS.textMain,
    fontWeight: '700'
  },
  skuBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: COLORS.cardBorder
  },
  skuText: {
    color: COLORS.textMuted,
    fontSize: 13,
    marginLeft: 8
  },
  skuCode: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1
  },
  input: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: COLORS.textMain,
    fontSize: 14,
    outlineStyle: 'none'
  },
  priceInputHighlight: {
    borderColor: COLORS.primary,
    fontSize: 16,
    fontWeight: '700',
    color: '#60a5fa'
  },
  selectBox: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  batchChip: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.cardBorder
  },
  batchChipActive: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(59, 130, 246, 0.2)'
  },
  batchChipText: {
    fontSize: 13,
    color: COLORS.textMuted
  },
  batchChipTextActive: {
    color: COLORS.textMain,
    fontWeight: '600'
  },
  imagePreviewContainer: {
    marginTop: 10,
    alignItems: 'center',
    backgroundColor: '#0f172a',
    padding: 10,
    borderRadius: 10
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    resizeMode: 'cover'
  },
  imageCaption: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 6
  },
  priceSection: {
    backgroundColor: '#141e2e',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginTop: 16
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primaryLight,
    marginBottom: 8
  },
  grid2: {
    flexDirection: 'row',
    gap: 12
  },
  col: {
    flex: 1
  },
  calcFormulaNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6
  },
  calcFormulaText: {
    fontSize: 12,
    color: COLORS.textMuted
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
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceHover,
    borderWidth: 1,
    borderColor: COLORS.cardBorder
  },
  cancelBtnText: {
    color: COLORS.textSub,
    fontWeight: '700',
    fontSize: 14
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
  },
  submitBtnText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 15
  },
  inlineErrorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
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
    marginTop: 4
  },
  addCustomCatTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    borderWidth: 1,
    borderColor: COLORS.primaryLight
  },
  addCustomCatTriggerText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primaryLight
  },
  addCustomCatCard: {
    backgroundColor: '#162032',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    marginBottom: 14,
    boxShadow: '0 4px 16px rgba(0,0,0,0.3)'
  },
  addCustomCatTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primaryLight,
    marginBottom: 10
  },
  previewSkuBadge: {
    backgroundColor: '#0f172a',
    borderWidth: 1.5,
    borderColor: COLORS.accent,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  previewSkuText: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.accent
  },
  confirmAddCatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8
  },
  confirmAddCatText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800'
  },
  cancelAddCatBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceHover
  },
  cancelAddCatText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '700'
  },
  deleteCatIconBtn: {
    marginLeft: 6,
    padding: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)'
  }
});
