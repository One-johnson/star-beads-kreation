"use client";
import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

export default function CategoriesPage() {
  const categories = useQuery(api.categories.getCategories, {});
  const products = useQuery(api.products.listProducts, {});

  if (!categories) return <div>Loading...</div>;

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">Categories</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.map((cat) => {
          const count = products ? products.filter(p => p.category === cat.name).length : 0;
          return (
            <Link
              key={cat._id}
              href={`/categories/${cat._id}`}
              className="block bg-white rounded-lg shadow p-4 hover:bg-blue-50 transition"
            >
              {cat.imageUrl && (
                <div className="mb-3 flex justify-center">
                  <Image
                    src={cat.imageUrl}
                    alt={cat.name}
                    width={120}
                    height={120}
                    className="w-24 h-24 object-cover rounded-full border"
                  />
                </div>
              )}
              <div className="font-semibold text-lg mb-1 text-center flex items-center justify-center gap-2">
                {cat.name}
                <Badge variant="secondary">{count}</Badge>
              </div>
              <div className="text-sm text-gray-500 text-center">{cat.description}</div>
            </Link>
          );
        })}
      </div>
    </main>
  );
} 