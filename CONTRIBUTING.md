# Contributing to Nexus – Stellar Crowdfunding dApp

Thank you for your interest in contributing! Here's how to get started.

## Tech Stack

| Layer | Technology |
|---|---|
| Smart Contract | Rust + Soroban SDK |
| Frontend | React (Vite) |
| Blockchain | Stellar Testnet (Soroban) |
| CI/CD | GitHub Actions |

## Prerequisites

- [Rust](https://rustup.rs/) with `wasm32-unknown-unknown` target
- [Node.js](https://nodejs.org/) v18+
- [Stellar Freighter Wallet](https://www.freighter.app/) browser extension

## Local Setup

```bash
# 1. Clone the repository
git clone https://github.com/akankshapatil99/stellar-level-3.git
cd stellar-level-3

# 2. Build the smart contract
cd contract
cargo build --target wasm32-unknown-unknown --release

# 3. Run contract tests
cargo test

# 4. Start the frontend
cd ../frontend
npm install
npm run dev
```

## Project Structure

```
.
├── contract/          # Rust Soroban smart contract
│   └── src/
│       ├── lib.rs     # Contract logic
│       └── test.rs    # Contract tests
├── frontend/          # React + Vite frontend
│   └── src/
│       ├── App.jsx    # Main application
│       ├── App.css    # Styles
│       └── contract.js # Contract client setup
└── .github/workflows/ # CI/CD pipeline
```

## Making Changes

1. **Fork** the repository and create a feature branch: `git checkout -b feat/your-feature`
2. Make your changes with clear, atomic commits using [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` – New features
   - `fix:` – Bug fixes
   - `docs:` – Documentation
   - `style:` – Formatting/CSS
   - `test:` – New or updated tests
   - `chore:` – Build/config changes
3. Run the tests before pushing: `cargo test` (contract) and `npm run build` (frontend)
4. Open a **Pull Request** against `main`

## Coding Standards

- **Rust**: Follow standard Rust formatting (`cargo fmt`) and add Rustdoc comments to public functions
- **React**: Keep components focused and avoid prop drilling beyond 2 levels
- **CSS**: Add responsive rules for any new layout components (breakpoints: 1024px, 768px, 480px)

## Running the CI Pipeline Locally

The GitHub Actions workflow (`.github/workflows/ci.yml`) can be simulated locally:

```bash
# Contract
cd contract
rustup target add wasm32-unknown-unknown
cargo build --target wasm32-unknown-unknown --release
cargo test

# Frontend
cd ../frontend
npm install
npm run build
```

## Deployment

Deploying Nexus involves two main phases: Backend (Smart Contract) and Frontend (React App).

### 1. Smart Contract Deployment (Backend)

Ensure you have the [Stellar CLI](https://developers.stellar.org/docs/build/smart-contracts/getting-started/setup#install-the-stellar-cli) installed and configured for Testnet.

1. **Build the WASM binary**:
   ```bash
   cd contract
   cargo build --target wasm32-unknown-unknown --release
   ```
2. **Deploy to Testnet**:
   ```bash
   stellar contract deploy \
     --wasm target/wasm32-unknown-unknown/release/soroban_crowdfunding_contract.wasm \
     --source <YOUR_ACCOUNT_NAME> \
     --network testnet
   ```
   *Take note of the returned **Contract ID**.*
3. **Initialize the contract**:
   ```bash
   stellar contract invoke \
     --id <YOUR_CONTRACT_ID> \
     --source <YOUR_ACCOUNT_NAME> \
     --network testnet \
     -- initialize
   ```

### 2. Application Deployment (Frontend)

1. **Update Contract ID**: 
   Open `frontend/src/contract.js` and replace `CONTRACT_ID` with the ID obtained during deployment.
2. **Configure Environment**: 
   Ensure you are targeting the correct RPC endpoint (currently set to `https://soroban-testnet.stellar.org`).
3. **Build for Production**:
   ```bash
   cd frontend
   npm run build
   ```
4. **Hosting**: 
   Upload the contents of the `frontend/dist` folder to your provider (Vercel, Netlify, or AWS). If using GitHub integration, ensure the build command is `npm run build` and the output directory is `dist`.

