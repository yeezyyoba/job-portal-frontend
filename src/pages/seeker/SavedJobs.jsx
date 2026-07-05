// src/pages/seeker/SavedJobs.jsx
import React, { useContext } from 'react';
import { DbContext } from '../../context/DbContext';
import { Trash2 } from 'lucide-react';

export default function SavedJobs({ setSelectedJobId, setDetailsOpen }) {
  const { currentUser, jobs, toggleSaveJob } = useContext(DbContext);

  const savedIds = currentUser?.savedJobs || [];
  const bookmarkedJobs = jobs.filter(j => savedIds.includes(j.id));

  const handleApplyNow = (jobId) => {
    setSelectedJobId(jobId);
    setDetailsOpen(true);
  };

  return (
    <div className="dashboard-panel">
      <div className="panel-header">
        <h2>Saved Jobs</h2>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {bookmarkedJobs.length === 0 ? (
          <div className="card text-center" style={{ padding: '3rem 1.5rem' }}>
            <h4 style={{ fontWeight: 700, marginBottom: '0.25rem' }}>No saved jobs</h4>
            <p class="text-muted">Save jobs from the search results to review them later.</p>
          </div>
        ) : (
          bookmarkedJobs.map(job => (
            <div key={job.id} className="card card-hover flex-between" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <img src={job.companyLogo} className="job-logo" alt="" />
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: '1.05rem' }}>{job.title}</h3>
                  <p className="text-muted" style={{ fontSize: '0.85rem' }}>{job.company} &bull; {job.location} &bull; {job.remoteType}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  className="btn btn-sm btn-danger btn-icon" 
                  onClick={() => toggleSaveJob(job.id)}
                  title="Remove Bookmark"
                >
                  <Trash2 size={14} />
                </button>
                <button className="btn btn-sm btn-primary" onClick={() => handleApplyNow(job.id)}>Apply Now</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
