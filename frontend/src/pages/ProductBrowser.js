import React, { useState, useEffect } from 'react';
import { productAPI } from '../api';
import { formatPrice, formatQuantity, getSupportedUnits } from '../utils';
import { useAuth } from '../context/AuthContext';

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px'
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  searchBar: {
    marginBottom: '20px',
    display: 'flex',
    gap: '10px'
  },
  input: {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    flex: 1
  },
  select: {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px'
  },
  card: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '10px'
  },
  cardDetail: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '8px'
  },
  priceSection: {
    marginTop: '15px',
    paddingTop: '15px',
    borderTop: '1px solid #eee'
  },
  error: {
    color: '#e74c3c',
    padding: '15px',
    backgroundColor: '#fadbd8',
    borderRadius: '4px',
    marginBottom: '20px'
  }
};

export const ProductBrowser = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [dimension, setDimension] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (search) params.search = search;
      if (dimension) params.dimension = dimension;
      const response = await productAPI.getAll(params);
      setProducts(response.products || []);
    } catch (err) {
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleSearch = () => {
    loadProducts();
  };

  return (
    <div style={styles.container}>
      <h2>Browse Products</h2>
      {error && <div style={styles.error}>{error}</div>}
      
      <div style={styles.searchBar}>
        <input
          type="text"
          placeholder="Search products by name or SKU..."
          style={styles.input}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          style={styles.select}
          value={dimension}
          onChange={(e) => setDimension(e.target.value)}
        >
          <option value="">All Dimensions</option>
          <option value="weight">Weight</option>
          <option value="volume">Volume</option>
          <option value="count">Count</option>
        </select>
        <button style={styles.button} onClick={handleSearch} disabled={loading}>
          {loading ? 'Loading...' : 'Search'}
        </button>
      </div>

      <div style={styles.grid}>
        {products.map(product => (
          <div key={product.id} style={styles.card}>
            <div style={styles.cardTitle}>{product.name}</div>
            <div style={styles.cardDetail}>SKU: {product.sku || 'N/A'}</div>
            <div style={styles.cardDetail}>Category: {product.category || 'Uncategorized'}</div>
            <div style={styles.cardDetail}>Dimension: {product.dimension}</div>
            <div style={styles.cardDetail}>
              Stock: {formatQuantity(product.stock, product.baseUnit)}
            </div>
            
            <div style={styles.priceSection}>
              <strong>Prices by Unit:</strong>
              <div style={{ marginTop: '10px' }}>
                {Object.entries(product.pricing || {}).map(([unit, price]) => (
                  <div key={unit} style={{ fontSize: '13px', marginBottom: '5px' }}>
                    Per {unit}: {formatPrice(price)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {products.length === 0 && !loading && (
        <p style={{ textAlign: 'center', color: '#999' }}>No products found</p>
      )}
    </div>
  );
};
