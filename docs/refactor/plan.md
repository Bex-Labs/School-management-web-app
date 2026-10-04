# Safe staged extraction plan

Original plan: 2026-10-02 at e1eb094; updated 2026-10-04 for the approved E10 course-controller unit from clean 8a74f15. E09 is checkpointed and browser checks passed according to the user. E10 moves one complete controller with explicit dependencies. No commit, push, deploy or database operation. Stop after this unit.

## Non-negotiable boundaries

Preserve functionality, UI, URLs, selectors, data formats, storage keys, role permissions and Supabase behavior. Preserve unrelated edits. Do not push, deploy, modify database state or run migrations. Commit only on an explicit request: the earlier commit authorization covered E04 only; E10 approval does not authorize a commit. Future work is one agreed cohesive extraction per turn, then a report and stop. Check the current repository again before each step; line numbers here are snapshot anchors.

The documentation itself is not a blanket green baseline: contact.html has an existing parse failure and browser/backend workflows have not been run. Keep fixes in separate changes. No framework conversion, database redesign, key renaming, password policy change, mass formatting or speculative dead-code deletion belongs in a move-only extraction.

## Evidence and why a gradual approach is necessary

- app.js defines shared models and 18 explicit manager interfaces used by auth.js, not just public-site rendering.
- auth.js is now a 44,736-line IIFE; private feature extractions require explicit closure boundaries, as used for the E08 dialog factory. Moving arbitrary private functions directly to a classic script or ES module breaks implicit closure access.
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

## E02 — implemented: renderPracticeGrid (historical execution record)

The source anchors and results in this section describe E02 at implementation time. The user subsequently confirmed that E02 browser checks passed while approving E03. This is user-reported acceptance, not independent browser evidence. Current source locations are in inventory.md and contracts.md.

**Approved scope:** moved only the 21-line renderPracticeGrid(targetId, items) declaration from pre-E02 app.js:4714–4734 into js/website/practice-grid.js:1–21, unchanged. Removed the declaration and following blank line (22 lines). All other app.js bytes are unchanged. practiceStories remains at app.js:592–617, with four records; both callers retain slice(0, 3), displaying three stories.

**Dependencies and consumers:** document.getElementById, targetId/items, and story.title/label/copy only. No shared state, constants, listeners, timers, storage, permissions, manager or Supabase dependencies. initPageContent remains the sole callable consumer, now at app.js:4814, with calls at 4825–4826. Its single immediate startup call remains at 4832. Only in-practice.html:29 contains practice-page-grid; home-practice-grid is absent and remains a no-op.

**Loading:** added one synchronous classic practice-grid.js tag immediately before why-grid.js on all 57 app.js consumers. Order: practice-grid.js → why-grid.js → app.js → unchanged subsequent scripts. The new helper declares a function only; it does not initialize itself. Original tags, inline bodies, query strings and relative order are unchanged. The Google verification HTML is untouched.

**Checks performed:** exact function/source preservation; six present-target fixtures (first three real records, all four records, empty, single, markup-containing text and eleven records) plus missing target with null items; full output/lookup/write trace equality; initPageContent composition equality for present and absent practice targets; one top-level initializer; six classic JS files parse; all 271 external paths resolve locally. Existing contact inline parse failure is unchanged (current contact.html:960). Browser HTTP delivery, visual/navigation and login/portal startup checks for E02 are NOT TESTED.

**Remaining acceptance:** open in-practice.html through local HTTP and compare all three cards on desktop/mobile; verify why-it-works and public navigation, a missing-target page, and representative login/portal startup. Inspect console/network for new errors, successful helper delivery and exactly-once loading. Record observed results without making database/account changes. Source checks do not prove browser acceptance.

**Rollback boundary:** the new practice-grid.js file, the removed function and blank line, all 57 practice script additions, and E02 documentation hunks form one unit against 7b1e613. Preserve E01 and unrelated subsequent changes; do not reset the repository or clear storage. Stop after E02 and await user review. No commit, push, deployment, database work or E03 extraction is authorized.

## E03 — implemented: whyCards (historical execution record; browser acceptance unverified)

