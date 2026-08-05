"use client";
import { createClient } from "@/lib/supabase/client";

export async function trackEvent(action: string, metadata?: Record<string, unknown>) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  await supabase.from("events_log").insert({
    user_id: user?.id ?? null,
    action,
    metadata,
  });
}