import React, { useState } from 'react';
import { X, Plus, Trash2, Truck, AlertCircle } from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { OperationItem } from '../../types/inventory';

interface DeliveryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const DeliveryModal: React.FC<DeliveryModalProps> = ({
    isOpen,
    onClose
}) => {
    const { products, warehouses, createOperation, validateOperation } = useInventory();

    const [partnerName, setPartnerName] = useState('');
    const [sourceWarehouseId, setSourceWarehouseId] = useState(
        () => warehouses[0]?.id || 'wh-northdock'
    );
    const [sourceLocationId, setSourceLocationId] = useState(
        () => warehouses[0]?.locations[0]?.id || 'loc-dock-01'
    );
    const [notes, setNotes] = useState('');
    const [items, setItems] = useState<OperationItem[]>([]);
    const [autoValidate, setAutoValidate] = useState(false);
    const [error, setError] = useState('');

    React.useEffect(() => {
        if (isOpen && items.length === 0 && products.length > 0) {
            const first = products[0];
            setItems([
                {
                    productId: first.id,
                    productName: first.name,
                    sku: first.sku,
                    unit: first.unit,
                    quantity: 5,
                    unitPrice: first.salesPrice || first.costPrice * 1.3
                }
            ]);
        }
    }, [isOpen, products]);

    if (!isOpen) return null;

    const selectedWh = warehouses.find(w => w.id === sourceWarehouseId);

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
                quantity: 1,
                unitPrice: prod.salesPrice || prod.costPrice * 1.3
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
                unitPrice: prod.salesPrice || prod.costPrice * 1.3
            };
        }));
    };

    const handleQuantityChange = (index: number, qty: number) => {
        setItems(prev => prev.map((item, idx) => {
            if (idx !== index) return item;
            return {
                ...item,
                quantity: qty
            };
        }));
    };

    const handleRemoveItem = (index: number) => {
        setItems(prev => prev.filter((_, idx) => idx !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!partnerName.trim()) {
            setError('Customer / Recipient name is required.');
            return;
        }
        if (items.length === 0) {
            setError('Please add at least one line item.');
            return;
        }

        const newOp = createOperation({
            type: 'delivery',
            date: new Date().toISOString().split('T')[0],
            partnerName,
            sourceWarehouseId,
            sourceLocationId: sourceLocationId || selectedWh?.locations[0]?.id,
            items,
            notes
        });

        if (autoValidate) {
            const valRes = validateOperation(newOp.id);
            if (!valRes.success && valRes.error) {
                alert(`Delivery order created, but validation failed: ${valRes.error}`);
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
                        <div className="w-9 h-9 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center">
                            <Truck className="w-5 h-5 text-[#1e3a34]" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-stone-900">New Outbound Delivery Order</h2>
                            <p className="text-xs text-stone-500">Pick and ship inventory items to customer</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
                    {error && (
                        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                            <label className="block text-stone-700 font-semibold mb-1">Customer / Recipient *</label>
                            <input
                                type="text"
                                placeholder="e.g. Acme Manufacturing"
                                value={partnerName}
                                onChange={(e) => setPartnerName(e.target.value)}
                                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#1e3a34]"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-stone-700 font-semibold mb-1">Source Facility</label>
                            <select
                                value={sourceWarehouseId}
                                onChange={(e) => setSourceWarehouseId(e.target.value)}
                                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:border-[#1e3a34] cursor-pointer"
                            >
                                {warehouses.map(w => (
                                    <option key={w.id} value={w.id}>{w.code} - {w.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-stone-700 font-semibold mb-1">Source Storage Bay</label>
                            <select
                                value={sourceLocationId}
                                onChange={(e) => setSourceLocationId(e.target.value)}
                                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:border-[#1e3a34] cursor-pointer"
                            >
                                {selectedWh?.locations.map(loc => (
                                    <option key={loc.id} value={loc.id}>{loc.code} - {loc.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Line items */}
                    <div className="space-y-2 pt-2">
                        <div className="flex items-center justify-between">
                            <label className="text-stone-800 font-bold uppercase tracking-wider text-[11px]">
                                Shipment Products ({items.length})
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
                                                    [{p.sku}] {p.name} ({p.totalStock} in stock)
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="col-span-3">
                                        <label className="block text-[10px] text-stone-500 mb-0.5 font-medium">
                                            Qty to Ship ({item.unit})
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
                                        <label className="block text-[10px] text-stone-500 mb-0.5 font-medium">Price ($)</label>
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
                        <label className="block text-stone-700 font-semibold mb-1">Dispatch Notes</label>
                        <textarea
                            rows={2}
                            placeholder="e.g. Shipping carrier tracking code, customer packing slip instructions..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#1e3a34]"
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
                            Create Delivery Order
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
