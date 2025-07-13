import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function CategorySkeleton() {
  return (
    <Card className="group hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Skeleton className="w-32 h-6 rounded" />
          <Skeleton className="w-16 h-5 rounded" />
        </div>
      </CardHeader>
      <CardContent>
        {/* Image skeleton */}
        <div className="mb-4">
          <Skeleton className="w-full h-48 rounded" />
        </div>
        
        {/* Description skeleton */}
        <div className="space-y-2 mb-4">
          <Skeleton className="w-full h-4 rounded" />
          <Skeleton className="w-3/4 h-4 rounded" />
        </div>
        
        {/* Link skeleton */}
        <Skeleton className="w-32 h-4 rounded" />
      </CardContent>
    </Card>
  );
}

export function CategoryGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <CategorySkeleton key={index} />
      ))}
    </div>
  );
} 