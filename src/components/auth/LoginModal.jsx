import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from '../common/RNBridge';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../theme/colors';
import { ShieldCheck, User, Lock, ArrowRight, X } from 'lucide-react';

export const LoginModal = ({ visible, onClose }) => {
  const { availableAdmins, loginAdmin, loginCustom } = useAuth();

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  const handleCustomLogin = () => {
    if (!email) {
      alert('Vui lòng nhập Email Admin!');
      return;
    }
    loginCustom(email, name);
    onClose();
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.modalBox}>
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <ShieldCheck size={22} color={COLORS.primaryLight} />
            <Text style={styles.headerTitle}>Đăng Nhập Tài Khoản Admin</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={styles.body}>
          <Text style={styles.sectionLabel}>⚡ Chọn Nhanh Tài Khoản Admin Quản Lý:</Text>
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
                  <Text style={styles.quickLoginTagText}>Vào thao tác ➔</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Hoặc Đăng Nhập Email Mới</Text>
            <View style={styles.dividerLine} />
          </View>

          <Text style={styles.label}>Tên Admin Quản Lý:</Text>
          <TextInput
            style={styles.input}
            placeholder="Ví dụ: Admin Thanh"
            placeholderTextColor={COLORS.textMuted}
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Email Admin:</Text>
          <TextInput
            style={styles.input}
            placeholder="admin@thanhstore.vn"
            placeholderTextColor={COLORS.textMuted}
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>Mật khẩu:</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor={COLORS.textMuted}
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity style={styles.submitBtn} onPress={handleCustomLogin}>
            <Text style={styles.submitBtnText}>Đăng Nhập Ngay</Text>
            <ArrowRight size={16} color="#ffffff" style={{ marginLeft: 6 }} />
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
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    padding: 16
  },
  modalBox: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: COLORS.cardDark,
    borderRadius: 16,
    borderWidth: 1,
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
    fontWeight: '700',
    color: COLORS.textMain
  },
  closeBtn: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: COLORS.surfaceHover
  },
  body: {
    padding: 20
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
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSub,
    marginBottom: 4,
    marginTop: 8
  },
  input: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: COLORS.textMain,
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
    marginTop: 16
  },
  submitBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14
  }
});
