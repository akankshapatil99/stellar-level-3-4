import { useState, useEffect } from "react";
import { isConnected, requestAccess, signTransaction } from "@stellar/freighter-api";
import { contract, server, Networks, TransactionBuilder } from "./contract";
import { xdr, Address, nativeToScVal, scValToNative } from "@stellar/stellar-sdk";
import html2canvas from "html2canvas";
import "./App.css";

const CAMPAIGNS = [
  {
    id: 1,
    title: "Project Ocean Cleanup",
    desc: "Deploying autonomous systems to remove plastics from our oceans globally.",
    img: "https://images.unsplash.com/photo-1483683804023-6ccdb62f86ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 2,
    title: "Global Reforestation",
    desc: "Planting native trees to restore critical ecosystems and offset carbon footprint.",
    img: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 3,
    title: "Rural Education Tech",
    desc: "Supplying solar-powered laptops and internet access to remote schools.",
    img: "https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  }
];

export default function App() {
  const [address, setAddress] = useState(null);
  const [platformTotal, setPlatformTotal] = useState(0);
  const [campaignTotals, setCampaignTotals] = useState({ 1: 0, 2: 0, 3: 0 });
  const [displayTotal, setDisplayTotal] = useState(0);
  const [status, setStatus] = useState("");
  const [txHash, setTxHash] = useState("");
  const [amounts, setAmounts] = useState({ 1: "", 2: "", 3: "" });
  const [walletType, setWalletType] = useState(null);
  const [showCert, setShowCert] = useState(false);
  const [lastDonation, setLastDonation] = useState({ amount: 0, campaign: "" });
  const [balance, setBalance] = useState(null);
  const [recentTxs, setRecentTxs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const GOAL = 5000; // Platform-wide goal

  useEffect(() => {
    if (displayTotal < platformTotal) {
      const timer = setTimeout(() => {
        setDisplayTotal(prev => Math.min(prev + Math.ceil((platformTotal - prev) / 10), platformTotal));
      }, 50);
      return () => clearTimeout(timer);
    } else if (displayTotal > platformTotal) {
      setDisplayTotal(platformTotal);
    }
  }, [platformTotal, displayTotal]);

  useEffect(() => {
    if (status) {
      // Keep success messages visible longer so users can click the link
      const duration = status.startsWith("Success") ? 10000 : 5000;
      const timer = setTimeout(() => {
        setStatus("");
        setTxHash("");
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [status]);

  // Real-time data polling
  useEffect(() => {
    fetchTotal();
    const interval = setInterval(fetchTotal, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (address) {
      fetchWalletData();
    }
  }, [address]);

  const fetchWalletData = async () => {
    try {
      const account = await server.getAccount(address);
      if (account && account.balances) {
        const xlmBalance = account.balances.find(b => b.asset_type === 'native')?.balance;
        setBalance(xlmBalance || "0");
      }

      // Fetch actual recent transactions from Horizon
      const txs = await server.transactions().forAccount(address).limit(5).order("desc").call();
      if (txs && txs.records) {
        setRecentTxs(txs.records.map(tx => ({
          id: tx.id,
          hash: tx.hash,
          time: new Date(tx.created_at).toLocaleTimeString()
        })));
      }
    } catch (e) {
      console.error("fetchWalletData error:", e);
    }
  };

  const connectWallet = async (type) => {
    try {
      if (type === "freighter") {
        const connected = await isConnected();
        if (!connected) {
          return alert("Freighter extension is not installed or locked.");
        }

        try {
          const result = await requestAccess();
          // requestAccess can return an address string OR an object {address, error} depending on version
          const connectedAddress = typeof result === 'string' ? result : result?.address;

          if (connectedAddress) {
            setAddress(connectedAddress);
            setWalletType("freighter");
          } else if (result?.error) {
            throw new Error(result.error);
          }
        } catch (error) {
          console.error("Freighter access error:", error);
          alert(`Freighter error: ${error.message || error}`);
        }
      } else if (type === "rabet") {
        if (!window.rabet) return alert("Rabet extension is not installed.");
        const result = await window.rabet.connect();
        if (result.publicKey) {
          setAddress(result.publicKey);
          setWalletType("rabet");
        }
      }
    } catch (error) {
      console.error("Wallet connection error:", error);
      alert(`Wallet error: ${error.message || "Unknown error"}`);
    }
  };

  const handleAmountChange = (id, val) => {
    setAmounts(prev => ({ ...prev, [id]: val }));
  };

  const donateToCampaign = async (id) => {
    if (!address) return alert("Please connect your wallet first.");
    const amt = amounts[id];
    if (Number(amt) <= 0) return alert("Enter a valid amount.");

    try {
      setStatus(`Pending: Prompting Freighter for ${amt} XLM`);
      setTxHash("");

      // 1. Fetch account
      const source = await server.getAccount(address);

      // 2. Build transaction operation
      const operation = contract.call(
        "donate",
        new Address(address).toScVal(),
        nativeToScVal(id, { type: "u32" }),
        nativeToScVal(Number(amt), { type: "i128" })
      );

      // 3. Build transaction
      const tx = new TransactionBuilder(source, {
        fee: "1000",
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(operation)
        .setTimeout(30)
        .build();

      // 4. Prepare transaction for Soroban
      const preparedTransaction = await server.prepareTransaction(tx);

      // 5. Sign with the correct wallet
      let signedTxXdrStr;
      if (walletType === "freighter") {
        setStatus(`Pending: Please sign the transaction in Freighter...`);
        const { signedTxXdr, error } = await signTransaction(preparedTransaction.toXDR(), {
          networkPassphrase: Networks.TESTNET
        });
        if (error) throw new Error(error);
        signedTxXdrStr = signedTxXdr;
      } else if (walletType === "rabet") {
        setStatus(`Pending: Please sign the transaction in Rabet...`);
        const result = await window.rabet.sign(preparedTransaction.toXDR(), "testnet");
        if (result.error) throw new Error(result.error);
        signedTxXdrStr = result.xdr;
      } else {
        throw new Error("No wallet connected");
      }

      setStatus(`Pending: Submitting transaction to network...`);

      // 6. Submit to Soroban testnet
      const signedPreparedTx = typeof signedTxXdrStr === 'string'
        ? TransactionBuilder.fromXDR(signedTxXdrStr, Networks.TESTNET)
        : signedTxXdrStr;

      const response = await server.sendTransaction(signedPreparedTx);

      if (response.status === "ERROR") {
        throw new Error("Transaction submission failed.");
      }

      // 7. Wait for transaction to complete
      let getTxResponse = await server.getTransaction(response.hash);
      while (getTxResponse.status === "NOT_FOUND") {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        getTxResponse = await server.getTransaction(response.hash);
      }

      if (getTxResponse.status === "SUCCESS") {
        setStatus("Success: Donation completed!");
        setTxHash(response.hash);

        const campaignTitle = CAMPAIGNS.find(c => c.id === id)?.title;
        setLastDonation({ amount: amt, campaign: campaignTitle });
        setShowCert(true);

        fetchTotal();
        fetchWalletData();
        setAmounts(prev => ({ ...prev, [id]: "" }));
      } else {
        throw new Error(`Transaction failed: ${getTxResponse.resultMetaXdr}`);
      }

    } catch (e) {
      console.error(e);
      setStatus(`Failed: ${e.message}`);
    }
  };

  const fetchTotal = async () => {
    try {
      const sourceAccount = await server.getAccount(address || "GBGJCHXLEFP66DSM2J5DACLDTHQG6CDTSU7ZX2HNFQN627BT5GF7XG4G");

      // Fetch platform total
      const platTx = new TransactionBuilder(sourceAccount, { fee: "100", networkPassphrase: Networks.TESTNET })
        .addOperation(contract.call("get_platform_total"))
        .setTimeout(30)
        .build();
      const platSim = await server.simulateTransaction(platTx);
      if (platSim.result?.retval) {
        setPlatformTotal(Number(scValToNative(platSim.result.retval)));
      }

      // Fetch individual campaign totals
      const newTotals = { ...campaignTotals };
      for (const camp of CAMPAIGNS) {
        const tx = new TransactionBuilder(sourceAccount, { fee: "100", networkPassphrase: Networks.TESTNET })
          .addOperation(contract.call("get_total", nativeToScVal(camp.id, { type: "u32" })))
          .setTimeout(30)
          .build();
        const sim = await server.simulateTransaction(tx);
        if (sim.result?.retval) {
          newTotals[camp.id] = Number(scValToNative(sim.result.retval));
        }
      }
      setCampaignTotals(newTotals);
    } catch (e) {
      console.error("fetchTotal error:", e);
    }
  };

  const [showWalletModal, setShowWalletModal] = useState(false);

  const disconnectWallet = () => {
    setAddress(null);
    setWalletType(null);
  };

  const handleWalletSelect = (type) => {
    setShowWalletModal(false);
    connectWallet(type);
  }

  const downloadCertificate = () => {
    const certElement = document.querySelector(".cert-border");
    if (certElement) {
      html2canvas(certElement, { backgroundColor: '#111827' }).then(canvas => {
        const link = document.createElement('a');
        link.download = 'nexus_gratitude_certificate.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    }
  };

  const filteredCampaigns = CAMPAIGNS.filter(camp =>
    camp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    camp.desc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="app-container">
      <div className="orbs-container">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>
      <header className="header">
        <div className="title">Nexus</div>
        <div className="header-actions">
          {address && (
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <div className="wallet-info">
                <div className="wallet-balance">{balance ? `${Number(balance).toFixed(2)} XLM` : '0.00 XLM'}</div>
                <div className="wallet-address">
                  {walletType === "freighter" ? "Freighter: " : "Rabet: "}
                  {String(address || "").substring(0, 5)}...{String(address || "").substring(String(address || "").length - 4)}
                </div>
              </div>
              <button className="wallet-btn" style={{ padding: '8px 16px' }} onClick={disconnectWallet}>
                Sign Out
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="dashboard-top">
        <div className="hero-section">
          <h1 className="hero-title">Empower Global Change with Stellar.</h1>
          <p className="hero-subtitle">
            Nexus is a fully decentralized crowdfunding platform built on the Soroban Testnet.
            Contribute to critical causes with 100% transparency.
          </p>

          {!address && (
            <div className="hero-wallets" style={{ padding: '20px' }}>
              <button className="wallet-btn-large" onClick={() => setShowWalletModal(true)}>
                <span>Connect Wallet</span>
              </button>
            </div>
          )}
        </div>

        <section className="global-stats">
          <div className="stats-card">
            <h2>Total Impact Raised <span>{displayTotal} XLM</span></h2>
            <div className="progress-bar-container">
              <div
                className="progress-bar-fill"
                style={{ width: `${Math.min((platformTotal / GOAL) * 100, 100)}%` }}
              />
            </div>
            <p className="goal-text">Platform Goal: {GOAL} XLM</p>
          </div>
        </section>
      </div>

      <div className="search-section" style={{ padding: '0 2rem 2rem 2rem', textAlign: 'center' }}>
        <input
          type="text"
          placeholder="Search for causes (e.g., Ocean, Education)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <main className="campaigns-grid">
        {filteredCampaigns.length > 0 ? filteredCampaigns.map((camp) => (
          <div key={camp.id} className="campaign-card">
            <div className="campaign-image-wrapper">
              <img src={camp.img} alt={camp.title} className="campaign-image" />
            </div>
            <div className="campaign-content">
              <h3 className="campaign-title">{camp.title}</h3>
              <p className="campaign-desc">{camp.desc}</p>

              <div className="campaign-footer">
                <div className="campaign-stats">
                  <div className="stat-label">Impact Metric</div>
                  <div className="stat-value">{Math.floor((campaignTotals[camp.id] / (GOAL / 3)) * 100)}% Funded</div>
                </div>
                <div className="micro-progress">
                  <div className="micro-fill" style={{ width: `${Math.min((campaignTotals[camp.id] / (GOAL / 3)) * 100, 100)}%` }}></div>
                </div>

                <div className="donate-section">
                  <div className="input-group">
                    <input
                      type="number"
                      placeholder="0.00"
                      className="amount-input"
                      value={amounts[camp.id]}
                      onChange={(e) => handleAmountChange(camp.id, e.target.value)}
                    />
                    <span className="input-suffix">XLM</span>
                  </div>
                  <button
                    className="donate-btn"
                    onClick={() => donateToCampaign(camp.id)}
                    disabled={status.startsWith("Pending")}
                  >
                    Contribute
                  </button>
                </div>
              </div>
            </div>
          </div>
        )) : (
          <div style={{ color: '#ccc', textAlign: 'center', gridColumn: '1 / -1', padding: '2rem' }}>
            No campaigns found matching "{searchTerm}"
          </div>
        )}
      </main>

      <div className={`status-toast ${status ? 'visible' : ''} ${status.split(':')[0]}`}>
        <div>{status}</div>
        {txHash && (
          <a
            href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              marginTop: '8px',
              color: '#0d9488',
              textDecoration: 'underline',
              fontSize: '0.85rem'
            }}
          >
            View on Stellar Expert
          </a>
        )}
      </div>

      {
        showCert && (
          <div className="cert-overlay" onClick={() => setShowCert(false)}>
            <div className="cert-modal" onClick={e => e.stopPropagation()}>
              <div className="cert-border" style={{ padding: '2rem', background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)', border: '5px solid #0d9488', borderRadius: '15px', textAlign: 'center' }}>
                <div className="cert-content">
                  <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🥇</div>
                  <h2 className="cert-title" style={{ fontFamily: '"Playfair Display", serif', color: '#14b8a6', fontSize: '2.5rem', margin: '0' }}>Certificate of Gratitude</h2>
                  <div className="cert-divider" style={{ width: '100px', height: '3px', backgroundColor: '#0d9488', margin: '20px auto' }}></div>
                  <p className="cert-text" style={{ fontSize: '1.2rem', color: '#d1d5db', fontStyle: 'italic' }}>This formally certifies that</p>
                  <h3 className="cert-address" style={{ fontSize: '1.1rem', color: '#fff', margin: '10px 0', wordBreak: 'break-all' }}>{String(address || "Unknown Address")}</h3>
                  <p className="cert-text" style={{ fontSize: '1.2rem', color: '#d1d5db', fontStyle: 'italic' }}>has generously contributed a sum of</p>
                  <h2 className="cert-amount" style={{ fontSize: '2.5rem', color: '#f59e0b', margin: '15px 0' }}>{lastDonation.amount} XLM</h2>
                  <p className="cert-text" style={{ fontSize: '1.2rem', color: '#d1d5db', fontStyle: 'italic' }}>to actively support and champion</p>
                  <h3 className="cert-campaign" style={{ fontSize: '1.8rem', color: '#fff', margin: '15px 0' }}>"{lastDonation.campaign}"</h3>
                  <div className="cert-divider" style={{ width: '80%', height: '1px', backgroundColor: '#374151', margin: '20px auto' }}></div>
                  <p className="cert-footer" style={{ fontSize: '0.9rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px' }}>Secured Decentrally on the Stellar Soroban Network</p>
                  <a href={`https://stellar.expert/explorer/testnet/tx/${txHash}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                    <p className="cert-hash" style={{ fontSize: '0.85rem', color: '#14b8a6', marginTop: '10px', textDecoration: 'underline' }}>View Tx Hash: {txHash?.substring(0, 20)}... on Stellar Expert</p>
                  </a>
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '15px', marginTop: '20px' }}>
                <button className="cert-close-btn" onClick={() => setShowCert(false)} style={{ background: '#374151', color: 'white', padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer' }}>Close</button>
                <button className="cert-close-btn" onClick={downloadCertificate} style={{ background: '#0d9488', color: 'white', padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer' }}>Download Certificate</button>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <a href={`https://stellar.expert/explorer/testnet/tx/${txHash}`} target="_blank" rel="noopener noreferrer">
                    <button className="cert-close-btn" style={{ background: '#2563eb', color: 'white', padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer' }}>View on Stellar Expert</button>
                  </a>
                  <p style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '5px' }}>(May take ~15s to index)</p>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {
        showWalletModal && (
          <div className="cert-overlay" onClick={() => setShowWalletModal(false)}>
            <div className="cert-modal wallet-modal" onClick={e => e.stopPropagation()}>
              <h2 className="modal-title">Select Wallet</h2>
              <div className="wallet-options">
                <button className="wallet-option-btn" onClick={() => handleWalletSelect("freighter")}>
                  <span className="btn-title">Freighter</span>
                  <span className="btn-desc">Stellar's Official Wallet</span>
                </button>
                <button className="wallet-option-btn" onClick={() => handleWalletSelect("rabet")}>
                  <span className="btn-title">Rabet</span>
                  <span className="btn-desc">Open-source Multi-Chain</span>
                </button>
              </div>
              <button className="modal-cancel-btn" onClick={() => setShowWalletModal(false)}>Cancel</button>
            </div>
          </div>
        )
      }
      {
        address && recentTxs.length > 0 && (
          <section className="recent-activity">
            <h3 className="section-title">Your Recent Blockchain Activity</h3>
            <div className="tx-list">
              {recentTxs.map(tx => (
                <a
                  key={tx.id}
                  href={`https://stellar.expert/explorer/testnet/tx/${tx.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tx-item"
                >
                  <span className="tx-status-pill">SUCCESS</span>
                  <span className="tx-hash-display">Hash: {tx.hash.substring(0, 20)}...</span>
                  <span className="tx-time-display">{tx.time}</span>
                </a>
              ))}
            </div>
          </section>
        )
      }
    </div >
  );
}
