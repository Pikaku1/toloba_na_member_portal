import React from "react";
import { api } from "../../convex/_generated/api";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Users } from "lucide-react";
import { useAdminReadQuery } from "../hooks/useDbQuery";

const Hub: React.FC = () => {
  const collections = useAdminReadQuery(api.hub.listLive);
  const navigate = useNavigate();

  if (collections === undefined) {
    return <div className="loading">Loading hub...</div>;
  }

  return (
    <div className="hub-page">
      <header className="page-header">
        <h1>Hub</h1>
      </header>

      <div className="list">
        {collections.length === 0 ? (
          <div className="empty-state">No active collections right now.</div>
        ) : (
          collections.map((col: any) => (
            <div 
              key={col._id} 
              className="card hub-card"
              onClick={() => navigate(`/hub/${col.slug}`)}
            >
              <div className="card-content">
                <div className="status-row">
                  <span className="badge-live">Live</span>
                  {col.amount_display && <span className="meta">{col.amount_display}</span>}
                </div>
                <h2>{col.title}</h2>
                <div className="stats-row">
                  <div className="stat">
                    <span className="stat-value">${col.totalRaised.toLocaleString()}</span>
                    <span className="stat-label">raised</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">
                      <Users size={14} style={{ marginRight: "4px", marginBottom: "-2px" }} />
                      {col.contributorCount}
                    </span>
                    <span className="stat-label">contributors</span>
                  </div>
                </div>
              </div>
              <div className="card-action">
                <ChevronRight size={20} />
              </div>
            </div>
          ))
        )}
      </div>

      <style>{`
        .page-header {
          position: sticky;
          top: 0;
          background: var(--background);
          padding: 20px 0;
          margin-bottom: 8px;
          z-index: 10;
        }
        .hub-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
        }
        .status-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }
        .hub-card h2 {
          margin-bottom: 12px;
        }
        .stats-row {
          display: flex;
          gap: 24px;
        }
        .stat {
          display: flex;
          flex-direction: column;
        }
        .stat-value {
          font-weight: 600;
          font-size: 16px;
          color: var(--text-primary);
        }
        .stat-label {
          font-size: 12px;
          color: var(--text-secondary);
        }
        .card-action {
          color: var(--text-muted);
        }
        .empty-state {
          text-align: center;
          color: var(--text-secondary);
          margin-top: 48px;
        }
        .loading {
          text-align: center;
          padding: 40px;
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
};

export default Hub;
