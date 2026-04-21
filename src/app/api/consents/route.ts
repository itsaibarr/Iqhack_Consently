import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { RiskLevel, ConsentStatus, CompanyRecord, DEMO_USER_ID } from "@/lib/constants";
import { ConsentEvent } from "@/types/consent";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  try {
    const event = await req.json() as ConsentEvent;

    // 1. Basic Validation
    if (!event.id || !event.appDomain || !event.userId) {
      return NextResponse.json({ error: "Missing required fields (id, appDomain, userId)" }, { status: 400, headers: corsHeaders });
    }

    let userId = event.userId;
    const DEMO_IDS = ["demo-user-id", "11111111-1111-1111-1111-111111111111", "demo@consently.ai"];
    if (DEMO_IDS.includes(userId)) {
      userId = DEMO_USER_ID;
    }

    // 2. Transform the OAuth detection into a Dashboard-compatible record
    const categoryMap: Record<string, string> = {
      google: "CONSUMER",
      github: "CONSUMER",
      resend: "CONSUMER",
      kaspi: "FINANCIAL",
      egov: "GOVERNMENT"
    };

    const companyData = {
      user_id: userId,
      name: event.appName,
      category: (categoryMap[event.appDomain.split('.')[0].toLowerCase()] || "CONSUMER") as CompanyRecord["category"],
      risk: event.overallRisk as RiskLevel,
      status: "ACTIVE" as ConsentStatus,
      data_types: event.scopesTranslated.map((s) => ({
        name: s.label,
        category: s.category || "PII"
      })),
      shared_with: [],
      connected_at: event.detectedAt || new Date().toISOString(),
      description: event.plainSummary || `Detected via ${event.provider} OAuth flow from ${event.appDomain}`,
      logo_uid: event.appDomain.split('.')[0].toLowerCase()
    };

    // 3. Persist to Supabase using Admin/Service Role client to bypass RLS
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: "SUPABASE_SERVICE_ROLE_KEY not configured — add it to .env.local" },
        { status: 503, headers: corsHeaders }
      );
    }

    const { data: company, error: compError } = await supabaseAdmin
      .from("companies")
      .upsert(companyData, { onConflict: "user_id, name" })
      .select()
      .single();

    if (compError) throw compError;

    // 3b. Log Activity
    const { error: histError } = await supabaseAdmin
      .from("history")
      .insert({
        user_id: userId,
        company_name: event.appName,
        action: "GRANTED",
        timestamp: event.detectedAt || new Date().toISOString(),
        data_types: event.scopesTranslated.map((s) => s.label)
      });

    if (histError) throw histError;

    return NextResponse.json({ 
      success: true, 
      message: "Sync complete",
      companyId: company.id
    }, { headers: corsHeaders });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("SYNC ERROR:", error);
    return NextResponse.json({ error: message }, { status: 500, headers: corsHeaders });
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: "healthy",
    service: "Consently Sync Engine"
  }, { headers: corsHeaders });
}
