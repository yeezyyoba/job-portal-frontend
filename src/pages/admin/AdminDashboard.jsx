// src/pages/admin/AdminDashboard.jsx
import React, { useContext } from 'react';
import { DbContext } from '../../context/DbContext';
import { LayoutDashboard, Users, Briefcase, ShieldCheck, AlertTriangle, Settings as SettingsIcon } from 'lucide-react';
import UserManagement from './UserManagement';
import JobModeration from './JobModeration';
import Verification from './Verification';
import Reports from './Reports';
import Settings from './Settings';

export default function AdminDashboard({ currentHash, setHash, setSelectedJobId, setDetailsOpen }) {
  const { users, jobs, applications, reports, currentUser } = useContext(DbContext);

  const currentTab = currentHash.split(':')[1] || 'dashboard';

  const seekerCount = users.filter(u => u.role === 'seeker').length;
  const employerCount = users.filter(u => u.role === 'employer').length;
  const activeJobs = jobs.filter(j => j.status === 'active' && j.approved).length;
  const pendingJobsCount = jobs.filter(j => !j.approved).length;
  const pendingVerificationsCount = users.filter(u => u.role === 'employer' && !u.verified).length;
  const pendingReportsCount = reports.filter(r => r.status === 'Pending').length;

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard & Analytics', icon: <LayoutDashboard size={16} /> },
    { id: 'users', label: 'User Management', icon: <Users size={16} /> },
    { id: 'jobs', label: 'Job Management', icon: <Briefcase size={16} />, badge: pendingJobsCount },
    { id: 'verification', label: 'Company Verification', icon: <ShieldCheck size={16} />, badge: pendingVerificationsCount },
    { id: 'reports', label: 'System Reports', icon: <AlertTriangle size={16} />, badge: pendingReportsCount }
  ];

  if (currentUser?.role === 'superadmin') {
    menuItems.push({ id: 'settings', label: 'System Settings', icon: <SettingsIcon size={16} /> });
  }

  const handleTabClick = (tabId) => {
    setHash(`admin:${tabId}`);
  };

  // Static + dynamic counts for chart simulation
  const appsPerMonth = [
    { month: 'Jan', count: 12 },
    { month: 'Feb', count: 19 },
    { month: 'Mar', count: 32 },
    { month: 'Apr', count: 45 },
    { month: 'May', count: 28 },
    { month: 'Jun', count: applications.length + 8 }
  ];
  const maxAppCount = Math.max(...appsPerMonth.map(m => m.count), 1);

  // Active employers rankings
  const companyCounts = {};
  jobs.forEach(j => {
    companyCounts[j.company] = (companyCounts[j.company] || 0) + 1;
  });
  const topCompanies = Object.entries(companyCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  const maxJobsInCompany = topCompanies.length > 0 ? Math.max(...topCompanies.map(c => c[1]), 1) : 1;

  const renderContent = () => {
    switch (currentTab) {
      case 'users':
        return <UserManagement />;
      case 'jobs':
        return <JobModeration setSelectedJobId={setSelectedJobId} setDetailsOpen={setDetailsOpen} />;
      case 'verification':
        return <Verification />;
      case 'reports':
        return <Reports />;
      case 'settings':
        if (currentUser?.role !== 'superadmin') return null;
        return <Settings />;
      default:
        return (
          <>
            <div className="panel-header">
              <h2>Platform Overview</h2>
            </div>
            
            <div className="admin-summary-grid">
              <div className="card admin-card-stat">
                <div className="admin-stat-icon"><Users size={20} /></div>
                <div>
                  <p className="text-muted" style={{ fontSize: '0.8rem', fontWeight: 500 }}>Seekers Registered</p>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{seekerCount}</h3>
                </div>
              </div>
              <div className="card admin-card-stat">
                <div className="admin-stat-icon green"><ShieldCheck size={20} /></div>
                <div>
                  <p className="text-muted" style={{ fontSize: '0.8rem', fontWeight: 500 }}>Employers Registered</p>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{employerCount}</h3>
                </div>
              </div>
              <div className="card admin-card-stat">
                <div className="admin-stat-icon orange"><Briefcase size={20} /></div>
                <div>
                  <p className="text-muted" style={{ fontSize: '0.8rem', fontWeight: 500 }}>Active Job Posts</p>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{activeJobs}</h3>
                </div>
              </div>
              <div className="card admin-card-stat">
                <div className="admin-stat-icon red"><AlertTriangle size={20} /></div>
                <div>
                  <p className="text-muted" style={{ fontSize: '0.8rem', fontWeight: 500 }}>Pending Issues</p>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{pendingJobsCount + pendingReportsCount}</h3>
                </div>
              </div>
            </div>

            <div className="admin-charts-row">
              <div className="card">
                <h4 style={{ fontWeight: 700, fontSize: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>Applications Submitted per Month</h4>
                <div className="chart-container">
                  <div className="css-bar-chart">
                    {appsPerMonth.map((item, idx) => {
                      const pctHeight = (item.count / maxAppCount) * 85;
                      return (
                        <div key={idx} className="chart-bar-wrapper">
                          <div className="chart-bar" style={{ height: `${pctHeight}%` }} data-value={item.count}></div>
                          <span className="chart-label">{item.month}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="card">
                <h4 style={{ fontWeight: 700, fontSize: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Most Active Job Poster Companies</h4>
                <div className="ranking-list">
                  {topCompanies.length === 0 ? (
                    <p className="text-muted">No postings available.</p>
                  ) : (
                    topCompanies.map(([compName, count]) => (
                      <div key={compName} className="ranking-item">
                        <div className="ranking-meta"><span>{compName}</span><span>{count} Active Jobs</span></div>
                        <div className="ranking-bar-bg">
                          <div className="ranking-bar-fill" style={{ width: `${(count / maxJobsInCompany) * 100}%` }}></div>
                        </div>
                      </div>
                    ))
                  )}
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
          <div className="admin-avatar-placeholder" style={{ width: '3.5rem', height: '3.5rem', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-primary)', color: '#FFF', display: 'flex', alignItems: 'center', justifyName: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700, margin: '0 auto 0.5rem auto' }}>
            A
          </div>
          <h4 style={{ fontWeight: 700 }}>Admin Central</h4>
          <p className="text-muted" style={{ fontSize: '0.8rem' }}>System Administrator</p>
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
