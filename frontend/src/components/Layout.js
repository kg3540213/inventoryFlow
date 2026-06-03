import React from 'react';
import { useAuth } from '../context/AuthContext';

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5'
  },
  nav: {
    backgroundColor: '#1a1a1a',
    color: 'white',
    padding: '15px 30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    fontSize: '20px',
    fontWeight: 'bold'
  },
  userInfo: {
    display: 'flex',
    gap: '20px',
    alignItems: 'center'
  },
  role: {
    fontSize: '14px',
    color: '#bbb'
  },
  logout: {
    padding: '8px 16px',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  main: {
    padding: '30px'
  }
};

export const Layout = ({ children }) => {
  const { user, logout } = useAuth();

  return (
    <div style={styles.container}>
      <nav style={styles.nav}>
        <h1 style={styles.title}>📦 Inventory Management</h1>
        {user && (
          <div style={styles.userInfo}>
            <span>{user.name}</span>
            <span style={styles.role}>({user.role})</span>
            <button style={styles.logout} onClick={logout}>Logout</button>
          </div>
        )}
      </nav>
      <main style={styles.main}>{children}</main>
    </div>
  );
};
