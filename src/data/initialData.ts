import { Product, Warehouse, Operation, StockLedgerEntry, ProductCategory, User } from '../types/inventory';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-1',
    name: 'Dexter Morgan',
    email: 'dexter.morgan@stocksense.io',
    role: 'inventory_manager',
    title: 'Operations lead',
    warehouseId: 'wh-northdock',
    avatarUrl: '/src/assets/images/stocksense_user_avatar_1790401027960.jpg',
    passwordHash: '$2b$10$3.G4ym.Ux/BSiwUY2bLDCehPkBtST/7F0fgj8HW/23AV0k68ju5u6'
  },
  {
    id: 'usr-2',
    name: 'Jamie Wu',
    email: 'jamie.wu@stocksense.io',
    role: 'warehouse_staff',
    title: 'Warehouse Specialist',
    warehouseId: 'wh-northdock',
    avatarUrl: '/src/assets/images/stocksense_user_avatar_1790401027960.jpg',
    passwordHash: '$2b$10$3.G4ym.Ux/BSiwUY2bLDCehPkBtST/7F0fgj8HW/23AV0k68ju5u6'
  }
];

export const INITIAL_CATEGORIES: ProductCategory[] = [
  { id: 'cat-storage', name: 'Storage', description: 'Bins, totes, and containers', color: 'emerald' },
  { id: 'cat-labels', name: 'Labels', description: 'Thermal labels, tags, and markers', color: 'blue' },
  { id: 'cat-packaging', name: 'Packaging', description: 'Stretch film, cartons, and strapping', color: 'amber' },
  { id: 'cat-handling', name: 'Handling', description: 'Pallets, dollies, and skids', color: 'purple' },
  { id: 'cat-safety', name: 'Safety', description: 'PPE, gloves, vests, and guards', color: 'rose' },
  { id: 'cat-equipment', name: 'Equipment', description: 'Hand trucks, jacks, and carts', color: 'slate' }
];

