import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ScrollView } from '../common/RNBridge';
import { useData } from '../../context/DataContext';
import { COLORS } from '../../theme/colors';
import { Package, Tag, DollarSign, Percent, Percent as ImageIcon, X, Check, Info } from 'lucide-react';
import { formatCurrencyInput, parseCurrencyInput } from '../../utils/formatters';

export const ProductFormModal = ({ visible, onClose, initialProduct = null }) => {
  const { batches, addProduct, updateProduct, generateNextSKU } = useData();

  const [category, setCategory] = useState('TS');
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [batchId, setBatchId] = useState('');
  const [image, setImage] = useState('');
  const [costPrice, setCostPrice] = useState(100000);
  const [marginPercent, setMarginPercent] = useState('50');
  const [sellingPrice, setSellingPrice] = useState(150000);
  const [stock, setStock] = useState('10');
  const [isManualPrice, setIsManualPrice] = useState(false);

  useEffect(() => {
    if (initialProduct) {
      setCategory(initialProduct.category || 'TS');
      setSku(initialProduct.sku || '');
      setName(initialProduct.name || '');
      setBatchId(initialProduct.batchId || '');
      setImage(initialProduct.image || '');
      setCostPrice(Number(initialProduct.costPrice || 0));
      setMarginPercent(String(initialProduct.marginPercent || '50'));
      setSellingPrice(Number(initialProduct.sellingPrice || 0));
      setStock(String(initialProduct.stock || '0'));
      setIsManualPrice(true);
    } else {
      const nextSku = generateNextSKU('TS');
      setCategory('TS');
      setSku(nextSku);
      setName('');
      setBatchId(batches.length > 0 ? batches[0].id : '');
      setImage('https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80');
      setCostPrice(100000);
      setMarginPercent('50');
      setStock('10');
      setIsManualPrice(false);
      setSellingPrice(150000);
    }
  }, [initialProduct, visible]);

  const handleCategoryChange = (newCat) => {
    setCategory(newCat);
    if (!initialProduct) {
      const nextSku = generateNextSKU(newCat);
      setSku(nextSku);
    }
  };

  const handleCostPriceChange = (val) => {
    setCostPrice(val);
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
    const rawPrice = cost * (1 + margin / 100);
    const rounded = Math.round(rawPrice / 1000) * 1000;
    setSellingPrice(rounded);
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      alert('Vui lòng nhập Tên sản phẩm!');
      return;
    }

    const payload = {
      category,
      sku,
      name,
      batchId,
      image: image || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&q=80',
      costPrice: Number(costPrice) || 0,
      marginPercent: Number(marginPercent) || 0,
      sellingPrice: Number(sellingPrice) || 0,
      stock: Number(stock) || 0
    };

    if (initialProduct) {
      updateProduct(initialProduct.id, payload);
    } else {
      addProduct(payload);
    }

    onClose();
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
          <Text style={styles.label}>1. Phân loại sản phẩm (SKU tự động tăng):</Text>
          <View style={styles.categoryRow}>
            <TouchableOpacity 
              style={[styles.catBadge, category === 'TS' && styles.catBadgeTSActive]} 
              onPress={() => handleCategoryChange('TS')}
            >
              <Text style={[styles.catBadgeText, category === 'TS' && styles.catTextActive]}>
                💎 Trang Sức (TS)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.catBadge, category === 'QA' && styles.catBadgeQAActive]} 
              onPress={() => handleCategoryChange('QA')}
            >
              <Text style={[styles.catBadgeText, category === 'QA' && styles.catTextActive]}>
                👔 Quần Áo (QA)
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.skuBox}>
            <Tag size={16} color={category === 'TS' ? COLORS.categoryTS : COLORS.categoryQA} />
            <Text style={styles.skuText}>Mã SKU Tự Động: </Text>
            <Text style={[styles.skuCode, { color: category === 'TS' ? COLORS.categoryTS : COLORS.categoryQA }]}>
              {sku}
            </Text>
          </View>

          <Text style={styles.label}>2. Tên sản phẩm *:</Text>
          <TextInput
            style={styles.input}
            placeholder="Ví dụ: Dây chuyền bạc Ý S925, Áo sơ mi lụa..."
            placeholderTextColor={COLORS.textMuted}
            value={name}
            onChangeText={setName}
          />

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

          <Text style={styles.label}>4. Chèn Link / Hình ảnh sản phẩm:</Text>
          <TextInput
            style={styles.input}
            placeholder="https://images.unsplash.com/..."
            placeholderTextColor={COLORS.textMuted}
            value={image}
            onChangeText={setImage}
          />
          {image ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: image }} style={styles.previewImage} />
              <Text style={styles.imageCaption}>Xem trước hình ảnh sản phẩm</Text>
            </View>
          ) : null}

          <View style={styles.priceSection}>
            <Text style={styles.sectionTitle}>💰 Thiết Lập Giá Cả & Lợi Nhuận</Text>

            <View style={styles.grid2}>
              <View style={styles.col}>
                <Text style={styles.label}>Giá gốc (Hiển thị VNĐ):</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder="0 VNĐ"
                  placeholderTextColor={COLORS.textMuted}
                  value={formatCurrencyInput(costPrice)}
                  onChangeText={(val) => handleCostPriceChange(parseCurrencyInput(val))}
                />
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
