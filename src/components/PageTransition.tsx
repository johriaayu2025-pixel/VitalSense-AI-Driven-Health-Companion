import { ReactNode, useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface PageTransitionProps {
  children: ReactNode;
  loading?: boolean;
}

export const PageTransition = ({ children, loading = false }: PageTransitionProps) => {
  if (loading) {
    return <PageSkeleton />;
  }

  return (
    <div className="animate-in fade-in duration-300">
      {children}
    </div>
  );
};

const PageSkeleton = () => {
  return (
    <div className="space-y-5">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Cards Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-3 p-5 border rounded-xl">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-16" />
          </div>
        ))}
      </div>

      {/* Large Card Skeleton */}
      <div className="space-y-4 p-6 border rounded-xl">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-32 w-full" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      {/* Additional Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <div key={i} className="space-y-3 p-5 border rounded-xl">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
};
