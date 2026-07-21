import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from '../common/RNBridge';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { COLORS } from '../../theme/colors';
import { Radio, ShieldCheck, ChevronDown, LogOut, Menu, User, UserCheck } from 'lucide-react';

export const Header = ({ activeTab, onToggleSidebar, onOpenAuthModal }) => {
  const { currentUser, logoutAdmin } = useAuth();
  const { colors } = useTheme();
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
    <View style={[styles.headerContainer, { backgroundColor: colors.cardDark, borderColor: colors.cardBorder }]}>
      {/* Left: View Title */}
      <View style={styles.leftSection}>
        <TouchableOpacity style={styles.menuToggleMobile} onPress={onToggleSidebar}>
          <Menu size={22} color={colors.textMain} />
        </TouchableOpacity>
        <Text style={[styles.viewTitle, { color: colors.textMain }]}>{getTitle()}</Text>
      </View>

      {/* Right: Realtime Status & User Profile Icon Button */}
      <View style={styles.rightSection}>
        {/* Realtime Live Online Badge or Read-Only Badge */}
        {currentUser ? (
          <View style={styles.onlineStatusBadge}>
            <Radio size={14} color={COLORS.success} style={{ marginRight: 6 }} />
            <Text style={styles.onlineStatusText}>Realtime Online</Text>
          </View>
        ) : (
          <View style={[styles.onlineStatusBadge, { backgroundColor: 'rgba(245, 158, 11, 0.15)', borderColor: COLORS.statusPending }]}>
            <Text style={{ fontSize: 12, color: COLORS.statusPending, fontWeight: '700' }}>
              👁️ Chỉ Xem (Read-Only)
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
                      <Text style={{ fontSize: 18 }}>{currentUser.avatar || '👑'}</Text>
                    </View>
                    <View>
                      <Text style={{ fontSize: 14, fontWeight: '800', color: colors.textMain }}>{currentUser.name}</Text>
                      <Text style={{ fontSize: 11, color: colors.textMuted }}>👑 Admin Hệ Thống</Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 4 }}>📧 {currentUser.email}</Text>
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
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
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
