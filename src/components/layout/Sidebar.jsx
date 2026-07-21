import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from '../common/RNBridge';
import { useTheme } from '../../context/ThemeContext';
import { COLORS } from '../../theme/colors';
import { 
  ShoppingBag, 
  Package, 
  TrendingUp, 
  ChevronLeft, 
  ChevronRight, 
  Boxes,
  PlusCircle,
  Settings
} from 'lucide-react';

export const Sidebar = ({ 
  activeTab, 
  setActiveTab, 
  collapsed, 
  setCollapsed, 
  onOpenBatchModal, 
  onOpenOrderModal,
  onOpenSettingsModal 
}) => {
  const { colors } = useTheme();

  const menuItems = [
    {
      id: 'ORDERS',
      label: 'Bảng Đơn Hàng',
      badge: 'Chính',
      icon: ShoppingBag,
      color: colors.primaryLight
    },
    {
      id: 'PRODUCTS',
      label: 'Sản Phẩm & Tồn Kho',
      icon: Package,
      color: colors.categoryQA
    },
    {
      id: 'FINANCE',
      label: 'Tài Chính & Lợi Nhuận',
      icon: TrendingUp,
      color: colors.success
    }
  ];

  return (
    <View style={[
      styles.sidebar, 
      collapsed ? styles.sidebarCollapsed : styles.sidebarExpanded,
      { backgroundColor: colors.sidebarBg || colors.cardDark, borderColor: colors.cardBorder }
    ]}>
      {/* Sidebar Top Header with Brand & Collapse Toggle */}
      <View style={styles.sidebarHeader}>
        {!collapsed && (
          <View style={styles.brandContainer}>
            <View style={styles.logoBadge}>
              <Image source={{ uri: '/logo.jpg' }} style={styles.brandLogoImg} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.brandTitle}>THANH STORE</Text>
              <Text style={styles.brandSub}>Quản Lý Bán Hàng</Text>
            </View>
          </View>
        )}

        <TouchableOpacity 
          style={styles.toggleBtn}
          onPress={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
        >
          {collapsed ? (
            <ChevronRight size={22} color={COLORS.primaryLight} />
          ) : (
            <ChevronLeft size={22} color={COLORS.textMuted} />
          )}
        </TouchableOpacity>
      </View>

      {/* Quick Create Action Button */}
      {!collapsed && (
        <TouchableOpacity 
          style={styles.quickCreateBtn} 
          onPress={onOpenOrderModal}
        >
          <PlusCircle size={20} color="#ffffff" style={{ marginRight: 10 }} />
          <Text style={styles.quickCreateText}> Tạo Đơn Mới</Text>
        </TouchableOpacity>
      )}

      {/* Navigation Menu List */}
      <View style={styles.menuSection}>
        <Text style={[styles.sectionTitle, collapsed && { textAlign: 'center' }]}>
          {collapsed ? '•••' : 'DANH MỤC QUẢN LÝ'}
        </Text>

        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                isActive && styles.menuItemActive,
                collapsed && styles.menuItemCollapsed
              ]}
              onPress={() => setActiveTab(item.id)}
            >
              <View style={[styles.iconWrapper, isActive && { backgroundColor: item.color }]}>
                <Icon size={20} color={isActive ? '#ffffff' : item.color} />
              </View>

              {!collapsed && (
                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={[styles.menuLabel, isActive && styles.menuLabelActive]}>
                    {item.label}
                  </Text>
                  {item.badge ? (
                    <View style={styles.badgeTag}>
                      <Text style={styles.badgeText}>{item.badge}</Text>
                    </View>
                  ) : null}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Footer Actions in Sidebar */}
      <View style={styles.sidebarFooter}>
        {!collapsed ? (
          <>
            <TouchableOpacity 
              style={styles.batchQuickBtn}
              onPress={onOpenBatchModal}
            >
              <Boxes size={18} color={COLORS.accent} style={{ marginRight: 8 }} />
              <Text style={styles.batchQuickText}>Quản Lý Lô Hàng</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.settingsQuickBtn}
              onPress={onOpenSettingsModal}
            >
              <Settings size={18} color={COLORS.primaryLight} style={{ marginRight: 8 }} />
              <Text style={styles.settingsQuickText}>Cài Đặt Theme</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity 
            style={[styles.menuItem, styles.menuItemCollapsed, { marginTop: 'auto' }]}
            onPress={onOpenSettingsModal}
            title="Cài đặt Theme"
          >
            <View style={[styles.iconWrapper, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
              <Settings size={20} color={COLORS.primaryLight} />
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    backgroundColor: '#162032',
    borderRightWidth: 1,
    borderRightColor: COLORS.cardBorder,
    height: '100%',
    transition: 'width 0.25s ease-in-out',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column'
  },
  sidebarExpanded: {
    width: 260
  },
  sidebarCollapsed: {
    width: 72
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
    height: 64
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden'
  },
  brandLogoImg: {
    width: 38,
    height: 38,
    borderRadius: 10,
    resizeMode: 'cover'
  },
  brandTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.textMain,
    letterSpacing: 0.5
  },
  brandSub: {
    fontSize: 11,
    color: COLORS.textMuted
  },
  toggleBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: COLORS.cardBorder
  },
  quickCreateBtn: {
    margin: 14,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8
  },
  quickCreateText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 15
  },
  menuSection: {
    paddingHorizontal: 12,
    marginTop: 10,
    flex: 1
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1,
    marginBottom: 10,
    paddingLeft: 6
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
    backgroundColor: 'transparent'
  },
  menuItemCollapsed: {
    justifyContent: 'center',
    paddingHorizontal: 0
  },
  menuItemActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.18)',
    borderWidth: 1,
    borderColor: COLORS.primary
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center'
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSub
  },
  menuLabelActive: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textMain
  },
  badgeTag: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#ffffff'
  },
  sidebarFooter: {
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
    gap: 8
  },
  batchQuickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.accent
  },
  batchQuickText: {
    color: COLORS.accent,
    fontWeight: '700',
    fontSize: 13
  },
  settingsQuickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.primary
  },
  settingsQuickText: {
    color: COLORS.primaryLight,
    fontWeight: '700',
    fontSize: 13
  }
});
