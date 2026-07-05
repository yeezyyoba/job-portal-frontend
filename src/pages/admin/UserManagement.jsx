// src/pages/admin/UserManagement.jsx
import React, { useContext, useState } from 'react';
import { DbContext } from '../../context/DbContext';
import { Trash2 } from 'lucide-react';
import Modal from '../../components/Modal';

export default function UserManagement() {
  const { users, toggleUserSuspension, deleteUser, updateProfile, showToast, currentUser, fetchUsersList, getAuthHeaders } = useContext(DbContext);

  const [showAddModal, setShowAddModal] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const handleEdit = (user) => {
    const currentName = user.role === 'employer' ? user.companyName : user.name;
    const nextName = prompt(`Modify profile name for ${user.email}:`, currentName);
    if (nextName !== null && nextName.trim() !== '') {
      if (user.role === 'employer') {
        updateProfile(user.email, { companyName: nextName });
      } else {
        updateProfile(user.email, { name: nextName });
      }
      showToast("Updated", "User profile updated successfully.", "success");
    }
  };

  const handleDelete = (email) => {
    if (window.confirm(`Are you sure you want to permanently delete user account: ${email}?`)) {
      deleteUser(email);
    }
  };

  const handleCreateAdminSubmit = async (e) => {
    e.preventDefault();
    if (!adminEmail.trim() || !adminName.trim() || !adminPassword.trim()) {
      showToast("Validation Error", "Please fill in all fields.", "error");
      return;
    }

    const apiBase = "http://localhost:5050/api";

    try {
      const res = await fetch(`${apiBase}/admin/users/admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ email: adminEmail.trim(), name: adminName.trim(), password: adminPassword })
      });

      const data = await res.json();
      if (res.ok) {
        showToast("Success", "New administrator account created successfully.", "success");
        await fetchUsersList();
        setShowAddModal(false);
        setAdminEmail('');
        setAdminName('');
        setAdminPassword('');
      } else {
        showToast("Error", data.message || "Failed to create administrator account.", "error");
      }
    } catch (err) {
      showToast("Error", "Could not connect to server.", "error");
    }
  };

  return (
    <div className="dashboard-panel">
      <div className="panel-header">
        <h2>User Accounts Management</h2>
        {currentUser?.role === 'superadmin' && (
          <button className="btn btn-sm btn-primary" onClick={() => setShowAddModal(true)}>+ Add Administrator</button>
        )}
      </div>
      <div className="table-wrapper">
        <table className="portal-table">
          <thead>
            <tr>
              <th>Profile & Role</th>
              <th>Email Address</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => {
              if (u.role === 'superadmin') return null;
              if (u.role === 'admin' && currentUser?.role !== 'superadmin') return null;

              const isSuspended = u.status === 'Suspended';
              return (
                <tr key={u.email}>
                  <td>
                    <div style={{ fontWeight: 700 }}>{u.companyName || u.name || 'Anonymous'}</div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                      {u.role === 'employer' ? 'Employer' : u.role === 'admin' ? 'Administrator' : 'Job Seeker'}
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td>
                    {isSuspended ? (
                      <span className="badge badge-danger">Suspended</span>
                    ) : (
                      <span className="badge badge-success">Active</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-sm btn-outline" onClick={() => handleEdit(u)}>Edit</button>
                      <button 
                        className={`btn btn-sm ${isSuspended ? 'btn-success' : 'btn-warning'} btn-outline`} 
                        onClick={() => toggleUserSuspension(u.email)}
                      >
                        {isSuspended ? 'Activate' : 'Suspend'}
                      </button>
                      <button className="btn btn-sm btn-danger btn-icon" onClick={() => handleDelete(u.email)} title="Delete User">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modern Overlay Form Modal to Add Admin */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Administrator"
      >
        <form onSubmit={handleCreateAdminSubmit}>
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label">Full Name</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="e.g. Jane Doe"
              value={adminName}
              onChange={e => setAdminName(e.target.value)}
              required 
            />
          </div>
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              className="form-control" 
              placeholder="e.g. jane.doe@portal.com"
              value={adminEmail}
              onChange={e => setAdminEmail(e.target.value)}
              required 
            />
          </div>
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-control" 
              placeholder="Enter administrator password"
              value={adminPassword}
              onChange={e => setAdminPassword(e.target.value)}
              required 
            />
          </div>
          <div className="modal-footer" style={{ borderTop: 'none', padding: '1rem 0 0 0', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <button type="button" className="btn btn-outline" onClick={() => setShowAddModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Create Account</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