These anchors describe E03 at implementation time. E03 is included in checkpoint 28bf6cf; a separate browser-pass confirmation was not supplied. Current locations and script order are maintained in inventory.md and contracts.md.

**Approved scope:** moved only the unchanged 17-line const whyCards declaration from pre-E03 app.js:30–46 to js/website/why-grid.js:1–17, above the unchanged renderWhyGrid function now at lines 19–37. Removed the original declaration and blank separator (18 lines) from app.js. All remaining app.js bytes are unchanged. No new file, HTML tag, URL, CSS or content change.

**Dependencies and consumers:** three literal title/copy records; no external dependencies or detected mutations. The only consumers are the two unchanged initPageContent calls, now app.js:4797–4798. initPageContent is at 4796, with its sole immediate invocation at 4814. Only why-page-grid exists in HTML; why-preview-grid remains a no-op.

**Loading and ownership:** preserve the existing synchronous practice-grid.js → why-grid.js → app.js ordering on all 57 consumers. whyCards remains one global lexical const accessible to later classic scripts, not window.whyCards. No wrapper, export, freezing, initializer call or new listener. Its literal array is allocated earlier, before app.js begins; this adds no DOM, storage or network side effects. Both callers retain the same array identity and the same three records.

**Evidence:** exact dataset-source equality, unchanged renderer and remaining app.js, one declaration, equivalent data serialization, preserved const/array/global-access semantics, exact rendering and isolated initPageContent traces for present and absent targets, six classic JS files parse, all 58 HTML files unchanged, all 271 external paths resolve. Existing contact inline syntax failure is unchanged. Browser HTTP/visual/navigation and login/portal startup for E03 remain NOT TESTED.

**Remaining acceptance:** verify Why It Works displays the same three cards on desktop/mobile; check In Practice, Home, public navigation and representative login/portal startup. Confirm no new console/reference/network errors using the usual local HTTP preview. No database/account mutations are needed.

**Rollback boundary:** only app.js, js/website/why-grid.js and E03 documentation hunks against 1dd813e. Restore the dataset to its original location and remove its new copy as one operation; preserve E01/E02 and unrelated changes. No storage rollback is involved. Stop before E04; no commit, push, deployment or database changes.

## E04 — committed: app escapeHtml (historical execution record; browser acceptance pending)

E04 was committed locally as a06b420 at the user's explicit request on 2026-10-03. No push occurred. This section retains E04-time source locations and evidence; current locations are in inventory.md and contracts.md. A commit is not evidence of browser acceptance.

**Approved scope:** moved only the unchanged eight-line escapeHtml(value) function from pre-E04 app.js:613–620 into js/core/escape-html.js:1–8. Removed the original declaration and following blank line (nine lines). All other app.js bytes remain identical. The separate auth.js helper stays private and unchanged; no deduplication or semantic fix.

**Dependencies and consumers:** only value, String and String.prototype.replaceAll. Eight calls across buildBrandMarkHtml (now app.js:775; twice at 779 and once at 784), renderHeader (4490; calls at 4522/4529/4531) and renderFooter (4546; calls at 4558/4560). Header/footer rendering still runs at 4802–4803 and through the original settings/hash handlers. No state, constants, listeners, storage, permissions or Supabase behavior moves.

**Loading:** exactly one synchronous classic escape-html.js tag before practice-grid.js on all 57 app.js consumers. Current order: escape-html.js → practice-grid.js → why-grid.js → app.js → unchanged subsequent scripts. The new file only declares the existing global function. No initializer, async/defer/module conversion, wrapper or new global adapter. Preserve all prior tags/query strings/inline bodies. Verification HTML remains unchanged.

**Semantics:** retain String(value ?? "") and the exact replacement order, including double-escaping already encoded entities. Keep the private auth.js:6303–6310 version separate: it does not coerce and throws for null/numeric inputs. Its 1,371 scoped references remain bound to that private declaration.

**Checks performed:** exact helper and remaining-app equality; 16 explicit input/output fixtures plus a throwing conversion; three isolated header/footer composition cases covering normal/special-character names, selected/hash navigation, absent targets and repeated rendering; image/initial/fallback branding branches; unchanged private auth source and binding; seven classic scripts parse; 58 HTML files audited and all 328 external paths resolve locally. Existing contact inline parse failure is unchanged (now contact.html:961). Browser HTTP/cache/visual/navigation and login/portal startup checks are NOT TESTED.

