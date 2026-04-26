import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useAdminReadQuery } from "../hooks/useDbQuery";

const SurveyDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { member } = useAuth();

  const form = useAdminReadQuery(api.surveys.getBySlug, { slug: slug || "" });
  const questions = useAdminReadQuery(api.surveys.getQuestions, 
    form ? { formId: form._id } : "skip"
  );
  
  const submitSurvey = useMutation(api.surveys.submit);

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (form === undefined || questions === undefined) {
    return <div className="loading">Loading survey...</div>;
  }

  if (form === null) {
    return (
      <div className="error-state">
        <p>This survey is no longer available.</p>
        <button onClick={() => navigate("/surveys")} className="btn-secondary">Back to Surveys</button>
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
        formId: form._id,
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

  const isFormValid = questions.every(q => !q.required || answers[q._id]);

  if (isSuccess) {
    return (
      <div className="success-view">
        <div className="success-card">
          <CheckCircle2 size={64} color="var(--success)" />
          <h1>Thanks!</h1>
          <p>Your response has been recorded.</p>
          <button onClick={() => navigate("/surveys")} className="btn-primary" style={{ marginTop: "24px" }}>
            Back to Surveys
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="survey-detail">
      <header className="header">
        <button onClick={() => navigate("/surveys")} className="back-btn">
          <ArrowLeft size={20} />
        </button>
        <h1>{form.title}</h1>
      </header>

      <form onSubmit={handleSubmit} className="form-content">
        {questions.map((q: any) => (
          <div key={q._id} className="question-item">
            <label>
              {q.label} {q.required && <span className="required">*</span>}
            </label>
            {q.help_text && <p className="help-text">{q.help_text}</p>}
            
            <QuestionInput 
              question={q} 
              value={answers[q._id] || ""} 
              onChange={(val) => handleInputChange(q._id, val)}
              disabled={isSubmitting}
            />
          </div>
        ))}

        {error && <p className="error-text">{error}</p>}

        <div className="sticky-submit">
          <button 
            type="submit" 
            className="btn-primary" 
            disabled={isSubmitting || !isFormValid}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>

      <style>{`
        .survey-detail {
          padding-top: 60px;
        }
        .header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 60px;
          background: var(--background);
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          padding: 0 20px;
          z-index: 100;
          gap: 16px;
        }
        @media (min-width: 768px) {
          .header { max-width: 480px; left: 50%; transform: translateX(-50%); }
        }
        .header h1 { font-size: 18px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .back-btn { background: none; color: var(--text-primary); padding: 8px; margin-left: -8px; }
        
        .form-content { padding-top: 20px; }
        .question-item { margin-bottom: 32px; }
        .question-item label { display: block; font-weight: 600; margin-bottom: 8px; }
        .required { color: var(--error); }
        .help-text { font-size: 13px; color: var(--text-secondary); margin-bottom: 12px; margin-top: -4px; }
        
        .sticky-submit {
          position: sticky;
          bottom: 20px;
          padding: 20px 0;
          background: linear-gradient(to top, var(--background) 80%, transparent);
        }
        
        .error-text { color: var(--error); font-size: 14px; margin-bottom: 16px; text-align: center; }
        
        .success-view { height: 70vh; display: flex; align-items: center; justify-content: center; text-align: center; }
        .success-card h1 { margin-top: 16px; margin-bottom: 8px; }
        .success-card p { color: var(--text-secondary); }
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
      return <textarea rows={3} value={value} onChange={e => onChange(e.target.value)} disabled={disabled} />;
    
    case "email":
      return <input type="email" value={value} onChange={e => onChange(e.target.value)} inputMode="email" disabled={disabled} />;
    
    case "number":
      return <input type="number" value={value} onChange={e => onChange(e.target.value)} inputMode="decimal" disabled={disabled} />;
    
    case "date":
      return <input type="date" value={value} onChange={e => onChange(e.target.value)} disabled={disabled} />;
    
    case "dropdown":
      return (
        <select value={value} onChange={e => onChange(e.target.value)} disabled={disabled}>
          <option value="">Select an option</option>
          {question.options?.map((opt: string) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      );
    
    case "single_choice":
      return (
        <div className="radio-group">
          {question.options?.map((opt: string) => (
            <div 
              key={opt} 
              className={`option-row ${value === opt ? "selected" : ""}`}
              onClick={() => !disabled && onChange(opt)}
            >
              <div className="radio-circle" />
              <span>{opt}</span>
            </div>
          ))}
          <style>{`
            .radio-group { display: flex; flex-direction: column; gap: 8px; }
            .option-row { 
              padding: 12px 16px; border: 1px solid var(--border); border-radius: var(--radius);
              display: flex; align-items: center; gap: 12px; cursor: pointer; background: var(--surface);
            }
            .option-row.selected { border-color: var(--accent); background: var(--background); }
            .radio-circle { width: 18px; height: 18px; border: 2px solid var(--border); border-radius: 50%; position: relative; }
            .selected .radio-circle { border-color: var(--accent); }
            .selected .radio-circle::after { 
              content: ""; position: absolute; top: 3px; left: 3px; width: 8px; height: 8px; 
              background: var(--accent); border-radius: 50%;
            }
          `}</style>
        </div>
      );
    
    case "yes_no":
      return (
        <div className="yes-no-group">
          <button 
            type="button" 
            className={`btn-pill ${value === "Yes" ? "selected" : ""}`}
            onClick={() => !disabled && onChange("Yes")}
          >
            Yes
          </button>
          <button 
            type="button" 
            className={`btn-pill ${value === "No" ? "selected" : ""}`}
            onClick={() => !disabled && onChange("No")}
          >
            No
          </button>
          <style>{`
            .yes-no-group { display: flex; gap: 12px; }
            .btn-pill { 
              flex: 1; height: 48px; border: 1px solid var(--border); border-radius: 24px;
              background: var(--surface); font-weight: 500;
            }
            .btn-pill.selected { background: var(--accent); color: white; border-color: var(--accent); }
          `}</style>
        </div>
      );
    
    default:
      return <p className="meta">Question type {question.type} not supported yet.</p>;
  }
};

export default SurveyDetail;
