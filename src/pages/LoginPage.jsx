import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { connectWallet, getAdminAddress, getContractInstance } from '../blockchain/client.js';

export default function LoginPage() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('admin');
  const [currentAddress, setCurrentAddress] = useState('');
  const [stationId, setStationId] = useState('');
  const [stationName, setStationName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  const adminEnvAddress = getAdminAddress();

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2600);
  };

  const ensureWallet = async () => {
    setError('');
    const { address, provider, signer } = await connectWallet();
    setCurrentAddress(address);
    return { address, provider, signer };
  };

  const handleAdminLogin = async () => {
    try {
      setLoading(true);
      setError('');
      const { address, provider } = await ensureWallet();

      if (!adminEnvAddress) {
        setError('Admin wallet address is not configured. Set VITE_ADMIN_ADDRESS in .env.');
        return;
      }

      if (address.toLowerCase() !== adminEnvAddress.toLowerCase()) {
        setError('You are not the configured platform admin.');
        return;
      }

      const contract = getContractInstance(provider);
      const onChain = await contract.isPlatformAdmin(address);
      if (!onChain) {
        setError('This wallet is not recognized as platform admin on-chain.');
        return;
      }

      showToast('Welcome back, Platform Admin.');
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Failed to login as admin.');
    } finally {
      setLoading(false);
    }
  };

  const handleStationLogin = async () => {
    try {
      setLoading(true);
      setError('');
      const trimmedId = stationId.trim();

      if (!trimmedId) {
        setError('Please enter your Station Unique ID.');
        return;
      }
      const { address, provider } = await ensureWallet();
      const contract = getContractInstance(provider);

      try {
        const [id, name, wallet, active, place, code, registeredAt] = await contract.getStationByWallet(address);

        if (!active) {
          setError('This wallet is not mapped to any active police station. Contact platform admin.');
          return;
        }

        const onChainCode = (code || '').toLowerCase();
        const inputCode = trimmedId.toLowerCase();

        if (!onChainCode || onChainCode !== inputCode) {
          setError('Station Unique ID does not match the ID assigned by the platform admin.');
          return;
        }
      } catch (innerErr) {
        console.error(innerErr);
        setError('This wallet is not mapped to any active police station. Contact platform admin.');
        return;
      }

      showToast('Welcome back, Station Officer.');
      navigate('/station/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to login as station.');
    } finally {
      setLoading(false);
    }
  };

  const handleCitizenLogin = async () => {
    try {
      setLoading(true);
      setError('');
      const { address, provider } = await ensureWallet();
      const contract = getContractInstance(provider);
      const isCitizen = await contract.isCitizen(address);

      if (!isCitizen) {
        setError('No citizen account found. Please register first.');
        return;
      }

      showToast('Welcome back, Citizen.');
      navigate('/citizen');
    } catch (err) {
      setError(err.message || 'Failed to login as citizen.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          <span>{toast.message}</span>
        </div>
      )}
      <div className="auth-layout">
        <section className="auth-copy">
          <h1>Secure login via blockchain wallets.</h1>
          <p>
            Your Ethereum address defines your role in Crime Trace  platform admin, police station, or citizen.
            Every action you take is anchored on-chain for a transparent audit trail.
          </p>
          <ul>
            <li>Connect with MetaMask or a compatible wallet.</li>
            <li>No traditional username/password. Your address is your identity.</li>
            <li>Role checks are enforced by the CrimeTrace smart contract.</li>
          </ul>
        </section>
        <section className="auth-card">
          <div className="auth-card-header">
            <div className="badge-row">
              <span className="badge badge-admin">Admin</span>
              <span className="badge badge-station">Station</span>
              <span className="badge badge-citizen">Citizen</span>
            </div>
            <p className="auth-address">
              Connected wallet: {currentAddress ? currentAddress : 'Not connected'}
            </p>
          </div>
          <div className="tab-list">
            <button
              className={`tab ${activeTab === 'admin' ? 'tab-active' : ''}`}
              onClick={() => {
                setActiveTab('admin');
                setError('');
              }}
            >
              Platform Admin
            </button>
            <button
              className={`tab ${activeTab === 'station' ? 'tab-active' : ''}`}
              onClick={() => {
                setActiveTab('station');
                setError('');
              }}
            >
              Police Station
            </button>
            <button
              className={`tab ${activeTab === 'citizen' ? 'tab-active' : ''}`}
              onClick={() => {
                setActiveTab('citizen');
                setError('');
              }}
            >
              Citizen
            </button>
          </div>

          {activeTab === 'admin' && (
            <div className="tab-panel">
              <p className="tab-info">
                This role is restricted to the default admin address configured in the environment variables.
              </p>
              <div className="info-box">
                <strong>Configuration</strong>
                <p>
                  Default admin wallet (for example from Ganache) must be copied into your frontend .env as{' '}
                  <code>VITE_ADMIN_ADDRESS</code>.
                </p>
                <p className="info-box-muted">Current configured admin: {adminEnvAddress || 'not set'}</p>
              </div>
              <button className="btn btn-primary btn-full" onClick={handleAdminLogin} disabled={loading}>
                {loading ? 'Connecting...' : 'Connect wallet & Login as Admin'}
              </button>
            </div>
          )}

          {activeTab === 'station' && (
            <div className="tab-panel">
              <div className="field">
                <label>Station Unique ID</label>
                <input
                  type="text"
                  value={stationId}
                  onChange={(e) => setStationId(e.target.value)}
                  placeholder="e.g. CC-PS-01 or bang-007"
                />
              </div>
              <div className="field">
                <label>Station Name (optional)</label>
                <input
                  type="text"
                  value={stationName}
                  onChange={(e) => setStationName(e.target.value)}
                  placeholder="e.g. Central City PS"
                />
              </div>
              <button className="btn btn-primary btn-full" onClick={handleStationLogin} disabled={loading}>
                {loading ? 'Verifying...' : 'Connect wallet & Login as Station'}
              </button>
              <p className="helper-text">
                Your wallet must be mapped to an active station by the platform admin.
              </p>
            </div>
          )}

          {activeTab === 'citizen' && (
            <div className="tab-panel">
              <div className="field">
                <label>Your wallet address</label>
                <input type="text" value={currentAddress || ''} readOnly placeholder="Connect wallet to populate" />
              </div>
              <button className="btn btn-primary btn-full" onClick={handleCitizenLogin} disabled={loading}>
                {loading ? 'Checking...' : 'Connect wallet & Login'}
              </button>
              <p className="helper-text">
                New user?{' '}
                <button className="link" type="button" onClick={() => navigate('/register')}>
                  Register here
                </button>
                .
              </p>
            </div>
          )}

          {error && <div className="error-box">{error}</div>}
        </section>
      </div>
    </div>
  );
}
