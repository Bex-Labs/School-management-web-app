import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ALLOWED_ROLES = new Set(["Admin", "Teacher", "Student", "Parent"]);

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

function resolveProvider(user: Record<string, unknown> | null) {
  const identities = Array.isArray(user?.identities) ? (user?.identities as Record<string, unknown>[]) : [];
  const providers = new Set(
    identities
      .map((identity) => String(identity?.provider || "").trim().toLowerCase())
      .filter(Boolean),
  );

  if (providers.has("google")) {
    return "google";
  }
  return "password";
}

async function findAuthUserByEmail(
  serviceClient: ReturnType<typeof createClient>,
  normalizedEmail: string,
) {
  let page = 1;
  const perPage = 200;

  while (page <= 20) {
    const { data, error } = await serviceClient.auth.admin.listUsers({
      page,
      perPage,
    });

    if (error) {
      throw error;
    }

    const users = data?.users || [];
    const found = users.find(
      (user) => String(user.email || "").trim().toLowerCase() === normalizedEmail,
    );

    if (found) {
      return found;
    }

    if (users.length < perPage) {
      break;
    }

    page += 1;
  }

  return null;
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
    return jsonResponse(500, { ok: false, message: "Supabase function secrets are missing." });
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
    return jsonResponse(403, { ok: false, message: "Admin profile was not found." });
  }

  const callerRole = normalizeRole(callerProfile.role);

  if (callerRole !== "Admin") {
    return jsonResponse(403, { ok: false, message: "Only administrators can provision user accounts." });
  }

  if (!callerProfile.institution_id) {
    return jsonResponse(400, {
      ok: false,
      message: "Administrator account is not linked to an institution yet.",
    });
  }

  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonResponse(400, { ok: false, message: "Invalid JSON payload." });
  }

  const email = String(payload.email || "").trim();
  const normalizedEmail = email.toLowerCase();
  const displayName = String(payload.displayName || "").trim() || email.split("@")[0] || "School User";
  const password = String(payload.password || "");
  const requestedRole = normalizeRole(payload.role);
  const workspaceId = String(payload.workspaceId || callerProfile.institution_id || "").trim();
  const mustChangePassword = Boolean(payload.mustChangePassword);

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return jsonResponse(400, { ok: false, message: "A valid email address is required." });
  }

  if (!password || password.length < 8) {
    return jsonResponse(400, { ok: false, message: "Password must be at least 8 characters." });
  }

  if (!ALLOWED_ROLES.has(requestedRole)) {
    return jsonResponse(400, { ok: false, message: "Invalid role supplied." });
  }

  let authUser = await findAuthUserByEmail(serviceClient, normalizedEmail);
  let status = "updated";

  if (!authUser) {
    const { data: createdData, error: createError } = await serviceClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        display_name: displayName,
        role: requestedRole,
        workspace_id: workspaceId,
        must_change_password: mustChangePassword,
        provisioned_by: callerUser.id,
      },
    });

    if (createError) {
      return jsonResponse(400, {
        ok: false,
        message: createError.message || "Could not create this auth account.",
      });
    }

    authUser = createdData.user;
    status = "created";
  }

  const provider = resolveProvider(authUser as unknown as Record<string, unknown>);

  const { error: profileUpsertError } = await serviceClient.from("profiles").upsert(
    {
      id: authUser?.id,
      display_name: displayName,
      email,
      role: requestedRole,
      institution_id: callerProfile.institution_id,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );

  if (profileUpsertError) {
    return jsonResponse(500, {
      ok: false,
      message: profileUpsertError.message || "Account was created but profile sync failed.",
    });
  }

  if (provider === "google" && status !== "created") {
    status = "existing_google";
  }

  return jsonResponse(200, {
    ok: true,
    status,
    user: {
      id: authUser?.id,
      email: authUser?.email || email,
      displayName,
      role: requestedRole,
      provider,
      workspaceId,
      mustChangePassword,
    },
  });
});
