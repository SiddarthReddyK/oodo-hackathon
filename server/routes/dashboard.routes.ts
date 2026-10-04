import { Router, Request, Response } from 'express';
import { db } from '../db/dataStore';
import { asyncHandler } from '../utils/asyncHandler';

export const dashboardRouter = Router();

dashboardRouter.get(
  '/stats',
  asyncHandler((_req: Request, res: Response) => {
    const totalStockCount = db.products.reduce((acc, p) => acc + p.totalStock, 0);
    const totalStockValuation = db.products.reduce((acc, p) => acc + p.totalStock * p.costPrice, 0);
    const lowStockCount = db.products.filter(p => p.totalStock <= p.minReorderLevel).length;
    const outOfStockCount = db.products.filter(p => p.totalStock === 0).length;

    const pendingReceiptsCount = db.operations.filter(
      o => o.type === 'receipt' && ['waiting', 'ready', 'draft'].includes(o.status)
    ).length;

    const pendingDeliveriesCount = db.operations.filter(
      o => o.type === 'delivery' && ['waiting', 'ready', 'draft'].includes(o.status)
    ).length;

    const scheduledTransfersCount = db.operations.filter(
      o => o.type === 'internal' && ['waiting', 'ready', 'draft'].includes(o.status)
    ).length;

    res.json({
      totalStockCount,
      totalStockValuation,
      lowStockCount,
      outOfStockCount,
      pendingReceiptsCount,
      pendingDeliveriesCount,
      scheduledTransfersCount
    });
  })
);

dashboardRouter.get(
  '/alerts',
  asyncHandler((_req: Request, res: Response) => {
    const alerts = db.products
      .filter(p => p.totalStock <= p.minReorderLevel)
      .map(p => ({
        product: p,
        deficit: Math.max(0, p.minReorderLevel - p.totalStock),
        urgency: p.totalStock === 0 ? 'critical' : 'warning'
      }))
      .sort((a, b) => (a.product.totalStock === 0 ? -1 : 1));

    res.json(alerts);
  })
);