export const INITIAL_WAREHOUSES: Warehouse[] = [
  {
    id: 'wh-northdock',
    code: 'WH-ND',
    name: 'North Dock Warehouse',
    address: '4100 North Harbor Way, Portland, OR 97217',
    manager: 'Dexter Morgan',
    maxCapacity: 10000,
    currentOccupancy: 6940,
    capacityUnit: 'units',
    locations: [
      { id: 'loc-main-stock', code: 'WH-ND/STOCK', name: 'Main Stock', zone: 'Internal', type: 'rack' },
      { id: 'loc-receiving', code: 'WH-ND/RECV', name: 'Receiving Dock', zone: 'Inbound', type: 'dock' },
      { id: 'loc-dispatch', code: 'WH-ND/DISP', name: 'Dispatch', zone: 'Outbound', type: 'dock' },
      { id: 'loc-overflow', code: 'WH-ND/OVFL', name: 'Overflow', zone: 'Internal', type: 'bulk' },
      { id: 'loc-quality', code: 'WH-ND/QA', name: 'Quality Hold', zone: 'Restricted', type: 'floor' },
      { id: 'loc-bay-01', code: 'WH-ND/BAY-01', name: 'Bay 01', zone: 'Inbound', type: 'dock' },
      { id: 'loc-bay-02', code: 'WH-ND/BAY-02', name: 'Bay 02', zone: 'Inbound', type: 'dock' },
      { id: 'loc-bay-04', code: 'WH-ND/BAY-04', name: 'Bay 04', zone: 'Outbound', type: 'dock' }
    ]
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-stacking-bin',
    sku: 'BIN-MD-42',
    name: 'Stacking Bin — Medium',
    category: 'Storage',
    unit: 'Units',
    costPrice: 8.40,
    salesPrice: 14.50,
    minReorderLevel: 40,
    maxTargetLevel: 200,
    totalStock: 116,
    locations: [
      { warehouseId: 'wh-northdock', locationId: 'loc-main-stock', quantity: 116 }
    ],
    description: 'Heavy duty polypropylene stacking bin for warehouse pick lines.',
    updatedAt: '2026-09-26T09:42:00Z'
  },
  {
    id: 'prod-thermal-labels',
    sku: 'LBL-46-500',
    name: 'Thermal Label Roll 4×6',
    category: 'Labels',
    unit: 'Units',
    costPrice: 18.75,
    salesPrice: 28.00,
    minReorderLevel: 50,
    maxTargetLevel: 300,
    totalStock: 160,
    locations: [
      { warehouseId: 'wh-northdock', locationId: 'loc-main-stock', quantity: 160 }
    ],
    description: 'Direct thermal shipping labels, 500 labels per roll.',
    updatedAt: '2026-09-26T09:40:00Z'
  },
  {
    id: 'prod-pallet-wrap',
    sku: 'WRP-CLR-18',
    name: 'Pallet Wrap — Clear',
    category: 'Packaging',
    unit: 'Units',
    costPrice: 14.20,
    salesPrice: 24.00,
    minReorderLevel: 30,
    maxTargetLevel: 150,
    totalStock: 70,
    locations: [
      { warehouseId: 'wh-northdock', locationId: 'loc-main-stock', quantity: 70 }
    ],
    description: '80 gauge industrial cast stretch film hand wrap.',
    updatedAt: '2026-09-25T14:22:00Z'
  },
  {
    id: 'prod-heavy-pallet',
    sku: 'PLT-HD-4840',
    name: 'Heavy-Duty Pallet 48×40',
    category: 'Handling',
    unit: 'Units',
    costPrice: 31.90,
    salesPrice: 48.00,
    minReorderLevel: 30,
    maxTargetLevel: 100,
    totalStock: 28, // Low stock trigger (< 30)
    locations: [
      { warehouseId: 'wh-northdock', locationId: 'loc-overflow', quantity: 28 }
    ],
    description: 'GMA standard 4-way heavy duty industrial wooden pallet.',
    updatedAt: '2026-09-25T11:10:00Z'
  },
  {
    id: 'prod-nitrile-gloves',
    sku: 'PPE-GLV-L',
    name: 'Nitrile Work Gloves — L',
    category: 'Safety',
    unit: 'Units',
    costPrice: 12.60,
    salesPrice: 19.50,
    minReorderLevel: 25,
    maxTargetLevel: 120,
    totalStock: 44,
    locations: [
      { warehouseId: 'wh-northdock', locationId: 'loc-main-stock', quantity: 44 }
    ],
    description: 'Abrasion resistant nitrile micro-foam coated work gloves.',
    updatedAt: '2026-09-25T15:45:00Z'
  },
  {
    id: 'prod-corrugated-carton',
    sku: 'BOX-1812-K',
    name: 'Corrugated Carton 18×12',
    category: 'Packaging',
    unit: 'Units',
    costPrice: 1.85,
    salesPrice: 3.50,
    minReorderLevel: 100,
    maxTargetLevel: 600,
    totalStock: 310,
    locations: [
      { warehouseId: 'wh-northdock', locationId: 'loc-overflow', quantity: 310 }
    ],
    description: 'ECT-32 kraft corrugated shipping boxes.',
    updatedAt: '2026-09-25T16:06:00Z'
  },
  {
    id: 'prod-hand-truck',
    sku: 'EQP-HT-600',
    name: 'Hand Truck — 600 lb',
    category: 'Equipment',
    unit: 'Units',
    costPrice: 126.00,
    salesPrice: 189.00,
    minReorderLevel: 8,
    maxTargetLevel: 20,
    totalStock: 6, // Low stock trigger (< 8)
    locations: [
      { warehouseId: 'wh-northdock', locationId: 'loc-main-stock', quantity: 6 }
    ],
    description: 'Commercial steel convertible hand truck with pneumatic tires.',
    updatedAt: '2026-09-24T10:00:00Z'
  }
];

