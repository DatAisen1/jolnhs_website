import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  ClipboardList,
  ExternalLink,
  FileText,
  Images,
  LayoutDashboard,
  Lightbulb,
  Mail,
  Megaphone,
  Settings,
  ShieldCheck,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

interface GuideEntry {
  id: string;
  title: string;
  icon: LucideIcon;
  adminPath: string;
  /** Public page(s) this admin screen controls; omitted for admin-only screens. */
  showsOn?: { label: string; href: string };
  purpose: string;
  steps: string[];
  tips?: string[];
  warning?: string;
}

/**
 * Plain-language guide content. Mirrors docs/user-guide/user-guide.html —
 * update both when an admin screen changes so the PDF and this page
 * never disagree.
 */
const GUIDE: GuideEntry[] = [
  {
    id: "dashboard",
    title: "Dashboard",
    icon: LayoutDashboard,
    adminPath: "/admin",
    purpose: "Your starting point. It shows a short summary of the website — how many staff, Campus Life groups, and budget items there are — plus quick buttons to common jobs.",
    steps: ["Look at the numbers to see what is on the site.", "Use the quick buttons (like Add staff or Update budget) to jump straight to a task."],
  },
  {
    id: "announcements",
    title: "Announcements",
    icon: Megaphone,
    adminPath: "/admin/announcements",
    showsOn: { label: "News page and the Home page", href: "/news" },
    purpose: "Post school news, events, and advisories for students, parents, and visitors.",
    steps: [
      "Press the button to add a new announcement.",
      "Type the Title and pick a Category.",
      "Add a Cover image if you want (not required).",
      "Write a short Excerpt — 1 or 2 sentences shown on the news card.",
      "Write the full message in Body.",
      "Tick “Published — visible on the public site”.",
      "Press Save.",
    ],
    tips: [
      "Pin keeps an important announcement at the top.",
      "You may add a Filipino title and message. It shows under the English one.",
      "Archive hides old news without deleting it. You can bring it back from the Archived tab.",
    ],
    warning: "News not showing on the website? It is most likely still a Draft. Edit it, tick Published, and save again.",
  },
  {
    id: "staff",
    title: "Staff & Faculty",
    icon: Users,
    adminPath: "/admin/staff",
    showsOn: { label: "About › Faculty & Staff", href: "/about/faculty-staff" },
    purpose: "Keep the list of teachers and school staff up to date, with their photos, jobs, and departments.",
    steps: [
      "Press Add Staff.",
      "Type the person’s name and position.",
      "Pick their group: Administrators, JHS Faculty, SHS Faculty, or Staff.",
      "Pick their Department if they belong to one — for example Science Department.",
      "Add a photo (JPG, PNG, or WebP).",
      "Press Save.",
    ],
    tips: [
      "The Departments box on each tab is where you add departments first — one name at a time. A person can then be assigned to it from their form.",
      "Tick “Department Head” in a person’s form to make them the head. Each department can have only one head — the old one is replaced automatically.",
      "On the public page, departments show as cards you click to open, with the head shown first. People with no department sit in an “Other” card.",
      "Click a person’s row to change their details.",
      "When someone leaves, use Archive instead of deleting.",
      "Export to CSV downloads the list so you can open it in Excel.",
      "Best photos: facing the camera, shoulders up, plain background.",
    ],
    warning: "Add the department in the Departments box BEFORE editing a person — the Department list in their form only shows departments you already created.",
  },
  {
    id: "campus-life",
    title: "Campus Life",
    icon: Building2,
    adminPath: "/admin/campus-life",
    showsOn: { label: "Campus Life pages", href: "/campus-life" },
    purpose: "Manage student life: Organizations, Athletes, Journalists, and the PTA. Each one has its own tab at the top.",
    steps: [
      "Pick a tab: Athletes, PTA, Journalists, or Organizations.",
      "Section information — edit the title, tagline, description, and the numbers in “By the Numbers”.",
      "Highlights — the “What We Do” cards. Each card has a title, description, and an optional image (click the small picture box to add one).",
      "Press Save Changes in the Section information box. This saves the text, numbers, AND highlights together.",
      "Groups (Organizations, Athletes, Journalists) — add a club, sport, or publication, save it, then open it to add its people and photos.",
      "PTA — add officers in the simple People / Officers list.",
    ],
    tips: [
      "Officers are put in order automatically: Adviser → President → Vice President → Secretary → Treasurer → Auditor → P.I.O. → Grade Representatives (7 to 12) → Committees. Just type the position clearly.",
      "Sports players are shown by name and position only — no photos — to protect students who are minors.",
      "Each group can have up to 12 photos in its photo strip.",
    ],
    warning: "If you leave the page without pressing Save Changes, your highlight and section changes are lost.",
  },
  {
    id: "gallery",
    title: "Gallery",
    icon: Images,
    adminPath: "/admin/gallery",
    showsOn: { label: "Campus Gallery page", href: "/campus-life/gallery" },
    purpose: "Upload event photos. Photos in the Campus Gallery tab show as a Pinterest-style wall; other tabs show on that section’s page.",
    steps: [
      "Click the tab of the section the photos belong to.",
      "Press Upload photos. You can pick many photos at once.",
      "Type a caption under a photo if you want, then press Save.",
    ],
    tips: ["Photos must be JPG, PNG, or WebP, and 5 MB or smaller.", "Tall and wide photos are both fine — each keeps its own shape on the Gallery wall."],
  },
  {
    id: "documents",
    title: "Documents",
    icon: FileText,
    adminPath: "/admin/documents",
    showsOn: { label: "Downloads page", href: "/downloads" },
    purpose: "Share school forms and files that people can download.",
    steps: [
      "Type the Title (for example, “Enrollment Form”).",
      "Pick a Category.",
      "Choose the File — PDF, Word, or image, up to 20 MB.",
      "Add a short Description if you want.",
      "Press Publish.",
    ],
    tips: ["Use Archive to take down an old file."],
  },
  {
    id: "budget",
    title: "Budget",
    icon: Wallet,
    adminPath: "/admin/budget",
    showsOn: { label: "Budget Transparency page", href: "/budget" },
    purpose: "Show the public how much money the school received and how it is used. The budget is organized by fiscal year.",
    steps: [
      "Press New Fiscal Year to start a new year.",
      "In Fiscal year details, type the total budget and the short texts shown on the public page.",
      "In Budget categories, add each category with its amount.",
      "When everything is ready, press Set as current year.",
      "Use the status (Draft, Published, Active, Archived) to keep your records in order.",
    ],
    tips: ["The public Budget page shows only the current year.", "Archived years are locked on purpose so past records cannot be changed by mistake."],
    warning: "As soon as a year is set as current, the public can see it — even if its status says Draft. Finish the numbers first.",
  },
  {
    id: "messages",
    title: "Messages",
    icon: Mail,
    adminPath: "/admin/messages",
    showsOn: { label: "Contact page form", href: "/contact" },
    purpose: "Read messages people send using the Contact form on the website.",
    steps: [
      "Open Messages. The top shows how many are unread.",
      "Click a message to read it.",
      "Press Reply via email — your email app opens with their address filled in.",
      "Press Archive when you are done.",
    ],
  },
  {
    id: "users",
    title: "Admin Users",
    icon: ShieldCheck,
    adminPath: "/admin/users",
    purpose: "Decide who can use this Admin page.",
    steps: [
      "The new person must first have a login account (email and password).",
      "In Grant admin access, type their email and confirm.",
      "To remove someone, press remove beside their name.",
    ],
    tips: ["You cannot remove yourself — this stops the school from being locked out by mistake."],
    warning: "Every admin can change the public website. Only add people the school trusts, and remove access right away when someone leaves.",
  },
  {
    id: "activity",
    title: "Activity Log",
    icon: ClipboardList,
    adminPath: "/admin/activity",
    purpose: "See who changed what, and when. Every save on the Admin page is recorded here.",
    steps: ["Open Activity Log.", "Use the filters to look for a certain person or type of change."],
  },
  {
    id: "settings",
    title: "Settings",
    icon: Settings,
    adminPath: "/admin/settings",
    showsOn: { label: "the whole website", href: "/" },
    purpose: "Change things that appear on the whole website.",
    steps: [
      "Site Identity — the school name.",
      "Contact Information — address, phone, and email (footer and Contact page).",
      "School Information — other school details.",
      "Page Content — the Home page welcome words, welcome message, About history, and mission.",
      "Press Save after any change.",
    ],
    tips: ["If you leave a box empty, the website shows its original text instead."],
  },
];

