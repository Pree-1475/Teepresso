import React, { useState, useEffect } from 'react';
import { TrendingUp, RefreshCw, BarChart2, Award, Calendar } from 'lucide-react';
import styles from './ReportsPage.module.css';

interface MonthlySalesData {
  month: string;
  sales: number;
  orders: number;
  revenue: number;
  cogs: number;
  expenses: number;
  netProfit: number;
  updates: string;
  highlights: string[];
}

export function ReportsPage() {
  const [reports, setReports] = useState<MonthlySalesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<MonthlySalesData | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/v1/reports');
      const data = await res.json();
      if (data.success) {
        setReports(data.reports);
        setSelectedMonth(data.reports[0] || null);
      }
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="admin-page-container">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-muted)' }}>
          <RefreshCw className="animate-spin" size={16} />
          <span>Generating business intelligence ledger...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page-container">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-title)' }}>Profit & Loss Ledger</h1>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Financial reports, product margins, operating costs & business updates</p>
        </div>
        <button onClick={fetchReports} className={styles.refreshBtn}>
          <RefreshCw size={13} /> Sync Financials
        </button>
      </div>

      {/* Grid Layout */}
      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
        
        {/* Left Side: P&L Statement Grid */}
        <div style={{ flex: 1.5 }}>
          <div className={styles.panelTitleRow}>
            <BarChart2 size={16} color="var(--color-text-muted)" />
            <h2 style={{ fontSize: '14px', fontWeight: 600 }}>Profit & Loss Performance (FY 2026 MTD)</h2>
          </div>

          <div className="admin-table-container" style={{ marginBottom: '24px' }}>
            <table className="admin-table">
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
                  <td style={{ fontWeight: 600 }}>Gross Orders Fulfilled</td>
                  {reports.map(r => (
                    <td key={r.month} style={{ textAlign: 'right' }}>{r.orders} orders</td>
                  ))}
                  <td style={{ textAlign: 'right', fontWeight: 700 }}>
                    {reports.reduce((sum, r) => sum + r.orders, 0)} orders
                  </td>
                </tr>
                <tr className={styles.revenueRow}>
                  <td style={{ fontWeight: 600 }}>Gross Business Revenue</td>
                  {reports.map(r => (
                    <td key={r.month} style={{ textAlign: 'right', color: '#047857', fontWeight: 600 }}>
                      ₹{r.revenue.toLocaleString('en-IN')}
                    </td>
                  ))}
                  <td style={{ textAlign: 'right', fontWeight: 700, color: '#047857' }}>
                    ₹{reports.reduce((sum, r) => sum + r.revenue, 0).toLocaleString('en-IN')}
                  </td>
                </tr>
                <tr>
                  <td style={{ color: 'var(--color-text-muted)' }}>Cost of Goods Sold (COGS)</td>
                  {reports.map(r => (
                    <td key={r.month} style={{ textAlign: 'right', color: '#991B1B' }}>
                      -₹{r.cogs.toLocaleString('en-IN')}
                    </td>
                  ))}
                  <td style={{ textAlign: 'right', color: '#991B1B' }}>
                    -₹{reports.reduce((sum, r) => sum + r.cogs, 0).toLocaleString('en-IN')}
                  </td>
                </tr>
                <tr>
                  <td style={{ color: 'var(--color-text-muted)' }}>Operations Expenses (Logistics & Payroll)</td>
                  {reports.map(r => (
                    <td key={r.month} style={{ textAlign: 'right', color: '#991B1B' }}>
                      -₹{r.expenses.toLocaleString('en-IN')}
                    </td>
                  ))}
                  <td style={{ textAlign: 'right', color: '#991B1B' }}>
                    -₹{reports.reduce((sum, r) => sum + r.expenses, 0).toLocaleString('en-IN')}
                  </td>
                </tr>
                <tr className={styles.netProfitRow}>
                  <td style={{ fontWeight: 700 }}>Net Operational Profit</td>
                  {reports.map(r => (
                    <td key={r.month} style={{ textAlign: 'right', fontWeight: 700, color: 'var(--color-brand-primary)' }}>
                      ₹{r.netProfit.toLocaleString('en-IN')}
                    </td>
                  ))}
                  <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--color-brand-primary)' }}>
                    ₹{reports.reduce((sum, r) => sum + r.netProfit, 0).toLocaleString('en-IN')}
                  </td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Profit Margin %</td>
                  {reports.map(r => {
                    const margin = ((r.netProfit / r.revenue) * 100).toFixed(1);
                    return (
                      <td key={r.month} style={{ textAlign: 'right', fontWeight: 600 }}>
                        {margin}%
                      </td>
                    );
                  })}
                  <td style={{ textAlign: 'right', fontWeight: 700 }}>
                    {((reports.reduce((sum, r) => sum + r.netProfit, 0) / reports.reduce((sum, r) => sum + r.revenue, 0)) * 100).toFixed(1)}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Monthly Updates Card */}
        {selectedMonth && (
          <div className={styles.updatesCard}>
            <div className={styles.cardHeader}>
              <Calendar size={15} color="var(--color-brand-primary)" />
              <h3 style={{ fontSize: '13px', fontWeight: 600 }}>Business Updates: {selectedMonth.month}</h3>
            </div>
            
            <div className={styles.cardBody}>
              {/* Select Month Switcher */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                {reports.map(r => (
                  <button
                    key={r.month}
                    onClick={() => setSelectedMonth(r)}
                    className={`${styles.monthBtn} ${selectedMonth.month === r.month ? styles.monthBtnActive : ''}`}
                  >
                    {r.month.split(' ')[0]}
                  </button>
                ))}
              </div>

              <div className={styles.summaryBox}>
                <h4 style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                  Executive Narrative
                </h4>
                <p style={{ fontSize: '13px', color: 'var(--color-text-body)', lineHeight: '1.6' }}>
                  {selectedMonth.updates}
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Award size={12} /> Key Highlights & Milestones
                </h4>
                <ul className={styles.highlightsList}>
                  {selectedMonth.highlights.map((h, idx) => (
                    <li key={idx} className={styles.highlightItem}>
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default ReportsPage;
