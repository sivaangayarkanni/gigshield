import React, { useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import './ProofTab.css';

const ProofTab = () => {
  const { submitEvidence, evidenceUploads, walletBalance } = useSimulation();
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setSubmitResult(null);
    }
  };

  const handleSubmit = async () => {
    if (!file) return;
    setIsSubmitting(true);
    setSubmitResult(null);

    submitEvidence({
      type: 'USER_UPLOAD',
      fileName: file.name,
      fileType: file.type,
      description: 'Hazard evidence uploaded by rider'
    });

    // Wait for the async submission result
    setTimeout(() => {
      // Check the latest evidence upload status
      const latestEvidence = evidenceUploads[0];
      
      if (latestEvidence?.status === 'PAID') {
        setSubmitResult({ 
          success: true, 
          message: '🎉 INSTANT PAYOUT! Your evidence was validated and ₹500 has been credited to your wallet.',
          type: 'instant'
        });
      } else if (latestEvidence?.status === 'MANUAL_REVIEW') {
        setSubmitResult({ 
          success: true, 
          message: '📋 Your evidence has been sent to our team for manual review. You\'ll be notified within 24 hours.',
          type: 'manual'
        });
      } else {
        setSubmitResult({ 
          success: true, 
          message: '🔒 Evidence submitted successfully! Processing your claim...',
          type: 'processing'
        });
      }
      
      setFile(null);
      setIsSubmitting(false);
    }, 2500);
  };

  const recentUploads = evidenceUploads.slice(0, 5);

  return (
    <div className="proof-tab-root">
      <div className="proof-grid">
        <div className="upload-section">
          <div className="upload-card">
            <div className="upload-header">
              <span className="upload-badge">📸 Disruption Proof</span>
              <h2 className="upload-title">Submit Evidence</h2>
              <p className="upload-desc">
                Upload a photo of local hazards (flooding, heavy rain, poor visibility) to trigger a claim. 
                Our AI validates your evidence - instant payout if approved!
              </p>
            </div>

            <div className={`upload-zone ${file ? 'has-file' : ''}`}>
              {file ? (
                <div className="file-preview">
                  <span className="file-icon">📄</span>
                  <span className="file-name">{file.name}</span>
                  <span className="file-remove" onClick={() => setFile(null)}>✕</span>
                </div>
              ) : (
                <div className="upload-prompt">
                  <span className="upload-icon">📷</span>
                  <span className="upload-text">Tap to capture or upload hazard photo</span>
                  <label className="upload-btn">
                    Choose File
                    <input type="file" onChange={handleFileChange} accept="image/*" />
                  </label>
                  <span className="upload-hint">JPG, PNG up to 10MB</span>
                </div>
              )}
            </div>

            {submitResult && (
              <div className={`submit-result ${submitResult.type}`}>
                <span className="result-icon">
                  {submitResult.type === 'instant' ? '✅' : submitResult.type === 'manual' ? '📋' : '⏳'}
                </span>
                <span className="result-message">{submitResult.message}</span>
                {submitResult.type === 'instant' && (
                  <span className="result-amount">New Balance: ₹{walletBalance.toLocaleString()}</span>
                )}
              </div>
            )}

            <div className="upload-actions">
              <button 
                className={`submit-btn ${!file || isSubmitting ? 'disabled' : 'primary'}`}
                onClick={handleSubmit}
                disabled={!file || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner"></span>
                    Processing Evidence...
                  </>
                ) : (
                  'Submit Evidence'
                )}
              </button>
            </div>

            <div className="upload-info">
              <div className="info-item">
                <span className="info-icon">🛰️</span>
                <span className="info-text">GPS location auto-tagged</span>
              </div>
              <div className="info-item">
                <span className="info-icon">🔒</span>
                <span className="info-text">256-bit AES encrypted</span>
              </div>
              <div className="info-item">
                <span className="info-icon">🤖</span>
                <span className="info-text">AI instant validation</span>
              </div>
            </div>
          </div>
        </div>

        <div className="info-section">
          <div className="process-card">
            <h3 className="process-title">How It Works</h3>
            <div className="process-steps">
              <div className="step">
                <span className="step-num">1</span>
                <div className="step-content">
                  <span className="step-title">Upload Photo</span>
                  <span className="step-desc">Capture hazard in your area</span>
                </div>
              </div>
              <div className="step">
                <span className="step-num">2</span>
                <div className="step-content">
                  <span className="step-title">AI Validation</span>
                  <span className="step-desc">Instant approval or manual review</span>
                </div>
              </div>
              <div className="step">
                <span className="step-num">3</span>
                <div className="step-content">
                  <span className="step-title">Get Paid</span>
                  <span className="step-desc">₹500 to wallet instantly</span>
                </div>
              </div>
            </div>
          </div>

          <div className="recent-card">
            <h3 className="recent-title">Recent Submissions</h3>
            {recentUploads.length > 0 ? (
              <div className="recent-list">
                {recentUploads.map((upload) => (
                  <div key={upload.id} className="recent-item">
                    <span className={`status-badge ${upload.status.toLowerCase().replace('_', '-')}`}>
                      {upload.status === 'PAID' ? '✅ Paid' : upload.status === 'MANUAL_REVIEW' ? '📋 Review' : upload.status === 'AI_VALIDATING' ? '🤖 Processing' : upload.status}
                    </span>
                    <span className="upload-time">{new Date(upload.submittedAt).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-uploads">No submissions yet</p>
            )}
          </div>

          <div className="privacy-card">
            <span className="privacy-icon">🔐</span>
            <div className="privacy-text">
              <span className="privacy-title">Privacy Protected</span>
              <span className="privacy-desc">Your data is encrypted and never shared</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProofTab;