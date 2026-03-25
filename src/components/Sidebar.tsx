
import React, { useState, useEffect } from 'react';
import { ModelOption } from '../types/chat';

interface SidebarProps {
  model: string;
  setModel: (m: string) => void;
  projectName: string;
  setProjectName: (p: string) => void;
  setInput: (i: string) => void;
  models: ModelOption[];
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  model, 
  setModel, 
  projectName, 
  setProjectName, 
  setInput,
  models
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownOpen && !(e.target as HTMLElement).closest('.dropdown-container')) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [dropdownOpen]);
  return (
    <aside className="sidebar">
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.5rem' }}>
          QA CO-PILOT
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Senior Architect Assistant</p>
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
            Project Settings
          </label>
          <div style={{ marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Project Name (D:\projects\...)</p>
            <input 
              type="text" 
              value={projectName} 
              onChange={(e) => setProjectName(e.target.value.replace(/\s+/g, '-').toLowerCase())}
              placeholder="my-automation-suite"
              className="glass-card"
              style={{ width: '100%', padding: '0.5rem', fontSize: '0.875rem', color: 'white', marginBottom: '0.5rem' }}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <button 
                onClick={() => setInput(`Create framework`)}
                className="glass-card"
                title="Create New Project Structure"
                style={{ 
                  padding: '0.5rem', 
                  fontSize: '0.75rem', 
                  fontWeight: 600,
                  border: 'none', 
                  color: 'white',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '0.25rem',
                  background: 'linear-gradient(135deg, var(--accent), var(--primary))'
                }}
              >
                ➕ Create
              </button>
              <button 
                onClick={() => setInput(`Update framework`)}
                className="glass-card"
                title="Update Existing Structure from JSON"
                style={{ 
                  padding: '0.5rem', 
                  fontSize: '0.75rem', 
                  fontWeight: 600,
                  border: 'none', 
                  color: 'white',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '0.25rem',
                  background: 'linear-gradient(135deg, #10b981, #059669)'
                }}
              >
                🔄 Update
              </button>
            </div>
          </div>

          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
            Select Model
          </label>
          <div className="dropdown-container">
            <button 
              className="dropdown-trigger" 
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <span>{models.find(m => m.id === model)?.name}</span>
              <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>{dropdownOpen ? '▲' : '▼'}</span>
            </button>
            
            {dropdownOpen && (
              <div className="dropdown-menu">
                {models.map((m) => (
                  <button
                    key={m.id}
                    className={`dropdown-item ${model === m.id ? 'selected' : ''}`}
                    onClick={() => {
                      setModel(m.id);
                      setDropdownOpen(false);
                    }}
                  >
                    {m.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>


        <nav>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>Quick Actions</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button onClick={() => setInput('Generate ALL possible edge cases for: ')} className="glass-card" style={{ padding: '0.75rem',color: 'white', textAlign: 'left', fontSize: '0.875rem' }}>Generate Edge Cases</button>
            <button onClick={() => setInput('Generate detailed and comprehensive test cases for: ')} className="glass-card" style={{ padding: '0.75rem',color: 'white', textAlign: 'left', fontSize: '0.875rem' }}>Generate Test Cases</button>
            <button onClick={() => setInput('Generate API Test Cases for: ')} className="glass-card" style={{ padding: '0.75rem',color: 'white', textAlign: 'left', fontSize: '0.875rem' }}>API Test Cases</button>
            <button onClick={() => setInput('Generate Playwright API scripts for: ')} className="glass-card" style={{ padding: '0.75rem',color: 'white', textAlign: 'left', fontSize: '0.875rem' }}>API Scripts</button>
            <button onClick={() => setInput('Generate k6 Load test scripts for: ')} className="glass-card" style={{ padding: '0.75rem',color: 'white', textAlign: 'left', fontSize: '0.875rem' }}>Load Test Scripts</button>
            
            <button onClick={() => setInput('Generate automation framework along with script files for: ')} className="glass-card" style={{ padding: '0.75rem',color: 'white', textAlign: 'left', fontSize: '0.875rem' }}>Full Automation Suite</button>
      
          </div>
        </nav>
      </div>

      <div style={{ marginTop: 'auto', padding: '1rem', borderTop: '1px solid var(--border)', fontSize: '0.75rem', opacity: 0.6 }}>
        Local Ollama at localhost:11434
      </div>
    </aside>
  );
};
