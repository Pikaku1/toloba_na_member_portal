import React from "react";

interface ProgressBarProps {
  current: number;
  target: number;
  showPercentage?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ current, target, showPercentage = true }) => {
  const percentage = Math.min(Math.round((current / target) * 100), 100);
  
  return (
    <div className="exchequer-progress">
      <div className="progress-label">
        {showPercentage && <span className="accent-font percentage">{percentage}%</span>}
      </div>
      
      <div className="progress-track">
        <div 
          className="progress-fill" 
          style={{ width: `${percentage}%` }}
        >
          <div className="progress-marker">✦</div>
        </div>
      </div>

      <style>{`
        .exchequer-progress {
          margin: 12px 0;
        }

        .progress-label {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 4px;
        }

        .percentage {
          font-size: 10px;
          font-weight: 600;
          color: var(--gold-dark);
          letter-spacing: 0.05em;
        }

        .progress-track {
          height: 4px;
          background: var(--gold-pale);
          border-radius: 2px;
          position: relative;
        }

        .progress-fill {
          height: 100%;
          background: var(--gold);
          border-radius: 2px;
          position: relative;
          transition: width 1s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .progress-marker {
          position: absolute;
          right: -6px;
          top: -6px;
          color: var(--gold-dark);
          font-size: 12px;
          text-shadow: 0 0 4px rgba(201, 168, 76, 0.4);
        }
      `}</style>
    </div>
  );
};

export default ProgressBar;
