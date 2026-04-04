import React, { useState } from 'react';

const ClaimsTab = () => {
  const [claimType, setClaimType] = useState('Accident');
  const [claimStep, setClaimStep] = useState(1);

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
      <h3 style={{ fontSize: '1.2rem', color: 'white' }}>Manual Claims</h3>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        For cases outside of parametric triggers, you can submit a manual claim here.
      </p>

      {claimStep === 1 ? (
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px', background: 'rgba(21,26,35,0.5)', border: '1px solid var(--border-color)' }}>
          <h4 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Select Claim Type</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {['Accident during delivery', 'Vehicle breakdown', 'Personal Health Disruption'].map((type) => (
              <button 
                key={type}
                onClick={() => setClaimType(type)}
                style={{
                  padding: '1rem',
                  background: claimType === type ? 'var(--bg-accent)' : 'rgba(0,0,0,0.3)',
                  border: '1px solid ' + (claimType === type ? 'var(--bg-accent)' : 'var(--border-color)'),
                  borderRadius: '8px',
                  color: 'white',
                  textAlign: 'left',
                  fontWeight: 500
                }}
              >
                {type}
              </button>
            ))}
          </div>
          <button 
            onClick={() => setClaimStep(2)}
            className="btn btn-primary" 
            style={{ marginTop: '1.5rem', width: '100%', padding: '1rem' }}
          >
            Next Step
          </button>
        </div>
      ) : (
        <div className="glass-panel slide-up" style={{ padding: '1.5rem', borderRadius: '12px', background: 'rgba(21,26,35,0.5)', border: '1px solid var(--border-color)' }}>
          <h4 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Upload Evidence</h4>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
             Selected: {claimType}
          </p>

          <div style={{ border: '2px dashed var(--border-color)', borderRadius: '8px', padding: '2rem', textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📸</div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Drop photos or tap to upload evidence of disruption.</p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setClaimStep(1)} className="btn btn-outline" style={{ flex: 1 }}>Back</button>
            <button onClick={() => alert('Claim Submitted!')} className="btn btn-primary" style={{ flex: 2 }}>Submit Claim</button>
          </div>
        </div>
      )}

      <div style={{ padding: '1.2rem', borderRadius: '12px', background: 'var(--bg-panel)', border: '1px solid var(--border-color)' }}>
         <h3 style={{ fontSize: '0.9rem', color: 'white', marginBottom: '1rem' }}>Past Claims</h3>
         <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            No past claims recorded.
         </div>
      </div>
    </div>
  );
};

export default ClaimsTab;
