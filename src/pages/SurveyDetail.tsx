import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft } from "lucide-react";
import { useAdminReadQuery } from "../hooks/useDbQuery";

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
  
  const submitSurvey = useMutation(api.surveys.submit);

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (stableForm === undefined || stableQuestions === undefined) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="loading-spinner" style={{ color: 'var(--green)' }}></div>
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

  const handleInputChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const formattedAnswers = Object.entries(answers).map(([id, val]) => ({
        question_id: id as any,
        value: val
      }));

      await submitSurvey({
        formId: stableForm._id,
        respondent_email: member?.email,
        answers: formattedAnswers
      });

      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to submit survey. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = stableQuestions.every(q => !q.required || answers[q._id]);

  if (isSuccess) {
    return (
      <div className="success-overlay pattern-bg">
        <div className="success-panel page-transition">
          <div className="double-rule"></div>
          <div className="success-content">
            <div className="check-icon accent-font">✓</div>
            <div className="accent-font kicker">RESPONSE RECORDED</div>
            <h1 className="display-font success-title">Your submission has been saved.</h1>
            <p className="success-subtitle">Thank you for your contribution to the community.</p>
            <div className="ornament-rule" style={{ margin: '32px auto' }}>
              <span style={{ fontSize: '14px' }}>✦</span>
            </div>
            <button onClick={() => navigate("/surveys")} className="btn btn-ghost" style={{ color: 'var(--white)', borderColor: 'rgba(255,255,255,0.35)' }}>
              ← BACK TO SURVEYS
            </button>
          </div>
          <div className="double-rule"></div>
        </div>

        <style>{`
          .success-overlay {
            height: 100vh;
            background-color: var(--navy);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }
          .success-panel {
            width: 100%;
            max-width: 500px;
            text-align: center;
          }
          .success-content { padding: 48px 0; }
          .check-icon { font-size: 48px; color: var(--gold); margin-bottom: 16px; }
          .kicker { color: var(--gold); font-size: 11px; font-weight: 600; letter-spacing: 0.16em; margin-bottom: 12px; }
          .success-title { color: var(--white); font-size: 24px; font-weight: 700; font-style: italic; margin-bottom: 8px; }
          .success-subtitle { color: rgba(255,255,255,0.65); font-size: 15px; }
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
              <div className="field-label" style={{ color: 'var(--gold-dark)' }}>
                {q.label} {q.required && <span style={{ color: 'var(--error)' }}>*</span>}
              </div>
              {q.help_text && <p className="help-text">{q.help_text}</p>}
              
              <QuestionInput 
                question={q} 
                value={answers[q._id] || ""} 
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
                {isSubmitting ? <div className="loading-spinner"></div> : "SUBMIT RESPONSES"}
              </button>
            </div>
          </div>
        </form>
      </div>

      <style>{`
        .survey-detail-page {
          background-color: var(--cream);
          min-height: 100vh;
          padding-top: 64px;
        }

        .sticky-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: var(--green);
          z-index: 100;
        }

        @media (min-width: 768px) {
          .sticky-header {
            max-width: 100%;
            left: 0;
            transform: none;
          }
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
          color: var(--white);
          font-size: 17px;
          font-weight: 700;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .back-link {
          background: none;
          border: none;
          color: var(--white);
          display: flex;
          align-items: center;
          padding: 8px;
          margin-left: -8px;
          cursor: pointer;
        }

        .double-rule-thin {
          height: 1px;
          background: var(--gold);
          opacity: 0.6;
        }

        .form-container {
          padding-top: 28px;
          padding-bottom: 120px;
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

        .micro-rule {
          height: 1px;
          background: var(--gold);
          opacity: 0.15;
          margin-top: 16px;
        }

        .submit-bar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: var(--navy);
          border-top: 2px solid var(--gold);
          padding: 16px 20px;
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
  value: string; 
  onChange: (val: string) => void;
  disabled?: boolean;
}> = ({ question, value, onChange, disabled }) => {
  switch (question.type) {
    case "short_text":
      return <input type="text" value={value} onChange={e => onChange(e.target.value)} disabled={disabled} />;
    
    case "long_text":
      return <textarea rows={4} value={value} onChange={e => onChange(e.target.value)} disabled={disabled} style={{ height: 'auto', padding: '12px 16px' }} />;
    
    case "email":
      return <input type="email" value={value} onChange={e => onChange(e.target.value)} inputMode="email" disabled={disabled} />;
    
    case "number":
      return <input type="number" value={value} onChange={e => onChange(e.target.value)} inputMode="decimal" disabled={disabled} />;
    
    case "date":
      return <input type="date" value={value} onChange={e => onChange(e.target.value)} disabled={disabled} />;
    
    case "single_choice":
      return (
        <div className="choice-group">
          {question.options?.map((opt: string) => (
            <div 
              key={opt} 
              className={`choice-row ${value === opt ? "selected" : ""}`}
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
              height: 52px; padding: 0 16px; border: 1px solid var(--parchment); border-left: 3px solid transparent;
              display: flex; align-items: center; gap: 12px; cursor: pointer; background: var(--white);
              transition: all 0.2s ease;
            }
            .choice-row.selected { border-left-color: var(--gold); background: var(--gold-pale); }
            .choice-indicator { width: 18px; height: 18px; border: 1.5px solid var(--parchment); border-radius: 50%; display: flex; align-items: center; justify-content: center; }
            .selected .choice-indicator { border-color: var(--gold); }
            .choice-inner { width: 10px; height: 10px; border-radius: 50%; background: transparent; transition: background 0.2s; }
            .selected .choice-inner { background: var(--gold); }
          `}</style>
        </div>
      );
    
    case "yes_no":
      return (
        <div className="yes-no-group">
          <button 
            type="button" 
            className={`choice-btn ${value === "Yes" ? "selected" : ""}`}
            onClick={() => !disabled && onChange("Yes")}
          >
            YES
          </button>
          <button 
            type="button" 
            className={`choice-btn ${value === "No" ? "selected" : ""}`}
            onClick={() => !disabled && onChange("No")}
          >
            NO
          </button>
          <style>{`
            .yes-no-group { display: flex; gap: 12px; }
            .choice-btn { 
              flex: 1; height: 52px; border: 1.5px solid var(--gold); border-radius: var(--radius-md);
              background: transparent; color: var(--gold); font-weight: 600; letter-spacing: 0.05em;
              font-family: var(--font-ui); transition: all 0.2s;
            }
            .choice-btn.selected { background: var(--gold); color: var(--navy); }
          `}</style>
        </div>
      );
    
    default:
      return <p className="meta">Question type {question.type} not supported.</p>;
  }
};

export default SurveyDetail;
