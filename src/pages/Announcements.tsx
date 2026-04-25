import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ChevronDown, ChevronUp } from "lucide-react";

const Announcements: React.FC = () => {
  const announcements = useQuery(api.announcements.listLive);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
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
    return <div className="loading">Loading announcements...</div>;
  }

  return (
    <div className="announcements-page">
      <header className="page-header">
        <h1>Announcements</h1>
      </header>

      <div className="list">
        {announcements.length === 0 ? (
          <div className="empty-state">No announcements yet.</div>
        ) : (
          announcements.map((ann: any) => (
            <div 
              key={ann._id} 
              className={`card announcement-card ${expandedId === ann._id ? "expanded" : ""}`}
              onClick={() => setExpandedId(expandedId === ann._id ? null : ann._id)}
            >
              <div className="card-header">
                <div className="title-row">
                  <h2>{ann.title}</h2>
                  <span className="meta">{formatDate(ann.created_at)}</span>
                </div>
                <div className="preview">
                  {ann.body.substring(0, 80)}
                  {ann.body.length > 80 && "..."}
                </div>
              </div>
              
              {expandedId === ann._id && (
                <div className="full-body">
                  {ann.body}
                </div>
              )}
              
              <div className="expand-indicator">
                {expandedId === ann._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
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
        .announcement-card {
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }
        .title-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 4px;
          gap: 12px;
        }
        .preview {
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.4;
        }
        .full-body {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid var(--border);
          font-size: 15px;
          white-space: pre-wrap;
          color: var(--text-primary);
        }
        .expand-indicator {
          display: flex;
          justify-content: center;
          margin-top: 8px;
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

export default Announcements;
