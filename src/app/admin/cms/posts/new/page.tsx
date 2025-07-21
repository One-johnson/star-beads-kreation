"use client";

import React, { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
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
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Save, 
  X, 
  FileText,
  Calendar,
  Tag,
  Search,
  Eye,
  Clock,
  CheckCircle
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import Image from "next/image";
import { useAction } from "convex/react";



export default function NewBlogPostPage() {
  const { user } = useAuth();
  const router = useRouter();
  const createBlogPost = useMutation(api.cms.createBlogPost);
  const generateSlug = useMutation(api.cms.generateSlug);
  const generateBlogUploadUrl = useMutation(api.cms.generateBlogUploadUrl);
  const getBlogStorageUrl = useMutation(api.cms.getBlogStorageUrl);
  const adminStoreBlogImageFromUrl = useAction(api.cms.adminStoreBlogImageFromUrl);
  const deleteBlogImage = useMutation(api.cms.deleteBlogImage);
  
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    featuredImage: "",
    status: "draft" as "draft" | "published" | "scheduled",
    publishedAt: "",
    scheduledAt: "",
    tags: [] as string[],
    seoTitle: "",
    seoDescription: "",
    seoKeywords: [] as string[],
    type: "blog" as "blog" | "video" | "tutorial",
    videoUrl: "",
  });
  const [newTag, setNewTag] = useState("");
  const [newKeyword, setNewKeyword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingSlug, setIsGeneratingSlug] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [storingFromUrl, setStoringFromUrl] = useState(false);
  const [deletingImage, setDeletingImage] = useState(false);
  const [imageWarning, setImageWarning] = useState("");
  const [storageId, setStorageId] = useState<string>("");

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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerateSlug = async () => {
    if (!formData.title) {
      toast.error("Please enter a title first");
      return;
    }
    
    setIsGeneratingSlug(true);
    try {
      const slug = await generateSlug({ title: formData.title, type: "post" });
      setFormData(prev => ({ ...prev, slug }));
    } catch (error) {
      toast.error("Failed to generate slug");
    } finally {
      setIsGeneratingSlug(false);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleAddKeyword = () => {
    if (newKeyword.trim() && !formData.seoKeywords.includes(newKeyword.trim())) {
      setFormData(prev => ({
        ...prev,
        seoKeywords: [...prev.seoKeywords, newKeyword.trim()]
      }));
      setNewKeyword("");
    }
  };

  const handleRemoveKeyword = (keywordToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      seoKeywords: prev.seoKeywords.filter(keyword => keyword !== keywordToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!formData.slug) {
      toast.error("Please generate or enter a slug");
      return;
    }

    setIsSubmitting(true);

    try {
      await createBlogPost({
        title: formData.title,
        slug: formData.slug,
        content: formData.content,
        excerpt: formData.excerpt || undefined,
        featuredImage: formData.featuredImage || undefined,
        status: formData.status,
        publishedAt: formData.status === "published" ? Date.now() : undefined,
        scheduledAt: formData.status === "scheduled" && formData.scheduledAt ? new Date(formData.scheduledAt).getTime() : undefined,
        tags: formData.tags,
        seoTitle: formData.seoTitle || undefined,
        seoDescription: formData.seoDescription || undefined,
        seoKeywords: formData.seoKeywords,
        authorId: user._id,
      });

      toast.success("Blog post created successfully!");
      router.push("/admin/cms/posts");
    } catch (error) {
      toast.error("Failed to create blog post");
      console.error(error);
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
        setFormData(prev => ({ ...prev, featuredImage: imageUrl as string }));
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
        setFormData(prev => ({ ...prev, featuredImage: imageUrl as string }));
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
      setFormData(prev => ({ ...prev, featuredImage: "" }));
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

  const getStatusConfig = (status: string) => {
    const config = {
      draft: { label: "Draft", icon: Clock, color: "text-yellow-600" },
      published: { label: "Published", icon: CheckCircle, color: "text-green-600" },
      scheduled: { label: "Scheduled", icon: Calendar, color: "text-purple-600" },
    };
    return config[status as keyof typeof config] || config.draft;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/cms/posts">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Posts
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create New Blog Post</h1>
          <p className="text-muted-foreground">
            Write and publish a new blog post
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Enter post title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Slug *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => handleInputChange("slug", e.target.value)}
                      placeholder="post-url-slug"
                      required
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleGenerateSlug}
                      disabled={isGeneratingSlug || !formData.title}
                    >
                      {isGeneratingSlug ? "Generating..." : "Generate"}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => handleInputChange("excerpt", e.target.value)}
                    placeholder="Brief description of the post..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Content *</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => handleInputChange("content", e.target.value)}
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
                      onChange={(e) => handleInputChange("featuredImage", e.target.value)}
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
                  <Select value={formData.type} onValueChange={value => setFormData(prev => ({ ...prev, type: value as any }))}>
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
              </CardContent>
            </Card>

            {/* SEO Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  SEO Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="seoTitle">SEO Title</Label>
                  <Input
                    id="seoTitle"
                    value={formData.seoTitle}
                    onChange={(e) => handleInputChange("seoTitle", e.target.value)}
                    placeholder="SEO optimized title (optional)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seoDescription">SEO Description</Label>
                  <Textarea
                    id="seoDescription"
                    value={formData.seoDescription}
                    onChange={(e) => handleInputChange("seoDescription", e.target.value)}
                    placeholder="Meta description for search engines..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>SEO Keywords</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                      placeholder="Add keyword"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
                    />
                    <Button type="button" variant="outline" onClick={handleAddKeyword}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.seoKeywords.map((keyword, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {keyword}
                        <button
                          type="button"
                          onClick={() => handleRemoveKeyword(keyword)}
                          className="ml-1 hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publishing Options */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Publishing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(value: any) => handleInputChange("status", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {(() => {
                      const config = getStatusConfig(formData.status);
                      const Icon = config.icon;
                      return (
                        <>
                          <Icon className="w-4 h-4" />
                          {config.label}
                        </>
                      );
                    })()}
                  </div>
                </div>

                {formData.status === "scheduled" && (
                  <div className="space-y-2">
                    <Label htmlFor="scheduledAt">Schedule Date</Label>
                    <Input
                      id="scheduledAt"
                      type="datetime-local"
                      value={formData.scheduledAt}
                      onChange={(e) => handleInputChange("scheduledAt", e.target.value)}
                      required
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  Tags
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add tag"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  />
                  <Button type="button" variant="outline" onClick={handleAddTag}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="flex items-center gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  <Save className="w-4 h-4 mr-2" />
                  {isSubmitting ? "Creating..." : "Create Post"}
                </Button>
                <Button type="button" variant="outline" className="w-full" asChild>
                  <Link href="/admin/cms/posts">
                    Cancel
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
} 