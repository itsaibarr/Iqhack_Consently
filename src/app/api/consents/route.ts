import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { RiskLevel, ConsentStatus, CompanyRecord, DEMO_USER_ID } from "@/lib/constants";
import { ConsentEvent } from "@/types/consent";
import { calculateTrustScore } from "@/lib/privacy";

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
      shared_with: event.sharedWith ?? [],
      connected_at: event.detectedAt || new Date().toISOString(),
      description: event.plainSummary || `Detected via ${event.provider} OAuth flow from ${event.appDomain}`,
      logo_uid: event.appDomain.split('.')[0].toLowerCase(),
      // Persist the full AI analysis as a structured report
      policy_report: event.plainSummary ? {
        summary: event.plainSummary,
        keyFindings: [
          ...(event.sharedWith && event.sharedWith.length > 0 ? [{
            category: "SHARING",
            finding: `Data is shared with ${event.sharedWith.join(", ")}.`,
            impact: "NEGATIVE" as const
          }] : []),
          ...event.scopesTranslated.slice(0, 3).map((s) => ({
            category: "DATA_RETENTION" as const,
            finding: `Collects: ${s.label}`,
            impact: (s.risk === "HIGH" ? "NEGATIVE" : s.risk === "MEDIUM" ? "NEUTRAL" : "POSITIVE") as "NEGATIVE" | "NEUTRAL" | "POSITIVE"
          }))
        ],
        lastAnalyzed: new Date().toISOString(),
        policyUrl: event.privacyPolicyUrl || "#",
        dpoEmail: event.dpoEmail
      } : null
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

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    let userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400, headers: corsHeaders });
    }

    const DEMO_IDS = ["demo-user-id", "11111111-1111-1111-1111-111111111111", "demo@consently.ai"];
    if (DEMO_IDS.includes(userId)) {
      userId = DEMO_USER_ID;
    }

    const includeDetails = searchParams.get("includeDetails") === "true";

    // Query companies - query status for all if details requested, otherwise just active for score
    const query = supabaseAdmin
      .from("companies")
      .select("*")
      .eq("user_id", userId);
    
    if (!includeDetails) {
      query.eq("status", "ACTIVE");
    }

    const { data: companies, error } = await query;

    if (error) throw error;

    const stats = {
      high: 0,
      medium: 0,
      low: 0,
      totalActive: 0
    };

    companies?.forEach(c => {
      if (c.status === "ACTIVE") {
        stats.totalActive++;
        if (c.risk === "HIGH") stats.high++;
        else if (c.risk === "MEDIUM") stats.medium++;
        else if (c.risk === "LOW") stats.low++;
      }
    });

    const score = calculateTrustScore(stats);

    if (includeDetails) {
      // Also fetch history
      const { data: history, error: histError } = await supabaseAdmin
        .from("history")
        .select("*")
        .eq("user_id", userId)
        .order("timestamp", { ascending: false })
        .limit(20);

      if (histError) throw histError;

      return NextResponse.json({ ...stats, score, companies, history }, { headers: corsHeaders });
    }

    return NextResponse.json({ ...stats, score }, { headers: corsHeaders });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("GET STATS ERROR:", error);
    return NextResponse.json({ error: message }, { status: 500, headers: corsHeaders });
  }
}
