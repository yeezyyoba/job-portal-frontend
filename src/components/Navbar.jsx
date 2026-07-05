// src/components/Navbar.jsx
import React, { useContext, useEffect, useState } from 'react';
import { DbContext } from '../context/DbContext';
import { Briefcase, Moon, Sun, Home, Info, Mail, LayoutDashboard, Search, FileText, Bookmark, List, Users, Calendar } from 'lucide-react';

export default function Navbar({ currentHash, setHash }) {
  const { currentUser, logoutUser, activeRole, setActiveRole } = useContext(DbContext);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const theme = localStorage.getItem('job_portal_theme');
    if (theme === 'dark') {
      document.body.classList.add('dark');
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.body.classList.remove('dark');
      localStorage.setItem('job_portal_theme', 'light');
      setIsDark(false);
    } else {
      document.body.classList.add('dark');
      localStorage.setItem('job_portal_theme', 'dark');
      setIsDark(true);
    }
  };

  const handleLinkClick = (e, path) => {
    e.preventDefault();
    setHash(path);
  };

  const renderNavLinks = () => {
    if (!currentUser) {
      return (
        <>
          <a href="#home" onClick={(e) => handleLinkClick(e, 'home')} className={`nav-link ${currentHash === 'home' ? 'active' : ''}`}>
            <Home size={16} /> <span>Home</span>
          </a>
          <a href="#jobs" onClick={(e) => handleLinkClick(e, 'jobs')} className={`nav-link ${currentHash === 'jobs' ? 'active' : ''}`}>
            <Search size={16} /> <span>Browse Jobs</span>
          </a>
          <a href="#about" onClick={(e) => handleLinkClick(e, 'about')} className={`nav-link ${currentHash === 'about' ? 'active' : ''}`}>
            <Info size={16} /> <span>About Us</span>
          </a>
          <a href="#contact" onClick={(e) => handleLinkClick(e, 'contact')} className={`nav-link ${currentHash === 'contact' ? 'active' : ''}`}>
            <Mail size={16} /> <span>Contact</span>
          </a>
        </>
      );
    }

    const roleToRender = activeRole || currentUser.role;

    if (roleToRender === 'seeker') {
      return (
        <>
          <a href="#seeker:dashboard" onClick={(e) => handleLinkClick(e, 'seeker:dashboard')} className={`nav-link ${currentHash === 'seeker:dashboard' ? 'active' : ''}`}>
            <LayoutDashboard size={16} /> <span>Dashboard</span>
          </a>
          <a href="#seeker:search" onClick={(e) => handleLinkClick(e, 'seeker:search')} className={`nav-link ${currentHash === 'seeker:search' ? 'active' : ''}`}>
            <Search size={16} /> <span>Search Jobs</span>
          </a>
          <a href="#seeker:applications" onClick={(e) => handleLinkClick(e, 'seeker:applications')} className={`nav-link ${currentHash === 'seeker:applications' ? 'active' : ''}`}>
            <Briefcase size={16} /> <span>Applications</span>
          </a>
          <a href="#seeker:saved" onClick={(e) => handleLinkClick(e, 'seeker:saved')} className={`nav-link ${currentHash === 'seeker:saved' ? 'active' : ''}`}>
            <Bookmark size={16} /> <span>Saved</span>
          </a>
        </>
      );
    }

    if (roleToRender === 'employer') {
      return (
        <>
          <a href="#employer:dashboard" onClick={(e) => handleLinkClick(e, 'employer:dashboard')} className={`nav-link ${currentHash === 'employer:dashboard' ? 'active' : ''}`}>
            <LayoutDashboard size={16} /> <span>Dashboard</span>
          </a>
          <a href="#employer:jobs" onClick={(e) => handleLinkClick(e, 'employer:jobs')} className={`nav-link ${currentHash === 'employer:jobs' ? 'active' : ''}`}>
            <List size={16} /> <span>My Listings</span>
          </a>
          <a href="#employer:applicants" onClick={(e) => handleLinkClick(e, 'employer:applicants')} className={`nav-link ${currentHash === 'employer:applicants' ? 'active' : ''}`}>
            <Users size={16} /> <span>Candidates</span>
          </a>
          <a href="#employer:interviews" onClick={(e) => handleLinkClick(e, 'employer:interviews')} className={`nav-link ${currentHash === 'employer:interviews' ? 'active' : ''}`}>
            <Calendar size={16} /> <span>Interviews</span>
          </a>
        </>
      );
    }

    if (roleToRender === 'admin' || roleToRender === 'superadmin') {
      return (
        <>
          <a href="#admin:dashboard" onClick={(e) => handleLinkClick(e, 'admin:dashboard')} className={`nav-link ${currentHash === 'admin:dashboard' ? 'active' : ''}`}>
            <LayoutDashboard size={16} /> <span>Dashboard</span>
          </a>
          <a href="#admin:users" onClick={(e) => handleLinkClick(e, 'admin:users')} className={`nav-link ${currentHash === 'admin:users' ? 'active' : ''}`}>
            <Users size={16} /> <span>Users</span>
          </a>
          <a href="#admin:jobs" onClick={(e) => handleLinkClick(e, 'admin:jobs')} className={`nav-link ${currentHash === 'admin:jobs' ? 'active' : ''}`}>
            <Briefcase size={16} /> <span>Jobs Moderation</span>
          </a>
          <a href="#admin:reports" onClick={(e) => handleLinkClick(e, 'admin:reports')} className={`nav-link ${currentHash === 'admin:reports' ? 'active' : ''}`}>
            <Mail size={16} /> <span>Reports</span>
          </a>
        </>
      );
    }
  };

  const renderAuthActions = () => {
    if (!currentUser) {
      return (
        <>
          <a href="#login" onClick={(e) => handleLinkClick(e, 'login')} className="btn btn-outline">Log In</a>
          <a href="#register" onClick={(e) => handleLinkClick(e, 'register')} className="btn btn-primary">Sign Up</a>
        </>
      );
    }
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {currentUser.role === 'both' && (
          <button 
            className="btn btn-sm btn-primary" 
            onClick={() => {
              const targetRole = activeRole === 'seeker' ? 'employer' : 'seeker';
              setActiveRole(targetRole);
              setHash(targetRole === 'seeker' ? 'seeker:dashboard' : 'employer:dashboard');
            }}
            style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
          >
            Switch to {activeRole === 'seeker' ? 'Employer' : 'Seeker'} Mode
          </button>
        )}
        <span style={{ fontWeight: 600, fontSize: '0.85rem' }} className="text-muted">
          {activeRole === 'employer' ? (currentUser.companyName || currentUser.email) : (currentUser.name || currentUser.email)}
        </span>
        <button className="btn btn-sm btn-outline" onClick={() => { logoutUser(); setHash('home'); }}>Log Out</button>
      </div>
    );
  };

  return (
    <header id="app-header">
      <div className="header-container">
        <a href="#home" onClick={(e) => handleLinkClick(e, 'home')} className="logo-block">
          <Briefcase />
          <span>IE-JobPortal</span>
        </a>

        <nav className="nav-links">
          {renderNavLinks()}
        </nav>

        <div className="nav-actions">
          <button className="btn btn-outline btn-icon" onClick={toggleTheme} title="Toggle Theme">
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {renderAuthActions()}
          </div>
        </div>
      </div>
    </header>
  );
}
