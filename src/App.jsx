import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import CitizenRegistrationPage from './pages/CitizenRegistrationPage.jsx';
import NavBar from './components/layout/NavBar.jsx';
import Footer from './components/layout/Footer.jsx';
import AdminLayout from './components/admin/AdminLayout.jsx';
import AdminDashboardPage from './pages/admin/AdminDashboardPage.jsx';
import AdminAddStationPage from './pages/admin/AdminAddStationPage.jsx';
import AdminManageStationsPage from './pages/admin/AdminManageStationsPage.jsx';
import AdminCitizensPage from './pages/admin/AdminCitizensPage.jsx';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage.jsx';
import StationLayout from './components/station/StationLayout.jsx';
import StationDashboardPage from './pages/station/StationDashboardPage.jsx';
import UploadCrimePage from './pages/station/UploadCrimePage.jsx';
import ComplaintsPage from './pages/station/ComplaintsPage.jsx';
import AITrackerPage from './pages/station/AITrackerPage.jsx';
import HistoryDbPage from './pages/station/HistoryDbPage.jsx';
import UploadCriminalPage from './pages/station/UploadCriminalPage.jsx';
import CitizenLayout from './components/citizen/CitizenLayout.jsx';
import NearbyCasesPage from './pages/citizen/NearbyCasesPage.jsx';
import UploadInfoPage from './pages/citizen/UploadInfoPage.jsx';
import RewardsPage from './pages/citizen/RewardsPage.jsx';
import NotificationsPage from './pages/citizen/NotificationsPage.jsx';

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
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="add-station" element={<AdminAddStationPage />} />
            <Route path="manage-stations" element={<AdminManageStationsPage />} />
            <Route path="citizens" element={<AdminCitizensPage />} />
            <Route path="analytics" element={<AdminAnalyticsPage />} />
          </Route>
          <Route path="/station" element={<StationLayout />}>
            <Route index element={<StationDashboardPage />} />
            <Route path="dashboard" element={<StationDashboardPage />} />
            <Route path="upload-crime" element={<UploadCrimePage />} />
            <Route path="complaints" element={<ComplaintsPage />} />
            <Route path="ai-tracker" element={<AITrackerPage />} />
            <Route path="history-db" element={<HistoryDbPage />} />
            <Route path="upload-criminal" element={<UploadCriminalPage />} />
          </Route>
          <Route path="/citizen" element={<CitizenLayout />}>
            <Route index element={<NearbyCasesPage />} />
            <Route path="nearby" element={<NearbyCasesPage />} />
            <Route path="upload-info" element={<UploadInfoPage />} />
            <Route path="rewards" element={<RewardsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
          </Route>
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
