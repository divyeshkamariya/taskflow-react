import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ListTodo,
  Plus,
  TrendingUp,
} from "lucide-react";
import toast from "react-hot-toast";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import StatCard from "../components/StatCard";
import TaskCard from "../components/TaskCard";
import TaskModal from "../components/TaskModal";
import TaskCalendar from "../components/TaskCalendar";
import TaskReminders from "../components/TaskReminders";
import KanbanBoard from "../components/KanbanBoard";
import SettingsModal from "../components/SettingsModal";

import useTasks from "../hooks/useTasks";
import useSettings from "../hooks/useSettings";
import useTheme from "../hooks/useTheme";
import {
  computeStats,
  filterTasks,
  getLocalToday,
  paginate,
  sortTasks,
} from "../utils/taskFilters";

// The charts library is large, so load it after the first paint
const TaskCharts = lazy(() => import("../components/TaskCharts"));

const VIEWS = [
  ["tasks", "Tasks"],
  ["board", "Kanban Board"],
  ["calendar", "Calendar"],
  ["reminders", "Reminders"],
];

export default function Dashboard() {
  const { theme, toggle: toggleTheme } = useTheme();
  const { tasks, addTask, updateTask, removeTask, replaceAll } = useTasks();
  const { settings, updateSettings } = useSettings();

  // List controls
  const [filter, setFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [deadlineFilter, setDeadlineFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // UI state
  const [featureView, setFeatureView] = useState("tasks");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const today = getLocalToday();

  // Changing any filter goes back to the first page
  const withFirstPage = (setter) => (value) => {
    setter(value);
    setPage(1);
  };
  const changeFilter = withFirstPage(setFilter);
  const changeCategory = withFirstPage(setCategoryFilter);
  const changeDeadline = withFirstPage(setDeadlineFilter);
  const changeSort = withFirstPage(setSortBy);
  const changeSearch = withFirstPage(setSearch);
  const changePageSize = withFirstPage((value) => setPageSize(Number(value)));

  // Filter, then sort, then paginate (recomputed only when the inputs change)
  const visible = useMemo(
    () =>
      sortTasks(
        filterTasks(
          tasks,
          { status: filter, category: categoryFilter, deadline: deadlineFilter, search },
          today,
        ),
        sortBy,
      ),
    [tasks, filter, categoryFilter, deadlineFilter, search, sortBy, today],
  );
  const pageData = paginate(visible, page, pageSize);
  const stats = useMemo(() => computeStats(tasks, today), [tasks, today]);
  const percent = stats.total ? Math.round((stats.completed / stats.total) * 100) : 0;

  const openAdd = useCallback(() => {
    setEditing(null);
    setModalOpen(true);
  }, []);

  const openEdit = (task) => {
    setEditing(task);
    setModalOpen(true);
  };

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditing(null);
  }, []);

  const closeSettings = useCallback(() => setSettingsOpen(false), []);

  // Keyboard shortcuts: "n" = new task, "/" = focus search
  useEffect(() => {
    const onKey = (event) => {
      const target = event.target;
      const typing =
        target instanceof HTMLElement &&
        (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
      if (typing || event.metaKey || event.ctrlKey || event.altKey) return;

      if (event.key === "n") {
        event.preventDefault();
        openAdd();
      } else if (event.key === "/") {
        event.preventDefault();
        document.getElementById("task-search")?.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [openAdd]);

  const save = (data) => {
    if (editing) {
      updateTask(editing.id, data);
      toast.success("Task updated successfully!");
    } else {
      addTask(data);
      toast.success("Task created successfully!");
    }
    closeModal();
  };

  const remove = (id) => {
    if (!window.confirm("Delete this task?")) return;
    removeTask(id);
    toast.success("Task deleted successfully!");
  };

  const complete = (id) => {
    updateTask(id, { status: "Completed" });
    toast.success("Task completed successfully!");
  };

  const moveTask = (task, status) => updateTask(task.id, { status });

  const greeting = settings.name ? `Welcome back, ${settings.name} 👋` : "Welcome to TaskFlow 👋";

  return (
    <div className="app-shell">
      <Sidebar filter={filter} setFilter={changeFilter} open={menuOpen} setOpen={setMenuOpen} />

      <div className="main-area">
        <Navbar
          search={search}
          setSearch={changeSearch}
          onAdd={openAdd}
          onMenu={() => setMenuOpen(true)}
          onOpenSettings={() => setSettingsOpen(true)}
          userName={settings.name}
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        <main className="content">
          <section className="welcome">
            <div>
              <p className="eyebrow">YOUR PRODUCTIVITY SPACE</p>
              <h1>{greeting}</h1>
              <p>Manage your tasks and make every day productive.</p>
            </div>

            <button className="btn btn-primary welcome-add" onClick={openAdd}>
              <Plus size={18} /> Add Task
            </button>
          </section>

          <section className="stats-grid" aria-label="Task statistics">
            <StatCard title="Total Tasks" count={stats.total} Icon={ListTodo} tone="purple" />
            <StatCard title="Pending" count={stats.todo} Icon={Clock3} tone="orange" />
            <StatCard title="In Progress" count={stats.inProgress} Icon={TrendingUp} tone="blue" />
            <StatCard title="Completed" count={stats.completed} Icon={CheckCircle2} tone="green" />
          </section>

          <section className="progress-panel">
            <div className="progress-heading">
              <div>
                <h2>Overall Progress</h2>
                <p>Keep going! Every completed task counts.</p>
              </div>
              <strong>{percent}%</strong>
            </div>
            <div
              className="progress-track"
              role="progressbar"
              aria-valuenow={percent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Overall progress"
            >
              <div style={{ width: `${percent}%` }} />
            </div>
          </section>

          <section className="deadline-stats" aria-label="Deadline statistics">
            <StatCard
              title="Overdue Tasks"
              count={stats.overdue}
              Icon={AlertTriangle}
              tone="orange"
            />
            <StatCard title="Due Today" count={stats.dueToday} Icon={CalendarClock} tone="blue" />
          </section>

          <Suspense fallback={<p className="feature-muted">Loading charts...</p>}>
            <TaskCharts stats={stats} />
          </Suspense>

          <nav className="feature-tabs" aria-label="Workspace views">
            {VIEWS.map(([id, label]) => (
              <button
                key={id}
                className={`btn ${featureView === id ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setFeatureView(id)}
                aria-pressed={featureView === id}
              >
                {label}
              </button>
            ))}
          </nav>

          {featureView === "board" && (
            <KanbanBoard tasks={tasks} onMove={moveTask} onEdit={openEdit} onDelete={remove} />
          )}
          {featureView === "calendar" && <TaskCalendar tasks={tasks} onEdit={openEdit} />}
          {featureView === "reminders" && <TaskReminders tasks={tasks} />}

          {featureView === "tasks" && (
            <section className="task-section">
              <div className="section-head">
                <div>
                  <h2>Your Tasks</h2>
                  <p>
                    {visible.length} task{visible.length !== 1 ? "s" : ""} found
                  </p>
                </div>
                <div className="filter-row">
                  <select
                    aria-label="Filter by status"
                    value={filter}
                    onChange={(e) => changeFilter(e.target.value)}
                  >
                    <option value="all">All Tasks</option>
                    <option value="pending">Active Tasks</option>
                    <option value="completed">Completed</option>
                  </select>
                  <select
                    aria-label="Filter by category"
                    value={categoryFilter}
                    onChange={(e) => changeCategory(e.target.value)}
                  >
                    <option value="all">All Categories</option>
                    <option value="work">Work</option>
                    <option value="study">Study</option>
                    <option value="personal">Personal</option>
                  </select>
                  <select
                    aria-label="Filter by deadline"
                    value={deadlineFilter}
                    onChange={(e) => changeDeadline(e.target.value)}
                  >
                    <option value="all">All Deadlines</option>
                    <option value="overdue">Overdue</option>
                    <option value="today">Due Today</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="none">No Due Date</option>
                  </select>
                  <select
                    aria-label="Sort tasks"
                    value={sortBy}
                    onChange={(e) => changeSort(e.target.value)}
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="due-soon">Due Date: Soonest</option>
                    <option value="due-latest">Due Date: Latest</option>
                    <option value="priority-high">Priority: High to Low</option>
                    <option value="priority-low">Priority: Low to High</option>
                    <option value="title">Title: A to Z</option>
                  </select>
                </div>
              </div>

              <div className="task-list">
                {pageData.items.length ? (
                  pageData.items.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={openEdit}
                      onDelete={remove}
                      onComplete={complete}
                    />
                  ))
                ) : (
                  <div className="empty-state">
                    <ListTodo size={38} />
                    <h3>{tasks.length === 0 ? "No tasks yet" : "No tasks found"}</h3>
                    <p>
                      {tasks.length === 0
                        ? "Create your first task, or load sample data to explore the app."
                        : "Create a task or change your filters."}
                    </p>
                    <div className="empty-actions">
                      <button className="btn btn-primary" onClick={openAdd}>
                        Add Task
                      </button>
                      {tasks.length === 0 && (
                        <button className="btn btn-secondary" onClick={() => setSettingsOpen(true)}>
                          Load sample data
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {visible.length > 0 && (
                <nav className="pagination" aria-label="Task pagination">
                  <div className="pagination-info">
                    <span>
                      Showing {pageData.start + 1}–
                      {Math.min(pageData.start + pageSize, visible.length)} of {visible.length}{" "}
                      tasks
                    </span>
                    <label htmlFor="task-page-size">Per page:</label>
                    <select
                      id="task-page-size"
                      value={pageSize}
                      onChange={(e) => changePageSize(e.target.value)}
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                    </select>
                  </div>
                  <div className="pagination-buttons">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      disabled={pageData.page === 1}
                      onClick={() => setPage(pageData.page - 1)}
                    >
                      <ChevronLeft size={16} /> Previous
                    </button>
                    <span aria-live="polite">
                      Page {pageData.page} of {pageData.totalPages}
                    </span>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      disabled={pageData.page === pageData.totalPages}
                      onClick={() => setPage(pageData.page + 1)}
                    >
                      Next <ChevronRight size={16} />
                    </button>
                  </div>
                </nav>
              )}
            </section>
          )}
        </main>
      </div>

      {modalOpen && <TaskModal task={editing} onClose={closeModal} onSave={save} />}

      {settingsOpen && (
        <SettingsModal
          name={settings.name}
          tasks={tasks}
          onSaveName={(name) => updateSettings({ name })}
          onReplaceTasks={replaceAll}
          onClose={closeSettings}
        />
      )}
    </div>
  );
}
