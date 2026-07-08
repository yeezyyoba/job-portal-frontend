import React, { useContext, useState } from 'react';
import { DbContext } from '../../context/DbContext';
import { Eye, EyeOff } from 'lucide-react';

export default function Register({ setHash, setVerifyEmail }) {
  const { registerUser } = useContext(DbContext);
  const [role, setRole] = useState('seeker');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Seeker fields
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [address, setAddress] = useState('');

  // Employer fields
  const [industry, setIndustry] = useState('Technology / SaaS');
  const [website, setWebsite] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return alert('Passwords do not match.');
    }

    if (password.length < 6) {
      return alert('Password must be at least 6 characters.');
    }

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
      userFields.industry = industry;
      userFields.website = website || "https://example.com";
      userFields.description = "New registered employer workspace on JobPortal.";
      userFields.verified = false;
      userFields.phone = phone;
    } else {
      userFields.phone = phone;
      userFields.dob = dob;
      userFields.gender = gender;
      userFields.address = address;
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

  const getTodayDate = () => {
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`;
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
              <option value="employer">Register as Employer (Post Listings &amp; Manage Candidates)</option>
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
            <label className="form-label">{role === 'employer' ? 'Company Name' : 'Full Name'}</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder={role === 'employer' ? 'e.g. Vercel Inc.' : 'e.g. Jane Doe'} 
              value={name}
              onChange={e => setName(e.target.value)}
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input 
              type="tel" 
              className="form-control" 
              placeholder="e.g. +251 912 345 678" 
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
          </div>

          {role === 'seeker' && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input 
                    type="date" 
                    className="form-control" 
                    value={dob}
                    max={getTodayDate()}
                    onChange={e => setDob(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select 
                    className="form-control" 
                    value={gender}
                    onChange={e => setGender(e.target.value)}
                  >
                    <option value="">Prefer not to say</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Address / City</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Addis Ababa, Ethiopia" 
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                />
              </div>
            </>
          )}

          {role === 'employer' && (
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Industry</label>
                <select 
                  className="form-control" 
                  value={industry}
                  onChange={e => setIndustry(e.target.value)}
                >
                  <option value="Technology / SaaS">Technology / SaaS</option>
                  <option value="Finance / Banking">Finance / Banking</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Education">Education</option>
                  <option value="Retail / E-Commerce">Retail / E-Commerce</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Construction">Construction</option>
                  <option value="Consulting">Consulting</option>
                  <option value="Media / Entertainment">Media / Entertainment</option>
                  <option value="Non-Profit / NGO">Non-Profit / NGO</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Company Website</label>
                <input 
                  type="url" 
                  className="form-control" 
                  placeholder="e.g. https://yourcompany.com" 
                  value={website}
                  onChange={e => setWebsite(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative', marginTop: '0.5rem' }}>
              <input 
                type={showPassword ? "text" : "password"} 
                className="form-control" 
                value={password}
                onChange={e => setPassword(e.target.value)}
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

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input 
              type="password" 
              className="form-control" 
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              placeholder="Re-enter your password"
              style={{ marginTop: '0.5rem' }}
            />
          </div>

          <button type="submit" className="btn btn-primary w-full" style={{ marginTop: '1rem' }}>Create Account</button>
        </form>
      </div>
    </div>
  );
}
