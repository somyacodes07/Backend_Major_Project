import React, { useState, useEffect } from 'react';
import { customerApi } from '../services/api';
import {
  Search,
  Plus,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  X,
  SlidersHorizontal
} from 'lucide-react';

const COMMON_TAGS = ['All', 'VIP', 'Enterprise', 'Retail', 'Wholesale', 'Creative', 'Technology', 'Lead'];

export default function CustomerList({ onSelectCustomer, onAddNewCustomer }) {
  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters state
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('-createdAt');
  const [page, setPage] = useState(1);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {
        search: search.trim() || undefined,
        tag: selectedTag !== 'All' ? selectedTag : undefined,
        status: status || undefined,
        sort,
        page,
        limit: 9,
      };
      const res = await customerApi.getAll(params);
      setCustomers(res.data.customers || []);
      setPagination(res.data.pagination || { page: 1, total: 0, totalPages: 1 });
    } catch (err) {
      setError(err.message || 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [selectedTag, status, sort, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCustomers();
  };

  const handleClearSearch = () => {
    setSearch('');
    setPage(1);
    customerApi.getAll({
      tag: selectedTag !== 'All' ? selectedTag : undefined,
      status: status || undefined,
      sort,
      page: 1,
      limit: 9,
    }).then((res) => {
      setCustomers(res.data.customers || []);
      setPagination(res.data.pagination || { page: 1, total: 0, totalPages: 1 });
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Title & Primary Action */}
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
          <h2 style={{ fontSize: '1.4rem', fontWeight: 600 }}>Customer Directory</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '2px' }}>
            {pagination.total} records registered in database
          </p>
        </div>

        <button onClick={onAddNewCustomer} className="btn btn-primary btn-sm">
          <Plus size={14} /> Add Customer
        </button>
      </div>

      {/* Filter and Query Controls */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Search */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', flex: '1 1 280px', maxWidth: '380px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '11px', top: '11px' }} />
            <input
              type="text"
              placeholder="Search by name, company, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', paddingLeft: '34px', paddingRight: search ? '32px' : '12px', height: '36px' }}
            />
            {search && (
              <button
                type="button"
                onClick={handleClearSearch}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '9px',
                  background: 'transparent',
                  color: 'var(--text-muted)',
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </form>

        {/* Dropdowns */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            style={{ height: '36px', fontSize: '0.8rem' }}
          >
            <option value="">All Statuses</option>
            <option value="lead">Lead</option>
            <option value="prospect">Prospect</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
            style={{ height: '36px', fontSize: '0.8rem' }}
          >
            <option value="-createdAt">Newest First</option>
            <option value="createdAt">Oldest First</option>
            <option value="name:asc">Name (A–Z)</option>
            <option value="name:desc">Name (Z–A)</option>
            <option value="-totalSpent">Highest Spend</option>
            <option value="-lastContactDate">Recent Touchpoint</option>
          </select>
        </div>
      </div>

      {/* Monochrome Tag Segment List */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
        {COMMON_TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => {
              setSelectedTag(tag);
              setPage(1);
            }}
            style={{
              padding: '5px 10px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '-0.01em',
              backgroundColor: selectedTag === tag ? '#ffffff' : 'var(--bg-subtle)',
              color: selectedTag === tag ? '#09090b' : 'var(--text-secondary)',
              border: `1px solid ${selectedTag === tag ? '#ffffff' : 'var(--border)'}`,
              transition: 'var(--transition-fast)',
              whiteSpace: 'nowrap',
            }}
          >
            {tag === 'All' ? 'All Tags' : tag}
          </button>
        ))}
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }} className="mono-meta">
          Fetching customer records...
        </div>
      )}

      {error && (
        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          {error}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && customers.length === 0 && (
        <div style={{
          backgroundColor: 'var(--bg-subtle)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '48px 24px',
          textAlign: 'center',
        }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>No records match query</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px', marginBottom: '16px' }}>
            Modify your keyword or tag filters.
          </p>
          <button onClick={onAddNewCustomer} className="btn btn-secondary btn-sm">
            <Plus size={14} /> Create Record
          </button>
        </div>
      )}

      {/* Minimal Monochrome Grid */}
      {!loading && !error && customers.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: '14px',
        }}>
          {customers.map((c) => (
            <div
              key={c._id}
              onClick={() => onSelectCustomer(c._id)}
              className="card-hairline"
              style={{
                padding: '18px 20px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px',
                transition: 'var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-hover)';
                e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
              }}
            >
              <div>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>
                      {c.name}
                    </h3>
                    <div className="mono-meta" style={{ marginTop: '2px' }}>
                      {c.company || 'Private Customer'}
                    </div>
                  </div>

                  <div className="status-indicator">
                    <span className={`status-dot ${c.status}`} />
                    <span>{c.status}</span>
                  </div>
                </div>

                {/* Metadata rows */}
                <div style={{
                  marginTop: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                }}>
                  <div className="tabular" style={{ color: 'var(--text-muted)' }}>
                    {c.email}
                  </div>
                  {c.phone && (
                    <div className="tabular" style={{ color: 'var(--text-dim)' }}>
                      {c.phone}
                    </div>
                  )}
                </div>

                {/* Tags */}
                {c.tags && c.tags.length > 0 && (
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '12px' }}>
                    {c.tags.map((t) => (
                      <span key={t} className="mono-tag">{t}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom spend & view */}
              <div style={{
                borderTop: '1px solid var(--border-muted)',
                paddingTop: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
              }}>
                <div>
                  <span className="mono-meta" style={{ display: 'block', fontSize: '0.68rem' }}>SPEND TOTAL</span>
                  <span className="tabular" style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    ${(c.totalSpent || 0).toLocaleString()}
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.78rem',
                  color: 'var(--text-secondary)',
                }}>
                  <span>Inspect</span>
                  <ArrowRight size={12} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '12px',
          borderTop: '1px solid var(--border)',
          paddingTop: '16px',
        }}>
          <span className="mono-meta">
            PAGE {pagination.page} OF {pagination.totalPages} ({pagination.total} TOTAL)
          </span>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="btn btn-secondary btn-sm"
              style={{ opacity: page <= 1 ? 0.4 : 1 }}
            >
              <ChevronLeft size={14} /> Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page >= pagination.totalPages}
              className="btn btn-secondary btn-sm"
              style={{ opacity: page >= pagination.totalPages ? 0.4 : 1 }}
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
