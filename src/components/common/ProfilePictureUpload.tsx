"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { apiRequest } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";

interface Props {
  currentPicture?: string;
  onUploadSuccess: (url: string) => void;
  onDeleteSuccess?: () => void;
}

export default function ProfilePictureUpload({
  currentPicture,
  onUploadSuccess,
  onDeleteSuccess,
}: Props) {
  const [preview, setPreview] = useState<string | null>(currentPicture || null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvent) => setPreview(loadEvent.target?.result as string);
    reader.readAsDataURL(file);

    try {
      setUploading(true);
      setError(null);
      setSuccess(null);

      const form = new FormData();
      form.append("profilePicture", file);

      const response = await fetch(API_ENDPOINTS.users.uploadProfilePicture, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("kodisha_token") || ""}` },
        body: form,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Upload failed");
      }

      onUploadSuccess(data?.data?.profilePicture || data?.profilePicture);
      setSuccess("Profile picture updated.");
      if (inputRef.current) inputRef.current.value = "";
    } catch (uploadError: any) {
      setError(uploadError.message);
      setPreview(currentPicture || null);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete your profile picture?")) return;
    try {
      setDeleting(true);
      setError(null);
      setSuccess(null);
      await apiRequest(`${API_ENDPOINTS.users.uploadProfilePicture.replace("/upload", "")}`, {
        method: "DELETE",
      });
      setPreview(null);
      setSuccess("Profile picture deleted.");
      onDeleteSuccess?.();
    } catch (deleteError: any) {
      setError(deleteError.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4 rounded-2xl border border-stone-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-stone-900">Profile picture</h2>

      <div className="flex justify-center">
        {preview ? (
          <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-stone-200">
            <Image
              src={preview}
              alt="Profile preview"
              fill
              unoptimized
              sizes="128px"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-stone-200 bg-stone-100 text-sm text-stone-400">
            No picture
          </div>
        )}
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={uploading}
        className="hidden"
      />

      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
      >
        {uploading ? "Uploading..." : "Upload picture"}
      </button>

      {preview ? (
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="w-full rounded-xl border border-red-200 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
        >
          {deleting ? "Deleting..." : "Delete picture"}
        </button>
      ) : null}

      <p className="text-xs text-stone-400">Supported: JPG, PNG, GIF · Max 5MB</p>
    </div>
  );
}
