"use client";
import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CategoryDetailsPage() {
  const params = useParams();
  const categoryId = params?.categoryId as string;
  const category = useQuery(api.categories.getCategories, {});
  const products = useQuery(api.products.listProducts, {});

  // Sorting and filtering state
  const [sort, setSort] = useState("price-asc");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);

  if (!category || !products) return <div>Loading...</div>;

  const cat = category.find((c) => c._id === categoryId);
  let categoryProducts = products.filter((p) => p.category === cat?.name);

  if (!cat) return <div>Category not found.</div>;

  // Filtering
  if (minPrice) categoryProducts = categoryProducts.filter(p => p.price >= parseFloat(minPrice));
  if (maxPrice) categoryProducts = categoryProducts.filter(p => p.price <= parseFloat(maxPrice));
  if (inStockOnly) categoryProducts = categoryProducts.filter(p => (p.stock ?? 1) > 0);

  // Sorting
  categoryProducts = categoryProducts.slice();
  if (sort === "price-asc") categoryProducts.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") categoryProducts.sort((a, b) => b.price - a.price);
  if (sort === "name-asc") categoryProducts.sort((a, b) => a.name.localeCompare(b.name));
  if (sort === "name-desc") categoryProducts.sort((a, b) => b.name.localeCompare(a.name));
  if (sort === "rating-desc") categoryProducts.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

  return (
    <main className="p-8">
      <Link href="/categories" className="text-blue-600 hover:underline mb-4 inline-block">&larr; Back to Categories</Link>
      <h1 className="text-3xl font-bold mb-2">{cat.name}</h1>
      <p className="mb-6 text-gray-600">{cat.description}</p>

      {/* Sorting and Filtering UI */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 items-end">
        <div className="flex gap-2 items-center">
          <label className="text-sm font-medium">Sort by:</label>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="name-asc">Name: A-Z</SelectItem>
              <SelectItem value="name-desc">Name: Z-A</SelectItem>
              <SelectItem value="rating-desc">Rating: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2 items-center">
          <label className="text-sm font-medium">Min Price:</label>
          <input
            type="number"
            min="0"
            value={minPrice}
            onChange={e => setMinPrice(e.target.value)}
            className="border rounded px-2 py-1 w-20 text-sm"
            placeholder="0"
          />
          <label className="text-sm font-medium">Max Price:</label>
          <input
            type="number"
            min="0"
            value={maxPrice}
            onChange={e => setMaxPrice(e.target.value)}
            className="border rounded px-2 py-1 w-20 text-sm"
            placeholder=""
          />
        </div>
        <div className="flex gap-2 items-center">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={e => setInStockOnly(e.target.checked)}
            id="inStockOnly"
          />
          <label htmlFor="inStockOnly" className="text-sm font-medium">In Stock Only</label>
        </div>
      </div>

      {categoryProducts.length === 0 ? (
        <div>No products found in this category.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categoryProducts.map((product) => (
            <ProductCard
              key={product._id}
              productId={product._id}
              name={product.name}
              description={product.description}
              price={product.price}
              imageUrl={product.imageUrl}
              category={product.category}
              rating={product.rating}
              reviewCount={product.reviewCount}
              stock={product.stock}
            />
          ))}
        </div>
      )}
    </main>
  );
} 