// src/pages/admin/Verification.jsx
import React, { useContext } from 'react';
import { DbContext } from '../../context/DbContext';
import { CheckCircle, AlertCircle } from 'lucide-react';

export default function Verification() {
  const { users, verifyEmployer } = useContext(DbContext);

  const employers = users.filter(u => u.role === 'employer');

  return (
    <div className="dashboard-panel">
      <div className="panel-header">
        <h2>Company Profile Verification</h2>
      </div>
      <div className="table-wrapper">
        <table className="portal-table">
          <thead>
            <tr>
              <th>Company & Brand</th>
              <th>Industry</th>
              <th>Verification</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employers.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center text-muted" style={{ padding: '3rem' }}>
                  No employers registered on database.
                </td>
              </tr>
            ) : (
              employers.map(emp => (
                <tr key={emp.email}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img 
                        src={emp.logo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop&q=80'} 
                        style={{ width: '2rem', height: '2rem', borderRadius: 'var(--radius-sm)' }} 
                        alt=""
                      />
                      <div>
                        <h4 style={{ fontWeight: 700, fontSize: '0.9rem', margin: 0 }}>{emp.companyName}</h4>
                        <a href={emp.website} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', fontSize: '0.75rem' }}>{emp.website}</a>
                      </div>
                    </div>
                  </td>
                  <td>{emp.industry}</td>
                  <td>
                    {emp.verified ? (
                      <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                        <CheckCircle size={10} /> Verified
                      </span>
                    ) : (
                      <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                        <AlertCircle size={10} /> Pending
                      </span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {!emp.verified ? (
                        <>
                          <button className="btn btn-sm btn-success" onClick={() => verifyEmployer(emp.email, true)}>Verify</button>
                          <button className="btn btn-sm btn-danger btn-outline" onClick={() => verifyEmployer(emp.email, false)}>Reject</button>
                        </>
                      ) : (
                        <button className="btn btn-sm btn-warning btn-outline" onClick={() => verifyEmployer(emp.email, false)}>Revoke Status</button>
                      )}
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
