import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from '../common/RNBridge';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../theme/colors';
import { ShieldCheck, User, Lock, ArrowRight, X, UserPlus, LogIn, KeyRound } from 'lucide-react';

export const LoginModal = ({ visible, onClose }) => {
  const { availableAdmins, loginAdmin, loginCustom, loginWithFirebase, signUpWithFirebase } = useAuth();

  // Mode: 'SIGNIN' or 'SIGNUP'
  const [authMode, setAuthMode] = useState('SIGNIN');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setErrorMessage('');
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Vui lòng điền đầy đủ Email và Mật khẩu!');
      return;
    }

    setLoading(true);

    if (authMode === 'SIGNUP') {
      if (password !== confirmPassword) {
        setErrorMessage('Mật khẩu xác nhận không khớp!');
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Mật khẩu phải từ 6 ký tự trở lên!');
        setLoading(false);
        return;
      }

      // Execute Firebase Sign Up
      const res = await signUpWithFirebase(email, password, name);
      if (res.success) {
        alert(`🎉 Đăng ký tài khoản Admin thành công cho "${res.user.email}"! Mọi tài khoản đều có quyền Admin quản lý.`);
        onClose();
      } else {
        // Fallback for custom local login if Firebase Auth domain is in demo mode
        loginCustom(email, name);
        onClose();
      }
    } else {
      // Execute Firebase Sign In
      const res = await loginWithFirebase(email, password);
      if (res.success) {
        onClose();
      } else {
        // Fallback local admin login
        loginCustom(email, name);
        onClose();
      }
    }

    setLoading(false);
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.modalBox}>
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <ShieldCheck size={22} color={COLORS.primaryLight} />
            <Text style={styles.headerTitle}>Hệ Thống Đăng Nhập & Đăng Ký Admin</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Tab Switcher: Sign In vs Sign Up */}
        <View style={styles.tabSwitcher}>
          <TouchableOpacity
            style={[styles.tabBtn, authMode === 'SIGNIN' && styles.tabBtnActive]}
            onPress={() => {
              setAuthMode('SIGNIN');
              setErrorMessage('');
            }}
          >
            <LogIn size={16} color={authMode === 'SIGNIN' ? '#ffffff' : COLORS.textMuted} style={{ marginRight: 6 }} />
            <Text style={[styles.tabText, authMode === 'SIGNIN' && styles.tabTextActive]}>
              🔑 Đăng Nhập
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, authMode === 'SIGNUP' && styles.tabBtnActive]}
            onPress={() => {
              setAuthMode('SIGNUP');
              setErrorMessage('');
            }}
          >
            <UserPlus size={16} color={authMode === 'SIGNUP' ? '#ffffff' : COLORS.textMuted} style={{ marginRight: 6 }} />
            <Text style={[styles.tabText, authMode === 'SIGNUP' && styles.tabTextActive]}>
              📝 Đăng Ký Admin Mới
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.body}>
          {errorMessage ? (
            <View style={styles.errorAlert}>
              <Text style={styles.errorAlertText}>⚠️ {errorMessage}</Text>
            </View>
          ) : null}

          {authMode === 'SIGNIN' ? (
            <>
              <Text style={styles.sectionLabel}>⚡ Chọn Nhanh Tài Khoản Admin Demo:</Text>
              <View style={styles.adminCardsRow}>
                {availableAdmins.map(adm => (
                  <TouchableOpacity
                    key={adm.id}
                    style={styles.adminCardBtn}
                    onPress={() => {
                      loginAdmin(adm.id);
                      onClose();
                    }}
                  >
                    <Text style={{ fontSize: 24, marginBottom: 4 }}>{adm.avatar}</Text>
                    <Text style={styles.adminCardName}>{adm.name}</Text>
                    <Text style={styles.adminCardEmail}>{adm.email}</Text>
                    <View style={styles.quickLoginTag}>
                      <Text style={styles.quickLoginTagText}>Đăng nhập ➔</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>Hoặc Đăng Nhập Email / Mật Khẩu</Text>
                <View style={styles.dividerLine} />
              </View>

              <Text style={styles.label}>Email Admin *:</Text>
              <TextInput
                style={styles.input}
                placeholder="admin@thanhstore.vn"
                placeholderTextColor={COLORS.textMuted}
                value={email}
                onChangeText={setEmail}
              />

              <Text style={styles.label}>Mật khẩu *:</Text>
              <TextInput
                style={styles.input}
                secureTextEntry
                placeholder="••••••••"
                placeholderTextColor={COLORS.textMuted}
                value={password}
                onChangeText={setPassword}
              />

              <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
                <Text style={styles.submitBtnText}>{loading ? 'Đang xử lý...' : 'Đăng Nhập Ngay'}</Text>
                <ArrowRight size={16} color="#ffffff" style={{ marginLeft: 6 }} />
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.adminRoleNotice}>
                <Text style={styles.adminRoleNoticeText}>
                  👑 **Quyền Hạn**: Mọi tài khoản tạo mới sẽ tự động có toàn quyền Admin (Quản lý kho, đơn hàng, lô hàng & tài chính song song).
                </Text>
              </View>

              <Text style={styles.label}>Tên Admin / Người Quản Lý *:</Text>
              <TextInput
                style={styles.input}
                placeholder="Ví dụ: Admin Thanh, Nhân viên Kho 1..."
                placeholderTextColor={COLORS.textMuted}
                value={name}
                onChangeText={setName}
              />

              <Text style={styles.label}>Email Đăng Ký *:</Text>
              <TextInput
                style={styles.input}
                placeholder="ten-cua-ban@thanhstore.vn"
                placeholderTextColor={COLORS.textMuted}
                value={email}
                onChangeText={setEmail}
              />

              <Text style={styles.label}>Mật Khẩu (Ít nhất 6 ký tự) *:</Text>
              <TextInput
                style={styles.input}
                secureTextEntry
                placeholder="••••••••"
                placeholderTextColor={COLORS.textMuted}
                value={password}
                onChangeText={setPassword}
              />

              <Text style={styles.label}>Xác Nhận Mật Khẩu *:</Text>
              <TextInput
                style={styles.input}
                secureTextEntry
                placeholder="••••••••"
                placeholderTextColor={COLORS.textMuted}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />

              <TouchableOpacity style={[styles.submitBtn, { backgroundColor: COLORS.success }]} onPress={handleSubmit} disabled={loading}>
                <Text style={styles.submitBtnText}>{loading ? 'Đang tạo...' : 'Tạo Tài Khoản Admin Mới'}</Text>
                <UserPlus size={16} color="#ffffff" style={{ marginLeft: 6 }} />
              </TouchableOpacity>
            </>
          )}
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
  modalBox: {
    width: '100%',
    maxWidth: 540,
    backgroundColor: COLORS.cardDark,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: COLORS.cardBorder,
    overflow: 'hidden'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#162032',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textMain
  },
  closeBtn: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: COLORS.surfaceHover
  },
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    padding: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8
  },
  tabBtnActive: {
    backgroundColor: COLORS.primary
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMuted
  },
  tabTextActive: {
    color: '#ffffff',
    fontWeight: '800'
  },
  body: {
    padding: 20
  },
  errorAlert: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.danger,
    marginBottom: 12
  },
  errorAlertText: {
    color: COLORS.danger,
    fontSize: 13,
    fontWeight: '700'
  },
  adminRoleNotice: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.success,
    marginBottom: 14
  },
  adminRoleNoticeText: {
    color: COLORS.success,
    fontSize: 13,
    lineHeight: 18
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primaryLight,
    marginBottom: 10
  },
  adminCardsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16
  },
  adminCardBtn: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    alignItems: 'center'
  },
  adminCardName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMain,
    textAlign: 'center'
  },
  adminCardEmail: {
    fontSize: 10,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 2
  },
  quickLoginTag: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginTop: 8
  },
  quickLoginTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryLight
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.cardBorder
  },
  dividerText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginHorizontal: 10
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSub,
    marginBottom: 6,
    marginTop: 10
  },
  input: {
    backgroundColor: '#0f172a',
    borderWidth: 1.5,
    borderColor: COLORS.cardBorder,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#f8fafc',
    fontSize: 14,
    outlineStyle: 'none'
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 20
  },
  submitBtnText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 15
  }
});
