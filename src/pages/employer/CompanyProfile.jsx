// src/pages/employer/CompanyProfile.jsx
import React, { useContext, useState, useEffect } from 'react';
import { DbContext } from '../../context/DbContext';
import { Upload } from 'lucide-react';

export default function CompanyProfile() {
  const { currentUser, updateProfile, showToast } = useContext(DbContext);

  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');
  const [twitter, setTwitter] = useState('');
  const [linkedin, setLinkedin] = useState('');

  useEffect(() => {
    if (currentUser) {
      setCompanyName(currentUser.companyName || '');
      setIndustry(currentUser.industry || '');
      setWebsite(currentUser.website || '');
      setDescription(currentUser.description || '');
      setTwitter(currentUser.socialMedia?.twitter || '');
      setLinkedin(currentUser.socialMedia?.linkedin || '');
    }
  }, [currentUser]);

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
      const dataURL = e.target.result;
      updateProfile(currentUser.email, { logo: dataURL });
      showToast("Success", "Company logo updated successfully!", "success");
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updated = {
      companyName,
      industry,
      website,
      description,
      socialMedia: {
        twitter,
        linkedin
      }
    };
    updateProfile(currentUser.email, updated);
  };

  if (!currentUser) return null;

  return (
    <div className="dashboard-panel">
      <div className="panel-header">
        <h2>Company Profile</h2>
      </div>
      
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="profile-photo-wrapper">
            <img 
              src={currentUser.logo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop&q=80'} 
              className="profile-avatar-large" 
              style={{ borderRadius: 'var(--radius-md)' }}
              alt="Company logo preview" 
            />
            <div>
              <h4 style={{ fontWeight: 700, marginBottom: '0.25rem' }}>Company Logo</h4>
              <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '0.75rem' }}>Upload branding icon, max size of 800KB.</p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <label className="btn btn-sm btn-outline" style={{ cursor: 'pointer' }}>
                  <Upload size={14} /> Upload Logo
                  <input type="file" style={{ display: 'none' }} accept="image/*" onChange={handleLogoUpload} />
                </label>
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Company Name</label>
              <input type="text" className="form-control" value={companyName} onChange={e => setCompanyName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Industry Sector</label>
              <input type="text" className="form-control" value={industry} onChange={e => setIndustry(e.target.value)} required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Company Website URL</label>
              <input type="url" className="form-control" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://example.com" required />
            </div>
            <div className="form-group">
              <label className="form-label">Verification Status</label>
              <div style={{ marginTop: '0.5rem' }}>
                {currentUser.verified ? (
                  <span className="badge badge-success">Account Verified</span>
                ) : (
                  <span className="badge badge-warning">Pending Verification</span>
                )}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Company Profile Description</label>
            <textarea className="form-control" value={description} onChange={e => setDescription(e.target.value)} rows="4" required></textarea>
          </div>

          <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginTop: '1.5rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>Social Media Integrations</h3>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Twitter / X handle</label>
              <input type="text" className="form-control" value={twitter} onChange={e => setTwitter(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">LinkedIn Company Page</label>
              <input type="text" className="form-control" value={linkedin} onChange={e => setLinkedin(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '2rem', borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem' }}>
            <button type="submit" className="btn btn-primary">Save Profile</button>
          </div>
        </form>
      </div>
    </div>
  );
}
