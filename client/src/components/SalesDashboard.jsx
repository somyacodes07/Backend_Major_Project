import React, { useState, useEffect } from 'react';
import { salesApi } from '../services/api';
import { ShieldAlert, ArrowRight } from 'lucide-react';

export default function SalesDashboard({ user, onSwitchToOwner }) {
  const isOwner = user?.role === 'owner';

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchSalesSummary = async () => {
    if (!isOwner) return;
    try {
      setLoading(true);
      setError('');
      const res = await salesApi.getSummary();
      setData(res.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch sales analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOwner) {
      fetchSalesSummary();
    }
  }, [isOwner]);

  // If user is STAFF: Render strict monochrome RBAC guard screen
  if (!isOwner) {
    return (
      <div style={{
        maxWidth: '560px',
        margin: '60px auto',
        padding: '32px',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-subtle)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <ShieldAlert size={16} color="var(--text-muted)" />
          <span className="mono-meta">RBAC ENFORCEMENT • HTTP 403</span>
        </div>

        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '8px' }}>
          Restricted Resource: Business Owner Only
        </h2>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '20px' }}>
          In accordance with Objective 4, financial aggregation pipelines (<code>GET /api/sales-summary</code>) are restricted exclusively to authenticated users holding the <code>owner</code> role. Staff accounts are isolated to contact management and interaction logging.
        </p>

        <div style={{
          padding: '12px 14px',
          backgroundColor: 'var(--bg-canvas)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.78rem',
          color: 'var(--text-secondary)',
          marginBottom: '20px',
        }}>
          <div>Role: <strong>{user?.role}</strong> (Access Denied)</div>
          <div style={{ color: 'var(--text-dim)', marginTop: '2px' }}>
            Endpoint: GET /api/sales-summary &rarr; 403 Forbidden
          </div>
        </div>

        {onSwitchToOwner && (
          <button onClick={onSwitchToOwner} className="btn btn-primary btn-sm" style={{ width: '100%' }}>
            Switch to Owner Session (Rajesh Sharma) <ArrowRight size={13} />
          </button>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ padding: '80px', textAlign: 'center', color: 'var(--text-muted)' }} className="mono-meta">
        Executing MongoDB aggregation pipeline ($match &rarr; $group &rarr; $lookup &rarr; $project)...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>{error}</p>
        <button onClick={fetchSalesSummary} className="btn btn-secondary btn-sm">
          Retry Pipeline
        </button>
      </div>
    );
  }

  if (!data) return null;

  const { overview = {}, totalSalesPerCustomer = [], paymentMethodsBreakdown = [], monthlyTrends = [] } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title & Pipeline Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        flexWrap: 'wrap',
        gap: '12px',
        borderBottom: '1px solid var(--border)',
        paddingBottom: '16px',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 600 }}>Sales Intelligence</h2>
            <span className="mono-pill">Owner Authorization</span>
          </div>
          <p className="mono-meta" style={{ marginTop: '2px' }}>
            Aggregate pipeline: $group by customer, $sum purchases
          </p>
        </div>

        <button onClick={fetchSalesSummary} className="btn btn-secondary btn-sm">
          Refresh Pipeline
        </button>
      </div>

      {/* 4 Monochrome KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '12px',
      }}>
        <div className="card-hairline" style={{ padding: '16px 20px' }}>
          <span className="mono-meta" style={{ display: 'block' }}>GROSS REVENUE</span>
          <div className="tabular" style={{ fontSize: '1.7rem', fontWeight: 600, marginTop: '4px' }}>
            ₹{(overview.totalRevenue || 0).toLocaleString('en-IN')}
          </div>
          <span className="mono-meta" style={{ display: 'block', marginTop: '2px', fontSize: '0.7rem' }}>
            Settled paid invoices
          </span>
        </div>

        <div className="card-hairline" style={{ padding: '16px 20px' }}>
          <span className="mono-meta" style={{ display: 'block' }}>TRANSACTIONS</span>
          <div className="tabular" style={{ fontSize: '1.7rem', fontWeight: 600, marginTop: '4px' }}>
            {overview.totalTransactions || 0}
          </div>
          <span className="mono-meta" style={{ display: 'block', marginTop: '2px', fontSize: '0.7rem' }}>
            Total processed orders
          </span>
        </div>

        <div className="card-hairline" style={{ padding: '16px 20px' }}>
          <span className="mono-meta" style={{ display: 'block' }}>AVG ORDER VALUE</span>
          <div className="tabular" style={{ fontSize: '1.7rem', fontWeight: 600, marginTop: '4px' }}>
            ₹{(overview.averageTransactionValue || 0).toLocaleString('en-IN')}
          </div>
          <span className="mono-meta" style={{ display: 'block', marginTop: '2px', fontSize: '0.7rem' }}>
            Calculated arithmetic mean
          </span>
        </div>

        <div className="card-hairline" style={{ padding: '16px 20px' }}>
          <span className="mono-meta" style={{ display: 'block' }}>PAYING CLIENTS</span>
          <div className="tabular" style={{ fontSize: '1.7rem', fontWeight: 600, marginTop: '4px' }}>
            {overview.payingCustomersCount || 0}
          </div>
          <span className="mono-meta" style={{ display: 'block', marginTop: '2px', fontSize: '0.7rem' }}>
            Distinct customer ids
          </span>
        </div>
      </div>

      {/* Aggregation Table: Total Sales Per Customer */}
      <div className="card-hairline" style={{ padding: '20px' }}>
        <div style={{ marginBottom: '14px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>
            Total Sales per Customer (Objective 5 Aggregation)
          </h3>
          <span className="mono-meta">
            Pipeline: Purchase.aggregate([ &#123; $match: &#123; paymentStatus: 'paid' &#125; &#125;, &#123; $group: &#123; _id: '$customer', totalSpent: &#123; $sum: '$amount' &#125; &#125; &#125; ])
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>Rank</th>
                <th>Client / Organization</th>
                <th>Tags</th>
                <th style={{ textAlign: 'right' }}>Orders</th>
                <th style={{ textAlign: 'right' }}>Avg Value</th>
                <th style={{ textAlign: 'right' }}>Total Spent</th>
              </tr>
            </thead>
            <tbody>
              {totalSalesPerCustomer.map((item, idx) => (
                <tr key={item.customerId || idx}>
                  <td className="tabular mono-meta">
                    #{idx + 1}
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{item.customerName}</div>
                    <div className="mono-meta">{item.customerCompany || item.customerEmail}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {item.customerTags?.map((t) => (
                        <span key={t} className="mono-tag">{t}</span>
                      ))}
                    </div>
                  </td>
                  <td className="tabular" style={{ textAlign: 'right' }}>
                    {item.purchaseCount}
                  </td>
                  <td className="tabular" style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>
                    ₹{(item.averageOrderValue || 0).toLocaleString('en-IN')}
                  </td>
                  <td className="tabular" style={{ textAlign: 'right', fontWeight: 600, color: 'var(--text-primary)' }}>
                    ₹{(item.totalSpent || 0).toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2-Column Split: Payment Methods Breakdown & Monthly Trajectory */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        {/* Payment Methods */}
        <div className="card-hairline" style={{ padding: '20px' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '12px' }}>
            Revenue by Payment Method
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {paymentMethodsBreakdown.map((pm) => (
              <div key={pm.paymentMethod} style={{
                padding: '10px 12px',
                backgroundColor: 'var(--bg-canvas)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
              }}>
                <div>
                  <span style={{ fontSize: '0.82rem', fontWeight: 500, textTransform: 'capitalize' }}>
                    {pm.paymentMethod?.replace('_', ' ')}
                  </span>
                  <span className="mono-meta" style={{ display: 'block', fontSize: '0.7rem' }}>
                    {pm.transactionCount} settled transactions
                  </span>
                </div>

                <span className="tabular" style={{ fontSize: '0.95rem', fontWeight: 600 }}>
                  ₹{(pm.totalAmount || 0).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="card-hairline" style={{ padding: '20px' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '12px' }}>
            Monthly Settlement Trajectory
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {monthlyTrends.map((trend, idx) => (
              <div key={idx} style={{
                padding: '10px 12px',
                backgroundColor: 'var(--bg-canvas)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
              }}>
                <span className="mono-meta">
                  {trend.month < 10 ? `0${trend.month}` : trend.month} / {trend.year}
                </span>

                <div style={{ textAlign: 'right' }}>
                  <span className="tabular" style={{ fontSize: '0.95rem', fontWeight: 600 }}>
                    ₹{(trend.monthlyRevenue || 0).toLocaleString('en-IN')}
                  </span>
                  <span className="mono-meta" style={{ display: 'block', fontSize: '0.7rem' }}>
                    {trend.orderCount} orders
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
