import React from "react";
import { ProductCard, ProductCardProps } from "./ProductCard";

export type ProductPreviewProps = {
  products: ProductCardProps[]; // Now includes productId: Id<"products">
};

export function ProductPreview({ products }: ProductPreviewProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {products.slice(0, 3).map((product) => (
        <ProductCard key={product.productId} {...product} />
      ))}
    </div>
  );
} 