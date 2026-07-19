import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ScrollView } from '../common/RNBridge';
import { useData } from '../../context/DataContext';
import { COLORS } from '../../theme/colors';
import { Plus, Search, Edit2, Trash2, Tag, Package, AlertTriangle } from 'lucide-react';
import { ProductFormModal } from './ProductFormModal';
import { BatchManagementModal } from '../batches/BatchManagementModal';

export const ProductList = () => {
  const { products, batches, deleteProduct } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedBatch, setSelectedBatch] = useState('ALL');
  
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesBatch = selectedBatch === 'ALL' || p.batchId === selectedBatch;
    return matchesSearch && matchesCategory && matchesBatch;
  });

  const handleEdit = (prod) => {
    setEditingProduct(prod);
    setIsProductModalOpen(true);
  };

  const handleDelete = (prod) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${prod.name}" (${prod.sku})?`)) {
      deleteProduct(prod.id);
    }
  };

  const getBatchName = (batchId) => {
    const found = batches.find(b => b.id === batchId);
    return found ? `${found.code} - ${found.name}` : 'Chưa gắn lô';
  };

  const formatCurrency = (val) => {
    return (Number(val) || 0).toLocaleString('vi-VN') + ' đ';
  };

  return (
    <View style={styles.container}>
      {/* Top Banner Toolbar */}
      <View style={styles.topBanner}>
        <View style={{ flex: 1 }}>
          <Text style={styles.mainTitle}>📦 Quản Lý Sản Phẩm & Tồn Kho</Text>
          <Text style={styles.subtitle}>
            Tự động nhảy SKU riêng cho Trang sức (TS) & Quần áo (QA), tính giá bán & trừ kho tự động
          </Text>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.bigBatchBtn} 
            onPress={() => setIsBatchModalOpen(true)}
          >
            <Package size={20} color="#ffffff" style={{ marginRight: 8 }} />
            <Text style={styles.bigBtnText}>Quản Lý Lô Hàng ({batches.length})</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.bigAddBtn} 
            onPress={() => {
              setEditingProduct(null);
              setIsProductModalOpen(true);
            }}
          >
            <Plus size={22} color="#ffffff" style={{ marginRight: 8 }} />
            <Text style={styles.bigBtnText}>Thêm Sản Phẩm Mới</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Card */}
      <View style={styles.filterCard}>
        <View style={styles.largeSearchBox}>
          <Search size={20} color={COLORS.primaryLight} style={{ marginRight: 10 }} />
          <TextInput
            style={styles.largeSearchInput}
            placeholder="🔍 Tìm theo tên sản phẩm hoặc mã SKU (ví dụ: TS001, QA002)..."
            placeholderTextColor={COLORS.textMuted}
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>

        <View style={styles.filterGroup}>
          <TouchableOpacity 
            style={[styles.largeFilterChip, selectedCategory === 'ALL' && styles.largeFilterChipActive]}
            onPress={() => setSelectedCategory('ALL')}
          >
            <Text style={[styles.largeFilterChipText, selectedCategory === 'ALL' && styles.largeFilterChipTextActive]}>
              Tất cả ({products.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.largeFilterChip, selectedCategory === 'TS' && styles.largeFilterChipTSActive]}
            onPress={() => setSelectedCategory('TS')}
          >
            <Text style={[styles.largeFilterChipText, selectedCategory === 'TS' && styles.largeFilterChipTextActive]}>
              💎 Trang Sức TS ({products.filter(p => p.category === 'TS').length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.largeFilterChip, selectedCategory === 'QA' && styles.largeFilterChipQAActive]}
            onPress={() => setSelectedCategory('QA')}
          >
            <Text style={[styles.largeFilterChipText, selectedCategory === 'QA' && styles.largeFilterChipTextActive]}>
              👔 Quần Áo QA ({products.filter(p => p.category === 'QA').length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Table Data Grid */}
      <ScrollView style={styles.tableContainer} horizontal showsHorizontalScrollIndicator={true}>
        <View style={styles.table}>
          <View style={styles.trHeader}>
            <Text style={[styles.th, { width: 100 }]}>Mã SKU</Text>
            <Text style={[styles.th, { width: 80 }]}>Hình Ảnh</Text>
            <Text style={[styles.th, { width: 240 }]}>Tên Sản Phẩm</Text>
            <Text style={[styles.th, { width: 120 }]}>Phân Loại</Text>
            <Text style={[styles.th, { width: 200 }]}>Lô Hàng Nhập</Text>
            <Text style={[styles.th, { width: 130 }]}>Giá Gốc</Text>
            <Text style={[styles.th, { width: 100 }]}>% Lợi Nhuận</Text>
            <Text style={[styles.th, { width: 140 }]}>Giá Bán</Text>
            <Text style={[styles.th, { width: 110 }]}>Tồn Kho</Text>
            <Text style={[styles.th, { width: 100 }]}>Đã Bán</Text>
            <Text style={[styles.th, { width: 140, textAlign: 'center' }]}>Thao Tác</Text>
          </View>

          {filteredProducts.length === 0 ? (
            <View style={styles.emptyBox}>
              <AlertTriangle size={36} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>Chưa có sản phẩm nào phù hợp với bộ lọc</Text>
            </View>
          ) : (
            filteredProducts.map((prod, index) => (
              <View key={prod.id} style={[styles.tr, index % 2 === 1 && styles.trEven]}>
                <View style={[styles.td, { width: 100 }]}>
                  <View style={[
                    styles.skuBadge, 
                    { backgroundColor: prod.category === 'TS' ? 'rgba(236, 72, 153, 0.2)' : 'rgba(6, 182, 212, 0.2)' }
                  ]}>
                    <Text style={[
                      styles.skuText, 
                      { color: prod.category === 'TS' ? COLORS.categoryTS : COLORS.categoryQA }
                    ]}>
                      {prod.sku}
                    </Text>
                  </View>
                </View>

                <View style={[styles.td, { width: 80 }]}>
                  <Image 
                    source={{ uri: prod.image || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=200&q=80' }} 
                    style={styles.tableImg} 
                  />
                </View>

                <View style={[styles.td, { width: 240 }]}>
                  <Text style={styles.prodName} numberOfLines={2}>{prod.name}</Text>
                </View>

                <View style={[styles.td, { width: 120 }]}>
                  <Text style={styles.catText}>
                    {prod.category === 'TS' ? '💎 Trang Sức' : '👔 Quần Áo'}
                  </Text>
                </View>

                <View style={[styles.td, { width: 200 }]}>
                  <Text style={styles.batchText} numberOfLines={1}>
                    📦 {getBatchName(prod.batchId)}
                  </Text>
                </View>

                <View style={[styles.td, { width: 130 }]}>
                  <Text style={styles.costText}>{formatCurrency(prod.costPrice)}</Text>
                </View>

                <View style={[styles.td, { width: 100 }]}>
                  <Text style={styles.marginText}>+{prod.marginPercent}%</Text>
                </View>

                <View style={[styles.td, { width: 140 }]}>
                  <Text style={styles.sellingPriceText}>{formatCurrency(prod.sellingPrice)}</Text>
                </View>

                <View style={[styles.td, { width: 110 }]}>
                  <View style={[
                    styles.stockBadge,
                    prod.stock === 0 ? styles.stockEmpty : prod.stock < 5 ? styles.stockLow : styles.stockNormal
                  ]}>
                    <Text style={styles.stockText}>
                      {prod.stock === 0 ? 'Hết hàng' : `Còn ${prod.stock}`}
                    </Text>
                  </View>
                </View>

                <View style={[styles.td, { width: 100 }]}>
                  <Text style={styles.soldText}>{prod.soldCount} sp</Text>
                </View>

                <View style={[styles.td, { width: 140, flexDirection: 'row', justifyContent: 'center', gap: 8 }]}>
                  <TouchableOpacity style={styles.bigEditBtn} onPress={() => handleEdit(prod)}>
                    <Edit2 size={16} color={COLORS.primaryLight} style={{ marginRight: 4 }} />
                    <Text style={{ color: COLORS.primaryLight, fontWeight: '700', fontSize: 13 }}>Sửa</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.bigDeleteBtn} onPress={() => handleDelete(prod)}>
                    <Trash2 size={16} color={COLORS.danger} style={{ marginRight: 4 }} />
                    <Text style={{ color: COLORS.danger, fontWeight: '700', fontSize: 13 }}>Xóa</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <ProductFormModal 
        visible={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        initialProduct={editingProduct}
      />

      <BatchManagementModal
        visible={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
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
  actionButtons: {
    flexDirection: 'row',
    gap: 12
  },
  bigBatchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 12
  },
  bigAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12
  },
  bigBtnText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 15
  },
  filterCard: {
    backgroundColor: COLORS.cardDark,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 14
  },
  largeSearchBox: {
    flex: 1,
    minWidth: 320,
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
    paddingVertical: 12,
    outlineStyle: 'none'
  },
  filterGroup: {
    flexDirection: 'row',
    gap: 10
  },
  largeFilterChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: COLORS.cardBorder
  },
  largeFilterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary
  },
  largeFilterChipTSActive: {
    backgroundColor: 'rgba(236, 72, 153, 0.25)',
    borderColor: COLORS.categoryTS
  },
  largeFilterChipQAActive: {
    backgroundColor: 'rgba(6, 182, 212, 0.25)',
    borderColor: COLORS.categoryQA
  },
  largeFilterChipText: {
    fontSize: 14,
    color: COLORS.textMuted
  },
  largeFilterChipTextActive: {
    color: '#ffffff',
    fontWeight: '800'
  },
  tableContainer: {
    backgroundColor: COLORS.cardDark,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    overflow: 'hidden'
  },
  table: {
    minWidth: 1200
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
  skuBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: 'flex-start'
  },
  skuText: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5
  },
  tableImg: {
    width: 48,
    height: 48,
    borderRadius: 10,
    resizeMode: 'cover'
  },
  prodName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textMain
  },
  catText: {
    fontSize: 14,
    color: COLORS.textSub
  },
  batchText: {
    fontSize: 13,
    color: COLORS.textMuted
  },
  costText: {
    fontSize: 14,
    color: COLORS.textMuted
  },
  marginText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.success
  },
  sellingPriceText: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.primaryLight
  },
  stockBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start'
  },
  stockNormal: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)'
  },
  stockLow: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)'
  },
  stockEmpty: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)'
  },
  stockText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textMain
  },
  soldText: {
    fontSize: 14,
    color: COLORS.textSub
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
