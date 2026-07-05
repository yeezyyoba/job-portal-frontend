// src/pages/seeker/SeekerDashboard.jsx
import React, { useContext } from 'react';
import { DbContext } from '../../context/DbContext';
import { LayoutDashboard, Search as SearchIcon, Briefcase, Bookmark, User, Bell } from 'lucide-react';
import JobSearch from './JobSearch';
import Applications from './Applications';
import SavedJobs from './SavedJobs';
import Profile from './Profile';
import Notifications from './Notifications';

export default function SeekerDashboard({ currentHash, setHash, searchQuery, setSelectedJobId, setDetailsOpen }) {
  const { currentUser, jobs, applications } = useContext(DbContext);

  if (!currentUser) return null;

  const currentTab = currentHash.split(':')[1] || 'dashboard';

  const seekerApps = applications.filter(a => a.seekerEmail === currentUser.email);
  const savedCount = (currentUser.savedJobs || []).length;
  const unreadCount = (currentUser.notifications || []).filter(n => !n.read).length;

  const calculateProfileCompletion = () => {
    let score = 20;
    if (currentUser.profilePhoto) score += 10;
    if (currentUser.resumeName) score += 10;
    if (currentUser.phone) score += 10;
    if (currentUser.address) score += 10;
    if (currentUser.skills && currentUser.skills.length > 0) score += 20;
    if (currentUser.experience && currentUser.experience.length > 0) score += 10;
    if (currentUser.education && currentUser.education.length > 0) score += 10;
    return Math.min(score, 100);
  };

  const progress = calculateProfileCompletion();

  // Recommended jobs based on matching skills
  const allActiveJobs = jobs.filter(j => j.approved && j.status === 'active');
  const userSkills = currentUser.skills || [];
  const recommendedJobs = allActiveJobs.filter(job => {
    return userSkills.some(skill => 
      job.title.toLowerCase().includes(skill.toLowerCase()) || 
      job.description.toLowerCase().includes(skill.toLowerCase())
    );
  }).slice(0, 3);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
    { id: 'search', label: 'Search Jobs', icon: <SearchIcon size={16} /> },
    { id: 'applications', label: 'My Applications', icon: <Briefcase size={16} /> },
    { id: 'saved', label: 'Saved Jobs', icon: <Bookmark size={16} /> },
    { id: 'profile', label: 'My Profile', icon: <User size={16} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={16} />, badge: unreadCount }
  ];

  const handleTabClick = (tabId) => {
    setHash(`seeker:${tabId}`);
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'search':
        return <JobSearch searchQuery={searchQuery} setSelectedJobId={setSelectedJobId} setDetailsOpen={setDetailsOpen} />;
      case 'applications':
        return <Applications setSelectedJobId={setSelectedJobId} setDetailsOpen={setDetailsOpen} />;
      case 'saved':
        return <SavedJobs setSelectedJobId={setSelectedJobId} setDetailsOpen={setDetailsOpen} />;
      case 'profile':
        return <Profile />;
      case 'notifications':
        return <Notifications />;
      default:
        return (
          <>
            <div className="panel-header">
              <h2>Seeker Dashboard</h2>
            </div>
            
            <div className="stats-grid">
              <div className="card flex-between">
                <div>
                  <p className="text-muted" style={{ fontSize: '0.85rem', fontWeight: 500 }}>Job Applications</p>
                  <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-primary)' }}>{seekerApps.length}</h3>
                </div>
                <Briefcase size={36} style={{ color: 'var(--color-primary)', opacity: 0.25 }} />
              </div>
              <div className="card flex-between">
                <div>
                  <p className="text-muted" style={{ fontSize: '0.85rem', fontWeight: 500 }}>Saved Jobs</p>
                  <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-primary)' }}>{savedCount}</h3>
                </div>
                <Bookmark size={36} style={{ color: 'var(--color-primary)', opacity: 0.25 }} />
              </div>
            </div>

            <div className="seeker-profile-progress card">
              <div className="flex-between">
                <h4 style={{ fontWeight: 700, fontSize: '1rem' }}>Profile Completion</h4>
                <span style={{ fontWeight: 700, color: 'var(--color-success)' }}>{progress}%</span>
              </div>
              <div className="progress-bar-container">
                <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
              </div>
              <p className="text-muted" style={{ fontSize: '0.8rem', margin: 0 }}>
                {progress === 100 ? 'Awesome! Your profile is fully optimized for employers.' : 'Complete your skills, education, and resume to improve matching results.'}
              </p>
            </div>

            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h4 style={{ fontWeight: 700, fontSize: '1.1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>Recommended Jobs for You</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {recommendedJobs.length === 0 ? (
                  <p className="text-muted">No specific skill matches. Try expanding your profile skills list!</p>
                ) : (
                  recommendedJobs.map(job => (
                    <div key={job.id} className="card card-hover flex-between" style={{ padding: '1rem', borderColor: 'var(--color-accent)' }}>
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <img src={job.companyLogo} className="job-logo" style={{ width: '2.5rem', height: '2.5rem' }} alt="" />
                        <div>
                          <h4 style={{ fontWeight: 700, fontSize: '0.95rem' }}>{job.title}</h4>
                          <p className="text-muted" style={{ fontSize: '0.8rem' }}>{job.company} &bull; {job.location} &bull; {job.remoteType}</p>
                        </div>
                      </div>
                      <button className="btn btn-secondary btn-sm" onClick={() => { setSelectedJobId(job.id); setDetailsOpen(true); }}>View Details</button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="dashboard-grid">
      <aside className="sidebar-card card">
        <div className="profile-summary text-center mb-4">
          <img 
            src={currentUser.profilePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&q=80'} 
            className="profile-avatar-large" 
            style={{ width: '3.5rem', height: '3.5rem', marginBottom: '0.5rem' }} 
            alt="Seeker portrait"
          />
          <h4 style={{ fontWeight: 700 }}>{currentUser.name || 'Anonymous Seeker'}</h4>
          <p className="text-muted" style={{ fontSize: '0.8rem' }}>Job Seeker</p>
        </div>
        <div className="sidebar-menu">
          {menuItems.map(item => (
            <div 
              key={item.id} 
              className={`sidebar-item ${currentTab === item.id ? 'active' : ''}`}
              onClick={() => handleTabClick(item.id)}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.badge > 0 && <span className="badge badge-danger" style={{ marginLeft: 'auto' }}>{item.badge}</span>}
            </div>
          ))}
        </div>
      </aside>
      <div className="dashboard-panel">
        {renderContent()}
      </div>
    </div>
  );
}
