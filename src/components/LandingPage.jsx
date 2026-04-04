import React, { useState, useEffect } from 'react';
import './LandingPage.css';
import { useSimulation } from '../context/SimulationContext';
import { useNotifications } from './shared/NotificationSystem';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();
  const { loginWithOtp, loginPartner } = useSimulation();
  const { addNotification } = useNotifications();

  
  const [step, setStep] = useState('STORY');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleRequestOtp = (e) => {
    e.preventDefault();
    if(phone.length < 10) return;
    setLoading(true);
    
    // Simulate OTP Generation
    const simulatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
    console.log("SIMULATED OTP:", simulatedOtp);

    setTimeout(() => {
      setLoading(false);
      setStep('OTP');
      addNotification(
        "GigShield Secure Access",
        `Your verification code is ${simulatedOtp}. Valid for 5 mins.`,
        "success"
      );
    }, 1200);
  };


  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if(otp.length < 4) return;
    setLoading(true);
    await loginWithOtp(phone);
    setLoading(false);
  };

  return (
    <div className="landing-root">
      <nav className={`landing-nav ${scrollY > 50 ? 'scrolled' : ''}`}>
        <div className="nav-brand">
          <span className="logo-text">GigShield</span>
          <span style={{ marginLeft: '8px', fontSize: '10px', fontWeight: 'bold', color: 'var(--accent-magenta)', padding: '2px 6px', border: '1px solid var(--accent-magenta)', borderRadius: '4px', letterSpacing: '1px', textTransform: 'uppercase' }}>Demo</span>
          <span className="nav-tagline" style={{ marginLeft: '12px' }}>External Disruption Claims</span>
        </div>
        <div className="nav-actions">
          <button className="nav-link" onClick={() => navigate('/admin-login')}>Admin Portal</button>
          <button className="nav-link" onClick={() => navigate('/partner-login')}>Partner Portal</button>
          <button className="btn btn-primary btn-sm" onClick={() => setStep('PHONE')}>Get Protected</button>
        </div>
      </nav>

      {/* 🗝️ Floating Demo Access Panel (For Judges) */}
      <div className="demo-credentials-panel" style={{
        position: 'fixed', bottom: '20px', left: '20px', zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(12px)',
        border: '1px solid rgba(249, 115, 22, 0.3)', borderRadius: '16px',
        padding: '1.5rem', boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        width: '320px', color: 'white', fontFamily: 'Inter, sans-serif'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
          <span style={{ fontSize: '1.2rem' }}>🔑</span>
          <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent-orange)' }}>Judge Demo Access</h4>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <p style={{ margin: '0 0 4px 0', fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Super Admin Portal</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '6px 10px', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px' }}>Key:</span>
              <code style={{ fontSize: '12px', fontWeight: 900, color: '#F97316' }}>GIGSHIELD26</code>
            </div>
          </div>

          <div>
            <p style={{ margin: '0 0 4px 0', fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Partner Portal (Zomato/Swiggy)</p>
            <details style={{ cursor: 'pointer' }}>
              <summary style={{ fontSize: '11px', color: '#94A3B8' }}>View Platform Keys</summary>
              <div style={{ marginTop: '8px', fontSize: '11px', color: '#64748B', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Zomato</span> <code style={{ color: 'white' }}>ZOMATO2026</code></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Swiggy</span> <code style={{ color: 'white' }}>SWIGGY2026</code></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Blinkit</span> <code style={{ color: 'white' }}>BLINKIT26</code></div>
              </div>
            </details>
          </div>

          <div>
            <p style={{ margin: '0 0 4px 0', fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Worker Verification (OTP)</p>
            <p style={{ margin: 0, fontSize: '11px', color: '#94A3B8' }}>Any 10-digit number. OTP is simulated in browser notification.</p>
          </div>
        </div>
        
        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '10px', color: '#475569', textAlign: 'center' }}>
          GIGSHIELD v4.2 • PROTOTYPE
        </div>
      </div>


      {step === 'STORY' && (
        <>
          <section className="hero-section">
            <div className="hero-bg">
              <div className="hero-image"></div>
              <div className="hero-overlay"></div>
              <div className="hero-particles"></div>
            </div>
            
            <div className="hero-ticker slide-up">
              <div className="ticker-pill">
                <span className="ticker-dot pulse"></span>
                <span className="ticker-label">LIVE ACTIVITY</span>
                <span className="ticker-divider">|</span>
                <div className="ticker-content">
                  <span>₹500 Paid • Mumbai</span>
                  <span>₹500 Paid • Delhi</span>
                  <span>₹500 Paid • Bangalore</span>
                  <span>₹500 Paid • Chennai</span>
                  <span>₹500 Paid • Hyderabad</span>
                  <span>₹500 Paid • Kolkata</span>
                </div>
              </div>
            </div>

            <div className="hero-content">
              <div className="hero-badge badge warning slide-up stagger-1">⚡ Zero-Touch Claims</div>
              <h1 className="hero-title slide-up stagger-2">
                When the Weather <span className="text-gradient">Breaks</span>,<br/>
                Your Income Shouldn't.
              </h1>
              <p className="hero-subtitle slide-up stagger-3">
                Parametric insurance for food delivery riders. Instant payouts when rain, 
                AQI, or extreme conditions hit your zone. No paperwork. No waiting.
              </p>
              <div className="hero-cta slide-up stagger-4">
                <button className="btn btn-primary btn-lg" onClick={() => setStep('PHONE')}>
                  Get Instant Cover
                </button>
                <a href="#how-it-works" className="btn btn-outline btn-lg">See How It Works</a>
              </div>
              
              <div className="hero-stats">
                <div className="stat-item">
                  <span className="stat-value">50K+</span>
                  <span className="stat-label">Riders Protected</span>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-item">
                  <span className="stat-value">₹2.5Cr</span>
                  <span className="stat-label">Payouts Made</span>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-item">
                  <span className="stat-value">&lt;3min</span>
                  <span className="stat-label">Avg. Payout Time</span>
                </div>
              </div>
            </div>
          </section>

          <section id="how-it-works" className="features-section">
            <div className="section-header">
              <span className="section-tag">How It Works</span>
              <h2 className="section-title">Protection in <span className="text-gradient">Three Steps</span></h2>
            </div>
            
            <div className="features-grid">
              <div className="feature-card glass-panel scale-in stagger-1">
                <div className="feature-visual">
                  <div className="visual-radar"></div>
                </div>
                <div className="feature-number">01</div>
                <h3>We Monitor</h3>
                <p>Satellite weather & city sensors detect disruptions in your delivery zone instantly.</p>
              </div>
              
              <div className="feature-card glass-panel scale-in stagger-2 highlight">
                <div className="feature-visual">
                  <div className="visual-flash"></div>
                </div>
                <div className="feature-number">02</div>
                <h3>Trigger Fires</h3>
                <p>When conditions hit thresholds (AQI &gt;300, heavy rain, extreme heat), system auto-activates.</p>
              </div>
              
              <div className="feature-card glass-panel scale-in stagger-3">
                <div className="feature-visual">
                  <div className="visual-money"></div>
                </div>
                <div className="feature-number">03</div>
                <h3>Instant Payout</h3>
                <p>₹500 credited to your UPI in minutes. Zero paperwork. Zero claims to file.</p>
              </div>
            </div>
          </section>

          <section className="triggers-section">
            <div className="triggers-container">
              <div className="section-header">
                <span className="section-tag">Coverage Triggers</span>
                <h2 className="section-title">What's <span className="text-gradient">Covered</span></h2>
              </div>
              
              <div className="triggers-grid">
                <div className="trigger-item glass-panel">
                  <div className="trigger-icon">🌫️</div>
                  <div className="trigger-info">
                    <h4>Air Quality Index</h4>
                    <p>AQI &gt; 300 in your zone</p>
                    <span className="trigger-payout">₹500 Instant</span>
                  </div>
                </div>
                
                <div className="trigger-item glass-panel">
                  <div className="trigger-icon">🌧️</div>
                  <div className="trigger-info">
                    <h4>Heavy Rainfall</h4>
                    <p>&gt;50mm/hr or waterlogging</p>
                    <span className="trigger-payout">₹500 Instant</span>
                  </div>
                </div>
                
                <div className="trigger-item glass-panel">
                  <div className="trigger-icon">🔥</div>
                  <div className="trigger-info">
                    <h4>Extreme Heat</h4>
                    <p>Temperature &gt; 42°C</p>
                    <span className="trigger-payout">₹500 Instant</span>
                  </div>
                </div>
                
                <div className="trigger-item glass-panel">
                  <div className="trigger-icon">🚧</div>
                  <div className="trigger-info">
                    <h4>Traffic Surge</h4>
                    <p>Major road blockages</p>
                    <span className="trigger-payout">₹500 Instant</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="innovation-section">
            <div className="innovation-container">
              <div className="section-header">
                <span className="section-tag">Innovation v2.0</span>
                <h2 className="section-title">Professional Grade <span className="text-gradient">Infrastructure</span></h2>
              </div>
              
              <div className="innovation-grid">
                <div className="innovation-card glass-panel">
                  <div className="innovation-icon">📡</div>
                  <h3>Live Weather Radar</h3>
                  <p>Real-time visual monitoring of storm cells and heat zones in your exact location.</p>
                </div>
                
                <div className="innovation-card glass-panel">
                  <div className="innovation-icon">📊</div>
                  <h3>Earnings-at-Risk AI</h3>
                  <p>Advanced forecasting tells you exactly how much coverage you need before the storm hits.</p>
                </div>
                
                <div className="innovation-card glass-panel">
                  <div className="innovation-icon">🛡️</div>
                  <h3>Biometric Fraud Shield</h3>
                  <p>Liveness-verified payouts ensure 100% security for high-value claims.</p>
                </div>
                
                <div className="innovation-card glass-panel">
                  <div className="innovation-icon">☁️</div>
                  <h3>Offline Sync Logic</h3>
                  <p>Lost signal in the rain? We record your presence locally and sync automatically when you're back.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="testimonials-section">
            <div className="testimonials-container">
              <div className="section-header">
                <span className="section-tag">Success Stories</span>
                <h2 className="section-title">What Riders <span className="text-gradient">Say</span></h2>
              </div>
              
              <div className="testimonials-grid">
                <div className="testimonial-card glass-panel">
                  <div className="testimonial-rating">★★★★★</div>
                  <p className="testimonial-text">"During the Mumbai floods last month, I got ₹500 automatically. Didn't have to do anything!"</p>
                  <div className="testimonial-author">
                    <span className="author-name">Rajesh K.</span>
                    <span className="author-location">Mumbai • Zomato</span>
                  </div>
                </div>
                
                <div className="testimonial-card glass-panel">
                  <div className="testimonial-rating">★★★★★</div>
                  <p className="testimonial-text">"Delhi AQI was crazy last week. Got paid while I was at home. This is actually useful."</p>
                  <div className="testimonial-author">
                    <span className="author-name">Amit S.</span>
                    <span className="author-location">Delhi • Swiggy</span>
                  </div>
                </div>
                
                <div className="testimonial-card glass-panel">
                  <div className="testimonial-rating">★★★★★</div>
                  <p className="testimonial-text">"35 rupees per week is nothing for the peace of mind. Already got 3 payouts this month."</p>
                  <div className="testimonial-author">
                    <span className="author-name">Priya M.</span>
                    <span className="author-location">Bangalore • Zepto</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="pricing-section">
            <div className="pricing-container">
              <div className="section-header">
                <span className="section-tag">Pricing</span>
                <h2 className="section-title">Simple <span className="text-gradient">Weekly</span> Premium</h2>
              </div>
              
              <div className="pricing-card glass-panel border-glow">
                <div className="pricing-header">
                  <span className="pricing-tier">Standard Cover</span>
                  <div className="pricing-amount">
                    <span className="currency">₹</span>
                    <span className="price">35</span>
                    <span className="period">/week</span>
                  </div>
                </div>
                
                <div className="pricing-features">
                  <div className="pricing-feature">
                    <span className="check">✓</span>
                    <span>All 4 trigger types covered</span>
                  </div>
                  <div className="pricing-feature">
                    <span className="check">✓</span>
                    <span>₹500 instant UPI payout</span>
                  </div>
                  <div className="pricing-feature">
                    <span className="check">✓</span>
                    <span>Zero documentation required</span>
                  </div>
                  <div className="pricing-feature">
                    <span className="check">✓</span>
                    <span>24/7 AI fraud protection</span>
                  </div>
                </div>
                
                <button className="btn btn-primary btn-lg w-full" onClick={() => setStep('PHONE')}>
                  Get Covered Now
                </button>
              </div>
            </div>
          </section>

          <footer className="landing-footer">
            <div className="footer-content">
              <div className="footer-brand">
                <span className="logo-text">GigShield <span style={{fontSize:'12px', color:'var(--accent-magenta)'}}>(Demo Prototype)</span></span>
                <p>IRDAI Sandbox Registered • Protecting India's Gig Workforce</p>
              </div>
              <div className="footer-legal">
                <span>© 2026 GigShield Insurance Services</span>
                <span className="footer-divider">|</span>
                <span>IRDAI License #49281</span>
              </div>
            </div>
          </footer>
        </>
      )}

      {(step === 'PHONE' || step === 'OTP') && (
        <section className="auth-overlay overlay-blur">
          <div className="auth-container glass-panel scale-in">
            <button className="auth-back" onClick={() => setStep('STORY')}>
              ← Back
            </button>
            
            {step === 'PHONE' ? (
              <div className="auth-form">
                <h2 className="auth-title">Enter Your Number</h2>
                <p className="auth-subtitle">We'll verify and set up your protection</p>
                <form onSubmit={handleRequestOtp}>
                  <div className="phone-input">
                    <span className="country-code">+91</span>
                    <input 
                      type="tel" 
                      placeholder="98765 43210" 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0,10))}
                      required 
                    />
                  </div>
                  <button type="submit" className="btn btn-primary w-full" disabled={loading || phone.length < 10}>
                    {loading ? 'Sending OTP...' : 'Continue'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="auth-form">
                <h2 className="auth-title">Verify OTP</h2>
                <p className="auth-subtitle">Sent to +91 {phone.slice(0, 5)}****{phone.slice(-4)}</p>
                <form onSubmit={handleVerifyOtp}>
                  <div className="otp-input-wrapper">
                    <input 
                      type="text" 
                      className="otp-input" 
                      maxLength="4" 
                      value={otp} 
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="****"
                      required 
                    />
                  </div>
                  <button type="submit" className="btn btn-primary w-full" disabled={loading || otp.length < 4}>
                    {loading ? 'Verifying...' : 'Verify & Continue'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default LandingPage;