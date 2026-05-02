import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ChevronDown, ChevronUp, Bell } from "lucide-react";
import PageMasthead from "../components/Layout/PageMasthead";

const Announcements: React.FC = () => {
  const announcements = useQuery(api.announcements.listLive);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const formatDate = (timestamp: number, full: boolean = false) => {
    const date = new Date(timestamp);
    if (full) {
      return date.toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }

    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 3600 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric'
    });
  };

  if (announcements === undefined) {
    return (
      <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="loading-spinner" style={{ color: 'var(--navy)' }}></div>
      </div>
    );
  }

  return (
    <div className="announcements-page page-transition">
      <PageMasthead
        title="Announcements"
        subtitle="Latest from the organization"
        kicker="DAERAT TOLOBA"
        variant="navy"
      />

      <div className="container" style={{ paddingTop: '32px' }}>
        {/*<FeaturedQuote 
          quote="The best among you are those who are best to their families and those who are most beneficial to people."
          source="PROPHETIC NARRATION"
        />*/}

        {announcements.length === 0 ? (
          <div className="empty-state">
            <Bell size={44} style={{ color: 'var(--gold)', marginBottom: '12px' }} />
            <div className="ornament-rule" style={{ maxWidth: '160px', margin: '0 auto 16px' }}>
              <span style={{ fontSize: '14px' }}>✦</span>
            </div>
            <h3 className="display-font" style={{ fontStyle: 'italic', color: 'var(--ink-muted)' }}>No announcements yet.</h3>
            <p className="meta" style={{ marginTop: '4px' }}>Check back soon.</p>
          </div>
        ) : (
          <div className="chronicle-list">
            <div className="timeline-line"></div>

            {announcements.map((ann: any, index: number) => (
              <div
                key={ann._id}
                className={`timeline-item ${expandedId === ann._id ? "expanded" : ""}`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="timeline-marker">✦</div>

                <div
                  className={`card announcement-card ${expandedId === ann._id ? "expanded" : ""}`}
                  onClick={() => setExpandedId(expandedId === ann._id ? null : ann._id)}
                >
                  <div className="card-top-info">
                    <span className="accent-font kicker">ANNOUNCEMENT</span>
                    <span className="ornament">✦</span>
                  </div>

                  <h2 className="display-font card-title">{ann.title}</h2>

                  <div className="gold-rule-small"></div>

                  <div className={`preview-content ${expandedId === ann._id ? "expanded" : ""}`}>
                    {ann.body}
                  </div>

                  <div className="card-footer">
                    <span className="accent-font date-text">
                      {formatDate(ann.created_at, expandedId === ann._id)}
                    </span>

                    <div className="expand-action">
                      <span className="accent-font">{expandedId === ann._id ? "LESS" : "MORE"}</span>
                      {expandedId === ann._id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </div>
                  </div>

                  {expandedId === ann._id && (
                    <div className="ornament-rule" style={{ marginTop: '20px', marginBottom: '0' }}>
                      <span style={{ fontSize: '10px' }}>✦</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .announcements-page {
          background-color: var(--cream);
          min-height: 100vh;
        }

        .chronicle-list {
          position: relative;
          padding-left: 32px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .timeline-line {
          position: absolute;
          left: 6px;
          top: 0;
          bottom: 0;
          width: 1px;
          background: linear-gradient(to bottom, var(--gold), transparent);
          opacity: 0.6;
        }

        .timeline-item {
          position: relative;
        }

        .timeline-marker {
          position: absolute;
          left: -32px;
          top: 24px;
          width: 14px;
          height: 14px;
          background: var(--cream);
          color: var(--gold-dark);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          z-index: 1;
        }

        .announcement-card {
          cursor: pointer;
          overflow: hidden;
        }

        .card-top-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .kicker {
          color: var(--gold-dark);
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.16em;
        }

        .ornament {
          color: var(--gold);
          font-size: 12px;
        }

        .card-title {
          font-size: 18px;
          font-weight: 700;
          color: var(--ink);
          margin-bottom: 8px;
          line-height: 1.3;
        }

        .gold-rule-small {
          height: 1px;
          background: linear-gradient(to right, var(--gold), transparent);
          width: 60px;
          margin-bottom: 16px;
        }

        .preview-content {
          font-family: var(--font-ui);
          font-size: 15px;
          color: var(--ink-secondary);
          line-height: 1.6;
          max-height: 4.8em; 
          overflow: hidden;
          transition: max-height 0.3s ease, opacity 0.3s ease;
          position: relative;
        }

        .preview-content:not(.expanded)::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 1.6em;
          background: linear-gradient(to bottom, transparent, var(--white));
        }

        .preview-content.expanded {
          max-height: 2000px;
          white-space: pre-wrap;
        }

        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 16px;
          padding-top: 12px;
          border-top: 1px solid rgba(232, 223, 200, 0.5);
        }

        .date-text {
          color: var(--gold-dark);
          font-size: 10px;
          letter-spacing: 0.05em;
        }

        .expand-action {
          display: flex;
          align-items: center;
          gap: 4px;
          color: var(--gold-dark);
        }

        .expand-action span {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.1em;
        }

        .empty-state {
          text-align: center;
          padding: 60px 0;
        }
      `}</style>
    </div>
  );
};

export default Announcements;
