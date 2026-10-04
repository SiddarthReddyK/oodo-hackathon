import React, { useState } from 'react';
import { Sun, Moon, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useInventory } from '../../context/InventoryContext';
import { useTheme } from '../../context/ThemeContext';

export type NavTab =
  | 'dashboard'
  | 'receipts'
  | 'deliveries'
  | 'transfers'
  | 'adjustments'
  | 'products'
  | 'move_history'
  | 'settings';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onOpenProfile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenProfile
}) => {
  const { currentUser } = useAuth();
  const { warehouses, filter, setFilter } = useInventory();
  const { isDark, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: NavTab; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'receipts', label: 'Receipts' },
    { id: 'deliveries', label: 'Deliveries' },
    { id: 'transfers', label: 'Transfers' },
    { id: 'adjustments', label: 'Adjustments' },
    { id: 'products', label: 'Products' },
    { id: 'move_history', label: 'History' },
    { id: 'settings', label: 'Settings' }
  ];

  const currentWarehouse = warehouses.find(w => w.id === filter.warehouseId) || warehouses[0];

  return (
    <header className="bg-[#152e28] dark:bg-[#11241f] text-white px-4 sm:px-6 lg:px-8 py-0 flex items-center justify-between border-b border-[#1f3e37] sticky top-0 z-40 h-[60px] shadow-xs">
      {/* Brand logo & Nav Links */}
      <div className="flex items-center gap-4 xl:gap-8 min-w-0">
        <button
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer text-left focus:outline-none shrink-0"
        >
          {/* Cube logo icon matching reference UI */}
          <div className="w-7 h-7 rounded-lg border border-white/40 flex items-center justify-center text-white shrink-0">
            <svg
              className="w-4 h-4 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
              <path d="m3.3 7 8.7 5 8.7-5" />
              <path d="M12 22V12" />
            </svg>
          </div>
          <span className="text-[17px] font-bold tracking-tight text-white font-sans hidden sm:inline">
            StockSense
          </span>
        </button>

        {/* Center Tabs Nav */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2 h-[60px] min-w-0">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative px-2.5 xl:px-3 py-2 text-[13px] font-medium transition-colors cursor-pointer h-full flex items-center shrink-0 ${
                  isActive
                    ? 'text-white font-bold'
                    : 'text-stone-300/80 hover:text-white'
                }`}
              >
                <span>{item.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-2 right-2 h-[3px] bg-white rounded-t-sm" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Right Controls: Theme Toggle, Warehouse Pill, User Profile */}
      <div className="flex items-center gap-3 shrink-0 ml-2">
        {/* Subtle Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="p-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-stone-200 border border-white/10 transition-colors cursor-pointer focus:outline-none flex items-center justify-center shrink-0"
        >
          {isDark ? <Sun className="w-3.5 h-3.5 text-emerald-300" /> : <Moon className="w-3.5 h-3.5 text-emerald-100" />}
        </button>

        {/* Warehouse Selector Pill matching UI */}
        <div className="relative hidden md:block">
          <select
            value={filter.warehouseId}
            onChange={(e) => setFilter(prev => ({ ...prev, warehouseId: e.target.value }))}
            aria-label="Select warehouse"
            className="appearance-none bg-[#1e3c35] hover:bg-[#23453d] text-white text-[12px] font-medium rounded-xl pl-3.5 pr-8 py-1.5 border border-white/15 focus:outline-none cursor-pointer max-w-[190px] truncate"
          >
            {warehouses.map(wh => (
              <option key={wh.id} value={wh.id} className="bg-[#152e28] text-white">
                {wh.name}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-white/70 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* User Profile Pill matching UI */}
        <button
          onClick={onOpenProfile}
          className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-white/5 transition-colors cursor-pointer text-right focus:outline-none shrink-0"
        >
          <div className="hidden sm:block text-right">
            <div className="text-[13px] font-bold text-white tracking-tight leading-tight">
              {currentUser?.name || 'Dexter Morgan'}
            </div>
            <div className="text-[11px] text-[#9fb3ab] leading-tight mt-0.5">
              {currentUser?.role === 'inventory_manager' ? 'Inventory Manager' : 'Warehouse Staff'}
            </div>
          </div>
          {/* Avatar circle: white background with dark green initials */}
          <div className="w-8 h-8 rounded-full bg-white text-[#152e28] font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
            {currentUser?.name
              ? currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
              : 'DM'}
          </div>
        </button>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-lg text-emerald-100 hover:text-white hover:bg-white/10 focus:outline-none"
          aria-label="Toggle menu"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile navigation drop */}
      {mobileMenuOpen && (
        <div className="absolute top-[60px] left-0 right-0 bg-[#152e28] border-b border-[#1f3e37] p-4 flex flex-col gap-1 lg:hidden z-50 shadow-xl">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`p-2.5 rounded-lg text-left text-xs font-medium ${
                activeTab === item.id
                  ? 'bg-white/20 text-white font-bold'
                  : 'text-stone-300'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};
