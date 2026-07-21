import React, { useState } from 'react';
import { View, StyleSheet } from './components/common/RNBridge';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { OrderDataGrid } from './components/orders/OrderDataGrid';
import { ProductList } from './components/products/ProductList';
import { FinanceModule } from './components/finance/FinanceModule';
import { LoginModal } from './components/auth/LoginModal';
import { BatchManagementModal } from './components/batches/BatchManagementModal';
import { OrderFormModal } from './components/orders/OrderFormModal';
import { SettingsModal } from './components/settings/SettingsModal';

export const AppContent = () => {
  const { isAuthModalOpen, openAuthModal, closeAuthModal, requireAdmin } = useAuth();
  const { themeObj } = useTheme();

  // Main Navigation State
  const [activeTab, setActiveTab] = useState('ORDERS');
  const [collapsed, setCollapsed] = useState(false);

  // Global Modals State
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const handleOpenBatchModal = () => {
    requireAdmin(() => setIsBatchModalOpen(true), 'Vui lòng đăng nhập Admin để quản lý lô hàng!');
  };

  const handleOpenOrderModal = () => {
    requireAdmin(() => setIsOrderModalOpen(true), 'Vui lòng đăng nhập Admin để tạo đơn hàng!');
  };

  return (
    <View style={[styles.appWrapper, { backgroundColor: themeObj.colors.bgDark }]}>
      {/* Collapsible Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        collapsed={collapsed} 
        setCollapsed={setCollapsed}
        onOpenBatchModal={handleOpenBatchModal}
        onOpenOrderModal={handleOpenOrderModal}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
      />

      {/* Main Content Workspace */}
      <View style={styles.mainLayout}>
        <Header 
          activeTab={activeTab} 
          onToggleSidebar={() => setCollapsed(!collapsed)}
          onOpenAuthModal={openAuthModal} 
        />

        <View style={styles.contentBody}>
          {activeTab === 'ORDERS' && <OrderDataGrid />}
          {activeTab === 'PRODUCTS' && <ProductList />}
          {activeTab === 'FINANCE' && <FinanceModule />}
        </View>
      </View>

      {/* Modals */}
      <LoginModal 
        visible={isAuthModalOpen} 
        onClose={closeAuthModal} 
      />

      <BatchManagementModal
        visible={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
      />

      <OrderFormModal
        visible={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
      />

      <SettingsModal
        visible={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </View>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <AppContent />
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  appWrapper: {
    flex: 1,
    height: '100vh',
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    overflow: 'hidden'
  },
  mainLayout: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  contentBody: {
    flex: 1,
    overflow: 'hidden'
  }
});
