import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from '../common/RNBridge';
import { useData } from '../../context/DataContext';
import { COLORS } from '../../theme/colors';
import { Package, Plus, Edit2, Trash2, X, Check, Calendar, DollarSign } from 'lucide-react';

export const BatchManagementModal = ({ visible, onClose }) => {
  const { batches, products, addBatch, updateBatch, deleteBatch } = useData();

  const [editingBatchId, setEditingBatchId] = useState(null);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [importDate, setImportDate] = useState('');
  const [totalCapital, setTotalCapital] = useState('');
  const [notes, setNotes] = useState('');

  const startCreate = () => {
    setEditingBatchId('NEW');
    setCode(`LÔ-0${batches.length + 1}`);
    setName(`Đợt nhập tháng ${new Date().getMonth() + 1}`);
    setImportDate(new Date().toISOString().split('T')[0]);
    setTotalCapital('10000000');
    setNotes('');
  };

  const startEdit = (batch) => {
    setEditingBatchId(batch.id);
    setCode(batch.code || '');
    setName(batch.name || '');
    setImportDate(batch.importDate || '');
    setTotalCapital(String(batch.totalCapital || '0'));
    setNotes(batch.notes || '');
  };

  const handleSave = () => {
    if (!name.trim() || !code.trim()) {
      alert('Vui lòng nhập Mã lô và Tên lô hàng!');
      return;
    }

    const payload = {
      code,
      name,
      importDate,
      totalCapital: Number(totalCapital) || 0,
      notes
    };

    if (editingBatchId === 'NEW') {
      addBatch(payload);
    } else {
      updateBatch(editingBatchId, payload);
    }

    setEditingBatchId(null);
  };

  const handleDelete = (batch) => {
    const productsInBatch = products.filter(p => p.batchId === batch.id);
    if (productsInBatch.length > 0) {
      if (!window.confirm(`Lô hàng "${batch.name}" có ${productsInBatch.length} sản phẩm đang gắn. Bạn có chắc chắn muốn xóa?`)) {
        return;
      }
    } else {
      if (!window.confirm(`Xóa lô hàng "${batch.name}"?`)) {
        return;
      }
    }
    deleteBatch(batch.id);
  };

  const formatCurrency = (val) => {
    return (Number(val) || 0).toLocaleString('vi-VN') + ' đ';
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.modalContainer}>
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Package size={20} color={COLORS.accent} />
            <Text style={styles.headerTitle}>Quản Lý Các Lô Hàng (Đợt Nhập)</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
          {editingBatchId ? (
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>
                {editingBatchId === 'NEW' ? '➕ Tạo Lô Hàng Mới' : '✏️ Chỉnh Sửa Lô Hàng'}
              </Text>

              <View style={styles.grid2}>
                <View style={styles.col}>
                  <Text style={styles.label}>Mã Lô Hàng *:</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="LÔ-01"
                    placeholderTextColor={COLORS.textMuted}
                    value={code}
                    onChangeText={setCode}
                  />
                </View>

                <View style={styles.col}>
                  <Text style={styles.label}>Ngày Nhập Hàng:</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={COLORS.textMuted}
                    value={importDate}
                    onChangeText={setImportDate}
                  />
                </View>
              </View>

              <Text style={styles.label}>Tên Đợt Nhập Hàng *:</Text>
              <TextInput
                style={styles.input}
                placeholder="Ví dụ: Đợt nhập Trang sức Bạc Quảng Châu Tháng 7..."
                placeholderTextColor={COLORS.textMuted}
                value={name}
                onChangeText={setName}
              />

              <Text style={styles.label}>Tổng Vốn Nhập Đợt Đó (VND) *:</Text>
              <TextInput
                style={[styles.input, { borderColor: COLORS.accent, fontWeight: '700', color: COLORS.accent }]}
                keyboardType="numeric"
                placeholder="20000000"
                placeholderTextColor={COLORS.textMuted}
                value={totalCapital}
                onChangeText={setTotalCapital}
              />

              <Text style={styles.label}>Ghi Chú Đợt Nhập:</Text>
              <TextInput
                style={styles.input}
                placeholder="Ghi chú nhà cung cấp, ship..."
                placeholderTextColor={COLORS.textMuted}
                value={notes}
                onChangeText={setNotes}
              />

              <View style={styles.formActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditingBatchId(null)}>
                  <Text style={styles.cancelText}>Hủy</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                  <Check size={16} color="#ffffff" style={{ marginRight: 6 }} />
                  <Text style={styles.saveText}>Lưu Lô Hàng</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity style={styles.addBatchTrigger} onPress={startCreate}>
              <Plus size={18} color="#ffffff" style={{ marginRight: 6 }} />
              <Text style={styles.addBatchTriggerText}>Tạo Thêm Đợt Nhập Hàng Mới</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.sectionHeading}>Danh Sách Các Lô Hàng Hiện Có ({batches.length}):</Text>

          {batches.map(b => {
            const batchProducts = products.filter(p => p.batchId === b.id);
            const totalProductsCount = batchProducts.reduce((acc, curr) => acc + (curr.stock + curr.soldCount), 0);
            const totalSoldUnits = batchProducts.reduce((acc, curr) => acc + curr.soldCount, 0);

            return (
              <View key={b.id} style={styles.batchCard}>
                <View style={styles.batchHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View style={styles.batchCodeBadge}>
                      <Text style={styles.batchCodeText}>{b.code}</Text>
                    </View>
                    <View>
                      <Text style={styles.batchName}>{b.name}</Text>
                      <Text style={styles.batchDate}>📅 Ngày nhập: {b.importDate}</Text>
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity style={styles.editIconBtn} onPress={() => startEdit(b)}>
                      <Edit2 size={15} color={COLORS.primaryLight} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteIconBtn} onPress={() => handleDelete(b)}>
                      <Trash2 size={15} color={COLORS.danger} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.batchStatsRow}>
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Tổng vốn nhập</Text>
                    <Text style={styles.statValCapital}>{formatCurrency(b.totalCapital)}</Text>
                  </View>

                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Số sp đợt này</Text>
                    <Text style={styles.statVal}>{batchProducts.length} loại ({totalProductsCount} món)</Text>
                  </View>

                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Đã bán ra</Text>
                    <Text style={styles.statValSold}>{totalSoldUnits} món</Text>
                  </View>
                </View>

                {b.notes ? <Text style={styles.batchNote}>📝 {b.notes}</Text> : null}
              </View>
            );
          })}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.closeModalBtn} onPress={onClose}>
            <Text style={styles.closeModalBtnText}>Đóng</Text>
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
    maxWidth: 680,
    maxHeight: '88vh',
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
  addBatchTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accent,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 20
  },
  addBatchTriggerText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14
  },
  formCard: {
    backgroundColor: '#162032',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 20
  },
  formTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.accent,
    marginBottom: 12
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSub,
    marginBottom: 6,
    marginTop: 10
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
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 16
  },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceHover
  },
  cancelText: {
    color: COLORS.textMuted,
    fontWeight: '600'
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.accent
  },
  saveText: {
    color: '#ffffff',
    fontWeight: '700'
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textMain,
    marginBottom: 12
  },
  batchCard: {
    backgroundColor: '#111c2e',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 12
  },
  batchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  batchCodeBadge: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.accent
  },
  batchCodeText: {
    color: COLORS.accent,
    fontWeight: '800',
    fontSize: 13
  },
  batchName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textMain
  },
  batchDate: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2
  },
  editIconBtn: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(59, 130, 246, 0.15)'
  },
  deleteIconBtn: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.15)'
  },
  batchStatsRow: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 10,
    gap: 10
  },
  statBox: {
    flex: 1
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textMuted
  },
  statValCapital: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.accent
  },
  statVal: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMain
  },
  statValSold: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.success
  },
  batchNote: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 8,
    fontStyle: 'italic'
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
    backgroundColor: '#162032',
    alignItems: 'flex-end'
  },
  closeModalBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceHover
  },
  closeModalBtnText: {
    color: COLORS.textMain,
    fontWeight: '600'
  }
});
