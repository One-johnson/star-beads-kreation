import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const seedCategories = mutation({
  args: {},
  handler: async (ctx) => {
    const categories = [
      {
        name: "Necklaces",
        description: "Elegant and colorful beaded necklaces for every occasion.",
        imageUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
      },
      {
        name: "Bracelets",
        description: "Handcrafted bracelets featuring traditional and modern designs.",
        imageUrl: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=400&q=80",
      },
      {
        name: "Earrings",
        description: "Unique beaded earrings to complement any style.",
        imageUrl: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80",
      },
      {
        name: "Anklets",
        description: "Vibrant anklets perfect for summer and festivals.",
        imageUrl: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80",
      },
      {
        name: "Rings",
        description: "Statement rings crafted with colorful beads and wire.",
        imageUrl: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80",
      },
      {
        name: "Hair Accessories",
        description: "Beaded hairpins, combs, and bands for a unique look.",
        imageUrl: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
      },
      {
        name: "Keychains",
        description: "Fun and functional beaded keychains for everyday use.",
        imageUrl: "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=400&q=80",
      },
      {
        name: "Wall Art",
        description: "Decorative beadwork for your home or office.",
        imageUrl: "https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=400&q=80",
      },
    ];
    for (const cat of categories) {
      await ctx.db.insert("categories", {
        ...cat,
        createdAt: Date.now(),
      });
    }
    return { success: true };
  },
});

export default mutation(async ({ db }) => {
  // Bead image URLs (all beads, no clothes)
  const beadImages = [
    "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80", // Colorful bead bracelets
    "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80", // Bead necklaces
    "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80", // Assorted beads
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80", // Beadwork closeup
    "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80", // Bead necklaces
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80", // Pastel beads
    "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=400&q=80", // Bead jewelry
    "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=400&q=80", // Crystal beads
    "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=400&q=80", // Layered beads
    "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=400&q=80", // Leather wrap beads
  ];

  // Create categories first
  const categories = [
    {
      name: "Bracelets",
      description: "Beautiful beaded bracelets for every occasion",
      imageUrl: beadImages[0],
      createdAt: Date.now(),
    },
    {
      name: "Necklaces",
      description: "Elegant necklaces and pendants",
      imageUrl: beadImages[1],
      createdAt: Date.now(),
    },
    {
      name: "Earrings",
      description: "Stylish earrings and studs",
      imageUrl: beadImages[5],
      createdAt: Date.now(),
    },
    {
      name: "Anklets",
      description: "Bohemian anklets and foot jewelry",
      imageUrl: beadImages[3],
      createdAt: Date.now(),
    },
  ];

  for (const category of categories) {
    await db.insert("categories", category);
  }

  const sampleProducts = [
    {
      name: "Rainbow Bead Bracelet",
      description: "A vibrant bracelet made with colorful glass beads.",
      price: 12.99,
      imageUrl: beadImages[0],
      category: "Bracelets",
      tags: ["colorful", "glass beads", "vibrant", "summer"],
      stock: 25,
      createdAt: Date.now(),
    },
    {
      name: "Classic Pearl Necklace",
      description: "Elegant necklace featuring high-quality faux pearls.",
      price: 24.99,
      imageUrl: beadImages[1],
      category: "Necklaces",
      tags: ["pearls", "elegant", "classic", "formal"],
      stock: 15,
      createdAt: Date.now(),
    },
    {
      name: "Boho Anklet",
      description: "A bohemian-style anklet with wooden and turquoise beads.",
      price: 9.99,
      imageUrl: beadImages[3],
      category: "Anklets",
      tags: ["bohemian", "wooden", "turquoise", "casual"],
      stock: 30,
      createdAt: Date.now(),
    },
    {
      name: "Minimalist Bead Earrings",
      description: "Simple and stylish earrings with a single accent bead.",
      price: 7.99,
      imageUrl: beadImages[5],
      category: "Earrings",
      tags: ["minimalist", "simple", "stylish", "everyday"],
      stock: 40,
      createdAt: Date.now(),
    },
    {
      name: "Custom Name Bracelet",
      description: "Personalized bracelet with letter beads for any name.",
      price: 15.99,
      imageUrl: beadImages[2],
      category: "Bracelets",
      tags: ["personalized", "custom", "name", "gift"],
      stock: 5,
      createdAt: Date.now(),
    },
    {
      name: "Crystal Drop Earrings",
      description: "Elegant crystal drop earrings perfect for special occasions.",
      price: 18.99,
      imageUrl: beadImages[7],
      category: "Earrings",
      tags: ["crystal", "elegant", "formal", "special occasion"],
      stock: 12,
      createdAt: Date.now(),
    },
    {
      name: "Layered Bead Necklace",
      description: "Trendy layered necklace with multiple strands of beads.",
      price: 22.99,
      imageUrl: beadImages[8],
      category: "Necklaces",
      tags: ["layered", "trendy", "multiple strands", "fashion"],
      stock: 8,
      createdAt: Date.now(),
    },
    {
      name: "Leather Wrap Bracelet",
      description: "Stylish leather bracelet with bead accents.",
      price: 11.99,
      imageUrl: beadImages[9],
      category: "Bracelets",
      tags: ["leather", "wrap", "stylish", "casual"],
      stock: 20,
      createdAt: Date.now(),
    },
    {
      name: "Pastel Festival Set",
      description: "Pastel beads perfect for festivals and celebrations.",
      price: 16.99,
      imageUrl: beadImages[5],
      category: "Bracelets",
      tags: ["pastel", "festival", "colorful"],
      stock: 10,
      createdAt: Date.now(),
    },
    {
      name: "Assorted Bead Mix",
      description: "A mix of assorted beads for creative jewelry making.",
      price: 8.99,
      imageUrl: beadImages[2],
      category: "Anklets",
      tags: ["assorted", "mix", "creative"],
      stock: 18,
      createdAt: Date.now(),
    },
  ];

  for (const product of sampleProducts) {
    await db.insert("products", product);
  }

  return "Seeded products and categories!";
}); 