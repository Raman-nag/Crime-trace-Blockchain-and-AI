import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import CitizenRegistrationPage from './pages/CitizenRegistrationPage.jsx';
import NavBar from './components/layout/NavBar.jsx';
import Footer from './components/layout/Footer.jsx';

function DashboardPlaceholder({ title, description }) {
  return (
    <div className="placeholder-page">
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  );
}

export default function App() {
  return (
    <div className="app-shell">
      <NavBar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<CitizenRegistrationPage />} />
          <Route
            path="/admin/dashboard"
            element={
              <DashboardPlaceholder
                title="Platform Admin Dashboard"
                description="City-wide overview of stations, citizen participation, and blockchain-backed audit logs."
              />
            }
          />
          <Route
            path="/station/dashboard"
            element={
              <DashboardPlaceholder
                title="Police Station Dashboard"
                description="Live feed of complaints, citizen tips, and AI-suggested suspect routes for your jurisdiction."
              />
            }
          />
          <Route
            path="/citizen/dashboard"
            element={
              <DashboardPlaceholder
                title="Citizen Home"
                description="Track your submissions, see case updates, and explore city safety insights."
              />
            }
          />
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
