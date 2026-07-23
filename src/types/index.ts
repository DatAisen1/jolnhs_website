// Central domain types. Components and data files both import from here
// so shape changes only need to happen in one place.

export interface NavLink {
  label: string;
  href: string;
}

export interface NavItem {
  label: string;
  href: string;
  dropdown?: NavLink[];
}

export interface Facility {
  id: string;
  name: string;
  description: string;
  imageSize: string;
  imagePosition: "left" | "right";
  theme: "light" | "dark";
}
