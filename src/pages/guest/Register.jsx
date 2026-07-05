// src/pages/guest/Register.jsx
import React, { useContext, useState } from 'react';
import { DbContext } from '../../context/DbContext';

export default function Register({ setHash, setVerifyEmail }) {
  const { registerUser } = useContext(DbContext);
  const [role, setRole] = useState('seeker');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userFields = {
      email,
      role,
      password,
      name: role === 'seeker' ? name : '',
      companyName: role === 'employer' ? name : '',
      status: "Active"
    };

    if (role === 'employer') {
      userFields.logo = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop&q=80";
      userFields.industry = "Technology / SaaS";
      userFields.website = "https://example.com";
      userFields.description = "New registered employer workspace on JobPortal.";
      userFields.verified = false;
    } else {
      userFields.skills = [];
      userFields.education = [];
      userFields.experience = [];
    }

    const res = await registerUser(userFields);
    if (res) {
      if (res.verificationRequired) {
        setVerifyEmail(res.email);
        setHash('verify');
      } else {
        if (role === 'seeker') {
          setHash('seeker:profile');
        } else {
          setHash('employer:profile');
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
          <div className="auth-tab" onClick={(e) => handleTabClick(e, 'login')}>Log In</div>
          <div className="auth-tab active" onClick={(e) => handleTabClick(e, 'register')}>Register</div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Account Role Type</label>
            <select 
              className="form-control" 
              value={role} 
              onChange={e => setRole(e.target.value)} 
              required
            >
              <option value="seeker">Register as Job Seeker (Apply for Jobs)</option>
              <option value="employer">Register as Employer (Post Listings & Manage Candidates)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              className="form-control" 
              placeholder="e.g. design_guru@example.com" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Full Name or Company Name</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="e.g. Jane Doe or Vercel Inc." 
              value={name}
              onChange={e => setName(e.target.value)}
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-control" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              required 
            />
          </div>

          <button type="submit" className="btn btn-primary w-full" style={{ marginTop: '1rem' }}>Create Account</button>
        </form>
      </div>
    </div>
  );
}
