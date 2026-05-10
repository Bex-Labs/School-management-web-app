# SchoolSphere

SchoolSphere is now a multi-page school management website concept with a white
and sky-blue theme, a centered dropdown navigation, separate exploration pages,
and a working prototype onboarding flow for registration, login, email
confirmation, and institutional Google sign-in.

## Main pages

- [index.html](/Users/Abbas/Downloads/school-management-web-app/index.html): homepage with the screen-wide hero
- [products.html](/Users/Abbas/Downloads/school-management-web-app/products.html): fuller products overview page
- [why-it-works.html](/Users/Abbas/Downloads/school-management-web-app/why-it-works.html): reasons and product positioning
- [workflows.html](/Users/Abbas/Downloads/school-management-web-app/workflows.html): admissions, classroom, bursary, and university workflows
- [modules.html](/Users/Abbas/Downloads/school-management-web-app/modules.html): module shelf
- [school-types.html](/Users/Abbas/Downloads/school-management-web-app/school-types.html): preschool to university views
- [in-practice.html](/Users/Abbas/Downloads/school-management-web-app/in-practice.html): usage scenarios
- [login.html](/Users/Abbas/Downloads/school-management-web-app/login.html): login flow prototype
- [signup.html](/Users/Abbas/Downloads/school-management-web-app/signup.html): registration flow prototype
- [confirm-email.html](/Users/Abbas/Downloads/school-management-web-app/confirm-email.html): email confirmation step
- [portal.html](/Users/Abbas/Downloads/school-management-web-app/portal.html): signed-in landing page

## Shared files

- [styles.css](/Users/Abbas/Downloads/school-management-web-app/styles.css): shared theme and layout
- [app.js](/Users/Abbas/Downloads/school-management-web-app/app.js): shared header, footer, dropdowns, and page content rendering
- [auth.js](/Users/Abbas/Downloads/school-management-web-app/auth.js): client-side onboarding and authentication prototype logic

## What changed in this version

- Restored the white and sky-blue visual direction
- Softened the nav background so it keeps the blue-tinted glass look instead of flat white
- Rebuilt the header so the logo sits on the far left, the dropdown nav sits in the middle, and login/sign-up buttons sit on the far right
- Swapped page roles so the home page now uses the full-bleed hero and the products page carries the richer overview layout
- Split the old homepage sections into separate pages
- Kept the structure close to the public eSkooly homepage pattern while preserving your school management content
- Added working prototype behavior for email/password signup and login, duplicate-email detection, email confirmation links, invalid-input errors, and institutional Google sign-in

## Open locally

You can open [index.html](/Users/Abbas/Downloads/school-management-web-app/index.html) directly in a browser.

If you want to serve the whole site locally:

```bash
cd /Users/Abbas/Downloads/school-management-web-app
python3 -m http.server 8080
```

Then open `http://localhost:8080`.
