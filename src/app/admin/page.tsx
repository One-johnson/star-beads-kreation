"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Package, ShoppingCart, DollarSign, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function AdminPage() {
  const { user } = useAuth();
  const allUsers = useQuery(api.authQueries.getAllUsers);
  const allProducts = useQuery(api.products.listProducts);
  const allOrders = useQuery(api.authQueries.getAllOrders);

  // Simple admin check - in a real app, you'd have proper role-based access
  if (!user || user.email !== "admin@example.com") {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <div className="text-center text-muted-foreground">
          Access denied. Admin privileges required.
        </div>
      </div>
    );
  }

  const totalRevenue = allOrders?.reduce((sum: number, order: any) => sum + order.total, 0) || 0;
  const totalOrders = allOrders?.length || 0;
  const totalProducts = allProducts?.length || 0;
  const totalUsers = allUsers?.length || 0;

  const recentOrders = allOrders?.slice(0, 5) || [];
  const lowStockProducts = allProducts?.filter(p => (p.stock || 0) <= 5) || [];

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user.name}! Here's an overview of your store.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              From {totalOrders} orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              All time orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              Active products
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Registered users
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.length === 0 ? (
                <p className="text-muted-foreground">No orders yet.</p>
              ) : (
                recentOrders.map((order: any) => (
                  <div key={order._id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="font-medium">Order #{order._id.slice(-8)}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">${order.total.toFixed(2)}</div>
                      <Badge variant="outline">{order.status}</Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Products */}
        <Card>
          <CardHeader>
            <CardTitle>Low Stock Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStockProducts.length === 0 ? (
                <p className="text-muted-foreground">All products are well stocked.</p>
              ) : (
                lowStockProducts.map((product) => (
                  <div key={product._id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {product.category || "Uncategorized"}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">${product.price.toFixed(2)}</div>
                      <Badge variant="destructive">
                        {product.stock || 0} left
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button asChild>
              <Link href="/products">View All Products</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/orders">View All Orders</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/categories">Manage Categories</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 