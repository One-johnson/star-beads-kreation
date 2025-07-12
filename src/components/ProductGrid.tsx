"use client";

import React from "react";
import { ProductCard, ProductCardProps } from "./ProductCard";

export type ProductGridProps = {
  products: ProductCardProps[]; // Now includes productId: Id<"products">
};

export function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard key={product.productId} {...product} />
      ))}
    </div>
  );
} 