# Baseline and regression checklist

Snapshot: 2026-10-02; HEAD e1eb094 on main. This task documents a future refactor. No application, browser session, remote API or database was used to run an end-to-end workflow.

## Status definitions

- **PASS**: the specifically described check ran and passed. A source check is not a browser or production pass.
- **FAIL — pre-existing**: a reproducible failure observed before extraction, left unchanged.
- **NOT TESTED**: required behavior has not been exercised; source presence alone is insufficient.
- **BLOCKED**: record the concrete missing prerequisite when a future attempt cannot run. Do not silently promote it to PASS.

## Planning-stage checks (historical; before E01)

| Check | Result | Evidence and limit |
| --- | --- | --- |
| Applicable instructions | PASS | No AGENTS.md found in repository/ancestor scan; user constraints govern. |
| Existing working tree | PASS | Read-only git status eventually returned only “## main...origin/main”; clean before documentation. HEAD e1eb094. Earlier attempts stalled and were interrupted. |
| Staged/untracked baseline | PASS | git diff-index --cached --name-status HEAD and git ls-files --others --exclude-standard returned no changes before docs. |
| Browser JS syntax | PASS | Acorn and Babel parsed app.js, auth.js, self-registration-links.js, supabase-config.js as classic scripts without execution. |
| Inline syntax: admin-settings | PASS | Both parsers accepted the redirect script. Redirect behavior not browser-tested. |
| Inline syntax: admin-messages | PASS | Both parsers accepted the script. Its early return disables the inbox code; parse success does not mean active functionality. |
| Inline syntax: contact | FAIL — pre-existing | Both parsers reject inline script line 53, corresponding to contact.html:958, at the unescaped apostrophe in the success string. Entire inline script fails parsing. |
| HTML script manifest | PASS | Inspected all 58 root HTML files and 157 external script tags; all referenced local script files exist after stripping query strings. No async/defer/module attributes found. Does not verify HTTP delivery. |
| Supabase source syntax | PASS | Babel TypeScript parser accepted all four function sources. Not Deno type-checking or hosted gateway verification. |
| Inventory coverage | PASS | AST inventory has 1,222 direct declarations (318 app, 893 auth IIFE, 10 link IIFE, 1 config), 19 explicit window.SchoolSphere objects including config, 32 CustomEvent constructions and 423 listener/timer/subscription/cleanup sites in parsable scripts. |
| First-candidate isolated behavior | PASS | Executed only renderWhyGrid in a Node VM with a fake document: missing target returns safely; synthetic title/copy render; empty input clears the target. No app bootstrap, storage or network executed. Not a visual test or full markup equivalence proof. |
| Existing application source preservation | PASS | SHA-256 comparison of 63 root HTML/JS/CSS files and four function sources found no changes. Final read-only git status shows only the new docs/ directory; no tracked application changes. |
| Documentation integrity | PASS | All four saved documents match the prepared text, all 1,222 inventoried declaration names are present, and scans found no JWT-like values, key literals or email addresses. This is a focused content check, not a general secret-scanner audit. |
| Browser UI baseline | NOT TESTED | No browser baseline run in this documentation task. |
| Authentication/database baseline | NOT TESTED | No login, provisioning, synchronization, payments or database writes attempted. |

No package.json or source test/spec files were found. There is no discovered project test command to claim as passed. Installed parsers were reused without installing packages.

## Existing observations to keep separate from regressions

1. **contact.html:958** has a confirmed syntax defect. It is outside this documentation stage and must not be silently fixed in a code-movement commit. Record a separate fix/checkpoint if later requested. Until then, public-site acceptance must disclose this known failure.
2. Contact submission is a 1,200 ms simulated success flow in source; there is no demonstrated message delivery. Do not write a test expecting real delivery.
3. admin-messages.html's old inline inbox is disabled by an early return. Do not activate it during cleanup; its dormant behavior is not the live messaging implementation.
4. auth.js and self-registration-links.js both wire registration links. Their overlap and timing are risks to investigate, not a confirmed runtime regression.
5. Workspace-resolution fallback orders differ between app.js, auth.js and the link companion. Preserve existing algorithms until a separate consolidation is justified.
6. Server school deletion returns HTTP 207 with ok:true on partial failure. Do not collapse partial into complete success.
7. SQL policies and Edge-function source are not proof of currently deployed database policy or gateway settings.

## Test setup for a future implementation stage

Use a disposable browser profile with synthetic records. Use local/in-memory mocks for a storage/UI-only extraction. Backend acceptance needs a dedicated non-production environment and authorized test accounts; this checklist is not permission to mutate production.

Prepare fixtures for two schools A/B, Admin, Teacher with assigned/unassigned classes, Student, Parent with two children, Super Admin, restricted/deactivated accounts, and empty/populated workspace states. Record the baseline snapshot and expected behavior without storing personal data, passwords or tokens in this documentation.

Preserve pre-test storage in the disposable profile. Run through HTTP rather than file://. Record desktop/mobile viewport, console errors, failed requests, selected account role, expected outcome and actual outcome. Do not attach raw authenticated request headers or personal data.

## Public pages and shared shell

| ID | Workflow and expected comparison | Status |
| --- | --- | --- |
| P01 | Open index, products, workflows, modules, school-types, why-it-works and in-practice directly and via navigation; same headings, cards, links and active state. | NOT TESTED |
| P02 | Desktop/mobile header, menu open/close and outside click, footer and school branding match baseline. | NOT TESTED |
| P03 | Theme before and after reload, saved dark/light preference, no new theme flash. | NOT TESTED |
| P04 | Contact accordion and submit validation compared against disclosed existing syntax failure; no claim of real delivery. | NOT TESTED |
| P05 | Google verification file stays at its exact path with unchanged contents. | NOT TESTED |
| P06 | Every HTML entry in contracts.md loads scripts once, in order, without new console errors or missing files. | NOT TESTED |

## Authentication, access and identity

| ID | Workflow and expected comparison | Status |
| --- | --- | --- |
| A01 | Email/password login for each role, invalid credentials and wrong-role selection; same error/redirect behavior. | NOT TESTED |
| A02 | Persistent versus tab-session login, reload, new tab, browser restart, logout; same storage precedence. | NOT TESTED |
| A03 | Signup, confirmation, existing account, confirmation link replay/expiry. | NOT TESTED |
| A04 | Forgot/reset password for existing supported modes: token, code and recovery hash; expired/invalid links and required password change. | NOT TESTED |
| A05 | Google sign-in callback, role/grant resolution, provider-specific behavior and cancelled/failed flow. | NOT TESTED |
| A06 | Owner access and Super Admin routing; ordinary roles cannot access owner-only screens. | NOT TESTED |
| A07 | Direct protected-page navigation while logged out, permission disabled, module disabled or account deactivated. Compare page and action guards. | NOT TESTED |
| A08 | Student admission-number login and parent guardian-email workspace alignment choose expected record/school. | NOT TESTED |
| A09 | Remote service failure/timeout and local fallback match baseline without premature redirects or duplicate initialization. | NOT TESTED |

