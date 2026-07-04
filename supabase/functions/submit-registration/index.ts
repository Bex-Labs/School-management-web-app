import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEFAULT_STAFF_PASSWORD = "Staff@123";
const DEFAULT_STUDENT_PASSWORD = "Student@123";
const DEFAULT_PARENT_PASSWORD = "Parent@123";

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

function normalizeType(value: unknown) {
  return String(value || "").trim().toLowerCase() === "staff" ? "staff" : "student";
}

function normalizeLevelToken(value: unknown) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\bjss\b/g, "junior secondary school")
    .replace(/\bsss\b/g, "senior secondary school")
    .replace(/\bss\b/g, "senior secondary school")
    .replace(/\s+/g, " ")
    .replace(/[^a-z0-9]+/g, "");
}

function getClassDisplayName(record: Record<string, unknown>) {
  const level = String(record.level || "").trim();
  const name = String(record.name || "").trim();

  if (level && name && normalizeLevelToken(level) !== normalizeLevelToken(name)) {
    return `${level} ${name.replace(/^Arm\s+/i, "")}`.trim();
  }

  return level || name || "Class";
}

function composeFullName(payload: Record<string, unknown>) {
  const provided = String(payload.fullName || payload.displayName || "").trim();
  if (provided) return provided;
  return [payload.firstName, payload.middleName, payload.lastName]
    .map((entry) => String(entry || "").trim())
    .filter(Boolean)
    .join(" ")
    .trim();
}

