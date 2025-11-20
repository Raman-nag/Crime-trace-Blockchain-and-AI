export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-left">
          <div className="footer-title">PoliceCitizen Connect</div>
          <p className="footer-tagline">Built on blockchain for transparent safety.</p>
        </div>
        <div className="footer-links">
          <a href="#about" className="footer-link">
            About
          </a>
          <a href="#terms" className="footer-link">
            Terms
          </a>
          <a href="#privacy" className="footer-link">
            Privacy Policy
          </a>
          <a href="#support" className="footer-link">
            Support
          </a>
        </div>
        <div className="footer-meta">© {new Date().getFullYear()} Crime Trace.</div>
      </div>
    </footer>
  );
}
