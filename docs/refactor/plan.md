# Safe staged extraction plan

Snapshot: 2026-10-02; HEAD e1eb094, main tracking origin/main. Initial working tree was clean. Planning only: no extraction is authorized by completion of this documentation stage. Stop after the four documentation files.

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

## E01 — recommended first extraction: renderWhyGrid

**Exact scope:** move only app.js:4628–4646, the renderWhyGrid(targetId, items) function, unchanged into js/website/why-grid.js. Keep whyCards, initPageContent and all other functions/state in app.js.

**Reason:** static binding analysis found no application dependencies, only document.getElementById and its parameters. It has one lexical consumer, initPageContent, which calls it for why-preview-grid and why-page-grid. Only why-page-grid is present in current root HTML (why-it-works.html:36); missing-target behavior must remain a no-op. It has no storage, network, listeners, permissions or mutable module state.

**Current baseline evidence:** isolated VM checks passed for missing target, synthetic title/copy rendering and empty input. Browser appearance and full generated-markup equivalence are still NOT TESTED.

### Implementation sequence when the user requests E01

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

## Subsequent extraction queue (provisional; never execute as a batch)

Each row is a planning group. Rows containing several features MUST be expanded into one exact extraction before implementation. Dependency analysis and runtime evidence may change ordering.

| ID | Bounded next unit | Required prerequisites/dependencies | Acceptance focus | Rollback unit |
| --- | --- | --- | --- | --- |
| E02 | Remaining public renderers, one at a time; next likely renderPracticeGrid | E01 loader pattern verified; identify own content/manager dependencies | Identical markup, missing targets and public routes | One renderer plus loader references/callers |
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

Only docs/refactor/inventory.md, contracts.md, checklist.md and plan.md are created in this task. All symbols are still unmoved. E01 is recommended, not implemented.
