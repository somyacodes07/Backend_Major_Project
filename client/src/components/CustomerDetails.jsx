import React, { useState, useEffect } from 'react';
import { customerApi, interactionApi, purchaseApi } from '../services/api';
import {
  ArrowLeft,
  Trash2,
  Edit2,
  Plus,
  Clock,
  X
} from 'lucide-react';

export default function CustomerDetails({ customerId, onBack, onEditCustomer, onCustomerDeleted }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals for actions
  const [showLogInteraction, setShowLogInteraction] = useState(false);
  const [showRecordPurchase, setShowRecordPurchase] = useState(false);

  // Interaction Form
  const [interType, setInterType] = useState('call');
  const [interSummary, setInterSummary] = useState('');
  const [interDetails, setInterDetails] = useState('');
  const [interOutcome, setInterOutcome] = useState('completed');
  const [submittingInter, setSubmittingInter] = useState(false);

  // Purchase Form
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [itemName, setItemName] = useState('');
  const [itemQty, setItemQty] = useState(1);
  const [itemPrice, setItemPrice] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [submittingPurchase, setSubmittingPurchase] = useState(false);

  const fetchCustomer = async () => {
    try {
      setLoading(true);
      const res = await customerApi.getById(customerId);
      setData(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load customer profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (customerId) fetchCustomer();
  }, [customerId]);

  const handleDeleteCustomer = async () => {
    if (!window.confirm(`Delete customer ${data?.customer?.name}? This will cascade and delete associated interactions and purchases.`)) return;
    try {
      await customerApi.delete(customerId);
      onCustomerDeleted();
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const handleLogInteractionSubmit = async (e) => {
    e.preventDefault();
    setSubmittingInter(true);
    try {
      await interactionApi.log(customerId, {
        type: interType,
        summary: interSummary,
        details: interDetails,
        outcome: interOutcome,
      });
      setShowLogInteraction(false);
      setInterSummary('');
      setInterDetails('');
      fetchCustomer();
    } catch (err) {
      alert(`Failed to log interaction: ${err.message}`);
    } finally {
      setSubmittingInter(false);
    }
  };

  const handleRecordPurchaseSubmit = async (e) => {
    e.preventDefault();
    setSubmittingPurchase(true);
    try {
      const amt = parseFloat(purchaseAmount);
      const items = itemName ? [{
        name: itemName,
        quantity: parseInt(itemQty, 10) || 1,
        unitPrice: parseFloat(itemPrice) || amt,
      }] : [];

      await purchaseApi.record(customerId, {
        amount: amt,
        items,
        paymentMethod,
        paymentStatus: 'paid',
      });
      setShowRecordPurchase(false);
      setPurchaseAmount('');
      setItemName('');
      fetchCustomer();
    } catch (err) {
      alert(`Failed to record purchase: ${err.message}`);
    } finally {
      setSubmittingPurchase(false);
    }
  };

  const handleDeleteInteraction = async (id) => {
    if (!window.confirm('Delete this interaction log?')) return;
    try {
      await interactionApi.delete(id);
      fetchCustomer();
    } catch (err) {
      alert(`Failed to delete interaction: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }} className="mono-meta">
        Loading customer record #{customerId}...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>{error || 'Record not found'}</p>
        <button onClick={onBack} className="btn btn-secondary btn-sm">
          <ArrowLeft size={14} /> Back to Directory
        </button>
      </div>
    );
  }

  const { customer, recentInteractions = [], recentPurchases = [] } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top back & actions */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        borderBottom: '1px solid var(--border)',
        paddingBottom: '16px',
      }}>
        <button onClick={onBack} className="btn btn-ghost btn-sm" style={{ padding: '4px 8px' }}>
          <ArrowLeft size={14} /> Directory
        </button>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setShowLogInteraction(true)} className="btn btn-secondary btn-sm">
            <Plus size={14} /> Log Touchpoint
          </button>
          <button onClick={() => setShowRecordPurchase(true)} className="btn btn-secondary btn-sm">
            <Plus size={14} /> Record Invoice
          </button>
          <button onClick={() => onEditCustomer(customer)} className="btn btn-secondary btn-sm">
            <Edit2 size={13} /> Edit
          </button>
          <button onClick={handleDeleteCustomer} className="btn btn-danger btn-sm">
            <Trash2 size={13} /> Delete
          </button>
        </div>
      </div>

      {/* Customer Master Profile Card */}
      <div className="card-hairline" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>{customer.name}</h2>
              <div className="status-indicator">
                <span className={`status-dot ${customer.status}`} />
                <span>{customer.status}</span>
              </div>
            </div>

            {customer.company && (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
                {customer.company}
              </p>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '12px' }}>
              {customer.tags?.map((t) => (
                <span key={t} className="mono-tag">{t}</span>
              ))}
            </div>
          </div>

          {/* Key Financial Stat Blocks */}
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{
              backgroundColor: 'var(--bg-canvas)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 18px',
              minWidth: '130px',
            }}>
              <span className="mono-meta" style={{ display: 'block' }}>TOTAL SPENT</span>
              <span className="tabular" style={{ fontSize: '1.3rem', fontWeight: 600 }}>
                ₹{(customer.totalSpent || 0).toLocaleString('en-IN')}
              </span>
            </div>

            <div style={{
              backgroundColor: 'var(--bg-canvas)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 18px',
              minWidth: '100px',
            }}>
              <span className="mono-meta" style={{ display: 'block' }}>INVOICES</span>
              <span className="tabular" style={{ fontSize: '1.3rem', fontWeight: 600 }}>
                {customer.totalPurchases || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Contact Specs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginTop: '20px',
          paddingTop: '16px',
          borderTop: '1px solid var(--border-muted)',
          fontSize: '0.82rem',
        }}>
          <div>
            <span className="mono-meta" style={{ display: 'block' }}>EMAIL</span>
            <span className="tabular">{customer.email}</span>
          </div>
          <div>
            <span className="mono-meta" style={{ display: 'block' }}>PHONE</span>
            <span className="tabular">{customer.phone || '—'}</span>
          </div>
          <div>
            <span className="mono-meta" style={{ display: 'block' }}>LAST TOUCHPOINT</span>
            <span className="tabular">
              {customer.lastContactDate
                ? new Date(customer.lastContactDate).toLocaleDateString()
                : 'Never'}
            </span>
          </div>
        </div>

        {customer.notes && (
          <div style={{
            marginTop: '16px',
            padding: '12px',
            backgroundColor: 'var(--bg-canvas)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
          }}>
            <span className="mono-meta" style={{ display: 'block', marginBottom: '2px' }}>INTERNAL NOTES</span>
            {customer.notes}
          </div>
        )}
      </div>

      {/* 2-Column Data Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {/* Left: Interactions */}
        <div className="card-hairline" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>
              Interaction Logs ({recentInteractions.length})
            </h3>
            <span className="mono-meta">Mongoose Referenced</span>
          </div>

          {recentInteractions.length === 0 ? (
            <p className="mono-meta" style={{ padding: '24px 0', textAlign: 'center' }}>
              No interactions recorded.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recentInteractions.map((inter) => (
                <div key={inter._id} style={{
                  padding: '12px 14px',
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="mono-tag" style={{ textTransform: 'uppercase' }}>
                        {inter.type}
                      </span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                        {inter.summary}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteInteraction(inter._id)}
                      className="btn btn-ghost btn-sm"
                      style={{ padding: '2px', color: 'var(--text-muted)' }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>

                  {inter.details && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      {inter.details}
                    </p>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '2px' }} className="mono-meta">
                    <span>Logged by: {inter.staff?.name || 'Staff'}</span>
                    <span>{new Date(inter.date).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Invoices & Purchases */}
        <div className="card-hairline" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>
              Purchase Invoices ({recentPurchases.length})
            </h3>
            <span className="mono-meta">Settled Paid</span>
          </div>

          {recentPurchases.length === 0 ? (
            <p className="mono-meta" style={{ padding: '24px 0', textAlign: 'center' }}>
              No purchase orders recorded.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recentPurchases.map((p) => (
                <div key={p._id} style={{
                  padding: '12px 14px',
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span className="tabular" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {p.invoiceNumber}
                    </span>
                    <span className="tabular" style={{ fontSize: '0.95rem', fontWeight: 600 }}>
                      ₹{p.amount.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {p.items && p.items.length > 0 && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      {p.items.map((it, idx) => (
                        <div key={idx} className="mono-meta">
                          {it.quantity}x {it.name} (₹{it.unitPrice.toLocaleString('en-IN')})
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '2px' }} className="mono-meta">
                    <span style={{ textTransform: 'capitalize' }}>Method: {p.paymentMethod?.replace('_', ' ')}</span>
                    <span>{new Date(p.date).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Log Interaction Modal */}
      {showLogInteraction && (
        <div className="modal-overlay" onClick={() => setShowLogInteraction(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Log Customer Touchpoint</h3>
                <span className="mono-meta">Updates lastContactDate automatically</span>
              </div>
              <button onClick={() => setShowLogInteraction(false)} className="btn btn-ghost btn-sm">
                <X size={14} />
              </button>
            </div>
            <form onSubmit={handleLogInteractionSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>Type</label>
                <select value={interType} onChange={(e) => setInterType(e.target.value)} style={{ width: '100%' }}>
                  <option value="call">Phone Call</option>
                  <option value="email">Email</option>
                  <option value="meeting">Video / In-person Meeting</option>
                  <option value="message">SMS / Chat</option>
                  <option value="note">Internal Account Note</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>Summary *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Contract negotiation checkpoint"
                  value={interSummary}
                  onChange={(e) => setInterSummary(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>Details</label>
                <textarea
                  rows={3}
                  placeholder="Bullet points or summary of discussion..."
                  value={interDetails}
                  onChange={(e) => setInterDetails(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>Outcome</label>
                <select value={interOutcome} onChange={(e) => setInterOutcome(e.target.value)} style={{ width: '100%' }}>
                  <option value="completed">Completed</option>
                  <option value="successful">Successful Deal</option>
                  <option value="follow_up_needed">Follow-up Needed</option>
                  <option value="no_answer">No Answer</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px', borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
                <button type="button" onClick={() => setShowLogInteraction(false)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button type="submit" disabled={submittingInter} className="btn btn-primary btn-sm">
                  {submittingInter ? 'Saving...' : 'Record Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Purchase Modal */}
      {showRecordPurchase && (
        <div className="modal-overlay" onClick={() => setShowRecordPurchase(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Record Invoice / Purchase</h3>
                <span className="mono-meta">Updates customer aggregate totals</span>
              </div>
              <button onClick={() => setShowRecordPurchase(false)} className="btn btn-ghost btn-sm">
                <X size={14} />
              </button>
            </div>
            <form onSubmit={handleRecordPurchaseSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>Invoice Amount (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="2500.00"
                  value={purchaseAmount}
                  onChange={(e) => setPurchaseAmount(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>Item Name / Service</label>
                <input
                  type="text"
                  placeholder="Annual Enterprise SLA"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={itemQty}
                    onChange={(e) => setItemQty(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>Payment Method</label>
                  <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} style={{ width: '100%' }}>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="stripe">Stripe</option>
                    <option value="upi">UPI</option>
                    <option value="cash">Cash</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px', borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
                <button type="button" onClick={() => setShowRecordPurchase(false)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button type="submit" disabled={submittingPurchase} className="btn btn-primary btn-sm">
                  {submittingPurchase ? 'Recording...' : 'Save Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
