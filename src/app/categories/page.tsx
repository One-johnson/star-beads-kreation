"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CategoriesPage() {
  const categories = useQuery(api.categories.getCategories);
  const allProducts = useQuery(api.products.listProducts);

  // Count products per category
  const getProductCount = (categoryName: string) => {
    if (!allProducts) return 0;
    return allProducts.filter(product => product.category === categoryName).length;
  };

  if (categories === undefined) {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <div className="text-center">Loading categories...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Product Categories</h1>
        <p className="text-muted-foreground">
          Explore our collection by category
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Card key={category._id} className="group hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{category.name}</CardTitle>
                <Badge variant="secondary">
                  {getProductCount(category.name)} items
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {category.imageUrl && (
                <div className="mb-4">
                  <img
                    src={category.imageUrl}
                    alt={category.name}
                    className="w-full h-48 object-cover rounded"
                  />
                </div>
              )}
              <p className="text-muted-foreground mb-4 line-clamp-2">
                {category.description}
              </p>
              <Link
                href={`/products?category=${encodeURIComponent(category.name)}`}
                className="inline-flex items-center text-primary hover:text-primary/80 font-medium group-hover:translate-x-1 transition-transform"
              >
                Browse {category.name}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {categories.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-muted-foreground">No categories found.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 