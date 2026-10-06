import React from 'react';
import { ArrowUpRight, LogOut } from 'lucide-react';

export default function Navbar({ user, activeTab, setActiveTab, onLogout }) {
  const isOwner = user?.role === 'owner';

  return (
    <header style={{
      backgroundColor: 'var(--bg-canvas)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{
        maxWidth: '1240px',
        margin: '0 auto',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        {/* Brand / Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: '#ffffff',
            color: '#09090b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '0.85rem',
            fontFamily: 'var(--font-mono)',
          }}>
            C
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 600, letterSpacing: '-0.02em' }}>
                CRM Backend
              </span>
              <span className="mono-meta">Case Study 150</span>
            </div>
          </div>
        </div>

        {/* Minimal Navigation Segments */}
        <nav style={{
          display: 'inline-flex',
          padding: '3px',
          backgroundColor: 'var(--bg-subtle)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)',
          gap: '2px',
        }}>
          <button
            onClick={() => setActiveTab('customers')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
              fontWeight: 500,
              backgroundColor: activeTab === 'customers' ? '#ffffff' : 'transparent',
              color: activeTab === 'customers' ? '#09090b' : 'var(--text-secondary)',
              transition: 'var(--transition-fast)',
            }}
          >
            Customers
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
              fontWeight: 500,
              backgroundColor: activeTab === 'analytics' ? '#ffffff' : 'transparent',
              color: activeTab === 'analytics' ? '#09090b' : 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'var(--transition-fast)',
            }}
          >
            Sales Analytics
            <span style={{
              fontSize: '0.68rem',
              fontFamily: 'var(--font-mono)',
              textTransform: 'uppercase',
              color: activeTab === 'analytics' ? '#71717a' : 'var(--text-dim)',
            }}>
              {isOwner ? 'Owner' : 'Restricted'}
            </span>
          </button>
        </nav>

        {/* User Identity & Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.82rem',
          }}>
            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
              {user?.name}
            </span>
            <span className="mono-pill" style={{ fontSize: '0.68rem' }}>
              {user?.role}
            </span>
          </div>

          <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--border)' }} />

          <button
            onClick={onLogout}
            className="btn btn-ghost btn-sm"
            style={{ padding: '4px 8px', fontSize: '0.78rem' }}
          >
            <LogOut size={13} />
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}
