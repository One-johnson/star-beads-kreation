"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  FileText, 
  Globe, 
  Image, 
  Plus, 
  Edit, 
  Eye,
  Calendar,
  User,
  TrendingUp,
  Clock,
  CheckCircle
} from "lucide-react";
import Link from "next/link";

export default function CMSDashboardPage() {
  const { user } = useAuth();
  const blogPosts = useQuery(api.cms.getAllBlogPosts, {});
  const pages = useQuery(api.cms.getAllPages, {});
  const media = useQuery(api.cms.getAllMedia, {});

  // Admin check
  if (!user || user.role !== "admin") {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <div className="text-center text-muted-foreground">
          Access denied. Admin privileges required.
        </div>
      </div>
    );
  }

  // Calculate stats
  const totalPosts = blogPosts?.length || 0;
  const publishedPosts = blogPosts?.filter(p => p.status === "published").length || 0;
  const draftPosts = blogPosts?.filter(p => p.status === "draft").length || 0;
  const scheduledPosts = blogPosts?.filter(p => p.status === "scheduled").length || 0;

  const totalPages = pages?.length || 0;
  const publishedPages = pages?.filter(p => p.status === "published").length || 0;
  const draftPages = pages?.filter(p => p.status === "draft").length || 0;

  const totalMedia = media?.length || 0;

  const getStatusBadge = (status: string) => {
    const config = {
      draft: { label: "Draft", variant: "secondary" as const, icon: Clock },
      published: { label: "Published", variant: "default" as const, icon: CheckCircle },
      scheduled: { label: "Scheduled", variant: "outline" as const, icon: Calendar },
    };
    
    const configItem = config[status as keyof typeof config] || config.draft;
    const Icon = configItem.icon;
    
    return (
      <Badge variant={configItem.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {configItem.label}
      </Badge>
    );
  };

  const getPageTypeBadge = (pageType: string) => {
    const config = {
      about: { label: "About", variant: "default" as const },
      faq: { label: "FAQ", variant: "secondary" as const },
      terms: { label: "Terms", variant: "outline" as const },
      privacy: { label: "Privacy", variant: "outline" as const },
      contact: { label: "Contact", variant: "secondary" as const },
      custom: { label: "Custom", variant: "outline" as const },
    };
    
    const configItem = config[pageType as keyof typeof config] || config.custom;
    
    return (
      <Badge variant={configItem.variant}>
        {configItem.label}
      </Badge>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
            <Link href="/admin/cms/posts/new">
              <Plus className="w-4 h-4 mr-2" />
              New Post
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
            <Link href="/admin/cms/pages/new">
              <Plus className="w-4 h-4 mr-2" />
              New Page
            </Link>
          </Button>
        </div>
      </div>
      <div className="mt-4 mb-2">
        <h1 className="text-3xl font-bold">Content Management</h1>
        <p className="text-muted-foreground">
          Manage your blog, pages, and media content
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPosts}</div>
            <p className="text-xs text-muted-foreground">
              {publishedPosts} published, {draftPosts} drafts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pages</CardTitle>
            <Globe className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalPages}</div>
            <p className="text-xs text-muted-foreground">
              {publishedPages} published, {draftPages} drafts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Media Files</CardTitle>
            <Image className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalMedia}</div>
            <p className="text-xs text-muted-foreground">
              Images, documents, and files
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{scheduledPosts}</div>
            <p className="text-xs text-muted-foreground">
              Posts waiting to publish
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Blog Posts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Recent Blog Posts</span>
              <Button asChild variant="outline" size="sm">
                <Link href="/admin/cms/posts">
                  <Eye className="w-4 h-4 mr-2" />
                  View All
                </Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {blogPosts?.slice(0, 5).map((post) => (
                <div key={post._id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium line-clamp-1">{post.title}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <User className="w-3 h-3" />
                      {post.authorName}
                      <span>•</span>
                      {new Date(post.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(post.status)}
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/admin/cms/posts/${post._id}/edit`}>
                        <Edit className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
              {(!blogPosts || blogPosts.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  No blog posts yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Pages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Recent Pages</span>
              <Button asChild variant="outline" size="sm">
                <Link href="/admin/cms/pages">
                  <Eye className="w-4 h-4 mr-2" />
                  View All
                </Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pages?.slice(0, 5).map((page) => (
                <div key={page._id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium line-clamp-1">{page.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(page.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getPageTypeBadge(page.pageType)}
                    {getStatusBadge(page.status)}
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/admin/cms/pages/${page._id}/edit`}>
                        <Edit className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
              {(!pages || pages.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  No pages yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button asChild className="h-20 flex-col gap-2">
              <Link href="/admin/cms/posts/new">
                <FileText className="w-6 h-6" />
                <span>Create Blog Post</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col gap-2">
              <Link href="/admin/cms/pages/new">
                <Globe className="w-6 h-6" />
                <span>Create Page</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col gap-2">
              <Link href="/admin/cms/media">
                <Image className="w-6 h-6" />
                <span>Manage Media</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 