const TROUBLESHOOTING: Array<[string, string]> = [
  ["I saved something but it does not show.", "For news, make sure it is Published. For budget, make sure the year is the current year. For Campus Life, make sure you pressed Save Changes. Then refresh the public page with Ctrl + F5."],
  ["I cannot log in.", "Check the spelling of your email and password. After 5 wrong tries, wait 1 minute. If it says you have no access, ask another admin to add you in Admin Users."],
  ["I was logged out suddenly.", "You were inactive for 30 minutes, or the browser tab was closed. Just log in again."],
  ["My photo will not upload.", "Use a JPG, PNG, or WebP file smaller than 5 MB."],
  ["I made a mistake.", "Edit it and save again. If you archived something by mistake, restore it from the Archived view. The Activity Log shows what changed."],
];

export function HelpPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <AdminPageHeader
        title="Help & Guide"
        description="How to use each admin page, explained in simple words. Pick a page below to jump to it."
      />

      <AdminCard as="section" aria-labelledby="help-intro" className="mb-6">
        <h2 id="help-intro" className="text-small font-semibold text-text-primary">How it works</h2>
        <p className="mt-2 text-small text-text-secondary">
          The website has two sides. The <b className="text-text-primary">public website</b> is what everyone sees. This{" "}
          <b className="text-text-primary">Admin page</b> is where you add, change, or remove what they see. When you save here,
          the public website changes <b className="text-text-primary">right away</b>.
        </p>
        <div className="mt-4 rounded-md border border-primary/20 bg-primary/5 p-3">
          <p className="flex items-center gap-1.5 text-small font-semibold text-primary">
            <Lightbulb size={15} aria-hidden="true" /> The three golden rules
          </p>
          <ol className="mt-1.5 list-decimal space-y-0.5 pl-5 text-small text-text-primary">
            <li><b>Save</b> after every change.</li>
            <li>Make sure news is <b>Published</b>.</li>
            <li><b>Sign out</b> when you are done. (You are signed out by itself after 30 minutes of no activity, or when you close the tab.)</li>
          </ol>
        </div>
      </AdminCard>

      <nav aria-label="Guide topics" className="mb-6 flex flex-wrap gap-2">
        {GUIDE.map(({ id, title, icon: Icon }) => (
          <a
            key={id}
            href={`#help-${id}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-small text-text-secondary transition-colors hover:border-primary hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Icon size={14} aria-hidden="true" /> {title}
          </a>
        ))}
        <a
          href="#help-problems"
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-small text-text-secondary transition-colors hover:border-primary hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <AlertTriangle size={14} aria-hidden="true" /> Problems
        </a>
      </nav>

      <div className="space-y-4">
        {GUIDE.map((entry) => (
          <GuideCard key={entry.id} entry={entry} />
        ))}
      </div>

      <AdminCard as="section" aria-labelledby="help-problems-heading" className="mt-6 scroll-mt-24" id="help-problems">
        <h2 id="help-problems-heading" className="flex items-center gap-2 text-small font-semibold text-text-primary">
          <AlertTriangle size={16} className="text-primary" aria-hidden="true" /> When something goes wrong
        </h2>
        <dl className="mt-3 divide-y divide-border">
          {TROUBLESHOOTING.map(([problem, fix]) => (
            <div key={problem} className="grid gap-1 py-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] sm:gap-4">
              <dt className="text-small font-medium text-text-primary">{problem}</dt>
              <dd className="text-small text-text-secondary">{fix}</dd>
            </div>
          ))}
        </dl>
      </AdminCard>
    </div>
  );
}

function GuideCard({ entry }: { entry: GuideEntry }) {
  const { id, title, icon: Icon, adminPath, showsOn, purpose, steps, tips, warning } = entry;
  return (
    <AdminCard as="section" id={`help-${id}`} aria-labelledby={`help-${id}-heading`} className="scroll-mt-24">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Icon size={18} aria-hidden="true" />
          </span>
          <div>
            <h2 id={`help-${id}-heading`} className="text-subtitle font-semibold text-text-primary">{title}</h2>
            <p className="mt-1 text-small text-text-secondary">{purpose}</p>
          </div>
        </div>
        <Link
          to={adminPath}
          className="inline-flex shrink-0 items-center gap-1 self-start rounded-md border border-border px-2.5 py-1.5 text-small font-medium text-primary transition-colors hover:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          Open page <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>

      {showsOn && (
        <p className="mt-3 text-small text-text-secondary">
          <span className="font-medium text-text-primary">Changes show on: </span>
          <a href={showsOn.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
            {showsOn.label} <ExternalLink size={12} aria-hidden="true" />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </p>
      )}

      <div className="mt-4">
        <h3 className="text-small font-semibold text-text-primary">How to use it</h3>
        <ol className="mt-1.5 list-decimal space-y-1 pl-5 text-small text-text-secondary">
          {steps.map((step) => <li key={step}>{step}</li>)}
        </ol>
      </div>

      {tips && (
        <div className="mt-4">
          <h3 className="flex items-center gap-1.5 text-small font-semibold text-text-primary">
            <Lightbulb size={14} className="text-primary" aria-hidden="true" /> Good to know
          </h3>
          <ul className="mt-1.5 list-disc space-y-1 pl-5 text-small text-text-secondary">
            {tips.map((tip) => <li key={tip}>{tip}</li>)}
          </ul>
        </div>
      )}

      {warning && (
        <p className="mt-4 flex gap-2 rounded-md border border-status-warning-text/30 bg-status-warning-bg px-3 py-2 text-small text-status-warning-text">
          <AlertTriangle size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
          <span>{warning}</span>
        </p>
      )}
    </AdminCard>
  );
}