export const INITIAL_OPERATIONS: Operation[] = [
  // RECEIPTS
  {
    id: 'op-rec-001',
    code: 'WH/IN/0001',
    type: 'receipt',
    status: 'ready',
    date: 'Sep 26, 10:30 AM',
    partnerName: 'Copper & Pine Co.',
    destinationWarehouseId: 'wh-northdock',
    destinationLocationId: 'loc-receiving',
    creatorName: 'Dexter Morgan',
    createdBy: 'usr-1',
    notes: 'Carrier confirmed Bay 03. Driver will call receiving 15 minutes before arrival. FRT-8821 · Cedar Freight. Vendor Ref: CP-PO-11842',
    items: [
      { productId: 'prod-stacking-bin', productName: 'Stacking Bin — Medium', sku: 'BIN-MD-42', unit: 'Units', quantity: 120, unitPrice: 8.40, receivedQuantity: 120 },
      { productId: 'prod-thermal-labels', productName: 'Thermal Label Roll 4×6', sku: 'LBL-46-500', unit: 'Units', quantity: 48, unitPrice: 18.75, receivedQuantity: 48 },
      { productId: 'prod-pallet-wrap', productName: 'Pallet Wrap — Clear', sku: 'WRP-CLR-18', unit: 'Units', quantity: 24, unitPrice: 14.20, receivedQuantity: 24 }
    ]
  },
  {
    id: 'op-rec-002',
    code: 'WH/IN/0002',
    type: 'receipt',
    status: 'draft',
    date: 'Sep 26, 13:00',
    partnerName: 'Brightline Supply',
    destinationWarehouseId: 'wh-northdock',
    destinationLocationId: 'loc-receiving',
    creatorName: 'Eli Navarro',
    createdBy: 'usr-1',
    notes: 'Standard replenishment draft',
    items: [
      { productId: 'prod-nitrile-gloves', productName: 'Nitrile Work Gloves — L', sku: 'PPE-GLV-L', unit: 'Units', quantity: 40, unitPrice: 12.60 }
    ]
  },
  {
    id: 'op-rec-003',
    code: 'WH/IN/0003',
    type: 'receipt',
    status: 'waiting', // Late inbound in UI
    date: 'Sep 26, 07:30',
    partnerName: 'Ironwood Works',
    destinationWarehouseId: 'wh-northdock',
    destinationLocationId: 'loc-overflow',
    creatorName: 'Darren Cole',
    createdBy: 'usr-1',
    notes: 'Late inbound from Ironwood Works (2h 18m late). Tracking: IW-8910.',
    items: [
      { productId: 'prod-heavy-pallet', productName: 'Heavy-Duty Pallet 48×40', sku: 'PLT-HD-4840', unit: 'Units', quantity: 50, unitPrice: 31.90 }
    ]
  },
  {
    id: 'op-rec-004',
    code: 'WH/IN/0004',
    type: 'receipt',
    status: 'done',
    date: 'Sep 25, 15:45',
    partnerName: 'Brightline Supply',
    destinationWarehouseId: 'wh-northdock',
    destinationLocationId: 'loc-receiving',
    creatorName: 'Eli Navarro',
    createdBy: 'usr-1',
    notes: 'Completed stock arrival verified against packing slip.',
    items: [
      { productId: 'prod-nitrile-gloves', productName: 'Nitrile Work Gloves — L', sku: 'PPE-GLV-L', unit: 'Units', quantity: 36, unitPrice: 12.60 }
    ]
  },
  {
    id: 'op-rec-005',
    code: 'WH/IN/0005',
    type: 'receipt',
    status: 'ready',
    date: 'Sep 27, 09:00',
    partnerName: 'Coastal Pack Ltd.',
    destinationWarehouseId: 'wh-northdock',
    destinationLocationId: 'loc-bay-02',
    creatorName: 'June Park',
    createdBy: 'usr-1',
    notes: 'Scheduled container unload Bay 02',
    items: [
      { productId: 'prod-pallet-wrap', productName: 'Pallet Wrap — Clear', sku: 'WRP-CLR-18', unit: 'Units', quantity: 60, unitPrice: 14.20 }
    ]
  },
  {
    id: 'op-rec-006',
    code: 'WH/IN/0006',
    type: 'receipt',
    status: 'draft',
    date: 'Sep 28, 11:15',
    partnerName: 'Alder Office Goods',
    destinationWarehouseId: 'wh-northdock',
    destinationLocationId: 'loc-bay-01',
    creatorName: 'Noah Reid',
    createdBy: 'usr-1',
    notes: 'Pending purchase order approval',
    items: [
      { productId: 'prod-thermal-labels', productName: 'Thermal Label Roll 4×6', sku: 'LBL-46-500', unit: 'Units', quantity: 80, unitPrice: 18.75 }
    ]
  },

  // DELIVERIES
  {
    id: 'op-del-001',
    code: 'WH/OUT/0001',
    type: 'delivery',
    status: 'waiting', // Waiting to pack
    date: 'Sep 26, 12:00 PM',
    partnerName: 'Harbor Stores — East',
    sourceWarehouseId: 'wh-northdock',
    sourceLocationId: 'loc-dispatch',
    creatorName: 'Dexter Morgan',
    createdBy: 'usr-1',
    notes: 'Delivery address: Harbor Stores — East, 18 Pier Avenue. Customer Ref: HS-E-4481. Route: EAST-04 · Harbor Courier',
    items: [
      { productId: 'prod-stacking-bin', productName: 'Stacking Bin — Medium', sku: 'BIN-MD-42', unit: 'Units', quantity: 32, pickedQuantity: 0 },
      { productId: 'prod-thermal-labels', productName: 'Thermal Label Roll 4×6', sku: 'LBL-46-500', unit: 'Units', quantity: 12, pickedQuantity: 0 },
      { productId: 'prod-pallet-wrap', productName: 'Pallet Wrap — Clear', sku: 'WRP-CLR-18', unit: 'Units', quantity: 8, pickedQuantity: 0 }
    ]
  },
  {
    id: 'op-del-002',
    code: 'WH/OUT/0002',
    type: 'delivery',
    status: 'ready',
    date: 'Sep 26, 14:30',
    partnerName: 'Moss & Main — Central',
    sourceWarehouseId: 'wh-northdock',
    sourceLocationId: 'loc-dispatch',
    creatorName: 'Theo Grant',
    createdBy: 'usr-1',
    notes: 'Packed and staged at Door 3',
    items: [
      { productId: 'prod-pallet-wrap', productName: 'Pallet Wrap — Clear', sku: 'WRP-CLR-18', unit: 'Units', quantity: 16, pickedQuantity: 16 }
    ]
  },
  {
    id: 'op-del-003',
    code: 'WH/OUT/0003',
    type: 'delivery',
    status: 'waiting', // Waiting for stock allocation
    date: 'Sep 26, 16:00',
    partnerName: 'Juniper Market — South',
    sourceWarehouseId: 'wh-northdock',
    sourceLocationId: 'loc-dispatch',
    creatorName: 'Priya Shah',
    createdBy: 'usr-1',
    notes: 'Stock allocation required · 3 product lines',
    items: [
      { productId: 'prod-heavy-pallet', productName: 'Heavy-Duty Pallet 48×40', sku: 'PLT-HD-4840', unit: 'Units', quantity: 12, pickedQuantity: 0 }
    ]
  },
  {
    id: 'op-del-004',
    code: 'WH/OUT/0004',
    type: 'delivery',
    status: 'waiting', // Late dispatch
    date: 'Sep 26, 08:15',
    partnerName: 'Harbor Stores — West',
    sourceWarehouseId: 'wh-northdock',
    sourceLocationId: 'loc-bay-04',
    creatorName: 'Marcus Lee',
    createdBy: 'usr-1',
    notes: 'Carrier delayed at dock 4',
    items: [
      { productId: 'prod-corrugated-carton', productName: 'Corrugated Carton 18×12', sku: 'BOX-1812-K', unit: 'Units', quantity: 52, pickedQuantity: 52 }
    ]
  },
  {
    id: 'op-del-005',
    code: 'WH/OUT/0005',
    type: 'delivery',
    status: 'ready',
    date: 'Sep 27, 09:30',
    partnerName: 'Goodland Workshop',
    sourceWarehouseId: 'wh-northdock',
    sourceLocationId: 'loc-dispatch',
    creatorName: 'Sofia Reyes',
    createdBy: 'usr-1',
    notes: 'Pack slip printed',
    items: [
      { productId: 'prod-hand-truck', productName: 'Hand Truck — 600 lb', sku: 'EQP-HT-600', unit: 'Units', quantity: 2, pickedQuantity: 2 }
    ]
  },
  {
    id: 'op-del-006',
    code: 'WH/OUT/0006',
    type: 'delivery',
    status: 'draft',
    date: 'Sep 28, 11:00',
    partnerName: 'Alder & Ash Retail',
    sourceWarehouseId: 'wh-northdock',
    sourceLocationId: 'loc-dispatch',
    creatorName: 'Ben Foster',
    createdBy: 'usr-1',
    notes: 'Awaiting customer prepayment confirmation',
    items: [
      { productId: 'prod-stacking-bin', productName: 'Stacking Bin — Medium', sku: 'BIN-MD-42', unit: 'Units', quantity: 20, pickedQuantity: 0 }
    ]
  },

  // INTERNAL TRANSFERS
  {
    id: 'op-int-001',
    code: 'WH/INT/0001',
    type: 'internal',
    status: 'ready',
    date: 'Sep 26, 11:15',
    sourceWarehouseId: 'wh-northdock',
    sourceLocationId: 'loc-overflow',
    destinationWarehouseId: 'wh-northdock',
    destinationLocationId: 'loc-main-stock',
    creatorName: 'Dexter Morgan',
    createdBy: 'usr-1',
    notes: 'Active pick-face replenishment on Rack A1 from bulk overflow.',
    items: [
      { productId: 'prod-stacking-bin', productName: 'Stacking Bin — Medium', sku: 'BIN-MD-42', unit: 'Units', quantity: 24 }
    ]
  },
  {
    id: 'op-int-002',
    code: 'WH/INT/0002',
    type: 'internal',
    status: 'waiting',
    date: 'Sep 26, 14:00',
    sourceWarehouseId: 'wh-northdock',
    sourceLocationId: 'loc-receiving',
    destinationWarehouseId: 'wh-northdock',
    destinationLocationId: 'loc-overflow',
    creatorName: 'Jamie Wu',
    createdBy: 'usr-2',
    notes: 'Putaway clear wrap pallets from Bay 02 staging to overflow bulk storage.',
    items: [
      { productId: 'prod-pallet-wrap', productName: 'Pallet Wrap — Clear', sku: 'WRP-CLR-18', unit: 'Units', quantity: 12 }
    ]
  },
  {
    id: 'op-int-003',
    code: 'WH/INT/0003',
    type: 'internal',
    status: 'done',
    date: 'Sep 25, 16:30',
    sourceWarehouseId: 'wh-northdock',
    sourceLocationId: 'loc-receiving',
    destinationWarehouseId: 'wh-northdock',
    destinationLocationId: 'loc-main-stock',
    creatorName: 'Jamie Wu',
    createdBy: 'usr-2',
    notes: 'Fast-moving thermal labels transferred directly to aisle 4 picking bins.',
    items: [
      { productId: 'prod-thermal-labels', productName: 'Thermal Label Roll 4×6', sku: 'LBL-46-500', unit: 'Units', quantity: 16 }
    ]
  },
  {
    id: 'op-int-004',
    code: 'WH/INT/0004',
    type: 'internal',
    status: 'done',
    date: 'Sep 25, 14:00',
    sourceWarehouseId: 'wh-northdock',
    sourceLocationId: 'loc-overflow',
    destinationWarehouseId: 'wh-northdock',
    destinationLocationId: 'loc-bay-04',
    creatorName: 'Dexter Morgan',
    createdBy: 'usr-1',
    notes: 'Staged empty heavy pallets at dispatch dock door 4.',
    items: [
      { productId: 'prod-heavy-pallet', productName: 'Heavy-Duty Pallet 48×40', sku: 'PLT-HD-4840', unit: 'Units', quantity: 10 }
    ]
  },

  // INVENTORY ADJUSTMENTS & PHYSICAL CYCLE COUNTS
  {
    id: 'op-adj-001',
    code: 'WH/ADJ/0001',
    type: 'adjustment',
    status: 'done',
    date: 'Sep 26, 08:30',
    sourceWarehouseId: 'wh-northdock',
    sourceLocationId: 'loc-main-stock',
    creatorName: 'Dexter Morgan',
    createdBy: 'usr-1',
    adjustmentReason: 'Routine physical cycle count verification',
    notes: 'Aisle 01 routine cycle count. Count verified and reconciled against ledger balance.',
    items: [
      { productId: 'prod-stacking-bin', productName: 'Stacking Bin — Medium', sku: 'BIN-MD-42', unit: 'Units', quantity: 116 }
    ]
  },
  {
    id: 'op-adj-002',
    code: 'WH/ADJ/0002',
    type: 'adjustment',
    status: 'done',
    date: 'Sep 25, 17:15',
    sourceWarehouseId: 'wh-northdock',
    sourceLocationId: 'loc-receiving',
    creatorName: 'Jamie Wu',
    createdBy: 'usr-2',
    adjustmentReason: 'Damaged carton write-off',
    notes: 'Damaged packaging during forklift transport in receiving dock. Written off.',
    items: [
      { productId: 'prod-nitrile-gloves', productName: 'Nitrile Work Gloves — L', sku: 'PPE-GLV-L', unit: 'Units', quantity: 36 }
    ]
  },
  {
    id: 'op-adj-003',
    code: 'WH/ADJ/0003',
    type: 'adjustment',
    status: 'ready',
    date: 'Sep 26, 10:00',
    sourceWarehouseId: 'wh-northdock',
    sourceLocationId: 'loc-overflow',
    creatorName: 'Dexter Morgan',
    createdBy: 'usr-1',
    adjustmentReason: 'Quarterly physical stock verification',
    notes: 'Scheduled high-bay rack C3 physical verification and count reconciliation.',
    items: [
      { productId: 'prod-corrugated-carton', productName: 'Corrugated Carton 18×12', sku: 'BOX-1812-K', unit: 'Units', quantity: 310 }
    ]
  }
];

