"use client";
import React, { useState, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { ProductGrid } from "@/components/ProductGrid";
import { SearchAndFilter, SearchFilters } from "@/components/SearchAndFilter";

export default function ProductsPage() {
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    category: "",
    minPrice: 0,
    maxPrice: 1000,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const products = useQuery(api.products.searchProducts, {
    query: filters.query || undefined,
    category: filters.category === "all" ? undefined : filters.category || undefined,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
  });

  const handleSearch = useCallback((newFilters: SearchFilters) => {
    setFilters(newFilters);
  }, []);

  return (
    <main className="max-w-7xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">All Products</h1>
        <p className="text-muted-foreground">
          Discover our collection of handcrafted bead products
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Search and Filter Sidebar */}
        <div className="lg:col-span-1">
          <SearchAndFilter onSearch={handleSearch} />
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          {products === undefined ? (
            <div className="text-center py-12">Loading products...</div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No products found matching your criteria.</p>
              <p className="text-sm text-muted-foreground">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div>
              <div className="mb-4 text-sm text-muted-foreground">
                Showing {products.length} product{products.length !== 1 ? "s" : ""}
              </div>
              <ProductGrid products={products.map(p => ({
                productId: p._id,
                name: p.name,
                description: p.description,
                price: p.price,
                imageUrl: p.imageUrl,
                category: p.category || undefined,
                rating: p.rating || undefined,
                reviewCount: p.reviewCount || undefined,
                stock: p.stock || undefined,
              }))} />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
