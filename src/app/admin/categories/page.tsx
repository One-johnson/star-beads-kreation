"use client";
import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { useAuth } from "@/contexts/AuthContext";
import { Id } from "@/../convex/_generated/dataModel";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AdminCategoriesPage() {
  const { user } = useAuth();
  const categories = useQuery(api.categories.getCategories, {});
  const addCategory = useMutation(api.categories.addCategory);
  const deleteCategory = useMutation(api.categories.deleteCategory);
  const updateCategory = useMutation(api.categories.updateCategory);
  const generateUploadUrl = useMutation(api.categories.generateUploadUrl);
  const getStorageUrl = useMutation(api.categories.getStorageUrl);
  const deleteById = useMutation(api.categories.deleteById);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [pending, setPending] = useState(false);

  // Edit dialog state
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPending, setEditPending] = useState(false);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [storageId, setStorageId] = useState("");
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editStorageId, setEditStorageId] = useState("");

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<any>(null);

  const [search, setSearch] = useState("");
  const [imageOnly, setImageOnly] = useState(false);

  let filteredCategories = categories || [];
  if (search) {
    filteredCategories = filteredCategories.filter(cat =>
      cat.name.toLowerCase().includes(search.toLowerCase()) ||
      (cat.description && cat.description.toLowerCase().includes(search.toLowerCase()))
    );
  }
  if (imageOnly) {
    filteredCategories = filteredCategories.filter(cat => !!cat.imageUrl);
  }

  const [page, setPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(filteredCategories.length / pageSize);
  const paginatedCategories = filteredCategories.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [search, imageOnly, categories]);

  if (!user || user.role !== "admin") {
    return <div className="p-8 text-red-600">Access denied. Admins only.</div>;
  }

  const handleImageUpload = async (file: File) => {
    const postUrl = await generateUploadUrl();
    const result = await fetch(postUrl, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });
    const { storageId } = await result.json();
    const url = await getStorageUrl({ storageId });
    setImageUrl(url as string);
    setStorageId(storageId);
    return { url, storageId };
  };

  const handleEditImageUpload = async (file: File) => {
    const postUrl = await generateUploadUrl();
    const result = await fetch(postUrl, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });
    const { storageId } = await result.json();
    const url = await getStorageUrl({ storageId });
    setEditImageUrl(url as string);
    setEditStorageId(storageId);
    return { url, storageId };
  };

  const handleDeleteImage = async () => {
    if (!storageId) return;
    await deleteById({ storageId });
    setImageUrl("");
    setStorageId("");
    toast.success("Image deleted");
  };

  const handleEditDeleteImage = async () => {
    if (!editStorageId) return;
    await deleteById({ storageId: editStorageId });
    setEditImageUrl("");
    setEditStorageId("");
    toast.success("Image deleted");
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    try {
      let url = imageUrl;
      if (imageFile) {
        const { url: uploadedUrl } = await handleImageUpload(imageFile);
        url = uploadedUrl as string;
      }
      await addCategory({ name, description, imageUrl: url });
      setName("");
      setDescription("");
      setImageFile(null);
      setImageUrl("");
      setStorageId("");
      toast.success("Category added!");
    } catch (err) {
      toast.error("Failed to add category");
    } finally {
      setPending(false);
    }
  };

  const handleDelete = (cat: any) => {
    setCategoryToDelete(cat);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    await deleteCategory({ categoryId: categoryToDelete._id });
    setDeleteDialogOpen(false);
    setCategoryToDelete(null);
    toast.success("Category deleted");
  };

  const openEdit = (cat: any) => {
    setEditId(cat._id);
    setEditName(cat.name);
    setEditDescription(cat.description);
    setEditImageUrl(cat.imageUrl || "");
    setEditStorageId(cat.storageId || "");
    setEditImageFile(null);
    setEditOpen(true);
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    setEditPending(true);
    try {
      let url = editImageUrl;
      if (editImageFile) {
        const { url: uploadedUrl } = await handleEditImageUpload(editImageFile);
        url = uploadedUrl ?? "";
      }
      await updateCategory({ categoryId: editId as Id<'categories'>, name: editName, description: editDescription, imageUrl: url });
      setEditOpen(false);
      toast.success("Category updated!");
    } catch (err) {
      toast.error("Failed to update category");
    } finally {
      setEditPending(false);
    }
  };

  return (
    <main className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button asChild variant="outline" size="sm">
          <Link href="/admin">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
        <Link href="/admin" className="text-2xl font-bold hover:underline">
          Manage Categories
        </Link>
      </div>
      <div className="mb-8 flex flex-col md:flex-row gap-4 items-end justify-between">
        <div className="flex gap-2 items-center">
          <Input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-64"
          />
          <div className="flex items-center gap-2">
            <Switch id="imageOnly" checked={imageOnly} onCheckedChange={setImageOnly} />
            <label htmlFor="imageOnly" className="text-sm">With Image Only</label>
          </div>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setAddDialogOpen(true)} className="bg-blue-600 text-white">Add Category</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddCategory} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="border rounded px-3 py-2 w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Input
                  type="text"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="border rounded px-3 py-2 w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Image (optional)</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={e => setImageFile(e.target.files?.[0] || null)}
                />
                {imageFile && <span className="text-xs">{imageFile.name}</span>}
                {imageUrl && (
                  <div className="relative mt-2">
                    <img src={imageUrl} alt="Preview" className="w-16 h-16 rounded object-cover" />
                    <Button type="button" size="icon" variant="ghost" className="absolute top-0 right-0" onClick={handleDeleteImage}>
                      &times;
                    </Button>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button type="submit" disabled={pending} className="bg-blue-600 text-white">
                  {pending ? "Adding..." : "Add Category"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader>
         
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto" style={{ maxHeight: 500, overflowY: 'auto' }}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky top-0 z-10 bg-white">Image</TableHead>
                  <TableHead className="sticky top-0 z-10 bg-white">Name</TableHead>
                  <TableHead className="sticky top-0 z-10 bg-white">Description</TableHead>
                  <TableHead className="sticky top-0 z-10 bg-white">Date Added</TableHead>
                  <TableHead className="sticky top-0 z-10 bg-white">Date Updated</TableHead>
                  <TableHead className="sticky top-0 z-10 bg-white">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedCategories.map(cat => (
                <TableRow key={cat._id}>
                  <TableCell>
                    {cat.imageUrl ? (
                      <img src={cat.imageUrl} alt={cat.name} className="w-12 h-12 object-cover rounded" />
                    ) : (
                      <span className="text-xs text-gray-400">No image</span>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{cat.name}</TableCell>
                  <TableCell className="text-gray-600">{cat.description}</TableCell>
                  <TableCell>{cat.createdAt ? format(new Date(cat.createdAt), "yyyy-MM-dd HH:mm") : "-"}</TableCell>
                  <TableCell>{cat.updatedAt ? format(new Date(cat.updatedAt), "yyyy-MM-dd HH:mm") : "-"}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-5 h-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(cat)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(cat)} className="text-red-600">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {editOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xl"
              onClick={() => setEditOpen(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4">Edit Category</h2>
            <form onSubmit={handleEditSave} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="border rounded px-3 py-2 w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <input
                  type="text"
                  value={editDescription}
                  onChange={e => setEditDescription(e.target.value)}
                  className="border rounded px-3 py-2 w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Image (optional)</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={e => setEditImageFile(e.target.files?.[0] || null)}
                />
                {editImageFile && <span className="text-xs">{editImageFile.name}</span>}
                {editImageUrl && (
                  <div className="relative mt-2">
                    <img src={editImageUrl} alt="Preview" className="w-16 h-16 rounded object-cover" />
                    <Button type="button" size="icon" variant="ghost" className="absolute top-0 right-0" onClick={handleEditDeleteImage}>
                      &times;
                    </Button>
                  </div>
                )}
              </div>
              <button
                type="submit"
                disabled={editPending}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                {editPending ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
          </DialogHeader>
          <div>Are you sure you want to delete the category <span className="font-semibold">{categoryToDelete?.name}</span>? This action cannot be undone.</div>
          <DialogFooter>
            <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
} 