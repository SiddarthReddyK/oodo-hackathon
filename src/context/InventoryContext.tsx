import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  Warehouse,
  Operation,
  StockLedgerEntry,
  ProductCategory,
  DashboardFilter,
  LowStockAlert,
  OperationStatus
} from '../types/inventory';
import {
  INITIAL_PRODUCTS,
  INITIAL_WAREHOUSES,
  INITIAL_OPERATIONS,
  INITIAL_LEDGER,
  INITIAL_CATEGORIES
} from '../data/initialData';
import { useAuth } from './AuthContext';
import { api } from '../services/apiClient';

// Modular Services
import {
  computeDashboardKPIs,
  computeLowStockAlerts,
  filterOperationsList
} from '../services/dashboardService';
import {
  generateProductSku,
  createProductRecord,
  applyProductUpdate,
  removeProductRecord,
  resolveLocationLabel,
  resolveWarehouseLabel,
  exportProductsToCsv
} from '../services/productService';
import {
  buildNewOperation,
  processInboundReceipt,
  processOutboundDelivery
} from '../services/operationsService';
import {
  processInternalTransfer,
  executePhysicalStockAdjustment,
  exportStockLedgerToCsv
} from '../services/stockService';

interface InventoryContextType {
  products: Product[];
  warehouses: Warehouse[];
  operations: Operation[];
  ledger: StockLedgerEntry[];
  categories: ProductCategory[];
  filter: DashboardFilter;
  setFilter: React.Dispatch<React.SetStateAction<DashboardFilter>>;
  resetFilter: () => void;
  // Product actions
  addProduct: (
    productData: Omit<Product, 'id' | 'totalStock' | 'updatedAt'>,
    initialQuantity?: number,
    initialWarehouseId?: string,
    initialLocationId?: string
  ) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  generateSku: (name: string, category: string) => string;
  // Operation actions
  createOperation: (
    operationData: Omit<Operation, 'id' | 'code' | 'status' | 'createdBy' | 'creatorName'>
  ) => Operation;
  updateOperationStatus: (id: string, newStatus: OperationStatus) => void;
  validateOperation: (id: string) => { success: boolean; error?: string };
  cancelOperation: (id: string) => void;
  // Adjustment specific
  performStockAdjustment: (
    productId: string,
    warehouseId: string,
    locationId: string,
    countedQty: number,
    reason: string
  ) => void;
  // Warehouse & Category actions
  addWarehouse: (warehouse: Omit<Warehouse, 'id'>) => void;
  updateWarehouse: (id: string, updates: Partial<Warehouse>) => void;
  addCategory: (category: Omit<ProductCategory, 'id'>) => void;
  // Computed metrics
  kpis: {
    totalStockCount: number;
    totalStockValuation: number;
    lowStockCount: number;
    outOfStockCount: number;
    pendingReceiptsCount: number;
    pendingDeliveriesCount: number;
    scheduledTransfersCount: number;
  };
  lowStockAlerts: LowStockAlert[];
  getFilteredOperations: () => Operation[];
  getLocationName: (warehouseId?: string, locationId?: string) => string;
  getWarehouseName: (warehouseId?: string) => string;
  exportLedgerCsv: () => void;
  exportProductsCsv: () => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

const PRODUCTS_KEY = 'stocksense_products_v1';
const OPERATIONS_KEY = 'stocksense_operations_v1';
const LEDGER_KEY = 'stocksense_ledger_v1';
const WAREHOUSES_KEY = 'stocksense_warehouses_v1';
const CATEGORIES_KEY = 'stocksense_categories_v1';

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isAuthenticated } = useAuth();

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(PRODUCTS_KEY);
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [warehouses, setWarehouses] = useState<Warehouse[]>(() => {
    const saved = localStorage.getItem(WAREHOUSES_KEY);
    return saved ? JSON.parse(saved) : INITIAL_WAREHOUSES;
  });

  const [operations, setOperations] = useState<Operation[]>(() => {
    const saved = localStorage.getItem(OPERATIONS_KEY);
    if (saved) {
      try {
        const parsed: Operation[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse saved operations', e);
      }
    }
    return INITIAL_OPERATIONS;
  });

  const [ledger, setLedger] = useState<StockLedgerEntry[]>(() => {
    const saved = localStorage.getItem(LEDGER_KEY);
    return saved ? JSON.parse(saved) : INITIAL_LEDGER;
  });

  const [categories, setCategories] = useState<ProductCategory[]>(() => {
    const saved = localStorage.getItem(CATEGORIES_KEY);
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [filter, setFilter] = useState<DashboardFilter>({
    documentType: 'all',
    status: 'all',
    warehouseId: 'all',
    category: 'all',
    searchQuery: ''
  });

  // Sync with backend API when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    let isMounted = true;
    const fetchBackendData = async () => {
      try {
        const [prodRes, opsRes, ledgRes, whRes] = await Promise.allSettled([
          api.get<Product[]>('/api/products'),
          api.get<Operation[]>('/api/operations'),
          api.get<StockLedgerEntry[]>('/api/stock/ledger'),
          api.get<Warehouse[]>('/api/products/meta/warehouses')
        ]);

        if (!isMounted) return;

        if (prodRes.status === 'fulfilled' && Array.isArray(prodRes.value) && prodRes.value.length > 0) {
          setProducts(prodRes.value);
        }
        if (opsRes.status === 'fulfilled' && Array.isArray(opsRes.value) && opsRes.value.length > 0) {
          setOperations(opsRes.value);
        }
        if (ledgRes.status === 'fulfilled' && Array.isArray(ledgRes.value) && ledgRes.value.length > 0) {
          setLedger(ledgRes.value);
        }
        if (whRes.status === 'fulfilled' && Array.isArray(whRes.value) && whRes.value.length > 0) {
          setWarehouses(whRes.value);
        }
      } catch (err) {
        console.warn('Backend sync error (running in local mode):', err);
      }
    };

    fetchBackendData();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(OPERATIONS_KEY, JSON.stringify(operations));
  }, [operations]);

  useEffect(() => {
    localStorage.setItem(LEDGER_KEY, JSON.stringify(ledger));
  }, [ledger]);

  useEffect(() => {
    localStorage.setItem(WAREHOUSES_KEY, JSON.stringify(warehouses));
  }, [warehouses]);

  useEffect(() => {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  }, [categories]);

  // Filter Reset
  const resetFilter = () => {
    setFilter({
      documentType: 'all',
      status: 'all',
      warehouseId: 'all',
      category: 'all',
      searchQuery: ''
    });
  };

  const generateSku = (name: string, category: string): string => {
    return generateProductSku(name, category);
  };

  const getLocationName = (warehouseId?: string, locationId?: string): string => {
    return resolveLocationLabel(warehouses, warehouseId, locationId);
  };

  const getWarehouseName = (warehouseId?: string): string => {
    return resolveWarehouseLabel(warehouses, warehouseId);
  };

  const addProduct = (
    productData: Omit<Product, 'id' | 'totalStock' | 'updatedAt'>,
    initialQuantity = 0,
    initialWarehouseId = 'wh-northdock',
    initialLocationId = 'loc-dock-01'
  ): Product => {
    const { product, ledgerEntry } = createProductRecord(
      productData,
      initialQuantity,
      initialWarehouseId,
      initialLocationId,
      currentUser
    );

    setProducts(prev => [product, ...prev]);
    if (ledgerEntry) {
      setLedger(prev => [ledgerEntry, ...prev]);
    }

    // Async sync with backend
    api.post('/api/products', {
      productData,
      initialQuantity,
      initialWarehouseId,
      initialLocationId
    }).catch(err => console.warn('Could not sync new product to backend:', err));

    return product;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => applyProductUpdate(prev, id, updates));
    api.put(`/api/products/${id}`, updates).catch(err =>
      console.warn('Could not sync product update to backend:', err)
    );
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => removeProductRecord(prev, id));
    api.delete(`/api/products/${id}`).catch(err =>
      console.warn('Could not sync product deletion to backend:', err)
    );
  };

  const addWarehouse = (whData: Omit<Warehouse, 'id'>) => {
    const newWh: Warehouse = {
      ...whData,
      id: `wh-${Date.now()}`
    };
    setWarehouses(prev => [...prev, newWh]);
    api.post('/api/products/meta/warehouses', whData).catch(err =>
      console.warn('Could not sync warehouse to backend:', err)
    );
  };

  const updateWarehouse = (id: string, updates: Partial<Warehouse>) => {
    setWarehouses(prev => prev.map(w => (w.id === id ? { ...w, ...updates } : w)));
  };

  const addCategory = (catData: Omit<ProductCategory, 'id'>) => {
    const newCat: ProductCategory = {
      ...catData,
      id: `cat-${Date.now()}`
    };
    setCategories(prev => [...prev, newCat]);
  };

  const exportProductsCsv = () => {
    exportProductsToCsv(products);
  };

  const createOperation = (
    opData: Omit<Operation, 'id' | 'code' | 'status' | 'createdBy' | 'creatorName'>
  ): Operation => {
    const newOp = buildNewOperation(opData, operations.length, currentUser);
    setOperations(prev => [newOp, ...prev]);

    // Asynchronously sync with backend endpoint based on operation type
    const endpoint =
      opData.type === 'receipt'
        ? '/api/operations/receipts'
        : opData.type === 'delivery'
        ? '/api/operations/deliveries'
        : opData.type === 'internal'
        ? '/api/stock/transfers'
        : null;

    if (endpoint) {
      api.post(endpoint, opData).catch(err =>
        console.warn(`Could not sync ${opData.type} operation to backend:`, err)
      );
    }

    return newOp;
  };

  const updateOperationStatus = (id: string, newStatus: OperationStatus) => {
    setOperations(prev => prev.map(op => (op.id === id ? { ...op, status: newStatus } : op)));
  };

  const cancelOperation = (id: string) => {
    updateOperationStatus(id, 'canceled');
    api.put(`/api/operations/${id}/cancel`).catch(err =>
      console.warn('Could not sync operation cancellation to backend:', err)
    );
  };

  const validateOperation = (id: string): { success: boolean; error?: string } => {
    const op = operations.find(o => o.id === id);
    if (!op) return { success: false, error: 'Operation not found' };
    if (op.status === 'done') return { success: false, error: 'Operation already completed' };
    if (op.status === 'canceled') return { success: false, error: 'Cannot validate canceled operation' };

    const operatorName = currentUser?.name || op.creatorName;
    const operatorId = currentUser?.id || op.createdBy;
    const nowIso = new Date().toISOString();

    if (op.type === 'receipt') {
      const res = processInboundReceipt(op, products, warehouses, operatorName, operatorId, nowIso);
      if (!res.success) return { success: false, error: res.error };

      setProducts(res.updatedProducts);
      setLedger(prev => [...res.ledgerEntries, ...prev]);
      setOperations(prev =>
        prev.map(o => (o.id === id ? { ...o, status: 'done', completedAt: nowIso } : o))
      );

      api.put(`/api/operations/receipts/${id}/receive`, { operatorId, operatorName }).catch(err =>
        console.warn('Could not sync receipt execution to backend:', err)
      );

      return { success: true };
    }

    if (op.type === 'delivery') {
      const res = processOutboundDelivery(op, products, warehouses, operatorName, operatorId, nowIso);
      if (!res.success) return { success: false, error: res.error };

      setProducts(res.updatedProducts);
      setLedger(prev => [...res.ledgerEntries, ...prev]);
      setOperations(prev =>
        prev.map(o => (o.id === id ? { ...o, status: 'done', completedAt: nowIso } : o))
      );

      api.put(`/api/operations/deliveries/${id}/dispatch`, { operatorId, operatorName }).catch(err =>
        console.warn('Could not sync delivery dispatch to backend:', err)
      );

      return { success: true };
    }

    if (op.type === 'internal') {
      const res = processInternalTransfer(op, products, warehouses, operatorName, operatorId, nowIso);
      if (!res.success) return { success: false, error: res.error };

      setProducts(res.updatedProducts);
      setLedger(prev => [...res.ledgerEntries, ...prev]);
      setOperations(prev =>
        prev.map(o => (o.id === id ? { ...o, status: 'done', completedAt: nowIso } : o))
      );

      api.put(`/api/stock/transfers/${id}/complete`, { operatorId, operatorName }).catch(err =>
        console.warn('Could not sync internal transfer to backend:', err)
      );

      return { success: true };
    }

    return { success: false, error: 'Unknown operation type' };
  };

  const performStockAdjustment = (
    productId: string,
    warehouseId: string,
    locationId: string,
    countedQty: number,
    reason: string
  ) => {
    const operatorName = currentUser?.name || 'Inventory Auditor';
    const operatorId = currentUser?.id || 'usr-auditor';
    const nowIso = new Date().toISOString();

    const res = executePhysicalStockAdjustment(
      products,
      warehouses,
      operations.length,
      productId,
      warehouseId,
      locationId,
      countedQty,
      reason,
      currentUser
    );

    if (res) {
      setProducts(res.updatedProducts);
      setOperations(prev => [res.newOperation, ...prev]);
      setLedger(prev => [res.ledgerEntry, ...prev]);

      api.post('/api/stock/adjustments', {
        productId,
        warehouseId,
        locationId,
        countedQty,
        reason,
        operatorId,
        operatorName
      }).catch(err => console.warn('Could not sync stock adjustment to backend:', err));
    }
  };

  const exportLedgerCsv = () => {
    exportStockLedgerToCsv(ledger);
  };

  // Computed metrics
  const kpis = computeDashboardKPIs(products, operations);
  const lowStockAlerts = computeLowStockAlerts(products);

  const getFilteredOperations = (): Operation[] => {
    return filterOperationsList(operations, products, filter);
  };

  return (
    <InventoryContext.Provider
      value={{
        products,
        warehouses,
        operations,
        ledger,
        categories,
        filter,
        setFilter,
        resetFilter,
        addProduct,
        updateProduct,
        deleteProduct,
        generateSku,
        createOperation,
        updateOperationStatus,
        validateOperation,
        cancelOperation,
        performStockAdjustment,
        addWarehouse,
        updateWarehouse,
        addCategory,
        kpis,
        lowStockAlerts,
        getFilteredOperations,
        getLocationName,
        getWarehouseName,
        exportLedgerCsv,
        exportProductsCsv
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
