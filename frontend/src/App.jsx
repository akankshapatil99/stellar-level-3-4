import { useState, useEffect } from "react";
import { isConnected, requestAccess, signTransaction } from "@stellar/freighter-api";
import { contract, server, Networks, TransactionBuilder } from "./contract";
import { xdr, Address, nativeToScVal, scValToNative, Horizon } from "@stellar/stellar-sdk";
import html2canvas from "html2canvas";
import { Link, Routes, Route, useNavigate, useParams } from "react-router-dom";
import "./App.css";
import { GOAL, BASE_PLATFORM_TOTAL, BASE_CAMPAIGN_TOTALS, CAMPAIGNS } from "./config";

const CampaignDetailRoute = ({ campaigns, campaignTotals, amounts, handleAmountChange, donateToCampaign, status, GOAL, navigate }) => {
  const { id } = useParams();
  const campaign = campaigns.find(c => c.id === parseInt(id));
  if (!campaign) return <div style={{ padding: "100px", textAlign: "center", color: 'var(--text-bold)' }}><h1>Campaign Not Found</h1></div>;

  return (
    <div className="campaign-detail-page" style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px' }}>
      <button onClick={() => navigate('/campaigns')} style={{ background: 'transparent', border: '1px solid var(--border)', padding: '10px 20px', borderRadius: '10px', color: 'var(--text-main)', cursor: 'pointer', marginBottom: '30px' }}>← Back to Campaigns</button>

      <div style={{ background: 'var(--white)', borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ height: '400px', backgroundImage: `url(${campaign.img})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
        <div style={{ padding: '50px' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '20px', color: 'var(--text-bold)' }}>{campaign.title}</h1>

          <div style={{ display: 'flex', gap: '15px', margin: '10px 0', fontSize: '1rem', color: '#64748b', marginBottom: '30px' }}>
            <span style={{ background: 'var(--bg-main)', padding: '8px 16px', borderRadius: '4px', border: '1px solid var(--border)' }}>Location: {campaign.location}</span>
            <span style={{ background: 'var(--bg-main)', padding: '8px 16px', borderRadius: '4px', border: '1px solid var(--border)' }}>Organizer: {campaign.organizer}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', padding: '30px', background: 'var(--bg-main)', borderRadius: '20px', border: '1px solid var(--border)', marginBottom: '40px' }}>
            <div>
              <span style={{ display: 'block', fontSize: '0.9rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700', marginBottom: '5px' }}>Raised</span>
              <span style={{ display: 'block', fontSize: '1.8rem', fontWeight: '800', color: 'var(--accent)' }}>{campaignTotals[campaign.id] || 0} XLM</span>
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '0.9rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700', marginBottom: '5px' }}>Target</span>
              <span style={{ display: 'block', fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-bold)' }}>~{Math.floor(GOAL / 3)} XLM</span>
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '0.9rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700', marginBottom: '5px' }}>Progress</span>
              <span style={{ display: 'block', fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-bold)' }}>{Math.floor(((campaignTotals[campaign.id] || 0) / (GOAL / 3)) * 100)}%</span>
            </div>
          </div>

          <div style={{ marginBottom: '40px' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '15px', color: 'var(--text-bold)' }}>About the Campaign</h3>
            <p style={{ color: '#64748b', lineHeight: '1.8', fontSize: '1.1rem' }}>{campaign.longDesc}</p>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '40px' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '20px', color: 'var(--text-bold)' }}>Contribute Now</h3>
            <div className="donate-section" style={{ maxWidth: '500px' }}>
              <div className="input-group">
                <input
                  type="number"
                  placeholder="0.00"
                  className="amount-input"
                  value={amounts[campaign.id] || ""}
                  onChange={(e) => handleAmountChange(campaign.id, e.target.value)}
                />
                <span className="input-suffix">XLM</span>
              </div>
              <button
                className="donate-btn"
                onClick={() => donateToCampaign(campaign.id)}
                disabled={status.startsWith("Pending")}
              >
                Contribute
              </button>
              <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 16V12" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 8H12.01" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Contributes via <strong>Inter-Contract Token Call</strong> on Soroban.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TransactionsRoute = ({ address, recentTxs, navigate }) => {
  if (!address) {
    return (
      <div style={{ padding: '100px', textAlign: 'center' }}>
        <h2 className="section-heading">Connect your wallet to view history.</h2>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px' }}>
      <button onClick={() => navigate('/')} style={{ background: 'transparent', border: '1px solid var(--border)', padding: '10px 20px', borderRadius: '4px', color: 'var(--text-main)', cursor: 'pointer', marginBottom: '30px' }}>&larr; Back to Dashboard</button>
      <h2 className="section-heading" style={{ textAlign: 'left', marginBottom: '40px' }}>Transaction History</h2>
      {recentTxs.length === 0 ? (
        <p style={{ color: '#64748b', fontSize: '1.2rem' }}>No recent transactions found for this account.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {recentTxs.map(tx => (
            <a
              key={tx.id}
              href={`https://stellar.expert/explorer/testnet/tx/${tx.hash}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '30px',
                background: 'var(--white)',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'all 0.3s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <span style={{ background: 'var(--accent-soft)', color: 'var(--accent)', padding: '8px 16px', borderRadius: '4px', fontWeight: '700', fontSize: '0.9rem' }}>SUCCESS</span>
                <div>
                  <div style={{ fontWeight: '700', color: 'var(--text-bold)', fontSize: '1.1rem', marginBottom: '5px' }}>Tx Hash: {tx.hash.substring(0, 15)}...</div>
                  <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{tx.time}</div>
                </div>
              </div>
              <div style={{ color: 'var(--accent)', fontWeight: '600', fontSize: '0.9rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>View details &rarr;</div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

const AboutRoute = ({ navigate }) => {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '60px 40px' }}>
      <button onClick={() => navigate('/')} style={{ background: 'transparent', border: '1px solid var(--border)', padding: '10px 20px', borderRadius: '4px', color: 'var(--text-main)', cursor: 'pointer', marginBottom: '30px' }}>&larr; Back to Dashboard</button>

      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <h1 className="hero-title" style={{ fontSize: '3.5rem', marginBottom: '20px' }}>Our Mission</h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-main)', lineHeight: '1.8', maxWidth: '800px', margin: '0 auto' }}>
          Nexus was founded on the belief that charitable giving should be verifiable, borderless, and mathematically secure. We use the Stellar blockchain to ensure that every drop of capital reaches its exact intended destination without bureaucratic friction.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginTop: '60px' }}>
        <div style={{ padding: '40px', background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '8px', boxShadow: 'var(--shadow)' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-bold)', marginBottom: '15px' }}>The Problem</h3>
          <p style={{ color: 'var(--text-main)', lineHeight: '1.6' }}>Traditional philanthropic infrastructure relies on layers of intermediaries, resulting in delayed fund transfers, opaque allocation of resources, and systemic inefficiencies. Furthermore, international borders construct significant financial barriers.</p>
        </div>
        <div style={{ padding: '40px', background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '8px', boxShadow: 'var(--shadow)' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-bold)', marginBottom: '15px' }}>The Solution</h3>
          <p style={{ color: 'var(--text-main)', lineHeight: '1.6' }}>By leveraging the Soroban Smart Contract network, we disintermediate the donation lifecycle. Capital logic is written in code, ensuring zero human tampering and 100% transparency. When you fund a project, you know precisely where it's going within seconds.</p>
        </div>
      </div>

      <div style={{ marginTop: '80px', paddingTop: '40px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-bold)', marginBottom: '20px' }}>Join the Protocol</h2>
        <p style={{ color: 'var(--text-main)', marginBottom: '30px' }}>Explore active initiatives and begin deploying verified impact today.</p>
        <button className="wallet-btn" onClick={() => navigate('/campaigns')} style={{ padding: '16px 40px', fontSize: '1.1rem' }}>Browse Campaigns</button>
      </div>
    </div>
  );
};

const FeaturesRoute = ({ navigate }) => {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 0' }}>
      <div style={{ padding: '0 40px' }}>
        <button onClick={() => navigate('/')} style={{ background: 'transparent', border: '1px solid var(--border)', padding: '10px 20px', borderRadius: '4px', color: 'var(--text-main)', cursor: 'pointer', marginBottom: '30px' }}>&larr; Back to Dashboard</button>
      </div>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="how-it-works">
        <h2 className="section-heading">How It Works</h2>
        <div className="steps-grid">
          <div className="step-card" style={{ opacity: 0, animation: 'fadeInUp 0.8s ease forwards 0.2s', transform: 'translateY(30px)' }}>
            <div className="step-number">01</div>
            <h3 className="step-title">Connect Wallet</h3>
            <p>Connect securely with your Stellar-compatible wallet like Freighter or Rabet. No tedious sign-ups.</p>
          </div>
          <div className="step-card" style={{ opacity: 0, animation: 'fadeInUp 0.8s ease forwards 0.4s', transform: 'translateY(30px)' }}>
            <div className="step-number">02</div>
            <h3 className="step-title">Choose a Cause</h3>
            <p>Select from verified, impactful campaigns that directly benefit communities and ecosystems across India.</p>
          </div>
          <div className="step-card" style={{ opacity: 0, animation: 'fadeInUp 0.8s ease forwards 0.6s', transform: 'translateY(30px)' }}>
            <div className="step-number">03</div>
            <h3 className="step-title">Fund Instantly</h3>
            <p>Use Soroban smart contracts to route your XLM instantly and transparently to your target initiative.</p>
          </div>
          <div className="step-card" style={{ opacity: 0, animation: 'fadeInUp 0.8s ease forwards 0.8s', transform: 'translateY(30px)' }}>
            <div className="step-number">04</div>
            <h3 className="step-title">Cryptographic Proof</h3>
            <p>Receive your permanent, on-chain Digital Certificate of Gratitude verifying your world-changing impact.</p>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="features-section">
        <h2 className="section-heading">Platform Features</h2>
        <div className="features-grid">
          <div className="feature-card" style={{ opacity: 0, animation: 'fadeInUp 0.8s ease forwards 0.2s', transform: 'translateY(30px)' }}>
            <h3 className="feature-title">100% Transparent</h3>
            <p>All funds are distributed directly to verified causes with no hidden intermediaries.</p>
          </div>
          <div className="feature-card" style={{ opacity: 0, animation: 'fadeInUp 0.8s ease forwards 0.5s', transform: 'translateY(30px)' }}>
            <h3 className="feature-title">Soroban Network</h3>
            <p>Harnessing Stellar's new native smart contracting platform for near-instant transaction finality.</p>
          </div>
          <div className="feature-card" style={{ opacity: 0, animation: 'fadeInUp 0.8s ease forwards 0.8s', transform: 'translateY(30px)' }}>
            <h3 className="feature-title">Multi-Wallet Connect</h3>
            <p>Enjoy robust flexibility with native integration for major Web3 extension wallets simultaneously.</p>
          </div>
        </div>
      </section>
    </div>
  );
};


export default function App() {


  const [address, setAddress] = useState(null);
  const [platformTotal, setPlatformTotal] = useState(BASE_PLATFORM_TOTAL);
  const [campaignTotals, setCampaignTotals] = useState(BASE_CAMPAIGN_TOTALS);
  const [displayTotal, setDisplayTotal] = useState(BASE_PLATFORM_TOTAL);
  const [status, setStatus] = useState("");
  const [txHash, setTxHash] = useState("");
  const [amounts, setAmounts] = useState({ 1: "", 2: "", 3: "", 4: "", 5: "" });
  const [walletType, setWalletType] = useState(null);
  const [showCert, setShowCert] = useState(false);
  const [lastDonation, setLastDonation] = useState({ amount: 0, campaign: "" });
  const [balance, setBalance] = useState(null);
  const [nxsBalance, setNxsBalance] = useState(0);
  const [recentTxs, setRecentTxs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

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
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [status]);

  // Real-time data polling
  useEffect(() => {
    // Load from cache initially
    const cachedPlatformTotal = localStorage.getItem("platformTotal");
    const cachedCampaignTotals = localStorage.getItem("campaignTotals");

    if (cachedPlatformTotal && Number(cachedPlatformTotal) > BASE_PLATFORM_TOTAL) {
      setPlatformTotal(Number(cachedPlatformTotal));
      setDisplayTotal(Number(cachedPlatformTotal));
    }
    if (cachedCampaignTotals) {
      try {
        setCampaignTotals(JSON.parse(cachedCampaignTotals));
      } catch (e) { }
    }

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
      // Fetch standard XLM balance
      if (account && account.balances) {
        const xlmBalance = account.balances.find(b => b.asset_type === 'native')?.balance;
        setBalance(xlmBalance || "0");
      }

      // Fetch Custom Token NXS balance from contract State
      try {
        const nxsTx = new TransactionBuilder(account, { fee: "100", networkPassphrase: Networks.TESTNET })
          .addOperation(contract.call("get_nxs_balance", new Address(address).toScVal()))
          .setTimeout(30)
          .build();
        const nxsSim = await server.simulateTransaction(nxsTx);
        if (nxsSim.result?.retval) {
          setNxsBalance(Number(scValToNative(nxsSim.result.retval)));
        } else {
          setNxsBalance(0);
        }
      } catch (err) {
        console.error("NXS fetch format error:", err);
      }

      // Fetch actual recent transactions from Horizon
      const horizonServer = new Horizon.Server("https://horizon-testnet.stellar.org");
      const txs = await horizonServer.transactions().forAccount(address).limit(5).order("desc").call();
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
    if (!amt || Number(amt) <= 0) return alert("Please enter a valid donation amount greater than 0 XLM.");

    try {
      setStatus(`Pending: Prompting Freighter for ${amt} XLM`);
      setTxHash("");

      // 1. Fetch account
      const source = await server.getAccount(address);

      // 2. Build transaction operation
      // Note: Passing the XLM token address to fulfill the Inter-contract call token param
      const operation = contract.call(
        "donate",
        new Address(address).toScVal(),
        new Address("CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC").toScVal(),
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
        let newPlatformTotal = Number(scValToNative(platSim.result.retval));
        newPlatformTotal += BASE_PLATFORM_TOTAL;

        setPlatformTotal(newPlatformTotal);
        localStorage.setItem("platformTotal", newPlatformTotal.toString());
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
          newTotals[camp.id] = Number(scValToNative(sim.result.retval)) + (BASE_CAMPAIGN_TOTALS[camp.id] || 0);
        }
      }
      setCampaignTotals(newTotals);

      // Update cache
      localStorage.setItem("campaignTotals", JSON.stringify(newTotals));
    } catch (e) {
      console.error("fetchTotal error:", e);
    } finally {
      setIsLoading(false);
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

  if (isLoading) {
    return (
      <div className="loading-screen" style={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-main)',
        color: 'var(--text-bold)',
        zIndex: 10001
      }}>
        <div className="loader-spinner" style={{
          width: '50px',
          height: '50px',
          border: '3px solid var(--border)',
          borderTop: '3px solid var(--accent)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '20px'
        }}></div>
        <div style={{ fontSize: '1.2rem', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase' }}>Initializing Nexus...</div>
        <style>
          {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
        </style>
      </div>
    );
  }

  return (

    <div className="app-container">
      <header className="menubar-header">
        <div className="menubar-content">
          <div className="hamburger-icon" onClick={() => setIsMenuOpen(true)}>
            &#9776;
          </div>

          <div className="title" style={{ cursor: 'pointer', margin: 0, justifySelf: 'center' }} onClick={() => navigate("/")}>Nexus</div>



          <div className="header-actions">
            {address ? (
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <div className="wallet-info" style={{ display: 'flex', gap: '15px' }}>
                  <div className="wallet-balance" style={{ fontSize: '1rem', background: 'var(--accent)', color: 'white', padding: '0 8px', borderRadius: '4px' }}>
                    {nxsBalance} NXS
                  </div>
                  <div className="wallet-balance" style={{ fontSize: '1rem' }}>{balance ? `${Number(balance).toFixed(2)} XLM` : '0.00 XLM'}</div>
                  <div className="wallet-address" style={{ fontSize: '0.65rem', alignSelf: 'center', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }} onClick={() => {
                    navigator.clipboard.writeText(address);
                    setStatus("Success: Address copied to clipboard!");
                  }}>
                    {walletType === "freighter" ? "Freighter: " : "Rabet: "}
                    {String(address || "").substring(0, 5)}...{String(address || "").substring(String(address || "").length - 4)}
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 4V16C8 17.1046 8.89543 18 10 18H20C21.1046 18 22 17.1046 22 16V6C22 4.89543 21.1046 4 20 4H10C8.89543 4 8 4.89543 8 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M16 2H4C2.89543 2 2 2.89543 2 4V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
                <button className="wallet-btn" style={{ padding: '6px 12px', fontSize: '0.85rem' }} onClick={disconnectWallet}>
                  Sign Out
                </button>
              </div>
            ) : (
              <button className="wallet-btn" style={{ padding: '8px 16px', fontSize: '0.9rem' }} onClick={() => setShowWalletModal(true)}>
                Connect
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="content-padder">
      </div>

      <div className={`side-menu ${isMenuOpen ? 'open' : ''}`}>
        <button className="close-menu-btn" onClick={() => setIsMenuOpen(false)}>✕</button>
        <nav className="side-nav-links">
          <Link to="/" className="side-nav-link" onClick={() => setIsMenuOpen(false)}>Home</Link>
          <Link to="/campaigns" className="side-nav-link" onClick={() => setIsMenuOpen(false)}>Campaigns</Link>
          <Link to="/features" className="side-nav-link" onClick={() => setIsMenuOpen(false)}>Features</Link>
          <Link to="/about" className="side-nav-link" onClick={() => setIsMenuOpen(false)}>Information / About</Link>
          {address && <Link to="/transactions" className="side-nav-link" onClick={() => setIsMenuOpen(false)}>History</Link>}
        </nav>
      </div>

      <Routes>
        <Route path="/" element={
          <>
            <div className="dashboard-top">
              <div className="hero-section">
                <h1 className="hero-title">Empower Global Change with Stellar.</h1>
                <p className="hero-subtitle">
                  Nexus is a fully decentralized crowdfunding platform built on the Soroban Testnet.
                  Contribute to critical causes with 100% transparency.
                </p>

                {!address && (
                  <div className="hero-wallets" style={{ padding: '20px', animation: 'floatOrb 6s ease-in-out infinite alternate', display: 'inline-block' }}>
                    <button className="wallet-btn-large" onClick={() => setShowWalletModal(true)} style={{ background: 'linear-gradient(135deg, #0f172a 0%, #3b82f6 100%)', boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.5)', border: 'none' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M19 7H5C3.89543 7 3 7.89543 3 9V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V9C21 7.89543 20.1046 7 19 7Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M16 13H18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M3 11V9C3 7.89543 3.89543 7 5 7H19C20.1046 7 21 7.89543 21 9V11" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Connect Wallet
                      </span>
                    </button>
                  </div>
                )}
              </div>

              <section className="global-stats">
                <div className="stats-card" style={{ transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02) translateY(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1) translateY(0)'}>
                  <h2>Total Impact Raised
                    {isLoading && <span className="loading-spinner"></span>}
                    {!isLoading && <span>{displayTotal} XLM</span>}
                  </h2>
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

            <div style={{ textAlign: 'center', margin: '80px 0 40px 0' }}>
              <button
                className="learn-more-btn"
                style={{
                  background: 'linear-gradient(135deg, #0f172a 0%, #3b82f6 100%)',
                  color: 'white',
                  padding: '16px 40px',
                  fontSize: '1rem',
                  borderRadius: '30px',
                  border: 'none',
                  fontWeight: '600',
                  letterSpacing: '0.5px',
                  boxShadow: '0 10px 20px -5px rgba(59, 130, 246, 0.4)',
                  transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 15px 25px -5px rgba(59, 130, 246, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 10px 20px -5px rgba(59, 130, 246, 0.4)';
                }}
                onClick={() => setShowPlatformDetails(true)}
              >
                View Platform Architecture
              </button>
            </div>

            {showPlatformDetails && (
              <div className="cert-overlay" onClick={() => setShowPlatformDetails(false)} style={{ overflowY: 'auto', padding: '40px 10px', alignItems: 'flex-start' }}>
                <div className="cert-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px', padding: '50px', background: 'var(--bg-main)', margin: 'auto' }}>
                  <button className="close-modal-icon" style={{ top: '20px', right: '20px', color: 'black', background: '#eee' }} onClick={() => setShowPlatformDetails(false)}>✕</button>
                  <h2 className="section-heading" style={{ fontSize: '2.2rem', marginBottom: '40px' }}>Nexus Architecture</h2>

                  <div style={{ marginBottom: '35px', opacity: 0, animation: 'fadeInUp 0.6s ease forwards 0.1s' }}>
                    <h3 style={{ color: 'var(--text-bold)', fontSize: '1.25rem', marginBottom: '10px', fontWeight: '600' }}>1. Seamless Web3 Authentication</h3>
                    <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: '1.7' }}>Skip traditional account creation. By connecting your Stellar wallet (like Freighter), you establish a secure, cryptographic link that acts as your private identity. This decentralized method guarantees that you always retain 100% custody and control of your assets, without relying on centralized databases.</p>
                  </div>

                  <div style={{ marginBottom: '35px', opacity: 0, animation: 'fadeInUp 0.6s ease forwards 0.2s' }}>
                    <h3 style={{ color: 'var(--text-bold)', fontSize: '1.25rem', marginBottom: '10px', fontWeight: '600' }}>2. Verified Campaign Selection</h3>
                    <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: '1.7' }}>Browse a carefully reviewed list of impactful campaigns across India. We provide clear data and goals for each project, so you know exactly where your help is needed and the change it will bring about.</p>
                  </div>

                  <div style={{ marginBottom: '35px', opacity: 0, animation: 'fadeInUp 0.6s ease forwards 0.3s' }}>
                    <h3 style={{ color: 'var(--text-bold)', fontSize: '1.25rem', marginBottom: '10px', fontWeight: '600' }}>3. Instant & Direct Transfers</h3>
                    <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: '1.7' }}>Send funds directly using the Soroban smart contract network. Transactions complete in seconds with practically no fees, ensuring that 100% of your donation goes straight to the campaign without middlemen taking a cut.</p>
                  </div>

                  <div style={{ marginBottom: '35px', opacity: 0, animation: 'fadeInUp 0.6s ease forwards 0.4s' }}>
                    <h3 style={{ color: 'var(--text-bold)', fontSize: '1.25rem', marginBottom: '10px', fontWeight: '600' }}>4. Built on Trust</h3>
                    <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: '1.7' }}>Nexus runs entirely on smart contracts on the Stellar network. The rules are written in code, meaning your funds can only ever go to their intended destination. No intermediaries can block or divert your contribution.</p>
                  </div>

                  <div style={{ marginBottom: '35px', opacity: 0, animation: 'fadeInUp 0.6s ease forwards 0.5s' }}>
                    <h3 style={{ color: 'var(--text-bold)', fontSize: '1.25rem', marginBottom: '10px', fontWeight: '600' }}>5. Permanent Proof of Impact</h3>
                    <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: '1.7' }}>After a successful donation, you'll receive a unique Digital Certificate of Gratitude. This acts as a permanent, verifiable record of your contribution that lives securely on the public blockchain.</p>
                  </div>

                  <div style={{ opacity: 0, animation: 'fadeInUp 0.6s ease forwards 0.6s' }}>
                    <h3 style={{ color: 'var(--text-bold)', fontSize: '1.25rem', marginBottom: '10px', fontWeight: '600' }}>6. Fast Global Giving</h3>
                    <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: '1.7' }}>Powered by the Stellar network, Nexus makes borderless giving effortless. Whether you're sending a few cents or a large amount, your transaction settles securely around the world usually within seconds.</p>
                  </div>
                </div>
              </div>
            )}

            {/* IMPACT REPORT SECTION */}
            <section style={{ padding: '80px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px' }}>
                <h2 className="section-heading">Verified Real-World Impact</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px', marginTop: '40px' }}>
                  <div style={{ background: 'var(--white)', border: '1px solid var(--border)', padding: '40px', borderRadius: '8px', textAlign: 'center', opacity: 0, animation: 'fadeInUp 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards 0.2s', transform: 'translateY(20px)' }}>
                    <div style={{ fontSize: '3.5rem', fontWeight: '800', color: 'var(--text-bold)', marginBottom: '10px' }}>14K+</div>
                    <div style={{ color: 'var(--text-main)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem' }}>Trees Planted</div>
                  </div>
                  <div style={{ background: 'var(--white)', border: '1px solid var(--border)', padding: '40px', borderRadius: '8px', textAlign: 'center', opacity: 0, animation: 'fadeInUp 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards 0.4s', transform: 'translateY(20px)' }}>
                    <div style={{ fontSize: '3.5rem', fontWeight: '800', color: 'var(--text-bold)', marginBottom: '10px' }}>2.1M</div>
                    <div style={{ color: 'var(--text-main)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem' }}>Liters Water Purified</div>
                  </div>
                  <div style={{ background: 'var(--white)', border: '1px solid var(--border)', padding: '40px', borderRadius: '8px', textAlign: 'center', opacity: 0, animation: 'fadeInUp 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards 0.6s', transform: 'translateY(20px)' }}>
                    <div style={{ fontSize: '3.5rem', fontWeight: '800', color: 'var(--text-bold)', marginBottom: '10px' }}>500+</div>
                    <div style={{ color: 'var(--text-main)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem' }}>Laptops Distributed</div>
                  </div>
                  <div style={{ background: 'var(--white)', border: '1px solid var(--border)', padding: '40px', borderRadius: '8px', textAlign: 'center', opacity: 0, animation: 'fadeInUp 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards 0.8s', transform: 'translateY(20px)' }}>
                    <div style={{ fontSize: '3.5rem', fontWeight: '800', color: 'var(--text-bold)', marginBottom: '10px' }}>$1.2M</div>
                    <div style={{ color: 'var(--text-main)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem' }}>Value Routed</div>
                  </div>
                </div>
              </div>
            </section>

            {/* PARTNERS SECTION */}
            <section style={{ padding: '80px 0', background: 'var(--white)' }}>
              <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px', textAlign: 'center' }}>
                <h3 style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--text-main)', marginBottom: '40px', fontWeight: '700' }}>Supported By Enterprise Infrastructure</h3>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '60px', flexWrap: 'wrap', opacity: 0.6, filter: 'grayscale(100%)' }}>
                  <div style={{ fontSize: '2rem', fontWeight: '800', fontFamily: 'monospace' }}>STELLAR</div>
                  <div style={{ fontSize: '2rem', fontWeight: '800', fontFamily: 'monospace' }}>SOROBAN</div>
                  <div style={{ fontSize: '2rem', fontWeight: '800', fontFamily: 'serif' }}>Freighter</div>
                  <div style={{ fontSize: '2rem', fontWeight: '600', fontFamily: 'sans-serif' }}>RABET</div>
                </div>
              </div>
            </section>

            {/* FAQ SECTION */}
            <section style={{ padding: '80px 0', borderTop: '1px solid var(--border)' }}>
              <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 40px' }}>
                <h2 className="section-heading" style={{ marginBottom: '50px' }}>Frequently Asked Questions</h2>

                <div style={{ marginBottom: '30px', borderBottom: '1px solid var(--border)', paddingBottom: '20px' }}>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-bold)', marginBottom: '10px' }}>Are there platform fees?</h4>
                  <p style={{ color: 'var(--text-main)', lineHeight: '1.6' }}>Nexus itself charges zero platform fees. The only cost incurred is the baseline Stellar network transaction fee, which is typically fractions of a cent.</p>
                </div>

                <div style={{ marginBottom: '30px', borderBottom: '1px solid var(--border)', paddingBottom: '20px' }}>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-bold)', marginBottom: '10px' }}>How do I know my funds reach the destination?</h4>
                  <p style={{ color: 'var(--text-main)', lineHeight: '1.6' }}>All transactions are executed via Soroban smart contracts. This means you can audit the contract logic and track your execution hash on the public ledger explorer to verify final destination settlement.</p>
                </div>

                <div style={{ marginBottom: '30px', borderBottom: '1px solid var(--border)', paddingBottom: '20px' }}>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-bold)', marginBottom: '10px' }}>What wallets do you support?</h4>
                  <p style={{ color: 'var(--text-main)', lineHeight: '1.6' }}>We currently support the standard Web3 extension wallets for the Stellar ecosystem: Freighter and Rabet. Simply install their browser extensions to begin.</p>
                </div>
              </div>
            </section>

          </>
        } />
        <Route path="/about" element={<AboutRoute navigate={navigate} />} />
        <Route path="/features" element={<FeaturesRoute navigate={navigate} />} />
        <Route path="/campaigns" element={
          <>
            <h2 id="campaigns" className="section-heading" style={{ marginTop: '80px', marginBottom: '20px' }}>Explore Campaigns</h2>
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
                    <button
                      className="learn-more-btn"
                      onClick={() => navigate(`/campaign/${camp.id}`)}
                    >
                      Learn More →
                    </button>

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
                            min="0.01"
                            step="0.01"
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
          </>
        } />

        <Route path="/campaign/:id" element={
          <CampaignDetailRoute
            campaigns={CAMPAIGNS}
            campaignTotals={campaignTotals}
            amounts={amounts}
            handleAmountChange={handleAmountChange}
            donateToCampaign={donateToCampaign}
            status={status}
            GOAL={GOAL}
            navigate={navigate}
          />
        } />

        <Route path="/transactions" element={
          <TransactionsRoute address={address} recentTxs={recentTxs} navigate={navigate} />
        } />

      </Routes>

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
              <div className="cert-border" style={{ padding: '3rem', background: '#fafafa', border: '1px solid #d1d5db', textAlign: 'center' }}>
                <div className="cert-content">
                  <div style={{ fontSize: '0.8rem', letterSpacing: '3px', color: '#64748b', textTransform: 'uppercase', marginBottom: '25px' }}>Official Document</div>
                  <h2 className="cert-title" style={{ fontFamily: '"Playfair Display", Georgia, serif', color: '#0f172a', fontSize: '2.8rem', margin: '0', fontWeight: '400' }}>Certificate of Gratitude</h2>
                  <div className="cert-divider" style={{ width: '80px', height: '2px', backgroundColor: '#0f172a', margin: '30px auto' }}></div>
                  <p className="cert-text" style={{ fontSize: '1.2rem', color: '#475569', fontStyle: 'italic' }}>This formally certifies that</p>
                  <h3 className="cert-address" style={{ fontSize: '1.1rem', color: '#0f172a', margin: '15px 0', wordBreak: 'break-all', fontFamily: 'monospace' }}>{String(address || "Unknown Address")}</h3>
                  <p className="cert-text" style={{ fontSize: '1.2rem', color: '#475569', fontStyle: 'italic' }}>has generously contributed a sum of</p>
                  <h2 className="cert-amount" style={{ fontSize: '2.5rem', color: '#0f172a', margin: '20px 0', fontWeight: '800' }}>{lastDonation.amount} XLM</h2>
                  <p className="cert-text" style={{ fontSize: '1.2rem', color: '#475569', fontStyle: 'italic' }}>to actively support and champion</p>
                  <h3 className="cert-campaign" style={{ fontSize: '1.8rem', color: '#0f172a', margin: '20px 0', fontWeight: '600' }}>"{lastDonation.campaign}"</h3>
                  <div className="cert-divider" style={{ width: '60%', height: '1px', backgroundColor: '#cbd5e1', margin: '30px auto' }}></div>
                  <p className="cert-footer" style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Secured Decentrally on the Stellar Network</p>
                  <a href={`https://stellar.expert/explorer/testnet/tx/${txHash}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                    <p className="cert-hash" style={{ fontSize: '0.8rem', color: '#3b82f6', marginTop: '15px' }}>Reference Hash: {txHash?.substring(0, 20)}...</p>
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

      <footer className="footer">
        <div className="footer-brand">
          <h2>Nexus Crowdfunding</h2>
          <p>The leading decentralized platform powering global change via the Stellar Soroban network. Impact, verified.</p>
        </div>
        <div className="footer-links">
          <div className="footer-col">
            <h4>Platform</h4>
            <ul>
              <li><Link to="/campaigns" onClick={() => window.scrollTo(0, 0)}>Explore</Link></li>
              <li><Link to="/features" onClick={() => window.scrollTo(0, 0)}>How it Works</Link></li>
              <li><Link to="/features" onClick={() => window.scrollTo(0, 0)}>Features</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Connect</h4>
            <ul>
              <li><a href="https://twitter.com/StellarOrg" target="_blank" rel="noopener noreferrer">Twitter</a></li>
              <li><a href="https://discord.gg/stellardev" target="_blank" rel="noopener noreferrer">Discord</a></li>
              <li><a href="https://github.com/stellar" target="_blank" rel="noopener noreferrer">GitHub</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </div >
  );
}
