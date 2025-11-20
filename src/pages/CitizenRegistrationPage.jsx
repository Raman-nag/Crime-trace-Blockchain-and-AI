import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { connectWallet, registerCitizenOnChain } from '../blockchain/client.js';
import { uploadToIPFS } from '../ipfs/client.js';

const ID_TYPES = ['Aadhaar', 'PAN', 'Driving License', 'Passport', 'Voter ID', 'Others'];

export default function CitizenRegistrationPage() {
  const navigate = useNavigate();

  const [walletAddress, setWalletAddress] = useState('');
  const [signer, setSigner] = useState(null);

  const [fullName, setFullName] = useState('');
  const [aliasName, setAliasName] = useState('');
  const [phone, setPhone] = useState('');
  const [idType, setIdType] = useState(ID_TYPES[0]);
  const [idNumber, setIdNumber] = useState('');
  const [documentFile, setDocumentFile] = useState(null);
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [consent, setConsent] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const ensureWallet = async () => {
    setError('');
    const { address, signer: newSigner } = await connectWallet();
    setWalletAddress(address);
    setSigner(newSigner);
    return { address, signer: newSigner };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!consent) {
      setError('You must agree to the Terms and Privacy Policy to register.');
      return;
    }

    if (!fullName || !idType || !idNumber || !documentFile) {
      setError('Please fill in all required fields and upload your ID document.');
      return;
    }

    try {
      setLoading(true);
      let currentSigner = signer;
      if (!walletAddress || !currentSigner) {
        const result = await ensureWallet();
        currentSigner = result.signer;
      }

      const documentCid = await uploadToIPFS(documentFile);

      await registerCitizenOnChain(currentSigner, {
        aliasName: aliasName || fullName,
        idType,
        idNumber,
        city,
        state,
        pincode,
        documentCid,
      });

      setSuccess('Registration successful. You can now login as a citizen.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message || 'Failed to register citizen.');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectWallet = async () => {
    try {
      await ensureWallet();
    } catch (err) {
      setError(err.message || 'Failed to connect wallet.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-layout auth-layout-split">
        <section className="auth-card">
          <header className="auth-card-header">
            <h1>Citizen Registration</h1>
            <p className="muted">
              Register your account to contribute tips, file complaints, and support investigations in a secure,
              verifiable way.
            </p>
            <p className="auth-address">
              Connected wallet: {walletAddress ? walletAddress : 'Not connected'}
            </p>
            <button type="button" className="btn btn-secondary" onClick={handleConnectWallet}>
              Connect / Switch wallet
            </button>
          </header>

          <form className="form" onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="field">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your legal name"
                  required
                />
              </div>
              <div className="field">
                <label>Alias / Display Name (optional)</label>
                <input
                  type="text"
                  value={aliasName}
                  onChange={(e) => setAliasName(e.target.value)}
                  placeholder="Name shown to stations and in lists"
                />
              </div>
              <div className="field">
                <label>Phone Number (optional)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Contact number for follow-ups"
                />
                <p className="helper-text">Phone is not stored on-chain.</p>
              </div>
            </div>

            <div className="form-grid">
              <div className="field">
                <label>ID Type *</label>
                <select value={idType} onChange={(e) => setIdType(e.target.value)}>
                  {ID_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>ID Number *</label>
                <input
                  type="text"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  placeholder="Government ID number"
                  required
                />
              </div>
              <div className="field">
                <label>Upload ID Document *</label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
                  required
                />
                <p className="helper-text">
                  File is stored off-chain on IPFS; only a secure reference is written to the blockchain.
                </p>
              </div>
            </div>

            <div className="form-grid">
              <div className="field">
                <label>City / Town</label>
                <input type="text" value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
              <div className="field">
                <label>State</label>
                <input type="text" value={state} onChange={(e) => setState(e.target.value)} />
              </div>
              <div className="field">
                <label>Pincode</label>
                <input type="text" value={pincode} onChange={(e) => setPincode(e.target.value)} />
              </div>
            </div>

            <div className="field checkbox-field">
              <label>
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                />{' '}
                I agree to the Terms and Privacy Policy, and consent to my data being used for verification in this
                safety platform.
              </label>
            </div>

            {error && <div className="error-box">{error}</div>}
            {success && <div className="success-box">{success}</div>}

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Registering...' : 'Register as Citizen'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => navigate('/login')}>
                Cancel
              </button>
            </div>
          </form>
        </section>

        <aside className="auth-aside">
          <h2>Why register?</h2>
          <ul>
            <li>Submit verified complaints that reach the right police station quickly.</li>
            <li>Earn reputation for helpful, validated tips that assist investigations.</li>
            <li>Stay updated on the status of your submissions in a transparent way.</li>
          </ul>
          <p className="muted small">
            Your documents are visible only to authorized police stations for verification. Sensitive contents are never
            stored directly on-chain  only hashed references and IPFS CIDs are.
          </p>
        </aside>
      </div>
    </div>
  );
}
