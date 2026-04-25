import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft, Copy, Check, ExternalLink, AlertTriangle } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

const HubDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { member } = useAuth();

  const collection = useQuery(api.hub.getBySlug, { slug: slug || "" });
  const logContribution = useMutation(api.hub.logContribution);

  const [showPayment, setShowPayment] = useState(false);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (collection === undefined) {
    return <div className="loading">Loading collection...</div>;
  }

  if (collection === null) {
    return (
      <div className="error-state">
        <p>This collection is no longer active.</p>
        <button onClick={() => navigate("/hub")} className="btn-secondary">Back to Hub</button>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(collection.desired_memo);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !member) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await logContribution({
        collectionId: collection._id,
        memberId: member._id as any,
        amount: parseFloat(amount),
        note: note || undefined
      });

      setIsSuccess(true);
      setAmount("");
      setNote("");
      // Reset success message after 5 seconds
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (err: any) {
      setError(err.message || "Failed to log contribution.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="hub-detail">
      <header className="header">
        <button onClick={() => navigate("/hub")} className="back-btn">
          <ArrowLeft size={20} />
        </button>
        <h1>{collection.title}</h1>
      </header>

      <section className="summary">
        <h1>{collection.title}</h1>
        {collection.amount_display && <p className="meta">{collection.amount_display}</p>}
        <div className="stats-row">
          <span>${collection.totalRaised.toLocaleString()} raised</span>
          <span>·</span>
          <span>{collection.contributorCount} contributors</span>
        </div>
      </section>

      <section className="contributors">
        <h2>Who's contributed</h2>
        {collection.contributorNames.length === 0 ? (
          <p className="meta">Be the first to contribute.</p>
        ) : (
          <div className="contributor-list">
            {collection.contributorNames.map((name: string, i: number) => (
              <span key={i} className="contributor-pill">{name}</span>
            ))}
          </div>
        )}
      </section>

      {!showPayment ? (
        <button className="btn-primary" onClick={() => setShowPayment(true)}>
          I want to contribute
        </button>
      ) : (
        <div className="payment-reveal animate-slide-up">
          <div className="payment-card">
            <h3>Send via Zelle</h3>
            
            <div className="qr-container">
              <QRCodeSVG value={collection.payment_url} size={160} />
              <a href={collection.payment_url} target="_blank" rel="noreferrer" className="zelle-link">
                Open Zelle <ExternalLink size={14} />
              </a>
            </div>

            <div className="memo-box">
              <span className="label">Memo:</span>
              <div className="memo-chip" onClick={handleCopy}>
                <code>{collection.desired_memo}</code>
                {copied ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
              </div>
            </div>

            <div className="warning-note">
              <AlertTriangle size={18} />
              <p>Send the payment first, then log it below.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="log-form">
            <div className="input-group">
              <label>Amount (USD) *</label>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="input-group">
              <label>Note (optional)</label>
              <textarea
                rows={2}
                placeholder="Optional message..."
                value={note}
                onChange={e => setNote(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            {error && <p className="error-text">{error}</p>}
            {isSuccess && <p className="success-text">Logged! Thank you.</p>}

            <button 
              type="submit" 
              className="btn-primary" 
              disabled={isSubmitting || !amount}
            >
              {isSubmitting ? "Logging..." : "Log my contribution"}
            </button>
          </form>
        </div>
      )}

      <style>{`
        .hub-detail { padding-top: 60px; }
        .header {
          position: fixed; top: 0; left: 0; right: 0; height: 60px;
          background: var(--background); border-bottom: 1px solid var(--border);
          display: flex; align-items: center; padding: 0 20px; z-index: 100; gap: 16px;
        }
        @media (min-width: 768px) {
          .header { max-width: 480px; left: 50%; transform: translateX(-50%); }
        }
        .header h1 { font-size: 18px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .back-btn { background: none; color: var(--text-primary); padding: 8px; margin-left: -8px; }

        .summary { padding: 24px 0; border-bottom: 1px solid var(--border); margin-bottom: 24px; }
        .summary h1 { margin-bottom: 4px; }
        .stats-row { display: flex; gap: 8px; color: var(--text-secondary); font-size: 14px; margin-top: 4px; }

        .contributors { margin-bottom: 32px; }
        .contributors h2 { margin-bottom: 12px; }
        .contributor-list { display: flex; flex-wrap: wrap; gap: 8px; }
        .contributor-pill { 
          background: var(--surface); border: 1px solid var(--border); 
          padding: 6px 12px; border-radius: 20px; font-size: 13px;
        }

        .payment-card { 
          background: var(--surface); border: 1px solid var(--border); 
          border-radius: var(--radius); padding: 20px; margin-bottom: 24px;
        }
        .payment-card h3 { text-align: center; margin-bottom: 16px; }
        .qr-container { display: flex; flex-direction: column; align-items: center; gap: 12px; margin-bottom: 20px; }
        .zelle-link { 
          display: flex; align-items: center; gap: 6px; 
          color: var(--accent); font-weight: 500; text-decoration: none; font-size: 14px;
        }
        
        .memo-box { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
        .memo-box .label { font-size: 13px; color: var(--text-secondary); }
        .memo-chip { 
          background: var(--background); border: 1px solid var(--border); padding: 12px;
          border-radius: var(--radius); display: flex; justify-content: space-between; align-items: center;
          cursor: pointer;
        }
        .memo-chip code { font-family: monospace; font-size: 15px; }

        .warning-note { 
          background: var(--warning-bg); color: var(--warning-text);
          padding: 12px; border-radius: var(--radius); display: flex; gap: 12px; align-items: center;
          font-size: 13px; font-weight: 500;
        }

        .log-form { display: flex; flex-direction: column; gap: 16px; margin-bottom: 40px; }
        .input-group label { display: block; font-weight: 600; margin-bottom: 8px; font-size: 14px; }
        .error-text { color: var(--error); font-size: 14px; text-align: center; }
        .success-text { color: var(--success); font-size: 14px; text-align: center; font-weight: 600; }

        .animate-slide-up { animation: slideUp 0.3s ease-out; }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        
        .loading { text-align: center; padding: 40px; color: var(--text-secondary); }
      `}</style>
    </div>
  );
};

export default HubDetail;
