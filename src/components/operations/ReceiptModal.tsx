import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, ArrowDownToLine, AlertCircle } from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { OperationItem, Product } from '../../types/inventory';

interface ReceiptModalProps {
    isOpen: boolean;
    onClose: () => void;
    preselectedProductId?: string;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
    isOpen,
    onClose,
    preselectedProductId
}) => {
    const { products, warehouses, createOperation, validateOperation } = useInventory();

    const [partnerName, setPartnerName] = useState('');
    const [destinationWarehouseId, setDestinationWarehouseId] = useState(
        () => warehouses[0]?.id || 'wh-northdock'
    );
    const [destinationLocationId, setDestinationLocationId] = useState(
        () => warehouses[0]?.locations[0]?.id || 'loc-dock-01'
    );
    const [notes, setNotes] = useState('');
    const [items, setItems] = useState<OperationItem[]>([]);
    const [autoValidate, setAutoValidate] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (preselectedProductId) {
                const prod = products.find(p => p.id === preselectedProductId);
                if (prod) {
                    const reorderQty = Math.max(prod.minReorderLevel * 2, prod.maxTargetLevel - prod.totalStock);
                    setItems([
                        {
                            productId: prod.id,
                            productName: prod.name,
                            sku: prod.sku,
                            unit: prod.unit,
                            quantity: reorderQty > 0 ? reorderQty : 50,
                            unitPrice: prod.costPrice,
                            receivedQuantity: reorderQty > 0 ? reorderQty : 50
                        }
                    ]);
                    setNotes(`Replenishment order for low stock SKU: ${prod.sku}`);
                    return;
                }
            }

            if (products.length > 0) {
                const first = products[0];
                setItems([
                    {
                        productId: first.id,
                        productName: first.name,
                        sku: first.sku,
                        unit: first.unit,
                        quantity: 50,
                        unitPrice: first.costPrice,
                        receivedQuantity: 50
                    }
                ]);
            }
        }
    }, [isOpen, preselectedProductId, products]);

    if (!isOpen) return null;

    const selectedWh = warehouses.find(w => w.id === destinationWarehouseId);

    const handleAddItem = () => {
        if (products.length === 0) return;
        const prod = products[0];
        setItems(prev => [
            ...prev,
            {
                productId: prod.id,
                productName: prod.name,
                sku: prod.sku,
                unit: prod.unit,
                quantity: 10,
                unitPrice: prod.costPrice,
                receivedQuantity: 10
            }
        ]);
    };

    const handleProductChange = (index: number, prodId: string) => {
        const prod = products.find(p => p.id === prodId);
        if (!prod) return;
        setItems(prev => prev.map((item, idx) => {
            if (idx !== index) return item;
            return {
                ...item,
                productId: prod.id,
                productName: prod.name,
                sku: prod.sku,
                unit: prod.unit,
                unitPrice: prod.costPrice
            };
        }));
    };

    const handleQuantityChange = (index: number, qty: number) => {
        setItems(prev => prev.map((item, idx) => {
            if (idx !== index) return item;
            return {
                ...item,
                quantity: qty,
                receivedQuantity: qty
            };
        }));
    };

    const handleRemoveItem = (index: number) => {
        setItems(prev => prev.filter((_, idx) => idx !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!partnerName.trim()) {
            setError('Vendor / Supplier name is required.');
            return;
        }
        if (items.length === 0) {
            setError('Please add at least one line item.');
            return;
        }

        const newOp = createOperation({
            type: 'receipt',
            date: new Date().toISOString().split('T')[0],
            partnerName,
            destinationWarehouseId,
            destinationLocationId: destinationLocationId || selectedWh?.locations[0]?.id,
            items,
            notes
        });

        if (autoValidate) {
            const valRes = validateOperation(newOp.id);
            if (!valRes.success && valRes.error) {
                alert(`Receipt created, but validation failed: ${valRes.error}`);
            }
        }

        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
            <div className="bg-white border border-stone-200 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="p-5 border-b border-stone-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#e5f3ed] text-[#1c644d] flex items-center justify-center">
                            <ArrowDownToLine className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-stone-900">New Inbound Receipt</h2>
                            <p className="text-xs text-stone-500">Record incoming shipment from vendor into warehouse</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
                    {error && (
                        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                            <label className="block text-stone-700 font-semibold mb-1">Supplier / Vendor *</label>
                            <input
                                type="text"
                                placeholder="e.g. Apex Industrial Supplies"
                                value={partnerName}
                                onChange={(e) => setPartnerName(e.target.value)}
                                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#1e3a34]"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-stone-700 font-semibold mb-1">Warehouse</label>
                            <select
                                value={destinationWarehouseId}
                                onChange={(e) => {
                                    setDestinationWarehouseId(e.target.value);
                                    const wh = warehouses.find(w => w.id === e.target.value);
                                    if (wh && wh.locations[0]) {
                                        setDestinationLocationId(wh.locations[0].id);
                                    }
                                }}
                                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:border-[#1e3a34] cursor-pointer"
                            >
                                {warehouses.map(w => (
                                    <option key={w.id} value={w.id}>{w.code} - {w.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-stone-700 font-semibold mb-1">Dock / Staging Location</label>
                            <select
                                value={destinationLocationId}
                                onChange={(e) => setDestinationLocationId(e.target.value)}
                                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:border-[#1e3a34] cursor-pointer"
                            >
                                {selectedWh?.locations.map(loc => (
                                    <option key={loc.id} value={loc.id}>{loc.code} - {loc.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Line Items */}
                    <div className="space-y-2 pt-2">
                        <div className="flex items-center justify-between">
                            <label className="text-stone-800 font-bold uppercase tracking-wider text-[11px]">
                                Goods Line Items ({items.length})
                            </label>
                            <button
                                type="button"
                                onClick={handleAddItem}
                                className="text-[#1e3a34] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add Item</span>
                            </button>
                        </div>

                        <div className="space-y-2">
                            {items.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="p-3 rounded-xl bg-stone-50 border border-stone-200 grid grid-cols-12 gap-2 items-center"
                                >
                                    <div className="col-span-6">
                                        <label className="block text-[10px] text-stone-500 mb-0.5 font-medium">Product SKU</label>
                                        <select
                                            value={item.productId}
                                            onChange={(e) => handleProductChange(idx, e.target.value)}
                                            className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-stone-900 text-xs"
                                        >
                                            {products.map(p => (
                                                <option key={p.id} value={p.id}>
                                                    [{p.sku}] {p.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="col-span-3">
                                        <label className="block text-[10px] text-stone-500 mb-0.5 font-medium">
                                            Qty ({item.unit})
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={(e) => handleQuantityChange(idx, parseInt(e.target.value, 10) || 1)}
                                            className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 font-mono text-stone-900 text-xs text-right"
                                        />
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-[10px] text-stone-500 mb-0.5 font-medium">Unit Cost ($)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={item.unitPrice || 0}
                                            onChange={(e) => {
                                                const val = parseFloat(e.target.value) || 0;
                                                setItems(prev => prev.map((it, i) => i === idx ? { ...it, unitPrice: val } : it));
                                            }}
                                            className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 font-mono text-stone-900 text-xs text-right"
                                        />
                                    </div>

                                    <div className="col-span-1 flex justify-end pt-3">
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveItem(idx)}
                                            disabled={items.length <= 1}
                                            className="text-stone-400 hover:text-rose-600 disabled:opacity-30 p-1"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-stone-700 font-semibold mb-1">Receipt Notes / PO Reference</label>
                        <textarea
                            rows={2}
                            placeholder="e.g. PO-9812, carrier delivery bill, seal checked..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#1e3a34]"
                        />
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#e5f3ed] border border-[#cbe4d7] flex items-center justify-between">
                        <div>
                            <div className="text-xs font-bold text-[#1c644d]">Direct Stock Validation</div>
                            <div className="text-[11px] text-stone-600">
                                Immediately increment inventory on hand and create stock ledger entries upon submission.
                            </div>
                        </div>
                        <input
                            type="checkbox"
                            checked={autoValidate}
                            onChange={(e) => setAutoValidate(e.target.checked)}
                            className="w-4 h-4 accent-[#1e3a34] rounded cursor-pointer"
                        />
                    </div>

                    <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2.5">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2 rounded-xl bg-[#1e3a34] hover:bg-[#162c27] text-white font-bold transition-all shadow-sm cursor-pointer"
                        >
                            {autoValidate ? 'Save & Validate Stock' : 'Create Receipt Draft'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
