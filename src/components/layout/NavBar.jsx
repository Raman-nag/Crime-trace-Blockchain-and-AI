import { NavLink, useNavigate } from 'react-router-dom';

export default function NavBar() {
  const navigate = useNavigate();

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <button className="brand" onClick={() => navigate('/')}>
          <div className="brand-logo">
            <span>CT</span>
          </div>
          <div className="brand-text">
            <div className="brand-text-title">Crime Trace</div>
            <div className="brand-text-sub">PoliceCitizen Connect</div>
          </div>
        </button>
        <nav className="nav-links">
          <NavLink to="/" className="nav-link">
            About
          </NavLink>
          <NavLink to="/login" className="nav-link">
            Login
          </NavLink>
          <NavLink to="/register" className="nav-link">
            Register
          </NavLink>
        </nav>
        <div className="nav-cta">
          <button className="btn btn-secondary" onClick={() => navigate('/login')}>
            Get Started
          </button>
        </div>
      </div>
    </header>
  );
}
