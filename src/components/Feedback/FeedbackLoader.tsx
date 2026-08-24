/**
 * Loads the feedback overlay from the production deployment.
 *
 * The overlay is deliberately NOT bundled with the prototype. It ships as a
 * standalone script at `/feedback.js` on production, so a prototype merged
 * months ago picks up every improvement without being rebuilt — and so the
 * commenting UI stops being pinned to whatever branch it was built from.
 *
 * With `NEXT_PUBLIC_FEEDBACK_ORIGIN` unset the script loads from this same
 * deployment, which is what you want locally.
 */
export function FeedbackLoader({ slug }: { slug: string }) {
  const origin = (process.env.NEXT_PUBLIC_FEEDBACK_ORIGIN ?? "").replace(/\/+$/, "");

  return (
    // A plain tag, not next/script: this must stay independent of the Next
    // runtime on whichever branch the prototype was built from.
    <script
      src={`${origin}/feedback.js`}
      data-atlas-feedback=""
      data-slug={slug}
      defer
    />
  );
}
