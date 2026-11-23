import React from "react";
import { api } from "@tolobana/convex-backend/convex/_generated/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ChevronRight } from "lucide-react";
import { useAdminReadQuery } from "../hooks/useDbQuery";
import PageMasthead from "../components/Layout/PageMasthead";
import ListPageSkeleton from "../components/ListPageSkeleton";

const Surveys: React.FC = () => {
  const forms = useAdminReadQuery(api.surveys.listLive);
  const { member } = useAuth();

  if (forms === undefined) {
    return (
      <div className="surveys-page">
        <PageMasthead title="Surveys" subtitle="Open responses from the community" />
        <ListPageSkeleton rows={3} />
      </div>
    );
  }

  return (
    <div className="surveys-page">
      <PageMasthead title="Surveys" subtitle="Open responses from the community" />

      <div className="container" style={{ paddingTop: 20 }}>
        {forms.length === 0 ? (
          <div className="empty-state">
            <h3>No open surveys</h3>
            <p className="meta">Check back soon.</p>
          </div>
        ) : (
          <div className="list-stagger list-stagger--gap-sm">
            {forms.map((form: any) => (
              <SurveyCard
                key={form._id}
                form={form}
                memberEmail={member?.email || ""}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const SurveyCard: React.FC<{ form: any; memberEmail: string }> = ({ form, memberEmail }) => {
  const navigate = useNavigate();
  const submission = useAdminReadQuery(
    api.surveys.getOwnSubmission,
    memberEmail ? { formId: form._id, email: memberEmail } : "skip",
  );

  const isSubmitted = !!submission;

  return (
    <article
      className={`card survey-card list-stagger-item ${isSubmitted ? "submitted" : ""}`}
      onClick={() => !isSubmitted && navigate(`/surveys/${form.slug}`)}
    >
      <div className="survey-card-top">
        <h2>{form.title}</h2>
        {isSubmitted ? (
          <span className="badge badge-submitted">Submitted</span>
        ) : (
          <span className="badge badge-live">
            <span className="pulse-dot" />
            Open
          </span>
        )}
      </div>

      {form.description && <p className="description-text">{form.description}</p>}

      {!isSubmitted && (
        <div className="card-action">
          <span>Open survey</span>
          <ChevronRight size={16} />
        </div>
      )}

      <style>{`
        .survey-card {
          cursor: pointer;
        }

        .survey-card.submitted {
          cursor: default;
        }

        .survey-card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
        }

        .survey-card h2 {
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

        .description-text {
          font-size: 14px;
          color: var(--ink-secondary);
          margin-top: 8px;
          line-height: 1.5;
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
    </article>
  );
};

export default Surveys;
