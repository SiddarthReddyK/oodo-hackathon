export type UserRole = 'inventory_manager' | 'warehouse_staff';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  warehouseId: string;
  title: string;
  passwordHash?: string;
}

export type UnitOfMeasure = 'Units' | 'kg' | 'Meters' | 'Boxes' | 'Liters' | 'Pallets';

export interface ProductCategory {
  id: string;
  name: string;
  description: string;
  color: string;
}

export interface LocationStock {
  warehouseId: string;
  locationId: string;
  quantity: number;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  unit: UnitOfMeasure;
  costPrice: number;
  salesPrice: number;
  minReorderLevel: number;
  maxTargetLevel: number;
  totalStock: number;
  locations: LocationStock[];
  description?: string;
  barcode?: string;
  updatedAt: string;
}

export type OperationType = 'receipt' | 'delivery' | 'internal' | 'adjustment';
export type OperationStatus = 'draft' | 'waiting' | 'ready' | 'done' | 'canceled';

export interface OperationItem {
  productId: string;
  productName: string;
  sku: string;
  unit: UnitOfMeasure;
  quantity: number;
  unitPrice?: number;
  pickedQuantity?: number;
  receivedQuantity?: number;
}

export interface Operation {
  id: string;
  code: string; // e.g. REC-2026-001, DEL-2026-002, TRF-2026-003, ADJ-2026-004
  type: OperationType;
  status: OperationStatus;
  date: string;
  scheduledDate?: string;
  partnerName?: string; // Supplier for receipt, Customer for delivery
  sourceWarehouseId?: string;
  sourceLocationId?: string;
  destinationWarehouseId?: string;
  destinationLocationId?: string;
  items: OperationItem[];
  createdBy: string;
  creatorName: string;
  notes?: string;
  adjustmentReason?: string;
  completedAt?: string;
}

export interface StockLedgerEntry {
  id: string;
  timestamp: string;
  documentRef: string;
  operationType: OperationType;
  productId: string;
  productName: string;
  sku: string;
  fromLocation: string; // e.g. "Vendor (External)" or "Main Store / Rack A"
  toLocation: string;   // e.g. "Main Store / Production Rack" or "Customer (External)"
  quantityDelta: number; // +50 or -20
  unit: UnitOfMeasure;
  balanceAfter: number;
  operatorId: string;
  operatorName: string;
  reason?: string;
}

export interface WarehouseLocation {
  id: string;
  code: string;
  name: string;
  zone: string;
  type: 'rack' | 'dock' | 'floor' | 'bulk';
}

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  address: string;
  manager: string;
  locations: WarehouseLocation[];
  capacityUnit: string;
  maxCapacity: number;
  currentOccupancy: number;
}

export interface DashboardFilter {
  documentType: OperationType | 'all';
  status: OperationStatus | 'all';
  warehouseId: string;
  category: string;
  searchQuery: string;
}

export interface LowStockAlert {
  product: Product;
  deficit: number;
  urgency: 'critical' | 'warning';
}
