import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from '../common/RNBridge';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useData } from '../../context/DataContext';
import { COLORS } from '../../theme/colors';
import { Radio, ShieldCheck, ChevronDown, LogOut, Menu, User, UserCheck, RefreshCw, Store, Check } from 'lucide-react';

export const Header = ({ activeTab, onToggleSidebar, onOpenAuthModal }) => {
  const { currentUser, logoutAdmin } = useAuth();
  const { colors } = useTheme();
  const { 
    activeShopId, 
    switchShop, 
    availableShops, 
    refreshAllData 
  } = useData();

  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [showShopMenu, setShowShopMenu] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    refreshAllData();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const handleShopSwitch = (shopId) => {
    const success = switchShop(shopId, currentUser?.email);
    if (success) {
      setShowShopMenu(false);
    }
  };

  const getTitle = () => {
    switch (activeTab) {
      case 'ORDERS':
        return 'Bảng Đơn Hàng (Data Grid)';
      case 'PRODUCTS':
        return 'Quản Lý Sản Phẩm & Lô Hàng Tồn Kho';
      case 'FINANCE':
        return 'Tài Chính & Báo Cáo Lợi Nhuận';
      default:
        return 'Hệ Thống Quản Lý';
    }
  };

  const activeShopObj = (availableShops || []).find(s => s.id === activeShopId) || { id: 'shop_1', name: 'Shop 1 (Chính)' };
  const canSwitchShop = currentUser?.email === 'thanhdatglory@gmail.com';

  return (
    <View style={[styles.headerContainer, { backgroundColor: colors.cardDark, borderColor: colors.cardBorder }]}>
      {/* Left: View Title & Shop Switcher Button */}
      <View style={styles.leftSection}>
        <TouchableOpacity style={styles.menuToggleMobile} onPress={onToggleSidebar}>
          <Menu size={22} color={colors.textMain} />
        </TouchableOpacity>
        
        <Text style={[styles.viewTitle, { color: colors.textMain }]}>{getTitle()}</Text>

        {/* SHOP SWITCHER DROPDOWN BUTTON (RIGHT NEXT TO BRAND LOGO / TITLE) */}
        <View style={{ position: 'relative', marginLeft: 8 }}>
          <TouchableOpacity
            style={[
              styles.shopBadgeBtn,
              { 
                backgroundColor: activeShopId === 'shop_2' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                borderColor: activeShopId === 'shop_2' ? COLORS.statusPending : COLORS.primaryLight
              }
            ]}
            onPress={() => {
              if (!canSwitchShop) {
                alert('Chỉ tài khoản thanhdatglory@gmail.com mới có quyền chuyển đổi giữa các Cửa hàng!');
                return;
              }
              setShowShopMenu(!showShopMenu);
            }}
            title={canSwitchShop ? "Bấm để đổi Cửa hàng" : "Chỉ thanhdatglory@gmail.com mới được chuyển Shop"}
          >
            <Store size={14} color={activeShopId === 'shop_2' ? COLORS.statusPending : COLORS.primaryLight} style={{ marginRight: 6 }} />
            <Text style={[
              styles.shopBadgeText,
              { color: activeShopId === 'shop_2' ? COLORS.statusPending : COLORS.primaryLight }
            ]}>
              {activeShopObj.name}
            </Text>
            {canSwitchShop && (
              <ChevronDown size={13} color={activeShopId === 'shop_2' ? COLORS.statusPending : COLORS.primaryLight} style={{ marginLeft: 4 }} />
            )}
          </TouchableOpacity>

          {/* SHOP SWITCHER POPUP MENU */}
          {showShopMenu && (
            <View style={[styles.shopDropdownMenu, { backgroundColor: colors.cardDark, borderColor: colors.cardBorder }]}>
              <Text style={styles.shopDropdownHeader}>CHUYỂN ĐỔI CỬA HÀNG</Text>

              {(availableShops || []).map(s => (
                <TouchableOpacity
                  key={s.id}
                  style={[
                    styles.shopOptionItem,
                    activeShopId === s.id && styles.shopOptionActive
                  ]}
                  onPress={() => handleShopSwitch(s.id)}
                >
                  <Store size={16} color={activeShopId === s.id ? COLORS.primaryLight : COLORS.textMuted} style={{ marginRight: 8 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.shopOptionName, activeShopId === s.id && styles.shopOptionNameActive]}>
                      {s.name}
                    </Text>
                    <Text style={styles.shopOptionSub}>
                      {s.isPrimary ? 'Dữ liệu Shop 1 chính' : 'Dữ liệu Shop 2 biệt lập 100%'}
                    </Text>
                  </View>
                  {activeShopId === s.id && <Check size={16} color={COLORS.success} />}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Right: Realtime Status, Sync Button & User Profile Icon Button */}
      <View style={styles.rightSection}>
        {/* Manual Data Refresh Button */}
        <TouchableOpacity 
          style={[styles.refreshDataBtn, { backgroundColor: colors.surfaceHover || '#1e293b', borderColor: colors.cardBorder }]}
          onPress={handleManualRefresh}
          title="Bấm để tải lại dữ liệu mới nhất từ Cloud / Máy khác"
        >
          <RefreshCw size={14} color={colors.primary} style={{ marginRight: 6, transform: isRefreshing ? [{ rotate: '180deg' }] : [] }} />
          <Text style={[styles.refreshDataText, { color: colors.textMain }]}>
            {isRefreshing ? 'Đang Tải...' : 'Đồng Bộ Nhanh'}
          </Text>
        </TouchableOpacity>

        {/* Realtime Live Online Badge or Read-Only Badge */}
        {currentUser ? (
          <View style={styles.onlineStatusBadge}>
            <Radio size={14} color={COLORS.success} style={{ marginRight: 6 }} />
            <Text style={styles.onlineStatusText}>Realtime Online</Text>
          </View>
        ) : (
          <View style={[styles.onlineStatusBadge, { backgroundColor: 'rgba(245, 158, 11, 0.15)', borderColor: COLORS.statusPending }]}>
            <Text style={{ fontSize: 12, color: COLORS.statusPending, fontWeight: '700' }}>
              Chỉ Xem (Read-Only)
            </Text>
          </View>
        )}

        {/* User Profile Icon Button */}
        {currentUser ? (
          <View style={{ position: 'relative' }}>
            <TouchableOpacity 
              style={[
                styles.userProfileIconButton,
                { backgroundColor: colors.surfaceHover || '#1e293b', borderColor: colors.cardBorder }
              ]}
              onPress={() => setShowAdminMenu(!showAdminMenu)}
              title={`Tài khoản: ${currentUser.name}`}
            >
              <View style={[styles.userIconCircle, { backgroundColor: colors.primary }]}>
                <UserCheck size={16} color="#ffffff" />
              </View>
              <Text style={[styles.userBadgeText, { color: colors.textMain }]}>
                {currentUser.name.split(' ')[0]}
              </Text>
              <View style={styles.onlineDot} />
              <ChevronDown size={14} color={colors.textMuted} style={{ marginLeft: 2 }} />
            </TouchableOpacity>

            {/* Account Info Dropdown Popup */}
            {showAdminMenu && (
              <View style={[styles.adminDropdownMenu, { backgroundColor: colors.cardDark, borderColor: colors.cardBorder }]}>
                <View style={[styles.dropdownHeader, { borderBottomColor: colors.cardBorder }]}>
                  <ShieldCheck size={16} color={colors.primary} style={{ marginRight: 6 }} />
                  <Text style={[styles.dropdownTitle, { color: colors.textMain }]}>Thông Tin Tài Khoản</Text>
                </View>

                <View style={styles.dropdownBody}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <View style={[styles.avatarBigCircle, { backgroundColor: colors.primary }]}>
                      <User size={20} color="#ffffff" />
                    </View>
                    <View>
                      <Text style={{ fontSize: 14, fontWeight: '800', color: colors.textMain }}>{currentUser.name}</Text>
                      <Text style={{ fontSize: 11, color: colors.textMuted }}>Admin Hệ Thống</Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 4 }}>{currentUser.email}</Text>
                </View>

                <TouchableOpacity 
                  style={[styles.logoutBtn, { borderTopColor: colors.cardBorder }]}
                  onPress={() => {
                    logoutAdmin();
                    setShowAdminMenu(false);
                    onOpenAuthModal();
                  }}
                >
                  <LogOut size={15} color={COLORS.danger} style={{ marginRight: 6 }} />
                  <Text style={styles.logoutText}>Đăng xuất khỏi hệ thống</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : (
          <TouchableOpacity 
            style={[styles.userProfileIconButton, { backgroundColor: 'rgba(59, 130, 246, 0.12)', borderColor: colors.primary }]} 
            onPress={onOpenAuthModal}
            title="Bấm để đăng nhập Admin"
          >
            <View style={[styles.userIconCircle, { backgroundColor: colors.primary }]}>
              <User size={16} color="#ffffff" />
            </View>
            <Text style={[styles.userBadgeText, { color: colors.primary }]}>Đăng Nhập</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    height: 64,
    backgroundColor: '#162032',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 900
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  menuToggleMobile: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#0f172a',
    display: 'none'
  },
  viewTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textMain
  },

  /* Shop Switcher Button Styles */
  shopBadgeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 18,
    borderWidth: 1.5,
    cursor: 'pointer'
  },
  shopBadgeText: {
    fontSize: 12,
    fontWeight: '800'
  },
  shopDropdownMenu: {
    position: 'absolute',
    top: 36,
    left: 0,
    width: 220,
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 10,
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
    zIndex: 99999
  },
  shopDropdownHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder
  },
  shopOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    marginBottom: 4
  },
  shopOptionActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)'
  },
  shopOptionName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMain
  },
  shopOptionNameActive: {
    color: COLORS.primaryLight,
    fontWeight: '800'
  },
  shopOptionSub: {
    fontSize: 10,
    color: COLORS.textMuted
  },

  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  refreshDataBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1
  },
  refreshDataText: {
    fontSize: 12,
    fontWeight: '700'
  },
  onlineStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)'
  },
  onlineStatusText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.success
  },
  userProfileIconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    position: 'relative'
  },
  userIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center'
  },
  userBadgeText: {
    fontSize: 13,
    fontWeight: '800'
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
    boxShadow: '0 0 6px rgba(16, 185, 129, 0.8)'
  },
  adminDropdownMenu: {
    position: 'absolute',
    top: 48,
    right: 0,
    width: 250,
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 12,
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
    zIndex: 9999
  },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 8,
    borderBottomWidth: 1,
    marginBottom: 8
  },
  dropdownTitle: {
    fontSize: 12,
    fontWeight: '800'
  },
  dropdownBody: {
    paddingVertical: 4
  },
  avatarBigCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center'
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    marginTop: 8
  },
  logoutText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.danger
  }
});
