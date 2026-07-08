import React, { useContext, useState } from 'react';
import { DbContext } from '../../context/DbContext';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';

export default function ResetPassword({ setHash, resetEmail }) {
  const { verifyResetCode, resetPassword, showToast } = useContext(DbContext);
  const [email] = useState(resetEmail || '');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1 = verify code, Step 2 = set new password
  const [step, setStep] = useState(1);
  const [verifiedCode, setVerifiedCode] = useState('');

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!email.trim() || !code.trim()) return;

    setIsSubmitting(true);
    const success = await verifyResetCode(email.trim(), code.trim());
    setIsSubmitting(false);

    if (success) {
      setVerifiedCode(code.trim());
      setStep(2);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword) return;

    if (newPassword !== confirmPassword) {
      showToast("Mismatch", "New password and confirmation do not match.", "error");
      return;
    }

    if (newPassword.length < 6) {
      showToast("Too Short", "Password must be at least 6 characters.", "error");
      return;
    }

    setIsSubmitting(true);
    const success = await resetPassword(email.trim(), verifiedCode, newPassword);
    setIsSubmitting(false);

    if (success) {
      setHash('login');
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="card">
        {step === 1 ? (
          <>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-text-dark)' }}>Verify Code</h3>
            <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Enter the 6-digit code sent to <strong>{email}</strong> to verify your identity.
            </p>

            <form onSubmit={handleVerifyCode}>
              <div className="form-group">
                <label className="form-label">6-Digit Verification Code</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. 123456" 
                  maxLength={6}
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                  required
                  style={{ letterSpacing: '0.5em', textAlign: 'center', fontSize: '1.25rem', fontWeight: 700 }}
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary w-full" 
                style={{ marginTop: '1.5rem' }}
                disabled={isSubmitting || code.length < 6}
              >
                {isSubmitting ? 'Verifying...' : 'Verify Code'}
              </button>
            </form>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <ShieldCheck size={22} style={{ color: 'var(--color-success)' }} />
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: 'var(--color-text-dark)' }}>Set New Password</h3>
            </div>
            <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Your identity has been verified. Please set a new password for your account.
            </p>

            <form onSubmit={handleResetPassword}>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <div style={{ position: 'relative', marginTop: '0.5rem' }}>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    className="form-control" 
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required 
                    placeholder="At least 6 characters"
                    style={{ paddingRight: '2.5rem' }}
                  />
                  <button
                    type="button"
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--color-text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      padding: 0
                    }}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label">Confirm New Password</label>
                <input 
                  type="password" 
                  className="form-control" 
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required 
                  placeholder="Re-enter your new password"
                  style={{ marginTop: '0.5rem' }}
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary w-full" 
                style={{ marginTop: '1.5rem' }}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
              </button>
            </form>
          </>
        )}

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
