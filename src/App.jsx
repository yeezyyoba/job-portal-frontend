// src/App.jsx
import React, { useState, useEffect, useContext } from 'react';
import { DbContext, DbProvider } from './context/DbContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Toast from './components/Toast';
import Modal from './components/Modal';
// Pages imports
import Home from './pages/guest/Home';
import About from './pages/guest/About';
import Contact from './pages/guest/Contact';
import Login from './pages/guest/Login';
import Register from './pages/guest/Register';
import VerifyEmail from './pages/guest/VerifyEmail';
import SeekerDashboard from './pages/seeker/SeekerDashboard';
import EmployerDashboard from './pages/employer/EmployerDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import JobSearch from './pages/seeker/JobSearch';

// Lucide icon imports
import { MapPin, Calendar, Video, Link2 } from 'lucide-react';

const getTodayDateString = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

function AppContent() {
  const { 
    currentUser, 
    activeRole,
    jobs, 
    applications, 
    addJob, 
    updateJob, 
    addApplication, 
    scheduleInterview, 
    addReport, 
    toggleSaveJob,
    showToast,
    loading
  } = useContext(DbContext);

  const getNowDatetimeString = () => {
    const now = new Date();
    const tzoffset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - tzoffset).toISOString().slice(0, 16);
  };

  const [hash, setHash] = useState(window.location.hash.substring(1) || 'home');
  const [searchQuery, setSearchQuery] = useState(null);
  const [verifyEmail, setVerifyEmail] = useState('');

  // Modal State Variables
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [jobFormId, setJobFormId] = useState(null);

  const [interviewOpen, setInterviewOpen] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState(null);

  const [reportOpen, setReportOpen] = useState(false);
  const [reportJobId, setReportJobId] = useState(null);
  const [intFormat, setIntFormat] = useState('Online (Google Meet)');

  const [applyOpen, setApplyOpen] = useState(false);
  const [applyJobId, setApplyJobId] = useState(null);

  // Sync hash routing
  useEffect(() => {
    const handleHashChange = () => {
      const current = window.location.hash.substring(1) || 'home';
      setHash(current);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Update hash state trigger
  const updateHashState = (newPath) => {
    window.location.hash = `#${newPath}`;
    setHash(newPath);
  };

  // Authorization guards on hash route changes
  useEffect(() => {
    if (hash.includes(':')) {
      const [role] = hash.split(':');
      if (['seeker', 'employer', 'admin'].includes(role)) {
        const isAllowed = currentUser && (
          (activeRole || currentUser.role) === role ||
          (role === 'admin' && currentUser.role === 'superadmin')
        );
        if (!isAllowed) {
          showToast("Access Denied", "Please log in to the appropriate dashboard.", "error");
          updateHashState('login');
        }
      }
    }
  }, [hash, currentUser, activeRole]);

  // Handle deep-linked job hashes (e.g. #job:job-1)
  useEffect(() => {
    if (hash.startsWith('job:')) {
      const jobId = hash.split(':')[1];
      if (jobId) {
        setSelectedJobId(jobId);
        setDetailsOpen(true);
      }
      // Redirect page route underneath the modal
      updateHashState((activeRole || currentUser?.role) === 'seeker' ? 'seeker:search' : 'jobs');
    }
  }, [hash]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '1rem', backgroundColor: 'var(--color-bg-light)' }}>
        <div style={{ border: '4px solid rgba(0, 0, 0, 0.1)', borderLeftColor: 'var(--color-primary)', borderRadius: '50%', width: '3rem', height: '3rem', animation: 'spin 1s linear infinite' }} />
        <h3 style={{ margin: 0, fontWeight: 700, color: 'var(--color-primary)', fontFamily: 'system-ui' }}>Loading JobPortal...</h3>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  const selectedJob = jobs.find(j => j.id === selectedJobId);

  // --- Modal Form Handlers ---

  // 1. Job details: Apply flow
  const handleApplyClick = (jobId) => {
    if (!currentUser) {
      showToast("Authentication Required", "Please log in as a Job Seeker to apply.", "warning");
      setDetailsOpen(false);
      updateHashState('login');
      return;
    }
    setApplyJobId(jobId);
    setApplyOpen(true);
    setDetailsOpen(false);
  };

  const handleShareClick = (jobId) => {
    const shareUrl = `${window.location.origin}${window.location.pathname}#job:${jobId}`;
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        showToast("Link Copied", "Job details link copied to clipboard!", "success");
      })
      .catch(() => {
        showToast("Error", "Could not copy link to clipboard.", "error");
      });
  };

  // 2. Job Form: Save/Post
  const handleJobSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const deadline = fd.get("deadline");
    const todayStr = getTodayDateString();

    if (deadline < todayStr) {
      showToast("Invalid Deadline", "The application deadline cannot be in the past.", "error");
      return;
    }

    const fields = {
      title: fd.get("title"),
      category: fd.get("category"),
      salaryRange: fd.get("salaryRange"),
      location: fd.get("location"),
      employmentType: fd.get("employmentType"),
      remoteType: fd.get("remoteType"),
      experienceRequired: fd.get("experienceRequired"),
      deadline,
      description: fd.get("description"),
      requirements: fd.get("requirements").split('\n').map(r => r.trim()).filter(r => r !== ''),
      responsibilities: fd.get("responsibilities").split('\n').map(r => r.trim()).filter(r => r !== '')
    };

    if (jobFormId) {
      updateJob(jobFormId, fields);
    } else {
      const employerName = currentUser ? currentUser.companyName : "Stripe";
      const employerLogo = currentUser ? currentUser.logo : "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop&q=80";
      addJob({
        company: employerName,
        companyLogo: employerLogo,
        ...fields
      });
    }
    setFormOpen(false);
  };

  // Open Edit job modal
  const openEditJobForm = (jobId) => {
    setJobFormId(jobId);
    setFormOpen(true);
  };

  const selectedFormJob = jobs.find(j => j.id === jobFormId);

  // 3. Interview Schedule submit
  const handleInterviewSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const dt = fd.get("dateTime");

    const nowTime = new Date();
    const inputTime = new Date(dt);
    // Allow a 5-minute grace period to prevent race conditions during form completion/submission
    if (inputTime.getTime() - nowTime.getTime() < -5 * 60 * 1000) {
      showToast("Invalid Interview Time", "The interview date and time cannot be set in the past.", "error");
      return;
    }

    scheduleInterview(
      selectedAppId,
      dt,
      fd.get("format"),
      fd.get("link"),
      fd.get("location"),
      fd.get("notes")
    );
    setInterviewOpen(false);
  };

  // 4. Report submit
  const handleReportSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    addReport(reportJobId, fd.get("reason"), fd.get("details"));
    setReportOpen(false);
  };

  // Router viewport mapping
  const renderViewport = () => {
    const route = hash.split(':')[0];
    switch (route) {
      case 'home':
        return (
          <Home 
            setHash={updateHashState} 
            setSelectedJobId={setSelectedJobId} 
            setDetailsOpen={setDetailsOpen} 
            setSearchQuery={setSearchQuery} 
          />
        );
      case 'about':
        return <About />;
      case 'contact':
        return <Contact />;
      case 'login':
        return <Login setHash={updateHashState} setVerifyEmail={setVerifyEmail} />;
      case 'register':
        return <Register setHash={updateHashState} setVerifyEmail={setVerifyEmail} />;
      case 'verify':
        return <VerifyEmail setHash={updateHashState} email={verifyEmail} />;
      case 'jobs':
        return (
          <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1.5rem' }}>Explore Available Jobs</h2>
            <JobSearch 
              searchQuery={searchQuery} 
              setSelectedJobId={setSelectedJobId} 
              setDetailsOpen={setDetailsOpen} 
            />
          </div>
        );
      case 'seeker':
        return (
          <SeekerDashboard 
            currentHash={hash} 
            setHash={updateHashState} 
            searchQuery={searchQuery}
            setSelectedJobId={setSelectedJobId}
            setDetailsOpen={setDetailsOpen}
          />
        );
      case 'employer':
        return (
          <EmployerDashboard 
            currentHash={hash} 
            setHash={updateHashState} 
            setFormOpen={setFormOpen}
            setSelectedJobId={setJobFormId}
            setInterviewOpen={setInterviewOpen}
            setSelectedAppId={setSelectedAppId}
          />
        );
      case 'admin':
        return (
          <AdminDashboard 
            currentHash={hash} 
            setHash={updateHashState} 
            setSelectedJobId={setSelectedJobId}
            setDetailsOpen={setDetailsOpen}
          />
        );
      default:
        return (
          <div className="card text-center" style={{ padding: '4rem 2rem' }}>
            <h2>404 - Page Not Found</h2>
            <p className="text-muted">The requested section does not exist.</p>
            <button className="btn btn-primary mt-4" onClick={() => updateHashState('home')}>Return Home</button>
          </div>
        );
    }
  };

  return (
    <>
      <Navbar currentHash={hash} setHash={updateHashState} />
      
      <main id="app-viewport">
        {renderViewport()}
      </main>
      
      <Footer setHash={updateHashState} />

      <Toast />

      {/* --- Overlay Dialog Modals --- */}

      {/* 1. Job Details Modal */}
      <Modal 
        isOpen={detailsOpen} 
        onClose={() => setDetailsOpen(false)} 
        title={selectedJob?.title || "Job Details"}
        footer={
          selectedJob && (
            <>
              <button className="btn btn-outline" onClick={() => {
                if (!currentUser) {
                  showToast("Authentication Required", "Please log in to report a job.", "warning");
                  setDetailsOpen(false);
                  updateHashState('login');
                } else {
                  setReportJobId(selectedJob.id);
                  setReportOpen(true);
                  setDetailsOpen(false);
                }
              }} title="Report job post">Report</button>
              <button className="btn btn-outline" onClick={() => handleShareClick(selectedJob.id)}>Share</button>
              <button className="btn btn-outline" onClick={() => {
                if (!currentUser) {
                  showToast("Authentication Required", "Please log in to save jobs.", "warning");
                  setDetailsOpen(false);
                  updateHashState('login');
                } else {
                  toggleSaveJob(selectedJob.id);
                }
              }}>
                {(currentUser?.savedJobs || []).includes(selectedJob.id) ? 'Saved' : 'Save'}
              </button>
              {applications.some(a => a.jobId === selectedJob.id && a.seekerEmail === currentUser?.email) ? (
                <button className="btn btn-success" disabled>Applied</button>
              ) : (
                <button className="btn btn-primary" onClick={() => handleApplyClick(selectedJob.id)}>Apply Now</button>
              )}
            </>
          )
        }
      >
        {selectedJob && (
          <div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
              <img src={selectedJob.companyLogo} className="job-logo" style={{ width: '3.5rem', height: '3.5rem' }} alt="" />
              <div>
                <h4 style={{ fontWeight: 800, fontSize: '1.15rem', margin: 0 }}>{selectedJob.company}</h4>
                <p className="text-muted" style={{ fontSize: '0.85rem' }}>Location: {selectedJob.location} ({selectedJob.remoteType})</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', backgroundColor: 'var(--color-bg-light)', borderRadius: 'var(--radius-lg)', padding: '1rem', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
              <div><strong>Salary:</strong><br /><span style={{ color: 'var(--color-success)', fontWeight: 700 }}>{selectedJob.salaryRange}</span></div>
              <div><strong>Employment:</strong><br />{selectedJob.employmentType}</div>
              <div><strong>Experience:</strong><br />{selectedJob.experienceRequired}</div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <h5 style={{ fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-primary)' }}>Role Description</h5>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>{selectedJob.description}</p>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <h5 style={{ fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-primary)' }}>Key Requirements</h5>
              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {(selectedJob.requirements || []).map((r, idx) => <li key={idx}>{r}</li>)}
              </ul>
            </div>

            <div>
              <h5 style={{ fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-primary)' }}>Core Responsibilities</h5>
              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {(selectedJob.responsibilities || []).map((r, idx) => <li key={idx}>{r}</li>)}
              </ul>
            </div>

            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)', fontSize: '0.8rem' }} className="text-muted flex-between">
              <span>Deadline: <strong>{selectedJob.deadline}</strong></span>
              <span>Posted: <strong>{selectedJob.datePosted}</strong></span>
            </div>
          </div>
        )}
      </Modal>

      {/* 2. Job Creation/Edition Form Modal */}
      <Modal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title={jobFormId ? "Edit Job Listing Details" : "Post a New Job Opening"}
        maxWidth="700px"
      >
        <form onSubmit={handleJobSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Job Title</label>
              <input type="text" className="form-control" name="title" defaultValue={selectedFormJob?.title || ''} required />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-control" name="category" defaultValue={selectedFormJob?.category || 'Development'} required>
                <option value="Development">Development</option>
                <option value="Design">Design</option>
                <option value="DevOps">DevOps</option>
                <option value="Marketing">Marketing</option>
                <option value="Finance">Finance</option>
                <option value="Sales">Sales</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Salary Range</label>
              <input type="text" className="form-control" name="salaryRange" defaultValue={selectedFormJob?.salaryRange || ''} placeholder="e.g. $120,000 - $145,000" required />
            </div>
            <div className="form-group">
              <label className="form-label">Location</label>
              <input type="text" className="form-control" name="location" defaultValue={selectedFormJob?.location || ''} placeholder="e.g. Addis Ababa" required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Employment Type</label>
              <select className="form-control" name="employmentType" defaultValue={selectedFormJob?.employmentType || 'Full-time'} required>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Workplace Style</label>
              <select className="form-control" name="remoteType" defaultValue={selectedFormJob?.remoteType || 'Remote'} required>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Experience Required</label>
              <select className="form-control" name="experienceRequired" defaultValue={selectedFormJob?.experienceRequired || 'Mid Level'} required>
                <option value="Entry Level">Entry Level</option>
                <option value="Mid Level">Mid Level</option>
                <option value="Senior Level">Senior Level</option>
                <option value="Lead / Executive">Lead / Executive</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Application Deadline</label>
              <input type="date" className="form-control" name="deadline" defaultValue={selectedFormJob?.deadline || ''} min={getTodayDateString()} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Job Description</label>
            <textarea className="form-control" name="description" defaultValue={selectedFormJob?.description || ''} rows="3" required></textarea>
          </div>

          <div className="form-group">
            <label className="form-label">Requirements (one per line)</label>
            <textarea className="form-control" name="requirements" defaultValue={(selectedFormJob?.requirements || []).join('\n')} rows="3" required></textarea>
          </div>

          <div className="form-group">
            <label className="form-label">Responsibilities (one per line)</label>
            <textarea className="form-control" name="responsibilities" defaultValue={(selectedFormJob?.responsibilities || []).join('\n')} rows="3" required></textarea>
          </div>

          <div className="modal-footer" style={{ borderTop: 'none', padding: 0 }}>
            <button type="button" className="btn btn-outline" onClick={() => setFormOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">{jobFormId ? "Save Changes" : "Publish Listing"}</button>
          </div>
        </form>
      </Modal>

      {/* 3. Schedule Interview Modal */}
      <Modal
        isOpen={interviewOpen}
        onClose={() => setInterviewOpen(false)}
        title="Schedule Candidate Interview"
      >
        <form onSubmit={handleInterviewSubmit}>
          <div className="form-group">
            <label className="form-label">Interview Date & Time</label>
            <input type="datetime-local" className="form-control" name="dateTime" min={getNowDatetimeString()} required />
          </div>

          <div className="form-group">
            <label className="form-label">Meeting Format</label>
            <select 
              className="form-control" 
              name="format" 
              value={intFormat}
              onChange={e => setIntFormat(e.target.value)}
              required
            >
              <option value="Online (Google Meet)">Online (Google Meet)</option>
              <option value="Online (Zoom)">Online (Zoom)</option>
              <option value="On-site / In-person">On-site / In-person</option>
            </select>
          </div>

          {intFormat.includes("Online") ? (
            <div className="form-group">
              <label className="form-label">Meeting Invitation Link</label>
              <input type="url" className="form-control" name="link" defaultValue="https://meet.google.com/abc-defg-hij" placeholder="https://meet.google.com/xyz-xyz" />
            </div>
          ) : (
            <div className="form-group">
              <label className="form-label">Office Address / Location</label>
              <input type="text" className="form-control" name="location" placeholder="e.g. Building 4, Conference Room B" />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Candidate Preparation Instructions & Notes</label>
            <textarea className="form-control" name="notes" rows="3" placeholder="Describe interview structure, preparation tips..."></textarea>
          </div>

          <div className="modal-footer" style={{ borderTop: 'none', padding: 0 }}>
            <button type="button" className="btn btn-outline" onClick={() => setInterviewOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Schedule Session</button>
          </div>
        </form>
      </Modal>

      {/* 4. Report Job Modal */}
      <Modal
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
        title="Report Job Listing"
      >
        <form onSubmit={handleReportSubmit}>
          <div className="form-group">
            <label className="form-label">Reason for Complaint</label>
            <select className="form-control" name="reason" required>
              <option value="Spam content">Spam or Fake Listing</option>
              <option value="Misleading information">Misleading description / Salary fraud</option>
              <option value="Discriminatory text">Discriminatory text</option>
              <option value="Duplicate post">Duplicate posting</option>
              <option value="Other">Other / Code violation</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Detailed Information</label>
            <textarea className="form-control" name="details" rows="4" placeholder="Provide logs or link proofs to help the administration verify this ticket..." required></textarea>
          </div>

          <div className="modal-footer" style={{ borderTop: 'none', padding: 0 }}>
            <button type="button" className="btn btn-outline" onClick={() => setReportOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-danger">File Report</button>
          </div>
        </form>
      </Modal>

      {/* 5. Job Application Modal */}
      <Modal
        isOpen={applyOpen}
        onClose={() => {
          setApplyOpen(false);
          if (applyJobId) {
            setSelectedJobId(applyJobId);
            setDetailsOpen(true);
          }
        }}
        title={`Apply for ${jobs.find(j => j.id === applyJobId)?.title || 'Job'}`}
      >
        <form onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.target);
          const cover = fd.get("coverLetter");
          if (cover && cover.trim() !== '') {
            addApplication(applyJobId, cover);
            setApplyOpen(false);
          } else {
            showToast("Required Field", "Please write a cover letter.", "error");
          }
        }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label className="form-label">Applying to</label>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', backgroundColor: 'var(--color-bg-light)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)' }}>
              <img src={jobs.find(j => j.id === applyJobId)?.companyLogo} className="job-logo" style={{ width: '2.5rem', height: '2.5rem' }} alt="" />
              <div>
                <h4 style={{ fontWeight: 700, fontSize: '1rem', margin: 0 }}>{jobs.find(j => j.id === applyJobId)?.title}</h4>
                <p className="text-muted" style={{ fontSize: '0.8rem', margin: 0 }}>{jobs.find(j => j.id === applyJobId)?.company}</p>
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Your Name</label>
              <input type="text" className="form-control" value={currentUser?.name || ''} disabled />
            </div>
            <div className="form-group">
              <label className="form-label">Your Email</label>
              <input type="email" className="form-control" value={currentUser?.email || ''} disabled />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Resume Name</label>
            <input type="text" className="form-control" value={currentUser?.resumeName || 'default_resume.pdf'} disabled />
            {!currentUser?.resumeName && (
              <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: 'var(--color-warning)' }}>
                * No resume uploaded to profile. A default resume will be used. You can upload your custom resume in your Profile page.
              </p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Cover Letter / Application Statement</label>
            <textarea 
              className="form-control" 
              name="coverLetter" 
              rows="6" 
              defaultValue="Dear Hiring Manager, I am writing to express my strong interest in this position. My professional experience aligns perfectly with the qualifications needed." 
              required
            ></textarea>
          </div>

          <div className="modal-footer" style={{ borderTop: 'none', padding: 0 }}>
            <button 
              type="button" 
              className="btn btn-outline" 
              onClick={() => {
                setApplyOpen(false);
                if (applyJobId) {
                  setSelectedJobId(applyJobId);
                  setDetailsOpen(true);
                }
              }}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">Submit Application</button>
          </div>
        </form>
      </Modal>
    </>
  );
}

export default function App() {
  return (
    <DbProvider>
      <AppContent />
    </DbProvider>
  );
}