## Administrative features

| ID | Workflow and expected comparison | Status |
| --- | --- | --- |
| F01 | Students: create/edit, guardian relationships/accounts, documents/photo, import/export, promotion/transfer/archive, selected/bulk operations using disposable records. | NOT TESTED |
| F02 | Admissions: public URL/QR, school branding, steps/review, 200 KB attachment limit/removal, submit, edit, approve/convert, reject/history; preserve IDs and linkage. | NOT TESTED |
| F03 | Teachers: create/edit/provision, department/role metadata, job letter preview/print, archive/status; permissions remain enforced. | NOT TESTED |
| F04 | Classes: school-type templates, levels/arms, subject/teacher assignment, student/attendance/results detail modals. | NOT TESTED |
| F05 | Courses: faculty/department/subject choices, class/arm/teacher associations, academic period and archive behavior. | NOT TESTED |
| F06 | Timetable: period/room/teacher conflicts, class assignment, week types, copy term, publish/unpublish, substitution, print. | NOT TESTED |
| F07 | Academic sessions/terms: create/edit/status and dependent selections; calendar events/conflicts and dashboard refresh. | NOT TESTED |
| F08 | Attendance: status entry/edit, class/date/lesson scoping, summaries, absence notifications and grouped reports. | NOT TESTED |
| F09 | Fees: catalog/categories, invoice generation, transactions/balances, receipts/print/PDF and parent/student balance consistency. No live payment. | NOT TESTED |
| F10 | Gradebook/results: components, totals, grading settings, teacher assignment permissions, save/reload and report release rules. | NOT TESTED |
| F11 | Reports: enrollment/academic calculations, period/class filters, report cards, CSV/PDF/print and comments. | NOT TESTED |
| F12 | Messaging: inbox/thread scope, unread/hide/reply, attachments, announcements/audience and notification preferences. Verify one action produces one message. | NOT TESTED |
| F13 | Settings: branding, school types, access grants, roles/permissions, module toggles and persisted academic/grading settings. | NOT TESTED |
| F14 | Self-registration: copy/open links, type/workspace query, missing/invalid workspace, remote config/submission and local fallback; verify no new duplicate listeners. | NOT TESTED |
| F15 | Account deletion: cancellation, invalid confirmation, denial for unauthorized roles, complete/partial response mapping. Mock responses first; actual deletion only in explicitly disposable environment. | NOT TESTED |
| F16 | Audit entries/onboarding/search/toasts/form drafts retain scope and behavior; no duplicate side effects. | NOT TESTED |

## Role-specific portals

| ID | Workflow and expected comparison | Status |
| --- | --- | --- |
| R01 | Teacher dashboard/classes/timetable, assigned attendance, lesson-plan create/duplicate, gradebook/results, leave request, messages/settings. | NOT TESTED |
| R02 | Teacher cannot access another teacher's unassigned record or an administrator-only action. | NOT TESTED |
| R03 | Student portal sections/hash navigation, own courses/timetable/attendance/fees/released reports/messages/profile. | NOT TESTED |
| R04 | Student cannot obtain another student's record through changed selection/hash/state. | NOT TESTED |
| R05 | Parent switches between linked children and sees correct teachers/courses/attendance/fees/reports/messages; selection persists. | NOT TESTED |
| R06 | Parent cannot access an unrelated child/school; chatbot summaries and preferences reflect selected child. | NOT TESTED |
| R07 | Super Admin schools/accounts/activity/search and actions match baseline; normal Admin remains school-scoped. | NOT TESTED |
| R08 | User/parent/staff settings, password updates, notification preferences, signout and mobile sidebar behavior. | NOT TESTED |

## Storage, synchronization and cross-feature acceptance

| ID | Workflow and expected comparison | Status |
| --- | --- | --- |
| S01 | Load existing-format synthetic local data and compare normalized shapes before/after extraction; IDs, aliases and key names unchanged. | NOT TESTED |
| S02 | Switch school A → B → A with both populated; no cross-school records, selected state, grants, notifications or draft leaks. | NOT TESTED |
| S03 | Single-colon collections, double-colon collections and shared access-grant merge preserve other-school data. | NOT TESTED |
| S04 | Save/reload and two-tab storage updates; one custom update in originating tab, correct refresh elsewhere. | NOT TESTED |
| S05 | Hydration emits its distinct payload, suppresses echo writes, preserves documented local fallback and exits hydration mode on errors. | NOT TESTED |
| S06 | 260 ms sync debounce, repeated rapid edits, one logical write per state; same Admin/Teacher eligibility. | NOT TESTED |
| S07 | Table-native adapters and workspace_states fallback preserve conflict keys, institution scope and report-card stale-row exception. | NOT TESTED |
| S08 | Existing migrations/legacy cleanup run only at their existing lifecycle point; no new clears or resets. | NOT TESTED |
| S09 | Network failure/reconnect/timeout, SDK/library load failure, offline local operation and draft recovery match baseline. | NOT TESTED |
| S10 | Student/class/attendance change propagates to relevant teacher, student, parent and report views; counts match. | NOT TESTED |
| S11 | Session callbacks, client/library caches, timers, listeners and subscriptions are not duplicated after startup/navigation. | NOT TESTED |

## Acceptance for extraction E01 only

1. Capture the existing why-it-works card markup and visual layout, plus behavior where the target does not exist.
2. Repeat the isolated helper checks using the same synthetic input and compare full innerHTML strings before/after, not only substring presence.
3. All 57 app.js consumers must load the extracted classic script exactly once immediately before app.js; preserve existing order and query strings on other scripts. Verification HTML remains untouched.
4. Load public pages plus a representative login/portal page over HTTP; no new missing-file/reference errors; no UI/style changes.
5. Compare app.js manager interfaces and startup calls to baseline; this step must not touch auth.js, configuration, persistence, Supabase or styles.
6. Record known contact failure separately. Do not describe the whole site as passing.
7. Review a narrow diff and update inventory location/status. Stop after E01, leaving the user to checkpoint through GitHub Desktop.

