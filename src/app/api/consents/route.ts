import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { RiskLevel, ConsentStatus } from "@/lib/constants";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // For development. In production, specify the extension ID.
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  try {
    const event = await req.json();

    // 1. Basic Validation
    if (!event.id || !event.appDomain || !event.userId) {
      return NextResponse.json({ error: "Missing required fields (id, appDomain, userId)" }, { status: 400, headers: corsHeaders });
    }

    const userId = event.userId;

    // 2. Transform the OAuth detection into a Dashboard-compatible record
    const categoryMap: Record<string, any> = {
      google: "CONSUMER",
      github: "CONSUMER",
      resend: "CONSUMER",
      kaspi: "FINANCIAL",
      egov: "GOVERNMENT"
    };

    const companyData = {
      user_id: userId,
      name: event.appName,
      category: categoryMap[event.appDomain.split('.')[0].toLowerCase()] || "CONSUMER",
      risk: event.overallRisk as RiskLevel,
      status: (event.userAction === "detected" ? "PENDING" : "ACTIVE") as ConsentStatus,
      data_types: event.scopesTranslated.map((s: any) => ({
        name: s.label,
        category: s.category || "PII"
      })),
      shared_with: [],
      connected_at: event.detectedAt || new Date().toISOString(),
      description: `Detected via ${event.provider} OAuth flow from ${event.appDomain}`,
      logo_uid: event.appDomain.split('.')[0].toLowerCase()
    };

    // 3. Persist to Supabase
    const { data: company, error: compError } = await supabase
      .from("companies")
      .upsert(companyData, { onConflict: "user_id, name" })
      .select()
      .single();

    if (compError) throw compError;

    // 3b. Log Activity
    const { error: histError } = await supabase
      .from("history")
      .insert({
        user_id: userId,
        company_name: event.appName,
        action: (event.userAction === "detected" ? "GRANTED" : "GRANTED"), // Map detection to granted for simple MVP logic
        timestamp: event.detectedAt || new Date().toISOString(),
        data_types: event.scopesTranslated.map((s: any) => s.label)
      });

    if (histError) throw histError;

    return NextResponse.json({ 
      success: true, 
      message: "Sync complete",
      companyId: company.id
    }, { headers: corsHeaders });
  } catch (error: any) {
    console.error("SYNC ERROR:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500, headers: corsHeaders });
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: "healthy",
    service: "Consently Sync Engine"
  }, { headers: corsHeaders });
}
