import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  const anonKey     = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  let mentorId: string;
  let slots: { day_of_week: number; start_time: string; end_time: string }[] | undefined;
  let pauseBookings: boolean | undefined;

  try {
    const body = await req.json() as {
      mentorId: string;
      slots?: { day_of_week: number; start_time: string; end_time: string }[];
      pauseBookings?: boolean;
    };
    mentorId = (body.mentorId ?? "").trim();
    slots = body.slots;
    pauseBookings = body.pauseBookings;
    if (!mentorId) throw new Error("missing mentorId");
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const client = createClient(
    supabaseUrl,
    serviceKey || anonKey,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  if (slots !== undefined) {
    const { error: deleteError } = await client
      .from("mentor_availability")
      .delete()
      .eq("mentor_id", mentorId);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    if (slots.length > 0) {
      const rows = slots.map(s => ({ mentor_id: mentorId, ...s }));
      const { error: insertError } = await client
        .from("mentor_availability")
        .insert(rows);

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }
    }
  }

  if (pauseBookings !== undefined) {
    const { error: updateError } = await client
      .from("mentors")
      .update({ pause_bookings: pauseBookings })
      .eq("id", mentorId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}
