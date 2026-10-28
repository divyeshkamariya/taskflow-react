import { afterEach, describe, expect, it } from "vitest";
import {
  TASKS_KEY,
  createBackup,
  loadTasks,
  parseBackup,
  sanitizeTask,
  saveTasks,
} from "./storage";

afterEach(() => localStorage.clear());

describe("sanitizeTask", () => {
  it("fills safe defaults and trims text", () => {
    const task = sanitizeTask({ title: "  Hello  " });
    expect(task).toMatchObject({
      title: "Hello",
      status: "Pending",
      priority: "Medium",
      category: "personal",
      dueDate: "",
    });
    expect(task.id).toBeTruthy();
  });

  it("rejects items without a title and ignores bad values", () => {
    expect(sanitizeTask({ title: "   " })).toBeNull();
    expect(sanitizeTask(null)).toBeNull();
    expect(sanitizeTask("text")).toBeNull();

    const task = sanitizeTask({ title: "x", status: "weird", priority: 5, dueDate: "tomorrow" });
    expect(task).toMatchObject({ status: "Pending", priority: "Medium", dueDate: "" });
  });

  it("limits title and description length", () => {
    const task = sanitizeTask({ title: "a".repeat(300), description: "b".repeat(5000) });
    expect(task.title).toHaveLength(100);
    expect(task.description).toHaveLength(1000);
  });
});

describe("localStorage persistence", () => {
  it("saves and loads tasks", () => {
    const tasks = [sanitizeTask({ title: "Saved task", priority: "High" })];
    expect(saveTasks(tasks)).toBe(true);
    expect(loadTasks()).toEqual(tasks);
  });

  it("survives corrupted data", () => {
    localStorage.setItem(TASKS_KEY, "{not json");
    expect(loadTasks()).toEqual([]);
    localStorage.setItem(TASKS_KEY, JSON.stringify({ not: "an array" }));
    expect(loadTasks()).toEqual([]);
  });

  it("removes duplicate ids", () => {
    localStorage.setItem(
      TASKS_KEY,
      JSON.stringify([
        { id: "same", title: "one" },
        { id: "same", title: "two" },
      ]),
    );
    expect(loadTasks()).toHaveLength(1);
  });
});

describe("backup file", () => {
  it("round-trips through export and import", () => {
    const tasks = [sanitizeTask({ title: "A" }), sanitizeTask({ title: "B", status: "Completed" })];
    expect(parseBackup(createBackup(tasks))).toEqual(tasks);
  });

  it("accepts a plain array and rejects invalid files", () => {
    expect(parseBackup(JSON.stringify([{ title: "ok" }]))).toHaveLength(1);
    expect(() => parseBackup("not json")).toThrow(/valid JSON/);
    expect(() => parseBackup(JSON.stringify({ hello: 1 }))).toThrow(/No tasks/);
    expect(() => parseBackup(JSON.stringify([{ name: "x" }]))).toThrow(/format/);
  });
});
