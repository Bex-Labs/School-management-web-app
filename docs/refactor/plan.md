# Safe staged extraction plan

Original plan: 2026-10-02 at e1eb094. E01 was implemented from 39ec400; the user subsequently reported completing its manual browser checks (not independently verified). E02 was explicitly approved and implemented from clean refactor/javascript-structure at 7b1e613. E02 static/isolated checks pass; E02 browser acceptance remains outstanding. Stop after E02; no subsequent stage has started.

## Non-negotiable boundaries

Preserve functionality, UI, URLs, selectors, data formats, storage keys, role permissions and Supabase behavior. Preserve unrelated edits. Do not commit, push, deploy, modify database state or run migrations. Future work is one agreed extraction per turn, then a report and stop. Check the current repository again before each step; line numbers here are snapshot anchors.

The documentation itself is not a blanket green baseline: contact.html has an existing parse failure and browser/backend workflows have not been run. Keep fixes in separate changes. No framework conversion, database redesign, key renaming, password policy change, mass formatting or speculative dead-code deletion belongs in a move-only extraction.

## Evidence and why a gradual approach is necessary

- app.js defines shared models and 18 explicit manager interfaces used by auth.js, not just public-site rendering.
- auth.js is a 47,521-line IIFE; moving its private functions directly to a classic script or ES module breaks implicit closure access.
- Eight functions exceed 650 lines; the largest class controller closes over templates, assignments, several modals, calculations and print flows. Inventory nested responsibilities before splitting their state.
- Startup awaits the auth bridge but not every async initializer, and later launches background hydration. Script type/timing changes are a separate migration.
- Browser storage and remote synchronization intentionally use different representations and workspace mappings.
- The registration companion can initialize while auth bootstrap waits. It must remain accounted for.

## Proposed organization

Keep root HTML and supabase-config.js in place initially. Introduce only the directories needed by the current extraction:

- js/website/: public content, navigation, footer and individual renderers.
- js/core/: narrowly shared storage/JSON/workspace helpers, not a new catch-all.
- js/shared-ui/: theme, feedback/dialogs, sidebar and drafts.
- js/features/<feature>/: store/normalization, service, views and controller as needed.
- js/services/: Supabase client, institution context, table adapters and workspace synchronization.
- js/auth/: session, authentication flows and access checks.
- js/pages/<role>/: page-specific composition after feature extraction stabilizes.
- supabase/functions/: retain backend code and secrets server-side.

Do not create dozens of empty modules in advance. A 600-line cohesive feature is preferable to many tiny files that rely on undocumented globals. Scope follows ownership and dependencies, not an arbitrary line limit.

## Compatibility strategy

For the first extraction, retain classic synchronous scripts and function names. A function declaration in the extracted classic script preserves the current browser-global callable interface. It must be loaded before app.js on every current consumer, because initPageContent calls the helper unconditionally even when its DOM target is absent.

For app.js managers, retain window.SchoolSphere* adapters while relocating implementation. Preserve one owner of state and the exact public method map. Do not duplicate a function in both old and new files.

For auth.js closures, first extract pure functions or a cohesive feature factory with an explicit narrow dependency object passed from the existing IIFE. A factory should initialize only when the existing initializer calls it, not when its script is imported. Pass live getters for session/workspace state where current behavior reads it dynamically; copying a session at startup can leak stale context. Do not expose the whole IIFE on window to avoid auditing dependencies.

Use explicit import/export as a later destination. Do not flip one classic script to type=module while leaving consumers dependent on its old globals and execution order. Coordinated entry-point conversion happens only after interfaces are explicit and acceptance checks are available. No build tool is required for the initial extraction.

## E01 — implemented: renderWhyGrid (historical execution record)

The evidence and procedure in this section describe E01 at implementation time. The user later reported completing the manual browser checks; this is user-reported, not an independently observed browser pass. Current source locations and loading order are in inventory.md and contracts.md.

**Implemented scope:** moved the original app.js:4628–4646 renderWhyGrid(targetId, items) function unchanged into js/website/why-grid.js:1–19. whyCards, initPageContent and all other functions/state remain in app.js. One classic script tag was added before app.js on each of its 57 HTML consumers.

**Reason:** static binding analysis found no application dependencies, only document.getElementById and its parameters. It has one lexical consumer, initPageContent, which calls it for why-preview-grid and why-page-grid. Only why-page-grid is present in current root HTML (why-it-works.html:36); missing-target behavior must remain a no-op. It has no storage, network, listeners, permissions or mutable module state.

**E01 evidence:** exact source equality; five full-output fixtures including the real whyCards; missing-target no-op; isolated initPageContent trace and output parity; exactly one declaration and one script inclusion per consumer; all 214 local script references resolve; five JS files parse. The original 157 tags/inline bodies are unchanged, app.js is otherwise byte-identical, and unrelated files match the pre-extraction snapshot. Browser HTTP/visual/login/portal acceptance is NOT TESTED because localhost browser access was previously policy-blocked. The existing contact syntax failure remains unchanged.

