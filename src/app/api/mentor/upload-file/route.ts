import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const ALLOWED_BUCKETS = new Set(["cvs", "avatars"]);

export async function POST(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  const anonKey     = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 });
  }

  const file   = formData.get("file");
  const bucket = (formData.get("bucket") as string | null) ?? "";
  const path   = (formData.get("path")   as string | null) ?? "";

  if (!(file instanceof File) || !bucket || !path) {
    return NextResponse.json({ error: "Missing file, bucket, or path" }, { status: 400 });
  }

  if (!ALLOWED_BUCKETS.has(bucket)) {
    return NextResponse.json({ error: "Bucket not allowed" }, { status: 403 });
  }

  const client = createClient(supabaseUrl, serviceKey || anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { error } = await client.storage
    .from(bucket)
    .upload(path, file, { upsert: true, contentType: file.type });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // For public buckets return a public URL; for private buckets return the storage path.
  // The caller uses the value only to detect upload success and display the filename.
  let url: string;
  if (bucket === "avatars") {
    const { data } = client.storage.from(bucket).getPublicUrl(path);
    url = data.publicUrl;
  } else {
    // Private bucket — callers store the path and generate signed URLs on demand
    url = path;
  }

  return NextResponse.json({ url });
}
