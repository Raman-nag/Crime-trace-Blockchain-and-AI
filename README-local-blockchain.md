# Crime Trace – Local Blockchain & Real Wallet Setup

This guide explains how to run **Crime Trace** with a consistent local blockchain setup using **Hardhat** or **Ganache**, real MetaMask wallets, and the current `CrimeTrace` contract, as you move from pure demo mode towards a more realistic environment.

> The UI is already wired to `CrimeTrace.sol` for roles and citizen registration. Station and citizen dashboards currently use mock helpers. You can progressively replace these mocks with real contracts (e.g., `PoliceStationDashboard`, rewards contracts) while keeping the same steps below.

---

## 1. Overview of the stack

- **Frontend**: React + Vite + ethers.js + React Router
- **Smart contracts**:
  - `CrimeTrace.sol` – role and registry contract (platform admin, stations, citizens)
  - Future: `PoliceStationDashboard`, rewards/contracts for cases and submissions (not yet implemented)
- **Local blockchain**: 
  - Hardhat node (`npx hardhat node`), or
  - Ganache (GUI/CLI)
- **Wallets**: MetaMask accounts imported from your local node or test wallets
- **Storage**: IPFS via `ipfs-http-client` and your project credentials

---

## 2. One-time setup

Follow these steps once on your machine:

### 2.1 Install dependencies

```bash
cd Crime-Trace-
npm install
```

### 2.2 Configure Hardhat or Ganache

#### Option A – Hardhat local network

`hardhat.config.js` already includes a `localhost` network. Start the node:

```bash
npx hardhat node
```

Hardhat prints 20 accounts with private keys. Copy one or more and import them into MetaMask:

1. Open MetaMask → Add network → Custom RPC
2. RPC URL: `http://127.0.0.1:8545`
3. Chain ID: `31337` (default Hardhat)
4. Currency symbol: `ETH`
5. Save, then **Import Account** with one of the private keys printed by Hardhat

#### Option B – Ganache

1. Start Ganache and create a workspace
2. Note the RPC URL (e.g. `http://127.0.0.1:7545`) and Chain ID
3. Add a network in MetaMask pointing at that URL + Chain ID
4. Import at least three Ganache accounts into MetaMask:
   - Platform admin account
   - Station account(s)
   - Citizen accounts

If you use Ganache, either:

- Update `hardhat.config.js` `networks` to add a `ganache` network pointing to `http://127.0.0.1:7545`, or
- Use the default `localhost` entry but point it at Ganache’s RPC.

---

## 3. Deploying CrimeTrace to your local network

From the project root, after starting Hardhat or Ganache:

```bash
npx hardhat compile
npx hardhat run scripts\deploy.js --network localhost
```

- Ensure `localhost` in `hardhat.config.js` matches the RPC of your running node
- The script prints: `CrimeTrace deployed to: 0x...`

Keep this address: it is your **local CrimeTrace contract**.

If you have multiple environments (e.g., `localhost`, `ganache`, `sepolia`), you can run the same script with different `--network` names defined in `hardhat.config.js`.

---

## 4. Environment variables for real local use

Create or update `.env` (based on `.env.example`):

```env
# Contract & roles
VITE_CRIME_TRACE_ADDRESS=0xDeployedCrimeTraceAddressOnLocalNetwork
VITE_ADMIN_ADDRESS=0xYourChosenAdminWallet

# IPFS access
VITE_IPFS_PROJECT_ID=your-ipfs-project-id
VITE_IPFS_PROJECT_SECRET=your-ipfs-project-secret
# Optional custom endpoint
# VITE_IPFS_ENDPOINT=https://ipfs.infura.io:5001
```

### Choosing production-like roles

- **Platform Admin**
  - Choose a dedicated MetaMask account & keep its private key secure
  - Set `VITE_ADMIN_ADDRESS` to this address
- **Police Stations**
  - For each station, choose a stable wallet address (from local node now; later from testnet or mainnet)
  - Register through the Admin dashboard using these addresses
- **Citizens**
  - Citizens use their own wallets; no special env var is required

> When you move from local dev to a public testnet (e.g. Sepolia), deploy `CrimeTrace` there and update `VITE_CRIME_TRACE_ADDRESS` to the new address. All front-end role checks continue to work.

---

## 5. Running the app against your local blockchain