function buildDisplayName(email: string) {
  return String(email || "")
    .split("@")[0]
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function resolveProvider(user: Record<string, unknown> | null) {
  const identities = Array.isArray(user?.identities) ? (user?.identities as Record<string, unknown>[]) : [];
  const providers = new Set(
    identities
      .map((identity) => String(identity?.provider || "").trim().toLowerCase())
      .filter(Boolean),
  );
  return providers.has("google") ? "google" : "password";
}

async function findAuthUserByEmail(
  serviceClient: ReturnType<typeof createClient>,
  normalizedEmail: string,
) {
  let page = 1;
  const perPage = 200;

  while (page <= 20) {
    const { data, error } = await serviceClient.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    const found = (data?.users || []).find(
      (user) => String(user.email || "").trim().toLowerCase() === normalizedEmail,
    );
    if (found) return found;
    if ((data?.users || []).length < perPage) break;
    page += 1;
  }

  return null;
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

  if (error) throw error;

  const normalizedWorkspace = normalizeWorkspaceId(workspaceId);
  const candidates = (Array.isArray(data) ? data : []).filter((row) => {
    const emailWorkspace = normalizeWorkspaceId(String(row?.email || ""));
    return emailWorkspace === normalizedWorkspace;
  });

  if (!candidates.length) return null;

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

  if (adminError) throw adminError;
  if (Array.isArray(admins) && admins[0]?.id) return String(admins[0].id);

  const { data: fallback, error: fallbackError } = await serviceClient
    .from("profiles")
    .select("id, created_at")
    .eq("institution_id", institutionId)
    .order("created_at", { ascending: true })
    .limit(1);

  if (fallbackError) throw fallbackError;
  return String((Array.isArray(fallback) ? fallback[0]?.id : "") || "").trim() || null;
}

async function getInstitutionContext(
  serviceClient: ReturnType<typeof createClient>,
  workspaceId: string,
  institutionIdFromRequest = "",
) {
  let institutionId = String(institutionIdFromRequest || "").trim();

  if (institutionId) {
    const { data, error } = await serviceClient
      .from("institutions")
      .select("id, name, has_nursery, has_higher_institution")
      .eq("id", institutionId)
      .maybeSingle();
    if (error) throw error;
    if (!data?.id) return null;
    return {
      institutionId: String(data.id),
      schoolName: String(data.name || "School").trim() || "School",
      schoolTypes: getSchoolTypesFromInstitution(data),
    };
  }

  institutionId = (await resolveInstitutionIdByWorkspace(serviceClient, workspaceId)) || "";
  if (!institutionId) return null;

  const { data, error } = await serviceClient
    .from("institutions")
    .select("id, name, has_nursery, has_higher_institution")
    .eq("id", institutionId)
    .maybeSingle();
  if (error) throw error;
  if (!data?.id) return null;

  return {
    institutionId: String(data.id),
    schoolName: String(data.name || "School").trim() || "School",
    schoolTypes: getSchoolTypesFromInstitution(data),
  };
}

function getSchoolTypesFromInstitution(institution: Record<string, unknown>) {
  return [
    institution.has_nursery ? "nursery" : null,
    "primary",
    "secondary",
    institution.has_higher_institution ? "higher" : null,
  ].filter(Boolean);
}

async function getActiveClasses(serviceClient: ReturnType<typeof createClient>, institutionId: string) {
  const { data, error } = await serviceClient
    .from("classes")
    .select("id, record_id, name, level, capacity, status")
    .eq("institution_id", institutionId)
    .eq("status", "active")
    .order("level", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw error;

  return (Array.isArray(data) ? data : [])
    .map((record) => ({
      id: String(record?.record_id || record?.id || "").trim(),
      name: String(record?.name || "").trim(),
      level: String(record?.level || "").trim(),
      label: getClassDisplayName(record as Record<string, unknown>),
      capacity: Number.parseInt(String(record?.capacity || ""), 10) || 0,
    }))
    .filter((record) => record.id && (record.level || record.label));
}

function getLevelsFromClasses(classes: Array<Record<string, unknown>>) {
  const seen = new Set<string>();
  const levels: string[] = [];

  classes.forEach((record) => {
    const level = String(record.level || record.label || "").trim();
    const token = normalizeLevelToken(level);
    if (!level || seen.has(token)) return;
    seen.add(token);
    levels.push(level);
  });

  return levels.sort((left, right) => left.localeCompare(right, undefined, { numeric: true }));
}

function chooseClassForLevel(
  classes: Array<Record<string, unknown>>,
  students: Array<Record<string, unknown>>,
  levelValue: string,
) {
  const levelToken = normalizeLevelToken(levelValue);
  const matchingClasses = classes.filter((record) => {
    const tokens = [
      normalizeLevelToken(record.level),
      normalizeLevelToken(record.label),
      normalizeLevelToken(`${record.level || ""} ${record.name || ""}`),
    ].filter(Boolean);
    return tokens.includes(levelToken);
  });

  if (!matchingClasses.length) return null;

  const counts = matchingClasses.map((record) => {
    const classId = String(record.id || "").trim();
    const classToken = normalizeLevelToken(record.label || record.level);
    const count = students.filter((student) => {
      const payload = student.payload && typeof student.payload === "object" ? student.payload as Record<string, unknown> : {};
      const studentClassId = String(payload.classId || payload.classRecordId || "").trim();
      if (classId && studentClassId === classId) return true;
      return normalizeLevelToken(payload.level || student.level) === classToken;
    }).length;
    return { record, count };
  });
  const minCount = Math.min(...counts.map((entry) => entry.count));
  const candidates = counts.filter((entry) => entry.count === minCount).map((entry) => entry.record);

  return candidates[Math.floor(Math.random() * candidates.length)] || matchingClasses[0] || null;
}

function generateAdmissionNumber(levelValue: string, students: Array<Record<string, unknown>>, schoolName: string) {
  const words = String(schoolName || "SchoolSphere")
    .toLowerCase()
    .split(/[^a-z0-9]+/g)
    .filter(Boolean);
  const acronym = (words.length >= 2
    ? words.slice(0, 3).map((word) => word.charAt(0)).join("")
    : (words[0] || "sch").slice(0, 3)
  ).padEnd(3, "x");
  const yearCode = String(new Date().getFullYear()).slice(-2);
  const levelCode = normalizeLevelToken(levelValue) || "general";
  const prefix = `${acronym}${yearCode}/${levelCode}`;
  const used = new Set(
    students
      .map((student) => {
        const payload = student.payload && typeof student.payload === "object" ? student.payload as Record<string, unknown> : {};
        return String(payload.admissionNo || student.admission_no || "").trim().toLowerCase();
      })
      .filter(Boolean),
  );
  let sequence = 1;
  let candidate = `${prefix}/${String(sequence).padStart(3, "0")}`.toLowerCase();

  while (used.has(candidate)) {
    sequence += 1;
    candidate = `${prefix}/${String(sequence).padStart(3, "0")}`.toLowerCase();
  }

  return candidate;
}

async function upsertAccessGrant(
  serviceClient: ReturnType<typeof createClient>,
  {
    institutionId,
    createdBy,
    workspaceId,
    email,
    role,
    authMethod,
    userId,
  }: {
    institutionId: string;
    createdBy: string;
    workspaceId: string;
    email: string;
    role: string;
    authMethod: string;
    userId?: string;
  },
) {
  const normalizedEmail = email.trim().toLowerCase();
  const now = new Date().toISOString();
  const { error } = await serviceClient.from("access_grants").upsert(
    {
      institution_id: institutionId,
      record_id: `${role.toLowerCase()}:${normalizedEmail}`,
      email,
      normalized_email: normalizedEmail,
      role_key: role,
      auth_method: authMethod,
      status: "active",
      workspace_id: workspaceId,
      claimed_at: userId ? now : null,
      claimed_by_user_id: userId || null,
      payload: {
        id: `${role.toLowerCase()}:${normalizedEmail}`,
        email,
        normalizedEmail,
        role,
        authMethod,
        status: "active",
        workspaceId,
        claimedAt: userId ? now : "",
        claimedByUserId: userId || "",
      },
      created_by: createdBy,
      updated_at: now,
    },
    { onConflict: "institution_id,normalized_email,role_key" },
  );

  if (error) throw error;
}

async function provisionRegistrationUser(
  serviceClient: ReturnType<typeof createClient>,
  {
    institutionId,
    createdBy,
    workspaceId,
    email,
    displayName,
    role,
    password,
    metadata = {},
  }: {
    institutionId: string;
    createdBy: string;
    workspaceId: string;
    email: string;
    displayName: string;
    role: "Teacher" | "Student" | "Parent";
    password: string;
    metadata?: Record<string, unknown>;
  },
) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  if (!normalizedEmail || !EMAIL_REGEX.test(normalizedEmail)) {
    return null;
  }

  let authUser = await findAuthUserByEmail(serviceClient, normalizedEmail);
  let status = "updated";

  if (!authUser) {
    const { data, error } = await serviceClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        display_name: displayName,
        role,
        workspace_id: workspaceId,
        must_change_password: true,
        ...metadata,
      },
    });
    if (error) throw error;
    authUser = data.user;
    status = "created";
  }

  const provider = resolveProvider(authUser as unknown as Record<string, unknown>);
  if (provider === "google" && status !== "created") {
    status = "existing_google";
  }

  const { error: profileError } = await serviceClient.from("profiles").upsert(
    {
      id: authUser?.id,
      display_name: displayName,
      email,
      role,
      institution_id: institutionId,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );
  if (profileError) throw profileError;

  await upsertAccessGrant(serviceClient, {
    institutionId,
    createdBy,
    workspaceId,
    email,
    role,
    authMethod: provider === "google" ? "google" : "password",
    userId: authUser?.id,
  });

  return {
    status,
    id: authUser?.id,
    email: authUser?.email || email,
    displayName,
    role,
    provider,
    workspaceId,
    mustChangePassword: true,
    ...metadata,
  };
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

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return jsonResponse(500, { ok: false, message: "Registration function secrets are missing." });
  }

  const incomingApiKey = String(request.headers.get("apikey") || "").trim();
  if (!incomingApiKey || incomingApiKey !== anonKey) {
    return jsonResponse(401, { ok: false, message: "Invalid API key for registration." });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return jsonResponse(400, { ok: false, message: "Invalid JSON payload." });
  }

  const action = String(body.action || "submit").trim().toLowerCase();
  const registrationType = normalizeType(body.type);
  const workspaceId = normalizeWorkspaceId(body.workspaceId || "");
  const institutionIdFromRequest = String(body.institutionId || "").trim();

  if (!workspaceId || workspaceId === "public") {
    return jsonResponse(400, {
      ok: false,
      message: "Missing workspace identifier. Use the official registration link from the school.",
    });
  }

  const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  let institutionContext;
  try {
    institutionContext = await getInstitutionContext(serviceClient, workspaceId, institutionIdFromRequest);
  } catch {
    return jsonResponse(500, { ok: false, message: "Could not resolve the school workspace." });
  }

  if (!institutionContext) {
    return jsonResponse(404, {
      ok: false,
      message: "School workspace was not found. Please request a fresh registration link.",
    });
  }

  const { institutionId, schoolName, schoolTypes } = institutionContext;

  if (action === "config") {
    try {
      const classes = await getActiveClasses(serviceClient, institutionId);
      return jsonResponse(200, {
        ok: true,
        institutionId,
        workspaceId,
        schoolName,
        schoolTypes,
        type: registrationType,
        classes,
        levels: getLevelsFromClasses(classes),
      });
    } catch {
      return jsonResponse(500, { ok: false, message: "Could not load school registration options." });
    }
  }

  let createdBy = "";
  try {
    createdBy = (await resolveCreatedBy(serviceClient, institutionId)) || "";
  } catch {
    return jsonResponse(500, { ok: false, message: "Could not find the school administrator." });
  }

  if (!createdBy) {
    return jsonResponse(400, {
      ok: false,
      message: "No administrator profile is linked to this workspace yet.",
    });
  }

  const rawPayload =
    body.payload && typeof body.payload === "object" && !Array.isArray(body.payload)
      ? body.payload as Record<string, unknown>
      : {};
  const now = new Date().toISOString();

  if (registrationType === "staff") {
    const prefix = String(rawPayload.prefix || "").trim();
    const firstName = String(rawPayload.firstName || "").trim();
    const lastName = String(rawPayload.lastName || "").trim();
    const displayName = String(
      rawPayload.displayName ||
        rawPayload.fullName ||
        [prefix, firstName, lastName].filter(Boolean).join(" "),
    ).trim();
    const email = String(rawPayload.email || "").trim();
    const phone = String(rawPayload.phone || "").trim();
    const schoolType = String(rawPayload.schoolType || "").trim();
    const faculty = String(rawPayload.faculty || "").trim();
    const department = String(rawPayload.department || "").trim();
    const title = String(rawPayload.title || "").trim();

    if (!firstName || !lastName) {
      return jsonResponse(400, { ok: false, message: "Staff first and last name are required." });
    }
    if (!email || !EMAIL_REGEX.test(email)) {
      return jsonResponse(400, { ok: false, message: "A valid staff email is required." });
    }

    try {
      const user = await provisionRegistrationUser(serviceClient, {
        institutionId,
        createdBy,
        workspaceId,
        email,
        displayName,
        role: "Teacher",
        password: DEFAULT_STAFF_PASSWORD,
        metadata: {
          prefix,
          firstName,
          lastName,
          staff_prefix: prefix,
          staff_first_name: firstName,
          staff_last_name: lastName,
          phone,
          school_type: schoolType,
          faculty,
          department,
          title,
          staff_profile_managed: true,
          source: "self-registration",
        },
      });

      return jsonResponse(200, {
        ok: true,
        status: user?.status || "created",
        institutionId,
        workspaceId,
        user,
        record: {
          prefix,
          firstName,
          lastName,
          displayName,
          email,
          phone,
          schoolType,
          faculty,
          department,
          title,
          source: "self-registration",
          createdAt: now,
          updatedAt: now,
        },
      });
    } catch (error) {
      return jsonResponse(500, {
        ok: false,
        message: error instanceof Error ? error.message : "Could not create this staff account.",
      });
    }
  }

  const firstName = String(rawPayload.firstName || "").trim();
  const lastName = String(rawPayload.lastName || "").trim();
  const fullName = composeFullName(rawPayload);
  const studentEmail = String(rawPayload.studentEmail || rawPayload.email || "").trim();
  const profilePhotoUrl = String(rawPayload.profilePhotoUrl || "").trim();
  const level = String(rawPayload.level || "").trim();
  const guardianName = String(rawPayload.guardianName || rawPayload.guardianFullName || "").trim();
  const guardianRelationship = String(rawPayload.guardianRelationship || "Guardian").trim();
  const guardianPhone = String(rawPayload.guardianPhone || "").trim();
  const guardianEmail = String(rawPayload.guardianEmail || "").trim();
  const guardianAddress = String(rawPayload.guardianAddress || "").trim();

  if (!firstName || !lastName || !fullName) {
    return jsonResponse(400, { ok: false, message: "Student first and last name are required." });
  }
  if (!level) {
    return jsonResponse(400, { ok: false, message: "Level or class is required." });
  }
  if (studentEmail && !EMAIL_REGEX.test(studentEmail)) {
    return jsonResponse(400, { ok: false, message: "Student email format is invalid." });
  }
  if (!guardianName || !guardianRelationship || !guardianPhone) {
    return jsonResponse(400, {
      ok: false,
      message: "Parent/guardian name, relationship, and phone number are required.",
    });
  }
  if (guardianEmail && !EMAIL_REGEX.test(guardianEmail)) {
    return jsonResponse(400, { ok: false, message: "Guardian email format is invalid." });
  }

  try {
    const classes = await getActiveClasses(serviceClient, institutionId);
    const { data: existingStudents, error: studentReadError } = await serviceClient
      .from("students")
      .select("record_id, admission_no, level, payload")
      .eq("institution_id", institutionId)
      .eq("status", "active")
      .limit(5000);

    if (studentReadError) throw studentReadError;

    const selectedClass = chooseClassForLevel(classes, Array.isArray(existingStudents) ? existingStudents : [], level);
    const baseLevel = String(selectedClass?.level || level).trim();
    const exactLevel = selectedClass ? getClassDisplayName(selectedClass) : level;
    const classId = String(selectedClass?.id || "").trim();
    const admissionNo = String(rawPayload.admissionNo || "").trim() ||
      generateAdmissionNumber(level, Array.isArray(existingStudents) ? existingStudents : [], schoolName);
    const recordId = String(rawPayload.id || crypto.randomUUID()).trim() || crypto.randomUUID();
    const guardians = [
      {
        id: crypto.randomUUID(),
        name: guardianName,
        relationship: guardianRelationship,
        phone: guardianPhone,
        email: guardianEmail,
        address: guardianAddress,
      },
    ];
    const normalizedPayload = {
      id: recordId,
      firstName,
      lastName,
      fullName,
      studentEmail,
      profilePhotoUrl,
      profilePhotoName: profilePhotoUrl ? String(rawPayload.profilePhotoName || "Profile picture").trim() : "",
      profilePhotoMimeType: profilePhotoUrl ? String(rawPayload.profilePhotoMimeType || "").trim() : "",
      profilePhotoSizeBytes: profilePhotoUrl ? Number(rawPayload.profilePhotoSizeBytes || 0) || 0 : 0,
      profilePhotoRemoved: false,
      admissionNo,
      level: exactLevel,
      classLevel: baseLevel,
      baseLevel,
      classId,
      classRecordId: classId,
      classArm: String(selectedClass?.name || "").trim(),
      dateOfBirth: String(rawPayload.dateOfBirth || "").trim(),
      gender: String(rawPayload.gender || "").trim(),
      guardians,
      status: "active",
      source: "self-registration",
      createdAt: now,
      updatedAt: now,
    };

    const { error: upsertError } = await serviceClient.from("students").upsert(
      {
        institution_id: institutionId,
        record_id: recordId,
        first_name: firstName,
        last_name: lastName,
        full_name: fullName,
        admission_no: admissionNo,
        level: exactLevel,
        date_of_birth: normalizedPayload.dateOfBirth || null,
        gender: normalizedPayload.gender || null,
        guardians,
        progression_history: [],
        documents: [],
        status: "active",
        payload: normalizedPayload,
        created_by: createdBy,
        created_at: now,
        updated_at: now,
      },
      { onConflict: "institution_id,record_id" },
    );

    if (upsertError) throw upsertError;

    let studentUser = null;
    let guardianUser = null;
    const provisioningWarnings: string[] = [];

    if (studentEmail) {
      try {
        studentUser = await provisionRegistrationUser(serviceClient, {
            institutionId,
            createdBy,
            workspaceId,
            email: studentEmail,
            displayName: fullName,
            role: "Student",
            password: DEFAULT_STUDENT_PASSWORD,
            metadata: {
              admission_no: admissionNo,
              student_record_id: recordId,
              student_profile_managed: true,
              source: "self-registration",
            },
          });
      } catch (error) {
        provisioningWarnings.push(
          error instanceof Error ? error.message : "Student login could not be created.",
        );
      }
    }

    if (guardianEmail) {
      try {
        guardianUser = await provisionRegistrationUser(serviceClient, {
          institutionId,
          createdBy,
          workspaceId,
          email: guardianEmail,
          displayName: guardianName || buildDisplayName(guardianEmail),
          role: "Parent",
          password: DEFAULT_PARENT_PASSWORD,
          metadata: {
            phone: guardianPhone,
            parent_profile_managed: true,
            source: "self-registration",
          },
        });
      } catch (error) {
        provisioningWarnings.push(
          error instanceof Error ? error.message : "Guardian login could not be created.",
        );
      }
    }

    return jsonResponse(200, {
      ok: true,
      status: "created",
      institutionId,
      workspaceId,
      record: normalizedPayload,
      user: studentUser,
      guardianUsers: guardianUser ? [guardianUser] : [],
      warnings: provisioningWarnings,
    });
  } catch (error) {
    return jsonResponse(500, {
      ok: false,
      message: error instanceof Error ? error.message : "Could not create this student record.",
    });
  }
});
