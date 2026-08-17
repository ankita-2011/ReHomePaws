import "../styles/skeleton.css";

export const CardSkeleton = () => (
  <div className="skeleton-card">
    <div className="skeleton-card-img skeleton-shimmer" />
    <div className="skeleton-card-body">
      <div className="skeleton-text-title skeleton-shimmer" />
      <div className="skeleton-text-subtitle skeleton-shimmer" />
      <div className="skeleton-grid-details">
        <div className="skeleton-grid-item skeleton-shimmer" />
        <div className="skeleton-grid-item skeleton-shimmer" />
        <div className="skeleton-grid-item skeleton-shimmer" />
      </div>
      <div className="skeleton-card-footer skeleton-shimmer" />
    </div>
  </div>
);

export const CardGridSkeleton = ({ count = 6 }) => (
  <div className="ap-grid" style={{ marginTop: 20 }}>
    {Array.from({ length: count }).map((_, i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
);

export const DetailSkeleton = () => (
  <div className="skeleton-detail-wrapper">
    <div className="skeleton-detail-left skeleton-shimmer" />
    <div className="skeleton-detail-right">
      <div className="skeleton-detail-header skeleton-shimmer" />
      <div className="skeleton-detail-tags">
        <div className="skeleton-detail-tag skeleton-shimmer" />
        <div className="skeleton-detail-tag skeleton-shimmer" />
        <div className="skeleton-detail-tag skeleton-shimmer" />
      </div>
      <div className="skeleton-detail-block skeleton-shimmer" />
      <div className="skeleton-detail-block skeleton-shimmer" />
      <div className="skeleton-detail-block skeleton-shimmer" />
    </div>
  </div>
);

export const RowSkeleton = () => (
  <div className="skeleton-row-item">
    <div className="skeleton-row-avatar skeleton-shimmer" />
    <div className="skeleton-row-content">
      <div className="skeleton-row-line skeleton-shimmer" style={{ width: "30%" }} />
      <div className="skeleton-row-line skeleton-shimmer" style={{ width: "60%" }} />
      <div className="skeleton-row-line skeleton-shimmer" style={{ width: "40%" }} />
    </div>
  </div>
);

export const RowListSkeleton = ({ count = 4 }) => (
  <div style={{ marginTop: 20 }}>
    {Array.from({ length: count }).map((_, i) => (
      <RowSkeleton key={i} />
    ))}
  </div>
);
