import React, { useState, useEffect } from 'react';
import { productAPI, quotationAPI } from '../api';
import { calculatePrice, formatPrice, getSupportedUnits } from '../utils';
import { useAuth } from '../context/AuthContext';

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto'
  },
  section: {
    marginBottom: '40px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px',
    marginBottom: '20px'
  },
  card: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
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
  input: {
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    marginRight: '10px',
    width: '100px'
  },
  select: {
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    marginRight: '10px'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: 'white',
    borderRadius: '8px',
    overflow: 'hidden'
  },
  th: {
    padding: '12px',
    textAlign: 'left',
    backgroundColor: '#f5f5f5',
    fontWeight: 'bold',
    borderBottom: '1px solid #ddd'
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
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  modalContent: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '8px',
    maxWidth: '600px',
    width: '90%',
    maxHeight: '80vh',
    overflow: 'auto'
  }
};

export const QuotationFlow = () => {
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: ''
  });
  const { token } = useAuth();

  // Run loaders on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadProducts();
    loadQuotations();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await productAPI.getAll();
      setProducts(response.products || []);
    } catch (err) {
      setError('Failed to load products');
    }
  };

  const loadQuotations = async () => {
    try {
      const response = await quotationAPI.getAll({}, token);
      setQuotations(response.quotations || []);
    } catch (err) {
      console.error('Failed to load quotations');
    }
  };

  const handleAddToCart = () => {
    if (!selectedProduct || !quantity || !unit) {
      setError('Please select a product, quantity, and unit');
      return;
    }

    const price = calculatePrice(selectedProduct.basePrice, quantity, unit, selectedProduct.dimension);
    const newItem = {
      id: Date.now(),
      product: selectedProduct,
      quantity,
      unit,
      totalPrice: price.toString()
    };

    setCartItems([...cartItems, newItem]);
    setSelectedProduct(null);
    setQuantity('');
    setUnit('');
    setSuccess('Item added to cart');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleRemoveFromCart = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const handleSubmitQuotation = async () => {
    if (cartItems.length === 0) {
      setError('Cart is empty');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const items = cartItems.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        unit: item.unit
      }));

      const response = await quotationAPI.create(
        { items, deliveryAddress },
        token
      );

      if (response.quotation) {
        setSuccess('Quotation created successfully!');
        setCartItems([]);
        setDeliveryAddress({ street: '', city: '', state: '', zipCode: '' });
        setShowCart(false);
        loadQuotations();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.error || 'Failed to create quotation');
      }
    } catch (err) {
      setError(err.message || 'Failed to create quotation');
    } finally {
      setLoading(false);
    }
  };

  const cartTotal = cartItems.reduce((sum, item) => {
    const price = calculatePrice(item.product.basePrice, item.quantity, item.unit, item.product.dimension);
    return sum.plus(price);
  }, require('decimal.js').default(0));

  return (
    <div style={styles.container}>
      <h2>📋 Quotation Management</h2>
      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}

      <div style={styles.section}>
        <h3>Add Items to Quotation</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <select
            style={styles.select}
            value={selectedProduct?.id || ''}
            onChange={(e) => {
              const p = products.find(prod => prod.id === e.target.value);
              setSelectedProduct(p);
              setUnit(p ? getSupportedUnits(p.dimension)[0] : '');
            }}
          >
            <option value="">Select Product</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.sku || 'N/A'})
              </option>
            ))}
          </select>

          {selectedProduct && (
            <>
              <input
                type="number"
                placeholder="Quantity"
                style={styles.input}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                step="0.01"
              />
              <select
                style={styles.select}
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              >
                {getSupportedUnits(selectedProduct.dimension).map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
              {quantity && unit && (
                <span style={{ fontWeight: 'bold' }}>
                  {formatPrice(calculatePrice(selectedProduct.basePrice, quantity, unit, selectedProduct.dimension))}
                </span>
              )}
            </>
          )}

          <button style={styles.button} onClick={handleAddToCart}>
            Add to Cart
          </button>
          <button style={{ ...styles.button, backgroundColor: '#3498db' }} onClick={() => setShowCart(true)}>
            View Cart ({cartItems.length})
          </button>
        </div>
      </div>

      <div style={styles.section}>
        <h3>Your Quotations</h3>
        {quotations.length === 0 ? (
          <p style={{ color: '#999' }}>No quotations yet</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Quotation #</th>
                <th style={styles.th}>Total Amount</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Items</th>
                <th style={styles.th}>Date</th>
              </tr>
            </thead>
            <tbody>
              {quotations.map(q => (
                <tr key={q.id}>
                  <td style={styles.td}>{q.quotationNumber}</td>
                  <td style={styles.td}>{formatPrice(q.totalAmount)}</td>
                  <td style={styles.td}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      backgroundColor: q.status === 'approved' ? '#d5f4e6' : '#fff3cd',
                      color: q.status === 'approved' ? '#27ae60' : '#856404'
                    }}>
                      {q.status}
                    </span>
                  </td>
                  <td style={styles.td}>{q.items.length}</td>
                  <td style={styles.td}>{new Date(q.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showCart && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h3>Shopping Cart ({cartItems.length} items)</h3>
            {cartItems.length === 0 ? (
              <p>Your cart is empty</p>
            ) : (
              <>
                <table style={{ ...styles.table, marginTop: '20px' }}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Product</th>
                      <th style={styles.th}>Quantity</th>
                      <th style={styles.th}>Total Price</th>
                      <th style={styles.th}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map(item => (
                      <tr key={item.id}>
                        <td style={styles.td}>{item.product.name}</td>
                        <td style={styles.td}>{item.quantity} {item.unit}</td>
                        <td style={styles.td}>{formatPrice(item.totalPrice)}</td>
                        <td style={styles.td}>
                          <button
                            style={{ ...styles.button, backgroundColor: '#e74c3c', marginRight: '0' }}
                            onClick={() => handleRemoveFromCart(item.id)}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '2px solid #ddd' }}>
                  <p style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>
                    Total: {formatPrice(cartTotal)}
                  </p>

                  <label style={{ display: 'block', marginBottom: '10px' }}>
                    Delivery Address:
                  </label>
                  <input
                    type="text"
                    placeholder="Street"
                    style={styles.input}
                    value={deliveryAddress.street}
                    onChange={(e) => setDeliveryAddress({...deliveryAddress, street: e.target.value})}
                  />
                  <input
                    type="text"
                    placeholder="City"
                    style={styles.input}
                    value={deliveryAddress.city}
                    onChange={(e) => setDeliveryAddress({...deliveryAddress, city: e.target.value})}
                  />
                  <input
                    type="text"
                    placeholder="State"
                    style={styles.input}
                    value={deliveryAddress.state}
                    onChange={(e) => setDeliveryAddress({...deliveryAddress, state: e.target.value})}
                  />
                  <input
                    type="text"
                    placeholder="Zip Code"
                    style={styles.input}
                    value={deliveryAddress.zipCode}
                    onChange={(e) => setDeliveryAddress({...deliveryAddress, zipCode: e.target.value})}
                  />
                </div>

                <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                  <button
                    style={styles.button}
                    onClick={handleSubmitQuotation}
                    disabled={loading}
                  >
                    {loading ? 'Creating...' : 'Create Quotation'}
                  </button>
                  <button
                    style={{ ...styles.button, backgroundColor: '#95a5a6' }}
                    onClick={() => setShowCart(false)}
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
