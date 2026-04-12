import { InputField } from "@/src/components/ui/input-field";
import { Button } from "@/src/components/ui/button";

function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
      <div>
        <h3
          className="text-sm font-semibold"
          style={{ color: "var(--color-text-primary)" }}
        >
          {title}
        </h3>
        <p className="mt-1 text-xs leading-relaxed" style={{ color: "var(--color-text-tertiary)" }}>
          {description}
        </p>
      </div>
      <div
        className="sm:col-span-2 rounded-lg border border-border p-6 flex flex-col gap-4"
        style={{ background: "var(--color-bg)" }}
      >
        {children}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <div className="max-w-3xl flex flex-col gap-10">
      <div>
        <h1
          className="text-2xl font-semibold tracking-tight"
          style={{ color: "var(--color-text-primary)" }}
        >
          Settings
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--color-text-tertiary)" }}>
          Manage your account and workspace preferences.
        </p>
      </div>

      <div
        className="flex flex-col gap-8 divide-y divide-border"
        style={{ borderTop: "1px solid var(--color-border)" }}
      >
        <div className="pt-8">
          <SettingsSection
            title="Profile"
            description="Your public identity within the Atlas workspace."
          >
            <div className="flex items-center gap-4">
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white"
                style={{ background: "var(--color-brand)" }}
              >
                SW
              </div>
              <div className="flex flex-col gap-1">
                <Button variant="secondary" size="sm">Change avatar</Button>
                <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                  JPG, PNG or GIF · max 2MB
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <InputField label="First name" defaultValue="Sam" />
              <InputField label="Last name" defaultValue="Wilson" />
            </div>
            <InputField label="Email" defaultValue="sam@atlas.design" />
          </SettingsSection>
        </div>

        <div className="pt-8">
          <SettingsSection
            title="Workspace"
            description="Settings that apply to your entire Atlas workspace."
          >
            <InputField label="Workspace name" defaultValue="Atlas Design System" />
            <InputField label="Workspace slug" defaultValue="atlas-design" />
          </SettingsSection>
        </div>

        <div className="pt-8">
          <SettingsSection
            title="Danger zone"
            description="Irreversible actions. Proceed with caution."
          >
            <div className="flex items-center justify-between">
              <div>
                <div
                  className="text-sm font-medium"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  Delete workspace
                </div>
                <div
                  className="text-xs mt-0.5"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  Permanently remove this workspace and all its data.
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-[var(--color-danger)] hover:text-[var(--color-danger)] hover:bg-[#FDF2F1] border border-[var(--color-danger)]/30"
              >
                Delete workspace
              </Button>
            </div>
          </SettingsSection>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Button variant="ghost">Cancel</Button>
        <Button variant="default">Save changes</Button>
      </div>
    </div>
  );
}
