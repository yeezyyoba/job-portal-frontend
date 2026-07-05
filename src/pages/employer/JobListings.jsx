// src/pages/employer/JobListings.jsx
import React, { useContext } from 'react';
import { DbContext } from '../../context/DbContext';
import { Edit3, Power, Trash2 } from 'lucide-react';

export default function JobListings({ setFormOpen, setSelectedJobId }) {
  const { jobs, currentUser, updateJob, deleteJob } = useContext(DbContext);

  const employerJobs = jobs.filter(j => j.company.toLowerCase() === currentUser?.companyName.toLowerCase());

  const handleEdit = (jobId) => {
    setSelectedJobId(jobId);
    setFormOpen(true);
  };

  const handleCreate = () => {
    setSelectedJobId(null);
    setFormOpen(true);
  };

  const handleToggleStatus = (job) => {
    const nextStatus = job.status === 'active' ? 'closed' : 'active';
    updateJob(job.id, { status: nextStatus });
  };

  const handleDelete = (jobId) => {
    if (window.confirm("Are you sure you want to delete this job listing? All application history for this job will be purged.")) {
      deleteJob(jobId);
    }
  };

  return (
    <div className="dashboard-panel">
      <div className="panel-header">
        <h2>My Job Listings</h2>
        <button className="btn btn-primary" onClick={handleCreate}>Post a New Job</button>
      </div>
      <div className="table-wrapper">
        <table className="portal-table">
          <thead>
            <tr>
              <th>Job Title & Info</th>
              <th>Date Posted</th>
              <th>Deadline</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employerJobs.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center text-muted" style={{ padding: '3rem' }}>
                  You haven't posted any jobs yet. Click "Post a New Job" to begin!
                </td>
              </tr>
            ) : (
              employerJobs.map(job => (
                <tr key={job.id}>
                  <td>
                    <h4 style={{ fontWeight: 700, fontSize: '0.95rem', margin: 0 }}>{job.title}</h4>
                    <p className="text-muted" style={{ fontSize: '0.75rem' }}>{job.category} &bull; {job.remoteType}</p>
                  </td>
                  <td>{job.datePosted}</td>
                  <td>{job.deadline}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <div>
                        {job.status === 'active' ? (
                          <span className="badge badge-success">Active</span>
                        ) : (
                          <span className="badge badge-outline">Closed</span>
                        )}
                      </div>
                      <div style={{ marginTop: '0.15rem' }}>
                        {job.approved ? (
                          <span className="badge badge-primary">Approved</span>
                        ) : (
                          <span className="badge badge-warning">Pending Review</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-sm btn-outline" onClick={() => handleEdit(job.id)} title="Edit Job">
                        <Edit3 size={14} />
                      </button>
                      <button 
                        className="btn btn-sm btn-outline" 
                        onClick={() => handleToggleStatus(job)} 
                        title={job.status === 'active' ? 'Close Job' : 'Reopen Job'}
                      >
                        <Power size={14} />
                      </button>
                      <button className="btn btn-sm btn-danger btn-icon" onClick={() => handleDelete(job.id)} title="Delete Listing">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
