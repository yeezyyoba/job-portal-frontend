// src/pages/guest/Home.jsx
import React, { useContext, useState } from 'react';
import { DbContext } from '../../context/DbContext';
import { Search, Tag, MapPin, ArrowRight } from 'lucide-react';

export default function Home({ setHash, setSelectedJobId, setDetailsOpen, setSearchQuery }) {
  const { jobs, users, applications, loginUser, currentUser } = useContext(DbContext);
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');

  const activeFeatured = jobs.filter(j => j.featured && j.approved && j.status === 'active').slice(0, 3);

  const stats = {
    jobs: jobs.filter(j => j.approved && j.status === 'active').length,
    companies: users.filter(u => u.role === 'employer' && u.verified).length,
    seekers: users.filter(u => u.role === 'seeker').length,
    placements: applications.filter(a => a.status === 'Shortlisted').length
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchQuery({ keyword, category });
    setHash(currentUser?.role === 'seeker' ? 'seeker:search' : 'jobs');
  };

  const handleViewDetails = (jobId) => {
    setSelectedJobId(jobId);
    setDetailsOpen(true);
  };

  const testimonials = [
    { quote: "JobPortal completely revamped our engineering hiring dashboard. We sourced and shortlisted our core staff in under 2 weeks.", name: "Marc Andreessen", title: "General Partner, a16z", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&q=80" },
    { quote: "Searching for jobs was incredibly simple. The real-time tracker kept me informed at every interview stage.", name: "Esther Howard", title: "Product Designer, Airbnb", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&q=80" },
    { quote: "We verified our startup account within 24 hours. The applicant filtering dashboard is extremely intuitive.", name: "Guillermo Rauch", title: "CEO, Vercel", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&q=80" }
  ];

  return (
    <>
      <section className="hero-section">
        <h1>Connect with <span>Premium Opportunities</span></h1>
        <p>Discover high-caliber engineering, design, and product roles at hyper-growth tech companies.</p>

        <form className="hero-search-bar" onSubmit={handleSearch}>
          <div className="search-input-wrapper">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Job title, company..." 
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
            />
          </div>
          <div className="search-input-wrapper">
            <Tag size={18} />
            <select 
              style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none', fontSize: '0.95rem', color: 'inherit' }}
              value={category}
              onChange={e => setCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="Development">Development</option>
              <option value="Design">Design</option>
              <option value="DevOps">DevOps</option>
              <option value="Marketing">Marketing</option>
              <option value="Finance">Finance</option>
              <option value="Sales">Sales</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary" style={{ borderRadius: 'var(--radius-lg)' }}>Search Jobs</button>
        </form>
      </section>

      <section>
        <div className="home-section-title">
          <h2>Featured Listings</h2>
          <a href={currentUser?.role === 'seeker' ? '#seeker:search' : '#jobs'} onClick={(e) => {
            e.preventDefault();
            setHash(currentUser?.role === 'seeker' ? 'seeker:search' : 'jobs');
          }} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            Browse All Jobs <ArrowRight size={16} />
          </a>
        </div>
        <div className="grid-jobs">
          {activeFeatured.map(job => (
            <div key={job.id} className="card card-hover flex-between" style={{ flexDirection: 'column', alignItems: 'stretch', justifyContent: 'space-between' }}>
              <div>
                <div className="job-card-header">
                  <img src={job.companyLogo} className="job-logo" alt={`${job.company} logo`} />
                  <div className="job-title-info">
                    <h3>{job.title}</h3>
                    <p>{job.company}</p>
                  </div>
                </div>
                <p className="text-muted" style={{ fontSize: '0.85rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '3.8rem' }}>
                  {job.description}
                </p>
              </div>
              <div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                  <span className="badge badge-primary">{job.remoteType}</span>
                  <span class="badge badge-outline">{job.employmentType}</span>
                  <span className="badge badge-success">{job.salaryRange}</span>
                </div>
                <div className="job-meta-row flex-between" style={{ marginTop: '1rem', borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
                  <div className="job-meta-item">
                    <MapPin size={14} />
                    <span>{job.location}</span>
                  </div>
                  <button className="btn btn-sm btn-primary" onClick={() => handleViewDetails(job.id)}>View Details</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="stats-banner">
        <div className="stat-item">
          <h3>{stats.jobs}</h3>
          <p>Active Job Openings</p>
        </div>
        <div className="stat-item">
          <h3>{stats.companies}</h3>
          <p>Verified Organizations</p>
        </div>
        <div className="stat-item">
          <h3>{stats.seekers}</h3>
          <p>Vetted Candidates</p>
        </div>
        <div className="stat-item">
          <h3>{stats.placements}</h3>
          <p>Hired Matches</p>
        </div>
      </section>

      <section>
        <div className="home-section-title">
          <h2>Browse Top Companies</h2>
        </div>
        <div className="grid-companies">
          <div className="card company-card card-hover">
            <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop&q=80" alt="Stripe logo" />
            <h4 style={{ fontWeight: 700 }}>Stripe</h4>
            <span className="badge badge-primary">Fintech</span>
            <p className="text-muted" style={{ fontSize: '0.8rem' }}>2 Active Openings</p>
          </div>
          <div className="card company-card card-hover">
            <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=100&h=100&fit=crop&q=80" alt="Airbnb logo" />
            <h4 style={{ fontWeight: 700 }}>Airbnb</h4>
            <span className="badge badge-primary">Hospitality</span>
            <p className="text-muted" style={{ fontSize: '0.8rem' }}>1 Active Opening</p>
          </div>
          <div className="card company-card card-hover">
            <img src="https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=100&h=100&fit=crop&q=80" alt="Vercel logo" />
            <h4 style={{ fontWeight: 700 }}>Vercel</h4>
            <span className="badge badge-primary">Cloud Platform</span>
            <p className="text-muted" style={{ fontSize: '0.8rem' }}>2 Active Openings</p>
          </div>
          <div className="card company-card card-hover">
            <img src="https://images.unsplash.com/photo-1618005198143-e5283b519a7f?w=100&h=100&fit=crop&q=80" alt="Linear logo" />
            <h4 style={{ fontWeight: 700 }}>Linear</h4>
            <span className="badge badge-primary">SaaS / Productivity</span>
            <p className="text-muted" style={{ fontSize: '0.8rem' }}>1 Active Opening</p>
          </div>
        </div>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <div className="home-section-title">
          <h2>Trusted by Innovators</h2>
        </div>
        <div className="testimonials-grid">
          {testimonials.map((t, idx) => (
            <div key={idx} className="card testimonial-card">
              <p>"{t.quote}"</p>
              <div className="testimonial-author">
                <img src={t.avatar} className="testimonial-avatar" alt={`${t.name} portrait`} />
                <div className="testimonial-details">
                  <h4>{t.name}</h4>
                  <p>{t.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
