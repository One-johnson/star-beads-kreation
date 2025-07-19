import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ===== BLOG POSTS =====

// Get all blog posts with author details
export const getAllBlogPosts = query({
  args: {
    status: v.optional(v.union(v.literal("draft"), v.literal("published"), v.literal("scheduled"))),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let posts = await ctx.db.query("blogPosts").collect();
    
    // Filter by status if provided
    if (args.status) {
      posts = posts.filter(post => post.status === args.status);
    }
    
    // Sort by creation date (newest first)
    posts.sort((a, b) => b.createdAt - a.createdAt);
    
    // Limit results if specified
    if (args.limit) {
      posts = posts.slice(0, args.limit);
    }
    
    // Get author details for each post
    const postsWithAuthors = await Promise.all(
      posts.map(async (post) => {
        const author = await ctx.db.get(post.author);
        return {
          ...post,
          authorName: author?.name || "Unknown Author",
        };
      })
    );
    
    return postsWithAuthors;
  },
});

// Get blog post by slug
export const getBlogPostBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const post = await ctx.db.query("blogPosts").filter(q => q.eq(q.field("slug"), args.slug)).first();
    if (!post) return null;
    
    const author = await ctx.db.get(post.author);
    return {
      ...post,
      authorName: author?.name || "Unknown Author",
    };
  },
});

// Get blog post by ID
export const getBlogPostById = query({
  args: { postId: v.id("blogPosts") },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) return null;
    
    const author = await ctx.db.get(post.author);
    return {
      ...post,
      authorName: author?.name || "Unknown Author",
    };
  },
});

// Create blog post
export const createBlogPost = mutation({
  args: {
    title: v.string(),
    slug: v.string(),
    content: v.string(),
    excerpt: v.optional(v.string()),
    featuredImage: v.optional(v.string()),
    status: v.union(v.literal("draft"), v.literal("published"), v.literal("scheduled")),
    publishedAt: v.optional(v.number()),
    scheduledAt: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
    seoTitle: v.optional(v.string()),
    seoDescription: v.optional(v.string()),
    seoKeywords: v.optional(v.array(v.string())),
    authorId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const postId = await ctx.db.insert("blogPosts", {
      title: args.title,
      slug: args.slug,
      content: args.content,
      excerpt: args.excerpt,
      featuredImage: args.featuredImage,
      author: args.authorId,
      status: args.status,
      publishedAt: args.publishedAt,
      scheduledAt: args.scheduledAt,
      tags: args.tags,
      seoTitle: args.seoTitle,
      seoDescription: args.seoDescription,
      seoKeywords: args.seoKeywords,
      createdAt: now,
      updatedAt: now,
    });
    
    return postId;
  },
});

// Update blog post
export const updateBlogPost = mutation({
  args: {
    postId: v.id("blogPosts"),
    title: v.optional(v.string()),
    slug: v.optional(v.string()),
    content: v.optional(v.string()),
    excerpt: v.optional(v.string()),
    featuredImage: v.optional(v.string()),
    status: v.optional(v.union(v.literal("draft"), v.literal("published"), v.literal("scheduled"))),
    publishedAt: v.optional(v.number()),
    scheduledAt: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
    seoTitle: v.optional(v.string()),
    seoDescription: v.optional(v.string()),
    seoKeywords: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { postId, ...updates } = args;
    await ctx.db.patch(postId, {
      ...updates,
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});

// Delete blog post
export const deleteBlogPost = mutation({
  args: { postId: v.id("blogPosts") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.postId);
    return { success: true };
  },
});

// ===== PAGES =====

// Get all pages
export const getAllPages = query({
  args: {
    pageType: v.optional(v.union(
      v.literal("about"),
      v.literal("faq"),
      v.literal("terms"),
      v.literal("privacy"),
      v.literal("contact"),
      v.literal("custom")
    )),
    status: v.optional(v.union(v.literal("draft"), v.literal("published"))),
  },
  handler: async (ctx, args) => {
    let pages = await ctx.db.query("pages").collect();
    
    // Filter by page type if provided
    if (args.pageType) {
      pages = pages.filter(page => page.pageType === args.pageType);
    }
    
    // Filter by status if provided
    if (args.status) {
      pages = pages.filter(page => page.status === args.status);
    }
    
    // Sort by creation date (newest first)
    pages.sort((a, b) => b.createdAt - a.createdAt);
    
    return pages;
  },
});

// Get page by slug
export const getPageBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const page = await ctx.db.query("pages").filter(q => q.eq(q.field("slug"), args.slug)).first();
    return page;
  },
});

