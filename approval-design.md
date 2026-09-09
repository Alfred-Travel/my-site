# Website V2 Approval Design

## Purpose

Use this document when Billy approves local Website V2 blog or itinerary drafts. Approval changes the asset from review-only presentation to the normal published-page presentation. It does not authorise publication by itself unless publication is explicitly requested.

## Approval scope

Record the exact approved HTML files and their matching index cards before editing. Approval must not be inferred from a scheduler report, a draft-folder count, or a page that merely renders successfully.

For each approved asset, reconcile:

- Markdown source, if present;
- rendered HTML page;
- canonical URL and slug;
- blog or itinerary index card;
- robots metadata;
- visible review status;
- JSON-LD and social metadata;
- final CTA and destination URL.

## Shared approval rules

1. Remove every visible draft marker from the approved page:
   - `Review draft`;
   - `Draft for review`;
   - `REVIEW DRAFT`;
   - `Status: local`;
   - `publication requires Sansa approval`.
2. Remove draft wording from the approved page title, description, JSON-LD, Open Graph fields and visible metadata where it is present.
3. Change approved pages from review-only robots metadata to:

   ```html
   <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">
   ```

   Preserve the existing preview directives when they are already present.
4. Preserve the canonical URL, analytics include, structured data, internal links, image attribution and trust boundaries.
5. Update the matching index card so it no longer says `Review draft` or `Draft for review`.
6. Do not publish Markdown drafts, audit reports, private handoffs, credentials, email files or working backups as public website content.
7. Keep the change local until publication is separately and explicitly approved.

## Blog approval design

Approved blog pages must retain the golden blog structure defined by:

- `/Users/alfredtravel/Documents/websitev2/blog/ai-trip-discovery-is-not-trip-execution.html`;
- `/Users/alfredtravel/Documents/websitev2/blog-design.md`;
- `/Users/alfredtravel/Documents/websitev2/blog-design.css`.

The approved blog must have:

- one H1;
- the shared Alfred header and navigation used by `blog/index.html`;
- a visible, single-row desktop menu;
- a cream hero with readable dark text;
- hero actions aligned to the golden inner container;
- a readable white article surface;
- evidence, source limitations and Alfred product translation;
- no visible review-only status;
- exactly one final article CTA.

The final article CTA must be:

```text
Heading: Plan your trip with Alfred
Supporting copy: Start with your people, dates and pace, then review the editable plan before booking.
Button: Plan your trip with Alfred
```

Use one `tai-itinerary-cta` at the end of the article. Remove competing or legacy ending actions, including:

- `Build an editable family trip with Alfred`;
- `Build a trip in Alfred`;
- `Plan a trip in Alfred`;
- `Plan this route in Alfred`;
- `Browse the blog` as the final article CTA;
- duplicate `v2-cta` or legacy CTA blocks.

A `Plan a trip` hero action and normal footer navigation may remain. They are not the final article CTA.

The approved blog index card must use its normal published action, such as `Read article →`, and must not expose a review label.

## Itinerary approval design

Approved itinerary pages must retain the trip structure defined by:

- `/Users/alfredtravel/Documents/websitev2/trip-design.md`;
- `/Users/alfredtravel/Documents/websitev2/itinerary-pdf.css`;
- the approved Cairns and Portugal benchmark pages.

The approved itinerary must have:

- one H1;
- the shared Alfred header and navigation;
- a destination hero image with valid local asset and attribution;
- the correct duration and day-card count;
- named destination-specific places and route decisions;
- timing or sequence, transfer context and traveller rationale;
- concrete fallbacks and live-check boundaries;
- matching shortcut navigation for Overview, every day and Planning notes;
- validation and booking-boundary sections;
- no visible review-only status.

The final approved itinerary CTA must match the approved itinerary treatment:

```text
Heading: Build the full plan in Alfred
Supporting copy: Generate, validate and edit the complete itinerary in the Alfred app.
Button: Plan a trip
```

Use one centered `tai-itinerary-cta` with the screenshot-aligned horizontal layout. Do not use `Plan this route in Alfred` as the final approved itinerary action.

The approved itinerary index card must use its normal published action, such as `View itinerary →`, and must not expose a review label.

## Approval transformation checklist

For each approved blog or itinerary:

- [ ] Exact file is listed in the approval record.
- [ ] Matching Markdown source is identified, if applicable.
- [ ] Visible draft labels are removed.
- [ ] Draft wording is removed from title, description and structured metadata.
- [ ] Robots metadata is indexable.
- [ ] Canonical and OG URLs remain correct.
- [ ] Index card exists exactly once.
- [ ] Index card uses the normal published action.
- [ ] Blog or itinerary CTA matches the approved variant.
- [ ] No duplicate or competing final CTA remains.
- [ ] Header and menu render like the relevant index baseline.
- [ ] Page is checked after a cache-busted browser reload.
- [ ] Live DOM readback confirms the final status, CTA and page structure.
- [ ] No secrets, credentials, tokens, passwords or private working files are included.

## Publication gate

Approval and publication are separate decisions.

Before a requested publication:

1. Confirm the actual Git root, target branch and remote.
2. Review the complete approved diff.
3. Stage only public Website V2 files.
4. Exclude drafts, reports, backups, private communications and credentials.
5. Commit with a clear approval/publication message.
6. Push the intended branch.
7. Verify local and remote commit equality.
8. Read back the raw GitHub file for each approved page and both indexes.
9. Check the custom domain with `curl -sSIL` and a content fetch.
10. Report GitHub Pages or CDN propagation separately if the remote branch is correct but the live domain is stale.

Do not report publication as live until the deployed URL returns the expected status and content. A successful Git push alone proves only that the repository branch changed.

## Rollback

Before a batch approval transformation, create a complete local backup outside the public repository. If a page fails rendered QA, restore the affected file from the backup, correct the transformation and rerun the browser and index checks. Do not roll back unrelated approved pages.
