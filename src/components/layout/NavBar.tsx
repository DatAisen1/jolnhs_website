import { navigation } from "@/data/navigation";
import { NavDropdown } from "./NavDropdown";

/** Desktop-only nav (hidden below `lg`, MobileNav takes over there). */
export function NavBar() {
  return (
    <nav
      aria-label="Primary navigation"
      className="hidden items-center gap-8 lg:flex"
    >
      {navigation.map((item) => (
        <NavDropdown key={item.label} item={item} />
      ))}
    </nav>
  );
}
