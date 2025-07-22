"use client";
import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { X, AlertTriangle, CheckCircle, Eye } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";

export default function CategoriesPage() {
  const categories = useQuery(api.categories.getCategories, {});
  const products = useQuery(api.products.listProducts, {});

  if (!categories || !products) {
    return (
      <main className="p-8">
        <h1 className="text-3xl font-bold mb-6">Categories</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-4 relative">
              <span className="absolute top-3 right-3">
                <Skeleton className="w-8 h-5 rounded-full" />
              </span>
              <div className="mb-3 flex justify-center">
                <Skeleton className="w-24 h-24 rounded-full" />
              </div>
              <div className="font-semibold text-lg mb-1 text-center flex items-center justify-center gap-2">
                <Skeleton className="w-24 h-6 rounded" />
              </div>
              <div className="text-sm text-gray-500 text-center">
                <Skeleton className="w-32 h-4 rounded mx-auto" />
              </div>
            </div>
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">Categories</h1>
      <TooltipProvider>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.map((cat) => {
          const count = products ? products.filter(p => p.category === cat.name).length : 0;
          let badgeVariant: any = "secondary";
          let badgeIcon = null;
          let badgeTooltip = "";
          if (count === 0) {
            badgeVariant = "destructive";
            badgeIcon = <X className="w-3 h-3 mr-1" />;
            badgeTooltip = "No products";
          } else if (count <= 5) {
            badgeVariant = "default";
            badgeIcon = <AlertTriangle className="w-3 h-3 mr-1 text-yellow-500" />;
            badgeTooltip = "Few products";
          } else {
            badgeVariant = "success";
            badgeIcon = <CheckCircle className="w-3 h-3 mr-1 text-green-600" />;
            badgeTooltip = "Well stocked";
          }
          return (
            <div
              key={cat._id}
              className="bg-white rounded-lg shadow p-4 transition relative group focus-within:ring-2 focus-within:ring-blue-400 hover:shadow-lg hover:scale-[1.02]"
              tabIndex={0}
            >
              <span className="absolute top-3 right-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant={badgeVariant} className="px-2 py-0.5 text-xs font-semibold flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-blue-400">
                      {badgeIcon}
                      {count}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>{badgeTooltip}</TooltipContent>
                </Tooltip>
              </span>
              <div className="mb-3 flex justify-center">
                <Image
                  src={cat.imageUrl || "/beads/placeholder.jpg"}
                  alt={cat.name}
                  width={120}
                  height={120}
                  className="w-24 h-24 object-cover rounded-full border bg-gray-100"
                />
              </div>
              <div className="font-semibold text-lg mb-1 text-center flex items-center justify-center gap-2">
                <Link
                  href={`/categories/${cat._id}`}
                  className="font-bold text-blue-700 transition-colors duration-200 hover:text-blue-900 hover:underline hover:underline-offset-4 hover:decoration-2 flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-blue-400 px-1 py-0.5 rounded"
                  tabIndex={0}
                  aria-label={`View ${cat.name} category`}
                >
                  <Eye className="w-4 h-4 mr-1" aria-hidden="true" />
                  {cat.name}
                </Link>
              </div>
              <div className="text-sm text-gray-500 text-center">{cat.description}</div>
            </div>
          );
        })}
      </div>
      </TooltipProvider>
    </main>
  );
} 