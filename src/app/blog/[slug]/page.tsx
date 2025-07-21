"use client";
import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Video, FileText, BookOpen } from "lucide-react";

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const post = useQuery(api.cms.getBlogPostBySlug, { slug: slug });

  if (post === undefined) {
    return <div className="max-w-3xl mx-auto p-8">Loading...</div>;
  }
  if (!post) {
    return <div className="max-w-3xl mx-auto p-8 text-muted-foreground">Blog post not found.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-8">
      <Link href="/blog" className="text-sm text-muted-foreground hover:underline">&larr; Back to Blog</Link>
      <div className="flex items-center gap-2 mt-4 mb-2">
        {post.type === "video" && <Video className="w-5 h-5 text-blue-600" aria-label="Video" />}
        {post.type === "tutorial" && <BookOpen className="w-5 h-5 text-green-600" aria-label="Tutorial" />}
        {post.type === "blog" && <FileText className="w-5 h-5 text-muted-foreground" aria-label="Blog" />}
        {post.type && <span className="text-xs font-semibold uppercase tracking-wider">{post.type}</span>}
      </div>
      <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
      <div className="text-xs text-muted-foreground mb-4">
        {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : "Draft"} &middot; {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
      </div>
      {post.featuredImage && (
        <img src={post.featuredImage} alt={post.title} className="w-full h-64 object-cover rounded mb-6" />
      )}
      {post.type === "video" && post.videoUrl && (
        <div className="mb-6">
          <div className="aspect-w-16 aspect-h-9 w-full rounded overflow-hidden">
            <iframe
              src={post.videoUrl.replace("watch?v=", "embed/")}
              title={post.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-64"
            />
          </div>
        </div>
      )}
      <div className="prose prose-neutral dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
    </div>
  );
} 