**Remaining acceptance:** using the usual local HTTP preview, compare header/footer, logo/initial branding, navigation and representative login/portal startup; also check Why It Works and In Practice. Inspect console/network for missing files, reference errors and exactly-once script loading. Do not edit real records or settings; use disposable/local fixtures if branding scenarios need exercising. Preserve the known contact failure separately.

**Rollback boundary:** new js/core/escape-html.js, the removed app helper, 57 helper tag additions and E04 documentation hunks against 28bf6cf, as one unit. Preserve E01–E03 and unrelated subsequent changes. No storage/database rollback. Stop before E05; no commit, push, deployment or database operation is authorized.

## E05 — implemented: complete offerings feature (historical execution record)

Follow-up: E05 is now checkpointed in 87158ca and the user reported its browser checks passed before approving E06. The checks below describe E05 execution-time observations; they are not E06 browser evidence.

**Reason and scope:** the user requested faster progress and explicitly approved a cohesive 203-line offerings extraction instead of another tiny unit. Moved five declarations together from a06b420 into js/website/offerings.js: offerings (92 lines), renderOfferingPreviewGrid (19), activeOfferingId (1), renderOfferingTabs (54) and renderWorkflowPage (37). The new file is 207 lines with separators; app.js loses 208 lines including original separators. Every declaration and all remaining app.js bytes are unchanged. No consolidation of previous extracted files or new UI.

**Dependency boundary:** only document is external. offerings retains its five literal records and global lexical const binding; activeOfferingId retains one global lexical let initialized from offerings[0].id and updated by the existing click callback. Both initialize in source order before app.js now, without DOM/network/storage work. No duplicated state or event initialization. All callable function names remain unchanged.

**Consumers:** initPageContent remains in app.js:4579. Its calls at 4582, 4585 and 4586 still render the product preview with the first three records, then tabs and workflows; its sole immediate invocation remains at 4597. The workflow renderer still selects the first three records. renderOfferingTabs still re-renders itself after selection. Keep the invalid-selection fallback and existing event binding behavior.

**Loading:** one synchronous classic offerings.js tag is added before escape-html.js on all 57 app.js consumers. Existing tag attributes, query strings, inline bodies and relative order are preserved. No module/framework conversion, new initializer or lazy loader. Current order: offerings → escape-html → practice-grid → why-grid → app → existing scripts. All 385 external references resolve locally; Google verification HTML is unchanged.

**DOM contracts:** products-lane-grid exists in products.html:79; workflow-page-grid in workflows.html:28. Neither home-offering-tabs nor home-offering-panel exists in current HTML. Preserve those no-op paths and verify tab behavior with synthetic fixtures; do not reintroduce or redesign UI.

**Checks performed:** exact five-declaration and remaining-app equality; product/workflow first-three markup; all five tab selections and persistent state; one listener per current rendered button after clicks and repeated renders; invalid-ID fallback; missing both/either tab container; preview empty/single/markup-containing inputs; four isolated initPageContent compositions; eight scripts parse; all HTML tag additions and paths checked. Existing contact inline syntax failure remains unchanged (now contact.html:962). Browser DOM/listener behavior, visual/layout/navigation and login/portal startup remain NOT TESTED.

**Remaining acceptance:** manually check Products and Workflows content on desktop/mobile, public navigation and earlier Why/In Practice pages, then representative login/portal startup; inspect console/network for missing scripts or new errors. No actual tab UI exists to click. Do not add it for testing or mutate database/account records. Keep E03/E04 outstanding checks and the existing contact failure visible.

**Rollback boundary:** the five original declarations plus separators, new offerings.js, 57 loader additions and this stage's documentation against a06b420. Restore/remove them as one unit, preserving E01–E04 and unrelated edits. Do not reset the whole repository or clear storage. E05 was uncommitted at implementation handoff; it is now present in checkpoint 87158ca. No agent push, deploy or database action.

