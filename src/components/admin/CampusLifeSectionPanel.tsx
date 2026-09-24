import { useEffect, useState } from "react";
import { AdminButton } from "@/components/admin/AdminButton";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminErrorState, AdminListSkeleton } from "@/components/admin/AdminStates";
import { InlineNotice } from "@/components/ui/InlineNotice";
import { ListEditor } from "@/components/admin/ListEditor";
import { OfficerManager } from "@/components/admin/OfficerManager";
import { useCampusLifeSection, useSaveCampusLifeSection } from "@/lib/data/campusLife";
import { getErrorMessage } from "@/lib/errors";
import { useUnsavedChangesWarning } from "@/hooks/useUnsavedChangesWarning";
import { highlightSchema, rowErrors, sectionInfoSchema, statSchema } from "@/lib/validation/campusLife";

function timeAgo(iso: string) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24));
  if (days < 1) return "today";
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months === 1 ? "" : "s"} ago`;
}

export function CampusLifeSectionPanel({ slug, onDirtyChange }: { slug: string; onDirtyChange: (dirty: boolean) => void }) {
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
  const [justSaved, setJustSaved] = useState(false);
  const [infoError, setInfoError] = useState("");

  useEffect(() => {
    if (!data || initialized) return;
    setName(data.name);
    setEyebrow(data.eyebrow ?? "");
    setTagline(data.tagline ?? "");
    setDescription(data.description ?? "");
    setStats(data.stats.map((stat) => ({ id: stat.id, label: stat.label, value: stat.value })));
    setHighlights(data.highlights.map((highlight) => ({ id: highlight.id, title: highlight.title, description: highlight.description })));
    setInitialized(true);
  }, [data, initialized]);

  useEffect(() => onDirtyChange(isDirty), [isDirty, onDirtyChange]);
  useUnsavedChangesWarning(isDirty);
  useEffect(() => {
    if (!justSaved) return;
    const timer = window.setTimeout(() => setJustSaved(false), 4000);
    return () => window.clearTimeout(timer);
  }, [justSaved]);
  useEffect(() => {
    if (isDirty) setJustSaved(false);
  }, [isDirty]);

  if (isLoading) return <AdminListSkeleton rows={4} />;
  if (isError || !data) {
    return <AdminErrorState error={error} message="We couldn't load this campus life section." onRetry={() => void refetch()} retrying={isFetching} />;
  }

  const sectionId = data.id;
  const statErrors = rowErrors(statSchema, stats);
  const highlightErrors = rowErrors(highlightSchema, highlights);
  const isValid = statErrors.every((item) => Object.keys(item).length === 0) && highlightErrors.every((item) => Object.keys(item).length === 0);

  function markDirty() {
    setIsDirty(true);
  }

  function handleSave() {
    const infoResult = sectionInfoSchema.safeParse({ eyebrow, name, tagline, description });
    if (!infoResult.success || !isValid) {
      setInfoError(infoResult.success ? "Fix the highlighted list fields before saving." : infoResult.error.issues[0]?.message ?? "Fix the section information before saving.");
      return;
    }
    setInfoError("");
    saveSection.mutate({
      sectionId,
      slug,
      eyebrow: infoResult.data.eyebrow,
      name: infoResult.data.name,
      tagline: infoResult.data.tagline,
      description: infoResult.data.description,
      stats: stats.map(({ label, value }) => ({ label, value })),
      highlights: highlights.map(({ title, description: itemDescription }) => ({ title, description: itemDescription })),
    }, {
      onSuccess: () => {
        setIsDirty(false);
        setJustSaved(true);
      },
    });
  }

  return (
    <div className="space-y-5">
      <p className="text-small text-text-secondary">Last updated {timeAgo(data.updated_at)}</p>

      <AdminCard as="section" aria-labelledby="section-information-heading">
        <div className="mb-4">
          <h2 id="section-information-heading" className="text-small font-semibold text-text-primary">Section information</h2>
          <p className="mt-1 text-small text-text-secondary">Update the title, description, tagline, and statistics shown publicly.</p>
        </div>
        <div className="space-y-4">
          <div>
            <label htmlFor={`${slug}-eyebrow`} className="mb-1 block text-small font-medium text-text-primary">Eyebrow</label>
            <input id={`${slug}-eyebrow`} value={eyebrow} onChange={(event) => { setEyebrow(event.target.value); markDirty(); }} className="w-full rounded-md border border-border px-3 py-2 text-small focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label htmlFor={`${slug}-name`} className="mb-1 block text-small font-medium text-text-primary">Title *</label>
            <input id={`${slug}-name`} value={name} onChange={(event) => { setName(event.target.value); markDirty(); }} className="w-full rounded-md border border-border px-3 py-2 text-small focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label htmlFor={`${slug}-tagline`} className="mb-1 block text-small font-medium text-text-primary">Tagline</label>
            <input id={`${slug}-tagline`} value={tagline} onChange={(event) => { setTagline(event.target.value); markDirty(); }} className="w-full rounded-md border border-border px-3 py-2 text-small focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label htmlFor={`${slug}-description`} className="mb-1 block text-small font-medium text-text-primary">Description</label>
            <textarea id={`${slug}-description`} value={description} rows={4} onChange={(event) => { setDescription(event.target.value); markDirty(); }} className="w-full rounded-md border border-border px-3 py-2 text-small focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <h3 className="mb-2 text-small font-semibold text-text-primary">Statistics</h3>
            <ListEditor items={stats} onChange={(next) => { setStats(next); markDirty(); }} errors={statErrors} fields={[{ key: "label", label: "Statistic label", placeholder: "e.g. Student Athletes" }, { key: "value", label: "Statistic value", placeholder: "e.g. 180+" }]} emptyItem={{ label: "", value: "" }} addLabel="Add statistic" />
          </div>
          {infoError && <p className="text-small text-status-error-text">{infoError}</p>}
          <div className="flex flex-wrap items-center gap-3">
            <AdminButton type="button" onClick={handleSave} loading={saveSection.isPending}>Save Changes</AdminButton>
            {justSaved && <InlineNotice variant="success" message="Saved." />}
          </div>
          {saveSection.isError && <InlineNotice variant="error" message={getErrorMessage(saveSection.error, "Couldn't save this section.")} />}
        </div>
      </AdminCard>

      <AdminCard as="section" aria-labelledby="section-highlights-heading">
        <div className="mb-4">
          <h2 id="section-highlights-heading" className="text-small font-semibold text-text-primary">Highlights</h2>
          <p className="mt-1 text-small text-text-secondary">Manage the supporting highlights for this section.</p>
        </div>
        <ListEditor items={highlights} onChange={(next) => { setHighlights(next); markDirty(); }} errors={highlightErrors} fields={[{ key: "title", label: "Highlight title", placeholder: "Highlight title" }, { key: "description", label: "Highlight description", placeholder: "Description", type: "textarea" }]} emptyItem={{ title: "", description: "" }} addLabel="Add highlight" />
      </AdminCard>

      <AdminCard as="section" aria-labelledby="people-officers-heading">
        <div className="mb-4">
          <h2 id="people-officers-heading" className="text-small font-semibold text-text-primary">People / Officers</h2>
          <p className="mt-1 text-small text-text-secondary">Manage officers associated with this section.</p>
        </div>
        <OfficerManager sectionId={data.id} officers={data.officers} />
      </AdminCard>
    </div>
  );
}
