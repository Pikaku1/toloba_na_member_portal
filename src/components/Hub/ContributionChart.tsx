import React from "react";

interface ContributionChartProps {
  data: number[];
  height?: number;
}

const ContributionChart: React.FC<ContributionChartProps> = ({ data, height = 120 }) => {
  if (data.length < 2) return null;

  const max = Math.max(...data) * 1.2;
  const min = 0;
  const width = 400;
  
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / (max - min)) * height;
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="ledger-chart">
      <div className="accent-font chart-title">CONTRIBUTION LEDGER TREND</div>
      <div className="chart-container">
        <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map(p => (
            <line 
              key={p}
              x1="0" y1={height * p} 
              x2={width} y2={height * p} 
              stroke="var(--parchment)" 
              strokeWidth="0.5" 
            />
          ))}
          
          {/* Data line */}
          <polyline
            fill="none"
            stroke="var(--gold)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
            style={{ filter: "drop-shadow(0 2px 4px rgba(201, 168, 76, 0.3))" }}
          />
        </svg>
      </div>

      <style>{`
        .ledger-chart {
          margin-top: 32px;
          padding: 24px;
          background: var(--white);
          border: 1px solid var(--parchment);
          border-radius: var(--radius-sm);
        }

        .chart-title {
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.12em;
          color: var(--gold-dark);
          margin-bottom: 20px;
          text-align: center;
        }

        .chart-container {
          height: 120px;
          width: 100%;
        }

        svg {
          width: 100%;
          height: 100%;
          overflow: visible;
        }
      `}</style>
    </div>
  );
};

export default ContributionChart;
