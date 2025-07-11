"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { useAuth } from "@/contexts/AuthContext";
import { ProductGrid } from "@/components/ProductGrid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, ShoppingBag } from "lucide-react";
import Link from "next/link";

export default function WishlistPage() {
  const { user } = useAuth();
  const wishlistItems = useQuery(api.wishlist.getUserWishlist, {
    userId: user?.userId || "placeholder" as any,
  });

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="text-center text-muted-foreground">
          You must be logged in to view your wishlist.
        </div>
      </div>
    );
  }

  if (wishlistItems === undefined) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="text-center">Loading wishlist...</div>
      </div>
    );
  }

  const products = wishlistItems
    .filter((item) => item.product)
    .map((item) => ({
      productId: item.product!._id,
      name: item.product!.name,
      description: item.product!.description,
      price: item.product!.price,
      imageUrl: item.product!.imageUrl,
      category: item.product!.category || undefined,
      rating: item.product!.rating || undefined,
      reviewCount: item.product!.reviewCount || undefined,
      stock: item.product!.stock || undefined,
    }));

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Wishlist</h1>
        <p className="text-muted-foreground">
          Your saved products for later purchase
        </p>
      </div>

      {products.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
            <p className="text-muted-foreground mb-6">
              Start adding products to your wishlist to save them for later.
            </p>
            <Link href="/products">
              <ShoppingBag className="w-5 h-5 mr-2 inline" />
              Browse Products
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div>
          <div className="mb-6">
            <p className="text-muted-foreground">
              {products.length} item{products.length !== 1 ? "s" : ""} in your wishlist
            </p>
          </div>
          <ProductGrid products={products} />
        </div>
      )}
    </div>
  );
} 