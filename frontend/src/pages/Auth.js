import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const styles = {
  container: {
    maxWidth: '460px',
    margin: '60px auto',
    padding: '30px',
    backgroundColor: 'white',
    borderRadius: '24px',
    boxShadow: '0 24px 60px rgba(25,32,44,0.08)'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  input: {
    padding: '14px 16px',
    border: '1px solid #e4eaf5',
    borderRadius: '14px',
    fontSize: '15px'
  },
  select: {
    padding: '14px 16px',
    border: '1px solid #e4eaf5',
    borderRadius: '14px',
    fontSize: '15px'
  },
  button: {
    padding: '14px 16px',
    backgroundColor: '#2775c9',
    color: 'white',
    border: 'none',
    borderRadius: '14px',
    cursor: 'pointer',
    fontSize: '16px'
  },
  error: {
    color: '#a2382d',
    padding: '14px 16px',
    backgroundColor: '#fdecea',
    borderRadius: '14px'
  },
  link: {
    textAlign: 'center',
    marginTop: '18px',
    color: '#6b7a91'
  },
  a: {
    color: '#2775c9',
    textDecoration: 'none',
    fontWeight: '600'
  }
};

export const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'seller',
    company: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(formData);
      navigate(formData.role === 'admin' ? '/admin' : '/seller');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Register</h2>
      {error && <div style={styles.error}>{error}</div>}
      <form style={styles.form} onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          style={styles.input}
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          style={styles.input}
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          style={styles.input}
          value={formData.password}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="company"
          placeholder="Company Name (Optional)"
          style={styles.input}
          value={formData.company}
          onChange={handleChange}
        />
        <select
          name="role"
          style={styles.select}
          value={formData.role}
          onChange={handleChange}
        >
          <option value="seller">Seller</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
      <div style={styles.link}>
        Already have an account? <Link to="/login" style={styles.a}>Login here</Link>
      </div>
    </div>
  );
};

export const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await login(formData.email, formData.password);
      navigate(response.user.role === 'admin' ? '/admin' : '/seller');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Login</h2>
      {error && <div style={styles.error}>{error}</div>}
      <form style={styles.form} onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          style={styles.input}
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          style={styles.input}
          value={formData.password}
          onChange={handleChange}
          required
        />
        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <div style={styles.link}>
        Don't have an account? <Link to="/register" style={styles.a}>Register here</Link>
      </div>
    </div>
  );
};
