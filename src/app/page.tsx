"use client";
import React from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { ProductPreview } from "@/components/ProductPreview";

export default function Home() {
  const products = useQuery(api.products.listProducts, {});

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 gap-12">
      <section className="text-center max-w-4xl">
        <h1 className="text-4xl font-bold mb-4">Welcome to Star Beads Kreation</h1>
        <p className="text-lg mb-6">
          Discover unique, handcrafted bead products. Shop our latest creations or get inspired in our gallery!
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/products" className="px-6 py-2 rounded bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition">Shop Now</Link>
          <Link href="/gallery" className="px-6 py-2 rounded border border-primary text-primary font-semibold hover:bg-primary hover:text-primary-foreground transition">Gallery</Link>
        </div>
      </section>
      <section className="w-full max-w-6xl">
        <h2 className="text-2xl font-semibold mb-4">Featured Products</h2>
        {products === undefined ? (
          <div>Loading products...</div>
        ) : products.length === 0 ? (
          <div>No products found.</div>
        ) : (
          <ProductPreview products={products.map(p => ({
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
        )}
      </section>
    </main>
  );
}
