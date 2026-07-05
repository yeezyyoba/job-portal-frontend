// src/pages/employer/Interviews.jsx
import React, { useContext } from 'react';
import { DbContext } from '../../context/DbContext';
import { Calendar, Video, MapPin, Link2 } from 'lucide-react';

export default function Interviews() {
  const { interviews, jobs, users, currentUser, cancelInterview } = useContext(DbContext);

  const employerInts = interviews.filter(i => i.employerEmail === currentUser?.email);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to cancel this interview schedule?")) {
      cancelInterview(id);
    }
  };

  return (
    <div className="dashboard-panel">
      <div className="panel-header">
        <h2>Interview Schedules</h2>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {employerInts.length === 0 ? (
          <div className="card text-center" style={{ padding: '3rem 1.5rem' }}>
            <h4 style={{ fontWeight: 700, marginBottom: '0.25rem' }}>No scheduled interviews</h4>
            <p className="text-muted">Shortlist a candidate and schedule a sync through the applicants panel.</p>
          </div>
        ) : (
          employerInts.map(i => {
            const job = jobs.find(jb => jb.id === i.jobId);
            const candidate = users.find(u => u.email === i.seekerEmail);
            return (
              <div key={i.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: '4px solid var(--color-primary)' }}>
                <div className="flex-between">
                  <div>
                    <h3 style={{ fontWeight: 700, fontSize: '1.1rem', margin: 0 }}>Interview with {candidate ? candidate.name : i.seekerEmail}</h3>
                    <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.15rem' }}>Job: {job ? job.title : 'Deleted Position'}</p>
                  </div>
                  <button className="btn btn-sm btn-danger btn-outline" onClick={() => handleDelete(i.id)}>Cancel Schedule</button>
                </div>
                
                <div className="job-meta-row" style={{ margin: 0, padding: '0.75rem 0 0 0' }}>
                  <div className="job-meta-item">
                    <Calendar size={14} />
                    <span>{i.dateTime.replace('T', ' at ')}</span>
                  </div>
                  <div className="job-meta-item" style={{ marginLeft: '1rem' }}>
                    <Video size={14} />
                    <span>{i.format}</span>
                  </div>
                  {i.link && (
                    <div className="job-meta-item" style={{ marginLeft: '1rem' }}>
                      <Link2 size={14} />
                      <a href={i.link} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Join Meeting</a>
                    </div>
                  )}
                  {i.location && (
                    <div className="job-meta-item" style={{ marginLeft: '1rem' }}>
                      <MapPin size={14} />
                      <span>{i.location}</span>
                    </div>
                  )}
                </div>

                {i.notes && (
                  <div style={{ backgroundColor: 'var(--color-bg-light)', borderRadius: 'var(--radius-md)', padding: '0.75rem', fontSize: '0.85rem' }}>
                    <strong>Recruiter Notes:</strong> {i.notes}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
