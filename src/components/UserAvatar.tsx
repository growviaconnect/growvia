"use client";

import { useState, useRef } from "react";
import { Camera, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import AvatarCropModal from "@/components/AvatarCropModal";

type Props = {
  photo?: string | null;
  name: string;
  size?: number;
  rounded?: "full" | "lg";
  className?: string;
  editable?: boolean;
  onPhotoUploaded?: (url: string) => void;
};

export default function UserAvatar({
  photo,
  name,
  size = 32,
  rounded = "full",
  className = "",
  editable = false,
  onPhotoUploaded,
}: Props) {
  const { session, setSession } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [cropUrl, setCropUrl]     = useState<string | null>(null);
  const [hovered, setHovered]     = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const initials = name
    ? name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  const roundedCls = rounded === "full" ? "rounded-full" : "rounded-lg";
  const sizeStyle  = { width: size, height: size, minWidth: size, minHeight: size };
  const iconSize   = Math.round(size * 0.38);

  function handleClick(e: React.MouseEvent) {
    if (!editable || uploading) return;
    e.stopPropagation();
    fileRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCropUrl(URL.createObjectURL(file));
    e.target.value = "";
  }

  async function handleCropConfirm(blob: Blob) {
    if (cropUrl) URL.revokeObjectURL(cropUrl);
    setCropUrl(null);
    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });
      const form = new FormData();
      form.append("file",   file);
      form.append("bucket", "avatars");
      form.append("path",   `${user.id}/avatar.jpg`);

      const res  = await fetch("/api/mentor/upload-file", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error ?? "Upload failed");

      const url = json.url as string;

      // Persist clean URL to DB
      const table = session?.role === "mentor" ? "mentors" : "mentees";
      await supabase.from(table).update({ photo_url: url }).eq("id", user.id);

      // Cache-bust for display — same storage path is overwritten, browser would serve stale image otherwise
      const displayUrl = `${url.split("?")[0]}?v=${Date.now()}`;
      if (session) setSession({ ...session, photo: displayUrl });
      onPhotoUploaded?.(displayUrl);
    } catch (err) {
      console.error("[avatar-upload]", err);
    } finally {
      setUploading(false);
    }
  }

  function handleCropCancel() {
    if (cropUrl) URL.revokeObjectURL(cropUrl);
    setCropUrl(null);
  }

  return (
    <>
      <div
        className={`relative flex-shrink-0 ${roundedCls} ${editable ? "cursor-pointer" : ""} ${className}`}
        style={sizeStyle}
        onClick={handleClick}
        onMouseEnter={() => editable && setHovered(true)}
        onMouseLeave={() => editable && setHovered(false)}
      >
        {/* Photo or initials */}
        {photo ? (
          <img
            src={photo}
            alt={name}
            className={`w-full h-full object-cover ${roundedCls}`}
          />
        ) : (
          <div
            className={`w-full h-full flex items-center justify-center font-bold text-white ${roundedCls}`}
            style={{
              background: "linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)",
              fontSize: Math.round(size * 0.35),
            }}
          >
            {initials}
          </div>
        )}

        {/* Hover overlay — camera icon */}
        {editable && hovered && !uploading && (
          <div
            className={`absolute inset-0 flex items-center justify-center ${roundedCls}`}
            style={{ background: "rgba(0,0,0,0.55)", transition: "opacity 0.2s" }}
          >
            <Camera style={{ color: "#fff", width: iconSize, height: iconSize }} />
          </div>
        )}

        {/* Upload spinner overlay */}
        {uploading && (
          <div
            className={`absolute inset-0 flex items-center justify-center ${roundedCls}`}
            style={{ background: "rgba(13,10,26,0.65)" }}
          >
            <Loader2
              className="animate-spin"
              style={{ color: "#A78BFA", width: iconSize, height: iconSize }}
            />
          </div>
        )}

        {editable && (
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        )}
      </div>

      {cropUrl && (
        <AvatarCropModal
          objectUrl={cropUrl}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}
    </>
  );
}
