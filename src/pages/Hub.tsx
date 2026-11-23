import React from "react";
import { api } from "@tolobana/convex-backend/convex/_generated/api";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import PageMasthead from "../components/Layout/PageMasthead";
import ListPageSkeleton from "../components/ListPageSkeleton";
import ProgressBar from "../components/Hub/ProgressBar";
import { useAdminReadQuery } from "../hooks/useDbQuery";
import { useAuth } from "../context/AuthContext";

const Hub: React.FC = () => {
  const { member } = useAuth();
  const collections = useAdminReadQuery(
    api.hub.listLive,
    member ? { designation: member.designation } : "skip",
  );
  const navigate = useNavigate();

  if (collections === undefined) {
    return (
      <div className="hub-page">
        <PageMasthead title="Hub" subtitle="Active collections" />
        <ListPageSkeleton rows={3} />
      </div>
    );
  }

  return (
    <div className="hub-page">
      <PageMasthead title="Hub" subtitle="Active collections" />

      <div className="container" style={{ paddingTop: 20 }}>
        {collections.length === 0 ? (
          <div className="empty-state">
            <h3>No active collections</h3>
            <p className="meta">Check back soon.</p>
          </div>
        ) : (
          <div className="list-stagger list-stagger--gap-sm">
            {collections.map((col: any) => {
              const targetMatch = col.amount_display?.match(/\$([0-9,]+)/);
              const targetValue = targetMatch ? parseInt(targetMatch[1].replace(/,/g, "")) : 0;

              return (
                <article
                  key={col._id}
                  className="card hub-card list-stagger-item"
                  onClick={() => navigate(`/hub/${col.slug}`)}
                >
                  <div className="hub-card-top">
                    <h2>{col.title}</h2>
                    <span className="badge badge-live">
                      <span className="pulse-dot" />
                      Open
                    </span>
                  </div>

                  {targetValue > 0 && (
                    <div className="progress-section">
                      <ProgressBar current={col.totalRaised} target={targetValue} />
                    </div>
                  )}

                  <div className="stats-row">
                    <div>
                      <div className="stat-value">${col.totalRaised.toLocaleString()}</div>
                      <div className="stat-label">Verified</div>
                    </div>
                    <div>
                      <div className="stat-value">{col.contributorCount}</div>
                      <div className="stat-label">Contributors</div>
                    </div>
                  </div>

                  <div className="card-action">
                    <span>View collection</span>
                    <ChevronRight size={16} />
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        .hub-page { min-height: 100vh; }

        .hub-card { cursor: pointer; }

        .hub-card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 12px;
        }

        .hub-card h2 {
          font-size: 16px;
          font-weight: 600;
        }

        .pulse-dot {
          width: 6px;
          height: 6px;
          background: var(--success);
          border-radius: 50%;
          display: inline-block;
        }

        .progress-section { margin-bottom: 14px; }

        .stats-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          padding-top: 4px;
        }

        .stat-value {
          font-size: 22px;
          font-weight: 600;
          letter-spacing: -0.02em;
          color: var(--ink);
        }

        .stat-label {
          font-size: 13px;
          color: var(--ink-muted);
        }

        .card-action {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 2px;
          margin-top: 14px;
          color: var(--brand);
          font-size: 14px;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default Hub;
