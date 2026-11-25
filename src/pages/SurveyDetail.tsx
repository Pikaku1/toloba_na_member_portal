import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@tolobana/convex-backend/convex/_generated/api";
import type { Doc, Id } from "@tolobana/convex-backend/convex/_generated/dataModel";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft } from "lucide-react";
import { useAdminMutation, useAdminReadQuery } from "../hooks/useDbQuery";
import ListPageSkeleton from "../components/ListPageSkeleton";

const SurveyDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { member } = useAuth();

  const form = useAdminReadQuery(api.surveys.getBySlug, slug ? { slug } : "skip");
  const questions = useAdminReadQuery(
    api.surveys.getQuestions,
    form ? { formId: form._id } : "skip",
  );

  // Keep the last resolved query results to avoid UI flicker when
  // Convex briefly reports undefined during reactive updates.
  const [resolvedForm, setResolvedForm] = useState<typeof form>(undefined);
  const [resolvedQuestions, setResolvedQuestions] = useState<typeof questions>(undefined);

  useEffect(() => {
    if (form !== undefined) {
      setResolvedForm(form);
    }
  }, [form]);

  useEffect(() => {
    if (questions !== undefined) {
      setResolvedQuestions(questions);
    }
  }, [questions]);

  const stableForm = form === undefined ? resolvedForm : form;
  const stableQuestions = questions === undefined ? resolvedQuestions : questions;
  
  const submitSurvey = useAdminMutation(api.surveys.submit);

  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (stableForm === undefined || stableQuestions === undefined) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--cream)" }}>
        <ListPageSkeleton rows={5} tall />
      </div>
    );
  }

  if (stableForm === null) {
    return (
      <div className="container" style={{ textAlign: 'center', paddingTop: '100px' }}>
        <h2 className="display-font">Survey not found</h2>
        <p className="meta" style={{ margin: '16px 0' }}>This survey is no longer available.</p>
        <button onClick={() => navigate("/surveys")} className="btn btn-navy">Back to Surveys</button>
      </div>
    );
  }

  const handleInputChange = (questionId: string, value: string | string[]) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Only submit answers for questions that are currently loaded for this form.
      // This prevents accidental submission of stale/foreign IDs from local state.
      const formattedAnswers: { question_id: Id<"questions">; value: string }[] =
        stableQuestions.flatMap((q: Doc<"questions">) => {
          const raw = answers[q._id];
          const value = Array.isArray(raw) ? JSON.stringify(raw) : raw;
          if (typeof value !== "string" || value.length === 0) return [];
          return [{ question_id: q._id, value }];
        });

      await submitSurvey({
        formId: stableForm._id,
        respondent_email: member?.email,
        answers: formattedAnswers
      });

      setIsSuccess(true);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === "object" &&
              err !== null &&
              "data" in err &&
              typeof (err as { data: unknown }).data === "string"
            ? (err as { data: string }).data
            : "Failed to submit survey. Please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = stableQuestions.every((q: Doc<"questions">) => {
    if (!q.required) return true;
    const answer = answers[q._id];
    if (Array.isArray(answer)) return answer.length > 0;
    return Boolean(answer);
  });

  if (isSuccess) {
    return (
      <div className="success-overlay">
        <div className="success-panel">
          <div className="check-icon icon-success-pop" aria-hidden="true">✓</div>
          <p className="kicker">Response recorded</p>
          <h1 className="success-title">Your submission has been saved.</h1>
          <p className="success-subtitle">Thank you. You can close this survey.</p>
          <button onClick={() => navigate("/surveys")} className="btn btn-navy">
            Back to surveys
          </button>
        </div>

        <style>{`
          .success-overlay {
            min-height: 100vh;
            min-height: 100dvh;
            background: var(--bg);
            display: flex;
            align-items: flex-end;
            justify-content: center;
            padding: 0;
          }
          .success-panel {
            width: 100%;
            max-width: none;
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 16px 16px 0 0;
            padding: 24px 16px calc(24px + env(safe-area-inset-bottom, 0px));
            text-align: center;
          }
          @media (min-width: 768px) {
            .success-overlay { align-items: center; padding: 24px; }
            .success-panel {
              max-width: 420px;
              border-radius: 12px;
              padding: 32px 24px;
            }
          }
          .check-icon {
            width: 44px;
            height: 44px;
            margin: 0 auto 16px;
            border-radius: 999px;
            background: var(--success-bg);
            color: var(--success);
            display: grid;
            place-items: center;
            font-size: 20px;
            font-weight: 700;
          }
          .kicker { color: var(--success); font-size: 13px; font-weight: 600; margin-bottom: 8px; }
          .success-title { font-size: 22px; margin-bottom: 8px; }
          .success-subtitle { color: var(--ink-muted); font-size: 15px; margin-bottom: 24px; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="survey-detail-page">
      <header className="sticky-header">
        <div className="header-container">
          <button onClick={() => navigate("/surveys")} className="back-link">
            <ArrowLeft size={20} />
          </button>
          <h1 className="display-font">{stableForm.title}</h1>
        </div>
        <div className="double-rule-thin"></div>
      </header>

      <div className="container form-container">
        <form onSubmit={handleSubmit}>
          {stableQuestions.map((q: any) => (
            <div key={q._id} className="question-block">
              <div className="field-label">
                {q.label} {q.required && <span style={{ color: 'var(--error)' }}>*</span>}
              </div>
              {q.help_text && <p className="help-text">{q.help_text}</p>}
              
              <QuestionInput 
                question={q} 
                value={answers[q._id] ?? ""} 
                onChange={(val) => handleInputChange(q._id, val)}
                disabled={isSubmitting}
              />
              
              <div className="micro-rule"></div>
            </div>
          ))}

          {error && (
            <p className="field-error" style={{ marginBottom: '24px', justifyContent: 'center' }}>
              <span aria-hidden="true">⚠</span> {error}
            </p>
          )}

          <div className="submit-bar">
            <div className="container" style={{ padding: '0' }}>
              <button 
                type="submit" 
                className="btn btn-gold" 
                disabled={isSubmitting || !isFormValid}
              >
                {isSubmitting ? <div className="loading-spinner"></div> : "Submit"}
              </button>
            </div>
          </div>
        </form>
      </div>

      <style>{`
        .survey-detail-page {
          background-color: var(--cream);
          min-height: 100vh;
          padding-top: calc(64px + env(safe-area-inset-top, 0px));
        }

        .sticky-header {
          position: fixed;
          top: 0;
          left: var(--nav-width);
          right: 0;
          background: var(--bg);
          border-bottom: 1px solid var(--border);
          padding-top: env(safe-area-inset-top, 0px);
          z-index: 100;
        }

        .header-container {
          max-width: 600px;
          margin: 0 auto;
          height: 64px;
          display: flex;
          align-items: center;
          padding: 0 20px;
          gap: 16px;
        }

        .header-container h1 {
          color: var(--ink);
          font-size: 16px;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .back-link {
          background: none;
          border: none;
          color: var(--ink);
          display: flex;
          align-items: center;
          padding: 8px;
          margin-left: -8px;
          cursor: pointer;
        }

        .double-rule-thin { display: none; }

        .form-container {
          padding-top: 28px;
          padding-bottom: calc(120px + env(safe-area-inset-bottom, 0px));
        }

        .question-block {
          margin-bottom: 28px;
        }

        .help-text {
          font-size: 13px;
          color: var(--ink-muted);
          margin-bottom: 12px;
          margin-top: -4px;
        }

        .micro-rule { display: none; }

        .submit-bar {
          position: fixed;
          bottom: 0;
          left: var(--nav-width);
          right: 0;
          background: var(--surface);
          border-top: 1px solid var(--border);
          padding: 12px 20px calc(12px + env(safe-area-inset-bottom, 0px));
          z-index: 110;
        }

        @media (min-width: 768px) {
          .submit-bar {
            position: relative;
            background: none;
            border: none;
            padding: 40px 0;
          }
        }
      `}</style>
    </div>
  );
};

const QuestionInput: React.FC<{ 
  question: any; 
  value: string | string[];
  onChange: (val: string | string[]) => void;
  disabled?: boolean;
}> = ({ question, value, onChange, disabled }) => {
  const stringValue = typeof value === "string" ? value : "";
  switch (question.type) {
    case "short_text":
      return <input type="text" value={stringValue} onChange={e => onChange(e.target.value)} disabled={disabled} />;
    
    case "long_text":
      return <textarea rows={4} value={stringValue} onChange={e => onChange(e.target.value)} disabled={disabled} style={{ height: 'auto', padding: '12px 16px' }} />;
    
    case "email":
      return <input type="email" value={stringValue} onChange={e => onChange(e.target.value)} inputMode="email" disabled={disabled} />;
    
    case "number":
      return <input type="number" value={stringValue} onChange={e => onChange(e.target.value)} inputMode="decimal" disabled={disabled} />;
    
    case "date":
      return <input type="date" value={stringValue} onChange={e => onChange(e.target.value)} disabled={disabled} />;
    
    case "single_choice":
      return (
        <div className="choice-group">
          {question.options?.map((opt: string) => (
            <div 
              key={opt} 
              className={`choice-row ${stringValue === opt ? "selected" : ""}`}
              onClick={() => !disabled && onChange(opt)}
            >
              <div className="choice-indicator">
                <div className="choice-inner" />
              </div>
              <span>{opt}</span>
            </div>
          ))}
          <style>{`
            .choice-group { display: flex; flex-direction: column; gap: 8px; }
            .choice-row { 
              height: 48px; padding: 0 14px; border: 1px solid var(--border); border-radius: 8px;
              display: flex; align-items: center; gap: 12px; cursor: pointer; background: var(--white);
            }
            .choice-row.selected { border-color: var(--brand); background: var(--brand-soft); }
            .choice-indicator { width: 18px; height: 18px; border: 1.5px solid var(--parchment); border-radius: 50%; display: flex; align-items: center; justify-content: center; }
            .selected .choice-indicator { border-color: var(--gold); }
            .choice-inner { width: 10px; height: 10px; border-radius: 50%; background: transparent; transition: background 0.2s; }
            .selected .choice-inner { background: var(--gold); }
          `}</style>
        </div>
      );

    case "multiple_choice": {
      const selected = Array.isArray(value) ? value : [];
      const toggle = (opt: string) => {
        if (disabled) return;
        if (selected.includes(opt)) {
          onChange(selected.filter((item) => item !== opt));
          return;
        }
        onChange([...selected, opt]);
      };
      return (
        <div className="choice-group">
          {question.options?.map((opt: string) => (
            <div
              key={opt}
              className={`choice-row ${selected.includes(opt) ? "selected" : ""}`}
              onClick={() => toggle(opt)}
            >
              <div className="choice-indicator checkbox">
                <div className="choice-inner" />
              </div>
              <span>{opt}</span>
            </div>
          ))}
          <style>{`
            .choice-group { display: flex; flex-direction: column; gap: 8px; }
            .choice-row { 
              min-height: 48px; padding: 10px 14px; border: 1px solid var(--border); border-radius: 8px;
              display: flex; align-items: center; gap: 12px; cursor: pointer; background: var(--white);
            }
            .choice-row.selected { border-color: var(--brand); background: var(--brand-soft); }
            .choice-indicator.checkbox { width: 18px; height: 18px; border: 1.5px solid var(--parchment); border-radius: 4px; display: flex; align-items: center; justify-content: center; }
            .selected .choice-indicator.checkbox { border-color: var(--gold); }
            .choice-inner { width: 10px; height: 10px; border-radius: 2px; background: transparent; transition: background 0.2s; }
            .selected .choice-inner { background: var(--gold); }
          `}</style>
        </div>
      );
    }

    case "dropdown":
      return (
        <select
          value={stringValue}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        >
          <option value="">Select an option...</option>
          {question.options?.map((opt: string) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    
    case "yes_no":
      return (
        <div className="yes-no-group">
          <button 
            type="button" 
            className={`choice-btn ${stringValue === "Yes" ? "selected" : ""}`}
            onClick={() => !disabled && onChange("Yes")}
          >
            Yes
          </button>
          <button 
            type="button" 
            className={`choice-btn ${stringValue === "No" ? "selected" : ""}`}
            onClick={() => !disabled && onChange("No")}
          >
            No
          </button>
          <style>{`
            .yes-no-group { display: flex; gap: 12px; }
            .choice-btn { 
              flex: 1; height: 48px; border: 1px solid var(--border); border-radius: var(--radius-md);
              background: var(--surface); color: var(--ink); font-weight: 600;
              font-family: var(--font-ui); cursor: pointer;
            }
            .choice-btn.selected { background: var(--brand); color: white; border-color: var(--brand); }
          `}</style>
        </div>
      );
    
    default:
      return <p className="meta">Question type {question.type} not supported.</p>;
  }
};

export default SurveyDetail;