## Result log template

For each future run record: extraction ID; local revision/working state; check IDs; synthetic fixture role/school; expected vs actual; PASS/FAIL/NOT TESTED; console/network evidence with secrets redacted; touched paths; remaining risks; rollback checkpoint. A screenshot or syntax pass alone cannot substitute for data, access or synchronization checks.

## E01 result log

Scope: renderWhyGrid extraction only, from clean branch refactor/javascript-structure at pre-extraction HEAD 39ec400. No commit/push/deployment/database work. The original planning-stage PASS rows above describe that earlier stage, not current file counts.

| Check | Result | Evidence / limitation |
| --- | --- | --- |
| Working tree before extraction | PASS | Clean; branch refactor/javascript-structure tracking origin/refactor/javascript-structure. |
| Dependency/consumer audit | PASS | Helper uses parameters and document only. initPageContent is the sole callable consumer with two existing calls. Only why-page-grid is present in current HTML. All 57 app.js consumers need synchronous inclusion. |
| Exact function move | PASS | New file is byte-for-byte the original 19-line function plus final newline. app.js equals its baseline with only that declaration and following blank line removed (20 lines). |
| Full renderer output parity | PASS | Node VM comparison of exact innerHTML, lookup trace and write count for real three-card whyCards, empty input, one item, markup-containing text and eleven items. Each existing target receives one write. |
| Missing target | PASS | Both old/new return without reading a null items argument and without writing. |
| Page-content composition | PASS — isolated | Original/new renderer used with original initPageContent and synthetic document plus stubbed other renderers gives identical call order and HTML. This does not execute the full application or authenticate a portal. |
| Initialization ownership | PASS — static/isolated | New file has one function declaration only: no initializer/listener/timer. app.js retains its one top-level initPageContent call and the two existing renderWhyGrid calls. |
| All HTML entry points | PASS — source | 58 files checked; 57 contain exactly one new classic script directly before app.js. All original tag attributes, bodies, ordering and cache query strings are unchanged. Removing the single added line recreates each baseline HTML byte-for-byte. Verification HTML is unchanged. |
| Script delivery prerequisites | PASS — filesystem only | All 214 external references resolve locally; 157 original plus 57 helper inclusions. Actual HTTP delivery, MIME handling and browser/cache behavior are NOT TESTED. |
| JS syntax | PASS | Acorn parses app.js, auth.js, configuration, link companion and new helper as classic scripts. |
| Inline scripts | PASS for unchanged status | Original/new inline parse results identical. Contact still fails at relative inline line 53 (original HTML line 958, now 959 after script insertion). Other inline scripts parse; dormant inbox stays dormant. |
| Existing interfaces and unrelated code | PASS | app.js differs only by helper removal, preserving manager objects, other functions, data and startup text. auth.js/config/styles/backend files and all other non-target files match the captured baseline. |
| Browser appearance and navigation | NOT TESTED | Earlier browser access to localhost was explicitly blocked by browser network policy; no alternate browser surface or headless workaround used. Card layout has not been visually verified this turn. |
| Login/portal HTTP startup | NOT TESTED | No browser startup/session checks run; no database or account mutations made. Source loading order checked only. |

Changed paths: js/website/why-grid.js (new), app.js, the 57 HTML consumers listed in contracts.md, and all four refactoring documents. Code movement is complete; E01 browser acceptance is still outstanding. Do not infer full workflow acceptance from the static/isolated results.

Next manual checks: serve the repo using the usual local HTTP preview in an environment allowed to open it; check why-it-works.html card appearance, public navigation and a missing-target page, then login/portal startup and console/network errors. Expect the separately documented contact syntax error; do not fix it as part of E01. Do not proceed automatically to E02.

## E01 user-reported follow-up

After the documentation corrections, the user reported completing the manual E01 browser checklist and approved review of E02, then explicitly approved its bounded implementation. Treat E01 browser completion as user-reported only: no independent browser observation, console/network capture or detailed per-check evidence was supplied. Historical NOT TESTED entries above describe the agent's own execution, not a new browser pass.

## E02 result log

Scope: renderPracticeGrid only, from clean refactor/javascript-structure at 7b1e613. No commit, push, deployment, database work or subsequent extraction.

| Check | Result | Evidence / limitation |
| --- | --- | --- |
| Dependency/consumer audit | PASS — source | Only document and parameters; two calls in initPageContent. Dataset, slice(0, 3), CSS and selectors retained. Only practice-page-grid exists in current HTML. |
| Exact function move | PASS | New 21-line function equals baseline byte-for-byte. app.js equals baseline with only that declaration and following blank line removed (22 lines). |
| Full renderer parity | PASS — isolated | Exact innerHTML, lookup and write traces match for first three real stories, all four stories, empty array, one story, markup-containing strings and eleven stories. One write per present target; zero at script definition. |
| Missing-target behavior | PASS — isolated | Null items with absent target returns safely; one lookup and no writes, equal to baseline. |
| Page-content composition | PASS — isolated | Original/current renderer with unchanged initPageContent, synthetic document and other renderers stubbed produces identical traces/HTML for a present practice-page-grid and for absent targets. Not a full app/browser startup test. |
| Initialization ownership | PASS — static | New file has one function declaration only, no initializer/listener/timer. Single top-level initPageContent call retained; its body and both practice calls are unchanged. |
| HTML entry points | PASS — source | All 58 HTML files checked. Exactly one practice-grid.js inclusion before why-grid.js and app.js on all 57 consumers. Removing the added line restores each original HTML byte-for-byte. Verification HTML unchanged. |
| Script paths | PASS — filesystem only | All 271 external references resolve locally (214 pre-E02 plus 57 new). HTTP status, MIME handling and browser cache remain NOT TESTED. |
| JavaScript syntax | PASS | All six browser JS files parse as classic scripts. |
| Inline syntax | PASS for unchanged status | Inline bodies and parse outcomes match baseline. Contact still fails at inline line 53, now HTML line 960; other inline scripts parse. This does not mark contact functionality as passing. |
| Other application files | PASS — source | No changes to why-grid.js, auth.js, configuration, registration companion, styles, assets or backend files. app.js manager interfaces, state, storage, permissions and startup are otherwise identical. |
| Documentation integrity | PASS — source | HTML ID catalog preserved byte-for-byte and all 1,009 listed IDs across 58 pages match current source. All 58 manifest rows match current tag order and line numbers; 12 shifted startup references and affected function/state locations were verified. |
| Scope and whitespace | PASS | Exactly app.js, 57 HTML files, four refactoring documents and one new renderer changed. All 33 other tracked files match 7b1e613; git diff --check passes. |
| E02 HTTP/visual/navigation | NOT TESTED | Earlier localhost browser access was policy-blocked; no bypass or alternate browser surface used. Requires manual desktop/mobile and console/network checks. |
| E02 login/portal startup | NOT TESTED | No authenticated session or account/database operations performed. Source loading checks only. |

