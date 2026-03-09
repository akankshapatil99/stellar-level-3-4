# 🌟 Nexus: Stellar Crowdfunding dApp

[![Stellar CI Pipeline](https://github.com/akankshapatil99/stellar-level-3/actions/workflows/ci.yml/badge.svg)](https://github.com/akankshapatil99/stellar-level-3/actions/workflows/ci.yml)
[![Demo](https://img.shields.io/badge/Live%20Demo-Vercel-blue?style=for-the-badge&logo=vercel)](https://frontend-liard-beta-68.vercel.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Nexus is a premium, decentralized crowdfunding platform powered by the **Stellar Soroban Network**. It enables users to fund high-impact initiatives with 100% on-chain transparency, rewarding contributors with native **NXS (Nexus)** tokens for every donation.

---

## 📸 Project Showcase

### 🖥️ Dashboard & Global Impact
![Dashboard Overview](./l2ss/Screenshot%202026-03-02%20183316.png)
*Modern, glassmorphism UI featuring real-time platform stats and animated background elements.*

### 📱 Mobile Responsive Design
| Desktop View | Mobile Sidebar |
| :---: | :---: |
| ![Desktop](./l2ss/Screenshot%202026-03-02%20183339.png) | ![Mobile Menu](./l2ss/Screenshot%202026-03-02%20183405.png) |

### 🎖️ On-Chain Proof of Gratitude
![Certificate](./l2ss/Screenshot%202026-03-02%20183451.png)
*Donors receive a downloadable, cryptographically verified Certificate of Gratitude after every contribution.*

---

## ✨ Advanced Features & Recent Updates

- **💰 NXS Reward Token Mechanics**: Integrated a custom token engine. Donors automatically receive **10 NXS tokens per 1 XLM** contributed, minted directly by the smart contract.
- **📊 Global Impact Visualization**: A platform-wide progress bar tracking collective goals across all verified initiatives.
- **📱 100% Mobile Responsive**: Fully adaptive layout with a custom slide-out side menu, optimized for all screen sizes (1024px, 768px, 480px).
- **📋 Transaction History**: Real-time integration with **Stellar Expert** and native on-chain history tracking for connected wallets.
- **⚡ Performance & UX**: 
  - **Animated Loading Screen**: Smooth initial startup state.
  - **Automatic Polling**: Account balances (XLM & NXS) refresh every 30 seconds automatically.
  - **Copy-to-Clipboard**: Quick wallet address sharing directly from the header.
- **♿ Accessibility & SEO**: Built with `prefers-reduced-motion` support, smooth scrolling, and optimized meta tags for search engines.

---

## 🛠️ Tech Stack & Architecture

- **Smart Contracts**: Rust + Soroban SDK (No-std, optimized for WASM).
- **Frontend**: React (Vite), Vanilla CSS, Stellar SDK.
- **Wallet Support**: Freighter & Rabet (Multi-wallet integration).
- **CI/CD**: GitHub Actions (Automated build & test pipelines for Rust and React).

---

## 🧪 Smart Contract Testing

We maintain a rigorous testing suite covering edge cases, token boundaries, and platform logic.

```bash
# Run the contract tests
cd contract
cargo test
```

![Test Results](./l2ss/cargo%20tests.png)
*Verifying 5+ critical test cases including zero-donation guards and NXS balance tracking.*

---

## � Full Project Gallery

Below is a detailed visual walkthrough of the Nexus platform architecture and user interface.

### 🖼️ UI Walkthrough & Features
| Features Overview | Interactive Elements |
| :---: | :---: |
| ![Features](./l2ss/Screenshot%202026-03-02%20183502.png) | ![Modals](./l2ss/Screenshot%202026-03-02%20183534.png) |
| *Intuitive platform feature highlights.* | *Responsive modal architecture for wallet interactions.* |

### 🛠️ Strategic Components
| Campaign Details | Community Initiatives |
| :---: | :---: |
| ![Details](./l2ss/Screenshot%202026-03-02%20183652.png) | ![Initiatives](./l2ss/Screenshot%202026-03-02%20183719.png) |

| Platform Information | Navigation System |
| :---: | :---: |
| ![About](./l2ss/Screenshot%202026-03-02%20183813.png) | ![Navigation](./l2ss/Screenshot%202026-03-02%20183837.png) |

### 🔍 Verification & Finality
![Verification](./l2ss/Screenshot%202026-03-03%20005154.png)
*Real-time indexing and verification of transactions on the Stellar network.*

### 🎥 Project Walkthrough (Video)
[![Watch the Demo](https://img.shields.io/badge/Watch-Demo%20Video-red?style=for-the-badge&logo=youtube)](./l2ss/stellar%20screenrecording.mp4)

---

## ⚙️ Development Setup

Refer to our **[CONTRIBUTING.md](./CONTRIBUTING.md)** for detailed environment setup, local deployment instructions, and coding standards.

### Quick Start
```bash
# Install frontend dependencies
cd frontend
npm install

# Build the contract
cd ../contract
cargo build --target wasm32-unknown-unknown --release
```

---

## 🤝 Community & Support
- **Developer**: Akanksha Patil
- **Network**: Stellar Testnet (Soroban)
- **Discord**: [Stellar Developers](https://discord.gg/stellardev)

---
*Built with ❤️ for the Stellar Ecosystem.*
