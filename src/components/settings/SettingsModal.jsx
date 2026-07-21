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
            <Palette size={16} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.textMain }]}>🎨 Danh Sách Giao Diện (Theme)</Text>
          </View>
          <Text style={[styles.sectionSub, { color: colors.textMuted }]}>
            Bấm chọn 1 giao diện bên dưới. Hệ thống sẽ tự động chuyển đổi và lưu ngay lập tức!
          </Text>

          {/* Compact Horizontal Theme Rows List */}
          <View style={styles.themeList}>
            {Object.values(THEMES).map((t) => {
              const isSelected = theme === t.id;
              const IconComp = themeIcons[t.id] || Palette;

              return (
                <TouchableOpacity
                  key={t.id}
                  style={[
                    styles.themeRow,
                    {
                      backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.08)' : (colors.bgDark || '#0f172a'),
                      borderColor: isSelected ? colors.primary : colors.cardBorder
                    }
                  ]}
                  onPress={() => setTheme(t.id)}
                >
                  {/* Left Section: Icon + Name + Description */}
                  <View style={styles.themeRowLeft}>
                    <View style={[styles.iconCircle, { backgroundColor: isSelected ? colors.primary : 'rgba(148, 163, 184, 0.15)' }]}>
                      <IconComp size={16} color={isSelected ? '#ffffff' : colors.textMuted} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={[styles.themeName, { color: isSelected ? colors.primary : colors.textMain }]}>
                          {t.name}
                        </Text>
                        {isSelected && (
                          <View style={[styles.activeTag, { backgroundColor: colors.primary }]}>
                            <Text style={styles.activeTagText}>Đang chọn</Text>
                          </View>
                        )}
                      </View>
                      <Text style={[styles.themeDesc, { color: colors.textMuted }]} numberOfLines={1}>
                        {t.desc}
                      </Text>
                    </View>
                  </View>

                  {/* Middle Section: 2 Color Swatches */}
                  <View style={styles.swatchRowCompact}>
                    <View style={[styles.colorBox, { backgroundColor: t.previewBg }]} />
                    <View style={[styles.colorBox, { backgroundColor: t.previewAccent }]} />
                  </View>

                  {/* Right Section: Action Button */}
                  <TouchableOpacity
                    style={[
                      styles.applyBtn,
                      {
                        backgroundColor: isSelected ? colors.primary : 'transparent',
                        borderColor: isSelected ? colors.primary : colors.cardBorder
                      }
                    ]}
                    onPress={() => setTheme(t.id)}
                  >
                    <Text style={[styles.applyBtnText, { color: isSelected ? '#ffffff' : colors.textMain }]}>
                      {isSelected ? '✓ Đang Dùng' : 'Áp Dụng'}
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
    maxWidth: 600,
    height: 440,
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
    marginBottom: 2
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800'
  },
  sectionSub: {
    fontSize: 12,
    marginBottom: 12
  },
  themeList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 10,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 12
  },
  themeRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center'
  },
  themeName: {
    fontSize: 13,
    fontWeight: '700'
  },
  activeTag: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8
  },
  activeTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff'
  },
  themeDesc: {
    fontSize: 11,
    marginTop: 1
  },
  swatchRowCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  colorBox: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.2)'
  },
  applyBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center'
  },
  applyBtnText: {
    fontSize: 12,
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
    borderRadius: 8
  },
  closeModalBtnText: {
    fontSize: 12,
    fontWeight: '700'
  }
});