Changed paths: app.js, new js/website/practice-grid.js, 57 HTML consumers in the current contracts manifest, and these four refactoring documents. The HTML ID catalog must remain unchanged; update only the separate script manifest and relevant source references.

Manual acceptance: serve over local HTTP; check three In Practice cards on desktop/mobile, Why It Works, public navigation and a missing-target page; check representative login/portal startup without submitting records; confirm practice-grid.js → why-grid.js → app.js load successfully once and no new console errors appear. Record any failure and the known contact exception separately. Stop before E03. Rollback only E02 hunks against 7b1e613 while preserving E01 and unrelated work.

## E02 user-reported follow-up

The user answered yes when asked whether E02 browser checks passed and whether to approve the proposed E03 scope. Record E02 browser acceptance as user-reported PASS, not an independently observed result. No detailed console/network evidence was supplied. Historical NOT TESTED entries remain the record of checks the agent did not run.

## E03 result log

Scope: whyCards dataset only, from clean refactor/javascript-structure at 1dd813e. No commit, push, deployment, database work or subsequent extraction.

| Check | Result | Evidence / limitation |
| --- | --- | --- |
| Dependency/consumer audit | PASS — source | Three literal records; only two reads in initPageContent. No detected mutation or external dependency. |
| Exact relocation | PASS | why-grid.js equals the original dataset plus a blank separator plus its unchanged renderer. app.js equals baseline with only the dataset declaration and following blank line removed (18 lines). |
| Single ownership and interfaces | PASS — static/isolated | Exactly one top-level whyCards declaration across six scripts. Later classic scripts can read it; no window.whyCards property. Renderer remains globally callable. const reassignment still fails; array/record mutation and shared array identity remain possible as before. Tests use disposable in-memory fixtures only. |
| Dataset and rendering | PASS — isolated | Original/new data serialization is identical. Exact HTML and lookup/write traces match for the two existing calls with present why-page-grid and with absent targets. No DOM work occurs during dataset/helper definition. |
| Page-content composition | PASS — isolated | Original/new dataset placement with unchanged initPageContent and stubbed other renderers has identical traces and HTML for present and absent Why targets. This is not a full browser/app test. |
| Loading and HTML | PASS — source | All 58 HTML files are byte-identical to baseline; 57 consumers retain synchronous practice-grid.js → why-grid.js → app.js order. why-grid.js is loaded once per consumer. All 271 external paths resolve locally. |
| JavaScript syntax | PASS | All six browser scripts parse as classic scripts. |
| Inline syntax | PASS for unchanged status | Unchanged HTML retains existing parse outcomes. Contact fails at inline line 53/current HTML line 960; other inline scripts parse. Contact functionality is not claimed to pass. |
| Documentation integrity | PASS — source | All 318 app/extracted-file declaration locations and 248 app startup references match current source; 803 source-line mapping checks passed. HTML ID catalog and script manifest are byte-identical to pre-E03. Historical logs retain their prior anchors. |
| Scope and whitespace | PASS | Only the two approved JS files and four refactoring documents changed. All 90 other tracked files match 1dd813e; no new files; git diff --check passes. |
| E03 browser acceptance | NOT TESTED | HTTP/cache delivery, desktop/mobile appearance, navigation and login/portal startup remain manual checks. Previous browser-policy restrictions were not bypassed. No account or database actions performed. |

Changes are limited to app.js, js/website/why-grid.js and these four documentation files. No new files or script references. References in the current inventory/contracts are adjusted for the 18-line move; prior execution logs retain explicitly historical source anchors. The HTML ID catalog and script manifest must remain unchanged.

Manual acceptance: use local HTTP preview to check Why It Works has the same three cards on desktop/mobile; check In Practice, Home, navigation and representative login/portal startup without submitting forms or records. Inspect console/network for new errors. Record the pre-existing contact error separately. Stop before E04. Rollback only E03 hunks against 1dd813e, preserving E01/E02 and unrelated work.

## E04 result log — 2026-10-03

Scope: app.js escapeHtml only, from clean refactor/javascript-structure at 28bf6cf. E03 is checkpointed but its browser acceptance was not separately confirmed. Approval to implement E04 is not recorded as a browser test result. No commit, push, deployment, database operation or later extraction performed.

| Check | Result | Evidence / limitation |
| --- | --- | --- |
| Dependency/consumer audit | PASS — source/scope | String and replaceAll only. Eight calls in buildBrandMarkHtml, renderHeader and renderFooter; no other direct binding references. No state, initializer or external integration dependency. |
| Exact function move | PASS | Eight-line helper matches pre-E04 bytes. Remaining app.js equals baseline after removing only that declaration and blank separator (nine lines). |
| Escaping semantics | PASS — isolated | Sixteen explicit expected-output cases cover undefined/null, empty/plain/Unicode strings, numbers/booleans/bigint/symbol, all five escaped characters, existing entities, arrays, custom conversion and URL-like strings. Throwing conversion still propagates. |
| Caller markup | PASS — isolated | Three header/footer composition fixtures compare exact HTML/traces for normal and special-character platform names, navigation paths/hash, absent targets and repeated render calls. Each also covers logo image, initial and empty-name fallback branding branches. This is not visual or full-app verification. |
| Private auth helper | PASS — source/scope | auth.js is byte-identical; its FunctionExpression/IIFE-local binding retains 1,371 references. Null/numeric inputs still throw there. No auth helper deduplication or caller changes. |
| Initialization and state | PASS — source/isolated | New file contains one declaration and no initialization work. App bootstrap, listeners, manager objects and all remaining function bodies are byte-identical. No constants or mutable state moved. |
| HTML entry points | PASS — source | All 58 HTML files compared. Each of 57 app consumers gains exactly one escape-html.js tag before practice-grid.js/why-grid.js/app.js. Removing that line reconstructs the baseline HTML exactly. Verification HTML unchanged. |
| Script paths and syntax | PASS — local/source | All 328 local external references resolve; all seven browser JS files parse as classic scripts. All 271 prior tags, inline bodies, attributes/query strings and relative ordering remain unchanged. No HTTP/MIME/cache claim. |
| Inline syntax | PASS for unchanged status | Contact retains its existing inline parse failure at relative line 53, now contact.html:961. Other inline scripts parse. Contact functionality remains a known failure, not an E04 regression. |
| Documentation integrity | PASS — source | All 318 app/extracted declaration locations and 248 app startup references match current source. All 58 manifest rows match current tags/lines. The HTML ID catalog is byte-identical to baseline, with all 1,009 IDs checked against 58 current pages. |
| Scope and whitespace | PASS | Only app.js, 57 HTML consumers, four refactoring documents and the new core helper changed. All 34 other tracked files match 28bf6cf. No other new files; git diff --check passes. |
| E04 browser acceptance | NOT TESTED | Desktop/mobile header/footer, navigation, branding and representative login/portal startup require manual HTTP preview checks. Previous browser-policy restrictions were not bypassed. No account/settings/record/database writes performed. |

