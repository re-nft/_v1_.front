import React from "react";

export const Skeleton: React.FC = () => {
  return (
    <div className="h-full w-full animate-pulse">
      <div className="rounded-sm skeleton-item control "></div>
      <div className="rounded-sm skeleton-item img"></div>
      <div className="rounded-sm skeleton-item meta-line"></div>
      <div className="rounded-sm skeleton-item meta-line"></div>
      <div className="rounded-sm skeleton-item meta-line"></div>
      <div className="rounded-sm skeleton-item meta-line"></div>
      <div className="rounded-sm skeleton-item btn"></div>
    </div>
  );
};
