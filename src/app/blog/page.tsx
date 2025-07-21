"use client";
import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, FileText, BookOpen } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function BlogPage() {
  const posts = useQuery(api.cms.getAllBlogPosts, {});
  const [typeFilter, setTypeFilter] = React.useState<string>("all");
  const filteredPosts = (posts || []).filter((post: any) =>
    typeFilter === "all" || post.type === typeFilter
  );

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Blog, Videos & Tutorials</h1>
      <div className="mb-6 flex gap-4 items-center">
        <label className="text-sm font-medium">Filter by Type:</label>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="blog">Blog</SelectItem>
            <SelectItem value="video">Video</SelectItem>
            <SelectItem value="tutorial">Tutorial</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {posts === undefined ? (
        <div>Loading...</div>
      ) : posts.length === 0 ? (
        <div className="text-muted-foreground">No blog posts found.</div>
      ) : (
        <div className="space-y-6">
          {filteredPosts.map((post: any) => (
            <Card key={post._id}>
              <CardHeader>
                <CardTitle>
                  <Link href={`/blog/${post.slug || post._id}`} className="hover:underline">
                    {post.title}
                  </Link>
                </CardTitle>
                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                  {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : "Draft"} &middot; {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                  {post.type === "video" && <Video className="w-4 h-4 text-blue-600" aria-label="Video" />}
                  {post.type === "tutorial" && <BookOpen className="w-4 h-4 text-green-600" aria-label="Tutorial" />}
                  {post.type === "blog" && <FileText className="w-4 h-4 text-muted-foreground" aria-label="Blog" />}
                  {post.type && <span className="ml-1">{post.type.charAt(0).toUpperCase() + post.type.slice(1)}</span>}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-muted-foreground mb-2">
                  {post.excerpt || post.content.slice(0, 120) + (post.content.length > 120 ? "..." : "")}
                </div>
                <Link href={`/blog/${post.slug || post._id}`} className="text-primary hover:underline text-sm font-medium">Read More</Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 