Touched scope: app.js, new js/core/escape-html.js, 57 HTML consumers, and the four refactoring documents. Historical logs retain their prior source anchors; current inventory/contracts locations and the script manifest reflect E04. Preserve the HTML IDs catalog exactly.

Manual checks: open local HTTP preview, compare header/footer/branding and navigation on desktop/mobile, check Why It Works and In Practice, then representative login/portal startup without submitting forms or records. In console/network confirm one successful escape-html.js load before practice-grid.js → why-grid.js → app.js and no new errors. Keep the contact exception separate. Report outcomes before another stage. Stop before E05; rollback only E04 hunks against 28bf6cf and preserve earlier extractions.

## E04 requested checkpoint

On 2026-10-03 the user explicitly requested committing E04. The agent rechecked the scope, staged exactly the 63 E04 files and created local commit a06b420 (refactor: extract app HTML escaping helper (E04)). The working tree was clean afterward; no push occurred. This is a requested local checkpoint, not a newly observed browser pass. E03/E04 browser checks remain unverified in this record.

## E05 result log — approved cohesive offerings feature

Baseline: clean a06b420 after the E04 commit. The user explicitly approved moving the 203-line offerings feature together. The original storage step is deferred as E05-storage. Only E04 was authorized for a commit; E05 remains uncommitted. No push, deployment or database operations.

| Check | Result | Evidence / limitation |
| --- | --- | --- |
| Scope/dependencies | PASS — source/scope | Five declarations: offerings, activeOfferingId, renderOfferingPreviewGrid, renderOfferingTabs, renderWorkflowPage. Only document is external; no storage/auth/permissions/Supabase dependency. initPageContent is the only outside callable consumer; it also reads offerings. |
| Exact code preservation | PASS | All five declarations are byte-identical to baseline (203 code lines). New file is 207 lines with separators; app.js removes 208 original lines including separators. The rest of app.js is byte-identical, including startup/listeners/interfaces. |
| State and initialization | PASS — isolated/source | One dataset const and one selected-ID let; neither is a window property. Initial ID equals the first offering. Script evaluation performs no DOM lookup, writes or listener registration. Dataset initializes before selected state. Existing initPageContent body and invocation are retained. |
| Product/workflow output | PASS — isolated | Exact baseline HTML/traces match; both existing pages still display first three records in the original order. Empty, single and markup-containing preview fixtures also match. No escaping/content redesign included. |
| Tab interaction | PASS — synthetic | All five selection clicks update the same state/panel as baseline. Preview/workflow rendering does not reset the selection. Repeated tab renders leave one handler per current synthetic button. Invalid selection keeps original first-offering panel fallback without marking a tab active. |
| Absent-target guards | PASS — synthetic | Missing both tabs/panel, tabs-only and panel-only each produce no DOM writes or listeners. Missing preview accepts null items without reading it. Missing workflow target remains a no-op. |
| Startup composition | PASS — isolated | Four initPageContent fixtures (all absent, product target, workflow target, all synthetic targets) produce identical call/HTML traces with other renderers stubbed. Not a full browser/app run. |
| HTML/loading | PASS — source | All 58 HTML files compared. Each of 57 app consumers gains exactly one offerings.js tag before escape-html.js and existing renderers. Removing this line reconstructs each baseline HTML. Verification HTML and all prior tag bodies/attributes/order are unchanged. |
| Paths and syntax | PASS — source/local | All eight browser JS files parse and all 385 external script paths resolve locally. Actual HTTP/MIME/cache behavior remains unverified. |
| Existing inline issue | FAIL — pre-existing | Contact's unchanged inline script still fails at relative line 53, now contact.html:962. Other inline scripts parse. This is not introduced by the feature extraction. |
| Documentation/source audit | PASS | All 318 app/extracted declaration locations, 248 startup references and the moved state-assignment location match current source. All 58 manifest rows match current HTML. The unchanged ID catalog matches all 1,009 IDs across 58 pages. |
| Scope/checkpoint/whitespace | PASS | Exactly app.js, 57 HTML files, four docs and new offerings.js changed against a06b420. All 35 other tracked files are unchanged; git diff --check passes. The index is empty and HEAD remains a06b420: E05 is not staged or committed. |
| Browser visual/startup | NOT TESTED | Desktop/mobile Products/Workflows, navigation, other public pages and login/portal startup need manual checks. Previous localhost policy restrictions were not bypassed. Synthetic tab tests do not prove browser DOM/listener behavior. |

Current HTML has products-lane-grid and workflow-page-grid but neither home-offering-tabs nor home-offering-panel. Do not add tab UI or call dormant functionality as a cleanup. Keep UI identical and retain its missing-container no-op paths.

Touched scope: app.js, new js/website/offerings.js, 57 HTML consumers and the four refactoring documents. Current source locations/manifest must be updated while preserving the HTML ID catalog. Earlier stage result logs retain historical anchors.

Manual acceptance: open Products and Workflows in permitted local HTTP preview, confirm unchanged first-three cards/content on desktop/mobile, then check navigation, Why It Works, In Practice, header/footer and representative login/portal startup without account or record changes. Confirm offerings.js loads successfully once before the prior scripts and no new console errors appear. Record the contact exception separately. Resolve still-unverified E03/E04 checks too. Stop after this feature; do not commit E05, push, deploy or start deferred storage work without new authorization.


## E05 user-reported acceptance follow-up

