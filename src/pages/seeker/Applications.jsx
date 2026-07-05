// src/pages/seeker/Applications.jsx
import React, { useContext } from 'react';
import { DbContext } from '../../context/DbContext';

export default function Applications({ setSelectedJobId, setDetailsOpen }) {
  const { applications, jobs, currentUser, withdrawApplication } = useContext(DbContext);

  const seekerApps = applications.filter(a => a.seekerEmail === currentUser?.email);

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

  const handleViewJob = (jobId) => {
    setSelectedJobId(jobId);
    setDetailsOpen(true);
  };

  const handleWithdraw = (appId) => {
    if (window.confirm("Are you sure you want to withdraw this application? This action cannot be undone.")) {
      withdrawApplication(appId);
    }
  };

  return (
    <div className="dashboard-panel">
      <div className="panel-header">
        <h2>My Applications</h2>
      </div>
      <div className="table-wrapper">
        <table className="portal-table">
          <thead>
            <tr>
              <th>Job & Company</th>
              <th>Date Applied</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {seekerApps.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center text-muted" style={{ padding: '3rem' }}>
                  You haven't applied for any jobs yet. Start searching on the Search Jobs tab!
                </td>
              </tr>
            ) : (
              seekerApps.map(app => {
                const job = jobs.find(j => j.id === app.jobId);
                if (!job) return null;
                return (
                  <tr key={app.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img src={job.companyLogo} className="job-logo" style={{ width: '2.25rem', height: '2.25rem' }} alt="" />
                        <div>
                          <h4 style={{ fontWeight: 700, fontSize: '0.9rem' }}>{job.title}</h4>
                          <p className="text-muted" style={{ fontSize: '0.75rem' }}>{job.company}</p>
                        </div>
                      </div>
                    </td>
                    <td>{app.appliedDate}</td>
                    <td><span className={`badge ${getBadgeClass(app.status)}`}>{app.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-sm btn-outline" onClick={() => handleViewJob(job.id)}>View Job</button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleWithdraw(app.id)}>Withdraw</button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
