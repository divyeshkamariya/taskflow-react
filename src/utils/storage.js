// Everything that touches localStorage lives here so it is easy to test and replace.

export const TASKS_KEY = "taskflow-tasks-v1";
export const SETTINGS_KEY = "taskflow-settings-v1";

const STATUSES = ["Pending", "In Progress", "Completed"];
const PRIORITIES = ["High", "Medium", "Low"];
const CATEGORIES = ["work", "study", "personal"];
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

export function createId() {
  return (
    globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  );
}

// Turns unknown data (from localStorage or an imported file) into a safe task.
// Returns null when the item is not usable.
export function sanitizeTask(raw) {
  if (!raw || typeof raw !== "object") return null;

  const title = typeof raw.title === "string" ? raw.title.trim().slice(0, 100) : "";
  if (!title) return null;

  return {
    id: typeof raw.id === "string" && raw.id ? raw.id : createId(),
    title,
    description: typeof raw.description === "string" ? raw.description.trim().slice(0, 1000) : "",
    status: STATUSES.includes(raw.status) ? raw.status : "Pending",
    priority: PRIORITIES.includes(raw.priority) ? raw.priority : "Medium",
    category: CATEGORIES.includes(raw.category) ? raw.category : "personal",
    dueDate: typeof raw.dueDate === "string" && DATE_ONLY.test(raw.dueDate) ? raw.dueDate : "",
    createdAt:
      typeof raw.createdAt === "string" && !Number.isNaN(Date.parse(raw.createdAt))
        ? raw.createdAt
        : new Date().toISOString(),
  };
}

export function sanitizeTasks(list) {
  if (!Array.isArray(list)) return [];
  const seen = new Set();

  return list.map(sanitizeTask).filter((task) => task && !seen.has(task.id) && seen.add(task.id));
}

export function loadTasks() {
  try {
    return sanitizeTasks(JSON.parse(localStorage.getItem(TASKS_KEY) || "[]"));
  } catch {
    return []; // corrupted JSON or storage blocked
  }
}

// Returns true when the data was saved
export function saveTasks(tasks) {
  try {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    return true;
  } catch {
    return false; // storage full or blocked (private mode)
  }
}

export function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
    return { name: typeof saved.name === "string" ? saved.name.slice(0, 40) : "" };
  } catch {
    return { name: "" };
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // ignore, settings are optional
  }
}

// ---- Backup file (export / import) ----

export function createBackup(tasks) {
  return JSON.stringify(
    { app: "taskflow", version: 1, exportedAt: new Date().toISOString(), tasks },
    null,
    2,
  );
}

export function parseBackup(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("This file is not valid JSON.");
  }

  const list = Array.isArray(data) ? data : data?.tasks;
  if (!Array.isArray(list)) {
    throw new Error("No tasks found in this file.");
  }

  const tasks = sanitizeTasks(list);
  if (tasks.length === 0 && list.length > 0) {
    throw new Error("The tasks in this file are not in the TaskFlow format.");
  }

  return tasks;
}