Before E06 review, the user explicitly reported: E05 browser checks passed. Record this as user-reported PASS only, not an independently observed browser run. E05 is present in clean local checkpoint 87158ca. Prior execution logs retain their historical results and original commit state; this follow-up does not retroactively certify E03/E04 or live backend workflows.

## E06 result log — complete timetable store, 2026-10-03

Baseline: clean refactor/javascript-structure at 87158ca. Approval covers one extraction only, no commit/push/deployment/database changes. Verification uses synthetic values only, never account or school data. Temporary Node VM fixtures compare baseline source from Git with the extracted source and original dependencies; all storage, events, timers and remote saves are in-memory mocks.

| Check | Result | Evidence / limitation |
| --- | --- | --- |
| Exact scope and dependency audit | PASS — source | 43 declarations (seven const, 36 functions); exact original app.js:1450–2040 becomes store.js:1–591. Only nine application bindings remain external, recorded in inventory; all other app.js bytes unchanged after the 592-line removal. |
| Initialization and state ownership (S11) | PASS — isolated/source | New script evaluation performs no storage/DOM/event/listener/timer work and does not assign the adapter. Global lexical constants and shared array identity preserved; original manager assignment/callers/listeners remain unchanged. No session snapshot/cache introduced. |
| Defaults and compatibility (S01/S08) | PASS — isolated | Defaults, snake/camel aliases, generated IDs/timestamps, malformed/non-array/empty storage, unscoped fallback exclusion, normalized field shapes and sorting compare exactly to baseline. No migration or cleanup added. |
| Timetable operations (F06) | PASS — isolated | Period/room/entry create/edit/filter/reload; archive/activate; publish/unpublish with group scoping; teacher/room/class conflict matrix and week types; workload; term copy success/conflicts/no-op; substitutions and summaries. Entire return/state/event traces match. This does not test browser form/print actions. |
| School isolation (S02/S03) | PASS — isolated | Real retained workspace helpers tested against fake storage: A → B → A, double-colon keys, transient precedence, persistent fallback and public fallback. No cross-school entries or rooms; no real browser storage touched. |
| Event contract (S04) | PASS — isolated | Entry save payload is { entries }; other saves retain current-entry emission. Original timetable storage branch ignores other-school and room keys, responds once to active entry key. Real browser two-tab delivery remains NOT TESTED. |
| Sync behavior (S05/S06/S09) | PASS — simulated | Original auth sync/hydration functions with real extracted manager and mocked backend: four state bindings, per-key 260 ms debounce under rapid saves, distinct hydration payload, suppression during hydration, failure caught and timer state released. No actual Supabase request or outage/reconnect tested. |
| Sync eligibility | PASS — simulated/source | Admin retains four timetable bindings; Teacher remains restricted to other eligible collections; Student/Parent gain no timetable sync listener. All auth source including UI permission guards remains byte-identical. Authenticated browser restrictions remain NOT TESTED. |
| App startup/public regression (P01/S11) | PASS — synthetic | Four executions of full app.js (document ready/loading, absent/present public targets) match original storage/DOM/listener traces, markup and all global manager member maps. No browser or complete authenticated auth bootstrap executed. |
| HTML entry points | PASS — source | All 58 HTML files compared; 57 gain exactly one synchronous store.js tag directly before app.js. Removing each insertion reconstructs baseline bytes. Original tag attributes/query strings/bodies/order unchanged; verification HTML untouched. |
| Syntax and delivery prerequisites | PASS — local/source | Nine classic JS scripts parse; 442 external script references resolve locally. Actual HTTP status/MIME/cache remains NOT TESTED. |
| Existing Contact issue | FAIL — pre-existing | Unchanged inline script fails at relative line 53, current contact.html:963. Other inline scripts parse. This is not an E06 regression. |
| Source/docs integrity | PASS — source | Current declaration/consumer anchors and script manifest regenerated from source; HTML ID catalog preserved. Unrelated tracked files unchanged; index empty, HEAD 87158ca unchanged; git diff --check clean. |
| Browser/role/remote acceptance | NOT TESTED | Actual Admin/class print, Teacher/Student, parent answers, dashboards/reports, role guards, HTTP/network and two-tab/live sync require manual/authorized environment evidence. Previous browser-policy restriction was not bypassed. |

Summary: 14 behavioral fixture groups plus four synthetic full-app startup comparisons passed. The baseline-equivalence checks preserve existing behavior; they do not claim to fix pre-existing bugs or prove every edge case. No production/local user storage, account, deployment or database was changed.

### Focused E06 manual browser acceptance

1. In a permitted local preview, confirm timetable/store.js loads once before app.js; no new console/reference/network errors. Spot-check public navigation and login/portal startup. Keep the known Contact error separate.
2. With existing read-only test data, open Admin Schedule and Classes timetable preview/print preview; verify periods, rooms, entries, group/status counts and output match the checkpoint. Do not submit real record changes.
3. Check Teacher timetable (grid/list), Student timetable and parent timetable answers remain scoped as before; dashboard/search/report totals and role-restricted controls are unchanged.
4. Reload and, with authorized test sessions, switch school A → B → A; confirm no cross-school entries. Check refresh in another tab. Browser mutation workflows (publish/copy/substitute/save) require an explicitly isolated fixture with backend synchronization disabled, not a production-connected preview.
5. Report PASS/FAIL/NOT TESTED for the checks actually exercised. Do not infer live Supabase acceptance from simulated sync tests. Stop before E07; no automatic commit or next extraction.


## E06 user-reported acceptance follow-up

The user explicitly reported E06 browser checks passed before reviewing/approving E07. Record user-reported PASS, not an independently observed run. E06 is present in clean checkpoint 94c3181. Its prior result log remains historical and does not establish E07 or live backend acceptance.

## E07 result log — complete student store, 2026-10-03

Baseline: clean refactor/javascript-structure at 94c3181. No commit, push, deployment or database changes. Node VM comparisons use synthetic values, fake in-memory storage/events/timers and mocked remote saves; no real student, account or school records are read or written by the tests.

