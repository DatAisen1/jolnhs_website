import { useState } from "react";
import { useCampusLifeSection, useSaveCampusLifeSection } from "@/lib/data/campusLife";
import { ListEditor } from "@/components/admin/ListEditor";
import { OfficerManager } from "@/components/admin/OfficerManager";
import { Button } from "@/components/ui/Button";

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

function SectionEditor({ slug, hasOfficers }: { slug: string; hasOfficers: boolean }) {
  const { data, isLoading, error } = useCampusLifeSection(slug);
  const saveSection = useSaveCampusLifeSection();

  const [name, setName] = useState("");
  const [eyebrow, setEyebrow] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [stats, setStats] = useState<Array<{ label: string; value: string }>>([]);
  const [highlights, setHighlights] = useState<Array<{ title: string; description: string }>>([]);
  const [initialized, setInitialized] = useState(false);

  // Sync local form state once, when data first arrives — after that,
  // the form owns its own state until Save, so the admin's in-progress
  // edits are never clobbered by a background refetch.
  if (data && !initialized) {
    setName(data.name);
    setEyebrow(data.eyebrow ?? "");
    setTagline(data.tagline ?? "");
    setDescription(data.description ?? "");
    setStats(data.stats.map((s) => ({ label: s.label, value: s.value })));
    setHighlights(data.highlights.map((h) => ({ title: h.title, description: h.description })));
    setInitialized(true);
  }

  if (isLoading) return <p className="text-small text-text-secondary">Loading…</p>;
  if (error || !data) return <p className="text-small text-red-600">Failed to load this section.</p>;

  return (
    <div className="space-y-6">
      <p className="text-small text-text-secondary">Last updated {timeAgo(data.updated_at)}</p>

      <section className="space-y-3">
        <h2 className="text-small font-semibold text-text-primary">Overview</h2>
        <input
          value={eyebrow}
          onChange={(e) => setEyebrow(e.target.value)}
          placeholder="Eyebrow label"
          className="w-full rounded-md border border-border px-3 py-2 text-small focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Section name"
          className="w-full rounded-md border border-border px-3 py-2 text-small font-medium focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <input
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          placeholder="Tagline"
          className="w-full rounded-md border border-border px-3 py-2 text-small focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          rows={3}
          className="w-full rounded-md border border-border px-3 py-2 text-small focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </section>

      <section>
        <h2 className="mb-2 text-small font-semibold text-text-primary">Stats</h2>
        <ListEditor
          items={stats}
          onChange={setStats}
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
          onChange={setHighlights}
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

      <Button
        onClick={() =>
          saveSection.mutate({
            sectionId: data.id,
            slug,
            eyebrow,
            name,
            tagline,
            description,
            stats,
            highlights,
          })
        }
        disabled={saveSection.isPending}
      >
        {saveSection.isPending ? "Saving…" : "Save changes"}
      </Button>
      {saveSection.isSuccess && <p className="text-small text-status-success-text">Saved.</p>}
    </div>
  );
}

export function CampusLifeManagePage() {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]["slug"]>("athletes");

  return (
    <div className="max-w-2xl">
      <h1 className="mb-4 font-heading text-subtitle text-text-primary">Campus Life</h1>

      <div className="mb-6 flex gap-1 border-b border-border" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.slug}
            role="tab"
            aria-selected={activeTab === tab.slug}
            onClick={() => setActiveTab(tab.slug)}
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
          form state when switching. */}
      <SectionEditor
        key={activeTab}
        slug={activeTab}
        hasOfficers={TABS.find((t) => t.slug === activeTab)!.hasOfficers}
      />
    </div>
  );
}