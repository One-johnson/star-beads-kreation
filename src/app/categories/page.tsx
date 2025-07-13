"use client";

import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CategoryGridSkeleton } from "@/components/CategorySkeleton";
import Link from "next/link";
import { ArrowRight, Star, Search } from "lucide-react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { adinkraMap } from "@/components/AdinkraIcons";

// Map category names to Adinkra symbols
const categoryAdinkra: Record<string, keyof typeof adinkraMap> = {
  "Krobo Beads": "gye-nyame",
  "Kente-Inspired": "sankofa",
  "Festival Beads": "akoma",
  "Traditional": "fawohodie",
  "Modern": "duafe",
};

// Example cultural notes and tags (in real app, add to category data)
const categoryMeta: Record<string, { tag?: string; culturalNote?: string }> = {
  "Krobo Beads": {
    tag: "Traditional",
    culturalNote: "Used in Dipo rites of passage and celebrations in Krobo culture."
  },
  "Kente-Inspired": {
    tag: "New",
    culturalNote: "Inspired by the vibrant patterns of Ghana's iconic Kente cloth."
  },
  "Festival Beads": {
    tag: "Popular",
    culturalNote: "Worn during Homowo, Aboakyer, and other Ghanaian festivals."
  },
  "Modern": {
    tag: "Fusion",
    culturalNote: "Blending Ghanaian tradition with contemporary style."
  },
};

