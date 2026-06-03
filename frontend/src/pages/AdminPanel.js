import React, { useState, useEffect } from 'react';
import { productAPI, quotationAPI } from '../api';
import { formatPrice } from '../utils';
import { useAuth } from '../context/AuthContext';

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto'
  },
  section: {
    marginBottom: '30px'
  },
  button: {
    padding: '8px 16px',
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    marginRight: '10px'
  },
  buttonDanger: {
    backgroundColor: '#e74c3c'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: 'white',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  th: {
    padding: '12px',
    textAlign: 'left',
    backgroundColor: '#2c3e50',
    color: 'white',
    fontWeight: 'bold'
  },
  td: {
    padding: '12px',
    borderBottom: '1px solid #ddd'
  },
  error: {
    color: '#e74c3c',
    padding: '10px',
    backgroundColor: '#fadbd8',
    borderRadius: '4px',
    marginBottom: '15px'
  },
  success: {
    color: '#27ae60',
    padding: '10px',
    backgroundColor: '#d5f4e6',
    borderRadius: '4px',
    marginBottom: '15px'
  },
  badge: {
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 'bold'
  },
  detailsSection: {
    marginTop: '20px',
    padding: '20px',
    backgroundColor: '#f9f9f9',
    borderRadius: '4px'
  }
};

