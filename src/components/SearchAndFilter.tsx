"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, X } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";

interface SearchAndFilterProps {
  onSearch: (filters: SearchFilters) => void;
  className?: string;
}

export interface SearchFilters {
  query: string;
  category: string;
  minPrice: number;
  maxPrice: number;
  sortBy: "price" | "name" | "rating" | "createdAt";
  sortOrder: "asc" | "desc";
}

export function SearchAndFilter({ onSearch, className }: SearchAndFilterProps) {
  const categories = useQuery(api.categories.getCategories);
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    category: "all",
    minPrice: 0,
    maxPrice: 1000,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  useEffect(() => {
    onSearch(filters);
  }, [filters, onSearch]);

  const handleReset = () => {
    setFilters({
      query: "",
      category: "all",
      minPrice: 0,
      maxPrice: 1000,
      sortBy: "createdAt",
      sortOrder: "desc",
    });
  };

  const hasActiveFilters = filters.query || (filters.category && filters.category !== "all") || filters.minPrice > 0 || filters.maxPrice < 1000;

  return (
    <Card className={`w-full ${className || ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search & Filter
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <Filter className="w-4 h-4 mr-2" />
            {isExpanded ? "Hide" : "Show"} Filters
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search products..."
            value={filters.query}
            onChange={(e) => setFilters({ ...filters, query: e.target.value })}
            className="pl-10"
          />
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2">
            {filters.query && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Search: {filters.query}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => setFilters({ ...filters, query: "" })}
                />
              </Badge>
            )}
            {filters.category && filters.category !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Category: {filters.category}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => setFilters({ ...filters, category: "all" })}
                />
              </Badge>
            )}
            {(filters.minPrice > 0 || filters.maxPrice < 1000) && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Price: ${filters.minPrice} - ${filters.maxPrice}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => setFilters({ ...filters, minPrice: 0, maxPrice: 1000 })}
                />
              </Badge>
            )}
            <Button variant="outline" size="sm" onClick={handleReset}>
              Clear All
            </Button>
          </div>
        )}

        {/* Expanded Filters */}
        {isExpanded && (
          <div className="space-y-4 pt-4 border-t">
            {/* Category Filter */}
            <div className="relative">
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select
                value={filters.category}
                onValueChange={(value) => setFilters({ ...filters, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent position="popper" side="bottom" align="start" className="w-full">
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories?.map((category) => (
                    <SelectItem key={category._id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price Range */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Price Range: ${filters.minPrice} - ${filters.maxPrice}
              </label>
                          <Slider
              value={[filters.minPrice, filters.maxPrice]}
              onValueChange={(values: number[]) => setFilters({ ...filters, minPrice: values[0], maxPrice: values[1] })}
              max={1000}
              step={10}
              className="w-full"
            />
            </div>

            {/* Sort Options */}
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <label className="text-sm font-medium mb-2 block">Sort By</label>
                <Select
                  value={filters.sortBy}
                  onValueChange={(value: string) => setFilters({ ...filters, sortBy: value as "price" | "name" | "rating" | "createdAt" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper" side="bottom" align="start" className="w-full">
                    <SelectItem value="createdAt">Date Added</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="price">Price</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="relative">
                <label className="text-sm font-medium mb-2 block">Order</label>
                <Select
                  value={filters.sortOrder}
                    onValueChange={(value: string) => setFilters({ ...filters, sortOrder: value as "asc" | "desc" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper" side="bottom" align="start" className="w-full">
                    <SelectItem value="desc">Descending</SelectItem>
                    <SelectItem value="asc">Ascending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 