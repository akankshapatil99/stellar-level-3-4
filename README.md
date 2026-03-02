# Stellar Crowdfunding Level 2

A decentralized crowdfunding application built on the Stellar network. This application features multiple wallet integrations (Freighter, Rabet), dynamic smart contract deployment from the frontend, campaign creation and management, real-time transaction event tracking, and downloadable gratitude certificates for donors.

# Live demo link
https://stunning-pegasus-7d497e.netlify.app/


# Features

- **Multi-Wallet Integration**: Connect seamlessly using Freighter, Rabet wallets.
- **Smart Contract Deployment**: Deploy crowdfunding campaigns directly to the Stellar testnet from the frontend.
- **Real-Time Transaction Updates**: Monitor the status of your transactions directly in the frontend interface.
- **Gratitude Certificates**: Donors receive a shiny, downloadable gratitude certificate upon successfully funding a campaign.
- **Modern UI**: An intuitive layout with polished design, featuring responsive and dynamic elements.

# Screenshots / Demo Video

<video src="l2ss/stellar%20screenrecording.mp4" controls width="100%">
  Your browser does not support the video tag.
</video>

### Platform Walkthrough

Below is a step-by-step visual walkthrough of the platform's features, including viewing campaigns, connecting a wallet, funding a cause, and receiving an on-chain gratitude certificate.

**1. Home / Dashboard**  
<img src="l2ss/Screenshot%202026-03-02%20183316.png" alt="Platform Dashboard" width="800">

**2. Platform Architecture & Information**  
<img src="l2ss/Screenshot%202026-03-02%20183339.png" alt="Platform Architecture" width="800">

**3. Connecting Web3 Wallet (Freighter/Rabet)**  
<img src="l2ss/Screenshot%202026-03-02%20183405.png" alt="Wallet Connection Options" width="800">

**4. Browsing Verified Campaigns**  
<img src="l2ss/Screenshot%202026-03-02%20183451.png" alt="Campaigns Grid" width="800">

**5. Campaign Details & Information**  
<img src="l2ss/Screenshot%202026-03-02%20183502.png" alt="Campaign Details" width="800">

**6. Initiating a Contribution**  
<img src="l2ss/Screenshot%202026-03-02%20183534.png" alt="Donation Input" width="800">

**7. Signing Transaction (Smart Contract Execution)**  
<img src="l2ss/Screenshot%202026-03-02%20183652.png" alt="Smart Contract Signature" width="800">

**8. Transaction Success & Notification**  
<img src="l2ss/Screenshot%202026-03-02%20183719.png" alt="Transaction Toast Notification" width="800">

**9. Generating Gratitude Certificate**  
<img src="l2ss/Screenshot%202026-03-02%20183813.png" alt="Gratitude Certificate Verification" width="800">

**10. Viewing on Stellar.Expert Ledger**  
<img src="l2ss/Screenshot%202026-03-02%20183837.png" alt="Stellar Expert Explorer" width="800">

**11. User Transaction History**  
<img src="l2ss/Screenshot%202026-03-03%20005154.png" alt="Transaction History" width="800">

# Getting Started

# Prerequisites
- Node.js installed
- A Stellar-compatible wallet installed on your browser (Freighter recommended for Soroban testnet compatibility) with Testnet XML XLM loaded.

# Installation

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install the necessary dependencies:
   ```bash
   npm install
   ```
3. Start the local server:
   ```bash
   npm run dev
   ```
   
# Architecture
- **Frontend**: Contains the interactive Vite React app.
- **Contract**: Contains the Stellar Smart Contract configuration needed to execute campaign state on the Soroban testnet.

# Level 2 Features Completed
- **Loading States**: Displayed while loading blockchain totals.
- **Caching**: LocalStorage implemented for fast initial renders.
- **Testing**: Vitest unit testing added with 3 passing tests.
