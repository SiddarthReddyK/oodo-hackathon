import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { InventoryProvider } from './context/InventoryContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthGuard } from './components/auth/AuthGuard';
import { Navbar, NavTab } from './components/layout/Navbar';
import { DashboardView } from './components/dashboard/DashboardView';
import { ProductsView } from './components/products/ProductsView';
import { ReceiptsView } from './components/operations/ReceiptsView';
import { ReceiptDetailView } from './components/operations/ReceiptDetailView';
import { DeliveriesView } from './components/operations/DeliveriesView';
import { DeliveryDetailView } from './components/operations/DeliveryDetailView';
import { TransfersView } from './components/operations/TransfersView';
import { TransferDetailView } from './components/operations/TransferDetailView';
import { AdjustmentsView } from './components/operations/AdjustmentsView';
import { AdjustmentDetailView } from './components/operations/AdjustmentDetailView';
import { LedgerView } from './components/ledger/LedgerView';
import { SettingsView } from './components/Settings/SettingsView';
import { QuickActionModal } from './components/dashboard/QuickActionModal';
import { ReceiptModal } from './components/operations/ReceiptModal';
import { DeliveryModal } from './components/operations/DeliveryModal';
import { TransferModal } from './components/operations/TransferModal';
import { AdjustmentModal } from './components/operations/AdjustmentModal';
import { ProductFormModal } from './components/products/ProductFormModal';
import { ProfileModal } from './components/profile/ProfileModal';
import { Operation, Product } from './types/inventory';