## Extraction queue (provisional; never execute as a batch)

Each row is a planning group. Rows containing several features MUST be expanded into one exact extraction before implementation. Dependency analysis and runtime evidence may change ordering.

| ID | Bounded next unit | Required prerequisites/dependencies | Acceptance focus | Rollback unit |
| --- | --- | --- | --- | --- |
| E02 | Implemented: renderPracticeGrid only | Parameter/document-only dependency audit complete; classic loader pattern retained | Static/isolated checks pass; browser checks passed according to user | practice-grid.js, function removal, 57 script additions and E02 docs |
| E03 | Implemented: whyCards dataset only | Literal-only const; two callers retained; existing classic loading order | Static/isolated checks pass; E03 browser checks outstanding | Dataset relocation between app.js/why-grid.js and E03 docs |
| E04 | Implemented: app escapeHtml only | Eight calls retained; auth private helper remains separate | Static/isolated checks pass; HTTP/visual/startup checks outstanding | New helper, app declaration removal, 57 script tags and E04 docs |
| E05 | Implemented: cohesive offerings data/state/renderers (approved acceleration) | Five-declaration boundary audited; earlier extraction interfaces preserved | Static/synthetic behavior passes; browser acceptance passed according to user | offerings.js, five declarations, 57 script tags and E05 docs |
| E05-storage | Deferred original workspace/storage step; requires separate review/approval | Workspace fallback/key contracts captured; synthetic A/B fixtures ready | Key equality, transient precedence, legacy behavior and isolation | Helper/interface and consumers; never clear storage |
| E06 | Implemented: complete timetable store (43 declarations, 591 lines) | Original storage API/keys and SchoolSphereTimetable adapter retained; seven local const defaults moved together | 14 fixture groups and four synthetic app-startup comparisons pass; browser acceptance passed according to user | New store.js, original block removal, 57 script additions and E06 docs |
| E07 | Implemented: student store (16 functions, 314 lines) | Existing storage API/constants, student adapter, attendance/date helper and auth consumers retained | 15 fixture groups and four synthetic startups pass; browser acceptance passed according to user | New students/store.js, original function removals, 57 script additions and E07 docs |
| E08 | Implemented: action-dialog controller (one state binding, six functions) | Private factory with one instance; injected browser objects; 20 callers and lazy listeners retained | 16 synthetic DOM/Promise fixtures and bridge check pass; browser acceptance user-reported; checkpoint f06543b | New action-dialog.js, private auth bridge/block replacement, 49 tags and E08 docs |
| E09 | Implemented: complete timetable controller, 1,446 original lines | Private dependency factory; retained page caller/state and unchanged E06 store | 24 parity fixture groups plus exact bridge pass; browser acceptance user-reported; checkpoint 8a74f15 | controller.js, auth block/bridge, 49 tags and E09 docs against f06543b |
| E10 | Implemented approved unit: complete course controller, 1,231 original lines; further units require approval | Private factory, original page/record guards and all 36 application dependencies retained | 24 course fixtures, exact bridge, six page/access compositions and 24 timetable regressions pass; browser pending | courses/controller.js, auth block/bridge, 49 tags and E10 docs against 8a74f15 |
| E11 | Authentication/session/client units one at a time | Explicit live session/workspace access; SDK promise and auth callback singletons preserved | All A checks and cross-role isolation | Single lifecycle owner + consumers |
| E12 | Workspace synchronization and individual table adapters | Shared client/institution context stable; hydrate/echo suppression and local mappings preserved | S05–S09, role-specific writes and partial failures | One adapter or sync lifecycle unit |
| E13 | Page composition and ready-once startup | Existing initializers and guards mapped; all global callers known | Direct loads, async init ordering, hash navigation, duplicate-init checks | Bootstrap/entry-point and affected pages |
| E14 | Coordinated ES-module conversion | No implicit cross-script lexical dependencies; intentional compatibility globals only | All entry points, load order, URL resolution and full regression set | Coherent entry-point conversion, not a single tag alone |
| E15 | Compatibility cleanup | No remaining static or runtime consumer; original inventory fully reconciled | Final role/data/sync matrix; no removed responsibility | Each unused bridge/declaration separately |

