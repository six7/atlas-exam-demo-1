"use client";

import { useState, useRef } from "react";
import { Plus } from "lucide-react";
import { createPrototype } from "@/app/actions/prototype";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/src/components/ui/dialog";

export function NewPrototypeForm() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    try {
      await createPrototype(formData);
    } catch (err: unknown) {
      // Next.js redirect() throws with digest "NEXT_REDIRECT;..." — let it propagate
      if (
        err instanceof Error &&
        "digest" in err &&
        typeof (err as { digest?: string }).digest === "string" &&
        (err as { digest: string }).digest.includes("NEXT_REDIRECT")
      ) {
        throw err;
      }
      setError(err instanceof Error ? err.message : "Something went wrong");
      setPending(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-white transition-colors"
        style={{ background: "var(--color-brand)" }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLElement).style.background = "var(--color-brand-hover)")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLElement).style.background = "var(--color-brand)")
        }
      >
        <Plus size={14} />
        New prototype
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md" style={{ background: "var(--color-bg)" }}>
          <DialogHeader>
            <DialogTitle style={{ color: "var(--color-text-primary)" }}>
              New prototype
            </DialogTitle>
            <DialogDescription style={{ color: "var(--color-text-tertiary)" }}>
              Creates an isolated folder in{" "}
              <code
                className="font-mono px-1 rounded text-xs"
                style={{ background: "var(--color-bg-muted)" }}
              >
                src/prototypes/
              </code>
            </DialogDescription>
          </DialogHeader>

          <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
            <Field label="Prototype name" name="name" placeholder="Login redesign" required />
            <Field label="Your name" name="author" placeholder="Sam Wilson" />
            <Field label="Description" name="description" placeholder="What are you exploring?" />

            {error && (
              <p className="text-xs" style={{ color: "var(--color-danger)" }}>
                {error}
              </p>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium border border-border transition-colors"
                style={{ color: "var(--color-text-secondary)", background: "var(--color-bg)" }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={pending}
                className="rounded-md px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
                style={{ background: "var(--color-brand)" }}
              >
                {pending ? "Creating…" : "Create prototype"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Field({
  label,
  name,
  placeholder,
  required,
}: {
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={name}
        className="text-xs font-medium"
        style={{ color: "var(--color-text-secondary)" }}
      >
        {label}
        {required && <span style={{ color: "var(--color-danger)" }}> *</span>}
      </label>
      <input
        id={name}
        name={name}
        placeholder={placeholder}
        required={required}
        className="rounded-md border border-border px-3 py-2 text-sm outline-none transition-colors"
        style={{
          background: "var(--color-bg)",
          color: "var(--color-text-primary)",
        }}
        onFocus={(e) =>
          ((e.currentTarget as HTMLElement).style.borderColor = "var(--color-brand)")
        }
        onBlur={(e) =>
          ((e.currentTarget as HTMLElement).style.borderColor = "var(--color-border)")
        }
      />
    </div>
  );
}
