// src/pages/guest/Contact.jsx
import React, { useContext, useState } from 'react';
import { DbContext } from '../../context/DbContext';
import { MapPin, Mail, Phone, Map } from 'lucide-react';

export default function Contact() {
  const { showToast, API_BASE } = useContext(DbContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_BASE}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message })
      });

      const data = await res.json();

      if (res.ok) {
        showToast("Message Sent", data.message || `Thank you ${name}. We'll get back to you soon!`, "success");
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
      } else {
        showToast("Error", data.message || "Failed to send your message. Please try again.", "error");
      }
    } catch (err) {
      showToast("Server Offline", "Could not connect to the server. Please try again later.", "error");
    }

    setIsSubmitting(false);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div className="text-center" style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Get in Touch</h2>
        <p className="text-muted">Have questions? Send us a ticket and our administrative team will reach back.</p>
      </div>

      <div className="contact-container">
        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input 
                type="text" 
                className="form-control" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input 
                type="email" 
                className="form-control" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Subject</label>
              <input 
                type="text" 
                className="form-control" 
                value={subject} 
                onChange={e => setSubject(e.target.value)} 
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Message Details</label>
              <textarea 
                className="form-control" 
                rows="5" 
                value={message} 
                onChange={e => setMessage(e.target.value)} 
                required 
              ></textarea>
            </div>
            <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Submit Contact Request'}
            </button>
          </form>
        </div>

        <div className="contact-info-panel">
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h3 style={{ fontWeight: 700, fontSize: '1.15rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>Support Headquarters</h3>
            
            <div className="contact-info-item">
              <MapPin size={20} style={{ color: 'var(--color-primary)', marginTop: '0.2rem' }} />
              <div>
                <h4 style={{ fontWeight: 600, fontSize: '0.95rem' }}>Office Address</h4>
                <p className="text-muted" style={{ fontSize: '0.85rem' }}>7th floor on Festival 22 Building Haya Hulet, <br></br>Next to Awraris Hotel, Addis Ababa, Ethiopia</p>
              </div>
            </div>

            <div className="contact-info-item">
              <Mail size={20} style={{ color: 'var(--color-primary)', marginTop: '0.2rem' }} />
              <div>
                <h4 style={{ fontWeight: 600, fontSize: '0.95rem' }}>Email Inquiry</h4>
                <p className="text-muted" style={{ fontSize: '0.85rem' }}>Info@ienetworksolutions.com<br /></p>
              </div>
            </div>

            <div className="contact-info-item">
              <Phone size={20} style={{ color: 'var(--color-primary)', marginTop: '0.2rem' }} />
              <div>
                <h4 style={{ fontWeight: 600, fontSize: '0.95rem' }}>Phone Support</h4>
                <p className="text-muted" style={{ fontSize: '0.85rem' }}>Reception:  +251-115-57-0544
                <br/>
                People: +251-115-58-8722
                <br/>
                Sales: +251-115-58-6896
                <br/>
                Sales M: +251-944-10-6717 
                <br/>
                Fax:  +251-115-570543 <br></br><strong>(Mon-Fri)</strong></p>
              </div>
            </div>
          </div>
          
          <a 
            href="https://maps.app.goo.gl/wKvD28E4JrBAKEWZ6" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="mock-map" 
            style={{ 
              position: 'relative',
              overflow: 'hidden',
              display: 'block',
              textDecoration: 'none', 
              cursor: 'pointer',
              border: 'none',
              padding: 0
            }}
          >
            <img 
              src="/IE_maps.jpg" 
              alt="IE Networks 22 Branch Map Location"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 0.3s ease',
                display: 'block'
              }}
              onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseOut={e => e.currentTarget.style.transform = 'scale(1.0)'}
            />
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(4px)',
              padding: '0.75rem',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
              fontSize: '0.85rem',
              gap: '0.5rem'
            }}>
              <Map size={16} />
              <span>Haya Hulet Office (Click to Open Google Maps)</span>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