Do not decide a manager order solely from its line position. Read its lexical dependencies and global consumers from inventory.md and evaluate cycles before each move. If a candidate requires many unrelated changes, select a smaller dependency boundary rather than doing a broad rewrite.

## Checkpoint and report rules

Before an extraction: refresh source locations; record working-tree state; capture affected baseline; identify every dependency, side effect and consumer; name exact touched files and rollback unit.

After an extraction: review diff; run relevant syntax/script-path checks and workflow checks; compare behavior; update inventory statuses and locations; report exact changes, tests performed, existing failures, untested areas and risks. Stop.

The user controls checkpoints and all pushes. The user explicitly authorized the agent's E04 local commit; that does not authorize committing E05 or any push. Recommend an accepted checkpoint only when checks justify it, distinguishing a requested local snapshot from full browser acceptance. A syntax-only pass is not full behavioral acceptance. Prefer complete dependency-reviewed features over one-function stages where safe; do not batch unrelated features or skip verification.

## Final reconciliation (later stage)

Every original declaration, global interface, immediate effect, listener/timer and relevant inline script must map to a retained or relocated owner. Any removal needs an explicit reason and consumer evidence. No extra dependencies or files should disappear merely because static references are absent.

Run the full checklist on representative roles and two synthetic school workspaces. Preserve supported local/remote modes, public registration, account lifecycle and partial-failure handling. Confirm application/UI assets and verification URL are intact. Record unresolved pre-existing defects separately. A production deployment, Git push, schema change or real-account deletion is outside this plan's automatic authority.

## Current completion boundary

E01–E09 and the approved E10 course-controller unit are implemented. E09 is checkpointed at 8a74f15 with browser checks passed according to the user. E10 is uncommitted and needs focused browser acceptance; no additional unit/stage started. E03/E04 browser evidence remains separately unverified. Next: course selection/edit-cancel/teacher scope, deletion cancellation, timetable and auth startup checks. Real mutations require isolated no-backend fixtures. Stop after this E10 unit.


## E06 — implemented: complete timetable store (historical execution record)

Follow-up: E06 is now in checkpoint 94c3181; the user reported its browser checks passed before approving E07. The execution-time observations below remain historical and do not certify E07.

Baseline: clean 87158ca. The user approved the reviewed timetable manager boundary instead of another small helper. Moved pre-E06 app.js:1450–2040 unchanged into js/features/timetable/store.js:1–591: seven default/day/week const declarations plus 36 functions (including timetableWeekTypesOverlap and valuesMatchByIdOrLabel). Removing the block plus separator reduces app.js by 592 lines to 4,013. No other app bytes change. This is the data/store feature only, not a claim that auth.js timetable UI has been extracted.

Dependencies remain explicit in the inventory: readWorkspaceState, writeWorkspaceState, createStorageId, the six app timetable constants, standard JavaScript APIs and CustomEvent/window.dispatchEvent. No additional prerequisite storage refactor is needed: existing live workspace resolution stays intact. Preserve the global adapter at app.js:3560 and storage-event branch at app.js:3728. auth.js consumers, UI/controllers, permissions, Supabase adapters and private state all stay in place. No hidden cache or factory is introduced.

Loading: exactly one new classic synchronous script tag immediately before app.js in all 57 consumers. Default arrays initialize in their original internal order using no app dependency; methods resolve existing dependencies only when called after app initializes. Keep the original adapter assignment and startup calls as the only initialization owners. Preserve existing script attributes, query strings, inline bodies and relative order; no framework/modules/lazy loading.

Acceptance completed: byte-identical move and unchanged remaining app; all 43 declarations have one owner; original interface preserved; 14 before/after fixture groups for defaults/aliases/malformed state, period/room/entry CRUD, conflict/week/load behavior, statuses/publication, term copy, substitutions, live school isolation, storage events, four-key sync/debounce/hydration/error handling and role eligibility; four full app.js startup comparisons using synthetic DOM (ready/loading, present/absent public targets); nine scripts parse, 442 local paths resolve, 57 exact tag insertions, all existing inline bodies unchanged and non-target tracked files unchanged. Tests use in-memory fake storage and mocked saves only. See checklist E06 log for limitations and manual checks.

