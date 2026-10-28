import { Menu, Plus, Search, Settings } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export default function Navbar({
  search,
  setSearch,
  onAdd,
  onMenu,
  onOpenSettings,
  userName,
  theme,
  onToggleTheme,
}) {
  return (
    <header className="topbar">
      {/* Mobile Menu */}
      <button
        type="button"
        className="icon-btn menu-toggle"
        aria-label="Open menu"
        onClick={onMenu}
      >
        <Menu size={22} />
      </button>

      <div className="topbar-title">
        <strong>My Workspace</strong>
        <span>Stay focused and organized</span>
      </div>

      <div className="topbar-actions">
        <label className="search-box">
          <Search size={18} />
          <input
            id="task-search"
            aria-label="Search tasks"
            placeholder="Search tasks...  ( / )"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>

        <button type="button" className="btn btn-primary" onClick={onAdd}>
          <Plus size={18} />
          <span>New Task</span>
        </button>

        <ThemeToggle theme={theme} onToggle={onToggleTheme} />

        <button
          type="button"
          className="topbar-chip"
          onClick={onOpenSettings}
          title="Settings, backup and sample data"
          aria-label="Open settings"
        >
          <Settings size={20} />
          <span>{userName || "Settings"}</span>
        </button>
      </div>
    </header>
  );
}
