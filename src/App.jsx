import React, { useState } from 'react';
import { View, StyleSheet } from './components/common/RNBridge';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { OrderDataGrid } from './components/orders/OrderDataGrid';
import { ProductList } from './components/products/ProductList';
import { FinanceModule } from './components/finance/FinanceModule';
import { LoginModal } from './components/auth/LoginModal';
import { BatchManagementModal } from './components/batches/BatchManagementModal';
import { OrderFormModal } from './components/orders/OrderFormModal';

export const AppContent = () => {
  // Main Navigation State
  const [activeTab, setActiveTab] = useState('ORDERS');
  const [collapsed, setCollapsed] = useState(false);

  // Global Modals State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  return (
    <View style={styles.appWrapper}>
      {/* Collapsible Sidebar (Sidebar thò thụt) */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        collapsed={collapsed} 
        setCollapsed={setCollapsed}
        onOpenBatchModal={() => setIsBatchModalOpen(true)}
        onOpenOrderModal={() => setIsOrderModalOpen(true)}
      />

      {/* Main Content Workspace */}
      <View style={styles.mainLayout}>
        <Header 
          activeTab={activeTab} 
          onToggleSidebar={() => setCollapsed(!collapsed)}
          onOpenAuthModal={() => setIsAuthModalOpen(true)} 
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
        onClose={() => setIsAuthModalOpen(false)} 
      />

      <BatchManagementModal
        visible={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
      />

      <OrderFormModal
        visible={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
      />
    </View>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
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
