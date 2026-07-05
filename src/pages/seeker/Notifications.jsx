// src/pages/seeker/Notifications.jsx
import React, { useContext, useEffect } from 'react';
import { DbContext } from '../../context/DbContext';
import { BellOff } from 'lucide-react';

export default function Notifications() {
  const { currentUser, readNotifications } = useContext(DbContext);

  useEffect(() => {
    readNotifications();
  }, []);

  const notifs = currentUser?.notifications || [];

  return (
    <div className="dashboard-panel">
      <div className="panel-header">
        <h2>Notifications</h2>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {notifs.length === 0 ? (
          <div className="card text-center" style={{ padding: '3rem 1.5rem' }}>
            <BellOff size={48} style={{ color: 'var(--color-text-light)', marginBottom: '1rem', display: 'block', margin: '0 auto 1rem auto' }} />
            <h4 style={{ fontWeight: 700, marginBottom: '0.25rem' }}>All caught up!</h4>
            <p className="text-muted">You have no new notifications.</p>
          </div>
        ) : (
          notifs.map(n => (
            <div key={n.id} className="card" style={{ padding: '1rem', borderLeft: '4px solid var(--color-primary)' }}>
              <div className="flex-between">
                <h4 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.15rem' }}>{n.title}</h4>
                <span className="text-muted" style={{ fontSize: '0.75rem' }}>{n.date}</span>
              </div>
              <p className="text-muted" style={{ fontSize: '0.85rem', margin: 0, marginTop: '0.25rem' }}>{n.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