Acceptance remaining: actual HTTP/MIME/cache and browser startup, admin timetable/class preview/printing, Teacher/Student views, parent timetable answers, dashboard/report refresh and real role guards. Actual backend/network synchronization and browser two-tab behavior are NOT TESTED. Do not mutate production records to check this extraction; exercise write workflows only in an explicitly isolated no-backend fixture environment. Contact's pre-existing inline syntax error remains separate. Prior E03/E04 browser acceptance remains unverified unless separately confirmed.

Rollback boundary: reverse only this new file, the removed original block/separator, the 57 inserted script lines and E06 documentation hunks against 87158ca together. Preserve E01–E05 and unrelated changes. No stored formats were changed, so no migration/database rollback or clearing storage is required. No commit, push, deploy or database change. Stop here; E07 and E05-storage require fresh approval.


## E07 — implemented: complete student store (historical execution record)

Follow-up: E07 was checkpointed by the user as faefa57; browser completion was user-reported before E08. Execution-time checks below remain historical, not E08 evidence.

Baseline: clean 94c3181. Moved 16 original functions from pre-E07 app.js:2359–2474 and 2483–2679 unchanged into js/features/students/store.js:1–314 (299 code lines plus separators). app.js loses 315 lines and now has 3,698; all remaining bytes are identical. getLocalDateValue stays in app.js. This is the student data layer only; auth.js student management remains private and unchanged.

Scope includes guardian/document/progression/student normalization, reads/saves/events, ordering, upsert, archive/activate, transfer, individual/level deletion, progression callbacks and summaries. Keep the nested normalizers inside normalizeStudentRecord. Retain createStorageId, readWorkspaceState/writeWorkspaceState and the three student default/key/event constants in app.js; no prerequisite storage refactor is needed. All data formats, IDs, keys, event payloads, ordering and existing behaviors remain unchanged.

Consumers remain the original SchoolSphereStudents adapter at app.js:3330, attendance summary at app.js:2536, storage-event branch at app.js:3429 and auth.js:8168 getStudentManager with its existing UI/portal/fees/admissions/report/access/messaging/sync consumers. No new permissions or account deletion/cascade behavior. Deletion verification uses only synthetic records, never user data.

Loading: one classic synchronous students/store.js tag after timetable/store.js and immediately before app.js on all 57 consumers. It only declares functions; no store creation, state capture, DOM/storage work or listeners at evaluation. The original app adapter and auth startup remain the sole initialization owners. Existing tag attributes, inline bodies and relative order are preserved; no framework or modules introduced.

Acceptance completed: exact source/remainder equality; unchanged date helper and adapter; 15 before/after behavioral groups covering default/malformed state, aliases/nested data/photos/documents, CRUD/status/progression, deletion and level matching, summaries, workspace isolation, event/storage branch, attendance summary, admin sync debounce/hydration/mock failure and other-role eligibility; four full app.js executions with synthetic DOM compare startup/storage/listeners/public markup and manager maps; ten classic scripts parse and 499 local paths resolve; 57 exact insertions and unrelated tracked files unchanged. Current docs/manifest and preserved HTML IDs are checked against source. No real browser/backend claim.

Remaining acceptance: local HTTP delivery, authenticated Admin Students/class/attendance views, student/parent linkage, actual role guards, import/export/print and browser cross-tab refresh. Mutating UI workflows require an explicitly isolated no-backend fixture environment; do not submit production-connected saves/deletes. Live Supabase behavior is NOT TESTED. Keep the existing Contact inline syntax error and older unverified E03/E04 acceptance separate.

Rollback boundary: reverse only the 16 function moves, new student-store file, 57 inserted tags and E07 documentation hunks together against 94c3181; preserve getLocalDateValue, E01–E06 and unrelated changes. No format migration, database rollback or storage clearing is required. No commit, push, deploy or database action. Stop after E07 and await user review; no next extraction automatically.


## E08 — implemented: shared action-dialog controller

Follow-up: E08 was checkpointed locally by the user as f06543b; its browser checks passed according to the user before E09. The checks/anchors below are historical execution-time evidence.

