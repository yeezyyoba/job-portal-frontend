// src/pages/admin/JobModeration.jsx
import React, { useContext } from 'react';
import { DbContext } from '../../context/DbContext';
import { Trash2 } from 'lucide-react';

export default function JobModeration({ setSelectedJobId, setDetailsOpen }) {
  const { jobs, approveJob, deleteJob } = useContext(DbContext);

  const handlePreview = (jobId) => {
    setSelectedJobId(jobId);
    setDetailsOpen(true);
  };

  const handleDelete = (jobId) => {
    if (window.confirm("Are you sure you want to permanently delete this job listing?")) {
      deleteJob(jobId);
    }
  };

  return (
    <div className="dashboard-panel">
      <div className="panel-header">
        <h2>Job Board Moderation</h2>
      </div>
      <div className="table-wrapper">
        <table className="portal-table">
          <thead>
            <tr>
              <th>Listing Info</th>
              <th>Posted Date</th>
              <th>Approval</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center text-muted" style={{ padding: '3rem' }}>
                  No jobs registered on database.
                </td>
              </tr>
            ) : (
              jobs.map(job => (
                <tr key={job.id}>
                  <td>
                    <div style={{ fontWeight: 700 }}>{job.title}</div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>{job.company} &bull; {job.category}</div>
                  </td>
                  <td>{job.datePosted}</td>
                  <td>
                    {job.approved ? (
                      <span className="badge badge-success">Approved</span>
                    ) : (
                      <span className="badge badge-warning">Pending Approval</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {!job.approved ? (
                        <>
                          <button className="btn btn-sm btn-success" onClick={() => approveJob(job.id, true)}>Approve</button>
                          <button className="btn btn-sm btn-danger" onClick={() => approveJob(job.id, false)}>Reject</button>
                        </>
                      ) : (
                        <button className="btn btn-sm btn-warning btn-outline" onClick={() => approveJob(job.id, false)}>Revoke Approval</button>
                      )}
                      <button className="btn btn-sm btn-outline" onClick={() => handlePreview(job.id)}>Preview</button>
                      <button className="btn btn-sm btn-danger btn-icon" onClick={() => handleDelete(job.id)} title="Delete Job">
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
