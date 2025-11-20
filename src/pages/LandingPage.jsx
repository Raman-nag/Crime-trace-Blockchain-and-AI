import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  const scrollToHowItWorks = () => {
    const el = document.getElementById('how-it-works');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="landing">
      <section className="hero">
        <div className="hero-left">
          <div className="hero-tagline">Together for a Safer City</div>
          <h1 className="hero-title">A civic platform where citizens and police solve cases side by side.</h1>
          <p className="hero-subtitle">
            A decentralized, AI-aware crime intelligence layer that connects citizens, stations, and city maps on
            Ethereum for faster, transparent case solving.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary" onClick={() => navigate('/login')}>
              Get Started
            </button>
            <button className="btn btn-ghost" onClick={scrollToHowItWorks}>
              Learn More
            </button>
          </div>
          <div className="hero-meta">
            <div className="hero-meta-item">
              <span className="hero-meta-label">Backed by</span>
              <span className="hero-meta-value">Ethereum · IPFS · Hardhat</span>
            </div>
            <div className="hero-meta-item">
              <span className="hero-meta-label">Focus</span>
              <span className="hero-meta-value">City-wise crime routes & hotspots</span>
            </div>
          </div>
        </div>
        <div className="hero-right">
          <div className="hero-map-shell">
            <div className="hero-map-overlay">
              <div className="hero-map-header">
                <span className="hero-map-title">Live Case Map</span>
                <span className="hero-map-city">Your City · Now</span>
              </div>
              <div className="hero-map-grid">
                <div className="hero-map-node hero-map-node-hot" />
                <div className="hero-map-node" />
                <div className="hero-map-node hero-map-node-cool" />
                <div className="hero-map-node" />
                <div className="hero-map-node hero-map-node-hot" />
              </div>
              <div className="hero-map-stats">
                <div className="hero-map-stat">
                  <div className="hero-map-stat-label">Open tips</div>
                  <div className="hero-map-stat-value">128</div>
                </div>
                <div className="hero-map-stat">
                  <div className="hero-map-stat-label">Active routes</div>
                  <div className="hero-map-stat-value">36</div>
                </div>
                <div className="hero-map-stat">
                  <div className="hero-map-stat-label">Citizen insights</div>
                  <div className="hero-map-stat-value">3.4k</div>
                </div>
              </div>
              <div className="hero-map-footer">AI suggests suspect paths across stations in real time.</div>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="section section-muted">
        <div className="section-header">
          <h2>How it works</h2>
          <p>Crime Trace turns citizen inputs and station intelligence into a single, verifiable city crime graph.</p>
        </div>
        <div className="card-grid three">
          <article className="card">
            <div className="card-icon circle citizen" />
            <h3>Citizens submit tips and complaints</h3>
            <p>
              Share incidents with photos, videos, and precise locations. Sensitive media is stored on IPFS, with only
              a secure reference on-chain.
            </p>
          </article>
          <article className="card">
            <div className="card-icon circle police" />
            <h3>Police validate and track suspects</h3>
            <p>
              Station dashboards highlight suspect movements, link related cases, and use AI to suggest likely routes
              across the city.
            </p>
          </article>
          <article className="card">
            <div className="card-icon circle chain" />
            <h3>Transparent, tamper-proof records</h3>
            <p>
              Every key action is logged on Ethereum, forming an immutable audit trail available to oversight bodies and
              authorized admins.
            </p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <h2>Key features</h2>
          <p>Designed for trust, speed, and safety in modern cities.</p>
        </div>
        <div className="feature-grid">
          <div className="feature-item">
            <h3>Blockchain-native complaints</h3>
            <p>Complaints, tips, and key decisions are anchored to smart contracts instead of a traditional backend.</p>
          </div>
          <div className="feature-item">
            <h3>AI route prediction</h3>
            <p>Visualize potential suspect paths between hotspots, precincts, and known locations on a live city canvas.</p>
          </div>
          <div className="feature-item">
            <h3>City crime heatmaps</h3>
            <p>Layered maps show high-risk zones and recent patterns, helping plan patrols and community awareness.</p>
          </div>
          <div className="feature-item">
            <h3>Role-based dashboards</h3>
            <p>Dedicated views for platform admins, station officers, and citizens with clear navigation and actions.</p>
          </div>
          <div className="feature-item">
            <h3>Privacy-preserving identity</h3>
            <p>Citizens use aliases and hashed identifiers. Only authorized police can see verification metadata.</p>
          </div>
          <div className="feature-item">
            <h3>IPFS media storage</h3>
            <p>Evidence files live on IPFS, referenced by content IDs on-chain for integrity and auditability.</p>
          </div>
        </div>
      </section>

      <section className="section section-muted">
        <div className="who-grid">
          <div className="who-block">
            <h2>For police agencies</h2>
            <p>
              Centralized city-wide crime intelligence across all stations, with every event traceable and verifiable on
              the blockchain.
            </p>
            <ul className="who-list">
              <li>Unified case and tip view across precincts.</li>
              <li>Route and hotspot overlays directly on district maps.</li>
              <li>Audit-ready logs for each action taken.</li>
            </ul>
          </div>
          <div className="who-block">
            <h2>For citizens</h2>
            <p>
              A safe, partly anonymous channel to submit tips, track outcomes, and see how your inputs improve city
              safety.
            </p>
            <ul className="who-list">
              <li>Alias-based identity with protected verification data.</li>
              <li>Real-time status updates for your submissions.</li>
              <li>Reputation based on helpful, validated insights.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
