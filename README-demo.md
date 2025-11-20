# Crime Trace – Demo Setup (Local Dev + Mock Data)

This guide explains how to run the **Crime Trace** dApp locally using:

- The existing `CrimeTrace` smart contract for **roles and citizen registration**
- **Mock data** for most station and citizen dashboards
- Local development accounts from **Hardhat** or **Ganache**

Use this when you want to demo the product end-to-end *before* wiring real on-chain case/reward contracts.

---

## 1. Features available in demo mode

The current codebase supports:

- **Landing page** with overview of Crime Trace
- **Login page** with three roles:
  - Platform Admin (protected by `VITE_ADMIN_ADDRESS` + `isPlatformAdmin`)
  - Police Station (validated via `CrimeTrace.getStationByWallet` / `isRegisteredStation`)
  - Citizen (validated via `isCitizen`)
- **Citizen Registration**
  - Stores verification metadata + ID hash in `CrimeTrace` and media on IPFS
- **Platform Admin dashboard** (real `CrimeTrace` data):
  - Station registration / activation / update
  - Citizen listing and revocation
  - Basic counts and event-driven activity feed
- **Police Station dashboard** (station area under `/station`):
  - Dashboard metrics and lists driven by **mock helpers**
  - Upload Crime, Complaints, AI Tracker, History DB, Upload Criminal tabs all use **mock actions**
- **Citizen dashboard** (under `/citizen`):
  - Nearby Cases, Upload Information, Rewards & Contributions, Notification Center – all with mock data

> In this demo setup, only `CrimeTrace.sol` is on-chain. Case, complaint, and reward flows are simulated via JS helpers.

---

## 2. Prerequisites

- **Node.js** 18+ and **npm**
- **Git**
- **MetaMask** browser extension
- **Local Ethereum node** (choose one):
  - **Hardhat** in-process node `npx hardhat node` (recommended), or
  - **Ganache** GUI / CLI
- **IPFS HTTP API credentials** (e.g. from Infura or similar):
  - `projectId`
  - `projectSecret`

> IPFS is required because citizen registration uploads documents via the real IPFS client.

---

## 3. Install dependencies

```bash
cd Crime-Trace-
npm install
```

Run this once to install React, Vite, ethers, Hardhat, and other deps.

---

## 4. Start a local blockchain

### Option A – Hardhat node (recommended)

In the project root:

```bash
npx hardhat node
```

This starts a local JSON-RPC node at `http://127.0.0.1:8545` with 20 funded accounts.

### Option B – Ganache

Start Ganache (GUI or CLI) and note the RPC URL and the list of accounts.

> For demo, any local chain works as long as MetaMask and Hardhat use the same RPC URL and chain ID.

---

## 5. Deploy the CrimeTrace contract

With your node running, in another terminal from the project root:

```bash
# Compile
npx hardhat compile

# Deploy to Hardhat local node
npx hardhat run scripts\deploy.js --network localhost
```

You should see output like:

```text
CrimeTrace deployed to: 0xABCDEF...
```

Copy this **deployed address**.

If you are using Ganache instead of Hardhat, adjust `hardhat.config.js` network settings or add a new network that points at Ganache (e.g. `http://127.0.0.1:7545`) and deploy to that network instead.

---

## 6. Configure environment (.env) for demo

Copy `.env.example` to `.env` in the project root:

```bash
cp .env.example .env
```

Edit `.env` and set:

```env
VITE_CRIME_TRACE_ADDRESS=0xYourDeployedCrimeTraceAddress
VITE_ADMIN_ADDRESS=0xAdminWalletFromLocalNode

VITE_IPFS_PROJECT_ID=your-ipfs-project-id
VITE_IPFS_PROJECT_SECRET=your-ipfs-project-secret
# optional override
# VITE_IPFS_ENDPOINT=https://ipfs.infura.io:5001
```

### Choosing demo accounts

- **Platform Admin**
  - Pick one local account (e.g. first Hardhat or Ganache account)
  - Paste its address as `VITE_ADMIN_ADDRESS`
- **Police Station demo account**
  - Pick a different local account for station wallet
- **Citizen demo account(s)**
  - Pick any other accounts for citizens

Import these private keys into MetaMask and connect MetaMask to your local network.

---

## 7. Running the frontend

With `.env` set and the local node running:

```bash
npm run dev
```

Open the printed URL (usually `http://localhost:5173`).

---

## 8. Demo flows (step-by-step)

### 8.1 Platform Admin

1. Go to `/login`
2. Select **Platform Admin** tab
3. Connect MetaMask using the admin wallet you set in `VITE_ADMIN_ADDRESS`
4. On success you are redirected to `/admin` and see the Admin Dashboard

From the Admin Dashboard you can:

- Add a new **police station** under **Add Police Station**
  - Use one of the local accounts as the station wallet
- View and manage stations and citizens from their respective pages

### 8.2 Police Station

1. From Admin, register a station with:
   - Station wallet: a second local account
   - Name / place / unique code: anything meaningful
2. In `/login`, select **Police Station** tab
3. Use the station wallet in MetaMask and the corresponding unique ID
4. You’ll be redirected to `/station` with:
   - Dashboard
   - Upload Crime
   - Complaints
   - AI Tracker
   - History DB
   - Upload Criminal

> Station pages currently use **mock helpers**. No extra smart contracts are required for demo.

### 8.3 Citizen

1. Switch MetaMask to another local account
2. Visit `/register` and complete **Citizen Registration**
   - Upload any small test document/image
   - Ensure IPFS env vars are correct
3. Once the transaction confirms, go to `/login`, choose **Citizen**, and connect the same wallet
4. You’ll be redirected to `/citizen` and can browse:
   - Nearby Cases (mock)
   - Upload Information (mock submission + panel)
   - Rewards & Contributions (mock stats)
   - Notification Center (mock notifications)

---

## 9. What is mocked vs real in demo mode?

**On-chain (real):**

- `CrimeTrace` contract:
  - Platform admin detection
  - Station registration & status
  - Citizen registration & revocation
- MetaMask wallet connections and address-based role checks
- IPFS uploads for citizen registration documents

**Mocked / stubbed (JavaScript only):

- Station dashboard stats and cases (`stationDashboardClient.js`)
- Station write actions (`stationActions.js`):
  - `registerCaseMock`, `updateComplaintStatusMock`, `archiveComplaintMock`, `registerCriminalMock`
- Station AI helpers (`stationAiClient.js`):
  - Route suggestions, aggregate route summaries, face-match results
- Citizen dashboard data (`citizenDashboardClient.js`):
  - Nearby cases, submissions, rewards, leaderboard, notifications

This separation lets you demo the full UX now and later drop in real contracts/APIs without changing UI structure.

---

## 10. Resetting the demo

- Stop the Hardhat or Ganache node
- Clear the deployment by restarting the node and re-running the deploy script
- Optionally create a new `.env` and choose different admin/station/citizen wallets
- Because most station/citizen analytics are mock-based, no extra cleanup is needed there.
