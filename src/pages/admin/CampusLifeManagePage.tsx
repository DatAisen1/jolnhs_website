import { useEffect, useState } from "react";
import { useCampusLifeSection, useSaveCampusLifeSection } from "@/lib/data/campusLife";
import { getErrorMessage } from "@/lib/errors";
import { ListEditor } from "@/components/admin/ListEditor";
import { OfficerManager } from "@/components/admin/OfficerManager";
import { Button } from "@/components/ui/Button";
import { statSchema, highlightSchema, rowErrors } from "@/lib/validation/campusLife";

const TABS = [
  { slug: "athletes", label: "Athletes", hasOfficers: false },
  { slug: "pta", label: "PTA", hasOfficers: true },
  { slug: "journalists", label: "Journalists", hasOfficers: true },
] as const;

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days < 1) return "today";
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months === 1 ? "" : "s"} ago`;
}

function SectionEditor({
  slug,
  hasOfficers,
  onDirtyChange,
}: {
  slug: string;
  hasOfficers: boolean;
  /** Reports this tab's unsaved-changes state up to the parent, which owns
   *  the tab-switch decision (this component gets unmounted by `key={activeTab}`
   *  before it could ever block the switch itself). */
  onDirtyChange: (dirty: boolean) => void;
}) {
  const { data, isLoading, isError, error, refetch, isFetching } = useCampusLifeSection(slug);
  const saveSection = useSaveCampusLifeSection();

  const [name, setName] = useState("");
  const [eyebrow, setEyebrow] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [stats, setStats] = useState<Array<{ id: string; label: string; value: string }>>([]);
  const [highlights, setHighlights] = useState<Array<{ id: string; title: string; description: string }>>([]);
  const [initialized, setInitialized] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Propagate up on every change, and on mount (so a freshly-mounted tab
  // always reports clean, overwriting whatever the previous tab left behind).
  useEffect(() => {
    onDirtyChange(isDirty);
  }, [isDirty, onDirtyChange]);

  // Warn on browser close/refresh/back-button while this tab has unsaved
  // edits. Only ever one SectionEditor mounted at a time (key={activeTab}),
  // so this doesn't need to coordinate across tabs.
  useEffect(() => {
    if (!isDirty) return;
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // Sync local form state once, when data first arrives — after that,
  // the form owns its own state until Save, so the admin's in-progress
  // edits are never clobbered by a background refetch.
  if (data && !initialized) {
    setName(data.name);
    setEyebrow(data.eyebrow ?? "");
    setTagline(data.tagline ?? "");
    setDescription(data.description ?? "");
    setStats(data.stats.map((s) => ({ id: s.id, label: s.label, value: s.value })));
    setHighlights(data.highlights.map((h) => ({ id: h.id, title: h.title, description: h.description })));
    setInitialized(true);
  }

  if (isLoading) return <p className="text-small text-text-secondary">Loading…</p>;

  if (isError || !data) {
    return (
      <div role="alert" className="rounded-lg border border-status-error bg-status-error-bg px-4 py-3">
        <p className="text-small font-medium text-status-error-text">Couldn't load this section</p>
        <p className="mt-0.5 text-small text-status-error-text/80">
          {getErrorMessage(error, "Something went wrong talking to the database.")}
        </p>
        <button
          onClick={() => void refetch()}
          disabled={isFetching}
          className="mt-2 rounded-md border border-status-error px-3 py-1.5 text-small font-medium text-status-error-text hover:bg-status-error-bg/60 disabled:opacity-50"
        >
          {isFetching ? "Retrying…" : "Retry"}
        </button>
      </div>
    );
  }

  const statErrors = rowErrors(statSchema, stats);
  const highlightErrors = rowErrors(highlightSchema, highlights);
  const isValid =
    statErrors.every((e) => Object.keys(e).length === 0) &&
    highlightErrors.every((e) => Object.keys(e).length === 0);

  return (
    <div className="space-y-6">
      <p className="text-small text-text-secondary">Last updated {timeAgo(data.updated_at)}</p>

      <section className="space-y-3">
        <h2 className="text-small font-semibold text-text-primary">Overview</h2>
        <input
          value={eyebrow}
          onChange={(e) => {
            setEyebrow(e.target.value);
            setIsDirty(true);
          }}
          placeholder="Eyebrow label"
          className="w-full rounded-md border border-border px-3 py-2 text-small focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <input
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setIsDirty(true);
          }}
          placeholder="Section name"
          className="w-full rounded-md border border-border px-3 py-2 text-small font-medium focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <input
          value={tagline}
          onChange={(e) => {
            setTagline(e.target.value);
            setIsDirty(true);
          }}
          placeholder="Tagline"
          className="w-full rounded-md border border-border px-3 py-2 text-small focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <textarea
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            setIsDirty(true);
          }}
          placeholder="Description"
          rows={3}
          className="w-full rounded-md border border-border px-3 py-2 text-small focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </section>

      <section>
        <h2 className="mb-2 text-small font-semibold text-text-primary">Stats</h2>
        <ListEditor
          items={stats}
          onChange={(next) => {
            setStats(next);
            setIsDirty(true);
          }}
          errors={statErrors}
          fields={[
            { key: "label", placeholder: "Label, e.g. Student Athletes" },
            { key: "value", placeholder: "Value, e.g. 180+" },
          ]}
          emptyItem={{ label: "", value: "" }}
          addLabel="Add stat"
        />
      </section>

      <section>
        <h2 className="mb-2 text-small font-semibold text-text-primary">Highlights</h2>
        <ListEditor
          items={highlights}
          onChange={(next) => {
            setHighlights(next);
            setIsDirty(true);
          }}
          errors={highlightErrors}
          fields={[
            { key: "title", placeholder: "Highlight title" },
            { key: "description", placeholder: "Description", type: "textarea" },
          ]}
          emptyItem={{ title: "", description: "" }}
          addLabel="Add highlight"
        />
      </section>

      {hasOfficers && (
        <section>
          <h2 className="mb-2 text-small font-semibold text-text-primary">Officers</h2>
          <OfficerManager sectionId={data.id} officers={data.officers} />
        </section>
      )}

      <div className="flex items-center gap-3">
        <Button
          onClick={() =>
            saveSection.mutate(
              {
                sectionId: data.id,
                slug,
                eyebrow,
                name,
                tagline,
                description,
                stats: stats.map(({ label, value }) => ({ label, value })),
                highlights: highlights.map(({ title, description }) => ({ title, description })),
              },
              { onSuccess: () => setIsDirty(false) }
            )
          }
          disabled={saveSection.isPending || !isValid}
        >
          {saveSection.isPending ? "Saving…" : "Save changes"}
        </Button>
        {saveSection.isSuccess && !saveSection.isError && (
          <p className="text-small text-status-success-text">Saved.</p>
        )}
      </div>
      {!isValid && (
        <p className="mt-2 text-small text-status-error-text">
          Fix the highlighted fields above before saving.
        </p>
      )}
      {saveSection.isError && (
        <p className="mt-2 text-small text-status-error-text">
          {getErrorMessage(saveSection.error, "Couldn't save this section.")}
        </p>
      )}
    </div>
  );
}

export function CampusLifeManagePage() {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]["slug"]>("athletes");
  const [isDirty, setIsDirty] = useState(false);

  function handleTabClick(nextTab: (typeof TABS)[number]["slug"]) {
    if (nextTab === activeTab) return;

    // window.confirm rather than the app's inline ConfirmButton pattern:
    // this is a navigation guard, not a click-triggered destructive action —
    // there's no icon to expand into inline Confirm/Cancel, and the native
    // dialog's blocking behavior is exactly what's needed here (it must stop
    // the switch from happening at all, synchronously).
    if (isDirty && !window.confirm("You have unsaved changes. Switch tabs and discard them?")) {
      return;
    }

    setIsDirty(false); // the tab we're leaving is about to unmount anyway
    setActiveTab(nextTab);
  }

  return (
    <div className="max-w-2xl">
      <h1 className="mb-4 font-heading text-subtitle text-text-primary">Campus Life</h1>

      <div className="mb-6 flex gap-1 border-b border-border" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.slug}
            role="tab"
            aria-selected={activeTab === tab.slug}
            onClick={() => handleTabClick(tab.slug)}
            className={`px-4 py-2 text-small font-medium transition-colors ${
              activeTab === tab.slug
                ? "border-b-2 border-primary text-primary"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* key={activeTab} remounts the editor per tab — simplest way to
          guarantee one tab's unsaved edits never bleed into another's
          form state when switching. isDirty is reported up by the mounted
          editor and gates the switch in handleTabClick above; a freshly
          mounted editor always starts clean, so no reset-on-unmount logic
          is needed here. */}
      <SectionEditor
        key={activeTab}
        slug={activeTab}
        hasOfficers={TABS.find((t) => t.slug === activeTab)!.hasOfficers}
        onDirtyChange={setIsDirty}
      />
    </div>
  );
}