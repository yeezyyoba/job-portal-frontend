import React, { useContext, useState } from 'react';
import { DbContext } from '../../context/DbContext';

export default function ForgotPassword({ setHash, setResetEmail }) {
  const { requestResetCode } = useContext(DbContext);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    const success = await requestResetCode(email.trim());
    setIsSubmitting(false);

    if (success) {
      setResetEmail(email.trim());
      setHash('reset-password');
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="card">
        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-text-dark)' }}>Forgot Password</h3>
        <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          Enter your registered email address and we will send you a 6-digit verification code to reset your password.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              className="form-control" 
              placeholder="e.g. seeker@portal.com" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              required 
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary w-full" 
            style={{ marginTop: '1rem' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sending Code...' : 'Send Verification Code'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <a 
            href="#login" 
            onClick={(e) => { e.preventDefault(); setHash('login'); }} 
            style={{ fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 600 }}
          >
            Back to Log In
          </a>
        </div>
      </div>
    </div>
  );
}
