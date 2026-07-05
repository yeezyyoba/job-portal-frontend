// src/pages/employer/EmployerDashboard.jsx
import React, { useContext } from 'react';
import { DbContext } from '../../context/DbContext';
import { LayoutDashboard, List as ListIcon, Users as UsersIcon, Calendar as CalendarIcon, Building } from 'lucide-react';
import JobListings from './JobListings';
import Applicants from './Applicants';
import Interviews from './Interviews';
import CompanyProfile from './CompanyProfile';

export default function EmployerDashboard({ currentHash, setHash, setFormOpen, setSelectedJobId, setInterviewOpen, setSelectedAppId }) {
  const { currentUser, jobs, applications } = useContext(DbContext);

  if (!currentUser) return null;

  const currentTab = currentHash.split(':')[1] || 'dashboard';

  const employerJobs = jobs.filter(j => j.company.toLowerCase() === currentUser.companyName.toLowerCase());
  const employerJobIds = employerJobs.map(j => j.id);
  const activeJobs = employerJobs.filter(j => j.status === 'active');
  const employerApps = applications.filter(a => employerJobIds.includes(a.jobId));
  const pendingApplicantsCount = employerApps.filter(a => a.status === 'Applied' || a.status === 'Under Review').length;

  const stages = {
    Applied: employerApps.filter(a => a.status === 'Applied').length,
    UnderReview: employerApps.filter(a => a.status === 'Under Review').length,
    Shortlisted: employerApps.filter(a => a.status === 'Shortlisted').length,
    Interviews: employerApps.filter(a => a.status === 'Interview Scheduled').length,
    Accepted: employerApps.filter(a => a.status === 'Accepted').length,
    Rejected: employerApps.filter(a => a.status === 'Rejected').length
  };

  const maxStageCount = Math.max(Object.values(stages).reduce((a, b) => a + b, 0), 1);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
    { id: 'jobs', label: 'My Listings', icon: <ListIcon size={16} /> },
    { id: 'applicants', label: 'Applicants', icon: <UsersIcon size={16} />, badge: pendingApplicantsCount },
    { id: 'interviews', label: 'Interviews', icon: <CalendarIcon size={16} /> },
    { id: 'profile', label: 'Company Profile', icon: <Building size={16} /> }
  ];

  const handleTabClick = (tabId) => {
    setHash(`employer:${tabId}`);
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'jobs':
        return <JobListings setFormOpen={setFormOpen} setSelectedJobId={setSelectedJobId} />;
      case 'applicants':
        return <Applicants setInterviewOpen={setInterviewOpen} setSelectedAppId={setSelectedAppId} />;
      case 'interviews':
        return <Interviews />;
      case 'profile':
        return <CompanyProfile />;
      default:
        return (
          <>
            <div className="panel-header">
              <h2>Recruitment Dashboard</h2>
            </div>
            
            <div className="stats-grid">
              <div className="card flex-between">
                <div>
                  <p className="text-muted" style={{ fontSize: '0.85rem', fontWeight: 500 }}>Total Posted Jobs</p>
                  <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-primary)' }}>{employerJobs.length}</h3>
                </div>
                <ListIcon size={36} style={{ color: 'var(--color-primary)', opacity: 0.25 }} />
              </div>
              <div className="card flex-between">
                <div>
                  <p className="text-muted" style={{ fontSize: '0.85rem', fontWeight: 500 }}>Active Listings</p>
                  <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-success)' }}>{activeJobs.length}</h3>
                </div>
                <BriefcaseIconDummy size={36} style={{ color: 'var(--color-success)', opacity: 0.25 }} />
              </div>
              <div className="card flex-between">
                <div>
                  <p className="text-muted" style={{ fontSize: '0.85rem', fontWeight: 500 }}>Total Applicants</p>
                  <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-warning)' }}>{employerApps.length}</h3>
                </div>
                <UsersIcon size={36} style={{ color: 'var(--color-warning)', opacity: 0.25 }} />
              </div>
            </div>

            <div className="card" style={{ marginTop: '1rem' }}>
              <h4 style={{ fontWeight: 700, fontSize: '1.1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', marginBottom: '1.25rem' }}>Candidate Pipeline Tally</h4>
              <div className="ranking-list">
                <div className="ranking-item">
                  <div className="ranking-meta"><span>New Applications</span><span>{stages.Applied}</span></div>
                  <div className="ranking-bar-bg"><div className="ranking-bar-fill" style={{ width: `${(stages.Applied / maxStageCount) * 100}%`, backgroundColor: 'var(--color-primary)' }}></div></div>
                </div>
                <div className="ranking-item">
                  <div className="ranking-meta"><span>Under Review</span><span>{stages.UnderReview}</span></div>
                  <div className="ranking-bar-bg"><div className="ranking-bar-fill" style={{ width: `${(stages.UnderReview / maxStageCount) * 100}%`, backgroundColor: 'var(--color-text-light)' }}></div></div>
                </div>
                <div className="ranking-item">
                  <div className="ranking-meta"><span>Shortlisted Candidates</span><span>{stages.Shortlisted}</span></div>
                  <div className="ranking-bar-bg"><div className="ranking-bar-fill" style={{ width: `${(stages.Shortlisted / maxStageCount) * 100}%`, backgroundColor: 'var(--color-warning)' }}></div></div>
                </div>
                <div className="ranking-item">
                  <div className="ranking-meta"><span>Interviews Scheduled</span><span>{stages.Interviews}</span></div>
                  <div className="ranking-bar-bg"><div className="ranking-bar-fill" style={{ width: `${(stages.Interviews / maxStageCount) * 100}%`, backgroundColor: '#A855F7' }}></div></div>
                </div>
                <div className="ranking-item">
                  <div className="ranking-meta"><span>Offers Accepted</span><span>{stages.Accepted}</span></div>
                  <div className="ranking-bar-bg"><div className="ranking-bar-fill" style={{ width: `${(stages.Accepted / maxStageCount) * 100}%`, backgroundColor: 'var(--color-success)' }}></div></div>
                </div>
                <div className="ranking-item">
                  <div className="ranking-meta"><span>Rejected Profiles</span><span>{stages.Rejected}</span></div>
                  <div className="ranking-bar-bg"><div className="ranking-bar-fill" style={{ width: `${(stages.Rejected / maxStageCount) * 100}%`, backgroundColor: 'var(--color-error)' }}></div></div>
                </div>
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
            src={currentUser.logo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop&q=80'} 
            className="profile-avatar-large" 
            style={{ width: '3.5rem', height: '3.5rem', objectFit: 'cover', borderRadius: 'var(--radius-md)' }} 
            alt="Company logo summary"
          />
          <h4 style={{ fontWeight: 700 }}>{currentUser.companyName || 'Employer Studio'}</h4>
          <p className="text-muted" style={{ fontSize: '0.8rem' }}>Employer Portal</p>
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
              {item.badge > 0 && <span className="badge badge-warning" style={{ marginLeft: 'auto' }}>{item.badge}</span>}
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

// Small inline fallback icon component to avoid missing imported icon issues
function BriefcaseIconDummy({ size, style }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      style={style}
    >
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
    </svg>
  );
}