### E01 procedure and remaining acceptance

1. Recheck git status and these source anchors. Protect any new unrelated changes.
2. Record the original function and rendered HTML for a synthetic fixture; open why-it-works over HTTP to capture its actual appearance if browser access is available.
3. Add js/website/why-grid.js containing the original function declaration and remove only that declaration from app.js.
4. In all 57 HTML documents that currently load app.js, insert a classic script reference to ./js/website/why-grid.js immediately before that app.js tag. Preserve all existing attributes/query strings and all other tags. Do not touch the verification HTML.
5. Keep the original initPageContent calls in app.js. No additional ready callback or auto-render call in the new file.
6. Check syntax and full before/after helper output. Check all 157 existing script tags still resolve and the 57 new references exist and occur exactly once in the right position.
7. Test why-it-works, public-page navigation, a missing-target page and representative login/portal startup. Verify manager objects/startup code remain unchanged. Disclose the existing contact parse defect.
8. Update inventory/checklist with evidence and stop. Do not start E02 or commit/push.

**Acceptance:** checklist E01 items, exact helper behavior/markup, no new missing file/reference error, narrow diff containing only one new JS file, removal of one function and required HTML tag additions, plus documentation updates.

**Rollback boundary:** the new JS file, original function location and the 57 script-tag additions form one unit. Reverse only those hunks from the reviewed pre-E01 snapshot. Do not use a broad reset or overwrite unrelated work. Since this step changes no stored data, no database rollback is involved.

**Tradeoff:** HTML edits span many files, but each is one mechanical loading-order change. Loading only on why-it-works would break other pages because app.js invokes the function on all pages. Converting modules or introducing an async loader to avoid those edits would add timing risk.

## E02 — implemented: renderPracticeGrid (browser acceptance pending)

**Approved scope:** moved only the 21-line renderPracticeGrid(targetId, items) declaration from pre-E02 app.js:4714–4734 into js/website/practice-grid.js:1–21, unchanged. Removed the declaration and following blank line (22 lines). All other app.js bytes are unchanged. practiceStories remains at app.js:592–617, with four records; both callers retain slice(0, 3), displaying three stories.

**Dependencies and consumers:** document.getElementById, targetId/items, and story.title/label/copy only. No shared state, constants, listeners, timers, storage, permissions, manager or Supabase dependencies. initPageContent remains the sole callable consumer, now at app.js:4814, with calls at 4825–4826. Its single immediate startup call remains at 4832. Only in-practice.html:29 contains practice-page-grid; home-practice-grid is absent and remains a no-op.

**Loading:** added one synchronous classic practice-grid.js tag immediately before why-grid.js on all 57 app.js consumers. Order: practice-grid.js → why-grid.js → app.js → unchanged subsequent scripts. The new helper declares a function only; it does not initialize itself. Original tags, inline bodies, query strings and relative order are unchanged. The Google verification HTML is untouched.

**Checks performed:** exact function/source preservation; six present-target fixtures (first three real records, all four records, empty, single, markup-containing text and eleven records) plus missing target with null items; full output/lookup/write trace equality; initPageContent composition equality for present and absent practice targets; one top-level initializer; six classic JS files parse; all 271 external paths resolve locally. Existing contact inline parse failure is unchanged (current contact.html:960). Browser HTTP delivery, visual/navigation and login/portal startup checks for E02 are NOT TESTED.

**Remaining acceptance:** open in-practice.html through local HTTP and compare all three cards on desktop/mobile; verify why-it-works and public navigation, a missing-target page, and representative login/portal startup. Inspect console/network for new errors, successful helper delivery and exactly-once loading. Record observed results without making database/account changes. Source checks do not prove browser acceptance.

**Rollback boundary:** the new practice-grid.js file, the removed function and blank line, all 57 practice script additions, and E02 documentation hunks form one unit against 7b1e613. Preserve E01 and unrelated subsequent changes; do not reset the repository or clear storage. Stop after E02 and await user review. No commit, push, deployment, database work or E03 extraction is authorized.

## Extraction queue (provisional; never execute as a batch)

Each row is a planning group. Rows containing several features MUST be expanded into one exact extraction before implementation. Dependency analysis and runtime evidence may change ordering.

