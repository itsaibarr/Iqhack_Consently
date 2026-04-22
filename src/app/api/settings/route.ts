import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { DEMO_USER_ID } from "@/lib/constants";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    let userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400, headers: corsHeaders });
    }

    // Handle demo users
    const DEMO_IDS = ["demo-user-id", "11111111-1111-1111-1111-111111111111", "demo@consently.ai"];
    if (DEMO_IDS.includes(userId)) {
      userId = DEMO_USER_ID;
    }

    // Fetch settings from profile_settings table
    const { data: settings, error } = await supabaseAdmin
      .from("profile_settings")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // Return defaults if not found
        return NextResponse.json({
          stealth_mode: false,
          notifications_enabled: true,
          alert_frequency: "high_priority",
          handshake_interval: 120,
        }, { headers: corsHeaders });
      }
      throw error;
    }

    return NextResponse.json(settings, { headers: corsHeaders });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("GET SETTINGS ERROR:", error);
    return NextResponse.json({ error: message }, { status: 500, headers: corsHeaders });
  }
}