// Get page by ID
export const getPageById = query({
  args: { pageId: v.id("pages") },
  handler: async (ctx, args) => {
    const page = await ctx.db.get(args.pageId);
    return page;
  },
});

// Create page
export const createPage = mutation({
  args: {
    title: v.string(),
    slug: v.string(),
    content: v.string(),
    pageType: v.union(
      v.literal("about"),
      v.literal("faq"),
      v.literal("terms"),
      v.literal("privacy"),
      v.literal("contact"),
      v.literal("custom")
    ),
    status: v.union(v.literal("draft"), v.literal("published")),
    seoTitle: v.optional(v.string()),
    seoDescription: v.optional(v.string()),
    seoKeywords: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const pageId = await ctx.db.insert("pages", {
      title: args.title,
      slug: args.slug,
      content: args.content,
      pageType: args.pageType,
      status: args.status,
      seoTitle: args.seoTitle,
      seoDescription: args.seoDescription,
      seoKeywords: args.seoKeywords,
      createdAt: now,
      updatedAt: now,
    });
    
    return pageId;
  },
});

// Update page
export const updatePage = mutation({
  args: {
    pageId: v.id("pages"),
    title: v.optional(v.string()),
    slug: v.optional(v.string()),
    content: v.optional(v.string()),
    pageType: v.optional(v.union(
      v.literal("about"),
      v.literal("faq"),
      v.literal("terms"),
      v.literal("privacy"),
      v.literal("contact"),
      v.literal("custom")
    )),
    status: v.optional(v.union(v.literal("draft"), v.literal("published"))),
    seoTitle: v.optional(v.string()),
    seoDescription: v.optional(v.string()),
    seoKeywords: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { pageId, ...updates } = args;
    await ctx.db.patch(pageId, {
      ...updates,
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});

// Delete page
export const deletePage = mutation({
  args: { pageId: v.id("pages") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.pageId);
    return { success: true };
  },
});

// ===== MEDIA =====

// Get all media files
export const getAllMedia = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let media = await ctx.db.query("media").collect();
    
    // Sort by creation date (newest first)
    media.sort((a, b) => b.createdAt - a.createdAt);
    
    // Limit results if specified
    if (args.limit) {
      media = media.slice(0, args.limit);
    }
    
    // Get uploader details for each file
    const mediaWithUploaders = await Promise.all(
      media.map(async (file) => {
        const uploader = await ctx.db.get(file.uploadedBy);
        return {
          ...file,
          uploaderName: uploader?.name || "Unknown User",
        };
      })
    );
    
    return mediaWithUploaders;
  },
});

// Create media record
export const createMedia = mutation({
  args: {
    filename: v.string(),
    originalName: v.string(),
    url: v.string(),
    mimeType: v.string(),
    size: v.number(),
    uploadedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const mediaId = await ctx.db.insert("media", {
      filename: args.filename,
      originalName: args.originalName,
      url: args.url,
      mimeType: args.mimeType,
      size: args.size,
      uploadedBy: args.uploadedBy,
      createdAt: Date.now(),
    });
    
    return mediaId;
  },
});

// Delete media
export const deleteMedia = mutation({
  args: { mediaId: v.id("media") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.mediaId);
    return { success: true };
  },
});

// ===== UTILITIES =====

// Generate unique slug
export const generateSlug = mutation({
  args: { title: v.string(), type: v.union(v.literal("post"), v.literal("page")) },
  handler: async (ctx, args) => {
    const baseSlug = args.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    let slug = baseSlug;
    let counter = 1;
    
    // Check if slug exists
    const table = args.type === "post" ? "blogPosts" : "pages";
    let existing = await ctx.db.query(table).filter(q => q.eq(q.field("slug"), slug)).first();
    
    // If slug exists, add number suffix
    while (existing) {
      slug = `${baseSlug}-${counter}`;
      existing = await ctx.db.query(table).filter(q => q.eq(q.field("slug"), slug)).first();
      counter++;
    }
    
    return slug;
  },
}); 