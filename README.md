# 🌟 Nexus: Stellar Crowdfunding dApp

[![Stellar CI Pipeline](https://github.com/akankshapatil99/stellar-level-3/actions/workflows/ci.yml/badge.svg)](https://github.com/akankshapatil99/stellar-level-3/actions/workflows/ci.yml)
[![Demo](https://img.shields.io/badge/Live%20Demo-Vercel-blue?style=for-the-badge&logo=vercel)](https://frontend-liard-beta-68.vercel.app/)

A robust, decentralized crowdfunding application built on the **Stellar Soroban Network**. Nexus empowers users to create, manage, and fund campaigns securely using blockchain technology. As a unique feature, donors are rewarded with custom **NXS (Nexus)** tokens upon their successful contributions!

---

## 🚀 Live Demo
**[Experience Nexus Live on Vercel](https://frontend-liard-beta-68.vercel.app/)**

---

## ✨ Key Features

- **💰 Custom Token Rewards (NXS)**: Introduces specialized ecosystem token mechanics. Whenever a user donates XLM to a campaign, the smart contract automatically mints and issues **NXS** reward tokens to the donor's wallet!
- **🔗 Multi-Wallet Integration**: Connect seamlessly using Freighter or Rabet wallets without leaving the web application.
- **📜 Smart Contract Integration**: Fully dynamic crowdfunding campaigns deployed and executed directly on the Stellar testnet.
- **⚡ Real-Time Transaction Tracking**: Monitor blockchain confirmations and transaction statuses instantly through an intuitive UI toast system.
- **🎖️ Native Gratitude Certificates**: Donors receive a sleek, personalized, downloadable receipt/certificate upon funding a cause.
- **🤖 Automated CI/CD Pipeline**: GitHub Actions are configured to automatically build and test rust smart contracts and the frontend upon every push.
- **🎨 Modern Web3 UI/UX**: An intuitive, premium glassmorphism-inspired layout featuring animated background orbs, shimmering effects, and engaging responsive design.





## 🛠️ Architecture & Tech Stack

- **Frontend**: Vite + React, Vanilla CSS, Stellar SDK, Freighter/Rabet APIs.
- **Smart Contracts**: Rust & Stellar Soroban SDK.
- **Tokens**: Native testnet XLM for donations, Custom NXS Token for rewards.
- **DevOps**: GitHub Actions CI/CD Pipeline tracking builds.

---

## ⚙️ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v20+ recommended)
- [Rust](https://www.rust-lang.org/) toolchain (for compiling smart contracts)
- A Stellar-compatible wallet browser extension (Freighter recommended for Soroban testnet compatibility), fueled with Testnet XLM.

### 1. Frontend Setup
1. Clone the repository and navigate into the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Boot up the local development server:
   ```bash
   npm run dev
   ```

### 2. Smart Contract Setup & Testing
1. Navigate into the `contract` directory:
   ```bash
   cd contract
   ```
2. Build the WebAssembly targeting Soroban:
   ```bash
   cargo build --target wasm32-unknown-unknown --release
   ```
3. Run the complete test suite to verify token boundaries and campaign states:
   ```bash
   cargo test
   ```

---

## 🎯 Level Progression & Features Achieved

### New Tier Capabilities Added
- **Custom Token Infrastructure**: Upgraded backend to automatically mint and distribute a custom reward token (`NXS`) to users for their engagement, interacting securely with the Stellar token framework.
- **GitHub Actions Integration (CI/CD)**: Built automated workflows validating Rust contract components and ensuring frontend build successes on Git pushes. 
- **Inter-Contract Token Calls**: Utilizing `token::Client` to transfer XLM explicitly and safely between the Crowdfunding protocol and the Stellar token contract.
- **Cross-environment Verification**: Re-structured and bolstered smart contract testing with local token proxies simulating precise testnet behaviors.

### Foundational Additions
- **Loading & Cache Systems**: Advanced UX incorporating async-loading patterns and structured LocalStorage solutions for lightning-fast initial renders.
- **Polished Presentation**: Detailed UI enhancements including dynamic CSS styling, explicit smart contract operation confirmations, and a modal design architecture bringing total transparency to Web3 backend procedures.
