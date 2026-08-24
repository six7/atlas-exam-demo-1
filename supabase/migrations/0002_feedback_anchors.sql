-- =====================================================================
-- Feedback anchors
--
-- Lets a comment point at a specific element in a prototype rather than
-- the prototype as a whole, so the hub and the overlay can show it as a
-- pin on the page.
--
-- Paste into the Supabase SQL editor and run. Idempotent.
--
-- All four columns are nullable: comments left before this migration, and
-- comments deliberately left about the page as a whole, have no anchor.
-- =====================================================================

alter table public.feedback
  -- A CSS selector resolved with querySelector. Best-effort by nature: the
  -- prototype it points into is still being edited, so the overlay treats a
  -- selector that no longer matches as an unanchored comment rather than an
  -- error.
  add column if not exists selector text,

  -- Where inside the element's box the pin sits, normalised 0..1, so it
  -- survives the element being resized or the viewport changing.
  add column if not exists anchor_x real,
  add column if not exists anchor_y real,

  -- What the element looked like when the comment was left, e.g.
  -- "button · Continue". Read by a human when the selector stops resolving.
  add column if not exists anchor_label text;

do $constraints$
begin
  alter table public.feedback
    add constraint feedback_anchor_x_range check (anchor_x is null or (anchor_x >= 0 and anchor_x <= 1));
exception when duplicate_object then null;
end;
$constraints$;

do $constraints$
begin
  alter table public.feedback
    add constraint feedback_anchor_y_range check (anchor_y is null or (anchor_y >= 0 and anchor_y <= 1));
exception when duplicate_object then null;
end;
$constraints$;

-- Pins are looked up per prototype, filtered to the anchored ones.
create index if not exists feedback_anchored_idx
  on public.feedback (prototype_id)
  where selector is not null;
