import { mutation } from "./_generated/server";

// Auto-mapped images for categories
const categoryImageMap: Record<string, string> = {
  "Bracelets": "/beads/colourful.jpg",
  "Necklaces": "/beads/handbag.jpg",
  "Earrings": "/beads/holders.jpg",
  "Anklets": "/beads/keys.jpg",
};

// Auto-mapped images for products
const productImageMap: Record<string, string> = {
  "Rainbow Bead Bracelet": "/beads/colourful.jpg",
  "Classic Pearl Necklace": "/beads/handbag.jpg",
  "Boho Anklet": "/beads/keys.jpg",
  "Minimalist Bead Earrings": "/beads/holders.jpg",
  "Custom Name Bracelet": "/beads/name.jpg",
  "Crystal Drop Earrings": "/beads/holders.jpg",
  "Layered Bead Necklace": "/beads/beadbag.jpg",
  "Leather Wrap Bracelet": "/beads/smallbags.jpg",
  "Pastel Festival Set": "/beads/colourful.jpg",
  "Assorted Bead Mix": "/beads/beadbag.jpg",
};

export default mutation(async ({ db }) => {
  // Update categories
  const categories = await db.query("categories").collect();
  for (const category of categories) {
    const newImage = categoryImageMap[category.name];
    if (newImage) {
      await db.patch(category._id, { imageUrl: newImage });
    }
  }

  // Update products
  const products = await db.query("products").collect();
  for (const product of products) {
    const newImage = productImageMap[product.name];
    if (newImage) {
      await db.patch(product._id, { imageUrl: newImage });
    }
  }

  return "Updated image URLs to use local /public/beads/ images!";
}); 