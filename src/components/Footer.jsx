// src/components/Footer.jsx
import React, { useContext } from 'react';
import { DbContext } from '../context/DbContext';

export default function Footer({ setHash }) {
  const { currentUser } = useContext(DbContext);

  const handleLinkClick = (e, path) => {
    e.preventDefault();
    setHash(path);
  };

  const renderLinks = () => {
    if (!currentUser) {
      return (
        <>
          <div className="footer-links">
            <h5>Job Seeker</h5>
            <ul>
              <li><a href="#jobs" onClick={(e) => handleLinkClick(e, 'jobs')}>Find Jobs</a></li>
              <li><a href="#login" onClick={(e) => handleLinkClick(e, 'login')}>My Applications</a></li>
              <li><a href="#login" onClick={(e) => handleLinkClick(e, 'login')}>Resume Builder</a></li>
            </ul>
          </div>
          <div className="footer-links">
            <h5>Employer</h5>
            <ul>
              <li><a href="#login" onClick={(e) => handleLinkClick(e, 'login')}>Post a Job</a></li>
              <li><a href="#login" onClick={(e) => handleLinkClick(e, 'login')}>Manage Candidates</a></li>
              <li><a href="#about" onClick={(e) => handleLinkClick(e, 'about')}>About Us</a></li>
            </ul>
          </div>
        </>
      );
    }

    if (currentUser.role === 'seeker') {
      return (
        <>
          <div className="footer-links">
            <h5>Explore</h5>
            <ul>
              <li><a href="#seeker:search" onClick={(e) => handleLinkClick(e, 'seeker:search')}>Search Jobs</a></li>
              <li><a href="#seeker:saved" onClick={(e) => handleLinkClick(e, 'seeker:saved')}>Saved Jobs</a></li>
              <li><a href="#jobs" onClick={(e) => handleLinkClick(e, 'jobs')}>Browse Jobs</a></li>
            </ul>
          </div>
          <div className="footer-links">
            <h5>My Portal</h5>
            <ul>
              <li><a href="#seeker:dashboard" onClick={(e) => handleLinkClick(e, 'seeker:dashboard')}>Dashboard</a></li>
              <li><a href="#seeker:applications" onClick={(e) => handleLinkClick(e, 'seeker:applications')}>My Applications</a></li>
              <li><a href="#seeker:profile" onClick={(e) => handleLinkClick(e, 'seeker:profile')}>Profile Settings</a></li>
            </ul>
          </div>
        </>
      );
    }

    if (currentUser.role === 'employer') {
      return (
        <>
          <div className="footer-links">
            <h5>Listings</h5>
            <ul>
              <li><a href="#employer:jobs" onClick={(e) => handleLinkClick(e, 'employer:jobs')}>My Listings</a></li>
              <li><a href="#employer:dashboard" onClick={(e) => handleLinkClick(e, 'employer:dashboard')}>Post a Job</a></li>
              <li><a href="#employer:applicants" onClick={(e) => handleLinkClick(e, 'employer:applicants')}>Candidate Pool</a></li>
            </ul>
          </div>
          <div className="footer-links">
            <h5>Workspace</h5>
            <ul>
              <li><a href="#employer:dashboard" onClick={(e) => handleLinkClick(e, 'employer:dashboard')}>Dashboard</a></li>
              <li><a href="#employer:interviews" onClick={(e) => handleLinkClick(e, 'employer:interviews')}>Interviews</a></li>
              <li><a href="#about" onClick={(e) => handleLinkClick(e, 'about')}>About Platform</a></li>
            </ul>
          </div>
        </>
      );
    }

    if (currentUser.role === 'admin') {
      return (
        <>
          <div className="footer-links">
            <h5>Moderation</h5>
            <ul>
              <li><a href="#admin:jobs" onClick={(e) => handleLinkClick(e, 'admin:jobs')}>Job Management</a></li>
              <li><a href="#admin:verification" onClick={(e) => handleLinkClick(e, 'admin:verification')}>Verifications</a></li>
              <li><a href="#admin:reports" onClick={(e) => handleLinkClick(e, 'admin:reports')}>System Reports</a></li>
            </ul>
          </div>
          <div className="footer-links">
            <h5>System</h5>
            <ul>
              <li><a href="#admin:dashboard" onClick={(e) => handleLinkClick(e, 'admin:dashboard')}>Overview</a></li>
              <li><a href="#admin:users" onClick={(e) => handleLinkClick(e, 'admin:users')}>User Control</a></li>
              <li><a href="#admin:settings" onClick={(e) => handleLinkClick(e, 'admin:settings')}>Settings</a></li>
            </ul>
          </div>
        </>
      );
    }
  };

  return (
    <footer id="app-footer">
      <div className="footer-container">
        <div className="footer-brand">
          <h4>IE-JobPortal</h4>
          <p>Connecting elite engineering talent with the world's most innovative organizations.</p>
          <div style={{ display: 'flex', gap: '1rem', color: 'var(--color-text-light)', marginTop: '1rem' }}>
            <a href="#" onClick={e => e.preventDefault()} title="Twitter">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
            </a>
            <a href="https://www.linkedin.com/company/ie-network-solutions/posts/?feedView=all" target="_blank" rel="noopener noreferrer" title="LinkedIn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
            </a>
            <a href="#" onClick={e => e.preventDefault()} title="GitHub">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
            </a>
          </div>
        </div>

        {renderLinks()}

        <div className="footer-newsletter">
          <h5>Stay Updated</h5>
          <p>Subscribe to our newsletter for weekly career tips and job alerts.</p>
          <form style={{ display: 'flex', gap: '0.5rem' }} onSubmit={e => { e.preventDefault(); alert('Subscribed! (Mock)'); }}>
            <input type="email" className="form-control" placeholder="Enter your email" required />
            <button type="submit" className="btn btn-primary btn-sm">Join</button>
          </form>
        </div>
      </div>
      <div style={{ maxWidth: '1280px', margin: '2rem auto 0 auto', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)', textAlign: 'center', color: 'var(--color-text-light)', fontSize: '0.8rem' }}>
        &copy; 2026 IE-JobPortal Inc. All rights reserved. Created with absolute premium standards.
      </div>
    </footer>
  );
}
