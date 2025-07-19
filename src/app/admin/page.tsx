"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { useAuth } from "@/contexts/AuthContext";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Eye,
  Star,
  Calendar,

  ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { 

  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function AdminPage() {
  const { user } = useAuth();
  const allUsers = useQuery(api.authQueries.getAllUsers);
  const allProducts = useQuery(api.products.listProducts);
  const allOrders = useQuery(api.authQueries.getAllOrders);

  // Simple admin check - in a real app, you'd have proper role-based access
  if (!user || user.role !== "admin") {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <div className="text-center text-muted-foreground">
          Access denied. Admin privileges required.
        </div>
      </div>
    );
  }

  // Calculate metrics
  const totalRevenue = allOrders?.reduce((sum: number, order: { total: number }) => sum + order.total, 0) || 0;
  const totalOrders = allOrders?.length || 0;
  const totalProducts = allProducts?.length || 0;
  const totalUsers = allUsers?.length || 0;
  
  // Calculate recent metrics (last 7 days)
  const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  const recentOrders = allOrders?.filter((order: { createdAt: number }) => order.createdAt > sevenDaysAgo) || [];
  const recentRevenue = recentOrders.reduce((sum: number, order: { total: number }) => sum + order.total, 0);
  
  // Calculate trends
  const previousWeekOrders = allOrders?.filter((order: { createdAt: number }) => {
    const orderDate = order.createdAt;
    const twoWeeksAgo = Date.now() - (14 * 24 * 60 * 60 * 1000);
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    return orderDate > twoWeeksAgo && orderDate <= oneWeekAgo;
  }) || [];
  const previousWeekRevenue = previousWeekOrders.reduce((sum: number, order: { total: number }) => sum + order.total, 0);
  
  const revenueGrowth = previousWeekRevenue > 0 ? ((recentRevenue - previousWeekRevenue) / previousWeekRevenue) * 100 : 0;
  const orderGrowth = previousWeekOrders.length > 0 ? ((recentOrders.length - previousWeekOrders.length) / previousWeekOrders.length) * 100 : 0;

  // Prepare chart data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  const revenueData = last7Days.map(date => {
    const dayOrders = allOrders?.filter((order: { createdAt: number }) => {
      const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
      return orderDate === date;
    }) || [];
    const dayRevenue = dayOrders.reduce((sum: number, order: { total: number }) => sum + order.total, 0);
    return { date, revenue: dayRevenue };
  });

  const orderData = last7Days.map(date => {
    const dayOrders = allOrders?.filter((order: { createdAt: number }) => {
      const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
      return orderDate === date;
    }) || [];
    return { date, orders: dayOrders.length };
  });

  // Top products by revenue
  const productRevenue = allProducts?.map(product => {
    const productOrders = allOrders?.filter((order: { items: any[] }) => 
      order.items?.some((item: { productId: string }) => item.productId === product._id)
    ) || [];
    const revenue = productOrders.reduce((sum: number, order: { total: number }) => sum + order.total, 0);
    return { ...product, revenue };
  }).sort((a, b) => b.revenue - a.revenue).slice(0, 5) || [];

  // Order status distribution
  const orderStatuses = allOrders?.reduce((acc: any, order: { status: string }) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {}) || {};

  const statusData = Object.entries(orderStatuses).map(([status, count]) => ({
    name: status,
    value: count,
    color: status === 'pending' ? '#f59e0b' : 
           status === 'processing' ? '#3b82f6' : 
           status === 'shipped' ? '#10b981' : '#6b7280'
  }));

  // Recent activity
  const recentActivity = [
    ...(allOrders?.slice(0, 5).map((order: any) => ({
      type: 'order',
      message: `New order #${order._id.slice(-8)} received`,
      time: new Date(order.createdAt).toLocaleString(),
      amount: order.total
    })) || []),
    ...(allUsers?.slice(0, 3).map((user: any) => ({
      type: 'user',
      message: `New user registered: ${user.name}`,
      time: new Date(user._creationTime).toLocaleString(),
      amount: null
    })) || [])
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 8);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Store
            </Link>
          </Button>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
            <Link href="/admin/products">Manage Products</Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
            <Link href="/admin/orders">Manage Orders</Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
            <Link href="/admin/customers">Manage Customers</Link>
          </Button>
          <Button asChild size="sm" className="w-full sm:w-auto">
            <Link href="/admin/cms">Content Management</Link>
          </Button>
        </div>
      </div>
      <div className="mt-4 mb-2">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user.name}! Here's your store overview.
        </p>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {revenueGrowth >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
              )}
              {Math.abs(revenueGrowth).toFixed(1)}% from last week
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {orderGrowth >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
              )}
              {Math.abs(orderGrowth).toFixed(1)}% from last week
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Eye className="h-3 w-3 text-blue-600 mr-1" />
              {allProducts?.filter((p: any) => (p.stock || 0) <= 5).length || 0} low stock
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Calendar className="h-3 w-3 text-purple-600 mr-1" />
              {allUsers?.filter((u: any) => u._creationTime > sevenDaysAgo).length || 0} new this week
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenue Analytics</TabsTrigger>
          <TabsTrigger value="orders">Order Trends</TabsTrigger>
          <TabsTrigger value="products">Top Products</TabsTrigger>
          <TabsTrigger value="status">Order Status</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend (Last 7 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                  <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Order Volume (Last 7 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={orderData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="orders" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Products by Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {productRevenue.map((product: any, index: number) => (
                  <div key={product._id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground">{product.category}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">${product.revenue.toFixed(2)}</div>
                      <div className="text-sm text-muted-foreground">
                        {product.stock || 0} in stock
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Order Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${percent !== undefined ? (percent * 100).toFixed(0) : '0'}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.type === 'order' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {activity.type === 'order' ? <ShoppingCart className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="font-medium">{activity.message}</div>
                      <div className="text-sm text-muted-foreground">{activity.time}</div>
                    </div>
                  </div>
                  {activity.amount && (
                    <div className="text-right">
                      <div className="font-medium">${activity.amount.toFixed(2)}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button asChild className="w-full justify-start">
                <Link href="/admin/products/new">
                  <Package className="w-4 h-4 mr-2" />
                  Add New Product
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/admin/orders">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Manage Orders
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/admin/customers">
                  <Users className="w-4 h-4 mr-2" />
                  Manage Customers
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/admin/categories">
                  <Star className="w-4 h-4 mr-2" />
                  Manage Categories
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 