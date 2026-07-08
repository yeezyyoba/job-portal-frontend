// src/context/DbContext.jsx
import React, { createContext, useState, useEffect } from 'react';

export const DbContext = createContext();

const API_BASE = "http://localhost:5050/api"; // Matches the backend server port

export const DbProvider = ({ children }) => {
  const [jobs, setJobs] = useState([]);
  const [users, setUsers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [reports, setReports] = useState([]);
  const [settings, setSettings] = useState({
    siteName: "IE-JobPortal",
    emailSettings: {},
    notificationSettings: {},
    configurations: {}
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [activeRole, setActiveRoleState] = useState(null);

  const setActiveRole = (role) => {
    localStorage.setItem('active_role', role);
    setActiveRoleState(role);
  };

  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper: Request options with auth token
  const getAuthHeaders = () => {
    const token = localStorage.getItem("job_portal_token");
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  // Helper: show toast messages
  const showToast = (title, message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // 1. Fetch public jobs list (and employer's own jobs if applicable)
  const fetchJobs = async () => {
    try {
      const isAdminOrSuper = currentUser?.role === 'admin' || currentUser?.role === 'superadmin';
      const isEmployer = activeRole === 'employer';
      const url = isAdminOrSuper ? `${API_BASE}/admin/jobs` : `${API_BASE}/jobs`;
      const headers = isAdminOrSuper ? getAuthHeaders() : {};
      
      const res = await fetch(url, { headers });
      if (res.ok) {
        let data = await res.json();

        // For employers, also fetch their own jobs (including unapproved/closed)
        // and merge them into the list so they can see pending approval status
        if (isEmployer) {
          try {
            const myRes = await fetch(`${API_BASE}/jobs/my-listings`, { headers: getAuthHeaders() });
            if (myRes.ok) {
              const myJobs = await myRes.json();
              // Merge: add employer's jobs that aren't already in the public list
              const publicIds = new Set(data.map(j => j.id));
              const extraJobs = myJobs.filter(j => !publicIds.has(j.id));
              data = [...data, ...extraJobs];
            }
          } catch (e) {
            console.error("Failed to fetch employer's own jobs:", e);
          }
        }

        setJobs(data);
      }
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
    }
  };

  // 2. Fetch public configuration settings
  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/settings`);
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (err) {
      console.error("Failed to fetch settings:", err);
    }
  };

  // 3. Fetch user session and user-specific collections
  const fetchSession = async () => {
    const token = localStorage.getItem("job_portal_token");
    if (!token) {
      setCurrentUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const user = await res.json();
        setCurrentUser(user);

        // Resolve activeRole
        let resolvedRole = user.role;
        if (user.role === 'both') {
          resolvedRole = localStorage.getItem('active_role') || 'seeker';
        }
        setActiveRoleState(resolvedRole);

        // Fetch collections based on user roles
        const isSeekerOrEmployer = user.role === 'seeker' || user.role === 'employer' || user.role === 'both';
        if (isSeekerOrEmployer) {
          // Fetch applications
          const resApps = await fetch(`${API_BASE}/applications?role=${resolvedRole}`, { headers: { 'Authorization': `Bearer ${token}` } });
          if (resApps.ok) setApplications(await resApps.json());

          // Fetch interviews
          const resInts = await fetch(`${API_BASE}/interviews?role=${resolvedRole}`, { headers: { 'Authorization': `Bearer ${token}` } });
          if (resInts.ok) setInterviews(await resInts.json());
        } else if (user.role === 'admin' || user.role === 'superadmin') {
          // Fetch users list
          const resUsers = await fetch(`${API_BASE}/admin/users`, { headers: { 'Authorization': `Bearer ${token}` } });
          if (resUsers.ok) setUsers(await resUsers.json());

          // Fetch spam reports list
          const resReps = await fetch(`${API_BASE}/admin/reports`, { headers: { 'Authorization': `Bearer ${token}` } });
          if (resReps.ok) setReports(await resReps.json());
        }
      } else {
        // Token invalid/expired
        localStorage.removeItem("job_portal_token");
        setCurrentUser(null);
      }
    } catch (err) {
      console.error("Failed to load active session profile:", err);
    } finally {
      setLoading(false);
    }
  };

  // Sync collections whenever activeRole changes
  useEffect(() => {
    const refetchUserData = async () => {
      const token = localStorage.getItem("job_portal_token");
      if (!token || !currentUser || !activeRole) return;

      const isSeekerOrEmployer = currentUser.role === 'seeker' || currentUser.role === 'employer' || currentUser.role === 'both';
      if (isSeekerOrEmployer) {
        const resApps = await fetch(`${API_BASE}/applications?role=${activeRole}`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (resApps.ok) setApplications(await resApps.json());

        const resInts = await fetch(`${API_BASE}/interviews?role=${activeRole}`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (resInts.ok) setInterviews(await resInts.json());
      }
    };
    refetchUserData();
  }, [activeRole, currentUser]);

  // Init fetches
  useEffect(() => {
    const initFetch = async () => {
      await fetchSettings();
      await fetchSession();
    };
    initFetch();
  }, []);

  // Sync jobs list whenever user authentication changes (e.g. admin logs in)
  useEffect(() => {
    fetchJobs();
  }, [currentUser]);

  // Auth Operations
  const loginUser = async (email, password) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("job_portal_token", data.token);
        await fetchSession();
        showToast("Welcome Back", `Successfully logged in as ${email}.`, "success");
        return data;
      } else {
        if (res.status === 403 && data.verificationRequired) {
          showToast("Verification Required", data.message, "warning");
          return data;
        }
        showToast("Login Failed", data.message || "Invalid credentials", "error");
        return false;
      }
    } catch (err) {
      showToast("Server Offline", "Could not connect to authentication services.", "error");
      return false;
    }
  };

  const requestResetCode = async (email) => {
    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      if (res.ok) {
        showToast("Code Sent", data.message || "Password reset code sent to your email.", "success");
        return true;
      } else {
        showToast("Error", data.message || "Failed to send reset code.", "error");
        return false;
      }
    } catch (err) {
      showToast("Server Offline", "Could not connect to authentication services.", "error");
      return false;
    }
  };

  const verifyResetCode = async (email, code) => {
    try {
      const res = await fetch(`${API_BASE}/auth/verify-reset-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });

      const data = await res.json();
      if (res.ok) {
        showToast("Code Verified", "Verification code is correct.", "success");
        return true;
      } else {
        showToast("Error", data.message || "Invalid verification code.", "error");
        return false;
      }
    } catch (err) {
      showToast("Server Offline", "Could not connect to authentication services.", "error");
      return false;
    }
  };

  const resetPassword = async (email, code, newPassword) => {
    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword })
      });

      const data = await res.json();
      if (res.ok) {
        showToast("Password Reset", "Your password has been reset successfully.", "success");
        return true;
      } else {
        showToast("Error", data.message || "Failed to reset password.", "error");
        return false;
      }
    } catch (err) {
      showToast("Server Offline", "Could not connect to authentication services.", "error");
      return false;
    }
  };

  const logoutUser = () => {
    localStorage.removeItem("job_portal_token");
    setCurrentUser(null);
    setApplications([]);
    setInterviews([]);
    setReports([]);
    setUsers([]);
    showToast("Logged Out", "Session ended.", "info");
  };

  const registerUser = async (userFields) => {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userFields)
      });

      const data = await res.json();
      if (res.ok) {
        if (data.verificationRequired) {
          showToast("Verification Required", data.message, "warning");
          return data;
        }
        localStorage.setItem("job_portal_token", data.token);
        await fetchSession();
        showToast("Account Created", "Successfully registered on JobPortal.", "success");
        return true;
      } else {
        showToast("Registration Failed", data.message || "Failed to create account", "error");
        return false;
      }
    } catch (err) {
      showToast("Server Offline", "Could not connect to authentication services.", "error");
      return false;
    }
  };

  const verifyUserEmail = async (email, code) => {
    try {
      const res = await fetch(`${API_BASE}/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("job_portal_token", data.token);
        await fetchSession();
        showToast("Email Verified", "Your account has been successfully verified!", "success");
        return { success: true, role: data.role };
      } else {
        showToast("Verification Failed", data.message || "Invalid or expired code", "error");
        return { success: false };
      }
    } catch (err) {
      showToast("Server Error", "Could not complete verification request.", "error");
      return { success: false };
    }
  };

  const resendVerificationCode = async (email) => {
    try {
      const res = await fetch(`${API_BASE}/auth/resend-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      if (res.ok) {
        showToast("Code Sent", "A new verification code has been sent to your email.", "success");
        return true;
      } else {
        showToast("Failed to resend", data.message || "Could not resend verification code", "error");
        return false;
      }
    } catch (err) {
      showToast("Server Error", "Could not resend verification code.", "error");
      return false;
    }
  };

  const updateProfile = async (email, updatedFields) => {
    try {
      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(updatedFields)
      });

      const data = await res.json();
      if (res.ok) {
        setCurrentUser(data);
        showToast("Success", "Profile updated successfully.", "success");
        if (currentUser?.role === 'admin' || currentUser?.role === 'superadmin') {
          // Refresh user list
          const resUsers = await fetch(`${API_BASE}/admin/users`, { headers: getAuthHeaders() });
          if (resUsers.ok) setUsers(await resUsers.json());
        }
        return true;
      } else {
        showToast("Error", data.message || "Failed to update profile", "error");
        return false;
      }
    } catch (err) {
      showToast("Error", "Could not save profile details.", "error");
      return false;
    }
  };
  const fetchUsersList = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/users`, { headers: getAuthHeaders() });
      if (res.ok) setUsers(await res.json());
    } catch (e) {
      console.error("Failed to fetch users list", e);
    }
  };

  // Job Operations
  const addJob = async (jobFields) => {
    try {
      const res = await fetch(`${API_BASE}/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(jobFields)
      });

      const data = await res.json();
      if (res.ok) {
        await fetchJobs();
        if (settings.configurations.autoApproveJobs) {
          showToast("Success", "New job listing published.", "success");
        } else {
          showToast("Listing Submitted", "Job post waiting for Admin approval.", "warning");
        }
        return true;
      } else {
        showToast("Error", data.message || "Failed to publish job", "error");
        return false;
      }
    } catch (err) {
      showToast("Error", "Server error, failed to post job.", "error");
      return false;
    }
  };

  const updateJob = async (id, updatedFields) => {
    try {
      const res = await fetch(`${API_BASE}/jobs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(updatedFields)
      });

      const data = await res.json();
      if (res.ok) {
        await fetchJobs();
        showToast("Updated", "Job listing details saved.", "success");
        return true;
      } else {
        showToast("Error", data.message || "Failed to save listing changes", "error");
        return false;
      }
    } catch (err) {
      showToast("Error", "Could not save listing changes.", "error");
      return false;
    }
  };

  const deleteJob = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/jobs/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      const data = await res.json();
      if (res.ok) {
        await fetchJobs();
        // Refresh application lists
        const resApps = await fetch(`${API_BASE}/applications?role=${activeRole}`, { headers: getAuthHeaders() });
        if (resApps.ok) setApplications(await resApps.json());
        
        showToast("Listing Deleted", "Job deleted from database.", "warning");
        return true;
      } else {
        showToast("Error", data.message || "Failed to delete job", "error");
        return false;
      }
    } catch (err) {
      showToast("Error", "Could not remove job listing.", "error");
      return false;
    }
  };

  // Application Operations
  const addApplication = async (jobId, coverLetter) => {
    try {
      const res = await fetch(`${API_BASE}/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ jobId, coverLetter })
      });

      const data = await res.json();
      if (res.ok) {
        // Refresh application lists
        const resApps = await fetch(`${API_BASE}/applications?role=${activeRole}`, { headers: getAuthHeaders() });
        if (resApps.ok) setApplications(await resApps.json());
        showToast("Application Submitted", "Resume forwarded to recruitment panel.", "success");
        return true;
      } else {
        showToast("Error", data.message || "Failed to submit application", "error");
        return false;
      }
    } catch (err) {
      showToast("Error", "Could not submit application.", "error");
      return false;
    }
  };

  const updateApplicationStatus = async (appId, status) => {
    try {
      const res = await fetch(`${API_BASE}/applications/${appId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ status })
      });

      const data = await res.json();
      if (res.ok) {
        // Refresh applications
        const resApps = await fetch(`${API_BASE}/applications?role=${activeRole}`, { headers: getAuthHeaders() });
        if (resApps.ok) setApplications(await resApps.json());
        showToast("Status Updated", `Candidate marked as ${status}.`, "success");
        return true;
      } else {
        showToast("Error", data.message || "Failed to update status", "error");
        return false;
      }
    } catch (err) {
      showToast("Error", "Could not change applicant status.", "error");
      return false;
    }
  };

  const withdrawApplication = async (appId) => {
    try {
      const res = await fetch(`${API_BASE}/applications/${appId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      const data = await res.json();
      if (res.ok) {
        setApplications(prev => prev.filter(a => a.id !== appId));
        showToast("Withdrawn", "Application cancelled.", "warning");
        return true;
      } else {
        showToast("Error", data.message || "Failed to withdraw application", "error");
        return false;
      }
    } catch (err) {
      showToast("Error", "Could not withdraw application.", "error");
      return false;
    }
  };

  // Saved Jobs
  const toggleSaveJob = async (jobId) => {
    if (!currentUser) return;
    const saved = currentUser.savedJobs || [];
    let updatedSaved;
    if (saved.includes(jobId)) {
      updatedSaved = saved.filter(id => id !== jobId);
    } else {
      updatedSaved = [...saved, jobId];
    }

    // Optimistically update UI immediately
    setCurrentUser(prev => ({ ...prev, savedJobs: updatedSaved }));

    try {
      const res = await fetch(`${API_BASE}/auth/saved-jobs`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ savedJobs: updatedSaved })
      });

      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data);
        if (saved.includes(jobId)) {
          showToast("Bookmark Removed", "Listing removed from saved list.", "info");
        } else {
          showToast("Bookmark Saved", "Listing saved to dashboard bookmarks.", "success");
        }
      } else {
        // Revert on failure
        setCurrentUser(prev => ({ ...prev, savedJobs: saved }));
        showToast("Error", "Failed to update saved jobs.", "error");
      }
    } catch (err) {
      // Revert on failure
      setCurrentUser(prev => ({ ...prev, savedJobs: saved }));
      showToast("Error", "Could not update saved jobs.", "error");
    }
  };

  // Interview Operations
  const scheduleInterview = async (appId, dateTime, format, link, location, notes) => {
    try {
      const res = await fetch(`${API_BASE}/interviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ applicationId: appId, dateTime, format, link, location, notes })
      });

      const data = await res.json();
      if (res.ok) {
        // Refresh interviews
        const resInts = await fetch(`${API_BASE}/interviews`, { headers: getAuthHeaders() });
        if (resInts.ok) setInterviews(await resInts.json());

        // Refresh applications status (since it changes to Interview Scheduled)
        const resApps = await fetch(`${API_BASE}/applications?role=${activeRole}`, { headers: getAuthHeaders() });
        if (resApps.ok) setApplications(await resApps.json());

        showToast("Coordination Logged", "Candidate notified of interview details.", "success");
        return true;
      } else {
        showToast("Error", data.message || "Failed to schedule interview", "error");
        return false;
      }
    } catch (err) {
      showToast("Error", "Could not coordination schedules.", "error");
      return false;
    }
  };

  const cancelInterview = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/interviews/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      const data = await res.json();
      if (res.ok) {
        setInterviews(prev => prev.filter(i => i.id !== id));
        showToast("Interview Cancelled", "Schedule cleared from database.", "warning");
        return true;
      } else {
        showToast("Error", data.message || "Failed to cancel interview", "error");
        return false;
      }
    } catch (err) {
      showToast("Error", "Could not remove interview calendar slot.", "error");
      return false;
    }
  };

  // Moderation / Reports Complaints
  const addReport = async (jobId, reason, details) => {
    try {
      const res = await fetch(`${API_BASE}/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ jobId, reason, details })
      });

      const data = await res.json();
      if (res.ok) {
        showToast("Report Submitted", "Complaint logged. Administrators will review.", "warning");
        return true;
      } else {
        showToast("Error", data.message || "Failed to file report", "error");
        return false;
      }
    } catch (err) {
      showToast("Error", "Could not log complaint ticket.", "error");
      return false;
    }
  };

  const updateReportStatus = async (id, status) => {
    try {
      const res = await fetch(`${API_BASE}/admin/reports/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ status })
      });

      const data = await res.json();
      if (res.ok) {
        // Refresh reports list
        const resReps = await fetch(`${API_BASE}/admin/reports`, { headers: getAuthHeaders() });
        if (resReps.ok) setReports(await resReps.json());
        showToast("Ticket Updated", `Report status set to ${status}.`, "success");
        return true;
      } else {
        showToast("Error", data.message || "Failed to resolve report", "error");
        return false;
      }
    } catch (err) {
      showToast("Error", "Could not resolve complaint ticket.", "error");
      return false;
    }
  };

  // Administrative Moderation Overrides
  const toggleUserSuspension = async (email) => {
    try {
      const res = await fetch(`${API_BASE}/admin/users/${email}/status`, {
        method: 'PUT',
        headers: getAuthHeaders()
      });

      const data = await res.json();
      if (res.ok) {
        // Refresh users list
        const resUsers = await fetch(`${API_BASE}/admin/users`, { headers: getAuthHeaders() });
        if (resUsers.ok) setUsers(await resUsers.json());
        showToast("Moderation Action", data.message || "User status updated.", "success");
        return true;
      } else {
        showToast("Error", data.message || "Failed to change user status", "error");
        return false;
      }
    } catch (err) {
      showToast("Error", "Could not change user account status.", "error");
      return false;
    }
  };

  const deleteUser = async (email) => {
    try {
      const res = await fetch(`${API_BASE}/admin/users/${email}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      const data = await res.json();
      if (res.ok) {
        setUsers(prev => prev.filter(u => u.email !== email));
        showToast("User Purged", "Account deleted from system database.", "warning");
        return true;
      } else {
        showToast("Error", data.message || "Failed to delete user", "error");
        return false;
      }
    } catch (err) {
      showToast("Error", "Could not delete user account.", "error");
      return false;
    }
  };

  const approveJob = async (jobId, isApproved) => {
    try {
      const res = await fetch(`${API_BASE}/admin/jobs/${jobId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ approved: isApproved })
      });

      const data = await res.json();
      if (res.ok) {
        await fetchJobs();
        showToast(isApproved ? "Approved" : "Rejected", `Listing moderation checks complete.`, "success");
        return true;
      } else {
        showToast("Error", data.message || "Failed to moderate job", "error");
        return false;
      }
    } catch (err) {
      showToast("Error", "Could not submit job approval status.", "error");
      return false;
    }
  };

  const verifyEmployer = async (email, isVerified) => {
    try {
      const res = await fetch(`${API_BASE}/admin/verification/${email}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ verified: isVerified })
      });

      const data = await res.json();
      if (res.ok) {
        // Refresh users list
        const resUsers = await fetch(`${API_BASE}/admin/users`, { headers: getAuthHeaders() });
        if (resUsers.ok) setUsers(await resUsers.json());
        showToast("Verification Saved", `Employer status updated.`, "success");
        return true;
      } else {
        showToast("Error", data.message || "Failed to toggle verification", "error");
        return false;
      }
    } catch (err) {
      showToast("Error", "Could not save verification status.", "error");
      return false;
    }
  };

  const saveSettings = async (newSettings) => {
    try {
      const res = await fetch(`${API_BASE}/admin/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(newSettings)
      });

      const data = await res.json();
      if (res.ok) {
        await fetchSettings();
        showToast("Settings Saved", "System config modifications saved.", "success");
        return true;
      } else {
        showToast("Error", data.message || "Failed to update configurations", "error");
        return false;
      }
    } catch (err) {
      showToast("Error", "Could not update portal settings.", "error");
      return false;
    }
  };

  const resetDatabase = () => {
    showToast("Action Restrained", "Database resets are disabled on PostgreSQL environments.", "warning");
  };

  const readNotifications = async () => {
    if (!currentUser) return;
    const notifs = currentUser.notifications || [];
    if (notifs.every(n => n.read)) return; // already all read

    // Optimistically update UI
    const readNotifs = notifs.map(n => ({ ...n, read: true }));
    setCurrentUser(prev => ({ ...prev, notifications: readNotifs }));

    try {
      const res = await fetch(`${API_BASE}/auth/notifications/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        }
      });

      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data);
      } else {
        // Revert on failure
        setCurrentUser(prev => ({ ...prev, notifications: notifs }));
      }
    } catch (err) {
      // Revert on failure
      setCurrentUser(prev => ({ ...prev, notifications: notifs }));
    }
  };
  return (
    <DbContext.Provider value={{
      API_BASE,
      jobs,
      users,
      applications,
      interviews,
      reports,
      settings,
      currentUser,
      activeRole,
      setActiveRole,
      toasts,
      loading, // Pass loading state to App
      showToast,
      removeToast,
      loginUser,
      logoutUser,
      registerUser,
      verifyUserEmail,
      resendVerificationCode,
      requestResetCode,
      verifyResetCode,
      resetPassword,
      updateProfile,
      fetchUsersList,
      getAuthHeaders,
      addJob,
      updateJob,
      deleteJob,
      addApplication,
      updateApplicationStatus,
      withdrawApplication,
      toggleSaveJob,
      scheduleInterview,
      cancelInterview,
      addReport,
      updateReportStatus,
      toggleUserSuspension,
      deleteUser,
      approveJob,
      verifyEmployer,
      saveSettings,
      resetDatabase,
      readNotifications
    }}>
      {children}
    </DbContext.Provider>
  );
};
