import { navigation } from "@/data/navigation";
import { NavDropdown } from "./NavDropdown";

interface NavBarProps {
  isHeaderSolid: boolean;
}

/** Desktop-only nav (hidden below `lg`, MobileNav takes over there). */
export function NavBar({ isHeaderSolid }: NavBarProps) {
  return (
    <nav
      aria-label="Primary navigation"
      className="hidden items-center gap-8 lg:flex"
    >
      {navigation.map((item) => (
        <NavDropdown key={item.label} item={item} isHeaderSolid={isHeaderSolid} />
      ))}
    </nav>
  );
}
