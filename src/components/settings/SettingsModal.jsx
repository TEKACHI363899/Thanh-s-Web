import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from '../common/RNBridge';
import { useTheme, THEMES } from '../../context/ThemeContext';
import { COLORS } from '../../theme/colors';
import { Settings, X, Check, Palette, Moon, Sun, Heart, Sparkles } from 'lucide-react';

export const SettingsModal = ({ visible, onClose }) => {
  const { theme, setTheme, colors } = useTheme();

  if (!visible) return null;

  const themeIcons = {
    dark: Moon,
    bright: Sun,
    pink: Heart,
    kuromi: Sparkles
  };

  return (
    <View style={styles.overlay}>
      <View style={[styles.modalContainer, { backgroundColor: colors.cardDark, borderColor: colors.cardBorder }]}>
        {/* Header */}
        <View style={[styles.header, { borderColor: colors.cardBorder, backgroundColor: colors.sidebarBg || colors.cardDark }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Settings size={20} color={colors.primary} />
            <Text style={[styles.headerTitle, { color: colors.textMain }]}>Cài Đặt Theme Giao Diện</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
          <View style={styles.sectionHeaderBox}>
            <Palette size={16} color={colors.accent || colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.textMain }]}>🎨 Chọn Giao Diện Hệ Thống</Text>
          </View>
          <Text style={[styles.sectionSub, { color: colors.textMuted }]}>
            Chọn 1 trong 4 tông màu bên dưới. Hệ thống sẽ lưu tự động vào máy của bạn!
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
                    { backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.08)' : (colors.bgDark || '#0f172a'), borderColor: isSelected ? colors.primary : colors.cardBorder }
                  ]}
                  onPress={() => setTheme(t.id)}
                >
                  <View style={styles.themeCardHeader}>
                    <View style={styles.themeTitleRow}>
                      <IconComp size={16} color={isSelected ? colors.primary : colors.textMuted} />
                      <Text style={[styles.themeName, { color: isSelected ? colors.primary : colors.textMain }]}>
                        {t.name}
                      </Text>
                    </View>
                    {isSelected && (
                      <View style={[styles.activeBadge, { backgroundColor: colors.primary }]}>
                        <Check size={10} color="#ffffff" style={{ marginRight: 3 }} />
                        <Text style={styles.activeBadgeText}>Đang dùng</Text>
                      </View>
                    )}
                  </View>

                  <Text style={[styles.themeDesc, { color: colors.textMuted }]}>{t.desc}</Text>

                  {/* 2-Color Swatch Preview Box */}
                  <View style={[styles.swatchPreviewContainer, { borderColor: colors.cardBorder }]}>
                    <Text style={[styles.swatchLabel, { color: colors.textMuted }]}>Màu xem trước:</Text>
                    <View style={styles.swatchRow}>
                      {/* Box 1: Nền / Frame */}
                      <View style={styles.swatchItem}>
                        <View style={[styles.colorBox, { backgroundColor: t.previewBg }]} />
                        <Text style={[styles.boxLabel, { color: colors.textMuted }]}>Nền</Text>
                      </View>

                      {/* Box 2: Điểm Nhấn / Accent */}
                      <View style={styles.swatchItem}>
                        <View style={[styles.colorBox, { backgroundColor: t.previewAccent }]} />
                        <Text style={[styles.boxLabel, { color: colors.textMuted }]}>Điểm nhấn</Text>
                      </View>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.applyBtn,
                      { backgroundColor: isSelected ? colors.primary : 'transparent', borderColor: isSelected ? colors.primary : colors.cardBorder }
                    ]}
                    onPress={() => setTheme(t.id)}
                  >
                    <Text style={[styles.applyBtnText, { color: isSelected ? '#ffffff' : colors.textMain }]}>
                      {isSelected ? '✓ Đang Sử Dụng' : 'Áp Dụng Theme'}
                    </Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        <View style={[styles.footer, { borderColor: colors.cardBorder }]}>
          <TouchableOpacity style={[styles.closeModalBtn, { backgroundColor: colors.surfaceHover || '#334155' }]} onPress={onClose}>
            <Text style={[styles.closeModalBtnText, { color: colors.textMain }]}>Đóng Cài Đặt</Text>
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
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    padding: 16
  },
  modalContainer: {
    borderRadius: 14,
    borderWidth: 1,
    width: '100%',
    maxWidth: 580,
    height: 540,
    maxHeight: '88vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800'
  },
  closeBtn: {
    padding: 4,
    borderRadius: 6
  },
  body: {
    padding: 16,
    flex: 1,
    overflowY: 'auto'
  },
  sectionHeaderBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800'
  },
  sectionSub: {
    fontSize: 12,
    marginBottom: 12
  },
  themeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 10
  },
  themeCard: {
    borderRadius: 10,
    borderWidth: 1.5,
    padding: 10,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: 8
  },
  themeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  themeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  themeName: {
    fontSize: 13,
    fontWeight: '700'
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10
  },
  activeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff'
  },
  themeDesc: {
    fontSize: 11,
    lineHeight: 14
  },
  swatchPreviewContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    marginTop: 2
  },
  swatchLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 4
  },
  swatchRow: {
    flexDirection: 'row',
    gap: 12
  },
  swatchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  colorBox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.2)'
  },
  boxLabel: {
    fontSize: 10
  },
  applyBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 2
  },
  applyBtnText: {
    fontSize: 11,
    fontWeight: '700'
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    alignItems: 'flex-end'
  },
  closeModalBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6
  },
  closeModalBtnText: {
    fontSize: 12,
    fontWeight: '700'
  }
});
