import React from 'react';
import { MetricStrip } from '@/common/components/ui/MetricStrip';
import styles from './AnalyticsPage.module.css';

export function AnalyticsPage() {
  const CATEGORY_BREAKDOWN = [
    { category: 'Kurtas (Seasonal Batch)', units: 485, revenue: 193515, percentage: '41%' },
    { category: 'Oversized Streetwear Tees', units: 340, revenue: 118660, percentage: '25%' },
    { category: 'Corporate Pique Polos', units: 280, revenue: 120120, percentage: '26%' },
    { category: 'Fleece Pullover Hoodies', units: 95, revenue: 75905, percentage: '8%' },
  ];

  const analyticsMetrics = [
    { id: 'aov', label: 'Avg Order Value', value: '₹46,747', subtext: '+12.2% L30D' },
    { id: 'tat', label: 'Avg Turnaround', value: '4.2 Days', subtext: '-0.8d faster' },
    { id: 'rate', label: 'Fulfillment Rate', value: '99.4%', subtext: '0 Defects' },
    { id: 'repeat', label: 'Repeat Org Rate', value: '68.5%', subtext: '+5.1% QoQ' },
  ];

  return (
    <div className="admin-page-container">
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Analytics & Reports</h1>
        <p className={styles.subtitle}>Production volume, revenue breakdown, and turnaround metrics</p>
      </div>

      {/* Metric Strip */}
      <MetricStrip metrics={analyticsMetrics} />

      {/* Product Revenue Breakdown Table */}
      <div className={styles.sectionCard}>
        <h2 className={styles.sectionTitle}>Apparel Category Breakdown</h2>
        <div className="admin-table-container" style={{ marginTop: '14px' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Apparel Category</th>
                <th>Units Shipped</th>
                <th>Total Revenue</th>
                <th>Volume Share</th>
                <th>Demand Status</th>
              </tr>
            </thead>
            <tbody>
              {CATEGORY_BREAKDOWN.map(row => (
                <tr key={row.category}>
                  <td style={{ fontWeight: 600, color: '#0F172A' }}>{row.category}</td>
                  <td style={{ fontWeight: 600 }}>{row.units} Pcs</td>
                  <td style={{ fontWeight: 700, color: '#0F172A' }}>₹{row.revenue.toLocaleString('en-IN')}</td>
                  <td style={{ fontWeight: 500 }}>{row.percentage}</td>
                  <td>
                    <div className="status-dot-badge">
                      <span className="status-dot status-dot-emerald"></span>
                      <span>High Demand</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsPage;
