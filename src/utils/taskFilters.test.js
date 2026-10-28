import { describe, expect, it } from "vitest";
import {
  addDays,
  computeStats,
  filterTasks,
  getReminders,
  paginate,
  sortTasks,
} from "./taskFilters";

const TODAY = "2030-06-15";

const make = (id, extra = {}) => ({
  id,
  title: `Task ${id}`,
  description: "",
  status: "Pending",
  priority: "Medium",
  category: "work",
  dueDate: "",
  createdAt: `2030-01-0${id}T00:00:00.000Z`,
  ...extra,
});

const tasks = [
  make("1", { title: "Alpha report", priority: "Low", dueDate: "2030-06-10" }), // overdue
  make("2", {
    title: "Bravo study",
    priority: "High",
    category: "study",
    status: "Completed",
    dueDate: "2030-06-10",
  }),
  make("3", { title: "Charlie gym", category: "personal", dueDate: TODAY }),
  make("4", {
    title: "Delta report v2",
    priority: "High",
    status: "In Progress",
    dueDate: "2030-07-01",
  }),
  make("5", { title: "Echo notes", description: "read the REPORT summary", priority: "Low" }),
];

describe("addDays", () => {
  it("adds and subtracts days across month ends", () => {
    expect(addDays("2030-01-31", 1)).toBe("2030-02-01");
    expect(addDays("2030-03-01", -1)).toBe("2030-02-28");
  });
});

describe("filterTasks", () => {
  it("filters by status", () => {
    expect(filterTasks(tasks, { status: "completed" }, TODAY).map((t) => t.id)).toEqual(["2"]);
    expect(filterTasks(tasks, { status: "pending" }, TODAY)).toHaveLength(4);
  });

  it("filters by category", () => {
    expect(filterTasks(tasks, { category: "study" }, TODAY)).toHaveLength(1);
  });

  it("filters by deadline and never treats completed tasks as overdue", () => {
    expect(filterTasks(tasks, { deadline: "overdue" }, TODAY).map((t) => t.id)).toEqual(["1"]);
    expect(filterTasks(tasks, { deadline: "today" }, TODAY).map((t) => t.id)).toEqual(["3"]);
    expect(filterTasks(tasks, { deadline: "upcoming" }, TODAY).map((t) => t.id)).toEqual(["4"]);
    expect(filterTasks(tasks, { deadline: "none" }, TODAY).map((t) => t.id)).toEqual(["5"]);
  });

  it("searches title and description, ignoring case", () => {
    expect(filterTasks(tasks, { search: "REPORT" }, TODAY).map((t) => t.id)).toEqual([
      "1",
      "4",
      "5",
    ]);
    expect(filterTasks(tasks, { search: "   " }, TODAY)).toHaveLength(5);
  });
});

describe("sortTasks", () => {
  it("does not change the original array", () => {
    const copy = [...tasks];
    sortTasks(tasks, "title");
    expect(tasks).toEqual(copy);
  });

  it("sorts by title, priority and creation date", () => {
    expect(sortTasks(tasks, "title")[0].title).toBe("Alpha report");
    expect(sortTasks(tasks, "priority-high")[0].priority).toBe("High");
    expect(sortTasks(tasks, "priority-low")[0].priority).toBe("Low");
    expect(sortTasks(tasks, "newest")[0].id).toBe("5");
    expect(sortTasks(tasks, "oldest")[0].id).toBe("1");
  });

  it("puts tasks without a due date last", () => {
    const soon = sortTasks(tasks, "due-soon").map((t) => t.id);
    expect(soon[soon.length - 1]).toBe("5");
    const latest = sortTasks(tasks, "due-latest").map((t) => t.id);
    expect(latest[0]).toBe("4");
    expect(latest[latest.length - 1]).toBe("5");
  });
});

describe("paginate", () => {
  const items = Array.from({ length: 12 }, (_, i) => i);

  it("returns the right slice and totals", () => {
    const p2 = paginate(items, 2, 5);
    expect(p2.items).toEqual([5, 6, 7, 8, 9]);
    expect(p2).toMatchObject({ total: 12, totalPages: 3, page: 2, start: 5 });
  });

  it("clamps out-of-range pages and handles empty lists", () => {
    expect(paginate(items, 99, 5).page).toBe(3);
    expect(paginate(items, -4, 5).page).toBe(1);
    expect(paginate([], 1, 5)).toMatchObject({ items: [], totalPages: 1, page: 1 });
  });
});

describe("computeStats", () => {
  it("counts statuses, deadlines and categories", () => {
    expect(computeStats(tasks, TODAY)).toEqual({
      total: 5,
      todo: 3,
      inProgress: 1,
      completed: 1,
      overdue: 1,
      dueToday: 1,
      byCategory: { work: 3, study: 1, personal: 1 },
    });
  });
});

describe("getReminders", () => {
  it("lists overdue and soon-due open tasks, oldest first", () => {
    const list = getReminders(tasks, TODAY, 3);
    expect(list.map((r) => [r.id, r.type])).toEqual([
      ["1", "overdue"],
      ["3", "today"],
    ]);
  });

  it("includes tasks due inside the window", () => {
    const soon = [make("9", { dueDate: "2030-06-18" }), make("10", { dueDate: "2030-06-19" })];
    expect(getReminders(soon, TODAY, 3).map((r) => r.id)).toEqual(["9"]);
  });
});
