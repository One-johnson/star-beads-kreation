"use client";
import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const cart = useQuery(
    api.authMutations.getCart,
    user ? { userId: user.userId } : "skip"
  );
  const updateCartItem = useMutation(api.authMutations.updateCartItem);
  const removeCartItem = useMutation(api.authMutations.removeCartItem);
  const clearCart = useMutation(api.authMutations.clearCart);

  if (!user) {
    return <div className="text-center text-muted-foreground">You must be logged in to view your cart.</div>;
  }

  const handleQuantityChange = async (productId: any, quantity: number) => {
    if (quantity < 1) return;
    await updateCartItem({ userId: user.userId, productId, quantity });
  };

  const handleRemove = async (productId: any) => {
    await removeCartItem({ userId: user.userId, productId });
  };

  const handleClear = async () => {
    await clearCart({ userId: user.userId });
  };

  const handleCheckout = () => {
    router.push("/checkout");
  };

  const total = cart?.items?.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0) || 0;

  return (
    <main className="max-w-3xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
      <div className="bg-white dark:bg-muted rounded-lg shadow p-6">
        {cart === undefined || cart === null ? (
          <div>Loading cart...</div>
        ) : !cart.items || cart.items.length === 0 ? (
          <div className="text-muted-foreground text-center">Your cart is empty.</div>
        ) : (
          <>
            <div className="flex flex-col gap-6 mb-6">
              {cart.items?.map((item: any) => (
                <div key={item.productId} className="flex items-center gap-4 border-b pb-4 last:border-b-0 last:pb-0">
                  <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded" />
                  <div className="flex-1">
                    <div className="font-medium text-lg">{item.name}</div>
                    <div className="text-xs text-muted-foreground">${item.price.toFixed(2)} each</div>
                  </div>
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={e => handleQuantityChange(item.productId, Number(e.target.value))}
                    className="w-16 border rounded px-2 py-1 text-center"
                  />
                  <Button variant="ghost" size="sm" onClick={() => handleRemove(item.productId)}>
                    Remove
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center mb-4">
              <div className="font-bold text-xl">Total: ${total.toFixed(2)}</div>
              <Button variant="outline" onClick={handleClear} size="sm">Clear Cart</Button>
            </div>
            <Button 
              className="w-full" 
              disabled={!cart.items || cart.items.length === 0} 
              onClick={handleCheckout}
            >
              Proceed to Checkout
            </Button>
          </>
        )}
      </div>
    </main>
  );
}