| Check | Result | Evidence / limitation |
| --- | --- | --- |
| Exact scope/dependencies | PASS — source | 16 functions, 299 code lines / 314 with separators. app.js loses 315 lines; all remaining bytes unchanged, including getLocalDateValue, student adapter, storage helpers, constants, permissions and all startup/listener code. Six retained application dependencies are recorded in inventory. |
| Initialization/state (S11) | PASS — isolated/source | Function-only script evaluates with zero storage/DOM/event/listener/timer effects and does not assign the manager. No cache/session capture. Existing adapter and auth controller ownership remain intact. |
| Record compatibility (F01/S01) | PASS — isolated | Defaults/malformed/non-array storage, no unscoped fallback, aliases, nested guardians/documents/progression, photo formats, generated IDs/timestamps, status/promotion/exam normalization and sorting match full baseline outputs/traces. |
| CRUD/status/progression (F01) | PASS — isolated | Create/update/reload, createdAt preservation, archive/reactivate/transfer, unknown IDs, callback invocation, protected ID/createdAt, invalid updater and thrown callback without save. All summary/status/guardian counts match. Actual forms/import/export/print remain NOT TESTED. |
| Deletion (F01) | PASS — synthetic only | Individual matching/missing/blank IDs and level aliases/case/punctuation/blank/unmatched criteria compare return data and save/event counts exactly. No real deletion or new cascade/account behavior. |
| Isolation/persistence (S02/S03) | PASS — isolated | Real retained workspace helpers against fake storage verify A → B → A, transient precedence, persistent/public fallback, exact key suffixes and other-school preservation during a synthetic deletion attempt. |
| Events (S04) | PASS — isolated | Save payload { students } and existing storage-event branch match; foreign/unscoped/null keys ignored, active key emits once. Actual browser two-tab delivery NOT TESTED. |
| Attendance compatibility (F08/S10) | PASS — isolated | Original summarizeAttendanceRecords calls the moved student getter with unchanged date helper; active roster, present/unmarked counts and rate match using fake attendance data. No attendance code moved. |
| Synchronization (S05/S06/S09) | PASS — simulated | Original auth sync/hydration functions with real store and mocked backend retain one Admin student listener, 260 ms debounce, latest payload, distinct hydration payload, echo suppression and caught save failure/timer cleanup. Live backend/outage/reconnect NOT TESTED. |
| Role eligibility | PASS — simulated/source | Teacher/Student/Parent gain no student-state sync listener. auth.js and all its UI permission/account-provisioning code are byte-identical. Actual authenticated authorization checks NOT TESTED. |
| App startup/public regression (P01/S11) | PASS — synthetic | Four full app.js comparisons (ready/loading, public targets absent/present) match markup, storage, listener registration and every manager member map. This does not execute a full authenticated browser bootstrap. |
| HTML/loading/syntax | PASS — source/local | All 58 HTML files compared; exactly one new synchronous tag on 57 consumers after timetable/store.js and directly before app.js. Removing it reconstructs baseline bytes. Ten JS scripts parse; all 499 local paths resolve. No actual HTTP/MIME/cache verification. |
| Existing Contact defect | FAIL — pre-existing | Same inline parse error at relative line 53, current contact.html:964; other inline scripts parse. Not introduced by E07. |
| Docs and scope | PASS — source | Current declaration/consumer anchors and manifest verified; HTML ID catalog preserved. Only app.js, new store, 57 HTML files and four docs changed. Unrelated tracked files unchanged; index empty, HEAD 94c3181 unchanged, git diff --check clean. |
| Browser/remote acceptance | NOT TESTED | Actual Admin/student/parent screens, permission guards, import/export/print, HTTP/cache, browser cross-tab events and live synchronization require manual/authorized environment checks. Earlier browser-policy restrictions were not bypassed. |

Summary: 15 behavioral fixture groups plus four synthetic full-app startup comparisons passed. Baseline parity preserves existing behavior, including quirks, without claiming every edge case or live workflow has been checked.

### Focused E07 manual browser acceptance

1. In permitted local preview, confirm students/store.js loads once after timetable/store.js and before app.js; no new console/reference/network errors. Spot-check public pages and login/portal startup, retaining the known Contact exception.
2. Using existing records read-only, inspect Admin Students list/details, guardians, photos/documents and counts; inspect class roster and attendance totals for consistency. Preview export/print only where it does not mutate data.
3. Check Student own-record view and Parent linked-child view remain correctly scoped; restricted actions and visible controls must match the checkpoint.
4. Reload and use authorized test sessions for school A → B → A; verify no cross-school records. Check another-tab refresh. Mutating create/edit/promote/archive/transfer/delete/import flows require an explicitly isolated fixture with backend sync disabled, not a production-connected preview.
5. Report PASS/FAIL/NOT TESTED only for what was exercised. Simulated sync is not live Supabase evidence. Stop after E07; no automatic commit or next extraction.


## E07 checkpoint follow-up

The user checkpointed E07 as faefa57 before E08. E07 browser checks passed according to the user; this is user-reported only. Historical logs retain earlier commit/test states. No agent commit or push was performed.

## E08 result log — shared action dialog, 2026-10-04

Baseline: clean faefa57. Tests run original and extracted declarations in isolated VMs with synthetic DOM elements, events and timers. They never click/confirm a real action, access account data or call the database.

| Check | Result | Evidence / limitation |
| --- | --- | --- |
| Source/dependency boundary | PASS — source | One state binding/six functions; AST-equivalent apart from positional metadata, exact template raw/cooked strings preserved. Only browser document/window/HTMLElement plus Promise/String/Boolean. Original auth remainder byte-identical after the nine-line bridge replacement. |
| Consumers/private API | PASS — source/isolated | All 20 external call sites retained; none precedes original initialization. Three local aliases reference original functions; no extra async wrapper. Internal state/ensure/close methods are not globally exposed. |
| Single initialization | PASS — isolated/source | Factory load/construction performs no DOM/listener/timer work. Exact new auth bridge creates one controller. Original ready callback/startup remains unchanged. No full authenticated bootstrap tested. |
| Result/validation behavior | PASS — synthetic | Confirm boolean, prompt trimmed string/optional empty/null cancellation, direct object shapes, defaults/variants/coercion, required-empty validation without settlement and absent-body cancellation match baseline. |
| Event/focus behavior | PASS — synthetic | Submit, cancel button/backdrop/Escape, inert click/key, focus/select/restoration, non-HTMLElement active element, absent then available body all match DOM traces. Real keyboard/browser focus not tested. |
| Overlap and Promise timing | PASS — synthetic | Prior pending dialog cancels before replacement; resolution order and existing rapid zero-delay focus behavior match. Repeated cancellation resolves once. No timer/race fix added. |
| Listener lifetime | PASS — synthetic | Twelve mixed-mode reopen cycles reuse one dialog and exactly three DOM handlers. State stays in the same controller closure, reset errors/details/mode behavior matches. |
| HTML/syntax/paths | PASS — source/local | All 58 HTML files compared: 49 gain one synchronous tag immediately before auth.js; remaining nine unchanged. Original attributes/query strings/inline bodies/order retained. Eleven scripts parse, all 548 external paths exist locally; HTTP/MIME/cache not tested. |
| Existing Contact issue | FAIL — pre-existing | Same inline parse failure at relative line 53/current contact.html:964; Contact has no auth tag and is unchanged. Other inline scripts parse. |
| Scope/docs | PASS — source | Current declaration/state/listener/consumer locations and manifest checked; HTML ID catalog preserved. app.js, earlier extracts, styles/config/backend and unrelated files unchanged. Index empty, HEAD faefa57 unchanged; git diff --check clean. |
| Browser/role/backend acceptance | NOT TESTED | Actual dialog appearance, keyboard/focus/selection, login/portal startup and authenticated consumer flows need manual verification. No live deletion or backend operation; prior browser restrictions not bypassed. |

