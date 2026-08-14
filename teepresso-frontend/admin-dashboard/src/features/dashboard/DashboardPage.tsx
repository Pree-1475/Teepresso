import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Download,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  Search
} from 'lucide-react';
import styles from './DashboardPage.module.css';

export function DashboardPage() {
  const navigate = useNavigate();

  const recentOrders = [
    { id: 'TP-1042', customer: 'College Fest 2025', items: '240 pcs', total: '₹48,000', status: 'Approved', priority: 'High', time: '10:30 AM' },
    { id: 'TP-1041', customer: 'ZettaScale Tech Inc', items: '50 pcs', total: '₹12,500', status: 'In Design', priority: 'Normal', time: '09:15 AM' },
    { id: 'TP-1040', customer: 'Greenwood RWA', items: '85 pcs', total: '₹22,100', status: 'Printing', priority: 'Normal', time: '08:45 AM' },
    { id: 'TP-1039', customer: 'Mumbai Marathon', items: '500 pcs', total: '₹85,000', status: 'QC Check', priority: 'High', time: 'Yesterday' },
    { id: 'TP-1038', customer: 'Local Cafe Merch', items: '30 pcs', total: '₹9,000', status: 'Dispatched', priority: 'Normal', time: 'Yesterday' },
  ];

  return (
    <div className={styles.dashboardContainer}>
      
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Overview</h1>
          <p className={styles.pageSubtitle}>Business performance and operational activity.</p>
        </div>
        <div className={styles.headerActions}>
          <button className="erp-btn-secondary" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Calendar size={14} />
            <span>This Month</span>
          </button>
          <button className="erp-btn-secondary" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Download size={14} />
            <span>Export</span>
          </button>
          <button className="erp-btn-primary" onClick={() => navigate('/offline-orders')} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Plus size={14} />
            <span>New Order</span>
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Total Orders</span>
          <div className={styles.kpiValueRow}>
            <span className={styles.kpiValue}>1,284</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Revenue</span>
          <div className={styles.kpiValueRow}>
            <span className={styles.kpiValue}>₹2.84L</span>
            <span className={styles.kpiTrendPositive}>
              <ArrowUpRight size={12} /> 8.4% vs last month
            </span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Pending Orders</span>
          <div className={styles.kpiValueRow}>
            <span className={styles.kpiValue}>18</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Urgent Orders</span>
          <div className={styles.kpiValueRow}>
            <span className={styles.kpiValue} style={{ color: 'var(--color-status-danger)' }}>7</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Ready to Dispatch</span>
          <div className={styles.kpiValueRow}>
            <span className={styles.kpiValue}>12</span>
          </div>
        </div>
      </div>

      <div className={styles.mainGrid}>
        {/* Left Column: Analytics & Pipeline */}
        <div className={styles.leftCol}>
          
          {/* Production Pipeline */}
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>Production Pipeline</h2>
              <button className={styles.panelLink} onClick={() => navigate('/orders')}>View All Orders</button>
            </div>
            
            <div className={styles.pipelineChart}>
              <div className={styles.pipelineStage}>
                <div className={styles.stageLabel}>Design In Progress</div>
                <div className={styles.stageBar}><div className={styles.stageFill} style={{ width: '40%' }}></div></div>
                <div className={styles.stageCount}>12</div>
              </div>
              <div className={styles.pipelineStage}>
                <div className={styles.stageLabel}>Waiting for Approval</div>
                <div className={styles.stageBar}><div className={styles.stageFill} style={{ width: '60%' }}></div></div>
                <div className={styles.stageCount}>18</div>
              </div>
              <div className={styles.pipelineStage}>
                <div className={styles.stageLabel}>Printing</div>
                <div className={styles.stageBar}><div className={styles.stageFill} style={{ width: '80%', background: 'var(--color-primary)' }}></div></div>
                <div className={styles.stageCount}>24</div>
              </div>
              <div className={styles.pipelineStage}>
                <div className={styles.stageLabel}>Quality Check</div>
                <div className={styles.stageBar}><div className={styles.stageFill} style={{ width: '25%' }}></div></div>
                <div className={styles.stageCount}>8</div>
              </div>
              <div className={styles.pipelineStage}>
                <div className={styles.stageLabel}>Ready for Dispatch</div>
                <div className={styles.stageBar}><div className={styles.stageFill} style={{ width: '35%', background: 'var(--color-status-success)' }}></div></div>
                <div className={styles.stageCount}>12</div>
              </div>
            </div>
          </div>

          {/* Recent Orders Table */}
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>Recent Orders</h2>
              <div className={styles.tableActions}>
                <div className={styles.compactSearch}>
                  <Search size={12} />
                  <input type="text" placeholder="Search orders..." />
                </div>
              </div>
            </div>
            
            <div className="erp-table-container">
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(order => (
                    <tr key={order.id} onClick={() => navigate(`/orders/${order.id}`)}>
                      <td className="text-mono">{order.id}</td>
                      <td>{order.customer}</td>
                      <td className="text-muted">{order.items}</td>
                      <td>{order.total}</td>
                      <td>
                        <span className={`badge ${order.status === 'Approved' ? 'badge-success' : order.status === 'Printing' ? 'badge-info' : 'badge-neutral'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        {order.priority === 'High' ? (
                          <span className="badge badge-danger">High</span>
                        ) : (
                          <span className="text-muted">Normal</span>
                        )}
                      </td>
                      <td className="text-muted">{order.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Column: Activity Timeline */}
        <div className={styles.rightCol}>
          
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>Recent Activity</h2>
            </div>
            
            <div className={styles.activityTimeline}>
              <div className={styles.activityItem}>
                <div className={styles.activityDot}></div>
                <div className={styles.activityContent}>
                  <p>Order <span className="text-mono">#TP1042</span> approved by customer</p>
                  <span className={styles.activityTime}>10:30 AM</span>
                </div>
              </div>
              
              <div className={styles.activityItem}>
                <div className={styles.activityDot}></div>
                <div className={styles.activityContent}>
                  <p>Design uploaded for <span className="text-mono">#TP1041</span></p>
                  <span className={styles.activityTime}>09:20 AM</span>
                </div>
              </div>

              <div className={styles.activityItem}>
                <div className={styles.activityDot}></div>
                <div className={styles.activityContent}>
                  <p>Payment received for <span className="text-mono">#TP1040</span></p>
                  <span className={styles.activityTime}>09:05 AM</span>
                </div>
              </div>

              <div className={styles.activityItem}>
                <div className={styles.activityDot}></div>
                <div className={styles.activityContent}>
                  <p>Order <span className="text-mono">#TP1039</span> moved to printing</p>
                  <span className={styles.activityTime}>08:20 AM</span>
                </div>
              </div>
              
               <div className={styles.activityItem}>
                <div className={styles.activityDot}></div>
                <div className={styles.activityContent}>
                  <p>Order <span className="text-mono">#TP1038</span> dispatched via Delhivery</p>
                  <span className={styles.activityTime}>Yesterday</span>
                </div>
              </div>
            </div>
            <button className={styles.panelLink} style={{ marginTop: '16px', display: 'block', width: '100%', textAlign: 'center' }}>
              View All Activity
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
