import React from "react";

export const Skeleton: React.FC = () => {
  return (
    <div className="skeleton">
      <div className="skeleton-item control"></div>
      <div className="skeleton-item img"></div>
      <div className="skeleton-item meta-line"></div>
      <div className="skeleton-item meta-line"></div>
      <div className="skeleton-item meta-line"></div>
      <div className="skeleton-item btn"></div>
    </div>
  );
};
