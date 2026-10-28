// Pure helper functions for filtering, sorting, paginating and summarising tasks.
// Keeping them outside React components makes them easy to unit test.

const DAY_MS = 24 * 60 * 60 * 1000;
const PRIORITY_RANK = { High: 3, Medium: 2, Low: 1 };

// Today's date in the user's local timezone as YYYY-MM-DD
export function getLocalToday() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Add (or subtract) days from a YYYY-MM-DD string
export function addDays(dateString, days) {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day) + days * DAY_MS);
  return date.toISOString().slice(0, 10);
}

function matchesDeadline(task, deadline, today) {
  if (deadline === "all") return true;
  if (deadline === "none") return !task.dueDate;
  // Completed tasks and tasks without a date are never overdue / upcoming
  if (task.status === "Completed" || !task.dueDate) return false;
  if (deadline === "overdue") return task.dueDate < today;
  if (deadline === "today") return task.dueDate === today;
  if (deadline === "upcoming") return task.dueDate > today;
  return true;
}

// filters: { status: "all" | "pending" | "completed", category, deadline, search }
export function filterTasks(tasks, filters, today = getLocalToday()) {
  const { status = "all", category = "all", deadline = "all", search = "" } = filters;
  const query = search.trim().toLowerCase();

  return tasks.filter((task) => {
    if (status === "pending" && task.status === "Completed") return false;
    if (status === "completed" && task.status !== "Completed") return false;
    if (category !== "all" && task.category !== category) return false;
    if (!matchesDeadline(task, deadline, today)) return false;
    if (query && !`${task.title} ${task.description}`.toLowerCase().includes(query)) return false;
    return true;
  });
}

// Returns a sorted COPY (never mutates React state)
export function sortTasks(tasks, sortBy = "newest") {
  const list = [...tasks];

  // Tasks without a due date always go to the end
  const byDue = (direction) => (a, b) => {
    if (!a.dueDate) return b.dueDate ? 1 : 0;
    if (!b.dueDate) return -1;
    return direction * a.dueDate.localeCompare(b.dueDate);
  };

  switch (sortBy) {
    case "oldest":
      return list.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    case "due-soon":
      return list.sort(byDue(1));
    case "due-latest":
      return list.sort(byDue(-1));
    case "priority-high":
      return list.sort((a, b) => PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority]);
    case "priority-low":
      return list.sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]);
    case "title":
      return list.sort((a, b) =>
        a.title.localeCompare(b.title, undefined, { sensitivity: "base" }),
      );
    case "newest":
    default:
      return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}

export function paginate(items, page, pageSize) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const start = (currentPage - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    total: items.length,
    totalPages,
    page: currentPage,
    start,
  };
}

// Numbers shown in the stat cards and charts
export function computeStats(tasks, today = getLocalToday()) {
  const open = tasks.filter((t) => t.status !== "Completed");

  return {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === "Pending").length,
    inProgress: tasks.filter((t) => t.status === "In Progress").length,
    completed: tasks.filter((t) => t.status === "Completed").length,
    overdue: open.filter((t) => t.dueDate && t.dueDate < today).length,
    dueToday: open.filter((t) => t.dueDate === today).length,
    byCategory: {
      work: tasks.filter((t) => t.category === "work").length,
      study: tasks.filter((t) => t.category === "study").length,
      personal: tasks.filter((t) => t.category === "personal").length,
    },
  };
}

// Open tasks that are overdue or due within the next `days` days
export function getReminders(tasks, today = getLocalToday(), days = 3) {
  const last = addDays(today, days);

  return tasks
    .filter((t) => t.status !== "Completed" && t.dueDate && t.dueDate <= last)
    .map((t) => ({
      id: t.id,
      title: t.title,
      dueDate: t.dueDate,
      type: t.dueDate < today ? "overdue" : t.dueDate === today ? "today" : "upcoming",
    }))
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}
