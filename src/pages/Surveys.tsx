import React from "react";
import { api } from "../../convex/_generated/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { CheckCircle2, ChevronRight } from "lucide-react";
import { useAdminReadQuery, useMemberQuery } from "../hooks/useDbQuery";

const Surveys: React.FC = () => {
  const forms = useAdminReadQuery(api.surveys.listLive);
  const { member } = useAuth();

  if (forms === undefined) {
    return <div className="loading">Loading surveys...</div>;
  }

  return (
    <div className="surveys-page">
      <header className="page-header">
        <h1>Surveys</h1>
      </header>

      <div className="list">
        {forms.length === 0 ? (
          <div className="empty-state">No open surveys right now.</div>
        ) : (
          forms.map((form: any) => (
            <SurveyCard key={form._id} form={form} memberEmail={member?.email || ""} />
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

const SurveyCard: React.FC<{ form: any; memberEmail: string }> = ({ form, memberEmail }) => {
  const navigate = useNavigate();
  // Check if already submitted
  const submission = useMemberQuery(api.surveys.getOwnSubmission, 
    memberEmail ? { formId: form._id, email: memberEmail } : "skip"
  );
  
  const isSubmitted = !!submission;

  return (
    <div 
      className={`card survey-card ${isSubmitted ? "submitted" : ""}`}
      onClick={() => !isSubmitted && navigate(`/surveys/${form.slug}`)}
    >
      <div className="card-content">
        <div className="status-row">
          <span className="badge-live">Live</span>
          {isSubmitted && (
            <span className="submitted-badge">
              <CheckCircle2 size={14} />
              Submitted
            </span>
          )}
        </div>
        <h2>{form.title}</h2>
        {form.description && <p className="meta">{form.description}</p>}
      </div>
      
      {!isSubmitted && (
        <div className="card-action">
          <span>Start</span>
          <ChevronRight size={18} />
        </div>
      )}

      <style>{`
        .survey-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
        }
        .survey-card.submitted {
          cursor: default;
          opacity: 0.8;
        }
        .status-row {
          display: flex;
          gap: 8px;
          margin-bottom: 8px;
        }
        .submitted-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          color: var(--success);
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
        }
        .card-action {
          display: flex;
          align-items: center;
          gap: 4px;
          color: var(--accent);
          font-weight: 500;
          font-size: 14px;
        }
        .survey-card h2 {
          margin-bottom: 4px;
        }
      `}</style>
    </div>
  );
};

export default Surveys;