export const INITIAL_LEDGER: StockLedgerEntry[] = [
  {
    id: 'ledg-001',
    timestamp: '2026-09-26T09:42:00Z',
    documentRef: 'WH/IN/0001',
    operationType: 'receipt',
    productId: 'prod-stacking-bin',
    productName: 'Stacking Bin — Medium',
    sku: 'BIN-MD-42',
    fromLocation: 'Copper & Pine Co.',
    toLocation: 'A-01-02',
    quantityDelta: 120,
    unit: 'Units',
    balanceAfter: 116,
    operatorId: 'usr-1',
    operatorName: 'Dexter Morgan',
    reason: 'Inbound receipt putaway'
  },
  {
    id: 'ledg-002',
    timestamp: '2026-09-26T09:40:00Z',
    documentRef: 'WH/IN/0001',
    operationType: 'receipt',
    productId: 'prod-thermal-labels',
    productName: 'Thermal Label Roll 4×6',
    sku: 'LBL-46-500',
    fromLocation: 'Copper & Pine Co.',
    toLocation: 'B-04-01',
    quantityDelta: 48,
    unit: 'Units',
    balanceAfter: 160,
    operatorId: 'usr-1',
    operatorName: 'Dexter Morgan',
    reason: 'Inbound receipt putaway'
  },
  {
    id: 'ledg-003',
    timestamp: '2026-09-26T09:18:00Z',
    documentRef: 'WH/OUT/0001',
    operationType: 'delivery',
    productId: 'prod-stacking-bin',
    productName: 'Stacking Bin — Medium',
    sku: 'BIN-MD-42',
    fromLocation: 'A-01-02',
    toLocation: 'Harbor Stores — East',
    quantityDelta: -32,
    unit: 'Units',
    balanceAfter: 84,
    operatorId: 'usr-2',
    operatorName: 'Jamie Wu',
    reason: 'Pick & pack customer shipment'
  },
  {
    id: 'ledg-004',
    timestamp: '2026-09-25T16:06:00Z',
    documentRef: 'WH/OUT/0004',
    operationType: 'delivery',
    productId: 'prod-corrugated-carton',
    productName: 'Corrugated Carton 18×12',
    sku: 'BOX-1812-K',
    fromLocation: 'B-01-04',
    toLocation: 'Harbor Stores — West',
    quantityDelta: -52,
    unit: 'Units',
    balanceAfter: 310,
    operatorId: 'usr-2',
    operatorName: 'Jamie Wu',
    reason: 'Customer parcel dispatch'
  },
  {
    id: 'ledg-005',
    timestamp: '2026-09-25T15:45:00Z',
    documentRef: 'WH/IN/0004',
    operationType: 'receipt',
    productId: 'prod-nitrile-gloves',
    productName: 'Nitrile Work Gloves — L',
    sku: 'PPE-GLV-L',
    fromLocation: 'Brightline Supply',
    toLocation: 'D-03-02',
    quantityDelta: 36,
    unit: 'Units',
    balanceAfter: 44,
    operatorId: 'usr-3',
    operatorName: 'Sam Ortega',
    reason: 'Safety equipment restocking'
  },
  {
    id: 'ledg-006',
    timestamp: '2026-09-25T14:22:00Z',
    documentRef: 'WH/OUT/0002',
    operationType: 'delivery',
    productId: 'prod-pallet-wrap',
    productName: 'Pallet Wrap — Clear',
    sku: 'WRP-CLR-18',
    fromLocation: 'B-02-03',
    toLocation: 'Moss & Main — Central',
    quantityDelta: -16,
    unit: 'Units',
    balanceAfter: 70,
    operatorId: 'usr-4',
    operatorName: 'Priya Shah',
    reason: 'Packaging distribution'
  },
  {
    id: 'ledg-007',
    timestamp: '2026-09-25T11:10:00Z',
    documentRef: 'WH/IN/0004',
    operationType: 'receipt',
    productId: 'prod-heavy-pallet',
    productName: 'Heavy-Duty Pallet 48×40',
    sku: 'PLT-HD-4840',
    fromLocation: 'Brightline Supply',
    toLocation: 'C-01-01',
    quantityDelta: 20,
    unit: 'Units',
    balanceAfter: 28,
    operatorId: 'usr-3',
    operatorName: 'Sam Ortega',
    reason: 'Standard pallet load received'
  }
];
