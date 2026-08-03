import React, { useEffect, useState } from "react";
import type { FunctionReference } from "convex/server";
import { api } from "@tolobana/convex-backend/convex/_generated/api";
import { useAuth } from "../../context/AuthContext";
import { useAdminAction } from "../../hooks/useDbQuery";

type PocSummary = {
  coordinator_name: string;
  grand_total: number;
  jamaats: {
    jamaat: string;
    member_count: number;
    contributors: number;
    total_niyyat: number;
    lines: {
      name: string;
      its_number: string;
      amount: number;
      collection_title: string;
      logged_at: number;
      payment_verified?: boolean;
    }[];
  }[];
};

function money(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

const PocNiyyatSection: React.FC = () => {
  const { member } = useAuth();
  const loadPoc = useAdminAction(
    api.hub.pocNiyyatTotals as unknown as FunctionReference<"action">,
  );
  const [data, setData] = useState<PocSummary | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [openJamaat, setOpenJamaat] = useState<string | null>(null);

  const isPoc =
    member?.is_poc === true ||
    member?.designation?.toLowerCase() === "coordinator";

  useEffect(() => {
    if (!member?.its_number || !isPoc) {
      setData(null);
      return;
    }
    let cancelled = false;
    setData(undefined);
    setError(null);
    void (async () => {
      try {
        const result = (await loadPoc({
          its_number: member.its_number,
        })) as PocSummary | null;
        if (!cancelled) setData(result);
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          setError("Could not load jamaat niyyat totals.");
          setData(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [member?.its_number, isPoc, loadPoc]);

  if (!isPoc) return null;

  return (
    <section className="poc-section">
      <div className="double-rule" />
      <span className="accent-font kicker">POC — JAMAAT NIYYAT</span>
      <p className="poc-lead">
        Totals of contributions logged by members under your Coordinator name.
      </p>

      {data === undefined && <p className="poc-muted">Loading totals…</p>}
      {error && <p className="poc-error">{error}</p>}
      {data === null && !error && (
        <p className="poc-muted">No POC roster found for your ITS.</p>
      )}

      {data && (
        <>
          <div className="poc-grand">
            <span className="accent-font kicker">ALL JAMAATS</span>
            <div className="poc-grand-amount">{money(data.grand_total)}</div>
          </div>

          <ul className="poc-jamaat-list">
            {data.jamaats.map((j) => {
              const open = openJamaat === j.jamaat;
              return (
                <li key={j.jamaat} className="poc-jamaat">
                  <button
                    type="button"
                    className="poc-jamaat-head"
                    onClick={() => setOpenJamaat(open ? null : j.jamaat)}
                  >
                    <span className="poc-jamaat-name">{j.jamaat}</span>
                    <span className="poc-jamaat-meta">
                      {j.contributors}/{j.member_count} logged · {money(j.total_niyyat)}
                    </span>
                  </button>
                  {open && (
                    <ul className="poc-lines">
                      {j.lines.length === 0 ? (
                        <li className="poc-muted">No niyyat logged yet.</li>
                      ) : (
                        j.lines.map((line, idx) => (
                          <li key={`${line.its_number}-${line.logged_at}-${idx}`}>
                            <strong>{line.name}</strong> — {money(line.amount)}
                            <span className="poc-muted">
                              {" "}
                              · {line.collection_title}
                              {line.payment_verified ? " · verified" : ""}
                            </span>
                          </li>
                        ))
                      )}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}

      <style>{`
        .poc-section {
          margin-top: 36px;
          padding: 8px 4px 24px;
        }
        .poc-lead {
          color: var(--ink-muted, #5c5c5c);
          font-size: 14px;
          margin: 8px 0 20px;
        }
        .poc-grand {
          text-align: center;
          margin-bottom: 20px;
        }
        .poc-grand-amount {
          font-family: var(--font-display);
          font-size: 28px;
          font-weight: 700;
          color: var(--navy);
          margin-top: 4px;
        }
        .poc-jamaat-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .poc-jamaat-head {
          width: 100%;
          text-align: left;
          background: var(--white);
          border: 1px solid rgba(10, 33, 20, 0.12);
          border-radius: var(--radius-sm);
          padding: 12px 14px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .poc-jamaat-name {
          font-weight: 600;
          color: var(--navy);
          font-size: 14px;
        }
        .poc-jamaat-meta {
          font-size: 12px;
          color: rgba(10, 33, 20, 0.55);
        }
        .poc-lines {
          list-style: none;
          margin: 0;
          padding: 8px 12px 12px;
          font-size: 13px;
        }
        .poc-muted { color: rgba(10, 33, 20, 0.5); font-size: 13px; }
        .poc-error { color: var(--error, #b00020); font-size: 13px; }
        .kicker {
          color: var(--gold);
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.18em;
          display: block;
        }
      `}</style>
    </section>
  );
};

export default PocNiyyatSection;
