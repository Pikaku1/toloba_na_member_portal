import React, { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useNavigate } from "react-router-dom";
import { Heart, Users } from "lucide-react";
import PageMasthead from "../components/Layout/PageMasthead";
import ProgressBar from "../components/Hub/ProgressBar";

const Hub: React.FC = () => {
  const allCollections = useQuery(api.hub.listCollections);
  const collections = useMemo(() => 
    allCollections?.filter(c => c.is_live) ?? undefined,
    [allCollections]
  );
  const navigate = useNavigate();

  if (collections === undefined) {
    return (
      <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="loading-spinner" style={{ color: 'var(--navy)' }}></div>
      </div>
    );
  }

  return (
    <div className="hub-page page-transition">
      <PageMasthead 
        title="Hub" 
        subtitle="Active community collections"
        kicker="COMMUNITY HUB"
        variant="navy"
      />

      <div className="container" style={{ paddingTop: '24px' }}>
        {collections.length === 0 ? (
          <div className="empty-state">
            <Heart size={44} style={{ color: 'var(--gold)', marginBottom: '12px' }} />
            <div className="ornament-rule" style={{ maxWidth: '160px', margin: '0 auto 16px' }}>
              <span style={{ fontSize: '14px' }}>✦</span>
            </div>
            <h3 className="display-font" style={{ fontStyle: 'italic', color: 'var(--ink-muted)' }}>No active collections.</h3>
            <p className="meta" style={{ marginTop: '4px' }}>Check back soon.</p>
          </div>
        ) : (
          <div className="list" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {collections.map((col: any, index: number) => {
              // Parse target amount for progress bar
              const targetMatch = col.amount_display?.match(/\$([0-9,]+)/);
              const targetValue = targetMatch ? parseInt(targetMatch[1].replace(/,/g, '')) : 0;

              return (
                <div 
                  key={col._id} 
                  className="card hub-card"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => navigate(`/hub/${col.slug}`)}
                >
                  <div className="card-top-info">
                    <div className="badge badge-live">
                      <span className="pulse-dot"></span>
                      LIVE
                    </div>
                    <span className="accent-font kicker">COLLECTION ✦</span>
                  </div>

                  <h2 className="display-font card-title">{col.title}</h2>
                  
                  <div className="double-rule-small"></div>
                  
                  {targetValue > 0 && (
                    <div className="progress-section">
                      <ProgressBar current={col.totalRaised} target={targetValue} />
                    </div>
                  )}

                  <div className="stats-grid">
                    <div className="stat-item">
                      <div className="display-font stat-value">${col.totalRaised.toLocaleString()}</div>
                      <div className="accent-font stat-label">RAISED</div>
                    </div>
                    
                    <div className="stat-item">
                      <div className="display-font stat-value">
                        <Users size={20} style={{ marginRight: "6px" }} />
                        {col.contributorCount}
                      </div>
                      <div className="accent-font stat-label">CONTRIBUTORS</div>
                    </div>
                  </div>

                  {col.amount_display && (
                    <div className="target-text accent-font">
                      GOAL: {col.amount_display}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        .hub-page {
          background-color: var(--cream);
          min-height: 100vh;
        }

        .hub-card {
          cursor: pointer;
          padding: 24px;
        }

        .card-top-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .pulse-dot {
          width: 5px;
          height: 5px;
          background: var(--gold);
          border-radius: 50%;
          display: inline-block;
          margin-right: 6px;
          animation: pulse 2s ease infinite;
        }

        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.4; }
          100% { transform: scale(1); opacity: 1; }
        }

        .kicker {
          color: var(--gold-dark);
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.16em;
        }

        .card-title {
          font-size: 20px;
          font-weight: 700;
          color: var(--ink);
          margin-bottom: 12px;
        }

        .double-rule-small {
          height: 5px;
          border-top: 1.5px solid var(--gold);
          border-bottom: 0.5px solid var(--gold);
          width: 80px;
          margin-bottom: 20px;
        }

        .progress-section {
          margin-bottom: 24px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: var(--navy);
          display: flex;
          align-items: center;
        }

        .stat-label {
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.1em;
          color: var(--gold-dark);
          margin-top: -2px;
        }

        .target-text {
          margin-top: 16px;
          font-size: 10px;
          font-weight: 600;
          color: var(--gold-dark);
          letter-spacing: 0.05em;
        }

        .empty-state {
          text-align: center;
          padding: 60px 0;
        }
      `}</style>
    </div>
  );
};

export default Hub;
