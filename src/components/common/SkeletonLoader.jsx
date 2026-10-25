import React from 'react';

export const MetricSkeleton = () => (
  <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs animate-pulse">
    <div className="flex items-center justify-between mb-3">
      <div className="h-3 bg-slate-200 rounded w-28"></div>
      <div className="w-9 h-9 bg-slate-100 rounded-lg"></div>
    </div>
    <div className="h-7 bg-slate-200 rounded w-20 mb-2"></div>
    <div className="h-3 bg-slate-100 rounded w-36"></div>
  </div>
);

export const CardSkeleton = () => (
  <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-xs animate-pulse space-y-4">
    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
      <div className="h-4 bg-slate-200 rounded w-36"></div>
      <div className="h-5 bg-slate-100 rounded w-16"></div>
    </div>
    <div className="space-y-3">
      <div className="h-3.5 bg-slate-100 rounded w-full"></div>
      <div className="h-3.5 bg-slate-100 rounded w-5/6"></div>
      <div className="h-3.5 bg-slate-100 rounded w-4/6"></div>
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 5 }) => (
  <div className="w-full bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs animate-pulse">
    <div className="h-8 bg-slate-100 rounded w-full mb-3"></div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="h-10 bg-slate-50 border-b border-slate-100/60 rounded w-full mb-2"></div>
    ))}
  </div>
);

export default CardSkeleton;
