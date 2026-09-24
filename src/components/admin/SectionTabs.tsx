export interface SectionTab<TSlug extends string = string> {
	slug: TSlug;
	label: string;
}

export interface SectionTabsProps<TSlug extends string> {
	tabs: ReadonlyArray<SectionTab<TSlug>>;
	activeTab: TSlug;
	onTabChange: (slug: TSlug) => void;
}

export function SectionTabs<TSlug extends string>({ tabs, activeTab, onTabChange }: SectionTabsProps<TSlug>) {
	return (
		<div className="mb-6 flex w-full min-w-0 max-w-full gap-1 overflow-x-auto border-b border-border" role="tablist">
			{tabs.map((tab) => (
				<button
					key={tab.slug}
					type="button"
					role="tab"
					aria-selected={activeTab === tab.slug}
					onClick={() => onTabChange(tab.slug)}
					className={`shrink-0 px-4 py-2.5 text-small font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary ${
						activeTab === tab.slug ? "border-b-2 border-primary text-primary" : "text-text-secondary hover:text-text-primary"
					}`}
				>
					{tab.label}
				</button>
			))}
		</div>
	);
}
