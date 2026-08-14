import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Zap,
  ShoppingBag,
  Palette,
  Database,
  Truck,
  Users,
  Plus,
  ArrowRight,
  X
} from 'lucide-react';
import styles from './CmdKModal.module.css';

interface CmdKModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CmdKModal({ isOpen, onClose }: CmdKModalProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open handled by parent or state
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
    { label: 'Create New Walk-in POS Order', path: '/offline-orders', icon: Plus, group: 'Actions' },
    { label: 'Inspect Orders Pipeline', path: '/orders', icon: ShoppingBag, group: 'Navigation' },
    { label: 'Review Pending Proofs', path: '/mockups', icon: Palette, group: 'Navigation' },
    { label: 'Check Warehouse Blanks Stock', path: '/inventory', icon: Database, group: 'Navigation' },
    { label: 'Open Dispatch Console', path: '/dispatch', icon: Truck, group: 'Navigation' },
    { label: 'Workforce & Attendance Roster', path: '/attendance', icon: Users, group: 'Navigation' },
    { label: 'IIT Bombay TechFest Batch (TP-8842)', path: '/orders', icon: Zap, group: 'Express Orders' },
    { label: 'ZettaScale Tech Inc Batch (TP-9011)', path: '/orders', icon: Zap, group: 'Express Orders' }
  ];

  const filtered = actions.filter(a =>
    a.label.toLowerCase().includes(query.toLowerCase()) ||
    a.group.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={styles.cmdBox} onClick={e => e.stopPropagation()}>
        <div className={styles.searchBar}>
          <Search size={16} color="var(--color-text-muted)" />
          <input
            type="text"
            placeholder="Type a command or search orders, SKUs, pages... (ESC to close)"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className={styles.searchInput}
            autoFocus
          />
          <button onClick={onClose} className={styles.closeBtn}>
            <X size={14} />
          </button>
        </div>

        <div className={styles.resultsList}>
          {filtered.length === 0 ? (
            <div className={styles.emptyText}>No matching commands found</div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  onClick={() => handleSelect(item.path)}
                  className={styles.resultItem}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Icon size={15} color="var(--color-text-muted)" />
                    <span className={styles.itemLabel}>{item.label}</span>
                  </div>
                  <span className={styles.groupBadge}>{item.group}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default CmdKModal;