export const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    sku: '',
    category: '',
    dimension: 'weight',
    baseQuantity: '',
    baseUnit: 'g',
    basePrice: ''
  });
  const { token } = useAuth();

  useEffect(() => {
    if (activeTab === 'products') loadProducts();
    if (activeTab === 'quotations') loadQuotations();
  }, [activeTab]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await productAPI.getAll();
      setProducts(response.products || []);
    } catch (err) {
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const loadQuotations = async () => {
    setLoading(true);
    try {
      const response = await quotationAPI.getAll({}, token);
      setQuotations(response.quotations || []);
    } catch (err) {
      setError('Failed to load quotations');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.baseQuantity || !newProduct.basePrice) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await productAPI.create(newProduct, token);
      if (response.product) {
        setSuccess('Product created successfully!');
        setNewProduct({
          name: '',
          description: '',
          sku: '',
          category: '',
          dimension: 'weight',
          baseQuantity: '',
          baseUnit: 'g',
          basePrice: ''
        });
        loadProducts();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.error || 'Failed to create product');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveQuotation = async (quotationId) => {
    setLoading(true);
    try {
      const response = await quotationAPI.approve(quotationId, token);
      if (response.quotation) {
        setSuccess('Quotation approved!');
        loadQuotations();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError('Failed to approve quotation');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectQuotation = async (quotationId) => {
    setLoading(true);
    try {
      const response = await quotationAPI.reject(quotationId, token);
      if (response.quotation) {
        setSuccess('Quotation rejected!');
        loadQuotations();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError('Failed to reject quotation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>👨‍💼 Admin Panel</h2>
      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}

      <div style={{ marginBottom: '20px', borderBottom: '2px solid #ddd' }}>
        <button
          style={{
            ...styles.button,
            backgroundColor: activeTab === 'products' ? '#27ae60' : '#95a5a6'
          }}
          onClick={() => setActiveTab('products')}
        >
          Products
        </button>
        <button
          style={{
            ...styles.button,
            backgroundColor: activeTab === 'quotations' ? '#27ae60' : '#95a5a6'
          }}
          onClick={() => setActiveTab('quotations')}
        >
          Quotations
        </button>
      </div>

      {activeTab === 'products' && (
        <div style={styles.section}>
          <h3>Create New Product</h3>
          <form onSubmit={handleAddProduct} style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px',
            marginBottom: '30px',
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px'
          }}>
            <input
              type="text"
              placeholder="Product Name *"
              value={newProduct.name}
              onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
              style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
              required
            />
            <input
              type="text"
              placeholder="SKU"
              value={newProduct.sku}
              onChange={(e) => setNewProduct({...newProduct, sku: e.target.value})}
              style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
            <input
              type="text"
              placeholder="Category"
              value={newProduct.category}
              onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
              style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
            <select
              value={newProduct.dimension}
              onChange={(e) => {
                const dim = e.target.value;
                let unit = 'g';
                if (dim === 'volume') unit = 'mL';
                if (dim === 'count') unit = 'items';
                setNewProduct({...newProduct, dimension: dim, baseUnit: unit});
              }}
              style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
            >
              <option value="weight">Weight (g/kg)</option>
              <option value="volume">Volume (mL/L)</option>
              <option value="count">Count (items)</option>
            </select>
            <input
              type="number"
              placeholder="Base Quantity *"
              value={newProduct.baseQuantity}
              onChange={(e) => setNewProduct({...newProduct, baseQuantity: e.target.value})}
              style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
              step="0.01"
              required
            />
            <input
              type="number"
              placeholder="Base Price (₹) *"
              value={newProduct.basePrice}
              onChange={(e) => setNewProduct({...newProduct, basePrice: e.target.value})}
              style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
              step="0.01"
              required
            />
            <textarea
              placeholder="Description"
              value={newProduct.description}
              onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
              style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px', gridColumn: '1 / -1' }}
              rows="3"
            />
            <button type="submit" style={{...styles.button, gridColumn: '1 / -1'}} disabled={loading}>
              {loading ? 'Creating...' : 'Create Product'}
            </button>
          </form>

          <h3>All Products</h3>
          {products.length === 0 ? (
            <p style={{ color: '#999' }}>No products yet</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>SKU</th>
                  <th style={styles.th}>Category</th>
                  <th style={styles.th}>Dimension</th>
                  <th style={styles.th}>Stock</th>
                  <th style={styles.th}>Base Price</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id}>
                    <td style={styles.td}>{p.name}</td>
                    <td style={styles.td}>{p.sku || '-'}</td>
                    <td style={styles.td}>{p.category || '-'}</td>
                    <td style={styles.td}>{p.dimension}</td>
                    <td style={styles.td}>{p.stock} {p.baseUnit}</td>
                    <td style={styles.td}>{formatPrice(p.basePrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'quotations' && (
        <div style={styles.section}>
          <h3>Pending Quotations</h3>
          {quotations.length === 0 ? (
            <p style={{ color: '#999' }}>No quotations</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Quotation #</th>
                  <th style={styles.th}>Customer</th>
                  <th style={styles.th}>Total Amount</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Items</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {quotations.map(q => (
                  <React.Fragment key={q.id}>
                    <tr>
                      <td style={styles.td}>{q.quotationNumber}</td>
                      <td style={styles.td}>{q.customer?.name}</td>
                      <td style={styles.td}>{formatPrice(q.totalAmount)}</td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.badge,
                          backgroundColor: q.status === 'approved' ? '#d5f4e6' : '#fff3cd',
                          color: q.status === 'approved' ? '#27ae60' : '#856404'
                        }}>
                          {q.status}
                        </span>
                      </td>
                      <td style={styles.td}>{q.items.length}</td>
                      <td style={styles.td}>
                        {q.status === 'pending' && (
                          <>
                            <button
                              style={styles.button}
                              onClick={() => handleApproveQuotation(q.id)}
                              disabled={loading}
                            >
                              Approve
                            </button>
                            <button
                              style={{...styles.button, ...styles.buttonDanger}}
                              onClick={() => handleRejectQuotation(q.id)}
                              disabled={loading}
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <button
                          style={{...styles.button, backgroundColor: '#3498db'}}
                          onClick={() => setSelectedQuotation(q)}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                    {selectedQuotation?.id === q.id && (
                      <tr>
                        <td colSpan="6" style={styles.detailsSection}>
                          <h4>Quotation Details</h4>
                          <table style={{...styles.table, marginTop: '10px'}}>
                            <thead>
                              <tr>
                                <th style={styles.th}>Product</th>
                                <th style={styles.th}>Quantity</th>
                                <th style={styles.th}>Unit</th>
                                <th style={styles.th}>Price per Unit</th>
                                <th style={styles.th}>Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {q.items.map((item, idx) => (
                                <tr key={idx}>
                                  <td style={styles.td}>{item.product?.name}</td>
                                  <td style={styles.td}>{item.quantity}</td>
                                  <td style={styles.td}>{item.unit}</td>
                                  <td style={styles.td}>{formatPrice(item.pricePerUnit)}</td>
                                  <td style={styles.td}>{formatPrice(item.totalPrice)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          <p style={{ marginTop: '10px', fontWeight: 'bold' }}>
                            Grand Total: {formatPrice(q.totalAmount)}
                          </p>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};
