import React, { useState, useEffect, useCallback } from 'react';
import { productAPI } from '../api';
import { formatPrice, formatQuantity } from '../utils';

export const ProductBrowser = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [dimension, setDimension] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadProducts = useCallback(async (params = {}) => {
    setLoading(true);
    setError('');
    try {
      const response = await productAPI.getAll(params);
      setProducts(response.products || []);
    } catch (err) {
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleSearch = () => {
    const params = {};
    if (search) params.search = search;
    if (dimension) params.dimension = dimension;
    loadProducts(params);
  };

  return (
    <div>
      <div className="page-heading">
        <h2>Browse Products</h2>
        <button className="button-secondary" onClick={handleSearch} disabled={loading}>
          {loading ? 'Loading...' : 'Search'}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="section-card">
        <div className="card-body">
          <div className="field-grid">
            <div className="control-group">
              <label>Search</label>
              <input
                type="text"
                placeholder="Search products by name or SKU..."
                className="input-field"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="control-group">
              <label>Dimension</label>
              <select
                className="select-field"
                value={dimension}
                onChange={(e) => setDimension(e.target.value)}
              >
                <option value="">All Dimensions</option>
                <option value="weight">Weight</option>
                <option value="volume">Volume</option>
                <option value="count">Count</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="product-grid">
        {products.map(product => (
          <div key={product.id} className="product-card">
            <div className="product-card-header">
              <h3 className="product-card-title">{product.name}</h3>
              <div className="small-text">{product.category || 'Uncategorized'}</div>
            </div>
            <div className="product-card-body">
              <div className="small-text">SKU: {product.sku || 'N/A'}</div>
              <div className="small-text">Dimension: {product.dimension}</div>
              <div className="small-text">Stock: {formatQuantity(product.stock, product.baseUnit)}</div>
              <div style={{ marginTop: '14px' }}>
                <div className="small-text" style={{ marginBottom: '10px' }}>Prices by Unit</div>
                <div className="grid-3">
                  {Object.entries(product.pricing || {}).map(([unit, price]) => (
                    <div key={unit} className="badge badge-pill">
                      {unit}: {formatPrice(price)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && !loading && (
        <p className="small-text" style={{ textAlign: 'center', marginTop: '24px' }}>No products found</p>
      )}
    </div>
  );
};
