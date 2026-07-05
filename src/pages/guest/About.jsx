// src/pages/guest/About.jsx
import React from 'react';

export default function About() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem', padding: '2rem 0' }}>
      <div className="text-center">
        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>About IE-JobPortal</h2>
        <p className="text-muted" style={{ fontSize: '1.1rem' }}>Bridging the gap between stellar developers and hyper-growth product teams.</p>
      </div>

      <img 
        src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=400&fit=crop&q=80" 
        style={{ width: '100%', borderRadius: 'var(--radius-xl)', objectFit: 'cover', boxShadow: 'var(--shadow-lg)' }} 
        alt="Team working together"
      />

      <div className="card">
        <h3 style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--color-primary)', marginBottom: '0.75rem' }}>Company History & Core Values</h3>
        <p>Founded in 2026, IE-JobPortal began as a curated newsletter connecting startup founders with senior engineering talent. We have evolved into a full-scale frontend recruitment platform that streamlines candidate applications, verifies employers, and coordinates interviews seamlessly.</p>
      </div>

      <div className="form-row">
        <div className="card">
          <h4 style={{ fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-success)' }}>Our Mission</h4>
          <p className="text-muted" style={{ fontSize: '0.9rem' }}>To empower talent to build a meaningful career journey by simplifying tech recruiting and providing absolute transparency at every hiring stage.</p>
        </div>
        <div className="card">
          <h4 style={{ fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-warning)' }}>Our Vision</h4>
          <p className="text-muted" style={{ fontSize: '0.9rem' }}>To become the world's most trusted recruitment workspace that brings candidate experience, recruiter analytics, and administration policies into a single ecosystem.</p>
        </div>
      </div>
    </div>
  );
}
