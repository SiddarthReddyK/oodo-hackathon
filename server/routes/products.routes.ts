import { Router, Request, Response } from 'express';
import { db } from '../db/dataStore';
import { Product, Warehouse, StockLedgerEntry } from '../../src/types/inventory';
import { createProductSchema, updateProductSchema, warehouseSchema, validateBody } from '../validators/schemas';
import { asyncHandler } from '../utils/asyncHandler';

export const productsRouter = Router();

// GET /api/products
productsRouter.get(
  '/',
  asyncHandler((_req: Request, res: Response) => {
    res.json(db.products);
  })
);

// GET /api/products/meta/warehouses
productsRouter.get(
  '/meta/warehouses',
  asyncHandler((_req: Request, res: Response) => {
    res.json(db.warehouses);
  })
);

// POST /api/products/meta/warehouses
productsRouter.post(
  '/meta/warehouses',
  validateBody(warehouseSchema),
  asyncHandler((req: Request, res: Response) => {
    const newWh: Warehouse = {
      ...req.body,
      id: `wh-${Date.now()}`
    };
    db.warehouses.push(newWh);
    db.save();
    res.status(201).json(newWh);
  })
);

// GET /api/products/:id
productsRouter.get(
  '/:id',
  asyncHandler((req: Request, res: Response): void => {
    const product = db.products.find(p => p.id === req.params.id);
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.json(product);
  })
);

// POST /api/products
productsRouter.post(
  '/',
  validateBody(createProductSchema),
  asyncHandler((req: Request, res: Response) => {
    const {
      productData,
      initialQuantity = 0,
      initialWarehouseId = 'wh-northdock',
      initialLocationId = 'loc-dock-01'
    } = req.body;

    const id = `prod-${Date.now()}`;
    const initialLocations = initialQuantity > 0
      ? [{ warehouseId: initialWarehouseId, locationId: initialLocationId, quantity: initialQuantity }]
      : (productData.locations || []);

    const totalStock = initialLocations.reduce((sum: number, l: any) => sum + l.quantity, 0);

    const newProduct: Product = {
      ...productData,
      id,
      totalStock,
      locations: initialLocations,
      updatedAt: new Date().toISOString()
    };

    db.products.unshift(newProduct);

    if (initialQuantity > 0) {
      const ledgerEntry: StockLedgerEntry = {
        id: `ledg-${Date.now()}`,
        timestamp: new Date().toISOString(),
        documentRef: `INIT-${newProduct.sku || id}`,
        operationType: 'receipt',
        productId: newProduct.id,
        productName: newProduct.name,
        sku: newProduct.sku,
        fromLocation: 'Initial Inventory Setup',
        toLocation: `${initialWarehouseId} / ${initialLocationId}`,
        quantityDelta: initialQuantity,
        unit: newProduct.unit,
        balanceAfter: initialQuantity,
        operatorId: (req as any).user?.id || 'usr-admin',
        operatorName: (req as any).user?.name || 'System Administrator',
        reason: 'Initial Product Stock Entry'
      };
      db.ledger.unshift(ledgerEntry);
    }

    db.save();
    res.status(201).json(newProduct);
  })
);

// PUT /api/products/:id
productsRouter.put(
  '/:id',
  validateBody(updateProductSchema),
  asyncHandler((req: Request, res: Response): void => {
    const index = db.products.findIndex(p => p.id === req.params.id);
    if (index === -1) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    const existing = db.products[index];
    const updates = req.body;
    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };

    if (updates.locations) {
      updated.totalStock = updates.locations.reduce((sum: number, l: any) => sum + l.quantity, 0);
    }

    db.products[index] = updated;
    db.save();
    res.json(updated);
  })
);

// DELETE /api/products/:id
productsRouter.delete(
  '/:id',
  asyncHandler((req: Request, res: Response): void => {
    const index = db.products.findIndex(p => p.id === req.params.id);
    if (index === -1) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    db.products.splice(index, 1);
    db.save();
    res.json({ success: true, message: 'Product deleted' });
  })
);
