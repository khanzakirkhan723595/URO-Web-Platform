// src/pages/LoginPage.jsx
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';
import PasswordInput from '../components/PasswordInput';
import { Loader2 } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/'; // return to the page the user wanted

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to log in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to run models and see your saved simulations."
      footer={<>New to URO Flood Lab? <Link to="/signup" className="font-semibold text-brand-700 hover:text-brand-600">Create an account</Link></>}
    >
      <form className="space-y-5" onSubmit={handleSubmit} noValidate={false}>
        {error && <div className="alert-error" role="alert">{error}</div>}
        <div>
          <label htmlFor="email-address" className="label">Email address</label>
          <input id="email-address" name="email" type="email" autoComplete="email" required className="input-field" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <PasswordInput id="password_login" label="Password" autoComplete="current-password" placeholder="Your password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit" disabled={loading} className="btn-primary w-full py-3">
          {loading ? <><Loader2 size={18} className="animate-spin" /> Signing in...</> : 'Sign in'}
        </button>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;
