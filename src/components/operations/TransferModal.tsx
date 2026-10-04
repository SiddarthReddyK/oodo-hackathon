import React, { useState, useEffect } from 'react';
import { X, ArrowLeftRight, AlertCircle } from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { Product } from '../../types/inventory';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProduct?: Product | null;
  initialSourceWhId?: string;
  initialSourceLocId?: string;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  isOpen,
  onClose,
  initialProduct,
  initialSourceWhId,
  initialSourceLocId
}) => {
  const { products, warehouses, createOperation, validateOperation } = useInventory();

  const [productId, setProductId] = useState('');
  const [sourceWhId, setSourceWhId] = useState(() => warehouses[0]?.id || 'wh-northdock');
  const [sourceLocId, setSourceLocId] = useState(() => warehouses[0]?.locations[0]?.id || 'loc-dock-01');
  const [destWhId, setDestWhId] = useState(() => warehouses[1]?.id || warehouses[0]?.id || 'wh-southbay');
  const [destLocId, setDestLocId] = useState(() => warehouses[1]?.locations[0]?.id || warehouses[0]?.locations[0]?.id || 'loc-sb-rack-01');
  const [transferQty, setTransferQty] = useState('10');
  const [notes, setNotes] = useState('');
  const [autoValidate, setAutoValidate] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialProduct) {
        setProductId(initialProduct.id);
        if (initialSourceWhId) setSourceWhId(initialSourceWhId);
        if (initialSourceLocId) setSourceLocId(initialSourceLocId);
      } else if (products.length > 0) {
        setProductId(products[0].id);
      }
    }
  }, [isOpen, initialProduct, initialSourceWhId, initialSourceLocId, products]);

  if (!isOpen) return null;

  const currentProduct = products.find(p => p.id === productId);
  const sourceWh = warehouses.find(w => w.id === sourceWhId);
  const destWh = warehouses.find(w => w.id === destWhId);

  const currentLocStock = currentProduct?.locations.find(
    l => l.warehouseId === sourceWhId && l.locationId === sourceLocId
  )?.quantity || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProduct) {
      setError('Please select a product.');
      return;
    }

    const qty = parseInt(transferQty, 10) || 0;
    if (qty <= 0) {
      setError('Transfer quantity must be greater than zero.');
      return;
    }

    if (qty > currentLocStock) {
      setError(`Cannot transfer ${qty} ${currentProduct.unit}. Only ${currentLocStock} ${currentProduct.unit} available at source.`);
      return;
    }

    if (sourceWhId === destWhId && sourceLocId === destLocId) {
      setError('Source and destination cannot be identical.');
      return;
    }

    const newOp = createOperation({
      type: 'internal',
      date: new Date().toISOString().split('T')[0],
      sourceWarehouseId: sourceWhId,
      sourceLocationId: sourceLocId,
      destinationWarehouseId: destWhId,
      destinationLocationId: destLocId,
      items: [
        {
          productId: currentProduct.id,
          productName: currentProduct.name,
          sku: currentProduct.sku,
          unit: currentProduct.unit,
          quantity: qty
        }
      ],
      notes: notes || `Internal transfer of ${qty} ${currentProduct.unit}`
    });

    if (autoValidate) {
      const valRes = validateOperation(newOp.id);
      if (!valRes.success && valRes.error) {
        alert(`Transfer created, but validation failed: ${valRes.error}`);
      }
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="bg-white border border-stone-200 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center">
              <ArrowLeftRight className="w-5 h-5 text-[#1e3a34]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900">Internal Stock Relocation</h2>
              <p className="text-xs text-stone-500">Move products across storage zones & bays</p>
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

          <div>
            <label className="block text-stone-700 font-semibold mb-1">Product Item *</label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:border-[#1e3a34] cursor-pointer"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  [{p.sku}] {p.name} · Total: {p.totalStock} {p.unit}
                </option>
              ))}
            </select>
          </div>

          {/* Source Location */}
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                Source Location (FROM)
              </span>
              <span className="text-[11px] font-mono text-[#1e3a34] font-bold">
                Available: {currentLocStock} {currentProduct?.unit}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-stone-500 mb-0.5 font-medium">Warehouse</label>
                <select
                  value={sourceWhId}
                  onChange={(e) => {
                    setSourceWhId(e.target.value);
                    const w = warehouses.find(wh => wh.id === e.target.value);
                    if (w && w.locations[0]) setSourceLocId(w.locations[0].id);
                  }}
                  className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-stone-900"
                >
                  {warehouses.map(w => (
                    <option key={w.id} value={w.id}>{w.code} - {w.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-stone-500 mb-0.5 font-medium">Bay / Zone</label>
                <select
                  value={sourceLocId}
                  onChange={(e) => setSourceLocId(e.target.value)}
                  className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-stone-900"
                >
                  {sourceWh?.locations.map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.code} - {loc.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Destination Location */}
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
            <span className="text-xs font-bold text-stone-800 uppercase tracking-wider">
              Destination Location (TO)
            </span>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-stone-500 mb-0.5 font-medium">Warehouse</label>
                <select
                  value={destWhId}
                  onChange={(e) => {
                    setDestWhId(e.target.value);
                    const w = warehouses.find(wh => wh.id === e.target.value);
                    if (w && w.locations[0]) setDestLocId(w.locations[0].id);
                  }}
                  className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-stone-900"
                >
                  {warehouses.map(w => (
                    <option key={w.id} value={w.id}>{w.code} - {w.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-stone-500 mb-0.5 font-medium">Bay / Zone</label>
                <select
                  value={destLocId}
                  onChange={(e) => setDestLocId(e.target.value)}
                  className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-stone-900"
                >
                  {destWh?.locations.map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.code} - {loc.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-stone-700 font-semibold mb-1">
              Quantity to Relocate ({currentProduct?.unit}) *
            </label>
            <input
              type="number"
              min="1"
              max={currentLocStock}
              value={transferQty}
              onChange={(e) => setTransferQty(e.target.value)}
              className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 font-mono text-stone-900 focus:outline-none focus:border-[#1e3a34]"
              required
            />
          </div>

          <div>
            <label className="block text-stone-700 font-semibold mb-1">Reason / Shift Notes</label>
            <textarea
              rows={2}
              placeholder="e.g. Relocating for assembly or rack re-organization..."
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
              Execute Transfer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
