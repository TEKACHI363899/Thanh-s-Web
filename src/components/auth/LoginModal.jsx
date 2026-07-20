import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from '../common/RNBridge';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../theme/colors';
import { ShieldCheck, User, Lock, ArrowRight, X, UserPlus, LogIn, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';

export const LoginModal = ({ visible, onClose }) => {
  const { loginWithFirebase, signUpWithFirebase } = useAuth();

  // Mode: 'SIGNIN' or 'SIGNUP'
  const [authMode, setAuthMode] = useState('SIGNIN');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuthSubmit = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Vui lòng điền đầy đủ Email và Mật khẩu!');
      return;
    }

    setLoading(true);

    if (authMode === 'SIGNUP') {
      if (!name.trim()) {
        setErrorMessage('Vui lòng nhập Tên Admin / Người quản lý!');
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Mật khẩu xác nhận không khớp!');
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Mật khẩu phải chứa ít nhất 6 ký tự!');
        setLoading(false);
        return;
      }

      // Call Firebase Auth Sign Up
      const res = await signUpWithFirebase(email, password, name);
      if (res.success) {
        setSuccessMessage(`🎉 Đăng ký thành công tài khoản Admin cho "${email}"!`);
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setErrorMessage(res.error);
      }
    } else {
      // Call Firebase Auth Sign In
      const res = await loginWithFirebase(email, password);
      if (res.success) {
        setSuccessMessage('🎉 Đăng nhập thành công!');
        setTimeout(() => {
          onClose();
        }, 800);
      } else {
        setErrorMessage(res.error);
      }
    }

    setLoading(false);
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.modalBox}>
        {/* Modal Header */}
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={styles.headerIconCircle}>
              <ShieldCheck size={20} color={COLORS.primaryLight} />
            </View>
            <View>
              <Text style={styles.headerTitle}>Hệ Thống Đăng Nhập & Đăng Ký Admin</Text>
              <Text style={styles.headerSub}>Google Firebase Realtime Authentication</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Tab Segment Switcher */}
        <View style={styles.tabSwitcher}>
          <TouchableOpacity
            style={[styles.tabBtn, authMode === 'SIGNIN' && styles.tabBtnActive]}
            onPress={() => {
              setAuthMode('SIGNIN');
              setErrorMessage('');
              setSuccessMessage('');
            }}
          >
            <LogIn size={16} color={authMode === 'SIGNIN' ? '#ffffff' : COLORS.textMuted} style={{ marginRight: 6 }} />
            <Text style={[styles.tabText, authMode === 'SIGNIN' && styles.tabTextActive]}>
              🔑 Đăng Nhập Admin
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, authMode === 'SIGNUP' && styles.tabBtnActive]}
            onPress={() => {
              setAuthMode('SIGNUP');
              setErrorMessage('');
              setSuccessMessage('');
            }}
          >
            <UserPlus size={16} color={authMode === 'SIGNUP' ? '#ffffff' : COLORS.textMuted} style={{ marginRight: 6 }} />
            <Text style={[styles.tabText, authMode === 'SIGNUP' && styles.tabTextActive]}>
              📝 Đăng Ký Admin Mới
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.body}>
          {/* Alert Messages */}
          {errorMessage ? (
            <View style={styles.errorAlert}>
              <AlertCircle size={18} color={COLORS.danger} style={{ marginRight: 8, flexShrink: 0 }} />
              <Text style={styles.errorAlertText}>{errorMessage}</Text>
            </View>
          ) : null}

          {successMessage ? (
            <View style={styles.successAlert}>
              <CheckCircle size={18} color={COLORS.success} style={{ marginRight: 8, flexShrink: 0 }} />
              <Text style={styles.successAlertText}>{successMessage}</Text>
            </View>
          ) : null}

          {authMode === 'SIGNUP' && (
            <View style={styles.adminBadgeNotice}>
              <Text style={styles.adminBadgeNoticeText}>
                
              </Text>
            </View>
          )}

          {authMode === 'SIGNUP' && (
            <>
              <Text style={styles.inputLabel}>Tên Admin / Tên Người Quản Lý *:</Text>
              <View style={styles.inputWrapper}>
                <User size={18} color={COLORS.textMuted} style={{ marginRight: 10 }} />
                <TextInput
                  style={styles.inputField}
                  placeholder="Ví dụ: Admin Thanh, Quản lý Kho 1..."
                  placeholderTextColor={COLORS.textMuted}
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </>
          )}

          <Text style={styles.inputLabel}>Email Đăng Nhập / Đăng Ký *:</Text>
          <View style={styles.inputWrapper}>
            <User size={18} color={COLORS.textMuted} style={{ marginRight: 10 }} />
            <TextInput
              style={styles.inputField}
              placeholder="admin@thanhstore.vn"
              placeholderTextColor={COLORS.textMuted}
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <Text style={styles.inputLabel}>Mật Khẩu *:</Text>
          <View style={styles.inputWrapper}>
            <Lock size={18} color={COLORS.textMuted} style={{ marginRight: 10 }} />
            <TextInput
              style={styles.inputField}
              secureTextEntry={!showPassword}
              placeholder="••••••••"
              placeholderTextColor={COLORS.textMuted}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 4 }}>
              {showPassword ? <EyeOff size={18} color={COLORS.textMuted} /> : <Eye size={18} color={COLORS.textMuted} />}
            </TouchableOpacity>
          </View>

          {authMode === 'SIGNUP' && (
            <>
              <Text style={styles.inputLabel}>Xác Nhận Mật Khẩu *:</Text>
              <View style={styles.inputWrapper}>
                <Lock size={18} color={COLORS.textMuted} style={{ marginRight: 10 }} />
                <TextInput
                  style={styles.inputField}
                  secureTextEntry={!showPassword}
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.textMuted}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              </View>
            </>
          )}

          {/* Submit Button */}
          <TouchableOpacity 
            style={[styles.submitBtn, authMode === 'SIGNUP' && { backgroundColor: COLORS.success }]} 
            onPress={handleAuthSubmit} 
            disabled={loading}
          >
            <Text style={styles.submitBtnText}>
              {loading ? 'Đang xử lý...' : (authMode === 'SIGNIN' ? 'Đăng Nhập Ngay' : 'Tạo Tài Khoản Admin')}
            </Text>
            {authMode === 'SIGNIN' ? (
              <ArrowRight size={18} color="#ffffff" style={{ marginLeft: 8 }} />
            ) : (
              <UserPlus size={18} color="#ffffff" style={{ marginLeft: 8 }} />
            )}
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
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    padding: 16
  },
  modalBox: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: COLORS.cardDark,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.cardBorder,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingVertical: 18,
    backgroundColor: '#162032',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder
  },
  headerIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.textMain
  },
  headerSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
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
    paddingVertical: 12,
    borderRadius: 10
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
    padding: 22
  },
  errorAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.danger,
    marginBottom: 14
  },
  errorAlertText: {
    color: COLORS.danger,
    fontSize: 13,
    fontWeight: '700',
    flex: 1
  },
  successAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.success,
    marginBottom: 14
  },
  successAlertText: {
    color: COLORS.success,
    fontSize: 13,
    fontWeight: '700',
    flex: 1
  },
  adminBadgeNotice: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    marginBottom: 16
  },
  adminBadgeNoticeText: {
    color: COLORS.success,
    fontSize: 13,
    lineHeight: 18
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSub,
    marginBottom: 6,
    marginTop: 12
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderWidth: 1.5,
    borderColor: COLORS.cardBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 4
  },
  inputField: {
    flex: 1,
    paddingVertical: 10,
    color: '#f8fafc',
    fontSize: 14
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 24,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10
  },
  submitBtnText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 15
  }
});