function MainApp() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  // Modal triggers
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Inspected details for deep dive views
  const [inspectedReceipt, setInspectedReceipt] = useState<Operation | null>(null);
  const [inspectedDelivery, setInspectedDelivery] = useState<Operation | null>(null);
  const [inspectedTransfer, setInspectedTransfer] = useState<Operation | null>(null);
  const [inspectedAdjustment, setInspectedAdjustment] = useState<Operation | null>(null);

  const [reorderProductId, setReorderProductId] = useState<string | undefined>(undefined);
  const [transferInitialProduct, setTransferInitialProduct] = useState<Product | null>(null);
  const [transferInitialSourceWhId, setTransferInitialSourceWhId] = useState<string | undefined>(undefined);
  const [transferInitialSourceLocId, setTransferInitialSourceLocId] = useState<string | undefined>(undefined);
  const [adjustmentProductId, setAdjustmentProductId] = useState<string | undefined>(undefined);

  const handleInitiateReorder = (productId: string) => {
    setReorderProductId(productId);
    setIsReceiptModalOpen(true);
  };

  const handleInitiateTransfer = (product: Product, srcWhId: string, srcLocId: string) => {
    setTransferInitialProduct(product);
    setTransferInitialSourceWhId(srcWhId);
    setTransferInitialSourceLocId(srcLocId);
    setIsTransferModalOpen(true);
  };

  const handleInitiateAdjustment = (productId: string) => {
    setAdjustmentProductId(productId);
    setIsAdjustmentModalOpen(true);
  };

  const handleInspectOperationFromDashboard = (op: Operation) => {
    if (op.type === 'receipt') {
      setInspectedReceipt(op);
      setActiveTab('receipts');
    } else if (op.type === 'delivery') {
      setInspectedDelivery(op);
      setActiveTab('deliveries');
    } else if (op.type === 'internal') {
      setInspectedTransfer(op);
      setActiveTab('transfers');
    } else if (op.type === 'adjustment') {
      setInspectedAdjustment(op);
      setActiveTab('adjustments');
    }
  };

  return (
    <div className="min-h-screen w-screen bg-[#f4efe6] dark:bg-[#0f1815] text-[#132622] dark:text-[#f8fafc] font-sans flex flex-col selection:bg-[#152e28] selection:text-white">
      {/* 1. Top Navbar with Theme Toggle */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          // Reset inspections when navigating between tabs
          if (tab !== 'receipts') setInspectedReceipt(null);
          if (tab !== 'deliveries') setInspectedDelivery(null);
          if (tab !== 'transfers') setInspectedTransfer(null);
          if (tab !== 'adjustments') setInspectedAdjustment(null);
        }}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />

      {/* 2. Main Content Canvas */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <DashboardView
              onSelectTab={setActiveTab}
              onOpenQuickAction={() => setIsQuickActionOpen(true)}
              onInspectOperation={handleInspectOperationFromDashboard}
              onInitiateReorder={handleInitiateReorder}
            />
          )}

          {/* Receipts Tab (List or Detail view) */}
          {activeTab === 'receipts' && (
            inspectedReceipt ? (
              <ReceiptDetailView
                receipt={inspectedReceipt}
                onBack={() => setInspectedReceipt(null)}
              />
            ) : (
              <ReceiptsView
                onOpenNewReceipt={() => {
                  setReorderProductId(undefined);
                  setIsReceiptModalOpen(true);
                }}
                onInspectReceipt={(op) => setInspectedReceipt(op)}
              />
            )
          )}

          {/* Deliveries Tab (List or Detail view) */}
          {activeTab === 'deliveries' && (
            inspectedDelivery ? (
              <DeliveryDetailView
                delivery={inspectedDelivery}
                onBack={() => setInspectedDelivery(null)}
              />
            ) : (
              <DeliveriesView
                onOpenNewDelivery={() => setIsDeliveryModalOpen(true)}
                onInspectDelivery={(op) => setInspectedDelivery(op)}
              />
            )
          )}

          {/* Transfers Tab (List or Detail view) */}
          {activeTab === 'transfers' && (
            inspectedTransfer ? (
              <TransferDetailView
                transfer={inspectedTransfer}
                onBack={() => setInspectedTransfer(null)}
              />
            ) : (
              <TransfersView
                onOpenNewTransfer={() => {
                  setTransferInitialProduct(null);
                  setIsTransferModalOpen(true);
                }}
                onInspectTransfer={(op) => setInspectedTransfer(op)}
              />
            )
          )}

          {/* Adjustments Tab (List or Detail view) */}
          {activeTab === 'adjustments' && (
            inspectedAdjustment ? (
              <AdjustmentDetailView
                adjustment={inspectedAdjustment}
                onBack={() => setInspectedAdjustment(null)}
              />
            ) : (
              <AdjustmentsView
                onOpenNewAdjustment={() => {
                  setAdjustmentProductId(undefined);
                  setIsAdjustmentModalOpen(true);
                }}
                onInspectAdjustment={(op) => setInspectedAdjustment(op)}
              />
            )
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <ProductsView
              onInitiateReorder={handleInitiateReorder}
              onInitiateTransfer={handleInitiateTransfer}
              onInitiateAdjustment={handleInitiateAdjustment}
            />
          )}

          {/* Move History / Ledger Tab */}
          {activeTab === 'move_history' && <LedgerView />}

          {/* Settings Tab */}
          {activeTab === 'settings' && <SettingsView />}
        </div>
      </main>

      {/* 3. Global Action & Form Modals */}
      <QuickActionModal
        isOpen={isQuickActionOpen}
        onClose={() => setIsQuickActionOpen(false)}
        onOpenReceipt={() => setIsReceiptModalOpen(true)}
        onOpenDelivery={() => setIsDeliveryModalOpen(true)}
        onOpenTransfer={() => setIsTransferModalOpen(true)}
        onOpenAdjustment={() => setIsAdjustmentModalOpen(true)}
        onOpenNewProduct={() => setIsNewProductModalOpen(true)}
      />

      <ReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => {
          setIsReceiptModalOpen(false);
          setReorderProductId(undefined);
        }}
        preselectedProductId={reorderProductId}
      />

      <DeliveryModal
        isOpen={isDeliveryModalOpen}
        onClose={() => setIsDeliveryModalOpen(false)}
      />

      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => {
          setIsTransferModalOpen(false);
          setTransferInitialProduct(null);
          setTransferInitialSourceWhId(undefined);
          setTransferInitialSourceLocId(undefined);
        }}
        initialProduct={transferInitialProduct}
        initialSourceWhId={transferInitialSourceWhId}
        initialSourceLocId={transferInitialSourceLocId}
      />

      <AdjustmentModal
        isOpen={isAdjustmentModalOpen}
        onClose={() => {
          setIsAdjustmentModalOpen(false);
          setAdjustmentProductId(undefined);
        }}
        preselectedProductId={adjustmentProductId}
      />

      <ProductFormModal
        isOpen={isNewProductModalOpen}
        onClose={() => setIsNewProductModalOpen(false)}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <InventoryProvider>
          <AuthGuard>
            <MainApp />
          </AuthGuard>
        </InventoryProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
