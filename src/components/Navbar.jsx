import { NavLink } from "react-router";

export default function Navbar() {
  return (
    <nav className="site-nav">
      <a className="brand" href={import.meta.env.BASE_URL}>
        mellemrum<span>.</span>
      </a>

      <div className="nav-links">
        <NavLink to="/">Events</NavLink>
        <NavLink to="/om">Om Mellemrum</NavLink>
      </div>
    </nav>
  );
}
