import { mutation } from "./_generated/server";

export default mutation(async ({ db }) => {
  const orders = await db.query("orders").collect();
  for (const order of orders) {
    await db.delete(order._id);
  }
  return "All orders deleted!";
}); 