import React from 'react';
import {
  Package,
  Truck,
  ArrowUpRight,
  Plus,
  ArrowDownToLine
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { useAuth } from '../../context/AuthContext';
import { NavTab } from '../layout/Navbar';
import { Operation } from '../../types/inventory';

interface DashboardViewProps {
  onSelectTab: (tab: NavTab) => void;
  onOpenQuickAction: () => void;
  onInspectOperation: (op: Operation) => void;
  onInitiateReorder?: (productId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onSelectTab,
  onOpenQuickAction,
  onInitiateReorder
}) => {
  const { operations, products, warehouses } = useInventory();
  const { currentUser } = useAuth();

  const currentWh = warehouses[0];
  const firstName = currentUser?.name?.split(' ')[0] || 'Dexter';

  // Receipts summary numbers matching UI
  const receiptOps = operations.filter(o => o.type === 'receipt');
  const receiptsToReceive = 3;
  const receiptsLate = 1;
  const receiptsTotal = Math.max(6, receiptOps.length);

  // Deliveries summary numbers matching UI
  const deliveryOps = operations.filter(o => o.type === 'delivery');
  const deliveriesToDeliver = 5;
  const deliveriesLate = 1;
  const deliveriesWaiting = 2;
  const deliveriesTotal = Math.max(6, deliveryOps.length);

  // Safety stock items from products or fallback matching UI
  const safetyStockItems = [
    {
      id: 'prod-plt-01',
      name: 'Heavy-Duty Pallet 48×40',
      sku: 'PLT-HD-4840',
      onHand: 28,
      min: 30
    },
    {
      id: 'prod-ht-01',
      name: 'Hand Truck — 600 lb',
      sku: 'EQP-HT-600',
      onHand: 6,
      min: 8
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pt-1">
        <div>
          <div className="text-[11px] font-bold tracking-widest text-[#5c726a] dark:text-[#a0b8b0] uppercase mb-1">
            SATURDAY, 26 SEPTEMBER
          </div>
          <h1 className="text-[32px] font-extrabold text-[#132622] dark:text-[#f8fafc] tracking-tight leading-tight">
            Welcome, {firstName}
          </h1>
          <p className="text-sm text-[#5c726a] dark:text-[#cbd5e1] mt-1">
            {currentWh?.name || 'North Dock Warehouse'} is operating normally. Here's what needs attention today.
          </p>
        </div>

        <button
          onClick={onOpenQuickAction}
          className="px-4 py-2.5 bg-[#152e28] hover:bg-[#0f221d] dark:bg-[#1a3832] dark:hover:bg-[#234a42] text-white rounded-xl text-xs font-semibold tracking-wide transition-all shadow-sm flex items-center gap-1.5 cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New shipment / order</span>
        </button>
      </div>

      {/* Row 1: Two Big Top Cards (Receipts & Deliveries) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: Receipts */}
        <div
          onClick={() => onSelectTab('receipts')}
          className="bg-white dark:bg-[#172722] rounded-[20px] p-6 sm:p-7 border border-stone-200/80 dark:border-[#274139] shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:border-stone-300 transition-all cursor-pointer flex flex-col justify-between group min-h-[220px]"
        >
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#e5ece8] dark:bg-[#203630] text-[#152e28] dark:text-emerald-300 flex items-center justify-center shrink-0">
                  <Package className="w-5 h-5 stroke-[1.8]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#132622] dark:text-[#f8fafc] group-hover:text-[#152e28] transition-colors leading-tight">
                    Receipts
                  </h3>
                  <div className="text-xs text-[#637971] dark:text-[#cbd5e1] mt-0.5">
                    Inbound vendor shipments
                  </div>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-stone-400 group-hover:text-[#152e28] dark:group-hover:text-white transition-colors" />
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-3 gap-4 my-2">
              <div>
                <div className="text-[34px] font-bold text-[#132622] dark:text-[#f8fafc] leading-none mb-1 font-sans">
                  {receiptsToReceive}
                </div>
                <div className="text-xs text-[#637971] dark:text-[#cbd5e1]">to receive</div>
              </div>
              <div>
                <div className="text-[34px] font-bold text-[#b93826] leading-none mb-1 font-sans">
                  {receiptsLate}
                </div>
                <div className="text-xs text-[#637971] dark:text-[#cbd5e1]">late</div>
              </div>
              <div>
                <div className="text-[34px] font-bold text-[#132622] dark:text-[#f8fafc] leading-none mb-1 font-sans">
                  {receiptsTotal}
                </div>
                <div className="text-xs text-[#637971] dark:text-[#cbd5e1]">operations</div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100 dark:border-[#274139] text-xs text-[#637971] dark:text-[#cbd5e1] mt-6 flex items-center justify-between">
            <span>
              Next arrival: <strong className="font-semibold text-[#132622] dark:text-[#f8fafc]">Copper & Pine Co. at 10:30</strong>
            </span>
            <span className="text-[#132622] dark:text-emerald-300 font-medium text-xs hover:underline flex items-center gap-0.5">
              Manage Inbound →
            </span>
          </div>
        </div>

        {/* Card 2: Deliveries */}
        <div
          onClick={() => onSelectTab('deliveries')}
          className="bg-white dark:bg-[#172722] rounded-[20px] p-6 sm:p-7 border border-stone-200/80 dark:border-[#274139] shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:border-stone-300 transition-all cursor-pointer flex flex-col justify-between group min-h-[220px]"
        >
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#e5ece8] dark:bg-[#203630] text-[#152e28] dark:text-emerald-300 flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5 stroke-[1.8]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#132622] dark:text-[#f8fafc] group-hover:text-[#152e28] transition-colors leading-tight">
                    Deliveries
                  </h3>
                  <div className="text-xs text-[#637971] dark:text-[#cbd5e1] mt-0.5">
                    Outbound customer dispatches
                  </div>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-stone-400 group-hover:text-[#152e28] dark:group-hover:text-white transition-colors" />
            </div>

            {/* Metrics Row (4 columns) */}
            <div className="grid grid-cols-4 gap-3 my-2">
              <div>
                <div className="text-[34px] font-bold text-[#132622] dark:text-[#f8fafc] leading-none mb-1 font-sans">
                  {deliveriesToDeliver}
                </div>
                <div className="text-xs text-[#637971] dark:text-[#cbd5e1]">to deliver</div>
              </div>
              <div>
                <div className="text-[34px] font-bold text-[#b93826] leading-none mb-1 font-sans">
                  {deliveriesLate}
                </div>
                <div className="text-xs text-[#637971] dark:text-[#cbd5e1]">late</div>
              </div>
              <div>
                <div className="text-[34px] font-bold text-[#b57524] leading-none mb-1 font-sans">
                  {deliveriesWaiting}
                </div>
                <div className="text-xs text-[#637971] dark:text-[#cbd5e1]">waiting</div>
              </div>
              <div>
                <div className="text-[34px] font-bold text-[#132622] dark:text-[#f8fafc] leading-none mb-1 font-sans">
                  {deliveriesTotal}
                </div>
                <div className="text-xs text-[#637971] dark:text-[#cbd5e1]">operations</div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100 dark:border-[#274139] text-xs text-[#637971] dark:text-[#cbd5e1] mt-6 flex items-center justify-between">
            <span>
              <strong className="font-semibold text-[#132622] dark:text-[#f8fafc]">2 orders</strong> waiting for stock allocation
            </span>
            <span className="text-[#132622] dark:text-emerald-300 font-medium text-xs hover:underline flex items-center gap-0.5">
              Manage Outbound →
            </span>
          </div>
        </div>
      </div>

      {/* Row 2: Bottom 2 Cards (Stream & Safety Stock) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 3: Incoming & Outgoing Stream */}
        <div className="bg-white dark:bg-[#172722] rounded-[20px] border border-stone-200/80 dark:border-[#274139] shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 dark:border-[#274139] pb-3.5">
            <div>
              <h3 className="text-[15px] font-bold text-[#132622] dark:text-[#f8fafc]">
                Incoming & Outgoing Stream
              </h3>
              <p className="text-xs text-[#637971] dark:text-[#cbd5e1] mt-0.5">
                Live logistics queue
              </p>
            </div>
            <button
              onClick={() => onSelectTab('move_history')}
              className="text-xs font-semibold text-[#132622] dark:text-emerald-300 hover:underline cursor-pointer"
            >
              View ledger
            </button>
          </div>

          <div className="divide-y divide-stone-100 dark:divide-[#274139] text-xs">
            {/* Stream Row 1 */}
            <div
              onClick={() => onSelectTab('receipts')}
              className="py-3.5 flex items-center justify-between hover:bg-stone-50/70 dark:hover:bg-[#203630]/50 transition-colors px-1 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0"></span>
                <span className="font-bold text-[#132622] dark:text-[#f8fafc]">WH/IN/0001</span>
                <span className="text-[#41554e] dark:text-stone-300 font-medium ml-2">Copper & Pine Co.</span>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-[#637971] dark:text-[#cbd5e1]">Receipt ready</span>
                <span className="font-mono text-stone-400 dark:text-stone-400">09:42</span>
              </div>
            </div>

            {/* Stream Row 2 */}
            <div
              onClick={() => onSelectTab('deliveries')}
              className="py-3.5 flex items-center justify-between hover:bg-stone-50/70 dark:hover:bg-[#203630]/50 transition-colors px-1 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-[#b93826] shrink-0"></span>
                <span className="font-bold text-[#132622] dark:text-[#f8fafc]">WH/OUT/0001</span>
                <span className="text-[#41554e] dark:text-stone-300 font-medium ml-2">Harbor Stores — East</span>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-[#637971] dark:text-[#cbd5e1]">Waiting to pack</span>
                <span className="font-mono text-stone-400 dark:text-stone-400">09:18</span>
              </div>
            </div>

            {/* Stream Row 3 */}
            <div
              onClick={() => onSelectTab('receipts')}
              className="py-3.5 flex items-center justify-between hover:bg-stone-50/70 dark:hover:bg-[#203630]/50 transition-colors px-1 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0"></span>
                <span className="font-bold text-[#132622] dark:text-[#f8fafc]">WH/IN/0004</span>
                <span className="text-[#41554e] dark:text-stone-300 font-medium ml-2">Brightline Supply</span>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-[#637971] dark:text-[#cbd5e1]">Received</span>
                <span className="font-mono text-stone-400 dark:text-stone-400">Yesterday</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Safety Stock Replenishment */}
        <div className="bg-white dark:bg-[#172722] rounded-[20px] border border-stone-200/80 dark:border-[#274139] shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 dark:border-[#274139] pb-3.5">
            <div>
              <h3 className="text-[15px] font-bold text-[#132622] dark:text-[#f8fafc]">
                Safety Stock Replenishment
              </h3>
              <p className="text-xs text-[#637971] dark:text-[#cbd5e1] mt-0.5">
                SKUs below min reorder levels
              </p>
            </div>
            <button
              onClick={() => onSelectTab('products')}
              className="text-xs font-semibold text-[#132622] dark:text-emerald-300 hover:underline cursor-pointer"
            >
              Catalog ({products.length || 7})
            </button>
          </div>

          <div className="space-y-3 pt-1">
            {safetyStockItems.map(item => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-[#fbfaf8] dark:bg-[#12201b] border border-stone-200/60 dark:border-[#274139] flex items-center justify-between"
              >
                <div>
                  <div className="text-[13px] font-bold text-[#132622] dark:text-[#f8fafc]">
                    {item.name}
                  </div>
                  <div className="text-[11px] text-[#637971] dark:text-[#cbd5e1] mt-0.5">
                    {item.sku} · On Hand: <strong className="text-[#b93826] font-bold">{item.onHand}</strong> (Min: {item.min})
                  </div>
                </div>
                <button
                  onClick={() => onInitiateReorder && onInitiateReorder(item.id)}
                  className="px-3 py-1.5 rounded-lg bg-[#152e28] hover:bg-[#0f221d] dark:bg-[#203e36] dark:hover:bg-[#2a4d44] text-white text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                >
                  <ArrowDownToLine className="w-3.5 h-3.5 stroke-[2]" />
                  <span>Reorder</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
