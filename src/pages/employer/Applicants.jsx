// src/pages/employer/Applicants.jsx
import React, { useContext, useState } from 'react';
import { DbContext } from '../../context/DbContext';
import { ChevronDown, Search } from 'lucide-react';
import Modal from '../../components/Modal';

export default function Applicants({ setInterviewOpen, setSelectedAppId }) {
  const { applications, jobs, users, currentUser, updateApplicationStatus, showToast, API_BASE } = useContext(DbContext);
  const [filterJobId, setFilterJobId] = useState('');
  const [searchName, setSearchName] = useState('');
  const [activeDropdownId, setActiveDropdownId] = useState(null);

  const [viewOpen, setViewOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);

  // Get employer's jobs
  const employerJobs = jobs.filter(j => j.company.toLowerCase() === currentUser?.companyName.toLowerCase());
  const employerJobIds = employerJobs.map(j => j.id);

  // Filter application entries
  const employerApps = applications.filter(a => employerJobIds.includes(a.jobId));

  const filteredApps = employerApps.filter(app => {
    const matchesJob = filterJobId === '' || app.jobId === filterJobId;
    const matchesSearch = searchName === '' || (app.candidateName || '').toLowerCase().includes(searchName.toLowerCase());

    return matchesJob && matchesSearch;
  });

  const getBadgeClass = (status) => {
    switch (status) {
      case 'Accepted':
        return 'badge-success';
      case 'Rejected':
        return 'badge-danger';
      case 'Under Review':
      case 'Shortlisted':
      case 'Interview Scheduled':
        return 'badge-warning';
      default:
        return 'badge-primary';
    }
  };

  const handleAction = (appId, status) => {
    updateApplicationStatus(appId, status);
    setActiveDropdownId(null);
  };

  const handleOpenInterview = (appId) => {
    setSelectedAppId(appId);
    setInterviewOpen(true);
    setActiveDropdownId(null);
  };

  const viewCoverLetter = (app) => {
    setSelectedApp(app);
    setViewOpen(true);
  };

  return (
    <div className="dashboard-panel">
      <div className="panel-header">
        <h2>Manage Applicants</h2>
      </div>

      <div className="card" style={{ padding: '0.75rem', display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexDirection: 'row' }}>
        <div style={{ flex: 1, display: 'flex', gap: '0.5rem' }}>
          <select 
            className="form-control" 
            value={filterJobId} 
            onChange={e => setFilterJobId(e.target.value)} 
            style={{ maxWidth: '250px' }}
          >
            <option value="">All Job Posts</option>
            {employerJobs.map(j => (
              <option key={j.id} value={j.id}>{j.title}</option>
            ))}
          </select>
          <div className="search-input-wrapper" style={{ flex: 1, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-bg-light)' }}>
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search applicant name..." 
              value={searchName} 
              onChange={e => setSearchName(e.target.value)} 
            />
          </div>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="portal-table">
          <thead>
            <tr>
              <th>Candidate Details</th>
              <th>Applied Job</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredApps.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center text-muted" style={{ padding: '3rem' }}>
                  No applications match your search query.
                </td>
              </tr>
            ) : (
              filteredApps.map(app => {
                const job = jobs.find(j => j.id === app.jobId);
                if (!job) return null;

                return (
                  <tr key={app.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img 
                          src={app.candidatePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&q=80'} 
                          className="profile-avatar-large" 
                          style={{ width: '2.25rem', height: '2.25rem' }} 
                          alt=""
                        />
                        <div>
                          <h4 style={{ fontWeight: 700, fontSize: '0.9rem', margin: 0 }}>{app.candidateName || 'Unknown Candidate'}</h4>
                          <p className="text-muted" style={{ fontSize: '0.75rem' }}>{app.seekerEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <h5 style={{ fontWeight: 600, fontSize: '0.85rem', margin: 0 }}>{job.title}</h5>
                      <p className="text-muted" style={{ fontSize: '0.75rem' }}>Applied: {app.appliedDate}</p>
                    </td>
                    <td><span className={`badge ${getBadgeClass(app.status)}`}>{app.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem', position: 'relative' }}>
                        <button className="btn btn-sm btn-outline" onClick={() => viewCoverLetter(app)}>Resume</button>
                        <div className="dropdown-action-wrapper">
                          <button 
                            className="btn btn-sm btn-secondary" 
                            onClick={() => setActiveDropdownId(activeDropdownId === app.id ? null : app.id)}
                          >
                            Action <ChevronDown size={12} />
                          </button>
                          {activeDropdownId === app.id && (
                            <div className="card dropdown-content" style={{ display: 'flex' }}>
                              <button className="btn btn-sm btn-outline" style={{ justifyContent: 'flex-start' }} onClick={() => handleAction(app.id, 'Under Review')}>Under Review</button>
                              <button className="btn btn-sm btn-outline" style={{ justifyContent: 'flex-start' }} onClick={() => handleAction(app.id, 'Shortlisted')}>Shortlist</button>
                              <button className="btn btn-sm btn-outline" style={{ justifyContent: 'flex-start' }} onClick={() => handleOpenInterview(app.id)}>Schedule Interview</button>
                              <button className="btn btn-sm btn-success" style={{ justifyContent: 'flex-start' }} onClick={() => handleAction(app.id, 'Accepted')}>Accept Applicant</button>
                              <button className="btn btn-sm btn-danger" style={{ justifyContent: 'flex-start' }} onClick={() => handleAction(app.id, 'Rejected')}>Reject Applicant</button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {selectedApp && (
        <Modal
          isOpen={viewOpen}
          onClose={() => {
            setViewOpen(false);
            setSelectedApp(null);
          }}
          title="Application Details"
        >
          <div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
              <img 
                src={selectedApp.candidatePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&q=80'} 
                className="profile-avatar-large" 
                style={{ width: '3.5rem', height: '3.5rem' }} 
                alt=""
              />
              <div>
                <h4 style={{ fontWeight: 800, fontSize: '1.15rem', margin: 0 }}>{selectedApp.candidateName || 'Unknown Candidate'}</h4>
                <p className="text-muted" style={{ fontSize: '0.85rem', margin: 0 }}>{selectedApp.seekerEmail}</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', backgroundColor: 'var(--color-bg-light)', borderRadius: 'var(--radius-lg)', padding: '1rem', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
              <div><strong>Applied Job:</strong><br />{jobs.find(j => j.id === selectedApp.jobId)?.title || 'Job Post'}</div>
              <div><strong>Applied Date:</strong><br />{selectedApp.appliedDate}</div>
              <div><strong>Status:</strong><br /><span className={`badge ${getBadgeClass(selectedApp.status)}`}>{selectedApp.status}</span></div>
              <div><strong>Resume / CV Name:</strong><br />{selectedApp.resumeName}</div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h5 style={{ fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-primary)' }}>Cover Letter</h5>
              <div style={{ 
                fontSize: '0.9rem', 
                lineHeight: 1.6, 
                backgroundColor: 'var(--color-bg-light)', 
                padding: '1rem', 
                borderRadius: 'var(--radius-md)', 
                borderLeft: '4px solid var(--color-primary)',
                whiteSpace: 'pre-wrap'
              }}>
                {selectedApp.coverLetter}
              </div>
            </div>
          </div>

          <div className="modal-footer" style={{ borderTop: 'none', padding: 0, gap: '0.5rem', marginTop: '1.5rem' }}>
            {selectedApp.resumeName && (
              <button 
                type="button"
                className="btn btn-primary" 
                onClick={() => {
                  const fileUrl = `${API_BASE.replace('/api', '')}/resumes/${selectedApp.resumeName}`;
                  window.open(fileUrl, '_blank');
                }}
              >
                Open CV / Resume
              </button>
            )}
            <button 
              type="button" 
              className="btn btn-outline" 
              onClick={() => {
                setViewOpen(false);
                setSelectedApp(null);
              }}
            >
              Close
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
