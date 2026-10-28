import { LayoutDashboard, ListTodo, CheckCircle2, X } from "lucide-react";
export default function Sidebar({ filter, setFilter, open, setOpen }) {
  const links = [
    { id: "all", label: "Dashboard", Icon: LayoutDashboard },
    { id: "pending", label: "Pending Tasks", Icon: ListTodo },
    { id: "completed", label: "Completed Tasks", Icon: CheckCircle2 },
  ];
  return (
    <>
      {open && <div className="overlay" onClick={() => setOpen(false)} />}
      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="brand">
          <span className="brand-mark">✓</span>
          <span>TaskFlow</span>
          <button
            className="mobile-close icon-btn"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>
        <p className="sidebar-caption">WORKSPACE</p>
        <nav className="side-nav" aria-label="Main navigation">
          {links.map(({ id, label, Icon }) => (
            <button
              key={id}
              className={`nav-link ${filter === id ? "active" : ""}`}
              onClick={() => {
                setFilter(id);
                setOpen(false);
              }}
            >
              <Icon size={19} />
              {label}
            </button>
          ))}
        </nav>
        <div className="sidebar-foot">
          Organize your day.
          <br />
          Achieve more. ✨
        </div>
      </aside>
    </>
  );
}
