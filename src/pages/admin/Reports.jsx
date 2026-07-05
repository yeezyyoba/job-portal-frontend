// src/pages/admin/Reports.jsx
import React, { useContext } from 'react';
import { DbContext } from '../../context/DbContext';

export default function Reports() {
  const { reports, jobs, updateReportStatus } = useContext(DbContext);

  const getBadgeClass = (status) => {
    switch (status) {
      case 'Resolved':
        return 'badge-success';
      case 'Escalated':
        return 'badge-danger';
      case 'Pending':
      default:
        return 'badge-warning';
    }
  };

  return (
    <div className="dashboard-panel">
      <div className="panel-header">
        <h2>Spam & Complaint Reports</h2>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {reports.length === 0 ? (
          <div className="card text-center" style={{ padding: '3rem' }}>
            No system complaints filed.
          </div>
        ) : (
          reports.map(r => {
            const job = jobs.find(j => j.id === r.jobId);
            return (
              <div key={r.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div className="flex-between">
                  <div>
                    <h4 style={{ fontWeight: 700, fontSize: '1rem' }}>Reason: {r.reason}</h4>
                    <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '0.15rem' }}>Reporter: {r.reporterEmail} &bull; Date: {r.date}</p>
                  </div>
                  <span className={`badge ${getBadgeClass(r.status)}`}>{r.status}</span>
                </div>
                
                <div style={{ backgroundColor: 'var(--color-bg-light)', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
                  <strong>Complaint Log:</strong> {r.details}
                </div>

                <div className="flex-between" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem', fontSize: '0.85rem' }}>
                  <div>
                    Target: <strong>{job ? job.title : 'Deleted Job Listing'}</strong> ({job ? job.company : 'N/A'})
                  </div>
                  
                  {r.status === 'Pending' && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-sm btn-success" onClick={() => updateReportStatus(r.id, 'Resolved')}>Resolve</button>
                      <button className="btn btn-sm btn-outline" onClick={() => updateReportStatus(r.id, 'Dismissed')}>Dismiss</button>
                      <button className="btn btn-sm btn-danger" onClick={() => updateReportStatus(r.id, 'Escalated')}>Escalate</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
