import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from '../common/RNBridge';
import { useTheme, THEMES } from '../../context/ThemeContext';
import { COLORS } from '../../theme/colors';
import { Settings, X, Check, Palette, Moon, Sun, Heart, Sparkles } from 'lucide-react';

export const SettingsModal = ({ visible, onClose }) => {
  const { theme, setTheme } = useTheme();

  if (!visible) return null;

  const themeIcons = {
    dark: Moon,
    bright: Sun,
    pink: Heart,
    kuromi: Sparkles
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.modalContainer}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Settings size={22} color={COLORS.primaryLight} />
            <Text style={styles.headerTitle}>Cài Đặt Hệ Thống & Giao Diện</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
          <View style={styles.sectionHeaderBox}>
            <Palette size={18} color={COLORS.accent} />
            <Text style={styles.sectionTitle}>🎨 Chọn Giao Diện & Tông Màu (Theme)</Text>
          </View>
          <Text style={styles.sectionSub}>
            Tùy chỉnh phong cách hiển thị theo sở thích của shop. Thay đổi sẽ được lưu tự động!
          </Text>

          {/* Theme Selector Grid */}
          <View style={styles.themeGrid}>
            {Object.values(THEMES).map((t) => {
              const isSelected = theme === t.id;
              const IconComp = themeIcons[t.id] || Palette;

              return (
                <TouchableOpacity
                  key={t.id}
                  style={[
                    styles.themeCard,
                    isSelected && styles.themeCardActive
                  ]}
                  onPress={() => setTheme(t.id)}
                >
                  <View style={styles.themeCardHeader}>
                    <View style={styles.themeTitleRow}>
                      <IconComp size={18} color={isSelected ? COLORS.primaryLight : COLORS.textMuted} />
                      <Text style={[styles.themeName, isSelected && styles.themeNameActive]}>
                        {t.name}
                      </Text>
                    </View>
                    {isSelected && (
                      <View style={styles.activeBadge}>
                        <Check size={12} color="#ffffff" style={{ marginRight: 4 }} />
                        <Text style={styles.activeBadgeText}>Đã chọn</Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.themeDesc}>{t.desc}</Text>

                  {/* 2-Color Swatch Preview Box */}
                  <View style={styles.swatchPreviewContainer}>
                    <Text style={styles.swatchLabel}>Preview màu sắc:</Text>
                    <View style={styles.swatchRow}>
                      {/* Box 1: Nền / Frame */}
                      <View style={styles.swatchItem}>
                        <View style={[styles.colorBox, { backgroundColor: t.previewBg }]} />
                        <Text style={styles.boxLabel}>Nền / Khung</Text>
                      </View>

                      {/* Box 2: Điểm Nhấn / Accent */}
                      <View style={styles.swatchItem}>
                        <View style={[styles.colorBox, { backgroundColor: t.previewAccent }]} />
                        <Text style={styles.boxLabel}>Nút / Điểm nhấn</Text>
                      </View>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.applyBtn,
                      isSelected && styles.applyBtnActive
                    ]}
                    onPress={() => setTheme(t.id)}
                  >
                    <Text style={[styles.applyBtnText, isSelected && styles.applyBtnTextActive]}>
                      {isSelected ? '✓ Đang Sử Dụng' : 'Áp Dụng Theme Này'}
                    </Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.closeModalBtn} onPress={onClose}>
            <Text style={styles.closeModalBtnText}>Đóng Cài Đặt</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    backdropFilter: 'blur(4px)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    padding: 16
  },
  modalContainer: {
    backgroundColor: COLORS.cardDark,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    width: '100%',
    maxWidth: 680,
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textMain
  },
  closeBtn: {
    padding: 4
  },
  body: {
    padding: 20,
    flex: 1
  },
  sectionHeaderBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textMain
  },
  sectionSub: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 16
  },
  themeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 14,
    marginBottom: 10
  },
  themeCard: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.cardBorder,
    padding: 14,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: 10
  },
  themeCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(59, 130, 246, 0.1)'
  },
  themeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  themeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  themeName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMain
  },
  themeNameActive: {
    color: COLORS.primaryLight
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12
  },
  activeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff'
  },
  themeDesc: {
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 16
  },
  swatchPreviewContainer: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginTop: 4
  },
  swatchLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSub,
    marginBottom: 6
  },
  swatchRow: {
    flexDirection: 'row',
    gap: 16
  },
  swatchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  colorBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
  },
  boxLabel: {
    fontSize: 11,
    color: COLORS.textMuted
  },
  applyBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    alignItems: 'center',
    marginTop: 4
  },
  applyBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary
  },
  applyBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSub
  },
  applyBtnTextActive: {
    color: '#ffffff'
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
    alignItems: 'flex-end'
  },
  closeModalBtn: {
    backgroundColor: '#334155',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8
  },
  closeModalBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff'
  }
});
