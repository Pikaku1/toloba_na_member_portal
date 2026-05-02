import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft, Copy, Check, ExternalLink, AlertTriangle } from "lucide-react";

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
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="loading-spinner" style={{ color: 'var(--green)' }}></div>
      </div>
    );
  }

  if (collection === null) {
    return (
      <div className="container" style={{ textAlign: 'center', paddingTop: '100px' }}>
        <h2 className="display-font">Collection not found</h2>
        <p className="meta" style={{ margin: '16px 0' }}>This collection is no longer active.</p>
        <button onClick={() => navigate("/hub")} className="btn btn-navy">Back to Hub</button>
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
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (err: any) {
      setError(err.message || "Failed to log contribution.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="hub-detail-page">
      <header className="sticky-header">
        <div className="header-container">
          <button onClick={() => navigate("/hub")} className="back-link">
            <ArrowLeft size={20} />
          </button>
          <h1 className="display-font">{collection.title}</h1>
        </div>
        <div className="double-rule-thin"></div>
      </header>

      <div className="container" style={{ paddingTop: '28px' }}>
        {/* Hero Spread Panel */}
        <div className="card-dark pattern-bg hero-panel">
          <div className="double-rule"></div>
          
          <div className="hero-content">
            <span className="accent-font kicker">COLLECTION</span>
            <h1 className="display-font hero-title">{collection.title}</h1>
            {collection.amount_display && (
              <p className="hero-subtitle">Target: {collection.amount_display}</p>
            )}
            
            <div className="ornament-rule" style={{ margin: '24px auto' }}>
              <span style={{ fontSize: '12px' }}>✦</span>
            </div>
            
            <div className="hero-stats">
              <div className="stat-box">
                <div className="display-font hero-stat-value">${collection.totalRaised.toLocaleString()}</div>
                <div className="accent-font hero-stat-label">RAISED</div>
              </div>
              <div className="stat-box">
                <div className="display-font hero-stat-value">{collection.contributorCount}</div>
                <div className="accent-font hero-stat-label">CONTRIBUTORS</div>
              </div>
            </div>
          </div>

          <div className="double-rule"></div>
        </div>

        {/* Contributors Section */}
        <section className="contributors-section">
          <h3 className="accent-font section-title">WHO'S CONTRIBUTED</h3>
          <div className="ornament-rule-small">
            <span style={{ fontSize: '10px' }}>✦</span>
          </div>

          <div className="contributor-scroll">
            {collection.contributorNames.length === 0 ? (
              <p className="display-font empty-contrib">Be the first to contribute.</p>
            ) : (
              <div className="contributor-chips">
                {collection.contributorNames.map((name: string, i: number) => (
                  <span key={i} className="accent-font contributor-chip">{name}</span>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Action Reveal */}
        {!showPayment ? (
          <button className="btn btn-gold" onClick={() => setShowPayment(true)} style={{ marginTop: '32px' }}>
            I WANT TO CONTRIBUTE
          </button>
        ) : (
          <div className="reveal-content page-transition">
            <div className="card payment-card">
              <div className="accent-font kicker" style={{ color: 'var(--gold-dark)', marginBottom: '16px' }}>PAY VIA ZELLE</div>
              <div className="gold-rule-small"></div>

              <button className="btn btn-gold-ghost" onClick={() => window.open(collection.payment_url, '_blank')} style={{ marginBottom: '24px' }}>
                OPEN ZELLE <ExternalLink size={16} />
              </button>

              <div className="field-label" style={{ color: 'var(--gold-dark)' }}>MEMO</div>
              <div className="memo-container" onClick={handleCopy}>
                <code className="memo-text">{collection.desired_memo}</code>
                {copied ? <Check size={16} style={{ color: 'var(--green)' }} /> : <Copy size={16} style={{ color: 'var(--gold-dark)' }} />}
              </div>

              <div className="warning-panel">
                <AlertTriangle size={18} />
                <p>Send the payment first, then log it in the form below.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="log-form">
              <div className="input-group">
                <label>AMOUNT (USD) *</label>
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
                <label>NOTE (OPTIONAL)</label>
                <textarea
                  rows={2}
                  placeholder="Optional message..."
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  disabled={isSubmitting}
                  style={{ height: 'auto' }}
                />
              </div>

              {error && <p className="field-error" style={{ marginBottom: '16px', justifyContent: 'center' }}>⚠ {error}</p>}
              {isSuccess && (
                <div className="success-inline">
                  <span className="accent-font">✓ LOGGED — THANK YOU.</span>
                </div>
              )}

              <div className="ornament-rule" style={{ margin: '32px 0' }}>
                <span style={{ fontSize: '14px' }}>✦</span>
              </div>

              <button 
                type="submit" 
                className="btn btn-gold" 
                disabled={isSubmitting || !amount}
              >
                {isSubmitting ? <div className="loading-spinner"></div> : "LOG MY CONTRIBUTION"}
              </button>
            </form>
          </div>
        )}
      </div>

      <style>{`
        .hub-detail-page {
          background-color: var(--cream);
          min-height: 100vh;
          padding-top: 64px;
        }

        .sticky-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: var(--green);
          z-index: 100;
        }

        .header-container {
          max-width: 600px;
          margin: 0 auto;
          height: 64px;
          display: flex;
          align-items: center;
          padding: 0 20px;
          gap: 16px;
        }

        .header-container h1 {
          color: var(--white);
          font-size: 17px;
          font-weight: 700;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .back-link {
          background: none;
          border: none;
          color: var(--white);
          display: flex;
          align-items: center;
          padding: 8px;
          margin-left: -8px;
          cursor: pointer;
        }

        .double-rule-thin {
          height: 1px;
          background: var(--gold);
          opacity: 0.6;
        }

        .hero-panel {
          padding: 28px;
          text-align: center;
          position: relative;
          border-radius: var(--radius-sm);
        }

        .hero-panel::after {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at center, 
            var(--navy-mid) 20%, 
            transparent 75%
          );
          pointer-events: none;
        }

        .hero-content {
          position: relative;
          z-index: 1;
          padding: 20px 0;
        }

        .kicker {
          color: var(--gold);
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.18em;
          display: block;
          margin-bottom: 8px;
        }

        .hero-title {
          color: var(--white);
          font-size: 26px;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .hero-subtitle {
          font-family: var(--font-ui);
          font-size: 13px;
          color: rgba(255,255,255,0.55);
        }

        .hero-stats {
          display: flex;
          justify-content: center;
          gap: 48px;
        }

        .hero-stat-value {
          color: var(--white);
          font-size: 36px;
          font-weight: 700;
        }

        .hero-stat-label {
          color: var(--gold);
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.1em;
          margin-top: -4px;
        }

        .contributors-section {
          margin: 40px 0;
          text-align: center;
        }

        .section-title {
          color: var(--gold-dark);
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.12em;
        }

        .ornament-rule-small {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: var(--gold-dark);
          margin-top: 4px;
          margin-bottom: 16px;
        }

        .ornament-rule-small::before,
        .ornament-rule-small::after {
          content: '';
          width: 40px;
          height: 1px;
          background: linear-gradient(to right, transparent, var(--gold-dark));
        }

        .ornament-rule-small::after {
          background: linear-gradient(to left, transparent, var(--gold-dark));
        }

        .contributor-chips {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 8px;
        }

        .contributor-chip {
          background: var(--cream-deep);
          border: 1px solid var(--gold);
          border-radius: var(--radius-sm);
          color: var(--navy);
          font-size: 12px;
          font-weight: 500;
          padding: 6px 14px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .empty-contrib {
          font-style: italic;
          color: var(--ink-muted);
          font-size: 16px;
        }

        .payment-card {
          padding: 24px;
          margin-bottom: 32px;
          text-align: center;
        }

        .btn-gold-ghost {
          background: transparent;
          border: 1.5px solid var(--gold);
          color: var(--gold-dark);
          height: 52px;
          width: 100%;
          border-radius: var(--radius-md);
          font-family: var(--font-ui);
          font-weight: 600;
          letter-spacing: 0.05em;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .memo-container {
          background: var(--cream-deep);
          border: 1.5px solid var(--gold);
          padding: 12px 16px;
          border-radius: var(--radius-sm);
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          margin-top: 8px;
          margin-bottom: 24px;
        }

        .memo-text {
          font-family: 'Courier New', Courier, monospace;
          font-size: 15px;
          font-weight: 700;
          color: var(--ink);
        }

        .warning-panel {
          background: var(--warning-bg);
          border: 1px solid var(--gold);
          color: var(--warning-text);
          padding: 12px 16px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 13px;
          text-align: left;
          line-height: 1.4;
        }

        .log-form {
          margin-bottom: 60px;
        }

        .success-inline {
          text-align: center;
          color: var(--green);
          margin-bottom: 16px;
        }

        .gold-rule-small {
          height: 1px;
          background: linear-gradient(to right, transparent, var(--gold), transparent);
          width: 100%;
          margin-bottom: 24px;
        }
      `}</style>
    </div>
  );
};

export default HubDetail;
