import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@tolobana/convex-backend/convex/_generated/api";
import type { FunctionReference } from "convex/server";
import { ConvexError } from "convex/values";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft, Copy, Check, ExternalLink, AlertTriangle, Plus, Trash2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import ProgressBar from "../components/Hub/ProgressBar";
import ContributionChart from "../components/Hub/ContributionChart";
import { useAdminAction, useAdminReadQuery } from "../hooks/useDbQuery";
import ListPageSkeleton from "../components/ListPageSkeleton";

type RosterMember = {
  its_number: string;
  name: string;
  designation?: string;
  email?: string;
};

type ExtraPledgeRow = { key: string; its: string; amount: string };

function convexErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ConvexError) {
    return typeof err.data === "string"
      ? err.data
      : err.message || JSON.stringify(err.data);
  }
  if (err instanceof Error) return err.message;
  if (
    typeof err === "object" &&
    err !== null &&
    "data" in err &&
    typeof (err as { data: unknown }).data === "string"
  ) {
    return (err as { data: string }).data;
  }
  return fallback;
}

const HubDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { member } = useAuth();

  const collection = useAdminReadQuery(
    api.hub.getBySlug,
    slug
      ? { slug, designation: member?.designation }
      : "skip",
  );

  const logContribution = useAdminAction(
    api.hub.logContribution as unknown as FunctionReference<"action">,
  );
  const logChapterPledges = useAdminAction(
    api.hub.logChapterPledges as unknown as FunctionReference<"action">,
  );
  const loadJamaatRoster = useAdminAction(
    api.hub.jamaatRosterForLogging as unknown as FunctionReference<"action">,
  );

  const [showPayment, setShowPayment] = useState(false);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  /** ITS → amount string for jamaat roster rows (leadership campaigns). */
  const [rosterAmounts, setRosterAmounts] = useState<Record<string, string>>({});
  const [extraRows, setExtraRows] = useState<ExtraPledgeRow[]>([]);
  const [roster, setRoster] = useState<{
    jamaat: string | null;
    members: RosterMember[];
  } | null>(null);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [rosterError, setRosterError] = useState<string | null>(null);

  const isLeadershipCampaign =
    !!collection && collection.member_portal_audience !== "all_members";

  useEffect(() => {
    if (!isLeadershipCampaign || !member?.its_number || !showPayment) return;
    let cancelled = false;
    setRosterLoading(true);
    setRosterError(null);
    void (async () => {
      try {
        const result = (await loadJamaatRoster({
          its_number: member.its_number,
        })) as {
          jamaat: string | null;
          members: RosterMember[];
        } | null;
        if (cancelled) return;
        if (!result) {
          setRosterError("Could not load your jamaat roster.");
          setRoster(null);
          return;
        }
        setRoster({ jamaat: result.jamaat, members: result.members });
        setRosterAmounts((prev) => {
          const next = { ...prev };
          for (const m of result.members) {
            if (next[m.its_number] === undefined) next[m.its_number] = "";
          }
          return next;
        });
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          setRosterError("Could not load your jamaat roster.");
          setRoster(null);
        }
      } finally {
        if (!cancelled) setRosterLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isLeadershipCampaign, member?.its_number, showPayment, loadJamaatRoster]);

  const pledgeTotal = useMemo(() => {
    let sum = 0;
    for (const v of Object.values(rosterAmounts)) {
      const n = parseFloat(v);
      if (Number.isFinite(n) && n > 0) sum += n;
    }
    for (const row of extraRows) {
      const n = parseFloat(row.amount);
      if (Number.isFinite(n) && n > 0) sum += n;
    }
    return sum;
  }, [rosterAmounts, extraRows]);

  const pledgedParsed = parseFloat(amount);
  const pledgedOk = Number.isFinite(pledgedParsed) && pledgedParsed > 0;
  const breakdownMatches =
    pledgedOk && Math.round(pledgeTotal * 100) === Math.round(pledgedParsed * 100);

  if (collection === undefined) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--cream)" }}>
        <ListPageSkeleton rows={3} />
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

  const handleSubmitPersonal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !member) return;

    const its = String(member.its_number ?? "").replace(/\D/g, "");
    if (!its) {
      setError(
        "Your saved session is missing an ITS number. Log out, sign in again, then try logging this contribution.",
      );
      return;
    }

    const parsed = parseFloat(amount);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setError("Enter a valid amount greater than zero.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await logContribution({
        collectionId: collection._id,
        its_number: its,
        amount: parsed,
        note: note || undefined,
      });

      setIsSuccess(true);
      setAmount("");
      setNote("");
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (err: unknown) {
      setError(convexErrorMessage(err, "Failed to log contribution. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitChapterPledges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member) return;

    const loggerIts = String(member.its_number ?? "").replace(/\D/g, "");
    if (!loggerIts) {
      setError(
        "Your saved session is missing an ITS number. Log out, sign in again, then try again.",
      );
      return;
    }

    const pledged = parseFloat(amount);
    if (!Number.isFinite(pledged) || pledged <= 0) {
      setError("Enter the pledged / payment total (what you are sending via Zelle).");
      return;
    }

    const entries: { its_number: string; amount: number }[] = [];
    const seen = new Set<string>();

    for (const [its, raw] of Object.entries(rosterAmounts)) {
      const parsed = parseFloat(raw);
      if (!Number.isFinite(parsed) || parsed <= 0) continue;
      if (seen.has(its)) continue;
      seen.add(its);
      entries.push({ its_number: its, amount: parsed });
    }

    for (const row of extraRows) {
      const its = row.its.replace(/\D/g, "");
      const parsed = parseFloat(row.amount);
      if (!its) {
        setError("Each extra row needs an ITS number.");
        return;
      }
      if (!Number.isFinite(parsed) || parsed <= 0) {
        setError("Enter a valid amount for each extra ITS row, or remove it.");
        return;
      }
      if (seen.has(its)) {
        setError(`ITS ${its} is listed more than once.`);
        return;
      }
      seen.add(its);
      entries.push({ its_number: its, amount: parsed });
    }

    if (entries.length === 0) {
      setError("Enter at least one member amount greater than zero.");
      return;
    }

    const breakdownCents = entries.reduce(
      (s, e) => s + Math.round(e.amount * 100),
      0,
    );
    const pledgedCents = Math.round(pledged * 100);
    if (breakdownCents !== pledgedCents) {
      setError(
        `Member breakdown ($${(breakdownCents / 100).toFixed(2)}) must equal the pledged amount ($${pledged.toFixed(2)}).`,
      );
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await logChapterPledges({
        collectionId: collection._id,
        logger_its: loggerIts,
        pledged_amount: pledged,
        entries,
        note: note || undefined,
      });

      setIsSuccess(true);
      setAmount("");
      setRosterAmounts((prev) => {
        const cleared: Record<string, string> = {};
        for (const k of Object.keys(prev)) cleared[k] = "";
        return cleared;
      });
      setExtraRows([]);
      setNote("");
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (err: unknown) {
      setError(convexErrorMessage(err, "Failed to log pledges. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mock trend data for demonstration
  const trendData = [1200, 1800, 1600, 2400, 3100, 2800, 3600, 4200];
  const targetMatch = collection.amount_display?.match(/\$([0-9,]+)/);
  const targetValue = targetMatch ? parseInt(targetMatch[1].replace(/,/g, '')) : 0;

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

            {targetValue > 0 && (
              <div className="hero-progress">
                <ProgressBar current={collection.totalRaised} target={targetValue} />
                <div className="target-label accent-font">TARGET: {collection.amount_display}</div>
              </div>
            )}
          </div>

          <div className="double-rule"></div>
        </div>

        {/* Trend Chart */}
        <ContributionChart data={trendData} />

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
            {isLeadershipCampaign ? "LOG CHAPTER PLEDGES" : "I WANT TO CONTRIBUTE"}
          </button>
        ) : (
          <div className="reveal-content route-outlet-enter">
            <div className="card payment-card">
              <div className="accent-font kicker" style={{ color: 'var(--gold-dark)', marginBottom: '16px' }}>PAY VIA ZELLE</div>
              <div className="gold-rule-small"></div>

              {/* QR Code Section */}
              <div className="qr-spread">
                <div className="qr-frame">
                  <QRCodeSVG 
                    value={collection.payment_url} 
                    size={140}
                    fgColor="#001529" 
                    level="H"
                  />
                </div>
                <div className="qr-actions">
                  <p className="meta" style={{ fontSize: '12px', marginBottom: '12px' }}>Scan the code or use the link below to open Zelle.</p>
                  <button className="btn-gold-ghost" onClick={() => window.open(collection.payment_url, '_blank')}>
                    <span style={{ fontSize: '14px' }}>OPEN ZELLE</span> 
                    <ExternalLink size={16} />
                  </button>
                </div>
              </div>

              <div className="gold-rule-small" style={{ margin: '24px 0' }}></div>

              <div className="field-label" style={{ color: 'var(--gold-dark)', fontSize: '10px' }}>REQUIRED MEMO</div>
              <div className="memo-container" onClick={handleCopy}>
                <div className="memo-left">
                  <code className="memo-text">{collection.desired_memo}</code>
                  <p className="memo-note">Copy and paste this into Zelle</p>
                </div>
                <div className="memo-right">
                  {copied ? <Check size={18} style={{ color: 'var(--green)' }} /> : <Copy size={18} style={{ color: 'var(--gold-dark)' }} />}
                </div>
              </div>

              <div className="warning-panel">
                <AlertTriangle size={20} className="warning-icon" />
                <p>Ensure the memo matches exactly for automated tracking.</p>
              </div>
            </div>

            {isLeadershipCampaign ? (
              <form onSubmit={handleSubmitChapterPledges} className="log-form">
                <p className="pledge-lead">
                  Enter the chapter payment total, then break it down by member.
                  Breakdown must equal the pledged amount. You are logging as{" "}
                  <strong>{member?.name ?? "secretary"}</strong>
                  {roster?.jamaat ? ` for ${roster.jamaat}` : ""}.
                </p>

                <div className="input-group">
                  <label>PLEDGED / PAYMENT TOTAL (USD) *</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                  <p className="meta" style={{ marginTop: 6, fontSize: 11 }}>
                    The amount you are sending via Zelle for this chapter.
                  </p>
                </div>

                <div className="field-label" style={{ color: "var(--gold-dark)", fontSize: "10px", marginBottom: 8 }}>
                  MEMBER BREAKDOWN
                </div>

                {rosterLoading && (
                  <p className="meta" style={{ marginBottom: 16 }}>Loading jamaat roster…</p>
                )}
                {rosterError && (
                  <p className="field-error" style={{ marginBottom: 16 }}>⚠ {rosterError}</p>
                )}

                {!rosterLoading && roster && roster.members.length === 0 && (
                  <p className="meta" style={{ marginBottom: 16 }}>
                    No members found for your jamaat. Add pledges by ITS below.
                  </p>
                )}

                {roster && roster.members.length > 0 && (
                  <div className="pledge-roster">
                    {roster.members.map((m) => (
                      <div key={m.its_number} className="pledge-row">
                        <div className="pledge-member">
                          <div className="pledge-name">{m.name}</div>
                          <div className="pledge-meta">
                            ITS {m.its_number}
                            {m.designation ? ` · ${m.designation}` : ""}
                          </div>
                        </div>
                        <input
                          type="number"
                          inputMode="decimal"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          className="pledge-amount"
                          value={rosterAmounts[m.its_number] ?? ""}
                          onChange={(e) =>
                            setRosterAmounts((prev) => ({
                              ...prev,
                              [m.its_number]: e.target.value,
                            }))
                          }
                          disabled={isSubmitting}
                          aria-label={`Amount for ${m.name}`}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {extraRows.map((row) => (
                  <div key={row.key} className="pledge-extra-row">
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="ITS number"
                      value={row.its}
                      onChange={(e) =>
                        setExtraRows((prev) =>
                          prev.map((r) =>
                            r.key === row.key ? { ...r, its: e.target.value } : r,
                          ),
                        )
                      }
                      disabled={isSubmitting}
                    />
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      min="0.01"
                      placeholder="0.00"
                      value={row.amount}
                      onChange={(e) =>
                        setExtraRows((prev) =>
                          prev.map((r) =>
                            r.key === row.key
                              ? { ...r, amount: e.target.value }
                              : r,
                          ),
                        )
                      }
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      className="pledge-remove"
                      onClick={() =>
                        setExtraRows((prev) => prev.filter((r) => r.key !== row.key))
                      }
                      disabled={isSubmitting}
                      aria-label="Remove row"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  className="btn-gold-ghost pledge-add"
                  onClick={() =>
                    setExtraRows((prev) => [
                      ...prev,
                      {
                        key: `${Date.now()}-${prev.length}`,
                        its: "",
                        amount: "",
                      },
                    ])
                  }
                  disabled={isSubmitting}
                >
                  <Plus size={16} /> Add member by ITS
                </button>

                <div
                  className={
                    "pledge-total accent-font" +
                    (pledgedOk && pledgeTotal > 0
                      ? breakdownMatches
                        ? " pledge-match"
                        : " pledge-mismatch"
                      : "")
                  }
                >
                  Breakdown: $
                  {pledgeTotal.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                  {pledgedOk
                    ? breakdownMatches
                      ? " · matches pledged total"
                      : ` · must equal $${pledgedParsed.toFixed(2)}`
                    : ""}
                </div>

                <div className="input-group">
                  <label>NOTE (OPTIONAL)</label>
                  <textarea
                    rows={2}
                    placeholder="Optional message…"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    disabled={isSubmitting}
                    style={{ height: "auto" }}
                  />
                </div>

                {error && (
                  <p className="field-error" style={{ marginBottom: "16px", justifyContent: "center" }}>
                    ⚠ {error}
                  </p>
                )}
                {isSuccess && (
                  <div className="success-inline">
                    <span className="accent-font">✓ CHAPTER PLEDGE LOGGED — THANK YOU.</span>
                    <p className="success-note">
                      One payment record was stored with the member breakdown for admin review.
                    </p>
                  </div>
                )}

                <div className="ornament-rule" style={{ margin: "32px 0" }}>
                  <span style={{ fontSize: "14px" }}>✦</span>
                </div>

                <button
                  type="submit"
                  className="btn btn-gold"
                  disabled={isSubmitting || !breakdownMatches || pledgeTotal <= 0}
                >
                  {isSubmitting ? (
                    <div className="loading-spinner"></div>
                  ) : (
                    "LOG CHAPTER PLEDGE"
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSubmitPersonal} className="log-form">
                <div className="input-group">
                  <label>AMOUNT (USD) *</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
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
                    onChange={(e) => setNote(e.target.value)}
                    disabled={isSubmitting}
                    style={{ height: "auto" }}
                  />
                </div>

                {error && (
                  <p className="field-error" style={{ marginBottom: "16px", justifyContent: "center" }}>
                    ⚠ {error}
                  </p>
                )}
                {isSuccess && (
                  <div className="success-inline">
                    <span className="accent-font">✓ LOGGED — THANK YOU.</span>
                    <p className="success-note">
                      Your niyyat is logged for admin review. You will receive a receipt
                      after payment is confirmed.
                    </p>
                  </div>
                )}

                <div className="ornament-rule" style={{ margin: "32px 0" }}>
                  <span style={{ fontSize: "14px" }}>✦</span>
                </div>

                <button
                  type="submit"
                  className="btn btn-gold"
                  disabled={isSubmitting || !amount}
                >
                  {isSubmitting ? (
                    <div className="loading-spinner"></div>
                  ) : (
                    "LOG MY CONTRIBUTION"
                  )}
                </button>
              </form>
            )}
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

        .hero-stats {
          display: flex;
          justify-content: center;
          gap: 48px;
          margin-bottom: 24px;
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

        .hero-progress {
          max-width: 320px;
          margin: 0 auto;
          text-align: left;
        }

        .target-label {
          color: rgba(255, 255, 255, 0.5);
          font-size: 9px;
          text-align: center;
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

        .qr-spread {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          margin-bottom: 12px;
        }

        .qr-frame {
          background: var(--white);
          padding: 12px;
          border: 1px solid var(--gold);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .qr-actions {
          width: 100%;
        }

        .btn-gold-ghost {
          background: transparent;
          border: 1.5px solid var(--gold);
          color: var(--gold-dark);
          height: 48px;
          width: 100%;
          max-width: 280px;
          margin: 0 auto;
          border-radius: var(--radius-md);
          font-family: var(--font-ui);
          font-weight: 600;
          letter-spacing: 0.05em;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-gold-ghost:hover {
          background: var(--gold-pale);
        }

        .btn-gold-ghost svg {
          width: 18px;
          height: 18px;
          flex-shrink: 0;
        }

        .memo-container {
          background: var(--white);
          border: 1.5px solid var(--gold);
          padding: 16px;
          border-radius: var(--radius-sm);
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          margin-top: 8px;
          margin-bottom: 20px;
          text-align: left;
          transition: all 0.2s;
        }

        .memo-container:active {
          transform: scale(0.99);
          background: var(--gold-pale);
        }

        .memo-left {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .memo-text {
          font-family: 'Courier New', Courier, monospace;
          font-size: 16px;
          font-weight: 700;
          color: var(--navy);
          letter-spacing: 0.02em;
        }

        .memo-note {
          font-size: 10px;
          color: var(--ink-muted);
          font-style: italic;
        }

        .warning-panel {
          background: var(--warning-bg);
          border: 1px solid rgba(201, 168, 76, 0.3);
          color: var(--warning-text);
          padding: 12px 16px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          gap: 16px;
          font-size: 12px;
          text-align: left;
          line-height: 1.4;
          margin-top: 12px;
        }

        .warning-icon {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
          color: var(--gold-dark);
        }

        .log-form {
          margin-bottom: 60px;
        }

        .pledge-lead {
          font-size: 13px;
          color: var(--ink-muted);
          line-height: 1.45;
          margin: 0 0 20px;
          text-align: center;
        }

        .pledge-roster {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 16px;
          max-height: 360px;
          overflow-y: auto;
        }

        .pledge-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          background: var(--cream-deep);
          border: 1px solid rgba(201, 168, 76, 0.35);
          border-radius: var(--radius-sm);
        }

        .pledge-member {
          flex: 1;
          min-width: 0;
          text-align: left;
        }

        .pledge-name {
          font-size: 14px;
          font-weight: 600;
          color: var(--navy);
        }

        .pledge-meta {
          font-size: 11px;
          color: var(--ink-muted);
          margin-top: 2px;
        }

        .pledge-amount {
          width: 96px;
          flex-shrink: 0;
          text-align: right;
          padding: 8px 10px;
          border: 1px solid var(--gold);
          border-radius: var(--radius-sm);
          background: var(--white);
          font-size: 14px;
        }

        .pledge-extra-row {
          display: flex;
          gap: 8px;
          margin-bottom: 10px;
          align-items: center;
        }

        .pledge-extra-row input {
          flex: 1;
          min-width: 0;
        }

        .pledge-remove {
          background: transparent;
          border: none;
          color: var(--ink-muted);
          padding: 8px;
          cursor: pointer;
        }

        .pledge-add {
          width: 100%;
          margin-bottom: 16px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .pledge-total {
          text-align: center;
          color: var(--navy);
          font-size: 12px;
          letter-spacing: 0.1em;
          margin: 8px 0 20px;
        }

        .pledge-match {
          color: var(--green);
        }

        .pledge-mismatch {
          color: #8a3b2b;
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
