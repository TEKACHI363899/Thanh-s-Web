import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from '../common/RNBridge';
import { useTheme } from '../../context/ThemeContext';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../theme/colors';
import { 
  ShoppingBag, 
  Package, 
  TrendingUp, 
  ChevronLeft, 
  ChevronRight, 
  Boxes,
  PlusCircle,
  Settings,
  Store
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
  const { currentUser } = useAuth();
  const { activeShopId, switchShop, availableShops } = useData();

  const activeShopObj = (availableShops || []).find(s => s.id === activeShopId) || { id: 'shop_1', name: 'Shop 1 (Chính)' };
  const canSwitchShop = currentUser?.email === 'thanhdatglory@gmail.com';

  const handleToggleShop = () => {
    if (!canSwitchShop) {
      alert('Chỉ tài khoản thanhdatglory@gmail.com mới có quyền chuyển đổi giữa các Cửa hàng!');
      return;
    }
    const nextShop = activeShopId === 'shop_1' ? 'shop_2' : 'shop_1';
    switchShop(nextShop, currentUser?.email);
  };

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
              <Text style={styles.brandTitle}>Kax Leth</Text>
              
              {/* COMPACT ACTIVE SHOP BADGE NEXT TO LOGO BRAND */}
              <TouchableOpacity 
                style={[
                  styles.shopSubTag,
                  { 
                    backgroundColor: activeShopId === 'shop_2' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                    borderColor: activeShopId === 'shop_2' ? COLORS.statusPending : COLORS.primaryLight
                  }
                ]}
                onPress={handleToggleShop}
                title={canSwitchShop ? "Bấm để đổi Cửa hàng" : "Chỉ thanhdatglory@gmail.com mới được chuyển Shop"}
              >
                <Store size={11} color={activeShopId === 'shop_2' ? COLORS.statusPending : COLORS.primaryLight} style={{ marginRight: 4 }} />
                <Text style={[
                  styles.shopSubTagText,
                  { color: activeShopId === 'shop_2' ? COLORS.statusPending : COLORS.primaryLight }
                ]}>
                  {activeShopObj.name}
                </Text>
              </TouchableOpacity>
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
  shopSubTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 2,
    alignSelf: 'flex-start',
    cursor: 'pointer'
  },
  shopSubTagText: {
    fontSize: 10,
    fontWeight: '800'
  },
  toggleBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#0f172a'
  },
  quickCreateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    paddingVertical: 12,
    borderRadius: 12,
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
  },
  quickCreateText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800'
  },
  menuSection: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 12
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
    marginBottom: 10,
    paddingHorizontal: 8,
    letterSpacing: 0.5
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 4,
    backgroundColor: 'transparent'
  },
  menuItemActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.12)'
  },
  menuItemCollapsed: {
    justifyContent: 'center',
    paddingHorizontal: 0
  },
  iconWrapper: {
    width: 34,
    height: 34,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted
  },
  menuLabelActive: {
    color: COLORS.textMain,
    fontWeight: '800'
  },
  badgeTag: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800'
  },
  sidebarFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
    gap: 10
  },
  batchQuickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.cardBorder
  },
  batchQuickText: {
    color: COLORS.accent,
    fontSize: 13,
    fontWeight: '700'
  },
  settingsQuickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.cardBorder
  },
  settingsQuickText: {
    color: COLORS.textMain,
    fontSize: 13,
    fontWeight: '700'
  }
});
