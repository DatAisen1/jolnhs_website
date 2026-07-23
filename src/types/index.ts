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

export interface AcademicProgram {
  id: string;
  acronym: string;
  name: string;
  description: string;
  imageSize: string;
}

export interface Facility {
  id: string;
  name: string;
  description: string;
  imageSize: string;
  imagePosition: "left" | "right";
}

export interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  featured?: boolean;
  imageSize: string;
}

export interface SchoolEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
}

export interface StatItem {
  id: string;
  label: string;
  value: number;
  suffix?: string;
}

export interface FeatureCard {
  id: string;
  title: string;
  description: string;
  icon: "quality" | "inclusive" | "community";
}
