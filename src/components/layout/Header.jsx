import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from '../common/RNBridge';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../theme/colors';
import { Radio, ShieldCheck, ChevronDown, LogOut, Menu } from 'lucide-react';

export const Header = ({ activeTab, onToggleSidebar, onOpenAuthModal }) => {
  const { currentUser, logoutAdmin } = useAuth();
  const [showAdminMenu, setShowAdminMenu] = useState(false);

  const getTitle = () => {
    switch (activeTab) {
      case 'ORDERS':
        return '📊 Bảng Đơn Hàng (Data Grid)';
      case 'PRODUCTS':
        return '📦 Quản Lý Sản Phẩm & Lô Hàng Tồn Kho';
      case 'FINANCE':
        return '💰 Tài Chính & Báo Cáo Lợi Nhuận';
      default:
        return 'Hệ Thống Quản Lý';
    }
  };

  return (
    <View style={styles.headerContainer}>
      {/* Left: View Title */}
      <View style={styles.leftSection}>
        <TouchableOpacity style={styles.menuToggleMobile} onPress={onToggleSidebar}>
          <Menu size={22} color={COLORS.textMain} />
        </TouchableOpacity>
        <Text style={styles.viewTitle}>{getTitle()}</Text>
      </View>

      {/* Right: Realtime Status & Active Admin Profile */}
      <View style={styles.rightSection}>
        {/* Realtime Live Online Badge */}
        <View style={styles.onlineStatusBadge}>
          <Radio size={14} color={COLORS.success} style={{ marginRight: 6 }} />
          <Text style={styles.onlineStatusText}>Realtime Online (Cloud Database Active)</Text>
        </View>

        {/* Current Logged In Admin Profile Button */}
        {currentUser ? (
          <View style={{ position: 'relative' }}>
            <TouchableOpacity 
              style={styles.adminProfileBtn}
              onPress={() => setShowAdminMenu(!showAdminMenu)}
            >
              <Text style={{ fontSize: 18 }}>{currentUser.avatar || '👑'}</Text>
              <View>
                <Text style={styles.adminNameText}>{currentUser.name}</Text>
                <Text style={styles.adminRoleSub}>👑 Admin Hệ Thống</Text>
              </View>
              <ChevronDown size={16} color={COLORS.textMuted} style={{ marginLeft: 4 }} />
            </TouchableOpacity>

            {/* Dropdown Menu */}
            {showAdminMenu && (
              <View style={styles.adminDropdownMenu}>
                <View style={styles.dropdownHeader}>
                  <ShieldCheck size={16} color={COLORS.primaryLight} style={{ marginRight: 6 }} />
                  <Text style={styles.dropdownTitle}>Thông Tin Tài Khoản Admin:</Text>
                </View>

                <View style={{ padding: 10 }}>
                  <Text style={{ fontSize: 14, fontWeight: '800', color: COLORS.textMain }}>{currentUser.name}</Text>
                  <Text style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>{currentUser.email}</Text>
                </View>

                <TouchableOpacity 
                  style={styles.logoutBtn}
                  onPress={() => {
                    logoutAdmin();
                    setShowAdminMenu(false);
                    onOpenAuthModal();
                  }}
                >
                  <LogOut size={16} color={COLORS.danger} style={{ marginRight: 8 }} />
                  <Text style={styles.logoutText}>Đăng xuất khỏi hệ thống</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : (
          <TouchableOpacity style={styles.loginTriggerBtn} onPress={onOpenAuthModal}>
            <Text style={styles.loginTriggerText}>🔑 Đăng Nhập / Đăng Ký Admin</Text>
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
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14
  },
  onlineStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)'
  },
  onlineStatusText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.success
  },
  adminProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#0f172a',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder
  },
  adminNameText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMain
  },
  adminRoleSub: {
    fontSize: 11,
    color: COLORS.textMuted
  },
  adminDropdownMenu: {
    position: 'absolute',
    top: 52,
    right: 0,
    width: 280,
    backgroundColor: COLORS.cardDark,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    zIndex: 9999
  },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
    marginBottom: 8
  },
  dropdownTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSub
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    marginBottom: 4
  },
  dropdownItemActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)'
  },
  itemAdminName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMain
  },
  itemAdminEmail: {
    fontSize: 11,
    color: COLORS.textMuted
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
    marginTop: 6
  },
  logoutText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.danger
  },
  loginTriggerBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10
  },
  loginTriggerText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14
  }
});
