// src/pages/seeker/JobSearch.jsx
import React, { useContext, useState, useEffect } from 'react';
import { DbContext } from '../../context/DbContext';
import { Search, MapPin, Bookmark } from 'lucide-react';

export default function JobSearch({ searchQuery, setSelectedJobId, setDetailsOpen }) {
  const { jobs, currentUser, toggleSaveJob, showToast } = useContext(DbContext);
  const [keyword, setKeyword] = useState(searchQuery?.keyword || '');
  const [categories, setCategories] = useState(searchQuery?.category ? [searchQuery.category] : []);
  const [locations, setLocations] = useState([]);
  const [types, setTypes] = useState([]);
  const [workplaces, setWorkplaces] = useState([]);

  // Sync searchQuery prop changes
  useEffect(() => {
    if (searchQuery) {
      if (searchQuery.keyword) setKeyword(searchQuery.keyword);
      if (searchQuery.category) setCategories([searchQuery.category]);
    }
  }, [searchQuery]);

  const categoriesOptions = ["Development", "Design", "DevOps", "Marketing", "Finance", "Sales"];
  const locationsOptions = ["Remote", "Addis Ababa", "Hawassa", "Adama", "Bahir Dar", "Gondar", "Dire Dawa"];

  const handleCheckboxChange = (val, state, setState) => {
    if (state.includes(val)) {
      setState(state.filter(item => item !== val));
    } else {
      setState([...state, val]);
    }
  };

  const clearFilters = () => {
    setKeyword('');
    setCategories([]);
    setLocations([]);
    setTypes([]);
    setWorkplaces([]);
  };

  const filteredJobs = jobs.filter(job => {
    if (!job.approved || job.status !== 'active') return false;

    const matchesKeyword = keyword === '' || 
      job.title.toLowerCase().includes(keyword.toLowerCase()) || 
      job.company.toLowerCase().includes(keyword.toLowerCase()) || 
      job.description.toLowerCase().includes(keyword.toLowerCase());

    const matchesCategory = categories.length === 0 || categories.includes(job.category);
    
    const matchesLocation = locations.length === 0 || locations.some(loc => 
      job.location.includes(loc) || (loc === 'Remote' && job.remoteType === 'Remote')
    );

    const matchesType = types.length === 0 || types.includes(job.employmentType);
    const matchesWorkplace = workplaces.length === 0 || workplaces.includes(job.remoteType);

    return matchesKeyword && matchesCategory && matchesLocation && matchesType && matchesWorkplace;
  });

  const handleViewDetails = (jobId) => {
    setSelectedJobId(jobId);
    setDetailsOpen(true);
  };

  const savedList = currentUser?.savedJobs || [];

  return (
    <div className="search-board">
      <aside className="filters-panel card">
        <div className="flex-between" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
          <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>Filters</h3>
          <button className="btn btn-outline btn-sm" onClick={clearFilters} style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>Clear All</button>
        </div>
        
        <div className="filter-section">
          <h4>Category</h4>
          <div className="filter-options">
            {categoriesOptions.map(c => (
              <label key={c} className="checkbox-group">
                <input 
                  type="checkbox" 
                  checked={categories.includes(c)}
                  onChange={() => handleCheckboxChange(c, categories, setCategories)}
                />
                <span>{c}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="filter-section">
          <h4>Location</h4>
          <div className="filter-options">
            {locationsOptions.map(l => (
              <label key={l} className="checkbox-group">
                <input 
                  type="checkbox" 
                  checked={locations.includes(l)}
                  onChange={() => handleCheckboxChange(l, locations, setLocations)}
                />
                <span>{l}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="filter-section">
          <h4>Employment Type</h4>
          <div className="filter-options">
            {["Full-time", "Part-time", "Contract", "Internship"].map(t => (
              <label key={t} className="checkbox-group">
                <input 
                  type="checkbox" 
                  checked={types.includes(t)}
                  onChange={() => handleCheckboxChange(t, types, setTypes)}
                />
                <span>{t}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="filter-section">
          <h4>Remote / On-site</h4>
          <div className="filter-options">
            {["Remote", "Hybrid", "On-site"].map(w => (
              <label key={w} className="checkbox-group">
                <input 
                  type="checkbox" 
                  checked={workplaces.includes(w)}
                  onChange={() => handleCheckboxChange(w, workplaces, setWorkplaces)}
                />
                <span>{w}</span>
              </label>
            ))}
          </div>
        </div>
      </aside>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="card" style={{ padding: '0.75rem', display: 'flex', gap: '0.5rem' }}>
          <div className="search-input-wrapper" style={{ flex: 1, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-bg-light)' }}>
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search job title, company, or keywords..." 
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p className="text-muted" style={{ fontSize: '0.85rem' }}>
            Found {filteredJobs.length} jobs matching filters
          </p>
        </div>

        <div className="grid-jobs">
          {filteredJobs.length === 0 ? (
            <div className="card text-center" style={{ gridColumn: '1 / -1', padding: '3rem 1.5rem' }}>
              <h4 style={{ fontWeight: 700, marginBottom: '0.25rem' }}>No jobs match your search filters</h4>
              <p className="text-muted">Try clearing some tags or searching for keywords.</p>
            </div>
          ) : (
            filteredJobs.map(job => {
              const isSaved = savedList.includes(job.id);
              return (
                <div key={job.id} className="card card-hover flex-between" style={{ flexDirection: 'column', alignItems: 'stretch', justifyContent: 'space-between' }}>
                  <div>
                    <div className="job-card-header">
                      <img src={job.companyLogo} className="job-logo" alt={`${job.company} logo`} />
                      <div className="job-title-info">
                        <h3>{job.title}</h3>
                        <p>{job.company}</p>
                      </div>
                    </div>
                    <p className="text-muted" style={{ fontSize: '0.85rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '2.6rem' }}>
                      {job.description}
                    </p>
                  </div>
                  
                  <div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                      <span className="badge badge-primary">{job.remoteType}</span>
                      <span className="badge badge-outline">{job.employmentType}</span>
                      <span className="badge badge-success">{job.salaryRange}</span>
                    </div>
                    
                    <div className="job-meta-row flex-between" style={{ marginTop: '1rem', borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
                      <div className="job-meta-item">
                        <MapPin size={14} />
                        <span>{job.location}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          className={`btn btn-sm ${isSaved ? 'btn-primary' : 'btn-outline'} btn-icon`}
                          onClick={() => {
                            if (!currentUser) {
                              showToast("Authentication Required", "Please log in to save jobs.", "warning");
                              window.location.hash = '#login';
                            } else {
                              toggleSaveJob(job.id);
                            }
                          }}
                          title="Save Job"
                        >
                          <Bookmark size={14} />
                        </button>
                        <button className="btn btn-sm btn-primary" onClick={() => handleViewDetails(job.id)}>View</button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
