import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';

export const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const links = [
    { path: '/products', label: 'Products' },
    ...(user?.role === 'seller' ? [{ path: '/seller', label: 'My Quotations' }] : []),
    ...(user?.role === 'admin' ? [{ path: '/admin', label: 'Admin Panel' }] : [])
  ];

  return (
    <div className="site-shell">
      <header className="site-header">
        <div>
          <h1 className="site-title">📦 Inventory Management</h1>
          <div className="small-text">Manage inventory, quotations and orders with ease</div>
        </div>

        <div className="site-nav">
          {links.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={location.pathname === link.path ? 'active' : ''}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {user && (
          <div className="site-actions">
            <div>
              <div>{user.name}</div>
              <div className="small-text">{user.email} · {user.role}</div>
            </div>
            <button className="button-danger" onClick={logout}>Logout</button>
          </div>
        )}
      </header>
      <main className="page-content">{children}</main>
    </div>
  );
};
