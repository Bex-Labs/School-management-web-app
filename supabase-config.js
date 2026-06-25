const schoolSphereAppBaseUrl = new URL("./", window.location.href).toString();

window.SchoolSphereSupabaseConfig = {
  // Set to true after you add your real project values below.
  enableSupabaseAuth: true,

  // Example: "https://your-project-ref.supabase.co"
  url: "https://siebhthveigejomwuymt.supabase.co",

  // Use the public / publishable anon key from Project Settings -> API.
  anonKey: "sb_publishable_EqDd4brc13AWbX7obHOh6Q_GcfGKeTI",

  // Keep redirects in the same folder the app is being served from.
  siteUrl: schoolSphereAppBaseUrl,
  redirectPath: "portal.html",
  emailRedirectPath: "login.html",
  userProvisionFunctionName: "provision-user",
  admissionsSubmitFunctionName: "submit-admission",
  accountDeleteFunctionName: "delete-school-account",
  paystackPublicKey: "pk_test_01b1969efc43b8ce820e4e3dd64d87ac737719bc",

  // ─────────────────────────────────────────────────────────────────────────
  // IMPORTANT — Supabase dashboard setup for password reset emails
  // ─────────────────────────────────────────────────────────────────────────
  //
  // The reset-password email link will NOT work until you whitelist the
  // redirect URL in your Supabase project dashboard:
  //
  //   1. Go to: Authentication → URL Configuration → Redirect URLs
  //   2. Click "Add URL" and add ALL of the following:
  //
  //        http://localhost:5500/School-management-web-app/reset-password.html
  //        http://127.0.0.1:5500/School-management-web-app/reset-password.html
  //        https://yourdomain.com/School-management-web-app/reset-password.html
  //
  //   3. Save, then test the flow again.
  //
  // Use the exact URL shown in your browser, including the project folder,
  // and replace "forgot-password.html" with "reset-password.html".
  //
  // ─────────────────────────────────────────────────────────────────────────
};
