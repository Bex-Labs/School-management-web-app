import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CONFIRMATION_PHRASE = "DELETE ACCOUNT";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(status: number, payload: Record<string, unknown>) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function normalizeRole(rawRole: unknown) {
  const normalized = String(rawRole || "")
    .trim()
    .toLowerCase();

  if (normalized === "administrator" || normalized === "admin") {
    return "Admin";
  }
  if (normalized === "teacher" || normalized === "employee" || normalized === "staff") {
    return "Teacher";
  }
  if (normalized === "student" || normalized === "learner") {
    return "Student";
  }
  if (normalized === "parent" || normalized === "guardian") {
    return "Parent";
  }
  return "Parent";
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
  const authHeader = request.headers.get("Authorization");

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return jsonResponse(500, { ok: false, message: "Account deletion service is not configured." });
  }

  if (!authHeader) {
    return jsonResponse(401, { ok: false, message: "Missing authorization header." });
  }

  const callerClient = createClient(supabaseUrl, anonKey, {
    global: {
      headers: {
        Authorization: authHeader,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const {
    data: { user: callerUser },
    error: callerError,
  } = await callerClient.auth.getUser();

  if (callerError || !callerUser) {
    return jsonResponse(401, { ok: false, message: "Unauthorized request." });
  }

  const { data: callerProfile, error: profileError } = await serviceClient
    .from("profiles")
    .select("id, role, institution_id")
    .eq("id", callerUser.id)
    .maybeSingle();

  if (profileError || !callerProfile) {
    return jsonResponse(403, { ok: false, message: "Administrator profile was not found." });
  }

  if (normalizeRole(callerProfile.role) !== "Admin") {
    return jsonResponse(403, { ok: false, message: "Only administrators can delete a school account." });
  }

  const institutionId = String(callerProfile.institution_id || "").trim();
  if (!institutionId) {
    return jsonResponse(400, { ok: false, message: "Administrator account is not linked to a school." });
  }

  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonResponse(400, { ok: false, message: "Invalid JSON payload." });
  }

  if (String(payload.confirmation || "").trim() !== CONFIRMATION_PHRASE) {
    return jsonResponse(400, { ok: false, message: "Confirmation phrase did not match." });
  }

  const { data: institution, error: institutionError } = await serviceClient
    .from("institutions")
    .select("id, name")
    .eq("id", institutionId)
    .maybeSingle();

  if (institutionError || !institution) {
    return jsonResponse(404, { ok: false, message: "School account was not found." });
  }

  const { data: profiles, error: profilesError } = await serviceClient
    .from("profiles")
    .select("id, email, role")
    .eq("institution_id", institutionId);

  if (profilesError) {
    return jsonResponse(500, {
      ok: false,
      message: profilesError.message || "Could not collect school users before deletion.",
    });
  }

  const profileRows = Array.isArray(profiles) ? profiles : [];
  const userIds = Array.from(
    new Set(profileRows.map((profile) => String(profile.id || "").trim()).filter(Boolean)),
  );
  const orderedUserIds = [
    ...userIds.filter((userId) => userId !== callerUser.id),
    ...userIds.filter((userId) => userId === callerUser.id),
  ];

  const { error: institutionDeleteError } = await serviceClient
    .from("institutions")
    .delete()
    .eq("id", institutionId);

  if (institutionDeleteError) {
    return jsonResponse(500, {
      ok: false,
      message: institutionDeleteError.message || "Could not delete this school account.",
    });
  }

  if (userIds.length) {
    await serviceClient.from("profiles").delete().in("id", userIds);
  }

  const failedUsers: Array<Record<string, unknown>> = [];
  let deletedUsers = 0;

  for (const userId of orderedUserIds) {
    const { error: deleteUserError } = await serviceClient.auth.admin.deleteUser(userId);
    if (deleteUserError) {
      failedUsers.push({
        userId,
        message: deleteUserError.message || "Could not delete login account.",
      });
      continue;
    }
    deletedUsers += 1;
  }

  if (failedUsers.length) {
    return jsonResponse(207, {
      ok: true,
      status: "partial",
      message: "School data was deleted, but some login accounts could not be removed.",
      deletedUsers,
      failedUsers,
      institutionId,
    });
  }

  return jsonResponse(200, {
    ok: true,
    status: "deleted",
    message: "School account deleted.",
    deletedUsers,
    institutionId,
  });
});
