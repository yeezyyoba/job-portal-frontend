// src/pages/admin/Settings.jsx
import React, { useContext, useState, useEffect } from 'react';
import { DbContext } from '../../context/DbContext';

export default function Settings() {
  const { settings, saveSettings } = useContext(DbContext);

  const [siteName, setSiteName] = useState('');
  const [fromAddress, setFromAddress] = useState('');
  const [smtpServer, setSmtpServer] = useState('');
  const [port, setPort] = useState('');
  const [autoApproveJobs, setAutoApproveJobs] = useState(false);
  const [maxFileSizeMB, setMaxFileSizeMB] = useState(5);

  useEffect(() => {
    if (settings) {
      setSiteName(settings.siteName || '');
      setFromAddress(settings.emailSettings?.fromAddress || '');
      setSmtpServer(settings.emailSettings?.smtpServer || '');
      setPort(settings.emailSettings?.port || '');
      setAutoApproveJobs(settings.configurations?.autoApproveJobs || false);
      setMaxFileSizeMB(settings.configurations?.maxFileSizeMB || 5);
    }
  }, [settings]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const updated = {
      siteName,
      emailSettings: {
        fromAddress,
        smtpServer,
        port
      },
      configurations: {
        autoApproveJobs,
        maxFileSizeMB: Number(maxFileSizeMB)
      }
    };
    saveSettings(updated);
  };

  return (
    <div className="dashboard-panel">
      <div className="panel-header">
        <h2>Platform System Configurations</h2>
      </div>
      
      <div className="card">
        <form onSubmit={handleSubmit}>
          <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>General Branding</h3>
          <div className="form-group">
            <label className="form-label">Platform Portal Site Name</label>
            <input 
              type="text" 
              className="form-control" 
              value={siteName} 
              onChange={e => setSiteName(e.target.value)} 
              required 
            />
          </div>

          <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginTop: '1.5rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>SMTP Email Server Configurations</h3>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Sender Email Address</label>
              <input 
                type="email" 
                className="form-control" 
                value={fromAddress} 
                onChange={e => setFromAddress(e.target.value)} 
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">SMTP Hub Server Host</label>
              <input 
                type="text" 
                className="form-control" 
                value={smtpServer} 
                onChange={e => setSmtpServer(e.target.value)} 
                required 
              />
            </div>
          </div>
          <div className="form-group" style={{ maxWidth: '200px' }}>
            <label className="form-label">SMTP Hub Port</label>
            <input 
              type="text" 
              className="form-control" 
              value={port} 
              onChange={e => setPort(e.target.value)} 
              required 
            />
          </div>

          <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginTop: '1.5rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>Document Moderation Policies</h3>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Auto-Approve Recruiter Postings</label>
              <select 
                className="form-control" 
                value={autoApproveJobs.toString()} 
                onChange={e => setAutoApproveJobs(e.target.value === "true")}
              >
                <option value="false">Manual Moderation Required</option>
                <option value="true">Auto-Approve On Post</option>
              </select>
            </div>
            <div className="form-group">
              <label class="form-label">Max Resume File Size Limit (MB)</label>
              <input 
                type="number" 
                className="form-control" 
                value={maxFileSizeMB} 
                onChange={e => setMaxFileSizeMB(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '2rem', borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem' }}>
            <button type="submit" className="btn btn-primary">Save Platform Settings</button>
          </div>
        </form>
      </div>
    </div>
  );
}
