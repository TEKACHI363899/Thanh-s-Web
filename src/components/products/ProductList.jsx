import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image } from '../common/RNBridge';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../theme/colors';
import { Plus, Search, Filter, Layers, Edit2, Trash2, Tag, ChevronDown, CheckCircle, Package, AlertTriangle, X, RotateCcw, ArrowRight, DollarSign, BarChart2, Calendar, FileText } from 'lucide-react';
import { ProductFormModal } from './ProductFormModal';
import { BatchManagementModal } from '../batches/BatchManagementModal';

export const ProductList = () => {
  const { products, batches, deleteProduct, deleteBatch } = useData();
  const { requireAdmin } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedBatch, setSelectedBatch] = useState('ALL');
  const [activeSubTab, setActiveSubTab] = useState('PRODUCTS'); // 'PRODUCTS' or 'BATCHES'

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingBatch, setEditingBatch] = useState(null);

  // Active filter count
  const activeFilterCount = (searchTerm.trim() ? 1 : 0) + 
    (selectedCategory !== 'ALL' ? 1 : 0) + 
    (selectedBatch !== 'ALL' ? 1 : 0);

  const filteredProducts = products.filter(p => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = !term || p.name.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term);
    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesBatch = selectedBatch === 'ALL' || p.batchId === selectedBatch;
    return matchesSearch && matchesCat && matchesBatch;
  });

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('ALL');
    setSelectedBatch('ALL');
  };

  const handleEditProduct = (p) => {
    requireAdmin(() => {
      setEditingProduct(p);
      setIsProductModalOpen(true);
    }, 'Vui lòng đăng nhập Admin để sửa sản phẩm!');
  };

  const handleDeleteProduct = (p) => {
    requireAdmin(() => {
      if (window.confirm(`Xóa sản phẩm "${p.name}" (${p.sku}) khỏi kho?`)) {
        deleteProduct(p.id);
      }
    }, 'Vui lòng đăng nhập Admin để xóa sản phẩm!');
  };

  const handleEditBatch = (b) => {
    requireAdmin(() => {
      setEditingBatch(b);
      setIsBatchModalOpen(true);
    }, 'Vui lòng đăng nhập Admin để sửa lô hàng!');
  };

  const handleDeleteBatch = (b) => {
    requireAdmin(() => {
      if (window.confirm(`Xóa lô hàng "${b.name}" (${b.code})? Tất cả sản phẩm thuộc lô cũng sẽ mất lô liên kết!`)) {
        deleteBatch(b.id);
      }
    }, 'Vui lòng đăng nhập Admin để xóa lô hàng!');
  };

  const formatCurrency = (val) => {
    return (Number(val) || 0).toLocaleString('vi-VN') + ' VNĐ';
  };

  const getBatchName = (batchId) => {
    const b = batches.find(item => item.id === batchId);
    return b ? `[${b.code}] ${b.name}` : 'Không rõ Lô';
  };

  return (
    <View style={styles.container}>
      {/* Top Banner Toolbar */}
      <View style={styles.topBanner}>
        <View style={{ flex: 1 }}>
          <Text style={styles.mainTitle}>Quản Lý Sản Phẩm & Lô Hàng Tồn Kho</Text>
          <Text style={styles.subtitle}>
            Quản lý Trang sức, Quần áo và các Đợt hàng nhập kho • Theo dõi tồn kho thực tế
          </Text>
        </View>

        {/* Action Button depending on active tab */}
        {activeSubTab === 'PRODUCTS' ? (
          <TouchableOpacity 
            style={styles.bigAddBtn} 
            onPress={() => {
              requireAdmin(() => {
                setEditingProduct(null);
                setIsProductModalOpen(true);
              }, 'Vui lòng đăng nhập Admin để thêm sản phẩm mới!');
            }}
          >
            <Plus size={20} color="#ffffff" style={{ marginRight: 8 }} />
            <Text style={styles.bigBtnText}>Thêm Sản Phẩm Mới</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.bigBatchAddBtn} 
            onPress={() => {
              requireAdmin(() => {
                setEditingBatch(null);
                setIsBatchModalOpen(true);
              }, 'Vui lòng đăng nhập Admin để tạo lô hàng mới!');
            }}
          >
            <Package size={20} color="#ffffff" style={{ marginRight: 8 }} />
            <Text style={styles.bigBtnText}>Tạo Lô Hàng Mới</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Smart View Mode Toggle Switcher */}
      <View style={styles.tabSwitcherRow}>
        <TouchableOpacity
          style={[styles.switchTabBtn, activeSubTab === 'PRODUCTS' && styles.switchTabBtnActive]}
          onPress={() => setActiveSubTab('PRODUCTS')}
        >
          <Package size={16} color={activeSubTab === 'PRODUCTS' ? '#ffffff' : COLORS.textMuted} style={{ marginRight: 6 }} />
          <Text style={[styles.switchTabText, activeSubTab === 'PRODUCTS' && styles.switchTabTextActive]}>
            Danh Sách Sản Phẩm ({products.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.switchTabBtn, activeSubTab === 'BATCHES' && styles.switchTabBtnActive]}
          onPress={() => setActiveSubTab('BATCHES')}
        >
          <Layers size={16} color={activeSubTab === 'BATCHES' ? '#ffffff' : COLORS.textMuted} style={{ marginRight: 6 }} />
          <Text style={[styles.switchTabText, activeSubTab === 'BATCHES' && styles.switchTabTextActive]}>
            Danh Sách Lô Hàng Nhập ({batches.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* VIEW 1: PRODUCTS LIST */}
      {activeSubTab === 'PRODUCTS' && (
        <View style={{ flex: 1 }}>
          {/* Compact Search & Single Filter Button */}
          <View style={styles.filterBarRow}>
            <View style={styles.searchBox}>
              <Search size={20} color={COLORS.primaryLight} style={{ marginRight: 10 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="🔍 Tìm nhanh theo tên sản phẩm hoặc mã SKU..."
                placeholderTextColor={COLORS.textMuted}
                value={searchTerm}
                onChangeText={setSearchTerm}
              />
              {searchTerm ? (
                <TouchableOpacity onPress={() => setSearchTerm('')} style={styles.clearSearchIcon}>
                  <X size={16} color={COLORS.textMuted} />
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Single Combined Filter Button */}
            <TouchableOpacity 
              style={[styles.filterTriggerBtn, activeFilterCount > 0 && styles.filterTriggerBtnActive]}
              onPress={() => setIsFilterModalOpen(true)}
            >
              <Filter size={18} color={activeFilterCount > 0 ? '#ffffff' : COLORS.primaryLight} style={{ marginRight: 8 }} />
              <Text style={[styles.filterTriggerText, activeFilterCount > 0 && styles.filterTriggerTextActive]}>
                Bộ Lọc {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
              </Text>
            </TouchableOpacity>

            {activeFilterCount > 0 && (
              <TouchableOpacity style={styles.resetFilterBtn} onPress={resetFilters}>
                <RotateCcw size={16} color={COLORS.textMuted} style={{ marginRight: 4 }} />
                <Text style={styles.resetFilterText}>Đặt lại</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Product Data Grid Table */}
          <ScrollView style={styles.tableContainer} horizontal showsHorizontalScrollIndicator={true}>
            <View style={styles.table}>
              <View style={styles.trHeader}>
                <Text style={[styles.th, { width: 100 }]}>Mã SKU</Text>
                <Text style={[styles.th, { width: 80 }]}>Hình Ảnh</Text>
                <Text style={[styles.th, { width: 240 }]}>Tên Sản Phẩm</Text>
                <Text style={[styles.th, { width: 130 }]}>Phân Loại</Text>
                <Text style={[styles.th, { width: 220 }]}>Lô Hàng Nhập</Text>
                <Text style={[styles.th, { width: 140 }]}>Giá Gốc</Text>
                <Text style={[styles.th, { width: 110 }]}>% Lợi Nhuận</Text>
                <Text style={[styles.th, { width: 150 }]}>Giá Bán</Text>
                <Text style={[styles.th, { width: 120 }]}>Tồn Kho</Text>
                <Text style={[styles.th, { width: 110 }]}>Đã Bán</Text>
                <Text style={[styles.th, { width: 140, textAlign: 'center' }]}>Thao Tác</Text>
              </View>

              {filteredProducts.length === 0 ? (
                <View style={styles.emptyBox}>
                  <AlertTriangle size={36} color={COLORS.textMuted} />
                  <Text style={styles.emptyText}>Chưa có sản phẩm nào phù hợp với bộ lọc</Text>
                </View>
              ) : (
                filteredProducts.map((prod, index) => (
                  <View key={prod.id} style={styles.tr}>
                    <View style={[styles.td, { width: 100 }]}>
                      <View style={[
                        styles.skuBadge,
                        { backgroundColor: prod.category === 'TS' ? 'rgba(236, 72, 153, 0.15)' : 'rgba(6, 182, 212, 0.15)' }
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
                      <Image source={{ uri: prod.image }} style={styles.tableImg} />
                    </View>

                    <View style={[styles.td, { width: 240 }]}>
                      <Text style={styles.prodName} numberOfLines={2}>{prod.name}</Text>
                    </View>

                    <View style={[styles.td, { width: 130 }]}>
                      <Text style={styles.catText}>
                        {prod.category === 'TS' ? '💎 Trang Sức' : '👔 Quần Áo'}
                      </Text>
                    </View>

                    <View style={[styles.td, { width: 220 }]}>
                      <View style={styles.batchTagBadge}>
                        <Package size={14} color={COLORS.accent} style={{ marginRight: 6 }} />
                        <Text style={styles.batchTagText} numberOfLines={1}>
                          {getBatchName(prod.batchId)}
                        </Text>
                      </View>
                    </View>

                    <View style={[styles.td, { width: 140 }]}>
                      <Text style={styles.costText}>{formatCurrency(prod.costPrice)}</Text>
                    </View>

                    <View style={[styles.td, { width: 110 }]}>
                      <Text style={styles.marginText}>+{prod.marginPercent}%</Text>
                    </View>

                    <View style={[styles.td, { width: 150 }]}>
                      <Text style={styles.sellingPriceText}>{formatCurrency(prod.sellingPrice)}</Text>
                    </View>

                    <View style={[styles.td, { width: 120 }]}>
                      <View style={[
                        styles.stockBadge,
                        prod.stock === 0 ? styles.stockEmpty : prod.stock < 5 ? styles.stockLow : styles.stockNormal
                      ]}>
                        <Text style={styles.stockText}>
                          {prod.stock === 0 ? 'Hết hàng' : `Còn ${prod.stock}`}
                        </Text>
                      </View>
                    </View>

                    <View style={[styles.td, { width: 110 }]}>
                      <Text style={styles.soldText}>{prod.soldCount} sp</Text>
                    </View>

                    <View style={[styles.td, { width: 140, flexDirection: 'row', justifyContent: 'center', gap: 8 }]}>
                      <TouchableOpacity style={styles.bigEditBtn} onPress={() => handleEditProduct(prod)}>
                        <Edit2 size={16} color={COLORS.primaryLight} style={{ marginRight: 4 }} />
                        <Text style={{ color: COLORS.primaryLight, fontWeight: '700', fontSize: 13 }}>Sửa</Text>
                      </TouchableOpacity>

                      <TouchableOpacity style={styles.bigDeleteBtn} onPress={() => handleDeleteProduct(prod)}>
                        <Trash2 size={16} color={COLORS.danger} style={{ marginRight: 4 }} />
                        <Text style={{ color: COLORS.danger, fontWeight: '700', fontSize: 13 }}>Xóa</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>
          </ScrollView>
        </View>
      )}

      {/* VIEW 2: BATCHES MANAGEMENT */}
      {activeSubTab === 'BATCHES' && (
        <ScrollView style={styles.batchesScrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.batchSectionHeader}>
            <Text style={styles.batchSectionTitle}>📦 Danh Sách Các Lô Hàng Đã Nhập ({batches.length})</Text>
            <Text style={styles.batchSectionSub}>Quản lý tổng vốn từng lô, số lượng sản phẩm nhập về và hiệu quả kinh doanh</Text>
          </View>

          {batches.length === 0 ? (
            <View style={styles.emptyBox}>
              <Package size={40} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>Chưa có lô hàng nào. Nhấp "Tạo Lô Hàng Mới" để bắt đầu đợt nhập hàng.</Text>
            </View>
          ) : (
            <View style={styles.batchGridContainer}>
              {batches.map(b => {
                const batchProducts = products.filter(p => p.batchId === b.id);
                const totalStockUnits = batchProducts.reduce((acc, curr) => acc + curr.stock, 0);
                const totalSoldUnits = batchProducts.reduce((acc, curr) => acc + curr.soldCount, 0);

                return (
                  <View key={b.id} style={styles.batchCard}>
                    <View style={styles.batchCardHeader}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <View style={styles.batchCodeBadge}>
                          <Text style={styles.batchCodeText}>{b.code}</Text>
                        </View>
                        <View>
                          <Text style={styles.batchNameTitle}>{b.name}</Text>
                          <Text style={styles.batchDateText}>📅 Ngày nhập: {b.importDate}</Text>
                        </View>
                      </View>

                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        <TouchableOpacity 
                          style={styles.batchActionBtnEdit} 
                          onPress={() => setIsBatchModalOpen(true)}
                        >
                          <Edit2 size={15} color={COLORS.primaryLight} style={{ marginRight: 4 }} />
                          <Text style={{ color: COLORS.primaryLight, fontSize: 13, fontWeight: '700' }}>Sửa Lô</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                          style={styles.batchActionBtnDelete} 
                          onPress={() => handleDeleteBatch(b)}
                        >
                          <Trash2 size={15} color={COLORS.danger} style={{ marginRight: 4 }} />
                          <Text style={{ color: COLORS.danger, fontSize: 13, fontWeight: '700' }}>Xóa</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={styles.batchStatsRow}>
                      <View style={styles.statBox}>
                        <Text style={styles.statBoxLabel}>Tổng Vốn Nhập</Text>
                        <Text style={styles.statBoxValCapital}>{formatCurrency(b.totalCapital)}</Text>
                      </View>

                      <View style={styles.statBox}>
                        <Text style={styles.statBoxLabel}>Sản Phẩm Trong Lô</Text>
                        <Text style={styles.statBoxVal}>{batchProducts.length} loại ({totalStockUnits} tồn)</Text>
                      </View>

                      <View style={styles.statBox}>
                        <Text style={styles.statBoxLabel}>Đã Bán Ra</Text>
                        <Text style={styles.statBoxValSold}>{totalSoldUnits} sản phẩm</Text>
                      </View>
                    </View>

                    {b.notes ? (
                      <View style={styles.batchNoteCard}>
                        <Text style={styles.batchNoteText}>📝 Ghi chú: {b.notes}</Text>
                      </View>
                    ) : null}
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      )}

      {/* UNIFIED FILTER MODAL POPUP */}
      {isFilterModalOpen && (
        <View style={styles.overlay}>
          <View style={styles.filterModalCard}>
            <View style={styles.filterModalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Filter size={20} color={COLORS.primaryLight} />
                <Text style={styles.filterModalTitle}>⚡ Bộ Lọc Tìm Kiếm Nâng Cao</Text>
              </View>
              <TouchableOpacity onPress={() => setIsFilterModalOpen(false)} style={styles.closeBtn}>
                <X size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.filterModalBody}>
              {/* 1. Keyword search */}
              <Text style={styles.filterSectionLabel}>1. Tìm kiếm theo tên / SKU:</Text>
              <View style={styles.modalSearchBox}>
                <Search size={18} color={COLORS.primaryLight} style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.modalSearchInput}
                  placeholder="Ví dụ: TS001, Áo Blazer, Dây chuyền..."
                  placeholderTextColor={COLORS.textMuted}
                  value={searchTerm}
                  onChangeText={setSearchTerm}
                />
              </View>

              {/* 2. Category selection */}
              <Text style={styles.filterSectionLabel}>2. Chọn phân loại sản phẩm:</Text>
              <View style={styles.catChipsRow}>
                <TouchableOpacity 
                  style={[styles.modalCatChip, selectedCategory === 'ALL' && styles.modalCatChipActive]}
                  onPress={() => setSelectedCategory('ALL')}
                >
                  <Text style={[styles.modalCatChipText, selectedCategory === 'ALL' && styles.modalCatChipTextActive]}>
                    Tất cả ({products.length})
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.modalCatChip, selectedCategory === 'TS' && styles.modalCatChipTSActive]}
                  onPress={() => setSelectedCategory('TS')}
                >
                  <Text style={[styles.modalCatChipText, selectedCategory === 'TS' && styles.modalCatChipTextActive]}>
                    💎 Trang Sức TS ({products.filter(p => p.category === 'TS').length})
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.modalCatChip, selectedCategory === 'QA' && styles.modalCatChipQAActive]}
                  onPress={() => setSelectedCategory('QA')}
                >
                  <Text style={[styles.modalCatChipText, selectedCategory === 'QA' && styles.modalCatChipTextActive]}>
                    👔 Quần Áo QA ({products.filter(p => p.category === 'QA').length})
                  </Text>
                </TouchableOpacity>
              </View>

              {/* 3. Batch selection */}
              <Text style={styles.filterSectionLabel}>3. Lọc theo Lô hàng nhập:</Text>
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

      {/* PRODUCT FORM MODAL */}
      <ProductFormModal 
        visible={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        initialProduct={editingProduct}
      />

      {/* BATCH MANAGEMENT MODAL */}
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
  bigAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8
  },
  bigBatchAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8
  },
  bigBtnText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 15
  },
  tabSwitcherRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardDark,
    padding: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 16,
    gap: 8
  },
  switchTabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: 'transparent'
  },
  switchTabBtnActive: {
    backgroundColor: COLORS.primary
  },
  switchTabText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textMuted
  },
  switchTabTextActive: {
    color: '#ffffff',
    fontWeight: '900'
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
  clearSearchIcon: {
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
  tableContainer: {
    backgroundColor: COLORS.cardDark,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    overflow: 'hidden'
  },
  table: {
    minWidth: 1280
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
  batchTagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    alignSelf: 'flex-start'
  },
  batchTagText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSub
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
    padding: 40,
    alignItems: 'center'
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.textMuted,
    marginTop: 10
  },
  // BATCHES SECTION STYLES
  batchesScrollView: {
    flex: 1
  },
  batchSectionHeader: {
    marginBottom: 16
  },
  batchSectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textMain
  },
  batchSectionSub: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 4
  },
  batchGridContainer: {
    flexDirection: 'column',
    gap: 14
  },
  batchCard: {
    backgroundColor: COLORS.cardDark,
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder
  },
  batchCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    flexWrap: 'wrap',
    gap: 10
  },
  batchCodeBadge: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8
  },
  batchCodeText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 14
  },
  batchNameTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textMain
  },
  batchDateText: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2
  },
  batchActionBtnEdit: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primaryLight
  },
  batchActionBtnDelete: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.danger
  },
  batchStatsRow: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap'
  },
  statBox: {
    flex: 1,
    minWidth: 160,
    backgroundColor: '#0f172a',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.cardBorder
  },
  statBoxLabel: {
    fontSize: 12,
    color: COLORS.textMuted
  },
  statBoxValCapital: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.accent,
    marginTop: 4
  },
  statBoxVal: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textMain,
    marginTop: 4
  },
  statBoxValSold: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.success,
    marginTop: 4
  },
  batchNoteCard: {
    marginTop: 12,
    backgroundColor: '#0f172a',
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primaryLight
  },
  batchNoteText: {
    fontSize: 13,
    color: COLORS.textSub
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
  catChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  modalCatChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: COLORS.cardBorder
  },
  modalCatChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary
  },
  modalCatChipTSActive: {
    backgroundColor: 'rgba(236, 72, 153, 0.25)',
    borderColor: COLORS.categoryTS
  },
  modalCatChipQAActive: {
    backgroundColor: 'rgba(6, 182, 212, 0.25)',
    borderColor: COLORS.categoryQA
  },
  modalCatChipText: {
    fontSize: 13,
    color: COLORS.textMuted
  },
  modalCatChipTextActive: {
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