Baseline: clean faefa57; E07 checkpoint verified before editing. Move the original auth.js:6312–6505 block (one private let and six functions) into js/shared-ui/action-dialog.js createController. New file has 202 lines; nine-line private wiring replaces 194 lines, reducing auth.js to 47,336 (185 fewer). Original declaration ASTs and exact raw/cooked template strings match; the auth remainder is byte-identical. No unrelated dialog fixes, framework or module conversion.

Mechanism: the new script publishes only SchoolSphereActionDialogs.createController. The unchanged auth IIFE creates one controller at the former state initialization point, injecting document/window/HTMLElement and destructuring openAppActionDialog/showAppConfirm/showAppPrompt as local const aliases. The returned methods are the actual original functions, not extra Promise/async wrappers. All 20 external call sites occur later and keep their source unchanged. Original ready/bootstrap code remains byte-identical. One classic synchronous tag directly before auth.js on its 49 consumers; other pages need no tag.

Dependencies are browser objects and Promise/String/Boolean only. Keep the resolver/focus state, six methods, template, handlers and timer together. No storage/auth/Supabase/service dependency or business mutation belongs in the new factory. Preserve lazy creation and existing DOM reuse; never initialize another controller against the same element as part of this change.

Completed checks: seven-declaration structural equality plus template byte equality; unchanged remainder/callers; one construction; zero factory-load/construction DOM effects; 16 before/after synthetic DOM/Promise fixtures covering all return shapes, submit/cancel/backdrop/Escape, required/optional prompts, trim/defaults/variants, focus restoration, non-HTMLElement focus, absent/late body, overlap and microtask order, rapid focus timers, repeated cancellation and 12 reopen cycles with one element/three listeners. The exact auth bridge is exercised separately. Eleven scripts parse; 548 local paths and 49 exact tag additions checked, old tags/inline bodies preserved; app.js/styles/backend/unrelated files unchanged. Current docs/IDs/manifest are verified.

Remaining: real browser keyboard/focus/selection/layout, HTTP/cache and login/portal startup. Use safe cancel paths on representative class/student/timetable dialogs, not confirmed production deletion. Destructive school-account/staff/student/admission/Super Admin calls remain mocked. Known Contact inline failure remains unchanged. No real browser or backend pass is claimed.

Rollback: reverse only the new factory file, the auth block/bridge, 49 script insertions and E08 documentation hunks together against faefa57, preserving E01–E07 and unrelated changes. No storage clearing/database rollback. No commit, push, deploy or database change. Stop before E09 and obtain separate approval for future extractions.


## E09 — implemented: complete timetable controller

Follow-up: the user checkpointed E09 as 8a74f15 and reported browser checks passed before E10. Source locations/results below are historical execution-time evidence.

Approved boundary: move initTimetableControls from pre-E09 auth.js:13697–15142 (1,446 lines) as one complete unit. New js/features/timetable/controller.js has 1,488 lines; the function is at 37–1482 inside createController. A 35-line private bridge at auth.js:13697–13731 replaces it, reducing auth.js by 1,411 lines to 45,925. The function AST and template raw/cooked values match; the auth remainder is byte-identical. No framework, module conversion, deduplication, redesign or unrelated fix.

Dependencies/ownership: four browser objects and 29 private functions are explicitly injected, exhaustively listed in inventory.md and the signature. Keep private helper closures and live identity/workspace/settings getters. All selection, modal, toast and print state remains inside the original initializer, not factory scope or window. Managers, renderers, form helpers, audit/draft services, permission logic, synchronization and database interfaces remain unchanged. The one caller is initAdminSchedulePage at auth.js:42717, after its original page/access checks.

Loading: add one synchronous classic controller.js tag directly after action-dialog.js and before auth.js on all 49 consumers; other nine HTML files unchanged. Factory load/construction adds no DOM, listener, timer or storage work. One auth construction exposes only a private initTimetableControls alias. Original ready callback and startup order stay unchanged; no new initializer call.

