import React, { useState, useEffect } from 'react';
import { getStoredToken, getStoredUser, authApi } from './services/api';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import CustomerList from './components/CustomerList';
import CustomerModal from './components/CustomerModal';
import CustomerDetails from './components/CustomerDetails';
import SalesDashboard from './components/SalesDashboard';

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('customers'); // 'customers' | 'analytics'
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [customerToEdit, setCustomerToEdit] = useState(null);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const token = getStoredToken();
    const storedUser = getStoredUser();
    if (token && storedUser) {
      setUser(storedUser);
    }
  }, []);

  const handleLogout = () => {
    authApi.logout();
    setUser(null);
    setSelectedCustomerId(null);
  };

  const handleAuthSuccess = (authenticatedUser) => {
    setUser(authenticatedUser);
  };

  const handleSwitchToOwner = async () => {
    try {
      const data = await authApi.login('owner@crm.com', 'Owner@123');
      setUser(data.user);
      setActiveTab('analytics');
    } catch (err) {
      alert(`Could not switch to Owner: ${err.message}`);
    }
  };

  // If not authenticated, render login/register screen
  if (!user) {
    return <AuthModal onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        user={user}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSelectedCustomerId(null);
        }}
        onLogout={handleLogout}
      />

      <main style={{
        maxWidth: '1300px',
        width: '100%',
        margin: '0 auto',
        padding: '28px 24px 60px',
        flex: 1,
      }}>
        {/* Tab 1: Customers View */}
        {activeTab === 'customers' && (
          <>
            {selectedCustomerId ? (
              <CustomerDetails
                key={selectedCustomerId}
                customerId={selectedCustomerId}
                onBack={() => {
                  setSelectedCustomerId(null);
                  setRefreshKey((k) => k + 1);
                }}
                onEditCustomer={(cust) => setCustomerToEdit(cust)}
                onCustomerDeleted={() => {
                  setSelectedCustomerId(null);
                  setRefreshKey((k) => k + 1);
                }}
              />
            ) : (
              <CustomerList
                key={refreshKey}
                onSelectCustomer={(id) => setSelectedCustomerId(id)}
                onAddNewCustomer={() => setShowAddCustomerModal(true)}
              />
            )}
          </>
        )}

        {/* Tab 2: Sales Analytics View (Owner Only RBAC Protected) */}
        {activeTab === 'analytics' && (
          <SalesDashboard
            user={user}
            onSwitchToOwner={handleSwitchToOwner}
          />
        )}
      </main>

      {/* Customer Add/Edit Modal */}
      {(showAddCustomerModal || customerToEdit) && (
        <CustomerModal
          customer={customerToEdit}
          onClose={() => {
            setShowAddCustomerModal(false);
            setCustomerToEdit(null);
          }}
          onSaved={() => {
            setShowAddCustomerModal(false);
            setCustomerToEdit(null);
            setRefreshKey((k) => k + 1);
          }}
        />
      )}
    </div>
  );
}
