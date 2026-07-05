// src/pages/guest/VerifyEmail.jsx
import React, { useContext, useState, useEffect } from 'react';
import { DbContext } from '../../context/DbContext';

export default function VerifyEmail({ setHash, email }) {
  const { verifyUserEmail, resendVerificationCode, showToast } = useContext(DbContext);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // If no email is passed, redirect to login
  useEffect(() => {
    if (!email) {
      showToast("Verification Error", "No email context found. Please register or log in.", "error");
      setHash('login');
    }
  }, [email]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => {
      setResendCooldown(prev => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (code.length !== 6 || isNaN(code)) {
      showToast("Invalid Input", "Please enter a valid 6-digit verification code.", "warning");
      return;
    }

    setLoading(true);
    const result = await verifyUserEmail(email, code);
    setLoading(false);

    if (result.success) {
      if (result.role === 'seeker') {
        setHash('seeker:profile');
      } else if (result.role === 'employer') {
        setHash('employer:profile');
      } else if (result.role === 'both') {
        setHash('seeker:profile');
      } else {
        setHash('admin:dashboard');
      }
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    const success = await resendVerificationCode(email);
    setLoading(false);
    if (success) {
      setResendCooldown(60); // 60 seconds cooldown
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="card" style={{ maxWidth: '450px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '0.5rem' }}>Verify Your Email</h2>
          <p className="text-muted" style={{ fontSize: '0.9rem' }}>
            We've sent a 6-digit verification code to <strong style={{ color: 'var(--color-text)' }}>{email}</strong>.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ textAlign: 'center' }}>
            <label className="form-label" style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600 }}>Verification Code</label>
            <input 
              type="text" 
              maxLength="6"
              className="form-control" 
              placeholder="e.g. 123456" 
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
              required 
              style={{ 
                fontSize: '1.75rem', 
                textAlign: 'center', 
                letterSpacing: '0.5rem', 
                fontWeight: 'bold',
                padding: '0.75rem',
                border: '2px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)'
              }}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary w-full" 
            style={{ marginTop: '1.5rem', padding: '0.75rem', fontSize: '1rem', fontWeight: 600 }}
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'Verify Code'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.85rem' }} className="text-muted">
          Didn't receive the code?{' '}
          <button 
            type="button" 
            onClick={handleResend}
            disabled={resendCooldown > 0 || loading}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: resendCooldown > 0 ? 'var(--color-text-light)' : 'var(--color-primary)', 
              fontWeight: 600, 
              cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
              padding: 0,
              textDecoration: 'underline'
            }}
          >
            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); setHash('login'); }} 
            style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', fontWeight: 500 }}
          >
            Back to Log In
          </a>
        </div>
      </div>
    </div>
  );
}
