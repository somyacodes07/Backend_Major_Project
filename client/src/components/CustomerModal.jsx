import React, { useState, useEffect } from 'react';
import { customerApi } from '../services/api';
import { X, AlertCircle } from 'lucide-react';

export default function CustomerModal({ customer, onClose, onSaved }) {
  const isEditing = Boolean(customer?._id);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [tags, setTags] = useState('Lead');
  const [status, setStatus] = useState('lead');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (customer) {
      setName(customer.name || '');
      setEmail(customer.email || '');
      setPhone(customer.phone || '');
      setCompany(customer.company || '');
      setTags(Array.isArray(customer.tags) ? customer.tags.join(', ') : customer.tags || '');
      setStatus(customer.status || 'lead');
      setNotes(customer.notes || '');
    }
  }, [customer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = {
      name,
      email,
      phone,
      company,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      status,
      notes,
    };

    try {
      if (isEditing) {
        await customerApi.update(customer._id, payload);
      } else {
        await customerApi.create(payload);
      }
      onSaved();
    } catch (err) {
      setError(err.message || 'Failed to save customer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>
              {isEditing ? 'Modify Customer Record' : 'Register New Customer'}
            </h3>
            <span className="mono-meta">
              {isEditing ? `ID: ${customer._id}` : 'Mongoose Customer Schema'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm"
            style={{ padding: '4px' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            margin: '16px 20px 0',
            padding: '10px 12px',
            backgroundColor: 'var(--bg-subtle)',
            border: '1px solid var(--border-hover)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-primary)',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <AlertCircle size={14} color="#a1a1aa" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>
              Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Apex Global Logistics"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>
                Email Address *
              </label>
              <input
                type="email"
                required
                placeholder="procurement@apex.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>
                Phone Number
              </label>
              <input
                type="text"
                placeholder="+1 800-555-0101"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>
                Company Name
              </label>
              <input
                type="text"
                placeholder="Apex Logistics LLC"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="lead">Lead</option>
                <option value="prospect">Prospect</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>
              Tags (comma separated)
            </label>
            <input
              type="text"
              placeholder="VIP, Enterprise, Logistics"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>
              Internal Account Notes
            </label>
            <textarea
              rows={3}
              placeholder="Account specifications, meeting notes, contract terms..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{ width: '100%', resize: 'vertical' }}
            />
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary btn-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-sm"
            >
              {loading ? 'Committing...' : isEditing ? 'Save Changes' : 'Create Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
