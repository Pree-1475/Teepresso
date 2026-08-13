import React, { useState } from 'react';
import {
  SlidersHorizontal,
  ArrowUpRight,
  TrendingUp,
  MapPin,
  ChevronRight,
  MoreVertical,
  Search,
  Sliders,
  Upload,
  Plus,
  Compass,
  AlertCircle
} from 'lucide-react';
import styles from './DashboardPage.module.css';

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  supplier: string;
  category: string;
  cost: number;
  onHand: number;
  value: number;
  demand: 'High' | 'Low' | 'Medium';
  imgUrl: string;
}

const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: '1',
    name: 'Jaunt 360 Camera',
    sku: 'SKU-837263802',
    supplier: 'Jaunt',
    category: 'Electronics',
    cost: 48300,
    onHand: 13,
    value: 627900,
    demand: 'High',
    imgUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=80&auto=format&fit=crop&q=60'
  },
  {
    id: '2',
    name: 'Theta S Close Up 360',
    sku: 'SKU-32887763',
    supplier: 'Theta',
    category: 'Electronics',
    cost: 14700,
    onHand: 103,
    value: 1514100,
    demand: 'Low',
    imgUrl: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=80&auto=format&fit=crop&q=60'
  },
  {
    id: '3',
    name: 'Heavyweight Oversized Streetwear Tee',
    sku: 'SKU-77382910',
    supplier: 'Teepresso Hub',
    category: 'T-Shirts',
    cost: 349,
    onHand: 480,
    value: 167520,
    demand: 'High',
    imgUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=80&auto=format&fit=crop&q=60'
  },
  {
    id: '4',
    name: 'Classic Pique Corporate Polo Shirt',
    sku: 'SKU-88291039',
    supplier: 'Teepresso Hub',
    category: 'Polos',
    cost: 429,
    onHand: 220,
    value: 94380,
    demand: 'Medium',
    imgUrl: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=80&auto=format&fit=crop&q=60'
  }
];

