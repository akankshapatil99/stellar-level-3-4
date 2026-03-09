# Nexus: Stellar Crowdfunding dApp

[![Stellar CI Pipeline](https://github.com/akankshapatil99/stellar-level-3-4/actions/workflows/ci.yml/badge.svg)](https://github.com/akankshapatil99/stellar-level-3-4/actions/workflows/ci.yml)
[![Demo](https://img.shields.io/badge/Live%20Demo-Vercel-blue?style=for-the-badge&logo=vercel)](https://frontend-282amsr20-akankshapatil99s-projects.vercel.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Nexus is a premium, decentralized crowdfunding platform powered by the **Stellar Soroban Network**. It enables users to fund high-impact initiatives with 100% on-chain transparency, rewarding contributors with native **NXS (Nexus)** tokens for every donation.



# Project Showcase

## Dashboard & Global Impact
<img src="./l2ss/nxs.png" alt="Dashboard Overview" width="800">
<img src="./l2ss/ui1.png" alt="UI Section 1" width="800">
<img src="./l2ss/ui2.png" alt="UI Section 2" width="800">
<img src="./l2ss/ui3.png" alt="UI Section 3" width="800">
<img src="./l2ss/taskbar.png" alt="Taskbar View" width="800">
<img src="./l2ss/campaigns.png" alt="Campaigns Grid" width="800">
*Modern, glassmorphism UI featuring real-time platform stats and animated background elements.*

## Multi-Wallet Integration
<img src="./l2ss/multiwallet.png" alt="Multi wallet integration" width="800">
*Connect seamlessly using Freighter or Rabet wallets.*

## On-Chain Proof of Gratitude
<img src="./l2ss/certifcate.png" alt="Certificate" width="800">
*Donors receive a downloadable, cryptographically verified Certificate of Gratitude after every contribution.*

## Mobile Responsive Design
<img src="./l2ss/phone ss.jpeg" alt="Mobile View" width="800">
*Fully adaptive layout optimized for all screen sizes.*



# Technical Excellence

## Smart Contract Testing
<img src="./l2ss/cargo tests.png" alt="Test Results" width="800">
*Verifying 5+ critical test cases including zero-donation guards and NXS balance tracking.*

## 🔗 Inter-Contract Calls
Soroban's strength lies in its ability to handle complex inter-contract interactions. Nexus utilizes this by:
- Calling the **Stellar Asset Contract (SAC)** for XLM to execute secure donations.
- Calling the custom **Reward Token contract** to mint native tokens directly to the donor's address.
- All logic is executed atomically in a single transaction on the Stellar ledger.

---

# Advanced Features & Recent Updates

- ** NXS Reward Token Mechanics**: Integrated a custom token engine. Donors automatically receive **10 NXS tokens per 1 XLM** contributed, minted directly by the smart contract.
- ** Global Impact Visualization**: A platform-wide progress bar tracking collective goals across all verified initiatives.
- ** 100% Mobile Responsive**: Fully adaptive layout with a custom slide-out side menu.
- ** Performance & UX**: 
  - **Animated Loading Screen**: Smooth initial startup state.
  - **Automatic Polling**: Account balances refresh every 30 seconds.
  - **Copy-to-Clipboard**: Quick wallet address sharing from the header.


# Project Walkthroughs
| Desktop Walkthrough | Mobile Walkthrough |
| :---: | :---: |
| [![Watch the Demo](https://img.shields.io/badge/Watch-Desktop%20Demo%20Video-red?style=for-the-badge&logo=youtube)](./l2ss/stellar%20screenrecording.mp4) | [![Watch the Demo](https://img.shields.io/badge/Watch-Mobile%20Demo%20Video-red?style=for-the-badge&logo=youtube)](./l2ss/phone%20recording.mp4) |

---

#  8 Meaningful Commits

The project has been enhanced through strategic, atomic commits:
1.  **`feat(seo)`**: Integrated high-impact meta tags and Open Graph properties.
2.  **`feat(a11y)`**: Implemented smooth-scroll and reduced-motion support.
3.  **`docs(contract)`**: Authored comprehensive Rustdoc documentation.
4.  **`test(contract)`**: Expanded test suite (5+ cases, coverage for i128 stroops).
5.  **`feat(frontend)`**: Developed global loading screen and balance polling.
6.  **`feat(frontend)`**: Modularized configuration into `config.js`.
7.  **`style(ui)`**: Custom color-coded status toasts (Green/Red/Blue).
8.  **`docs(contributing)`**: Created detailed `CONTRIBUTING.md` guide.

---

# Deployed Contracts (Testnet)

- **Nexus Platform Contract**: `CBZ7ZPWXXWSHXWDLH2ZFC5XS66HAWWJZRJP3YC5BZ773KWLZPPRDKM3M`
- **NXS Reward Token**: `CDYGYOYQA7C35QDS4YSPZEHSVAOD4AEKXO2IABOGUVX7XJSQ4Y34MHDC`
- **Inter-Contract Call Token (XLM)**: `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC`


# Development Setup
Refer to our **[CONTRIBUTING.md](./CONTRIBUTING.md)** for detailed environment setup.

```bash
# Install frontend
cd frontend && npm install

# Build contract
cd ../contract && cargo build --target wasm32-unknown-unknown --release
```

# Level 4 Delivery Requirements

Here is a summary of all the requirements for the Level 4 Deliverable:

- **Live Demo:** [Vercel Deployment](https://frontend-282amsr20-akankshapatil99s-projects.vercel.app/)
- **Mobile Responsive View:** See the [Mobile Responsive Design](#mobile-responsive-design) section or watch the [Mobile Demo Video](./l2ss/phone%20recording.mp4).
- **CI/CD Pipeline Running:** [GitHub Actions Workflow](https://github.com/akankshapatil99/stellar-level-3-4/actions/workflows/ci.yml)
- **Contract Addresses & Transaction Hash (Inter-Contract Calls):**
  - Nexus Platform Contract: `CBZ7ZPWXXWSHXWDLH2ZFC5XS66HAWWJZRJP3YC5BZ773KWLZPPRDKM3M`
  - Inter-Contract Call Token (XLM): `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC`
  - **Sample Transaction Hash (Donation Call):** `[INSERT_TX_HASH_HERE]` (Placeholder - add your transaction hash here!)
- **Token Address (Custom NXS Reward Token):**
  - NXS Reward Token: `CDYGYOYQA7C35QDS4YSPZEHSVAOD4AEKXO2IABOGUVX7XJSQ4Y34MHDC`
- **8+ Meaningful Commits:** See the [8 Meaningful Commits](#8-meaningful-commits) section.


# Community & Support
- **Developer**: Akanksha Patil
- **Network**: Stellar Testnet (Soroban)
- **Discord**: [Stellar Developers](https://discord.gg/stellardev)


