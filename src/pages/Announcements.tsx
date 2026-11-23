import React, { useState } from "react";
import { api } from "@tolobana/convex-backend/convex/_generated/api";
import { ChevronDown, ChevronUp } from "lucide-react";
import PageMasthead from "../components/Layout/PageMasthead";
import ListPageSkeleton from "../components/ListPageSkeleton";
import { useAdminReadQuery } from "../hooks/useDbQuery";

const Announcements: React.FC = () => {
  const announcements = useAdminReadQuery(api.announcements.listLive);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const formatDate = (timestamp: number, full: boolean = false) => {
    const date = new Date(timestamp);
    if (full) {
      return date.toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }

    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 3600 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  };

  if (announcements === undefined) {
    return (
      <div className="announcements-page">
        <PageMasthead title="Updates" subtitle="Latest from Toloba NA" />
        <ListPageSkeleton rows={4} />
      </div>
    );
  }

  const displayAnnouncements = announcements || [];

  return (
    <div className="announcements-page">
      <PageMasthead title="Updates" subtitle="Latest from Toloba NA" />

      <div className="container" style={{ paddingTop: 20 }}>
        {displayAnnouncements.length === 0 ? (
          <div className="empty-state">
            <h3>No announcements yet</h3>
            <p className="meta">Check back soon.</p>
          </div>
        ) : (
          <div className="list-stagger list-stagger--gap-sm">
            {displayAnnouncements.map((ann: any) => {
              const open = expandedId === ann._id;
              return (
                <article key={ann._id} className="card announcement-card list-stagger-item">
                  <button
                    type="button"
                    className="announcement-toggle"
                    aria-expanded={open}
                    onClick={() => setExpandedId(open ? null : ann._id)}
                  >
                    <div className="announcement-top">
                      <h2>{ann.title}</h2>
                      <time dateTime={new Date(ann.created_at).toISOString()}>
                        {formatDate(ann.created_at, open)}
                      </time>
                    </div>
                    <p className={`preview-content ${open ? "expanded" : ""}`}>{ann.body}</p>
                    <span className="expand-action">
                      {open ? "Show less" : "Show more"}
                      {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </span>
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        .announcements-page {
          min-height: 100vh;
        }

        .announcement-card {
          padding: 0;
        }

        .announcement-toggle {
          width: 100%;
          text-align: left;
          background: none;
          border: none;
          padding: 16px;
          cursor: pointer;
          color: inherit;
          font: inherit;
        }

        .announcement-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 8px;
        }

        .announcement-top h2 {
          font-size: 16px;
          font-weight: 600;
          letter-spacing: -0.01em;
        }

        .announcement-top time {
          flex-shrink: 0;
          font-size: 13px;
          color: var(--ink-muted);
          margin-top: 2px;
        }

        .preview-content {
          font-size: 15px;
          color: var(--ink-secondary);
          line-height: 1.55;
          max-height: 4.65em;
          overflow: hidden;
        }

        .preview-content.expanded {
          max-height: none;
          white-space: pre-wrap;
        }

        .expand-action {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          margin-top: 12px;
          font-size: 13px;
          font-weight: 600;
          color: var(--brand);
        }
      `}</style>
    </div>
  );
};

export default Announcements;