Completed acceptance: source/template/remainder parity; exhaustive dependency/caller audit; 49 exact tag insertions, 12 parsable scripts and 597 resolving local paths. 24 VM/synthetic-DOM before/after fixture groups cover missing required/optional targets/managers, selections and workspace switching, actual render/form helpers, lessons/validation/conflicts/workload, teacher assignment and class side effects, periods, copy-term, publishing, archive/reactivation, substitution cancellation/data, modal reuse/edit/printing/blocked popup, denied-management paths and listener stability. Two groups execute the actual E06 store and app adapter with synthetic in-memory workspace storage, checking payloads/keys/events and conflicts. Exact auth bridge is separately exercised with one construction and no side effects.

Remaining acceptance: actual browser HTTP/cache/MIME, desktop/mobile schedule layout, selector changes, modal close/preview/print and login/portal startup. Create/update/archive/substitution/publish/copy tests require a verified no-backend fixture environment; do not mutate production-connected records. Browser permissions, real cross-tab transport and hosted Supabase behavior are NOT TESTED. Existing Contact inline parse failure remains separate and unchanged; older E03/E04 browser evidence remains unverified.

Rollback boundary: reverse only new controller.js, the auth function-to-bridge replacement, 49 script additions and E09 documentation hunks together against f06543b. Preserve prior extractions and unrelated work. No data migration, clearing or database rollback. No commit/push/deploy/database operation. Stop after E09; E10 requires separate review and approval.


## E10 — implemented unit: complete course-management controller

Approved scope: move pre-E10 auth.js:11338–12568, all 1,231 lines of initCourseManagementControls, into js/features/courses/controller.js:44–1274. New file has 1,280 lines including factory/wiring. A 42-line private bridge replaces the original declaration at auth.js:11338–11379; auth.js is reduced by 1,189 lines to 44,736. Function AST/template raw/cooked values and auth remainder are unchanged. Keep currentUser even though unused; no cleanup, deduplication, redesign or unrelated fix.

Dependency boundary: inject 34 original callables, DEFAULT_AUTH_ROLE, original STORAGE_KEYS and four browser bindings. Inventory lists every dependency. Templates, faculty/department map, scoped class records, DOM state and nested callbacks remain inside the original initializer. Managers, renderers, form helpers, permission functions, course store, sync/backend and E09 implementation remain untouched. One page caller remains at auth.js:41488; preserve canManageCourses passed as isAdmin, canManageAllCourses, assigned-class scope and visible-versus-editable distinctions.

Loading: one synchronous courses/controller.js tag after timetable/controller.js and immediately before auth.js on all 49 auth pages. Other nine HTML files unchanged; no modules/async/defer/ready callbacks. Factory load/construction only establishes bindings and returns the initializer. Original bootstrap owns initialization and its 22 listener sites; no timers or duplicate instance added.

Completed acceptance: exact source/AST/template/remainder/dependency/caller checks; 49 exact HTML insertions, 13 parsable scripts and 646 resolving paths. 24 before/after synthetic-DOM fixture groups use actual course store/adapter/render/form helpers with in-memory workspace storage: school-type/custom setup, teacher multiselect, validation/duplicates, all-arms and assigned-teacher scopes, create/edit/status/delete/cancel, live A/B/A isolation and stable refresh listeners. Exact bridge and six page/access compositions pass. E09's 24 timetable behavioral fixtures and exact bridge also rerun successfully. No actual browser/backend pass is claimed.

Remaining checks: real HTTP/cache/MIME, desktop/mobile course wizard, native selection events, edit/reset/cancel, delete-dialog cancellation, assigned/unassigned Teacher and Admin browser scope, timetable and login/portal startup. All mutating workflows need isolated no-backend fixtures. Native cross-tab behavior, remote hydration and hosted permissions remain NOT TESTED. Existing Contact inline syntax failure stays unchanged; prior E03/E04 browser gaps remain separate.

Rollback: reverse new courses/controller.js, the auth function/bridge replacement, 49 inserted tags and E10 documentation hunks together against 8a74f15. Preserve E01–E09 and unrelated changes. No migration/storage clear/database rollback. No commit/push/deploy/database action. Stop after this unit. E10 allows further cohesive feature units only with separate review/approval; do not automatically jump to E11 authentication work.
