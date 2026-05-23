import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function jsonResponse(status: number, payload: Record<string, unknown>) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function normalizeWorkspaceId(rawWorkspaceId: unknown) {
  const normalized = String(rawWorkspaceId || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return normalized || "public";
}

function normalizeAdmissionStatus(value: unknown) {
  const normalized = String(value || "").trim().toLowerCase();
  if (
    normalized === "review" ||
    normalized === "shortlisted" ||
    normalized === "rejected" ||
    normalized === "approved"
  ) {
    return normalized;
  }
  return "pending";
}

function composeFullName(payload: Record<string, unknown>) {
  const provided = String(payload.fullName || "").trim();
  if (provided) return provided;
  return [
    String(payload.firstName || "").trim(),
    String(payload.middleName || "").trim(),
    String(payload.lastName || "").trim(),
  ]
    .filter(Boolean)
    .join(" ")
    .trim();
}

async function resolveInstitutionIdByWorkspace(
  serviceClient: ReturnType<typeof createClient>,
  workspaceId: string,
) {
  const { data, error } = await serviceClient
    .from("profiles")
    .select("institution_id, email, role")
    .not("institution_id", "is", null)
    .limit(2000);

  if (error) {
    throw error;
  }

  const normalizedWorkspace = normalizeWorkspaceId(workspaceId);
  const candidates = (Array.isArray(data) ? data : []).filter((row) => {
    const emailWorkspace = normalizeWorkspaceId(String(row?.email || ""));
    return emailWorkspace === normalizedWorkspace;
  });

  if (!candidates.length) {
    return null;
  }

  const prioritized = candidates.sort((left, right) => {
    const leftRole = String(left?.role || "").trim().toLowerCase();
    const rightRole = String(right?.role || "").trim().toLowerCase();
    const leftWeight = leftRole === "administrator" || leftRole === "admin" ? 0 : 1;
    const rightWeight = rightRole === "administrator" || rightRole === "admin" ? 0 : 1;
    return leftWeight - rightWeight;
  });

  return String(prioritized[0]?.institution_id || "").trim() || null;
}

async function resolveCreatedBy(
  serviceClient: ReturnType<typeof createClient>,
  institutionId: string,
) {
  const { data: admins, error: adminError } = await serviceClient
    .from("profiles")
    .select("id, role, created_at")
    .eq("institution_id", institutionId)
    .in("role", ["Administrator", "Admin", "administrator", "admin"])
    .order("created_at", { ascending: true })
    .limit(1);

  if (adminError) {
    throw adminError;
  }

  if (Array.isArray(admins) && admins[0]?.id) {
    return String(admins[0].id);
  }

  const { data: fallback, error: fallbackError } = await serviceClient
    .from("profiles")
    .select("id, created_at")
    .eq("institution_id", institutionId)
    .order("created_at", { ascending: true })
    .limit(1);

  if (fallbackError) {
    throw fallbackError;
  }

  return String((Array.isArray(fallback) ? fallback[0]?.id : "") || "").trim() || null;
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse(405, { ok: false, message: "Method not allowed." });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey || !anonKey) {
    return jsonResponse(500, { ok: false, message: "Supabase function secrets are missing." });
  }

  // This function is intended to run with JWT verification disabled.
  // We still require the project's public key header to reduce anonymous abuse.
  const incomingApiKey = String(request.headers.get("apikey") || "").trim();
  if (!incomingApiKey || incomingApiKey !== anonKey) {
    return jsonResponse(401, {
      ok: false,
      message: "Invalid API key for admissions submission.",
    });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonResponse(400, { ok: false, message: "Invalid JSON payload." });
  }

  const rawPayload =
    body.payload && typeof body.payload === "object" && !Array.isArray(body.payload)
      ? (body.payload as Record<string, unknown>)
      : {};
  const workspaceId = normalizeWorkspaceId(body.workspaceId || rawPayload.workspaceId || "");
  const institutionIdFromRequest = String(body.institutionId || "").trim();

  if (!workspaceId || workspaceId === "public") {
    return jsonResponse(400, {
      ok: false,
      message: "Missing workspace identifier. Use the official school application link.",
    });
  }

  const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  let institutionId = institutionIdFromRequest;

  if (institutionId) {
    const { data: institution, error: institutionError } = await serviceClient
      .from("institutions")
      .select("id")
      .eq("id", institutionId)
      .maybeSingle();

    if (institutionError) {
      return jsonResponse(500, { ok: false, message: "Could not validate institution." });
    }

    if (!institution?.id) {
      return jsonResponse(404, {
        ok: false,
        message: "Institution for this application link was not found.",
      });
    }
  } else {
    try {
      institutionId = (await resolveInstitutionIdByWorkspace(serviceClient, workspaceId)) || "";
    } catch {
      return jsonResponse(500, {
        ok: false,
        message: "Could not resolve school workspace for this application.",
      });
    }

    if (!institutionId) {
      return jsonResponse(404, {
        ok: false,
        message: "School workspace was not found. Please use the latest application link/QR from the school admin.",
      });
    }
  }

  let createdBy = "";
  try {
    createdBy = (await resolveCreatedBy(serviceClient, institutionId)) || "";
  } catch {
    return jsonResponse(500, {
      ok: false,
      message: "Could not find an administrator for this school workspace.",
    });
  }

  if (!createdBy) {
    return jsonResponse(400, {
      ok: false,
      message: "No administrator profile is linked to this workspace yet.",
    });
  }

  const fullName = composeFullName(rawPayload);
  const academicClassApplyingFor = String(
    rawPayload.academicClassApplyingFor || rawPayload.classApplyingFor || rawPayload.level || "",
  ).trim();
  const guardianEmail = String(rawPayload.guardianEmail || "").trim();
  const guardianName = String(rawPayload.guardianFullName || rawPayload.guardianName || "").trim();

  if (!fullName) {
    return jsonResponse(400, { ok: false, message: "Student first and last name are required." });
  }

  if (!academicClassApplyingFor) {
    return jsonResponse(400, { ok: false, message: "Class applying for is required." });
  }

  if (!guardianName || !guardianEmail || !EMAIL_REGEX.test(guardianEmail)) {
    return jsonResponse(400, {
      ok: false,
      message: "Valid parent/guardian name and email are required.",
    });
  }

  const applicantEmail = String(rawPayload.email || "").trim();
  if (applicantEmail && !EMAIL_REGEX.test(applicantEmail)) {
    return jsonResponse(400, { ok: false, message: "Applicant email format is invalid." });
  }

  const recordId = String(rawPayload.id || crypto.randomUUID()).trim() || crypto.randomUUID();
  const createdAt = new Date().toISOString();

  const normalizedPayload = {
    ...rawPayload,
    id: recordId,
    fullName,
    level: academicClassApplyingFor,
    classApplyingFor: academicClassApplyingFor,
    academicClassApplyingFor,
    guardianName,
    guardianFullName: guardianName,
    guardianEmail,
    status: normalizeAdmissionStatus(rawPayload.status),
    source: String(rawPayload.source || "public-apply").trim(),
    workspaceId,
    createdAt,
    updatedAt: createdAt,
  };

  const row = {
    institution_id: institutionId,
    record_id: recordId,
    full_name: fullName,
    level: academicClassApplyingFor,
    status: normalizeAdmissionStatus(rawPayload.status),
    guardian_name: guardianName,
    guardian_email: guardianEmail,
    application_stage: String(rawPayload.applicationStage || "Submitted").trim() || "Submitted",
    payload: normalizedPayload,
    created_by: createdBy,
    created_at: createdAt,
    updated_at: createdAt,
  };

  const { error: insertError } = await serviceClient
    .from("admissions_applications")
    .upsert(row, { onConflict: "institution_id,record_id" });

  if (insertError) {
    return jsonResponse(500, {
      ok: false,
      message: insertError.message || "Could not submit application.",
    });
  }

  return jsonResponse(200, {
    ok: true,
    status: "created",
    institutionId,
    workspaceId,
    record: normalizedPayload,
  });
});
