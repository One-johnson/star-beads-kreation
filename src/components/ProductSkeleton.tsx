import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ProductSkeleton() {
  return (
    <Card className="border rounded-lg shadow-sm p-4 flex flex-col bg-white dark:bg-muted">
      {/* Image Skeleton */}
      <div className="relative mb-4">
        <Skeleton className="w-full h-48 rounded" />
        {/* Wishlist button skeleton */}
        <div className="absolute top-2 right-2">
          <Skeleton className="w-8 h-8 rounded" />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="flex-1">
        {/* Category badge skeleton */}
        <Skeleton className="w-16 h-5 rounded mb-2" />
        
        {/* Title skeleton */}
        <Skeleton className="w-3/4 h-6 rounded mb-2" />
        
        {/* Description skeleton */}
        <div className="space-y-1 mb-2">
          <Skeleton className="w-full h-4 rounded" />
          <Skeleton className="w-2/3 h-4 rounded" />
        </div>
        
        {/* Rating skeleton */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="w-4 h-4 rounded" />
            ))}
          </div>
          <Skeleton className="w-8 h-4 rounded" />
        </div>
        
        {/* Price skeleton */}
        <Skeleton className="w-20 h-6 rounded mb-4" />
        
        {/* Button skeleton */}
        <Skeleton className="w-full h-10 rounded" />
      </div>
    </Card>
  );
}

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <ProductSkeleton key={index} />
      ))}
    </div>
  );
} 