Summary: 16 synthetic DOM/Promise fixture groups plus one exact compatibility-bridge test pass. This is behavioral parity for the tested cases, not proof of full browser accessibility or all async edge cases.

### Focused E08 manual browser acceptance

1. Confirm action-dialog.js loads once immediately before auth.js on a login/portal page, with no new console/reference/network errors. Public-only pages should not gain the dialog script.
2. Open a representative confirmation, then cancel via button, backdrop and Escape. Check unchanged layout/text and focus returning to the trigger. Never confirm deletion on production.
3. Open a class-arm or student-transfer prompt and inspect default text/selection; cancel it. Required-empty validation and submit/result tests belong in an isolated fixture where completing the dialog cannot mutate production records.
4. Repeat open/cancel several times; verify one visible dialog and one response per action. Spot-check login and portal navigation. Keep the known Contact error separate.
5. Report PASS/FAIL/NOT TESTED. Stop after E08; no automatic commit, push or E09 extraction.


## E08 checkpoint follow-up

E08 browser checks passed according to the user and were committed locally as f06543b. The clean checkpoint was verified before E09. This is user-reported browser acceptance, not independently observed. No agent commit or push.

## E09 result log — timetable controller, 2026-10-04

Baseline: clean f06543b. No real account, browser, network or database action. Synthetic fixtures contain no user records.

| Check | Result | Evidence / limitation |
| --- | --- | --- |
| Source/dependency/consumer boundary | PASS — source | Complete 1,446-line function; identical AST/template raw/cooked values; auth remainder byte-identical after 35-line bridge replacement. 29 private functions plus four browser objects; one unchanged page caller. |
| Startup/private state | PASS — source/isolated | Exact bridge creates factory once; load/construction has zero DOM/storage/listener effects. Original bootstrap and page guard retained; state allocated only when original initializer runs. Full authenticated startup not executed. |
| F06/F07 schedule selection and fallbacks | PASS — synthetic | Original render/form helpers; empty/missing required and optional elements/managers; session/term/class/teacher/week changes; class/course/cycle events and repeated refreshes. |
| F06/F16 lesson actions and side effects | PASS — synthetic | Create/edit/status preservation, validation/conflicts/workload, subject/class-teacher selection, classTeacher write, audit and draft clearing; identical full DOM/effect traces and mutation counts. |
| F06 periods/copy/group actions | PASS — synthetic | Period validation, per-school-day creation, grouped edits/close, previous-term/no-previous path, save/publish/unpublish and archive/reactivate. No live writes. |
| F06/E08 substitutions and print | PASS — synthetic | Both prompt cancellations, known/custom replacement and payloads; modal reuse/close/edit-scroll, exact print HTML, missing selection and blocked popup. Real browser print/layout untested. |
| A07/R02 management denial | PASS — source/synthetic | Page/access calculation byte-identical. isAdmin=false controller guards and disabled toolbar controls match; no mutation through exercised handlers. Not a hosted permission/security audit. |
| S01/S02/S04 storage integration | PASS — in-memory only | Two fixtures use actual E06 store/app adapter: keys and ::workspace isolation, save/publish/conflicts/substitution/archive, event { entries } and A/B/A readback match baseline. Native cross-tab storage and live remote persistence untested. |
| S11 listener/timer lifetime | PASS — synthetic/source | Repeated refreshes retain listener counts; modal created once. 19 source listener sites, two timer sites and clearTimeout retained; print-window load callback unchanged. No extra initializer added. |
| P06 script references/syntax | PASS — source/filesystem | 49 exact tag additions; other nine HTML files unchanged; prior tag attributes/query strings and inline bodies unchanged. 12 classic scripts parse; all 597 local script paths exist. HTTP/cache/MIME untested. |
| Existing Contact issue | FAIL — pre-existing | Unchanged inline parse failure at relative line 53 / contact.html:964. Contact does not load auth and is untouched. Other inline scripts parse. |
| Scope and documentation | PASS — source | Current declaration/nested responsibility/state/listener anchors and ordered manifest refreshed; HTML ID catalog preserved. Unrelated app/store/styles/config/backend files unchanged; no staged files or HEAD change. |
| Browser/backend acceptance | NOT TESTED | Real DOM/keyboard/layout/printing, authenticated roles, HTTP/cache, cross-tab transport, remote hydration/debounce and Supabase workflows not executed. Backend source untouched; no database changes. |

Summary: 24 original-versus-extracted fixture groups plus the exact compatibility bridge passed. Temporary validation scripts are outside the repo; no test framework/dependency was added. This is tested behavioral parity, not a whole-application pass.

### Focused E09 manual browser acceptance

1. On the usual local HTTP preview, confirm controller.js loads once between action-dialog.js and auth.js. Check schedule plus login/another portal page for new console/network errors.
2. On Schedule, compare session/term/class/teacher/week selections, class/teacher views, summary and saved timetable display on desktop/mobile. Check empty states where available.
3. Open existing lesson/period editors, inspect values and cancel using the existing controls/backdrops. Open/close class previews repeatedly; no duplicate dialogs or actions. Open print preview and cancel printing.
4. Check a permission-restricted test session without altering production permissions. Create/edit/save/copy/publish/archive/substitution flows must only run in an explicitly isolated fixture with backend synchronization disabled. A localhost page can still connect to production; localhost alone is not isolation.
5. In that isolated environment verify one intended mutation/audit sequence per action, reload persistence and school A/B separation. Otherwise mark these browser mutation checks NOT TESTED rather than using real records.
6. Report PASS/FAIL/NOT TESTED with any errors. Keep the known Contact defect separate. After acceptance, the user may checkpoint locally in GitHub Desktop; no automatic commit/push or E10 work.