export function DashboardPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSupplier, setSelectedSupplier] = useState('All');

  // Filters
  const filteredItems = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSupplier = selectedSupplier === 'All' || item.supplier === selectedSupplier;
    return matchesSearch && matchesCategory && matchesSupplier;
  });

  return (
    <div className="admin-page-container">
      {/* 3 Main Dashboard Cards Redesign (Orders, Stock, Reorders) */}
      <div className={styles.cardsGrid}>
        
        {/* 1. Yellow Orders Card */}
        <div className={styles.ordersCard}>
          <div className={styles.cardHeaderRow}>
            <span className={styles.cardHeading}>Orders</span>
            <button className={styles.smallPillBtn}>
              <SlidersHorizontal size={12} />
            </button>
          </div>

          <div className={styles.ordersStatsGrid}>
            <div className={styles.statGroup}>
              <span className={styles.statNum}>1</span>
              <span className={styles.statLabel}>Overdue</span>
            </div>
            <div className={styles.statGroup}>
              <span className={styles.statNum}>3</span>
              <span className={styles.statLabel}>Returns</span>
            </div>
            <div className={styles.statGroup}>
              <span className={styles.statNum}>14</span>
              <span className={styles.statLabel}>In progress</span>
            </div>
            <div className={styles.statGroup}>
              <span className={styles.statNum}>94</span>
              <span className={styles.statLabel}>Completed</span>
            </div>
          </div>

          {/* Stripe Pattern Visual Bar Graph */}
          <div className={styles.stripeChartContainer}>
            <div className={styles.stripeBar} style={{ height: '35%', width: '18px' }}></div>
            <div className={styles.stripeBar} style={{ height: '55%', width: '18px' }}></div>
            <div className={styles.stripeBar} style={{ height: '85%', width: '18px' }}></div>
            <div className={styles.stripeBar} style={{ height: '40%', width: '18px' }}></div>
            <div className={styles.stripeBar} style={{ height: '70%', width: '18px' }}></div>
          </div>
        </div>

        {/* 2. Coral Stock Card */}
        <div className={styles.stockCard}>
          <div className={styles.cardHeaderRow}>
            <span className={styles.cardHeading}>Stock</span>
            <button className={styles.smallPillBtn}>
              <SlidersHorizontal size={12} />
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flex: 1 }}>
            {/* Stock category markers */}
            <div className={styles.stockMarkers}>
              <div className={styles.markerRow}>
                <span className={`${styles.markerDot} ${styles.dotInStock}`}></span>
                <span className={styles.markerText}>In stock</span>
              </div>
              <div className={styles.markerRow}>
                <span className={`${styles.markerDot} ${styles.dotOutStock}`}></span>
                <span className={styles.markerText}>Out of stock</span>
              </div>
              <div className={styles.markerRow}>
                <span className={`${styles.markerDot} ${styles.dotLowStock}`}></span>
                <span className={styles.markerText}>Low stock</span>
              </div>
              <div className={styles.markerRow}>
                <span className={`${styles.markerDot} ${styles.dotDeadStock}`}></span>
                <span className={styles.markerText}>Dead stock</span>
              </div>
            </div>

            {/* Pie/Donut Chart visual with yellow pill badge */}
            <div className={styles.pieContainer}>
              <div className={styles.donutGraphic}>
                <div className={styles.donutHole}>
                  <div className={styles.centerBadge}>134</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Dark Reorders Card */}
        <div className={styles.reordersCard}>
          <div className={styles.cardHeaderRow}>
            <span className={styles.cardHeadingDark}>Reorders</span>
            <button className={styles.darkArrowBtn}>
              <ArrowUpRight size={13} color="#FFFFFF" />
            </button>
          </div>

          {/* Product Dome Stack */}
          <div className={styles.productStackContainer}>
            <div className={styles.stackedCardBack2}></div>
            <div className={styles.stackedCardBack1}></div>
            <div className={styles.stackedCardActive}>
              <img
                src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=180&auto=format&fit=crop&q=80"
                alt="Jaunt Camera Dome"
                className={styles.productActiveImg}
              />
            </div>
          </div>

          {/* Product Demand stats */}
          <div className={styles.reorderFooter}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span className={styles.demandBadge}>⚡ High demand</span>
              <strong className={styles.productTitle}>Jaunt 360 Camera</strong>
              <div className={styles.demandDetail}>Estimated demand: 100+ • In stock: 13</div>
            </div>
            <button className={styles.yellowAddBtn}>
              <Plus size={16} color="#0F0F11" />
            </button>
          </div>
        </div>
      </div>

      {/* Logistics Map & Status Card */}
      <div className={styles.logisticsMapRow}>
        <div className={styles.logisticsCard}>
          <div className={styles.cardHeaderRow}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-title)' }}>Logistics</span>
          </div>

          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Visual USA Map routes illustration */}
            <div className={styles.mapIllustrationContainer}>
              <div className={styles.mapGridBackground}></div>
              <div className={styles.yellowStateHighlight}></div>
              <svg className={styles.routeSvg} width="100%" height="100%">
                <path d="M 50 80 Q 150 40 280 90" fill="transparent" stroke="#E2E8F0" strokeWidth="2" strokeDasharray="4 4" />
                <circle cx="50" cy="80" r="5" fill="#FF8F5C" />
                <circle cx="280" cy="90" r="5" fill="#ECEF22" />
              </svg>
              <div className={styles.delayRouteBadge}>Delay +2d</div>
            </div>

            {/* Delayed items list */}
            <div style={{ flex: 1, minWidth: '240px' }}>
              <span className={styles.deliveryDelayText}>Delivery is delayed</span>
              <div className={styles.delayedPillRow}>
                <div className={styles.delayItemAvatar}>
                  <img src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=40&auto=format&fit=crop&q=80" alt="product" />
                </div>
                <div className={styles.delayItemAvatar}>
                  <img src="https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=40&auto=format&fit=crop&q=80" alt="product" />
                </div>
                <div className={styles.delayCountBadge}>+32</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table Filters Bar */}
      <div className={styles.filtersBar}>
        {/* Search input capsule */}
        <div className={styles.searchCapsule}>
          <Search size={14} color="var(--color-text-muted)" />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className={styles.searchField}
          />
        </div>

        {/* Dropdowns */}
        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className={styles.dropdownSelect}
        >
          <option value="All">Category</option>
          <option value="Electronics">Electronics</option>
          <option value="T-Shirts">T-Shirts</option>
          <option value="Polos">Polos</option>
        </select>

        <select
          value={selectedSupplier}
          onChange={e => setSelectedSupplier(e.target.value)}
          className={styles.dropdownSelect}
        >
          <option value="All">Supplier</option>
          <option value="Jaunt">Jaunt</option>
          <option value="Theta">Theta</option>
          <option value="Teepresso Hub">Teepresso Hub</option>
        </select>

        <select className={styles.dropdownSelect}>
          <option>Storage</option>
        </select>

        {/* Action controls */}
        <button className={styles.controlPill} title="Filter parameters">
          <Sliders size={13} />
        </button>

        <button className={styles.controlPill} title="Export inventory list">
          <Upload size={13} />
        </button>

        <button className={styles.yellowActionBtn} title="Register new product blank">
          <Plus size={14} color="#0F0F11" />
        </button>
      </div>

      {/* High Density Premium Inventory Table */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: '40px', textAlign: 'center' }}>
                <input type="checkbox" className={styles.checkboxInput} />
              </th>
              <th>Product</th>
              <th>Supplier</th>
              <th>Category</th>
              <th>Cost</th>
              <th>On hand</th>
              <th>On hand value</th>
              <th>Demand</th>
              <th style={{ width: '50px', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map(item => (
              <tr key={item.id}>
                <td style={{ textAlign: 'center' }}>
                  <input type="checkbox" className={styles.checkboxInput} />
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className={styles.productThumbnail}>
                      <img src={item.imgUrl} alt={item.name} />
                    </div>
                    <div>
                      <div className={styles.productNameText}>{item.name}</div>
                      <div className={styles.skuText}>{item.sku}</div>
                    </div>
                  </div>
                </td>
                <td style={{ fontWeight: 500 }}>{item.supplier}</td>
                <td>{item.category}</td>
                <td style={{ fontWeight: 600 }}>₹{item.cost.toLocaleString('en-IN')}</td>
                <td style={{ fontWeight: 600 }}>{item.onHand}</td>
                <td style={{ fontWeight: 700, color: 'var(--color-text-title)' }}>
                  ₹{item.value.toLocaleString('en-IN')}
                </td>
                <td>
                  <span className={`${styles.demandPill} ${item.demand === 'High' ? styles.demandHigh : styles.demandLow}`}>
                    {item.demand}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button className={styles.threeDotsBtn}>
                    <MoreVertical size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DashboardPage;
