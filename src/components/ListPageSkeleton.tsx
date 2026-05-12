import React from "react";

type ListPageSkeletonProps = {
  rows?: number;
  /** Taller blocks for survey-style form placeholders */
  tall?: boolean;
};

/**
 * List-style loading placeholders (CSS shimmer in index.css).
 */
const ListPageSkeleton: React.FC<ListPageSkeletonProps> = ({
  rows = 3,
  tall = false,
}) => {
  return (
    <div
      className="container list-page-skeleton-wrap"
      style={{ paddingTop: tall ? 28 : 24 }}
      role="status"
      aria-label="Loading"
    >
      <div className="list-stagger">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="list-stagger-item skeleton-row-outer">
            <div
              className={`skeleton-block ${tall ? "skeleton-row-tall" : "skeleton-row-card"}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListPageSkeleton;
