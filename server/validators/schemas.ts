import { z } from 'zod';
import { Request, Response, NextFunction, RequestHandler } from 'express';

// Authentication Schemas
export const authLoginSchema = z.object({
  emailOrLoginId: z.string().min(1, 'Email or Login ID is required'),
  password: z.string().optional()
});

export const authRegisterSchema = z.object({
  name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Valid email address is required'),
  role: z.enum(['inventory_manager', 'warehouse_staff']),
  warehouseId: z.string().min(1, 'Assigned warehouse is required'),
  password: z.string().optional()
});

// Product Schemas
export const createProductSchema = z.object({
  productData: z.object({
    name: z.string().min(1, 'Product name is required'),
    sku: z.string().optional(),
    category: z.string().min(1, 'Category is required'),
    unit: z.string().min(1, 'Unit is required'),
    costPrice: z.number().min(0, 'Cost price must be non-negative'),
    salesPrice: z.number().min(0, 'Sales price must be non-negative'),
    minReorderLevel: z.number().min(0, 'Min reorder level must be non-negative'),
    maxTargetLevel: z.number().min(0, 'Max target level must be non-negative'),
    locations: z.array(z.object({
      warehouseId: z.string(),
      locationId: z.string(),
      quantity: z.number()
    })).optional(),
    notes: z.string().optional()
  }),
  initialQuantity: z.number().min(0).optional(),
  initialWarehouseId: z.string().optional(),
  initialLocationId: z.string().optional()
});

export const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  sku: z.string().optional(),
  category: z.string().optional(),
  unit: z.string().optional(),
  costPrice: z.number().min(0).optional(),
  salesPrice: z.number().min(0).optional(),
  minReorderLevel: z.number().min(0).optional(),
  maxTargetLevel: z.number().min(0).optional(),
  locations: z.array(z.object({
    warehouseId: z.string(),
    locationId: z.string(),
    quantity: z.number()
  })).optional(),
  notes: z.string().optional()
});

export const warehouseSchema = z.object({
  name: z.string().min(1, 'Warehouse name is required'),
  code: z.string().min(1, 'Warehouse code is required'),
  address: z.string().optional(),
  capacity: z.number().optional(),
  locations: z.array(z.object({
    id: z.string(),
    name: z.string(),
    rack: z.string().optional(),
    row: z.string().optional()
  })).optional()
});

// Operations Schemas
export const createReceiptSchema = z.object({
  partnerName: z.string().optional(),
  destinationWarehouseId: z.string().min(1, 'Destination warehouse is required'),
  destinationLocationId: z.string().optional(),
  items: z.array(z.object({
    productId: z.string().min(1, 'Product ID is required'),
    productName: z.string().min(1, 'Product name is required'),
    sku: z.string(),
    quantity: z.number().positive('Quantity must be greater than 0'),
    unit: z.string(),
    receivedQuantity: z.number().optional()
  })).min(1, 'At least one item is required in the receipt'),
  notes: z.string().optional(),
  expectedDate: z.string().optional(),
  date: z.string().optional(),
  createdBy: z.string().optional(),
  creatorName: z.string().optional()
});

export const receiveReceiptSchema = z.object({
  operatorId: z.string().optional(),
  operatorName: z.string().optional()
}).optional().default({});

export const createDeliverySchema = z.object({
  partnerName: z.string().optional(),
  sourceWarehouseId: z.string().min(1, 'Source warehouse is required'),
  sourceLocationId: z.string().optional(),
  items: z.array(z.object({
    productId: z.string().min(1, 'Product ID is required'),
    productName: z.string().min(1, 'Product name is required'),
    sku: z.string(),
    quantity: z.number().positive('Quantity must be greater than 0'),
    unit: z.string(),
    pickedQuantity: z.number().optional()
  })).min(1, 'At least one item is required in the delivery'),
  notes: z.string().optional(),
  deliveryAddress: z.string().optional(),
  expectedDate: z.string().optional(),
  date: z.string().optional(),
  createdBy: z.string().optional(),
  creatorName: z.string().optional()
});

export const dispatchDeliverySchema = z.object({
  operatorId: z.string().optional(),
  operatorName: z.string().optional()
}).optional().default({});

export const createTransferSchema = z.object({
  sourceWarehouseId: z.string().min(1, 'Source warehouse is required'),
  sourceLocationId: z.string().min(1, 'Source location is required'),
  destinationWarehouseId: z.string().min(1, 'Destination warehouse is required'),
  destinationLocationId: z.string().min(1, 'Destination location is required'),
  items: z.array(z.object({
    productId: z.string().min(1, 'Product ID is required'),
    productName: z.string().min(1, 'Product name is required'),
    sku: z.string(),
    quantity: z.number().positive('Quantity must be greater than 0'),
    unit: z.string()
  })).min(1, 'At least one item is required in the transfer'),
  notes: z.string().optional(),
  scheduledDate: z.string().optional(),
  date: z.string().optional(),
  createdBy: z.string().optional(),
  creatorName: z.string().optional()
});

export const completeTransferSchema = z.object({
  operatorId: z.string().optional(),
  operatorName: z.string().optional()
}).optional().default({});

export const adjustmentSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  warehouseId: z.string().min(1, 'Warehouse ID is required'),
  locationId: z.string().min(1, 'Location ID is required'),
  countedQty: z.number().min(0, 'Counted quantity must be non-negative'),
  reason: z.string().min(1, 'Adjustment reason is required'),
  operatorId: z.string().optional(),
  operatorName: z.string().optional()
});

/**
 * Express middleware to validate request body against a Zod schema.
 * Returns 400 with field-level error messages on failure.
 */
export const validateBody = (schema: z.ZodSchema): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const fieldErrors = result.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message
      }));
      res.status(400).json({
        error: 'Validation failed',
        details: fieldErrors
      });
      return;
    }
    req.body = result.data;
    next();
  };
};
