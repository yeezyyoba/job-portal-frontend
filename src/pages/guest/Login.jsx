import React, { useContext, useState } from 'react';
import { DbContext } from '../../context/DbContext';
import { Eye, EyeOff } from 'lucide-react';

export default function Login({ setHash, setVerifyEmail }) {
  const { loginUser } = useContext(DbContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const usr = await loginUser(email.trim(), password);
    if (usr) {
      if (usr.verificationRequired) {
        setVerifyEmail(usr.email);
        setHash('verify');
      } else {
        if (usr.role === 'seeker') {
          setHash('seeker:dashboard');
        } else if (usr.role === 'employer') {
          setHash('employer:dashboard');
        } else if (usr.role === 'both') {
          const savedActiveRole = localStorage.getItem('active_role') || 'seeker';
          setHash(`${savedActiveRole}:dashboard`);
        } else if (usr.role === 'admin' || usr.role === 'superadmin') {
          setHash('admin:dashboard');
        }
      }
    }
  };

  const handleTabClick = (e, targetHash) => {
    e.preventDefault();
    setHash(targetHash);
  };

  return (
    <div className="auth-wrapper">
      <div className="card">
        <div className="auth-tabs">
          <div className="auth-tab active" onClick={(e) => handleTabClick(e, 'login')}>Log In</div>
          <div className="auth-tab" onClick={(e) => handleTabClick(e, 'register')}>Register</div>
        </div>
        
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
          
          <div className="form-group">
            <div className="flex-between">
              <label className="form-label" style={{ margin: 0 }}>Password</label>
              <a href="#forgot-password" onClick={(e) => { e.preventDefault(); setHash('forgot-password'); }} style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 500 }}>Forgot Password?</a>
            </div>
            <div style={{ position: 'relative', marginTop: '0.5rem' }}>
              <input 
                type={showPassword ? "text" : "password"} 
                className="form-control" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                required 
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

          <div className="form-group checkbox-group">
            <input 
              type="checkbox" 
              id="remember-me" 
              checked={rememberMe}
              onChange={e => setRememberMe(e.target.checked)}
            />
            <label htmlFor="remember-me" style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', userSelect: 'none' }}>Remember me on this browser</label>
          </div>

          <button type="submit" className="btn btn-primary w-full" style={{ marginTop: '1rem' }}>Log In to Account</button>
        </form>
      </div>
    </div>
  );
}
