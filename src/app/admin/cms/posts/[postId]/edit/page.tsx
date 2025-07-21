"use client";
import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import { useAction } from "convex/react";

import { Id } from "@/../convex/_generated/dataModel";

export default function EditBlogPostPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const postId = params.postId as string;
  const post = useQuery(api.cms.getBlogPostById, { postId: postId as Id<"blogPosts"> });
  const updateBlogPost = useMutation(api.cms.updateBlogPost);
  const generateBlogUploadUrl = useMutation(api.cms.generateBlogUploadUrl);
  const getBlogStorageUrl = useMutation(api.cms.getBlogStorageUrl);
  const adminStoreBlogImageFromUrl = useAction(api.cms.adminStoreBlogImageFromUrl);
  const deleteBlogImage = useMutation(api.cms.deleteBlogImage);

  const [formData, setFormData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [storingFromUrl, setStoringFromUrl] = useState(false);
  const [deletingImage, setDeletingImage] = useState(false);
  const [imageWarning, setImageWarning] = useState("");
  const [storageId, setStorageId] = useState<string>("");

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title,
        slug: post.slug,
        content: post.content,
        excerpt: post.excerpt || "",
        featuredImage: post.featuredImage || "",
        status: post.status,
        publishedAt: post.publishedAt ? new Date(post.publishedAt).toISOString().slice(0, 10) : "",
        scheduledAt: post.scheduledAt ? new Date(post.scheduledAt).toISOString().slice(0, 10) : "",
        tags: post.tags || [],
        seoTitle: post.seoTitle || "",
        seoDescription: post.seoDescription || "",
        seoKeywords: post.seoKeywords || [],
        type: post.type || "blog",
        videoUrl: post.videoUrl || "",
      });
      setStorageId("");
    }
  }, [post]);

  if (!user || user.role !== "admin") {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <div className="text-center text-muted-foreground">
          Access denied. Admin privileges required.
        </div>
      </div>
    );
  }

  if (post === undefined || formData === null) {
    return <div className="max-w-4xl mx-auto p-8">Loading...</div>;
  }
  if (!post) {
    return <div className="max-w-4xl mx-auto p-8 text-muted-foreground">Blog post not found.</div>;
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateBlogPost({
        postId: postId as Id<"blogPosts">,
        title: formData.title,
        slug: formData.slug,
        content: formData.content,
        excerpt: formData.excerpt,
        featuredImage: formData.featuredImage,
        status: formData.status,
        publishedAt: formData.status === "published" ? Date.now() : undefined,
        scheduledAt: formData.status === "scheduled" && formData.scheduledAt ? new Date(formData.scheduledAt).getTime() : undefined,
        tags: Array.isArray(formData.tags) ? formData.tags : (typeof formData.tags === "string" ? formData.tags.split(",").map((t: string) => t.trim()) : []),
        seoTitle: formData.seoTitle,
        seoDescription: formData.seoDescription,
        seoKeywords: Array.isArray(formData.seoKeywords) ? formData.seoKeywords : (typeof formData.seoKeywords === "string" ? formData.seoKeywords.split(",").map((k: string) => k.trim()) : []),
        type: formData.type,
        videoUrl: formData.type === "video" ? formData.videoUrl : undefined,
      });
      toast.success("Blog post updated!");
      router.push("/admin/cms/posts");
    } catch (error) {
      toast.error("Failed to update blog post");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const postUrl = await generateBlogUploadUrl();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();
      const imageUrl = await getBlogStorageUrl({ storageId });
      if (imageUrl) {
        setFormData((prev: any) => ({ ...prev, featuredImage: imageUrl as string }));
        setStorageId(storageId);
        checkImageSize(imageUrl as string);
        toast.success("Image uploaded successfully!");
      } else {
        toast.error("Failed to get image URL");
      }
    } catch (err) {
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleStoreFromUrl = async () => {
    if (!formData.featuredImage || !user) return;
    setStoringFromUrl(true);
    try {
      const storageId = await adminStoreBlogImageFromUrl({ imageUrl: formData.featuredImage, adminId: user.userId });
      const imageUrl = await getBlogStorageUrl({ storageId });
      if (imageUrl) {
        setFormData((prev: any) => ({ ...prev, featuredImage: imageUrl as string }));
        setStorageId(storageId);
        checkImageSize(imageUrl as string);
        toast.success("Image stored from URL successfully!");
      } else {
        toast.error("Failed to get image URL");
      }
    } catch (err) {
      toast.error("Failed to store image from URL");
    } finally {
      setStoringFromUrl(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!storageId || !user) return;
    setDeletingImage(true);
    try {
      await deleteBlogImage({ storageId });
      setFormData((prev: any) => ({ ...prev, featuredImage: "" }));
      setStorageId("");
      setImageWarning("");
      toast.success("Image deleted successfully!");
    } catch (err) {
      toast.error("Failed to delete image");
    } finally {
      setDeletingImage(false);
    }
  };

  const checkImageSize = (url: string) => {
    if (!url) {
      setImageWarning("");
      return;
    }
    const img = new window.Image();
    img.onload = function () {
      if (img.naturalWidth < 300 || img.naturalHeight < 300) {
        setImageWarning(
          `Warning: Image is small (${img.naturalWidth}x${img.naturalHeight}). For best results, use images at least 300x300px.`
        );
      } else {
        setImageWarning("");
      }
    };
    img.onerror = function () {
      setImageWarning("Could not load image to check size.");
    };
    img.src = url;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/cms/posts">
            Back to Posts
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Edit Blog Post</h1>
      </div>
      <form onSubmit={handleSave} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Edit Post</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={e => handleInputChange("title", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={e => handleInputChange("slug", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={e => handleInputChange("excerpt", e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={e => handleInputChange("content", e.target.value)}
                placeholder="Write your blog post content..."
                rows={12}
                className="min-h-[300px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="featuredImage">Featured Image URL</Label>
              <div className="flex gap-2">
                <Input
                  id="featuredImage"
                  value={formData.featuredImage}
                  onChange={e => handleInputChange("featuredImage", e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
                {user?.role === "admin" && formData.featuredImage && /^https?:\/\//.test(formData.featuredImage) && (
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={handleStoreFromUrl}
                    disabled={storingFromUrl}
                  >
                    {storingFromUrl ? "Storing..." : "Store from URL"}
                  </Button>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="imageUpload">Or Upload Image</Label>
              <Input
                id="imageUpload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploading}
              />
              {uploading && <div className="text-xs text-muted-foreground">Uploading...</div>}
            </div>
            {formData.featuredImage && (
              <div className="space-y-2">
                <Label>Image Preview</Label>
                <div className="border rounded-lg p-4 relative">
                  <Image
                    src={formData.featuredImage}
                    alt="Blog preview"
                    width={400}
                    height={192}
                    className="w-full h-48 object-cover rounded-md"
                    unoptimized={true}
                  />
                  {user?.role === "admin" && storageId && (
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      className="absolute top-2 right-2"
                      onClick={handleDeleteImage}
                      disabled={deletingImage}
                    >
                      {deletingImage ? "Deleting..." : "Delete Image"}
                    </Button>
                  )}
                </div>
                {imageWarning && (
                  <div className="text-sm text-yellow-600 mt-2">{imageWarning}</div>
                )}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select value={formData.type} onValueChange={value => handleInputChange("type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blog">Blog</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="tutorial">Tutorial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.type === "video" && (
              <div className="space-y-2">
                <Label htmlFor="videoUrl">Video URL</Label>
                <Input
                  id="videoUrl"
                  value={formData.videoUrl}
                  onChange={e => handleInputChange("videoUrl", e.target.value)}
                  placeholder="https://youtube.com/..."
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select value={formData.status} onValueChange={value => handleInputChange("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.status === "scheduled" && (
              <div className="space-y-2">
                <Label htmlFor="scheduledAt">Scheduled Date</Label>
                <Input
                  id="scheduledAt"
                  type="date"
                  value={formData.scheduledAt}
                  onChange={e => handleInputChange("scheduledAt", e.target.value)}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                value={formData.tags.join(", ")}
                onChange={e => setFormData((prev: any) => ({ ...prev, tags: e.target.value.split(",").map((t: string) => t.trim()) }))}
                placeholder="tag1, tag2, ..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seoTitle">SEO Title</Label>
              <Input
                id="seoTitle"
                value={formData.seoTitle}
                onChange={e => handleInputChange("seoTitle", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seoDescription">SEO Description</Label>
              <Textarea
                id="seoDescription"
                value={formData.seoDescription}
                onChange={e => handleInputChange("seoDescription", e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seoKeywords">SEO Keywords</Label>
              <Input
                id="seoKeywords"
                value={formData.seoKeywords.join(", ")}
                onChange={e => setFormData((prev: any) => ({ ...prev, seoKeywords: e.target.value.split(",").map((k: string) => k.trim()) }))}
                placeholder="keyword1, keyword2, ..."
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
} 