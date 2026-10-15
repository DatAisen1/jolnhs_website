// Content for the Cookie Policy page (/cookie-policy).
// Edit freely — no component code changes needed for text updates.

export interface CookieRow {
  name: string;
  purpose: string;
  type: "Essential" | "Third-party";
  duration: string;
}

export const cookiePolicy = {
  pageTitle: "Cookie Policy",
  eyebrow: "How we store data",
  description:
    "What this website stores in your browser, why, and how to change your choice.",
  lastUpdated: "October 2025",

  intro: [
    "This website does not use advertising, analytics, or tracking cookies of any kind. What it does store is listed below — most of it only exists if you use the staff admin panel or interact with the footer map.",
  ],

  storageRows: [
    {
      name: "Admin session (sessionStorage)",
      purpose:
        "Keeps authorized staff signed in to the admin panel while their tab is open. Cleared automatically when the tab closes and after 30 minutes of inactivity.",
      type: "Essential",
      duration: "Until tab closes",
    },
    {
      name: "Cookie choice (localStorage)",
      purpose:
        "Remembers whether you accepted or declined the Google Map's third-party cookies, so we don't ask every visit.",
      type: "Essential",
      duration: "Until you clear it",
    },
    {
      name: "Google Maps embed",
      purpose:
        "The 'View on Google Maps' frame in the footer is loaded from Google's servers, which may set their own cookies (e.g. preferences, anti-abuse). It only loads if you accept cookies or click 'Load map'.",
      type: "Third-party",
      duration: "Set by Google",
    },
  ] satisfies CookieRow[],

  sections: [
    {
      heading: "Google Fonts",
      paragraphs: [
        "This site's fonts are loaded from Google Fonts. Loading a font sends your device's IP address to Google's servers — a technical necessity for any web request — but Google Fonts does not set cookies.",
      ],
    },
    {
      heading: "Managing or clearing your choice",
      paragraphs: [
        "Use the button below to clear your saved cookie choice. The consent banner will reappear on your next visit, and the footer map will return to its blocked state until you choose again. You can also clear this site's stored data through your browser's settings at any time.",
      ],
    },
    {
      heading: "Changes to this policy",
      paragraphs: [
        "If the site adds any new cookies or browser storage in the future, this page will be updated and you may be asked to consent again. The 'last updated' date above reflects the current version.",
      ],
    },
  ] satisfies { heading: string; paragraphs: string[] }[],
};
