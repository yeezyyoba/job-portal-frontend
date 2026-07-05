// src/components/Toast.jsx
import React, { useContext } from 'react';
import { DbContext } from '../context/DbContext';
import { Info, CheckCircle, AlertTriangle, AlertOctagon } from 'lucide-react';

export default function Toast() {
  const { toasts, removeToast } = useContext(DbContext);

  if (toasts.length === 0) return null;

  const renderIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={18} style={{ marginTop: '0.15rem' }} />;
      case 'warning':
        return <AlertTriangle size={18} style={{ marginTop: '0.15rem' }} />;
      case 'error':
        return <AlertOctagon size={18} style={{ marginTop: '0.15rem' }} />;
      default:
        return <Info size={18} style={{ marginTop: '0.15rem' }} />;
    }
  };

  return (
    <div className="toast-container" id="toast-root">
      {toasts.map(toast => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          {renderIcon(toast.type)}
          <div className="toast-content">
            <h4>{toast.title}</h4>
            <p>{toast.message}</p>
          </div>
          <button className="toast-close" onClick={() => removeToast(toast.id)}>&times;</button>
        </div>
      ))}
    </div>
  );
}