1. Start Hardhat or Ganache as described above
2. Deploy `CrimeTrace` and set `.env`
3. Start Vite dev server:

```bash
npm run dev
```

4. Open the app in the browser (e.g. `http://localhost:5173`)
5. Connect MetaMask to the same local network and use the desired wallet for each role

---

## 6. Role-specific usage with real wallets

### 6.1 Platform Admin

- Logs in via `/login` → **Platform Admin** tab
- Must use the wallet defined in `VITE_ADMIN_ADDRESS`
- On login, UI checks:
  - Address matches `VITE_ADMIN_ADDRESS`
  - `CrimeTrace.isPlatformAdmin(address)` returns `true`
- From `/admin` you can:
  - Register new stations (`registerStation`) and update them (`updateStation`, `setStationStatus`)
  - View and revoke citizens (`revokeCitizen`)

### 6.2 Police Station

- Use Admin dashboard to register a station with a long-lived station wallet
- Station officer logs in via `/login` → **Police Station** tab
  - Must use the registered wallet and correct station ID
- Station area (`/station`) is currently backed by **mock** case/complaint/reward data
  - You can safely design and test UX without additional contracts
  - Later, replace `stationDashboardClient.js`, `stationActions.js`, and `stationAiClient.js` with real contract/API integrations

### 6.3 Citizen

- Citizen registers at `/register` using any wallet
- `CrimeTrace.registerCitizen` writes identity metadata and emits `CitizenRegistered`
- After registration, login via `/login` → **Citizen** tab
- Citizen area (`/citizen`) uses `CrimeTrace.isCitizen` and `getCitizenByWallet` as access control, with **mock** data for:
  - Nearby cases
  - Upload information
  - Rewards & contributions
  - Notification center

---

## 7. Moving beyond mocks (wiring real contracts)

Once you are comfortable with local wallets and the `CrimeTrace` registry, you can introduce additional contracts without changing the UI structure:

1. **Design & deploy a PoliceStationDashboard contract** with functions like:
   - `getStationStats(stationId)`
   - `getCategoryStats(stationId)`
   - `registerCase(...)`
   - `updateComplaintStatus(...)`
   - `archiveComplaint(...)`
   - `registerCriminal(...)`
2. Add its ABI + address to the frontend (e.g., `stationDashboardAbi.js`, env var `VITE_STATION_DASHBOARD_ADDRESS`)
3. Replace:
   - `stationDashboardClient.js` with ethers.js calls
   - `stationActions.js` mocks with real transactions
   - `stationAiClient.js` mocks with calls to your AI backend

Similarly, for **rewards & notifications**:

- Introduce a `CitizenRewards` contract and/or an indexing layer
- Replace `citizenDashboardClient.js` and `fetchCitizenNotifications` with real data sources

The existing React components are already structured for this swap – you only need to change the data layer.

---

## 8. Using different networks (testnet/mainnet)

To move from local development to a public testnet:

1. Add a network to `hardhat.config.js` (e.g., Sepolia) with RPC URL and private key
2. Deploy `CrimeTrace` to that network:

```bash
npx hardhat run scripts\deploy.js --network sepolia
```

3. Update `.env`:

```env
VITE_CRIME_TRACE_ADDRESS=0xDeployedAddressOnSepolia
VITE_ADMIN_ADDRESS=0xAdminWalletOnSepolia
```

4. In MetaMask, switch the network to Sepolia and use the same admin/station/citizen addresses
5. Run the frontend as before (`npm run dev` or a production build)

You can keep your **local** setup as a separate profile by using a different `.env` file (e.g., `.env.local`, `.env.sepolia`) and switching between them during development.

---

## 9. Troubleshooting

- **MetaMask shows wrong network**
  - Ensure MetaMask network matches your Hardhat/Ganache RPC URL & chain ID
- **Login says not admin / not citizen / not station**
  - Double-check `VITE_ADMIN_ADDRESS` and the deployed `CrimeTrace` address
  - Make sure you registered the station/citizen on the *same network* you are connected to
- **IPFS upload errors**
  - Verify `VITE_IPFS_PROJECT_ID`, `VITE_IPFS_PROJECT_SECRET`, and endpoint
  - Ensure your provider supports the HTTP API at the configured URL

With this setup, you can confidently run Crime Trace against real wallets on a stable local chain, then migrate to a testnet or mainnet by redeploying contracts and updating environment variables.
