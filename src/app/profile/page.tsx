"use client";
import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editContact, setEditContact] = useState("");
  const [editing, setEditing] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("sessionToken") : null;
    setSessionToken(token);
  }, []);

  const user = useQuery(api.authQueries.getCurrentUser, sessionToken ? { sessionToken } : "skip");
  const updateName = useMutation(api.authMutations.updateUserName);
  const updateContact = useMutation(api.authMutations.updateUserContact);

  useEffect(() => {
    if (user && user.name) setEditName(user.name);
    if (user && user.contact) setEditContact(user.contact);
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);
    setEditing(true);
    try {
      if (!user || !user.userId) throw new Error("User not loaded");
      await updateName({ userId: user.userId, name: editName });
      await updateContact({ userId: user.userId, contact: editContact });
      setSuccess("Profile updated successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setEditing(false);
    }
  };

  if (user === undefined && sessionToken) {
    return <div>Loading profile...</div>;
  }

  if (!user) {
    return <div className="text-center text-muted-foreground">You must be logged in to view your profile.</div>;
  }

  return (
    <main className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
      <div className="bg-white dark:bg-muted rounded-lg shadow p-6">
        <form onSubmit={handleSave} className="flex flex-col gap-4 max-w-md w-full mx-auto">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={user.email}
              disabled
              className="border rounded px-3 py-2 w-full bg-muted/50 text-base cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={editName}
              onChange={e => setEditName(e.target.value)}
              className="border rounded px-3 py-2 w-full text-base"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Contact</label>
            <input
              type="text"
              value={editContact}
              onChange={e => setEditContact(e.target.value)}
              className="border rounded px-3 py-2 w-full text-base"
              placeholder="Phone, WhatsApp, etc. (optional)"
            />
          </div>
          {success && <div className="text-green-600 text-sm text-center">{success}</div>}
          {error && <div className="text-red-600 text-sm text-center">{error}</div>}
          <Button type="submit" disabled={editing} className="w-full">
            {editing ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </div>
    </main>
  );
} 