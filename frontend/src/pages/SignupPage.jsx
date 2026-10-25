// src/pages/SignupPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';
import PasswordInput from '../components/PasswordInput';
import { Loader2 } from 'lucide-react';

// Simple strength meter: length + variety
const strength = (pw) => {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  return score; // 0-4
};
const LABELS = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'];
const COLORS = ['bg-slate-200', 'bg-red-400', 'bg-amber-400', 'bg-emerald-400', 'bg-emerald-600'];

const SignupPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();
  const score = password ? strength(password) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return setError('Passwords do not match.');
    if (password.length < 8) return setError('Password must be at least 8 characters long.');
    setError('');
    setLoading(true);
    try {
      await signup(name.trim(), email.trim(), password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to sign up. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Free access to the flood model, saved runs and feedback."
      footer={<>Already have an account? <Link to="/login" className="font-semibold text-brand-700 hover:text-brand-600">Sign in</Link></>}
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        {error && <div className="alert-error" role="alert">{error}</div>}
        <div>
          <label htmlFor="name" className="label">Full name</label>
          <input id="name" name="name" type="text" autoComplete="name" required maxLength={80} className="input-field" placeholder="Jane Doe" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label htmlFor="email-address-signup" className="label">Email address</label>
          <input id="email-address-signup" name="email" type="email" autoComplete="email" required className="input-field" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <PasswordInput id="password_signup" label="Password" autoComplete="new-password" placeholder="At least 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} />
          {password && (
            <div className="mt-2" aria-live="polite">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((i) => <span key={i} className={`h-1.5 flex-1 rounded-full ${i <= score ? COLORS[score] : 'bg-slate-200'}`} />)}
              </div>
              <p className="mt-1 text-xs text-slate-500">Password strength: {LABELS[score]}</p>
            </div>
          )}
        </div>
        <PasswordInput id="confirm-password" label="Confirm password" autoComplete="new-password" placeholder="Repeat your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        <button type="submit" disabled={loading} className="btn-primary w-full py-3">
          {loading ? <><Loader2 size={18} className="animate-spin" /> Creating account...</> : 'Create account'}
        </button>
      </form>
    </AuthLayout>
  );
};

export default SignupPage;
