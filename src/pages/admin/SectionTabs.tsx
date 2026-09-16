export interface SectionTab<TSlug extends string = string> {
  slug: TSlug;
  label: string;
}

export interface SectionTabsProps<TSlug extends string> {
  tabs: ReadonlyArray<SectionTab<TSlug>>;
  activeTab: TSlug;
  onTabChange: (slug: TSlug) => void;
}

/**
 * Shared tab bar (P1.10), generalized out of `CampusLifeManagePage`'s
 * Athletes/PTA/Journalists tabs so Staff & Faculty's category tabs
 * (Administrators / JHS Faculty / SHS Faculty / Staff) — and any future
 * tabbed admin section — reuse the same component instead of a second
 * hand-rolled tab bar.
 *
 * Deliberately scoped to *tab-bar UI only*: which slug is active and
 * what to call when it changes. It knows nothing about what a tab's
 * content looks like, whether switching should be guarded by an
 * unsaved-changes prompt, or how many tabs there are — that logic stays
 * in the page component (e.g. `CampusLifeManagePage`'s `isDirty` guard
 * in its `handleTabClick`), which is where it differs per module.
 */
export function SectionTabs<TSlug extends string>({ tabs, activeTab, onTabChange }: SectionTabsProps<TSlug>) {
  return (
    <div className="mb-6 flex gap-1 border-b border-border" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.slug}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.slug}
          onClick={() => onTabChange(tab.slug)}
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
  );
}