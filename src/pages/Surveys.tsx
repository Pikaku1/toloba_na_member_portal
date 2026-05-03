import React from "react";
import { api } from "../../convex/_generated/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ClipboardList } from "lucide-react";
import { useAdminReadQuery, useMemberQuery } from "../hooks/useDbQuery";
import PageMasthead from "../components/Layout/PageMasthead";

const Surveys: React.FC = () => {
  const forms = useAdminReadQuery(api.surveys.listLive);
  const { member } = useAuth();

  if (forms === undefined) {
    return (
      <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="loading-spinner" style={{ color: 'var(--green)' }}></div>
      </div>
    );
  }

  return (
    <div className="surveys-page page-transition">
      <PageMasthead 
        title="Surveys" 
        subtitle="Have your say in the community"
        kicker="COMMUNITY VOICE"
        variant="green"
      />

      <div className="container" style={{ paddingTop: '24px' }}>
        {forms.length === 0 ? (
          <div className="empty-state">
            <ClipboardList size={44} style={{ color: 'var(--gold)', marginBottom: '12px' }} />
            <div className="ornament-rule" style={{ maxWidth: '160px', margin: '0 auto 16px' }}>
              <span style={{ fontSize: '14px' }}>✦</span>
            </div>
            <h3 className="display-font" style={{ fontStyle: 'italic', color: 'var(--ink-muted)' }}>No open surveys.</h3>
            <p className="meta" style={{ marginTop: '4px' }}>Check back soon.</p>
          </div>
        ) : (
          <div className="list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {forms.map((form: any, index: number) => (
              <SurveyCard 
                key={form._id} 
                form={form} 
                memberEmail={member?.email || ""} 
                index={index}
              />
            ))}
          </div>
        )}
      </div>

      <style>{`
        .surveys-page {
          background-color: var(--cream);
          min-height: 100vh;
        }

        .empty-state {
          text-align: center;
          padding: 60px 0;
        }
      `}</style>
    </div>
  );
};

const SurveyCard: React.FC<{ form: any; memberEmail: string; index: number }> = ({ form, memberEmail, index }) => {
  const navigate = useNavigate();
  const submission = useMemberQuery(api.surveys.getOwnSubmission, 
    memberEmail ? { formId: form._id, email: memberEmail } : "skip"
  );
  
  const isSubmitted = !!submission;

  return (
    <div 
      className={`card survey-card ${isSubmitted ? "submitted" : ""}`}
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={() => !isSubmitted && navigate(`/surveys/${form.slug}`)}
    >
      <div className="card-top-info">
        <div className="badge-row">
          <div className="badge badge-live">
            <span className="pulse-dot"></span>
            LIVE
          </div>
          {isSubmitted && (
            <div className="badge badge-submitted">
              ✓ SUBMITTED
            </div>
          )}
        </div>
        <span className="accent-font kicker">SURVEY ✦</span>
      </div>

      <h2 className="display-font card-title">{form.title}</h2>
      
      <div className="gold-rule-small"></div>
      
      {form.description && (
        <p className="description-text">{form.description}</p>
      )}
      
      {!isSubmitted && (
        <div className="card-action">
          <span className="accent-font">BEGIN SURVEY →</span>
        </div>
      )}

      <style>{`
        .survey-card {
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .survey-card.submitted {
          cursor: default;
          opacity: 0.7;
        }

        .card-top-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .badge-row {
          display: flex;
          gap: 8px;
        }

        .kicker {
          color: var(--gold-dark);
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.16em;
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

        .card-title {
          font-size: 18px;
          font-weight: 700;
          color: var(--ink);
          margin-bottom: 8px;
        }

        .gold-rule-small {
          height: 1px;
          background: linear-gradient(to right, var(--gold), transparent);
          width: 60px;
          margin-bottom: 16px;
        }

        .description-text {
          font-family: var(--font-ui);
          font-size: 14px;
          color: var(--ink-secondary);
          margin-bottom: 16px;
          line-height: 1.5;
        }

        .card-action {
          display: flex;
          justify-content: flex-end;
          margin-top: 8px;
        }

        .card-action span {
          color: var(--gold-dark);
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.1em;
        }
      `}</style>
    </div>
  );
};

export default Surveys;