export default function CategoriesPage() {
  const categories = useQuery(api.categories.getCategories);
  const allProducts = useQuery(api.products.listProducts);

  // Search and sort state
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("alphabetical");

  // Count products per category
  const getProductCount = (categoryName: string) => {
    if (!allProducts) return 0;
    return allProducts.filter(product => product.category === categoryName).length;
  };

  // Get up to 3 products for a category
  const getCategoryProducts = (categoryName: string) => {
    if (!allProducts) return [];
    return allProducts.filter(product => product.category === categoryName).slice(0, 3);
  };

  // Filter and sort categories (UI only)
  let filteredCategories = categories || [];
  if (search) {
    filteredCategories = filteredCategories.filter(cat =>
      cat.name.toLowerCase().includes(search.toLowerCase())
    );
  }
  if (sort === "alphabetical") {
    filteredCategories = filteredCategories.slice().sort((a, b) => a.name.localeCompare(b.name));
  } else if (sort === "mostProducts") {
    filteredCategories = filteredCategories.slice().sort((a, b) => getProductCount(b.name) - getProductCount(a.name));
  }

  // Featured category (first in list)
  const featuredCategory = filteredCategories.length > 0 ? filteredCategories[0] : null;
  const restCategories = filteredCategories.length > 1 ? filteredCategories.slice(1) : [];

  if (categories === undefined) {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Product Categories</h1>
          <p className="text-muted-foreground">
            Explore our collection by category
          </p>
        </div>
        <CategoryGridSkeleton count={6} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      {/* Hero Banner */}
      <div className="mb-8 relative rounded-lg overflow-hidden shadow-lg">
        <Image
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&h=300&fit=crop"
          alt="Ghanaian beadwork banner"
          width={1200}
          height={300}
          className="w-full h-48 object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/60 via-red-500/40 to-green-600/60 flex flex-col items-center justify-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow mb-2">Akwaaba! (Welcome)</h1>
          <p className="text-white text-lg drop-shadow max-w-2xl text-center">
            Discover the vibrant world of Ghanaian beads and jewelry. Browse by category to find your perfect piece, from traditional festival beads to modern accessories.
          </p>
        </div>
      </div>

      {/* Search & Sort Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-between">
        <div className="flex items-center gap-2 w-full md:w-1/2">
          <Search className="w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <Button
            variant={sort === "alphabetical" ? "default" : "outline"}
            size="sm"
            onClick={() => setSort("alphabetical")}
          >
            A-Z
          </Button>
          <Button
            variant={sort === "mostProducts" ? "default" : "outline"}
            size="sm"
            onClick={() => setSort("mostProducts")}
          >
            Most Products
          </Button>
        </div>
      </div>

      {/* Featured Category */}
      {featuredCategory && (
        <Card className="mb-8 border-2 border-yellow-500 bg-yellow-50/50 relative overflow-hidden">
          {/* Adinkra icon */}
          {categoryAdinkra[featuredCategory.name] && (
            <div className="absolute top-2 left-2 opacity-30">
              {React.createElement(adinkraMap[categoryAdinkra[featuredCategory.name]], { className: "w-16 h-16" })}
            </div>
          )}
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="text-2xl text-yellow-900">{featuredCategory.name}</CardTitle>
                {/* Tag badge */}
                {categoryMeta[featuredCategory.name]?.tag && (
                  <Badge variant="destructive" className="uppercase tracking-wide text-xs">
                    {categoryMeta[featuredCategory.name].tag}
                  </Badge>
                )}
              </div>
              <Badge variant="secondary" className="bg-yellow-200 text-yellow-900">
                {getProductCount(featuredCategory.name)} items
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {featuredCategory.imageUrl && (
              <div className="mb-4">
                <Image
                  src={featuredCategory.imageUrl}
                  alt={featuredCategory.name}
                  width={400}
                  height={192}
                  className="w-full h-48 object-cover rounded border-2 border-yellow-200"
                />
              </div>
            )}
            <p className="text-muted-foreground mb-2 line-clamp-2">
              {featuredCategory.description}
            </p>
            {/* Cultural note */}
            {categoryMeta[featuredCategory.name]?.culturalNote && (
              <p className="text-xs text-yellow-900 mb-2 italic">
                {categoryMeta[featuredCategory.name].culturalNote}
              </p>
            )}
            {/* Featured products row */}
            <div className="flex gap-2 mb-4">
              {getCategoryProducts(featuredCategory.name).map(product => (
                <Image
                  key={product._id}
                  src={product.imageUrl}
                  alt={product.name}
                  width={64}
                  height={64}
                  className="w-16 h-16 object-cover rounded border"
                />
              ))}
            </div>
            <Link
              href={`/products?category=${encodeURIComponent(featuredCategory.name)}`}
              className="inline-flex items-center text-yellow-900 hover:text-yellow-700 font-medium group-hover:translate-x-1 transition-transform"
            >
              Browse {featuredCategory.name}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Category Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {restCategories.map((category) => (
          <Card key={category._id} className="group hover:shadow-lg transition-shadow relative overflow-hidden">
            {/* Adinkra icon */}
            {categoryAdinkra[category.name] && (
              <div className="absolute top-2 left-2 opacity-20">
                {React.createElement(adinkraMap[categoryAdinkra[category.name]], { className: "w-12 h-12" })}
              </div>
            )}
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-xl">{category.name}</CardTitle>
                  {/* Tag badge */}
                  {categoryMeta[category.name]?.tag && (
                    <Badge variant="destructive" className="uppercase tracking-wide text-xs">
                      {categoryMeta[category.name].tag}
                    </Badge>
                  )}
                </div>
                <Badge variant="secondary">
                  {getProductCount(category.name)} items
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {category.imageUrl && (
                <div className="mb-4">
                  <Image
                    src={category.imageUrl}
                    alt={category.name}
                    width={400}
                    height={192}
                    className="w-full h-48 object-cover rounded"
                  />
                </div>
              )}
              <p className="text-muted-foreground mb-2 line-clamp-2">
                {category.description}
              </p>
              {/* Cultural note */}
              {categoryMeta[category.name]?.culturalNote && (
                <p className="text-xs text-green-900 mb-2 italic">
                  {categoryMeta[category.name].culturalNote}
                </p>
              )}
              {/* Featured products row */}
              <div className="flex gap-2 mb-4">
                {getCategoryProducts(category.name).map(product => (
                  <Image
                    key={product._id}
                    src={product.imageUrl}
                    alt={product.name}
                    width={48}
                    height={48}
                    className="w-12 h-12 object-cover rounded border"
                  />
                ))}
              </div>
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

      {/* Empty State */}
      {filteredCategories.length === 0 && (
        <Card className="text-center py-12 mt-8">
          <CardContent>
            <p className="text-muted-foreground">No categories found.</p>
          </CardContent>
        </Card>
      )}

      {/* Footer CTA */}
      <div className="mt-16 text-center">
        <div className="inline-flex items-center gap-2 mb-2">
          <Star className="w-5 h-5 text-green-600" />
          <span className="font-semibold text-green-700">Can’t find what you’re looking for?</span>
        </div>
        <p className="text-muted-foreground mb-4">
          Contact us for custom Ghanaian beadwork or special requests.
        </p>
        <Link href="/contact">
          <Button variant="default" className="bg-green-600 hover:bg-green-700 text-white">
            Contact Us
          </Button>
        </Link>
      </div>
    </div>
  );
} 