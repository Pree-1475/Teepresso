import React, { useState } from 'react';
import { RefreshCw, Download, Calendar, BarChart2 } from 'lucide-react';
import styles from './ReportsPage.module.css';

interface MonthlySalesData {
  month: string;
  orders: number;
  revenue: number;
  cogs: number;
  expenses: number;
  netProfit: number;
  updates: string;
  highlights: string[];
}

const MOCK_REPORTS: MonthlySalesData[] = [
  {
    month: 'Aug 2026',
    orders: 142,
    revenue: 485000,
    cogs: 194000,
    expenses: 85000,
    netProfit: 206000,
    updates: 'Strong start to Q3. TechFest and corporate bulk orders drove significant margin improvements.',
    highlights: ['Landed 2 new university contracts', 'Reduced shipping costs by 4%']
  },
  {
    month: 'Jul 2026',
    orders: 315,
    revenue: 920000,
    cogs: 368000,
    expenses: 120000,
    netProfit: 432000,
    updates: 'Peak summer season. High volume of t-shirt and light apparel orders. Factory ran at 95% capacity.',
    highlights: ['Record breaking monthly revenue', 'Zero fulfillment delays']
  },
  {
    month: 'Jun 2026',
    orders: 280,
    revenue: 815000,
    cogs: 326000,
    expenses: 110000,
    netProfit: 379000,
    updates: 'Steady growth. Introduced new organic cotton line which saw immediate adoption from startup clients.',
    highlights: ['Launched Organic Blank Series', 'Onboarded 5 new B2B clients']
  }
];

export function ReportsPage() {
  const [reports] = useState<MonthlySalesData[]>(MOCK_REPORTS);
  const [selectedMonth, setSelectedMonth] = useState<MonthlySalesData>(MOCK_REPORTS[0]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* OVERLAY */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#b45309',
        textAlign: 'center',
        padding: '24px'
      }}>
        <div style={{ backgroundColor: '#fffbeb', padding: '24px 32px', borderRadius: '12px', border: '2px dashed #f59e0b', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <h2 style={{ margin: '0 0 12px 0', fontSize: '24px', fontWeight: 800 }}>Yet to be improved..</h2>
          <p style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>This page is currently under development.</p>
        </div>
      </div>

    <div className={styles.workspace}>
      
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Profit & Loss Ledger</h1>
          <p className={styles.subtitle}>Financial reports, product margins, operating costs & business updates.</p>
        </div>
        <div className={styles.actions}>
          <button className="erp-btn-secondary" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Download size={14} />
            <span>Export Financials</span>
          </button>
        </div>
      </div>

      <div className={styles.gridContainer}>
        
        {/* Left Side: P&L Statement Grid */}
        <div className={styles.mainContent}>
          <div className={styles.sectionHeader}>
            <BarChart2 size={16} className="text-muted" />
            <h2 style={{ fontSize: '14px', fontWeight: 600 }}>Profit & Loss Performance (FY 2026)</h2>
          </div>

          <div className="erp-table-container">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Financial Item</th>
                  {reports.map(r => (
                    <th key={r.month} style={{ textAlign: 'right' }}>{r.month.split(' ')[0]}</th>
                  ))}
                  <th style={{ textAlign: 'right' }}>Total (YTD)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Gross Orders Fulfilled</td>
                  {reports.map(r => (
                    <td key={r.month} style={{ textAlign: 'right' }}>{r.orders}</td>
                  ))}
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>
                    {reports.reduce((sum, r) => sum + r.orders, 0)}
                  </td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Gross Business Revenue</td>
                  {reports.map(r => (
                    <td key={r.month} style={{ textAlign: 'right', color: 'var(--color-status-success)' }}>
                      ₹{r.revenue.toLocaleString('en-IN')}
                    </td>
                  ))}
                  <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--color-status-success)' }}>
                    ₹{reports.reduce((sum, r) => sum + r.revenue, 0).toLocaleString('en-IN')}
                  </td>
                </tr>
                <tr>
                  <td className="text-muted">Cost of Goods Sold (COGS)</td>
                  {reports.map(r => (
                    <td key={r.month} style={{ textAlign: 'right', color: 'var(--color-status-danger)' }}>
                      -₹{r.cogs.toLocaleString('en-IN')}
                    </td>
                  ))}
                  <td style={{ textAlign: 'right', color: 'var(--color-status-danger)' }}>
                    -₹{reports.reduce((sum, r) => sum + r.cogs, 0).toLocaleString('en-IN')}
                  </td>
                </tr>
                <tr>
                  <td className="text-muted">Operations Expenses</td>
                  {reports.map(r => (
                    <td key={r.month} style={{ textAlign: 'right', color: 'var(--color-status-danger)' }}>
                      -₹{r.expenses.toLocaleString('en-IN')}
                    </td>
                  ))}
                  <td style={{ textAlign: 'right', color: 'var(--color-status-danger)' }}>
                    -₹{reports.reduce((sum, r) => sum + r.expenses, 0).toLocaleString('en-IN')}
                  </td>
                </tr>
                <tr style={{ background: 'var(--color-surface-hover)' }}>
                  <td style={{ fontWeight: 600 }}>Net Operational Profit</td>
                  {reports.map(r => (
                    <td key={r.month} style={{ textAlign: 'right', fontWeight: 600, color: 'var(--color-primary)' }}>
                      ₹{r.netProfit.toLocaleString('en-IN')}
                    </td>
                  ))}
                  <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--color-primary)' }}>
                    ₹{reports.reduce((sum, r) => sum + r.netProfit, 0).toLocaleString('en-IN')}
                  </td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 500 }}>Profit Margin %</td>
                  {reports.map(r => {
                    const margin = ((r.netProfit / r.revenue) * 100).toFixed(1);
                    return (
                      <td key={r.month} style={{ textAlign: 'right', fontWeight: 500 }}>
                        {margin}%
                      </td>
                    );
                  })}
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>
                    {((reports.reduce((sum, r) => sum + r.netProfit, 0) / reports.reduce((sum, r) => sum + r.revenue, 0)) * 100).toFixed(1)}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Monthly Updates Card */}
        <div className={styles.sideContent}>
          <div className={styles.sectionHeader}>
            <Calendar size={16} className="text-muted" />
            <h2 style={{ fontSize: '14px', fontWeight: 600 }}>Business Updates</h2>
          </div>
          
          <div className={styles.updatesPanel}>
            <div className={styles.monthTabs}>
              {reports.map(r => (
                <button
                  key={r.month}
                  onClick={() => setSelectedMonth(r)}
                  className={`${styles.monthTab} ${selectedMonth.month === r.month ? styles.monthTabActive : ''}`}
                >
                  {r.month.split(' ')[0]}
                </button>
              ))}
            </div>

            <div className={styles.updateSection}>
              <h4 className={styles.updateLabel}>Executive Narrative</h4>
              <p className={styles.updateText}>{selectedMonth.updates}</p>
            </div>

            <div className={styles.updateSection}>
              <h4 className={styles.updateLabel}>Key Highlights</h4>
              <ul className={styles.highlightsList}>
                {selectedMonth.highlights.map((h, idx) => (
                  <li key={idx} className={styles.highlightItem}>{h}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}

export default ReportsPage;
