import { Router, Request, Response } from 'express';
import { db } from '../db/dataStore';
import { Operation, StockLedgerEntry } from '../../src/types/inventory';
import {
  createTransferSchema,
  completeTransferSchema,
  adjustmentSchema,
  validateBody
} from '../validators/schemas';
import { asyncHandler } from '../utils/asyncHandler';

export const stockRouter = Router();

// POST /api/stock/transfers
stockRouter.post(
  '/transfers',
  validateBody(createTransferSchema),
  asyncHandler((req: Request, res: Response) => {
    const opData = req.body;
    const sequentialNumber = String(db.operations.length + 1).padStart(3, '0');
    const code = `TRF-2026-${sequentialNumber}`;

    const newOp: Operation = {
      ...opData,
      id: `op-${Date.now()}`,
      code,
      type: 'internal',
      status: 'waiting',
      createdBy: opData.createdBy || (req as any).user?.id || 'usr-floor',
      creatorName: opData.creatorName || (req as any).user?.name || 'Warehouse Specialist'
    };

    db.operations.unshift(newOp);
    db.save();
    res.status(201).json(newOp);
  })
);

// PUT /api/stock/transfers/:id/complete
stockRouter.put(
  '/transfers/:id/complete',
  validateBody(completeTransferSchema),
  asyncHandler((req: Request, res: Response): void => {
    const op = db.operations.find(o => o.id === req.params.id);
    if (!op) {
      res.status(404).json({ error: 'Transfer operation not found' });
      return;
    }
    if (op.status === 'done') {
      res.status(400).json({ error: 'Transfer already completed' });
      return;
    }

    const nowIso = new Date().toISOString();
    const srcWh = op.sourceWarehouseId!;
    const srcLoc = op.sourceLocationId!;
    const destWh = op.destinationWarehouseId!;
    const destLoc = op.destinationLocationId!;

    for (const item of op.items) {
      const prod = db.products.find(p => p.id === item.productId);
      if (!prod) continue;
      const qtyToMove = item.quantity;
      const srcStock = prod.locations.find(l => l.warehouseId === srcWh && l.locationId === srcLoc);

      if (!srcStock || srcStock.quantity < qtyToMove) {
        res.status(400).json({
          error: `Insufficient stock to transfer for ${prod.name} at location ${srcWh}/${srcLoc}. Available: ${srcStock?.quantity || 0}`
        });
        return;
      }
    }

    for (const item of op.items) {
      const prod = db.products.find(p => p.id === item.productId)!;
      const qtyToMove = item.quantity;
      const srcStock = prod.locations.find(l => l.warehouseId === srcWh && l.locationId === srcLoc)!;
      srcStock.quantity -= qtyToMove;

      const destStock = prod.locations.find(l => l.warehouseId === destWh && l.locationId === destLoc);
      if (destStock) {
        destStock.quantity += qtyToMove;
      } else {
        prod.locations.push({ warehouseId: destWh, locationId: destLoc, quantity: qtyToMove });
      }

      prod.totalStock = prod.locations.reduce((sum, l) => sum + l.quantity, 0);
      prod.updatedAt = nowIso;

      const ledgerEntry: StockLedgerEntry = {
        id: `ledg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: nowIso,
        documentRef: op.code,
        operationType: 'internal',
        productId: prod.id,
        productName: prod.name,
        sku: prod.sku,
        fromLocation: `${srcWh} / ${srcLoc}`,
        toLocation: `${destWh} / ${destLoc}`,
        quantityDelta: qtyToMove,
        unit: item.unit,
        balanceAfter: prod.totalStock,
        operatorId: req.body?.operatorId || (req as any).user?.id || op.createdBy,
        operatorName: req.body?.operatorName || (req as any).user?.name || op.creatorName,
        reason: op.notes || 'Internal warehouse rack transfer'
      };
      db.ledger.unshift(ledgerEntry);
    }

    op.status = 'done';
    op.completedAt = nowIso;
    db.save();

    res.json({ success: true, operation: op });
  })
);

// POST /api/stock/adjustments
stockRouter.post(
  '/adjustments',
  validateBody(adjustmentSchema),
  asyncHandler((req: Request, res: Response): void => {
    const { productId, warehouseId, locationId, countedQty, reason, operatorId, operatorName } = req.body;

    const product = db.products.find(p => p.id === productId);
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    const existingLoc = product.locations.find(l => l.warehouseId === warehouseId && l.locationId === locationId);
    const recordedQty = existingLoc ? existingLoc.quantity : 0;
    const difference = countedQty - recordedQty;
    const nowIso = new Date().toISOString();

    if (existingLoc) {
      existingLoc.quantity = countedQty;
    } else {
      product.locations.push({ warehouseId, locationId, quantity: countedQty });
    }

    product.totalStock = product.locations.reduce((sum, l) => sum + l.quantity, 0);
    product.updatedAt = nowIso;

    const sequentialNumber = String(db.operations.length + 1).padStart(3, '0');
    const opCode = `ADJ-2026-${sequentialNumber}`;

    const effectiveOpId = operatorId || (req as any).user?.id || 'usr-auditor';
    const effectiveOpName = operatorName || (req as any).user?.name || 'Inventory Auditor';

    const adjustmentOp: Operation = {
      id: `op-${Date.now()}`,
      code: opCode,
      type: 'adjustment',
      status: 'done',
      date: nowIso.split('T')[0],
      sourceWarehouseId: warehouseId,
      sourceLocationId: locationId,
      items: [
        {
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          unit: product.unit,
          quantity: difference
        }
      ],
      adjustmentReason: reason,
      createdBy: effectiveOpId,
      creatorName: effectiveOpName,
      notes: `Physical Count: ${countedQty} ${product.unit} (System was: ${recordedQty}). Delta: ${difference > 0 ? '+' : ''}${difference}. Reason: ${reason}`,
      completedAt: nowIso
    };

    const ledgerEntry: StockLedgerEntry = {
      id: `ledg-${Date.now()}`,
      timestamp: nowIso,
      documentRef: opCode,
      operationType: 'adjustment',
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      fromLocation: `${warehouseId} / ${locationId}`,
      toLocation: difference >= 0 ? `${warehouseId} / ${locationId}` : 'Audit Variance / Shrinkage',
      quantityDelta: difference,
      unit: product.unit,
      balanceAfter: product.totalStock,
      operatorId: effectiveOpId,
      operatorName: effectiveOpName,
      reason
    };

    db.operations.unshift(adjustmentOp);
    db.ledger.unshift(ledgerEntry);
    db.save();

    res.status(201).json({
      success: true,
      operation: adjustmentOp,
      ledgerEntry,
      product
    });
  })
);

// GET /api/stock/ledger
stockRouter.get(
  '/ledger',
  asyncHandler((_req: Request, res: Response) => {
    res.json(db.ledger);
  })
);
