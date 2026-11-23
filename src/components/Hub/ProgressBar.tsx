import React from "react";

interface ProgressBarProps {
  current: number;
  target: number;
  showPercentage?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ current, target, showPercentage = true }) => {
  const percentage = target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0;

  return (
    <div className="progress">
      {showPercentage && <span className="progress-percent">{percentage}%</span>}
      <div
        className="progress-track"
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="progress-fill" style={{ width: `${percentage}%` }} />
      </div>

      <style>{`
        .progress { margin: 8px 0; }
        .progress-percent {
          display: block;
          text-align: right;
          font-size: 12px;
          font-weight: 600;
          color: var(--ink-muted);
          margin-bottom: 6px;
        }
        .progress-track {
          height: 6px;
          background: var(--cream-deep);
          border-radius: 999px;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          background: var(--brand);
          border-radius: 999px;
        }
      `}</style>
    </div>
  );
};

export default ProgressBar;
