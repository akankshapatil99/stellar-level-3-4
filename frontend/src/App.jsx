import { useState, useEffect } from "react";
import { isConnected, requestAccess, signTransaction } from "@stellar/freighter-api";
import { contract, server, Networks, TransactionBuilder } from "./contract";
import { xdr, Address, nativeToScVal, scValToNative } from "@stellar/stellar-sdk";
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
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState("");
  const [txHash, setTxHash] = useState("");
  const [amounts, setAmounts] = useState({ 1: "", 2: "", 3: "" });
  const [walletType, setWalletType] = useState(null);
  const [showCert, setShowCert] = useState(false);
  const [lastDonation, setLastDonation] = useState({ amount: 0, campaign: "" });

  const GOAL = 5000; // Platform-wide goal

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

  // Real-time event polling
  useEffect(() => {
    fetchTotal();
    const interval = setInterval(fetchTotal, 5000);
    return () => clearInterval(interval);
  }, []);

  const connectWallet = async (type) => {
    try {
      if (type === "freighter") {
        const { isConnected: connected } = await isConnected();
        if (!connected) {
          return alert("Freighter extension is not installed or locked.");
        }

        const { address, error } = await requestAccess();

        if (error) {
          console.error("Access error:", error);
          return alert(`Freighter error: ${error}`);
        }

        if (address) {
          setAddress(address);
          setWalletType("freighter");
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
      // Create a simulated simulateTransaction for getter
      const sourceAccount = await server.getAccount(address || "GBGJCHXLEFP66DSM2J5DACLDTHQG6CDTSU7ZX2HNFQN627BT5GF7XG4G");
      const tx = new TransactionBuilder(sourceAccount, { fee: "100", networkPassphrase: Networks.TESTNET })
        .addOperation(contract.call("get_total"))
        .setTimeout(30)
        .build();

      const simulation = await server.simulateTransaction(tx);
      if (simulation.results && simulation.results.length > 0) {
        const resultVal = scValToNative(simulation.results[0].retval);
        setTotal(Number(resultVal) || 0);
      }
    } catch (e) {
      console.error("fetchTotal error:", e);
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="title">Nexus</div>
        <div>
          {!address ? (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="wallet-btn" onClick={() => connectWallet("freighter")}>
                Connect Freighter
              </button>
              <button className="wallet-btn" onClick={() => connectWallet("rabet")}>
                Connect Rabet
              </button>
            </div>
          ) : (
            <div className="wallet-connected">
              {walletType === "freighter" ? "Freighter: " : "Rabet: "}
              {address.substring(0, 5)}...{address.substring(address.length - 4)}
            </div>
          )}
        </div>
      </header>

      <div className="hero-section">
        <h1 className="hero-title">Empower Global Change with Stellar Smart Contracts.</h1>
        <p className="hero-subtitle">
          Nexus is a fully decentralized crowdfunding platform built on the Soroban Testnet.
          When you donate to any of the campaigns below, your funds are secured immutably on the Stellar blockchain, offering 100% transparency and near-instant transaction finality.
          Choose your favorite cause and see the collective impact update in real-time.
        </p>

        {!address && (
          <div className="hero-wallets">
            <h3 style={{ color: '#66fcf1', marginBottom: '15px' }}>Connect a wallet to start contributing:</h3>
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
              <button className="wallet-btn-large" onClick={() => connectWallet("freighter")}>
                <span style={{ fontSize: '1.2rem', fontWeight: '800' }}>Connect Freighter</span>
                <span style={{ fontSize: '0.8rem', opacity: 0.8, display: 'block', marginTop: '5px' }}>Stellar's Official Wallet</span>
              </button>
              <button className="wallet-btn-large" onClick={() => connectWallet("rabet")}>
                <span style={{ fontSize: '1.2rem', fontWeight: '800' }}>Connect Rabet</span>
                <span style={{ fontSize: '0.8rem', opacity: 0.8, display: 'block', marginTop: '5px' }}>Open-source Multi-Chain Option</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <section className="global-stats">
        <h2>Total Impact Raised <span>{total} XLM</span></h2>
        <div className="progress-bar-container">
          <div
            className="progress-bar-fill"
            style={{ width: `${Math.min((total / GOAL) * 100, 100)}%` }}
          />
        </div>
      </section>

      <main className="campaigns-grid">
        {CAMPAIGNS.map((camp) => (
          <div key={camp.id} className="campaign-card">
            <img src={camp.img} alt={camp.title} className="campaign-image" />
            <h3 className="campaign-title">{camp.title}</h3>
            <p className="campaign-desc">{camp.desc}</p>

            <div className="donate-section">
              <input
                type="number"
                placeholder="XLM Amount"
                className="amount-input"
                value={amounts[camp.id]}
                onChange={(e) => handleAmountChange(camp.id, e.target.value)}
              />
              <button
                className="donate-btn"
                onClick={() => donateToCampaign(camp.id)}
                disabled={status.startsWith("Pending")}
              >
                Fund It
              </button>
            </div>
          </div>
        ))}
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
              color: '#66fcf1',
              textDecoration: 'underline',
              fontSize: '0.85rem'
            }}
          >
            View on Stellar Expert
          </a>
        )}
      </div>

      {showCert && (
        <div className="cert-overlay" onClick={() => setShowCert(false)}>
          <div className="cert-modal" onClick={e => e.stopPropagation()}>
            <div className="cert-border">
              <div className="cert-content">
                <h2 className="cert-title">Certificate of Gratitude</h2>
                <div className="cert-divider"></div>
                <p className="cert-text">This certifies that</p>
                <h3 className="cert-address">{address}</h3>
                <p className="cert-text">has generously donated</p>
                <h2 className="cert-amount">{lastDonation.amount} XLM</h2>
                <p className="cert-text">to support</p>
                <h3 className="cert-campaign">"{lastDonation.campaign}"</h3>
                <div className="cert-divider"></div>
                <p className="cert-footer">Secured on the Stellar Network</p>
                <p className="cert-hash">Tx: {txHash?.substring(0, 16)}...</p>
                <button className="cert-close-btn" onClick={() => setShowCert(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
