"use client";
import React from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { ProductPreview } from "@/components/ProductPreview";
import Image from "next/image";
import { Star } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const products = useQuery(api.products.listProducts, {});

  // Example customer reviews
  const reviews = [
    {
      name: "Akosua Mensah",
      text: "The Krobo bead bracelet I bought is stunning! I get compliments every time I wear it. Proud to support Ghanaian artisans!",
      rating: 5,
    },
    {
      name: "Kwame Boateng",
      text: "Beautiful craftsmanship and fast delivery. The necklace was even more vibrant in person. Will order again!",
      rating: 5,
    },
    {
      name: "Efua Owusu",
      text: "I love the unique designs and the story behind each piece. The anklet fits perfectly and feels special.",
      rating: 4,
    },
  ];

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 gap-12">
      {/* Hero Section */}
      <motion.section
        className="w-full max-w-6xl mx-auto mb-12"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <div className="relative rounded-lg overflow-hidden shadow-lg flex flex-col md:flex-row items-center bg-gradient-to-r from-yellow-50 via-pink-50 to-blue-50">
          <motion.div
            className="flex-1 p-8 text-center md:text-left"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.7, ease: "easeOut" }}
          >
            <motion.h1
              className="text-4xl md:text-5xl font-bold mb-4 text-primary"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Discover the Art of Beads
            </motion.h1>
            <motion.p
              className="text-lg mb-6 text-muted-foreground max-w-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              Unique, handcrafted Ghanaian bead jewelry and accessories for every occasion. Celebrate color, culture, and creativity with Star Beads Kreation.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <Link href="/products" className="inline-block px-8 py-3 rounded bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition text-lg shadow">
                Shop Now
              </Link>
            </motion.div>
          </motion.div>
          <motion.div
            className="flex-1 min-w-[300px] max-w-md p-4 flex items-center justify-center"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.7, ease: "easeOut" }}
          >
            <Image
              src="/beads/colourful.jpg"
              alt="Colorful bead jewelry"
              width={400}
              height={400}
              className="rounded-lg shadow-lg object-cover w-full h-auto max-h-[350px]"
              priority
            />
          </motion.div>
        </div>
      </motion.section>
      <motion.section
        className="text-center max-w-4xl"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <h1 className="text-4xl font-bold mb-4">Welcome to Star Beads Kreation</h1>
        <p className="text-lg mb-6">
          Discover unique, handcrafted bead products. Shop our latest creations or get inspired in our gallery!
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/products" className="px-6 py-2 rounded bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition">Shop Now</Link>
          <Link href="/gallery" className="px-6 py-2 rounded border border-primary text-primary font-semibold hover:bg-primary hover:text-primary-foreground transition">Gallery</Link>
        </div>
      </motion.section>
      <motion.section
        className="w-full max-w-6xl"
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
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
      </motion.section>
      {/* Customer Reviews Section */}
      <motion.section
        className="w-full max-w-6xl my-12"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.2,
            },
          },
        }}
      >
        <h2 className="text-2xl font-semibold mb-6 text-center">Customer Reviews</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review, idx) => (
            <motion.div
              key={idx}
              className="bg-white dark:bg-muted rounded-lg shadow p-6 flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.2 }}
            >
              <div className="flex gap-1 mb-2">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                ))}
                {[...Array(5 - review.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-gray-300" />
                ))}
              </div>
              <p className="text-muted-foreground mb-4">"{review.text}"</p>
              <div className="font-semibold text-primary">{review.name}</div>
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link href="/about" className="text-primary font-medium hover:underline">Read more reviews</Link>
    </div>
      </motion.section>
    </main>
  );
}
