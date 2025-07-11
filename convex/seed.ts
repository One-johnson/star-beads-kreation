import { mutation } from "./_generated/server";

export default mutation(async ({ db }) => {
  // Create categories first
  const categories = [
    {
      name: "Bracelets",
      description: "Beautiful beaded bracelets for every occasion",
      imageUrl: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80",
      createdAt: Date.now(),
    },
    {
      name: "Necklaces",
      description: "Elegant necklaces and pendants",
      imageUrl: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80",
      createdAt: Date.now(),
    },
    {
      name: "Earrings",
      description: "Stylish earrings and studs",
      imageUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
      createdAt: Date.now(),
    },
    {
      name: "Anklets",
      description: "Bohemian anklets and foot jewelry",
      imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
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
      imageUrl: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80",
      category: "Bracelets",
      tags: ["colorful", "glass beads", "vibrant", "summer"],
      stock: 25,
      createdAt: Date.now(),
    },
    {
      name: "Classic Pearl Necklace",
      description: "Elegant necklace featuring high-quality faux pearls.",
      price: 24.99,
      imageUrl: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80",
      category: "Necklaces",
      tags: ["pearls", "elegant", "classic", "formal"],
      stock: 15,
      createdAt: Date.now(),
    },
    {
      name: "Boho Anklet",
      description: "A bohemian-style anklet with wooden and turquoise beads.",
      price: 9.99,
      imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
      category: "Anklets",
      tags: ["bohemian", "wooden", "turquoise", "casual"],
      stock: 30,
      createdAt: Date.now(),
    },
    {
      name: "Minimalist Bead Earrings",
      description: "Simple and stylish earrings with a single accent bead.",
      price: 7.99,
      imageUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
      category: "Earrings",
      tags: ["minimalist", "simple", "stylish", "everyday"],
      stock: 40,
      createdAt: Date.now(),
    },
    {
      name: "Custom Name Bracelet",
      description: "Personalized bracelet with letter beads for any name.",
      price: 15.99,
      imageUrl: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80",
      category: "Bracelets",
      tags: ["personalized", "custom", "name", "gift"],
      stock: 5,
      createdAt: Date.now(),
    },
    {
      name: "Crystal Drop Earrings",
      description: "Elegant crystal drop earrings perfect for special occasions.",
      price: 18.99,
      imageUrl: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=400&q=80",
      category: "Earrings",
      tags: ["crystal", "elegant", "formal", "special occasion"],
      stock: 12,
      createdAt: Date.now(),
    },
    {
      name: "Layered Bead Necklace",
      description: "Trendy layered necklace with multiple strands of beads.",
      price: 22.99,
      imageUrl: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=400&q=80",
      category: "Necklaces",
      tags: ["layered", "trendy", "multiple strands", "fashion"],
      stock: 8,
      createdAt: Date.now(),
    },
    {
      name: "Leather Wrap Bracelet",
      description: "Stylish leather bracelet with bead accents.",
      price: 11.99,
      imageUrl: "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=400&q=80",
      category: "Bracelets",
      tags: ["leather", "wrap", "stylish", "casual"],
      stock: 20,
      createdAt: Date.now(),
    },
  ];

  for (const product of sampleProducts) {
    await db.insert("products", product);
  }

  return "Seeded products and categories!";
}); 