| ID | Bounded next unit | Required prerequisites/dependencies | Acceptance focus | Rollback unit |
| --- | --- | --- | --- | --- |
| E02 | Implemented: renderPracticeGrid only; browser acceptance pending | Parameter/document-only dependency audit complete; classic loader pattern retained | Static/isolated checks pass; HTTP/visual/startup checks outstanding | practice-grid.js, function removal, 57 script additions and E02 docs |
| E03 | One public content dataset or offerings component | Audit features array: it is also the module manager catalog; activeOfferingId must have one owner | Tabs/feature toggles and settings event refresh unchanged | Dataset/component and exact consumers |
| E04 | One pure shared helper | Prove matching semantics at every caller; app/auth escaping/JSON helpers may differ | Representative null/invalid/legacy input and escaping cases | Helper plus explicit caller changes |
| E05 | Workspace/storage primitives as individually reviewed boundaries | Workspace fallback/key contracts captured; synthetic A/B fixtures ready | Key equality, transient precedence, legacy behavior and isolation | Helper/interface and consumers; never clear storage |
| E06 | One app.js manager, e.g. classes only after dependency review | Storage API stable; constants/normalizers/event methods accounted for; global adapter retained | CRUD/reload/event payload and dependent view refresh | One manager implementation + adapter |
| E07 | Other managers one at a time | Respect actual dependencies: attendance on cycles/students, report/gradebook and timetable/class/course relationships | Target-feature checks plus linked roles/screens | Each manager is its own checkpoint |
| E08 | One small shared UI boundary | Preserve singleton modal/feedback state, handler lifetime and initialization conditions | Open/close, keyboard, status, theme/drafts as applicable | One UI owner + call wiring |
| E09 | One auth.js feature controller/view unit | Explicit dependency factory and retained closure state; corresponding managers stable | Feature actions, permissions, no duplicate listeners/writes | Whole controller/factory with original initializer |
| E10 | Additional feature units one at a time | Review interleaved helpers in full inventory; include registration companion and page-specific inline consumers | Relevant F/R/S checklist rows for each feature | Per-feature implementation + wiring |
| E11 | Authentication/session/client units one at a time | Explicit live session/workspace access; SDK promise and auth callback singletons preserved | All A checks and cross-role isolation | Single lifecycle owner + consumers |
| E12 | Workspace synchronization and individual table adapters | Shared client/institution context stable; hydrate/echo suppression and local mappings preserved | S05–S09, role-specific writes and partial failures | One adapter or sync lifecycle unit |
| E13 | Page composition and ready-once startup | Existing initializers and guards mapped; all global callers known | Direct loads, async init ordering, hash navigation, duplicate-init checks | Bootstrap/entry-point and affected pages |
| E14 | Coordinated ES-module conversion | No implicit cross-script lexical dependencies; intentional compatibility globals only | All entry points, load order, URL resolution and full regression set | Coherent entry-point conversion, not a single tag alone |
| E15 | Compatibility cleanup | No remaining static or runtime consumer; original inventory fully reconciled | Final role/data/sync matrix; no removed responsibility | Each unused bridge/declaration separately |

Do not decide a manager order solely from its line position. Read its lexical dependencies and global consumers from inventory.md and evaluate cycles before each move. If a candidate requires many unrelated changes, select a smaller dependency boundary rather than doing a broad rewrite.

## Checkpoint and report rules

Before an extraction: refresh source locations; record working-tree state; capture affected baseline; identify every dependency, side effect and consumer; name exact touched files and rollback unit.

After an extraction: review diff; run relevant syntax/script-path checks and workflow checks; compare behavior; update inventory statuses and locations; report exact changes, tests performed, existing failures, untested areas and risks. Stop.

The user controls local commits and all pushes through GitHub Desktop. No automatic checkpoint command is authorized. Recommend a local checkpoint only when that extraction's checks justify it; a syntax-only pass is not full behavioral acceptance.

## Final reconciliation (later stage)

Every original declaration, global interface, immediate effect, listener/timer and relevant inline script must map to a retained or relocated owner. Any removal needs an explicit reason and consumer evidence. No extra dependencies or files should disappear merely because static references are absent.

Run the full checklist on representative roles and two synthetic school workspaces. Preserve supported local/remote modes, public registration, account lifecycle and partial-failure handling. Confirm application/UI assets and verification URL are intact. Record unresolved pre-existing defects separately. A production deployment, Git push, schema change or real-account deletion is outside this plan's automatic authority.

## Current completion boundary

E01 and the approved E02 are implemented. E02 adds one JS file, removes one unchanged function from app.js, adds one script tag to each of 57 HTML files, and updates the four refactoring documents. No other declaration moved during E02. No commit, push, deployment, database change or subsequent extraction occurred during this implementation.

Next action is browser acceptance for E02 in an environment permitted to serve/open localhost, especially in-practice.html, why-it-works.html, a missing-target page, and login/portal startup. Preserve the known contact failure separately. Do not treat static checks as proof of those workflows or proceed automatically to E03. The E02 rollback baseline is 7b1e613; retain E01 and later unrelated user changes.
