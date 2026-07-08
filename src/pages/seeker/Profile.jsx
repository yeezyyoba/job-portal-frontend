// src/pages/seeker/Profile.jsx
import React, { useContext, useState, useEffect } from 'react';
import { DbContext } from '../../context/DbContext';
import { Upload, FileText } from 'lucide-react';

export default function Profile() {
  const { currentUser, updateProfile, showToast, API_BASE } = useContext(DbContext);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [skills, setSkills] = useState('');
  const [languages, setLanguages] = useState('');

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setPhone(currentUser.phone || '');
      setAddress(currentUser.address || '');
      setDob(currentUser.dob || '');
      setGender(currentUser.gender || '');
      setSkills((currentUser.skills || []).join(', '));
      setLanguages((currentUser.languages || []).join(', '));
    }
  }, [currentUser]);

  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
      const dataURL = e.target.result;
      updateProfile(currentUser.email, { profilePhoto: dataURL });
      showToast("Success", "Profile photo uploaded successfully!", "success");
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    updateProfile(currentUser.email, { profilePhoto: null });
    showToast("Info", "Profile photo removed.", "info");
  };

  const handleResumeUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const base64Data = e.target.result.split(',')[1];
        const success = await updateProfile(currentUser.email, { 
          resumeName: file.name,
          resumeData: base64Data
        });
        if (success) {
          showToast("Success", `Resume "${file.name}" uploaded successfully!`, "success");
        }
      } catch (err) {
        showToast("Error", "Could not upload resume file.", "error");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDownloadResume = (e) => {
    e.preventDefault();
    if (currentUser?.resumeName) {
      // Direct link to backend serving path
      const fileUrl = `${API_BASE.replace('/api', '')}/resumes/${currentUser.resumeName}`;
      window.open(fileUrl, '_blank');
    } else {
      showToast("Error", "No resume uploaded yet.", "error");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (phone && !/^\+?[0-9\s\-()]{7,20}$/.test(phone)) {
      showToast("Validation Error", "Please enter a valid phone number (digits, spaces, hyphens, and parentheses only, 7-20 characters).", "error");
      return;
    }
    if (dob) {
      const today = new Date().toISOString().split('T')[0];
      if (dob > today) {
        showToast("Validation Error", "Date of birth cannot be in the future.", "error");
        return;
      }
    }
    const updated = {
      name,
      phone,
      address,
      dob,
      gender,
      skills: skills.split(',').map(s => s.trim()).filter(s => s !== ''),
      languages: languages.split(',').map(s => s.trim()).filter(s => s !== '')
    };
    updateProfile(currentUser.email, updated);
  };

  if (!currentUser) return null;

  return (
    <div className="dashboard-panel">
      <div className="panel-header">
        <h2>Profile Management</h2>
      </div>
      
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="profile-photo-wrapper">
            <img 
              src={currentUser.profilePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&q=80'} 
              className="profile-avatar-large" 
              alt="Profile preview" 
            />
            <div>
              <h4 style={{ fontWeight: 700, marginBottom: '0.25rem' }}>Profile Image</h4>
              <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '0.75rem' }}>JPG or PNG, max size of 800KB.</p>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                <label className="btn btn-sm btn-outline" style={{ cursor: 'pointer' }}>
                  <Upload size={14} /> Upload Image
                  <input type="file" style={{ display: 'none' }} accept="image/*" onChange={handlePhotoUpload} />
                </label>
                {currentUser.profilePhoto && (
                  <button type="button" className="btn btn-sm btn-danger btn-outline" onClick={handleRemovePhoto}>Remove</button>
                )}
              </div>
            </div>
          </div>

          <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>Personal Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" className="form-control" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" className="form-control" value={currentUser.email} disabled />
            </div>
          </div>

          <div class="form-row">
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input 
                type="text" 
                className="form-control" 
                value={phone} 
                onChange={e => {
                  const val = e.target.value;
                  if (val === '' || /^[0-9+\s\-()]*$/.test(val)) {
                    setPhone(val);
                  }
                }} 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <input type="text" className="form-control" value={address} onChange={e => setAddress(e.target.value)} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Date of Birth</label>
              <input 
                type="date" 
                className="form-control" 
                value={dob} 
                onChange={e => setDob(e.target.value)} 
                max={new Date().toISOString().split('T')[0]} 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Gender</label>
              <select className="form-control" value={gender} onChange={e => setGender(e.target.value)}>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>

          <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginTop: '1.5rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>Professional Credentials</h3>
          
          <div className="form-group">
            <label className="form-label">Skills (comma-separated)</label>
            <input type="text" className="form-control" value={skills} onChange={e => setSkills(e.target.value)} placeholder="e.g. JavaScript, React, CSS Grid" />
          </div>

          <div className="form-group">
            <label className="form-label">Languages (comma-separated)</label>
            <input type="text" className="form-control" value={languages} onChange={e => setLanguages(e.target.value)} placeholder="e.g. English (Fluent), Spanish" />
          </div>

          <div className="form-group">
            <label className="form-label">Resume Management</label>
            <div className="card" style={{ padding: '1rem', backgroundColor: 'var(--color-bg-light)', borderStyle: 'dashed', borderColor: 'var(--color-primary)' }}>
              <div className="flex-between">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <FileText size={32} style={{ color: 'var(--color-primary)' }} />
                  <div>
                    <h5 style={{ fontWeight: 700, margin: 0 }}>{currentUser.resumeName || 'No resume uploaded'}</h5>
                    <p className="text-muted" style={{ fontSize: '0.75rem', margin: 0 }}>PDF, DOC, DOCX up to 5MB</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <label className="btn btn-sm btn-outline" style={{ cursor: 'pointer' }}>
                    Upload
                    <input type="file" style={{ display: 'none' }} accept=".pdf,.doc,.docx" onChange={handleResumeUpload} />
                  </label>
                  {currentUser.resumeName && (
                    <button className="btn btn-sm btn-secondary" onClick={handleDownloadResume}>Download</button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '2rem', borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem' }}>
            <button type="submit" className="btn btn-primary">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}
